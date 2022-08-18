import React, { useEffect, useState, useContext } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import { services } from '@tomtom-international/web-sdk-services';
import SearchBox from '@tomtom-international/web-sdk-plugin-searchbox';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import '@tomtom-international/web-sdk-plugin-searchbox/dist/SearchBox.css';
import $ from 'jquery';
import { MAP_API_KEY, DEFAULT_LATLNG } from '../../commons/utils';
import ApiService from "../../services/api.service";
import { AppContext } from '../../contexts/AppContext';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

let map;
let marker;
const Map = ({
    zipCode,
    setZipCode,
    setMyLocation,
    pickupLocationBy,
    sheriffOffice,
    setSheriffOffice,
    listOfSheriffLocation,
    setListOfSheriffLocation,
    setListOfFFLStore,
    currLatLng = {
        lat: '',
        lng: ''
    },
    formCreateListing = false
}) => {
    const { setValueBy, location } = useContext(AppContext);
    const [show, setShow] = useState(false);
    const [currentLatLng, setCurrentLatLng] = useState(currLatLng);
    const [addressInfo, setAddressInfo] = useState({});

    const removeMarkers = () => {
        if (marker) {
            marker.remove();
        }
        $('.mapboxgl-marker.mapboxgl-marker-anchor-bottom').remove();
    }
    const reDrawMarkers = () => {
        let markerOptions = {
            color: '#FF0000'
        };
        if (listOfSheriffLocation.length) {
            setMarker(listOfSheriffLocation[0], true);
        }
        listOfSheriffLocation.forEach(loc => {
            markerOptions.color = sheriffOffice.id === loc.id ? '#0000FF' : '#FF0000'
            setMarker(loc, false, markerOptions);
        });
    }
    useEffect(() => {
        if (!_.isEmpty(sheriffOffice) && sheriffOffice.id) {
            reDrawMarkers();
        }
    }, [sheriffOffice]);

    const setMarker = (loca, isMarkerRemove, markerOption = {}) => {
        if (marker && isMarkerRemove) {
            removeMarkers();
        }
        const markerHeight = 50, markerRadius = 10, linearOffset = 25;
        const popupOffsets = {
            'top': [0, 0],
            'top-left': [0, 0],
            'top-right': [0, 0],
            'bottom': [0, -markerHeight],
            'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
            'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
            'left': [markerRadius, (markerHeight - markerRadius) * -1],
            'right': [-markerRadius, (markerHeight - markerRadius) * -1],
            'data': loca
        };
        var popup = new tt.Popup({ offset: popupOffsets, className: 'my-class' })
            .setHTML("<div><p>" + (!_.isEmpty(loca.poi) ? loca.poi.name : loca.address.freeformAddress) + "</p> <span type='submit' class='btn btn-primary sheriff-office-btn' data=" + JSON.stringify(loca) + ">Select</span></div>")
            .addTo(map);

        popup.on('open', function (data) {
            const sheriffOffice = data.target.options.offset.data;
            $('.sheriff-office-btn').off();
            $('.sheriff-office-btn').on('click', function (e) {
                e.preventDefault();
                setSheriffOffice(sheriffOffice);
                $('.mapboxgl-popup-close-button').trigger('click');
            });
        })
        marker = new tt.Marker(markerOption)
            .setLngLat([(loca.position.lng || loca.position.lon), loca.position.lat])
            .setDraggable(true)
            .setPopup(popup)
            .addTo(map);
        marker.isDraggable(true);
        marker.on('dragend', function (data) {
            setCurrentLatLng(data.target._lngLat);
            getMyLocation(data.target._lngLat);
            if (pickupLocationBy === 'FFL') {
                setListOfFFLStore([]);
                setTimeout(() => {
                    setZipCodeByLocation(data.target._lngLat)
                })
            }
        });
    }

    const focusTo = (location) => {
        map.flyTo({
            center: {
                lng: location.lng || location.lon,
                lat: location.lat,
            },
            zoom: 12, // you can also specify zoom level
        });
    }

    const initSearchBox = () => {
        const searchOptions = {
            idleTimePress: 100,
            minNumberOfCharacters: 3,
            searchOptions: {
                key: MAP_API_KEY,
                language: 'en-GB'
            },
            autocompleteOptions: {
                key: MAP_API_KEY,
                language: 'en-GB'
            },
            noResultsMessage: 'No results found.'
        };
        const ttSearchBox = new SearchBox(services, searchOptions);
        // Register Search Box
        map.addControl(ttSearchBox, 'top-left');
        ttSearchBox.on('tomtom.searchbox.resultselected', function (data) {
            setAddressInfo(data.data.result);
            setMyLocation(data.data.result);
            if (pickupLocationBy === 'SHERIFF_OFFICE') {
                setSheriffLocations(data.data.result.position);
            } else if (pickupLocationBy === 'FFL') {
                setListOfFFLStore([]);
            }
            !formCreateListing && setZipCodeByLocation(data.data.result.position)
            formCreateListing && setShow(true)
            initMarkerNFocus(data.data.result);
        });
    }

    const initMapController = () => {
        map.addControl(new tt.FullscreenControl());
        map.addControl(new tt.NavigationControl());
        map.addControl(new tt.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));
    }


    const setZipCodeByLocation = (latlng) => {
        function callbackFn(resp) {
            setZipCode(resp?.addresses[0]?.address.postalCode);
        }
        services.reverseGeocode({
            key: MAP_API_KEY,
            position: latlng
        }).then(callbackFn);
    }

    const getMyLocation = (latlng) => {
        function callbackFn(resp) {
            setAddressInfo(resp.addresses[0]);
            setMyLocation(resp.addresses[0]);
            initMarkerNFocus(resp.addresses[0]);
            if (pickupLocationBy === 'SHERIFF_OFFICE') {
                setZipCode(resp.addresses[0].address.postalCode);
            }
            // setShow(true)
        }
        services.reverseGeocode({
            key: MAP_API_KEY,
            position: latlng
        }).then(callbackFn);
        if (pickupLocationBy === 'SHERIFF_OFFICE') {
            setSheriffLocations(latlng);
        }
    }

    const updateGeoLocationByZipcode = () => {
        function handleResults(resp) {
            // console.log(resp);
        }
        services.structuredGeocode({
            key: MAP_API_KEY,
            countryCode: 'US',
            postalCode: '90231',
        }).then(handleResults);
    }

    const initMarkerNFocus = (location) => {
        setMarker(location, true);
        if (pickupLocationBy === 'SHERIFF_OFFICE') {
            setSheriffLocations(location)
        }
        setTimeout(() => {
            focusTo(location.position);
        });
    }

    const setSheriffLocationsByZipcode = () => {
        if (_.isEmpty(zipCode) || zipCode.length < 5) {
            return;
        }
        const payload = {
            zipCode,
            radius: '15000',
            key: MAP_API_KEY
        };
        const markerOptions = {
            color: '#FF0000'
        };
        ApiService.getTomTomResultByZipcode(payload).then(
            response => {
                removeMarkers();
                setListOfSheriffLocation(response.data.results);
                setSheriffOffice({
                    address: {}
                });
                if (response.data && response.data.results && response.data.results.length) {
                    setMarker(response.data.results[0], true);
                    setTimeout(() => {
                        focusTo(response.data.results[0].position);
                    });
                }
                response.data.results.forEach(loc => {
                    setMarker(loc, false, markerOptions);
                });
            },
            err => {
                console.log(err);
            }
        );
    }

    // useEffect(() => {
    //     if (formSheriffOffice) {
    //         setSheriffLocationsByZipcode();
    //     }
    // }, [zipCode]);

    const setSheriffLocations = (latlng) => {
        const payload = {
            lat: latlng.lat,
            lon: latlng.lng || latlng.lon,
            radius: '15000',
            key: MAP_API_KEY
        };
        const markerOptions = {
            color: '#FF0000'
        };
        setZipCode('');
        ApiService.getSheriffLocation(payload).then(
            response => {
                removeMarkers();
                setListOfSheriffLocation(response.data.results);
                setSheriffOffice({
                    address: {}
                });
                if (response.data && response.data.results && response.data.results.length) {
                    setMarker(response.data.results[0], true);
                    setTimeout(() => {
                        focusTo(response.data.results[0].position);
                    });
                }
                response.data.results.forEach(loc => {
                    setMarker(loc, false, markerOptions);
                });
            },
            err => {
                console.log(err);
            }
        );
    }

    const initMapActions = () => {
        initMapController();
        initSearchBox();
    };

    const selectSheriffLocation = () => { }

    const initMapView = () => {
        map = tt.map({
            key: MAP_API_KEY,
            container: 'mapContainer'
        });
        initMapActions();
        updateGeoLocationByZipcode();
    }

    const geoFindMe = () => {
        if (!navigator.geolocation) {
            //  console.log("Geolocation is not supported by your browser");
            initMapView();
            return;
        }
        function success(position) {
            getMyLocation({
                lat: location.position.lat,
                lng: location.position.lng || location.position.lon
            });
            initMapView();
        }
        function error() {
            getMyLocation(location.position);
            initMapView();
            // console.log("Unable to retrieve your location");
        }
        if (!currentLatLng.lat && !currentLatLng.lng) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            getMyLocation(currentLatLng);
            initMapView();
        }
    }
    useEffect(() => {
        geoFindMe();
    }, []);
    return (
        <>
            <div id="mapContainer"></div>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to change your Location ?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => { setShow(false); setValueBy('SET_LOCATION', addressInfo) }}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Map;