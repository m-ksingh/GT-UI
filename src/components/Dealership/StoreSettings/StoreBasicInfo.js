import React, { useContext, useState, useEffect, useRef } from 'react'
import { Formik, Field, ErrorMessage } from "formik"
import Input, {isValidPhoneNumber} from 'react-phone-number-input/input'
import Spinner from "rct-tpt-spnr";
import * as Yup from 'yup';
import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import { Form } from 'react-bootstrap';
import ApiService from "../../../services/api.service";
import { useAuthState } from '../../../contexts/AuthContext/context';
import { goToTopOfWindow, MAP_API_KEY } from '../../../commons/utils';
import useToast from '../../../commons/ToastHook';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import { services } from '@tomtom-international/web-sdk-services';
import classNames from 'classnames';
import { ICN_GEO_LOCATION } from '../../icons';
import DatePicker from "react-datepicker";
import 'react-phone-number-input/style.css'
let getAddress1 = require('extract-country-state-city-from-zip');

const tabWiseData = {
    storeInfo: {},
    businessInfo: {
        fflStoreHasSpecialities: []
    }
};

const defaultBasicInfoValues = GLOBAL_CONSTANTS.DATA.STORE.BASIC_INFO;
let selectedListingImages = [];

const StoreBasicInfo = ({ setStoreViewBy, storeId }) => {
    const placeInputRef = useRef(null);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [initialValues, setInitialValues] = useState(defaultBasicInfoValues);
    const [selectedLocation, setSelectedLocation] = useState({
        lat: "",
        lng: "",
        info: {},
    });
    const [locationErr, setLocationErr] = useState(null);
    const [locationSearchText, setLocationSearchText] = useState("");
    const [err, setErr] = useState(false);
    const [promiseZipCode, setPromiseZipCode] = useState();

    const schema = Yup.object().shape({
        licRegn: Yup.number().min(1).required("Required!"),
        licDist: Yup.number().min(1).required("Required!"),
        licSeqn: Yup.number().min(5).required("Required!"),
        name: Yup.string()
            .max(100, "100 Characters Maximum")
            .required("Required!"),
        description: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "1032 Characters Maximum")
            .required("Required!"),
        firstName: Yup.string()
            .required("Required!"),
        lastName: Yup.string()
            .required("Required!"),
        email: Yup.string()
            .email("Invalid email format")
            .required("Required!"),
        contactEmailAddress: Yup.string().nullable()
            .email("Invalid email format")
            .required("Required!")
            .nullable(),
        contactPhoneNumber: Yup.number().nullable()
            .required("Required!")
            .nullable(),
        premiseStreet: Yup.string()
            .required("Required!"),
        premiseCity: Yup.string()
            .required("Required!"),
        premiseState: Yup.string()
            .required("Required!"),
        premiseZipCode: Yup.string()
            .required("Required!"),
    });

    const [files, setFiles] = useState((!_.isEmpty(selectedListingImages) && selectedListingImages) || []);
    const [licenceDoc, setLicenceDoc] = useState('');

    const initVerifyUpload = () => {
        $('.upload-input:visible').trigger('click');
    }

    // const getMyLocation = ({ lat = "", lng = "" }) => {
    //     function callbackFn(resp) {
    //         spinner.hide();
    //         setSelectedLocation({ "lat": lat, "lng": lng, "info": resp.addresses[0] });
    //         placeInputRef.current.value = resp.addresses[0].address.freeformAddress
    //             ? resp.addresses[0].address.freeformAddress
    //             : resp.addresses[0].address.streetName + ", " + resp.addresses[0].address.municipality + ", " + resp.addresses[0].address.postalCode
    //     }
    //     services.reverseGeocode({
    //         key: MAP_API_KEY,
    //         position: { "lat": lat, "lng": lng }
    //     }).then(callbackFn);
    // }

    // const geoFindMe = (setFieldValue) => {
    //     if (!navigator.geolocation) {
    //         Toast.error({ message: 'Geolocation is not supported by your browser', time: 3000 });
    //         return;
    //     }
    //     spinner.show("Fetching your location... Please wait...");
    //     function success(position) {
    //         setTimeout(() => {
    //             getMyLocation({
    //                 lat: position.coords.latitude,
    //                 lng: position.coords.longitude
    //             });
    //             setFieldValue("latitude", position.coords.latitude);
    //             setFieldValue("longitude", position.coords.longitude);
    //             setLocationErr(null);
    //         }, 1200);
    //     }
    //     function error(err) {
    //         spinner.hide();
    //         setLocationErr(err);
    //     }
    //     navigator.geolocation.getCurrentPosition(success, error, { timeout: 3000 });
    // }

    // useEffect(() => {
    //     setInitialValues({...initialValues, "latitude": selectedLocation.lat, "longitude": selectedLocation.lng })
    // }, [selectedLocation])

    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, (file, index) => {
            return {
                fileName: file,
                mediaType: "doc",
                order: index
            };
        });
        setFiles(uploadedFiles);
        setLicenceDoc(uploadedFiles[0].fileName);
    }

    function uploadFiles(e) {
        // Create an object of formData
        let formData;
        const listOfFiles = [];
        _.each(e.target.files, file => {
            formData = new FormData();
            formData.append('file', file);
            listOfFiles.push(ApiService.uploadMultiPart(formData))
        })
        spinner.show("Please wait...");
        axios.all(listOfFiles).then(
            response => {
                setMultiFilesToDisplay([response[0].data]);
            },
            err => {
                console.error(err);
            }
        ).finally(() => {
            spinner.hide();
            e.target.value = null;
        });
        // Send formData object
    }

    const prepopulateStoreInfo = (storeInfo) => {
        // if(storeInfo.latitude) 
        // getMyLocation({ "lat": Number(storeInfo.latitude), "lng": Number(storeInfo.longitude) });
        const licenceNo = storeInfo.licenseNumber;
        let licenseExpireOn = new Date(storeInfo.licenseExpireOn);
        setInitialValues({
            ...storeInfo, ...{
                licRegn: licenceNo.split('-')[0],
                licDist: licenceNo.split('-')[1],
                licSeqn: licenceNo.split('-')[5],
                phoneNumber: (_.isString(storeInfo.phoneNumber) && !storeInfo.phoneNumber.startsWith("+") && `+1${storeInfo.phoneNumber}`) ?? storeInfo.phoneNumber,
                licenseExpireOn: licenseExpireOn
            }
        });
        setMultiFilesToDisplay([storeInfo.license]);
    }

    const validateBasicStoreForm = (isValid, dirty) => {
        let isFormValid = false;
        try {
            if(
                (!isValid 
                || !files.length )
            ) isFormValid = true;
        } catch (err) {
            console.error("Error in validateBasicStoreForm-- ", err);
        }
        return isFormValid;
    }

    useEffect(() => {
        spinner.show("Please wait...");
        ApiService.getStore(storeId).then(
            response => {
                getCountry(response.data);
                prepopulateStoreInfo(response.data);
                setPromiseZipCode(response.data.premZipCode);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }, []);

    const saveInfo = (values) => {
        spinner.show("Please wait...");
        const payload = _.cloneDeep(values);
        // if(selectedLocation && !_.isEmpty(selectedLocation) && selectedLocation.lat) {
        //     payload.latitude = selectedLocation.lat;
        //     payload.longitude = selectedLocation.lng;
        // }
        payload.createdBy = {
            sid: payload.sid
        };
        payload.updatedBy = {
            sid: userDetails.user.sid
        };
        ApiService.updateStore(userDetails.user.sid, payload).then(
            response => {
                prepopulateStoreInfo(response.data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    const onChangeTrim = (key, value, setFieldValue) => {
        try {
            let trimValue = value.replace(/\s+/g, ' ').trim();
            setFieldValue(key, trimValue);
        } catch (err) {
            console.error("Error occurred while onChangeTrim", err);
        }
    }

    const onChangeLimit = (key, value, setFieldValue, limit) => {
        try {
            let a = value.substring(0, limit); // prevent to paste more than limited characters
            setFieldValue(key, a);
        } catch (err) {
            console.error("Error occurred while onChangeLimit", err);
        }
    }

    /**
     * This method used to get city and state values from based on pincode.
     * @param {String} key - This is city & state name of key
     * @param {string} value - This city & state of value
     * @param {Function} setFieldValue - This is set the value of state and city.
     */
     const getCountry = (data) => {
        try {
            let FFLZipCode = data?.premiseZipCode ? data?.premiseZipCode : promiseZipCode ;
            if (FFLZipCode.length >= 5) {
                ApiService.getLocationByPin({
                    key: MAP_API_KEY,
                    zipCode: FFLZipCode
                }).then(res => {
                    if (res.data.results.length > 0) {
                        getAddress1(FFLZipCode, 'AIzaSyAib2qoOvefizmKImyPPvuoQd7sS3ZVTFU', (err, CityList) => {
                            // setIsLatitude(CityList.location.lat);
                            // setIsLongitude(CityList.location.lng);
                            // setFieldValue("latitude", CityList.location.lat);
                            // setFieldValue("longitude", CityList.location.lng);
                            setSelectedLocation({ "lat": CityList.location.lat, "lng": CityList.location.lng });
                        });
                        // setFieldValue(key, value);

                        setErr(false)
                    } else {
                        setErr(true)
                    }

                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    // useEffect(() => {
    //     getCountry();
    // }, [promiseZipCode]);

    // // initialize the google place autocomplete
    // const initPlaceAPI = () => {
    //     if (window.google && window.google.maps) {
    //         let autocomplete = new window.google.maps.places.Autocomplete(placeInputRef.current, GLOBAL_CONSTANTS.DATA.GOOGLE_SEARCH_OPTION);
    //         new window.google.maps.event.addListener(autocomplete, "place_changed", function () {
    //             let place = autocomplete.getPlace();
    //             setSelectedLocation({
    //                 info: place,
    //                 lat: place.geometry?.location.lat(),
    //                 lng: place.geometry?.location.lng()
    //             });
    //             setLocationErr(null);
    //         });
    //     }
    // };

    // useEffect(() => { initPlaceAPI() }, [locationSearchText]);

    return (
        <>
            <fieldset>
                <div class="row bg-white justify-content-center">
                    <div class="col-lg-12 text-center">
                        <h4>Basic Info</h4>
                        <p class="pro-description">Enter the basic details about your store</p>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-card-store">
                            <Formik
                                enableReinitialize={true}
                                validationSchema={schema}
                                initialValues={initialValues}
                                onSubmit={saveInfo}>
                                {({ handleSubmit, isSubmitting, handleChange, touched, errors, setFieldError, setFieldValue, values, isValid, dirty }) => (
                                    <Form noValidate>
                                        <div class="form-group text-left">
                                            <div className="row">
                                                <div className="col-lg-12 mt-4">
                                                    <h5 className="label-head mb-3">Enter your license number<sup>*</sup></h5>
                                                </div>
                                            </div>
                                            <div className="row pl-3 pr-3 license-input-block">
                                                <div className="flx1 mr10">
                                                    <Form.Group className="m0">
                                                        <Form.Control
                                                            type="text"
                                                            disabled
                                                            name="licRegn"
                                                            placeholder="Regn"
                                                            value={values.licRegn}
                                                            onChange={handleChange}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licRegn}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="flx1 mr10">
                                                    <Form.Group className="m0">
                                                        <Form.Control
                                                            type="text"
                                                            name="licDist"
                                                            disabled
                                                            placeholder="Dist"
                                                            value={values.licDist}
                                                            onChange={handleChange}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licDist}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className=" mr10 text-center">
                                                    <p className="m0"> - xxx - xx - xx- </p>
                                                </div>
                                                <div className="flx1">
                                                    <Form.Group className="m0">
                                                        <Form.Control
                                                            type="text"
                                                            disabled
                                                            name="licSeqn"
                                                            placeholder="Seqn"
                                                            value={values.licSeqn}
                                                            onChange={handleChange}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licSeqn}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            <Form.Group>
                                                <Form.Label><h5 class="label-head">Store Name<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    disabled
                                                    value={values.name}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.name}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label><h5 class="label-head">Description<sup>*</sup></h5></Form.Label>
                                                <Form.Control as="textarea" rows={3}
                                                    name="description"
                                                    value={values.description}
                                                    onChange={(e) => {
                                                        onChangeLimit("description", e.target.value, setFieldValue, 1033);
                                                    }}
                                                    onBlur={(e) => onChangeTrim("description", e.target.value, setFieldValue)}
                                                    className={classNames("", { "border border-danger": errors.description })}
                                                    isInvalid={!!errors.description}
                                                />
                                                <p class="fild-caption">(1032 Characters Maximum, No HTML, Special characters & All Caps)</p>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.description}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label><h5 class="label-head">First Name<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="firstName"
                                                            // disabled
                                                            value={values.firstName}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.firstName}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.firstName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label><h5 class="label-head">Last Name<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="lastName"
                                                            // disabled
                                                            value={values.lastName}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.lastName}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.lastName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            
                                            
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Email Address<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="email"
                                                    placeholder="Email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Phone Number<sup>*</sup></h5></Form.Label>
                                                {/* <Form.Control
                                                    type="text"
                                                    name="phoneNumber"
                                                    disabled
                                                    placeholder="Phone Number"
                                                    value={values.phoneNumber}
                                                    onChange={handleChange}
                                                /> */}

                                                <Field
                                                    name="phoneNumber"
                                                    validate={(value) => (value && isValidPhoneNumber(value) ? '' : `${(value?.length > 0) ? 'Enter valid phone number' : 'Required!'}`)} >
                                                    {({ field: { name, value }, form: { setFieldTouched } }) => (<div onClick={() => setFieldTouched(name, true)}>
                                                        <Input
                                                            //defaultCountry="US"
                                                            disabled
                                                            value={values?.phoneNumber ?? ""}
                                                            //value={(_.isString(values.phoneNumber) && !values.phoneNumber.startsWith("+") && `+1${values.phoneNumber}`) ?? values.phoneNumber}
                                                            className={`form-control ${errors[name] && 'is-invalid'}`}
                                                            onChange={e => { setFieldValue("phoneNumber", e) }}
                                                        />
                                                    </div>)}
                                                </Field>
                                                <ErrorMessage component="span" name="phoneNumber" className="text-danger mb-2 small-text" />

                                                {/* <Form.Control.Feedback type="invalid">
                                                    {errors.phoneNumber}
                                                </Form.Control.Feedback> */}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Contact Email Address<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="contactEmailAddress"
                                                    value={values.contactEmailAddress}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.contactEmailAddress}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.contactEmailAddress}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label className="p-0"><h5 className="label-head mb-0">Contact Phone Number<sup>*</sup></h5></Form.Label>
                                                {/* <Form.Control
                                                    type="text"
                                                    name="contactPhoneNumber"
                                                    placeholder="Contact Phone Number"
                                                    value={values.contactPhoneNumber}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.contactPhoneNumber}
                                                /> */}
                                                <Field
                                                    name="contactPhoneNumber"
                                                    validate={(value) => (value && isValidPhoneNumber(value) ? '' : `${(value?.length > 0) ? 'Enter valid phone number' : 'Required!'}`)} >
                                                    {({ field: { name, value }, form: { setFieldTouched } }) => (<div onClick={() => setFieldTouched(name, true)}>
                                                        <Input
                                                            //defaultCountry="US"
                                                            value={values?.contactPhoneNumber ?? ""}
                                                            className={`form-control ${errors[name] && 'is-invalid'}`}
                                                            onChange={e => { setFieldValue("contactPhoneNumber", e) }}
                                                        />
                                                    </div>)}
                                                </Field>
                                                <ErrorMessage component="span" name="contactPhoneNumber" className="text-danger mb-2 small-text" />
                                                {/* <Form.Control.Feedback type="invalid">
                                                    {errors.contactPhoneNumber}
                                                </Form.Control.Feedback> */}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Fax Number</h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="fax"
                                                    placeholder="Fax Number"
                                                    value={values.fax}
                                                    onChange={handleChange}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.fax}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <div className="row">
                                                <div className="col-lg-12 mt-4">
                                                    <h5>Address</h5>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Street</h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="premiseStreet"
                                                            disabled
                                                            placeholder="Street Address"
                                                            value={values.premiseStreet}
                                                            onChange={handleChange}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.premiseStreet}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            
                                            <div className="row justify-content-start">
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Zipcode</h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="premiseZipCode"
                                                            disabled
                                                            placeholder="Zipcode"
                                                            value={values.premiseZipCode}
                                                            onChange={handleChange}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.premiseZipCode}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                             {/* google auto search box */}
                                             {/* <div className="row">
                                                <div className="col-lg-12">
                                                    <Form.Group>
                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">Location<sup>*</sup></h5></Form.Label>
                                                        <input 
                                                            type="text" 
                                                            name="location" 
                                                            className="form-control" 
                                                            ref={placeInputRef} 
                                                            onChange={(e) => setLocationSearchText(e.target.value)} 
                                                            placeholder={"Search location"} 
                                                        />
                                                        {
                                                            selectedLocation.lat === ""
                                                            && <div className="f10 text-danger">Required!</div>
                                                        }

                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.locationInfo}
                                                        </Form.Control.Feedback>
                                                        <div className="use-current-location mt5 aic" onClick={() => geoFindMe(setFieldValue)}>
                                                            <ICN_GEO_LOCATION />
                                                            <span className="ml5">Use current location</span>
                                                            {locationErr && locationErr?.code && <span className="text-danger f10 ml10">{`(${locationErr?.code === 1 ? "You have not allowed your browser's location access. Please provide the permission to access your location." : "Position unavailable"})`}</span>}
                                                        </div>
                                                    </Form.Group>

                                                </div>
                                            </div> */}
                                            
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <h5 class="label-head mb-0">Licence Doc<sup>*</sup>(<i class="hint-color">mandatory to upload doc</i>)</h5>
                                                    <div className="form-group">
                                                        <input readOnly type="text" required="required" placeholder="Verification Document"
                                                            className="form-control ac-doc-ul" name="doc" id="doc" value={licenceDoc.split('/').pop()} onClick={initVerifyUpload} />
                                                        <input type="file" accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,application/msword" className="form-control upload-input" onChange={uploadFiles} />
                                                        <p className="fild-caption">If you choose to upload a copy of your signed and dated FFL License, you must write "For Transfer Only" on the uploaded document, We will email this to the seller if the buyer chooses you.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <h5 className="label-head mb-2">Licence Expire Date<sup>*</sup></h5>
                                                    <Form.Group>
                                                        <DatePicker
                                                            className="form-control"
                                                            name="licenseExpireOn"
                                                            selected={values.licenseExpireOn}
                                                            dateFormat="MM/dd/yyyy"
                                                            placeholderText="MM/DD/YYYY"
                                                            peekNextMonth
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            disabled
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licenseExpireOn}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row justify-content-end action-footer-setup-store pr-3 pt-4">
                                            <input type="button" name="cancel" class="cancel-btn w150px" value="Cancel" onClick={() => {
                                                setStoreViewBy({
                                                    view: '',
                                                    title: ''
                                                });
                                                goToTopOfWindow();
                                            }}/>
                                            <input 
                                                onClick={handleSubmit} 
                                                disabled={validateBasicStoreForm(isValid) || !dirty}
                                                type="button" 
                                                name="next" 
                                                class="next action-button nextBtn w150px" 
                                                value="Save" 
                                            />
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </fieldset>
        </>
    )

}

export default StoreBasicInfo;
