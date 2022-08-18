import React, { useState, useContext, useEffect, useRef } from 'react';
import Modal from '../Shared/Modal';
import Spinner from "rct-tpt-spnr";
import { useAuthState, useAuthDispatch } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import { Formik, Field } from "formik"
import * as Yup from 'yup';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import ApiService from '../../services/api.service';
import useToast from '../../commons/ToastHook';
import { MAP_API_KEY } from '../../commons/utils';
import _ from 'lodash';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';
import classNames from 'classnames';
import { services } from '@tomtom-international/web-sdk-services';
import { ICN_GEO_LOCATION } from '../icons';
let getAddress1 = require('extract-country-state-city-from-zip');

const HomeAddressSettings = ({ show, setShow, hideCloseIcon = true }) => {
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const { setValueBy } = useContext(AppContext)
    const { location } = useContext(AppContext);
    const dispatch = useAuthDispatch();
    const Toast = useToast();
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [err, setErr] = useState(false);
    const [profileInfo, setProfileInfo] = useState({});
    const [states, setStates] = useState([]);
    const setHomeAddressRefs = useRef(null);
    const [isHomeAddress, setIsHomeAddress] = useState("");
    const [isSetHomeAddress, setIsSetHomeAddress] = useState({
        lat: "",
        lng: "",
        info: {},
    });
    const [locationErr, setLocationErr] = useState(null);
    const [userAddress, setUserAddress] = useState({
        apartmentNumber: '',
        streetAddress1: '',
        streetAddress2: '',
        zipcode: '',
        city: '',
        state: '',
    });

    const schema = Yup.object().shape({
        apartmentNumber: Yup.string()
            .required("Required!"),
        city: Yup.string()
            .required("Required!"),
        state: Yup.string()
            .required("Required!"),
        zipcode: Yup.string()
            .required("Required")
            .matches(/^[0-9]+$/, "Must be only digits")
            .min(5, 'Must be exactly 5 digits')
            // .max(5, 'Must be exactly 5 digits')
    })

    const populateStates = () => {
        ApiService.getListByArg('state').then(
            response => {
                setStates(response.data);
            },
            err => {
                Toast.error({ message: err.response && err.profile ? err.profile.error : '', time: 2000 });
            }
        ).finally(() => {
            setIsDataLoaded(true);
        });
    }

    const geoFindMe = (setFieldValue) => {
        if (!navigator.geolocation) {
            Toast.error({ message: 'Geolocation is not supported by your browser', time: 3000 });
            return;
        }
        spinner.show("Fetching your location... Please wait...");
        function success(position) {
            setTimeout(() => {
                getMyLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setFieldValue("latitude", position.coords.latitude);
                setFieldValue("longitude", position.coords.longitude);
                setLocationErr(null);
            }, 1200);
        }
        function error(err) {
            spinner.hide();
            setLocationErr(err);
        }
        navigator.geolocation.getCurrentPosition(success, error, { timeout: 3000 });
    }

    
    // initialize the google place autocomplete
    const initPlaceAPI = () => {
        if (window.google && window.google.maps) {
            let autocomplete = new window.google.maps.places.Autocomplete(setHomeAddressRefs.current, GLOBAL_CONSTANTS.DATA.GOOGLE_SEARCH_OPTION);
            new window.google.maps.event.addListener(autocomplete, "place_changed", function () {
                let place = autocomplete.getPlace();
                setIsSetHomeAddress({
                    info: place,
                    lat: place?.geometry?.location?.lat() ? Number(place?.geometry?.location?.lat()) : "",
                    lng: place?.geometry?.location?.lng() ? Number(place?.geometry?.location?.lng()) : ""
                });
                getMyLocation({ lat: place?.geometry?.location?.lat() ? Number(place?.geometry?.location?.lat()) : "", lng: place?.geometry?.location?.lng() ? Number(place?.geometry?.location?.lng()) : "" })

            });
        }
    };

    const getMyLocation = ({ lat = '', lng = '' }) => {
        function callbackFn(resp) {
            // if(resp.addresses[0].country === "United States"){
                spinner.hide();
                setIsSetHomeAddress({ "lat": Number(lat), "lng": Number(lng), "info": resp.addresses[0] });
                setHomeAddressRefs.current.value = resp.addresses[0].address.freeformAddress
                    ? resp.addresses[0].address.freeformAddress
                    : resp.addresses[0].address.streetName + ", " + resp.addresses[0].address.municipality + ", " + resp.addresses[0].address.postalCode
                setUserAddress({
                    "apartmentNumber": resp.addresses[0].address.freeformAddress,
                    "streetAddress1": resp.addresses[0].address.streetNameAndNumber,
                    "streetAddress2": resp.addresses[0].address.municipalitySubdivision,
                    "zipcode": resp.addresses[0].address.postalCode,
                    "city": resp.addresses[0].address.countrySecondarySubdivision,
                    "state": resp.addresses[0].address.countrySubdivision,
                });
            // }else{
            //     Toast.warning({message: "Sorry! Services available for only US.", time: 4000});
            // }
            
        }
        services.reverseGeocode({
            key: MAP_API_KEY,
            position: { "lat": Number(lat), "lng": Number(lng) }
        }).then(callbackFn);
    }

    const setUserAddressInfo = (values) => {
        const stateInfo = _.filter(states, { name: values.state });
        const payload = {
            "appUserHasAddressTO": {
                "addressType": "DEFAULT",
                "apartmentNumber": values.streetAddress1 || '',
                "sid": profileInfo.appUserHasAddressTO && profileInfo.appUserHasAddressTO.sid ? profileInfo.appUserHasAddressTO.sid : null,
                "state": stateInfo.length ? stateInfo[0] : { "sid": null, "name": values.state },
                "city": values.city || '',
                "streetAddress": values.streetAddress2 || '',
                "zipcode": values.zipcode,
                "latitude": isSetHomeAddress.lat,
                "longitude": isSetHomeAddress.lng
            },
            "addressProvided": true,
            "email": profileInfo.email,
            "firstName": profileInfo.firstName,
            "idDocumentLocation": null,
            "lastName": profileInfo.lastName || '',
            "phoneNumber": profileInfo.phoneNumber,
            "dateOfBirth": profileInfo?.dateOfBirth ? new Date(profileInfo.dateOfBirth).getTime() : null,
            "profileImageLocation": null,
            "resetPassword": true,
            "sid": profileInfo.sid,
            "appUserType": profileInfo.appUserType
        };
        spinner.show("Please wait...");
        ApiService.saveMyProfile(payload).then(
            response => {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { ...response.data } });
                updateGeoLocationByZipcode(response?.data?.appUserHasAddressTO ? response.data.appUserHasAddressTO && response.data.appUserHasAddressTO.zipcode : null);
                setShow(false);
                Toast.success({ message: 'Address information updated successfully', time: 5000 });
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 5000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }

    useEffect(() => {
        initPlaceAPI(); // init google autocomplete search map
    }, [isHomeAddress])

    useEffect(() => {
        if (userDetails?.user?.sid) {
            spinner.show("Please wait...");
            ApiService.getMyProfile(userDetails.user.sid).then(
                response => {
                    setProfileInfo(response.data);
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
            });
            populateStates();
        }

    }, []);

    const updateGeoLocationByZipcode = (value) => {

        if (value.zipcode) {
            ApiService.getLocationByPin({
                key: MAP_API_KEY,
                zipCode: value.zipcode
            }).then(res => {
                if (res.data.results.length > 0) {
                    setValueBy('SET_LOCATION', res.data.results[0]);
                    setUserAddressInfo(value)
                    setErr(false)
                } else {
                    setErr(true)
                }

            });
        }
    }

    return (<>
        <Modal {...{ show, setShow, hideCloseIcon }}>
            <div className="container p-3">
                <div className="row border-bottom pb-2">
                    <div class="col">
                        <h4>Set Address</h4>
                    </div>
                </div>
                <div className="row justify-content-center mt-3">
                    <div class="col">
                        <Formik
                            enableReinitialize={true}
                            validationSchema={schema}
                            initialValues={userAddress}
                            onSubmit={(value) => updateGeoLocationByZipcode(value)}>
                            {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty, handleBlur }) => (
                                <Form>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <h6 className="mb-4">The below address will be used for all your new listings. Later you can also update this address in 'My Profile' page under 'My Account' menu.</h6>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <Form.Group>
                                                <Form.Label className="px-0"><h5 className="label-head">Location<sup className="">*</sup></h5></Form.Label>
                                                <input
                                                    type="text"
                                                    name="apartmentNumber"
                                                    ref={setHomeAddressRefs}
                                                    id="setHomeAddressID"
                                                    onChange={(e) => {
                                                        setIsHomeAddress(e.target.value)
                                                    }}
                                                    className={classNames("form-control", { "in-valid": errors.apartmentNumber })}
                                                    placeholder={"Search your address..."}
                                                    onBlur={handleChange}
                                                    isInvalid={!!errors.apartmentNumber}
                                                />
                                                {
                                                    <Form.Control.Feedback type="invalid text-danger f12 ">
                                                        {errors.apartmentNumber}
                                                    </Form.Control.Feedback>}

                                                <div className="use-current-location mt5 aic" onClick={() => geoFindMe(setFieldValue)}>
                                                    <ICN_GEO_LOCATION />
                                                    <span className="ml5">Use current location</span>
                                                    {/* PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3 */}
                                                    {locationErr && locationErr?.code && <span className="text-danger f10 ml10">{`(${locationErr?.code === 1 ? "You have not allowed your browser's location access. Please provide the permission to access your location." : "Position unavailable"})`}</span>}
                                                </div>
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Address Line 1</h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="streetAddress1"
                                                    placeholder="Address Line 1"
                                                    disabled
                                                    value={values.streetAddress1}
                                                    onChange={handleChange}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.streetAddress1}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Address Line 2</h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="streetAddress2"
                                                    placeholder="Address Line 2"
                                                    disabled
                                                    value={values.streetAddress2}
                                                    onChange={handleChange}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.streetAddress2}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <div className="row justify-content-start">
                                        <div className="col-lg-6">
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Zipcode<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="zipcode"
                                                    placeholder="Zipcode"
                                                    value={values.zipcode}
                                                    disabled
                                                    //onBlur={(e) => getCountry("zipcode", e.target.value, setFieldValue)}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.zipcode}
                                                />
                                                {
                                                    err && <div className="invalid-feedback">Please enter valid zip code.</div> ||
                                                    <div className="invalid-feedback">
                                                        {errors.zipcode}
                                                    </div>
                                                }

                                            </Form.Group>
                                        </div>
                                        <div className="col-lg-6">
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">City<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="city"
                                                    disabled
                                                    placeholder="City"
                                                    value={values.city}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.city}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.city}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">State<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="state"
                                                    placeholder="state"
                                                    disabled
                                                    value={values.state}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.state}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.state}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-lg-12 text-right">
                                            <ul className="profile-btnList">
                                                <li><button type="submit" className="submt-btn submt-btn-dark" disabled={!isValid} onClick={handleSubmit}>Save</button></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <section class="mobile-btn-section desktop-off">
                                        <div class="container">
                                            <div class="row">
                                                <div class="col-lg-12">
                                                    <div class="proPg-btnArea">
                                                        <ul>
                                                            <li><button type="submit" className="submt-btn submt-btn-dark probtn-pading" disabled={!isValid} onClick={handleSubmit}>Save</button></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </Form>)}
                        </Formik>
                    </div>
                </div>
            </div>
        </Modal>

    </>);
}
export default HomeAddressSettings