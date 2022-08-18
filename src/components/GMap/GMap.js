import React, { useEffect, Fragment, useState } from 'react'
import { GoogleMap, StandaloneSearchBox, Marker } from '@react-google-maps/api';
import { services } from '@tomtom-international/web-sdk-services';
import { MAP_API_KEY } from '../../commons/utils';
import ApiService from "../../services/api.service";
import _ from 'lodash';

const GMap = ({
    setMyLocation = () => { },
    pickupLocationBy = null,
    sheriffOffice = {},
    setSheriffOffice = () => { },
    listOfSheriffLocation = [],
    setListOfSheriffLocation = () => { },
    setListOfFFLStore = () => { },
    currLatLng = {
        lat: '',
        lng: ''
    },
    setZipCode = () => { },
    product = {},
    showMapSearch = true,
    showAllSherriffLocationMarker = false
}) => {
    const inputStyle = {
        boxSizing: `border-box`,
        border: `1px solid transparent`,
        width: `240px`,
        padding: `0 12px`,
        borderRadius: `3px`,
        boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
        fontSize: `14px`,
        outline: `none`,
        textOverflow: `ellipses`,
        position: 'relative',
        top: '10px',
        // right: '65%',
    }
    const [showCenter, setShowCenter] = useState(true);
    const [isClickedMap, setIsClickedMap] = useState(false);

    /**
     * This method used to get geo location in details by latitude and longitude.
     * @param {Object} coords
     * @returns 
     */
    const fetchGeoInfoByLatLng = async (coords = { lat: "", lng: "" }) => await services.reverseGeocode({
        key: MAP_API_KEY,
        position: coords
    })

    /**
     * This method used to set sheriff locations by longitude and latitude.
     * @param {Object} coords -  longitude and latitude
     */
    const fetchSheriffOfficesByLatLng = (coords = {}) => {
        try {
            const payload = {
                lat: coords.lat,
                lon: coords.lng || coords.lon,
                radius: '15000',
                key: MAP_API_KEY
            }

            ApiService.getSheriffLocation(payload).then(
                response => {
                    setListOfSheriffLocation(response?.data?.results || []);
                    setSheriffOffice({ address: {} });
                }, err => {
                    console.error("Exception occurred when fetchSheriffOfficesByLatLng -- ", err);
                })
        } catch (err) {
            console.error("Exception occurred when updateMyLocationByLatLng -- ", err);
        }
    }

    /**
     * This method used to update myLocation by coordinates location
     * @param {Object} coords 
     */
    const updateMyLocationByLatLng = async (coords = { lat: "", lng: "" }) => {
        try {
            if (!_.isEmpty(coords)) {
                let geolocation = await fetchGeoInfoByLatLng(coords);
                setMyLocation({
                    address: { ...geolocation.addresses[0].address, freeformAddress: geolocation.addresses[0].address.freeformAddress },
                    location: coords
                })

                // Updating zip code
                setZipCode(isClickedMap ? geolocation.addresses[0].address.postalCode : product.fflPremiseZipCode);
                if (_.isEqual(pickupLocationBy, 'SHERIFF_OFFICE'))
                    fetchSheriffOfficesByLatLng(coords);
                else if (_.isEqual(pickupLocationBy, 'FFL'))
                    setListOfFFLStore([]);
            }
        } catch (err) {
            console.error("Exception occurred when updateMyLocationByLatLng -- ", err);
        }
    }

    /**
     * Fired when user search and select a place
     */
    function handlePlacesChanged() {
        try {
            let places = this.getPlaces();
            if (_.isArray(places)
                && !_.isEmpty(places)) {
                setShowCenter(true);
                updateMyLocationByLatLng({
                    lat: places[0].geometry.location.lat(),
                    lng: places[0].geometry.location.lng()
                });
            }
        } catch (err) {
            console.error("Exception occurred when handlePlacesChanged -- ", err);
        }
    }

    /**
     * Fired when user click on map
     * @param {Event} event
     */
    const handleMapClick = async (event) => {
        try {
            if (!_.isEmpty(event)) {
                setShowCenter(false);
                setIsClickedMap(true);
                updateMyLocationByLatLng({
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                });
            }
        } catch (err) {
            console.error("Exception occurred when handleMapClick -- ", err);
        }
    }

    /**
     * Fired when user click on the marker of sheriff office on the map
     * @param {Object} sheriffOffice 
     */
    const handleSheriffLocationClick = (sheriffOffice = null) => {
        try {
            if (!_.isEmpty(sheriffOffice))
                setSheriffOffice(sheriffOffice);
        } catch (err) {
            console.error("Exception occurred when handleSheriffLocationClick -- ", err);
        }
    }

    /**
     * Act as initializer
     */
    useEffect(() => {
        try {
            if (!_.isEmpty(currLatLng)) {
                updateMyLocationByLatLng(currLatLng);
                setShowCenter(true);
            }
        } catch (err) {
            console.error("Exception occurred when useEffect[] -- ", err);
        }
    }, [])

    return <Fragment>
        {
            !_.isEmpty(currLatLng)
            && currLatLng?.lat
            && currLatLng?.lng
            && <GoogleMap
                    mapContainerStyle={{ height: '400px' }}
                    center={showCenter && currLatLng}
                    zoom={(!_.isEmpty(listOfSheriffLocation) && 15)
                        || 10}
                    onClick={handleMapClick}
                    options={{ mapTypeControl: false }}
                >
                    {
                        showMapSearch 
                        && <StandaloneSearchBox
                            onPlacesChanged={handlePlacesChanged}>
                            <input
                                type='text'
                                placeholder='Search'
                                style={inputStyle} />
                        </StandaloneSearchBox>
                    }
                    <Marker position={currLatLng} />
                    {
                        showAllSherriffLocationMarker
                        && _.isArray(listOfSheriffLocation)
                        && !_.isEmpty(listOfSheriffLocation)
                        && listOfSheriffLocation.map((item, idx) => <Marker
                            position={{ ...item?.position, lng: item?.position?.lon }}
                            key={idx}
                            onClick={() => handleSheriffLocationClick(item)}
                            title={item?.address?.freeformAddress}
                            icon={(_.isEqual(sheriffOffice?.id, item?.id) && 'http://maps.google.com/mapfiles/ms/icons/green-dot.png') || null} />)
                    }
                </GoogleMap>
        }
    </Fragment>
}
export default GMap;