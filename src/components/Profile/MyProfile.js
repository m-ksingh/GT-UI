import React, { useEffect, useState, useContext, memo } from 'react';
import { Formik, Field, ErrorMessage } from "formik"
import Input, { isValidPhoneNumber } from 'react-phone-number-input/input'
import { Form } from 'react-bootstrap';
import ApiService from '../../services/api.service';
import { useAuthState, useAuthDispatch } from '../../contexts/AuthContext/context';
import { MAP_API_KEY } from '../../commons/utils';
import _ from "lodash";
import axios from 'axios';
import $ from 'jquery';
import Spinner from "rct-tpt-spnr";
import { AppContext } from '../../contexts/AppContext';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import useToast from '../../commons/ToastHook';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
let getAddress1 = require('extract-country-state-city-from-zip');

const MyProfile = () => {
    let uploadType = '';
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const { setValueBy } = useContext(AppContext)
    const dispatch = useAuthDispatch();
    const history = useHistory();
    const { location } = useContext(AppContext);
    const [states, setStates] = useState([]);
    const [completeProfile, setCompleteProfile] = useState({});
    const [profileImage, setProfileImage] = useState('');
    const [profileDoc, setProfileDoc] = useState('');
    const [err, setErr] = useState(false);
    const [isLatitude, setIsLatitude] = useState();
    const [isLongitude, setIsLongitude] = useState();
    const [userInfo, setUserInfo] = useState();
    const [myProfile, setMyProfile] = useState({
        email: '',
        firstName: '',
        phoneNumber: '',
        lastName: '',
        apartmentNumber: '',
        streetAddress: '',
        city: '',
        state: '',
        idDocumentLocation: '',
        profileImageLocation: '',
        dateOfBirth: '',
        dobOfDate: '',
        dobOfMonth: '',
        dobOfYear: '',
        zipcode: '',
        latitude: '',
        longitude: ''
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const userDetails = useAuthState();
    const schema = Yup.object().shape({
        firstName: Yup.string()
            .required("Required!"),
        email: Yup.string()
            .email("Invalid email format")
            .required("Required!"),
        dateOfBirth: Yup.string()
            .required("Required!"),
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
            .max(5, 'Must be exactly 5 digits'),
        dateOfBirth: Yup.string().required("Enter your date of birth")
    })

    /**
     * populate state list
     */
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

    /**
     * set profile info
     * @param {*} profile 
     */
    const setProfileInfo = (profile = null) => {
        try {
            if (!_.isEmpty(profile)) {
                let dob = new Date(profile.dateOfBirth);
                setMyProfile({
                    email: profile.email,
                    firstName: profile.firstName,
                    phoneNumber: profile.phoneNumber,
                    lastName: profile.lastName,
                    dateOfBirth: dob,
                    apartmentNumber: profile.appUserHasAddressTO ? profile.appUserHasAddressTO.apartmentNumber : '',
                    streetAddress: profile.appUserHasAddressTO ? profile.appUserHasAddressTO.streetAddress : '',
                    city: profile.appUserHasAddressTO ? profile.appUserHasAddressTO.city : '',
                    state: profile.appUserHasAddressTO && profile.appUserHasAddressTO.state ? profile.appUserHasAddressTO.state.name : '',
                    idDocumentLocation: '',
                    profileImageLocation: '',
                    zipcode: profile.appUserHasAddressTO ? profile.appUserHasAddressTO.zipcode : '',
                    latitude: profile.appUserHasAddressTO ? profile.appUserHasAddressTO.latitude : '',
                    longitude: profile.appUserHasAddressTO ? profile.appUserHasAddressTO.longitude : ''
                });
                setProfileImage(profile.profileImageLocation);
                setProfileDoc(profile.idDocumentLocation || '');
                setCompleteProfile(profile);
            }
        } catch (err) {
            console.error("Exception occurred in setProfileInfo -- ", err);
        }
    }

    // init component
    useEffect(() => {
        if (userDetails?.user?.sid) {
            spinner.show("Please wait...");
            ApiService.getMyProfile(userDetails.user.sid).then(
                response => {
                    setProfileInfo(response.data);
                    setUserInfo(response.data);
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

    /**
     * save profile info
     * @param {*} values 
     */
    const saveProfile = (values) => {
        const stateInfo = _.filter(states, { name: values.state });
        const payload = {
            "appUserHasAddressTO": {
                "addressType": "DEFAULT",
                "apartmentNumber": values.apartmentNumber || '',
                "sid": completeProfile.appUserHasAddressTO && completeProfile.appUserHasAddressTO.sid ? completeProfile.appUserHasAddressTO.sid : null,
                "state": stateInfo.length ? stateInfo[0] : {"sid": null, "name": values.state},
                "city": values.city || '',
                "streetAddress": values.streetAddress || '',
                "zipcode": values.zipcode,
                "latitude": isLatitude || values.latitude,
                "longitude": isLongitude || values.longitude
            },
            "addressProvided": true,
            "email": values.email,
            "firstName": values.firstName,
            "idDocumentLocation": profileDoc,
            "lastName": values.lastName || '',
            "phoneNumber": values.phoneNumber,
            "dateOfBirth": values?.dateOfBirth ? new Date(values.dateOfBirth).getTime() : null,
            "profileImageLocation": profileImage,
            "resetPassword": true,
            "sid": completeProfile.sid,
            "appUserType": completeProfile.appUserType
        };
        spinner.show("Please wait...");
        ApiService.saveMyProfile(payload).then(
            response => {
                setProfileInfo(response.data);
                dispatch({ type: 'LOGIN_SUCCESS', payload: { ...response.data, "defaultPlatformVariables": userDetails?.user?.defaultPlatformVariables ? userDetails.user.defaultPlatformVariables : null } });
                updateGeoLocationByZipcode(response?.data?.appUserHasAddressTO ? response.data.appUserHasAddressTO && response.data.appUserHasAddressTO.zipcode : null);
                Toast.success({ message: 'Personal information updated successfully', time: 2000 });
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }

    /**
     * update location by zip code
     * @param {*} value 
     */
    const updateGeoLocationByZipcode = (value) => {

        if (value.zipcode) {
            ApiService.getLocationByPin({
                key: MAP_API_KEY,
                zipCode: value.zipcode
            }).then(res => {
                if (res.data.results.length > 0) {
                    setValueBy('SET_LOCATION', res.data.results[0]);
                    saveProfile(value)
                    setErr(false)
                } else {
                    setErr(true)
                }

            });
        }
    }

    /**
     * trigger to upload file
     * @param {*} type 
     */
    const initProfileUpload = (type) => {
        uploadType = type;
        if (type === 'profile') {
            $('.upload-profile:visible').trigger('click');
        } else if (type === 'doc') {
            $('.upload-doc:visible').trigger('click');
        }

    }

    /**
     * 
     * @param {*} awsFiles 
     */
    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, (file, index) => {
            return {
                fileName: file.data,
                mediaType: "images",
                order: index
            };
        });
    }

    /**
     * upload file
     * @param {*} e 
     */
    const uploadFiles = async (e) => {
        // Create an object of formData
        let formData;
        const listOfFiles = [];
        _.each(e.target.files, file => {
            formData = new FormData();
            formData.append('file', file);
            listOfFiles.push(ApiService.uploadMultiPart(formData))
        })
        spinner.show("Please wait...");
        await axios.all(listOfFiles).then(
            response => {
                if (uploadType === 'profile') {
                    setProfileImage(response[0].data);
                    const payload = {
                        ...userInfo,
                        "profileImageLocation": response[0].data,
                    };
                    ApiService.saveMyProfile(payload).then(
                        response => {
                            setProfileInfo(response.data);
                            setProfileImage(response.data.profileImageLocation);
                            dispatch({ type: 'LOGIN_SUCCESS', payload: { ...response.data, "defaultPlatformVariables": userDetails?.user?.defaultPlatformVariables ? userDetails.user.defaultPlatformVariables : null } });
                            updateGeoLocationByZipcode(response?.data?.appUserHasAddressTO ? response.data.appUserHasAddressTO && response.data.appUserHasAddressTO.zipcode : null);
                            Toast.success({ message: 'Profile image updated successfully', time: 2000 });
                        },
                        err => {
                            Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                        }
                    ).finally(() => {
                        spinner.hide();
                        setIsDataLoaded(true);
                    });
                } else if (uploadType === 'doc') {
                    setProfileDoc(response[0].data);
                }

                if(response.status === "200"){
                    
                }
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

    /**
     * This method used to get city and state values from based on pincode.
     * @param {String} key - This is city & state name of key
     * @param {string} value - This city & state of value
     * @param {Function} setFieldValue - This is set the value of state and city.
     */
    const getCountry = (key, value, setFieldValue) => {
        try {
            if (value.length == 5) {
                ApiService.getLocationByPin({
                    key: MAP_API_KEY,
                    zipCode: value
                }).then(res => {
                    if (res.data.results.length > 0) {
                        getAddress1(value, 'AIzaSyAib2qoOvefizmKImyPPvuoQd7sS3ZVTFU', (err, CityList) => {
                            setFieldValue("city", CityList.city.long);
                            setFieldValue("state", CityList.state.long);
                            setIsLatitude(CityList.location.lat);
                            setIsLongitude(CityList.location.lng);
                        });
                        setFieldValue(key, value);

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

    const onChangeTrim = (key, value, setFieldValue) => {
        try {
            let trimValue = value.replace(/\s+/g, '').trim(); 
            setFieldValue(key, trimValue);
        } catch (err) {
            console.error("Error occurred while onChangeTrim", err);
        }
    }

    // init component
    useEffect(() => {
        getCountry();
    }, []);

    return <>
        <h2 className="card-title-header">My Profile</h2>
        <div className="myac-head-pic">
            {!_.isEmpty(profileImage) && <div className="user-pic-upload" style={{ backgroundImage: `url(${profileImage})` }}></div>}
            {_.isEmpty(profileImage) && <div className="user-pic-upload" style={{ backgroundImage: `url(${'images/default-user-icon.jpeg'})` }}></div>}
            <p>
                <span onClick={() => initProfileUpload('profile')} className="change-pic-btn">Change Picture</span>
            </p>
            <input type="file" accept="image/*" className="form-control upload-profile upload-input" onChange={uploadFiles} />
        </div>

        <div className="myac-piBox">
            <h4 className="mb-4">Personal Information</h4>
            <Formik
                enableReinitialize={true}
                initialValues={myProfile}
                validationSchema={schema}
                onSubmit={(value) => updateGeoLocationByZipcode(value)}>
                {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty, resetForm, setFieldValue }) => (
                    <Form noValidate>
                        <div className="controls">
                            <div className="row">
                                <div className="col-lg-6">
                                    <Form.Group>
                                        <Form.Label class="p-0"><h5 class="label-head mb-0">First Name<sup>*</sup></h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            placeholder="First Name"
                                            value={values.firstName}
                                            onChange={(e) => onChangeTrim("firstName", e.target.value, setFieldValue)}
                                            isInvalid={!!errors.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.firstName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                                <div className="col-lg-6">
                                    <Form.Group>
                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Last Name</h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={values.lastName}
                                            onChange={(e) => onChangeTrim("lastName", e.target.value, setFieldValue)}
                                            isInvalid={!!errors.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lastName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12">
                                    <Form.Group>
                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Email<sup>*</sup></h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="email"
                                            disabled
                                            placeholder="Email"
                                            value={values.email}
                                            onChange={handleChange}
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12">
                                    <Form.Group>
                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Phone Number<sup>*</sup></h5></Form.Label>
                                        <Field
                                            name="phoneNumber"
                                            validate={(value) => (value && isValidPhoneNumber(value) ? '' : `${(value?.length > 0) ? 'Enter valid phone number' : 'Enter valid phone number'}`)} >
                                            {({ field: { name, value }, form: { setFieldTouched } }) => (<div onClick={() => setFieldTouched(name, true)}>
                                                <Input
                                                    //defaultCountry="US"
                                                    value={values?.phoneNumber ?? ""}
                                                    className={`form-control ${errors[name] && 'is-invalid'}`}
                                                    onChange={e => { setFieldValue("phoneNumber", e) }}
                                                />
                                            </div>)}
                                        </Field>
                                        <ErrorMessage component="span" name="phoneNumber" className="text-danger mb-2 small-text" />
                                    </Form.Group>
                                </div>
                            </div>
                            <Form.Label class="p-0"><h5 class="label-head mb-0">Date of Birth<sup>*</sup></h5></Form.Label>
                            <div className="row date-of-birth">
                                <div className="col-lg-6 col-12">
                                    <Form.Group>
                                        <DatePicker
                                            class="form-control"
                                            name="dateOfBirth"
                                            selected={values.dateOfBirth}
                                            minDate={new Date().setFullYear(new Date().getFullYear() - 99)}
                                            maxDate={new Date().setFullYear(new Date().getFullYear() - 18)}
                                            dateFormat="MM/dd/yyyy"
                                            placeholderText="MM/DD/YYYY"
                                            peekNextMonth
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            onChange={(e) => {
                                                if (e) setFieldValue("dateOfBirth", e.getTime())
                                            }}
                                            isInvalid={!!errors.dateOfBirth && !!touched.dateOfBirth}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.dateOfBirth}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="form-group">
                                        <input type="text" required="required" placeholder="Verification Document"
                                            className="form-control ac-doc-ul" name="doc" id="doc" value={profileDoc.split('/').pop()} onClick={() => initProfileUpload('doc')} />
                                        <input type="file" accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,application/msword" className="form-control upload-doc upload-input" onChange={uploadFiles} />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-12 mt-4">
                                    <h4 className="mb-4">Address</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12">
                                    <Form.Group>
                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Address 1<sup>*</sup></h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="apartmentNumber"
                                            placeholder="Address"
                                            value={values.apartmentNumber}
                                            onChange={handleChange}
                                            isInvalid={!!errors.apartmentNumber}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.apartmentNumber}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12">
                                    <Form.Group>
                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Address 2</h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="streetAddress"
                                            placeholder="Address"
                                            value={values.streetAddress}
                                            onChange={handleChange}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.streetAddress}
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
                                            onChange={(e) => {
                                                        let a = e.target.value;
                                                        let tempA = a.substring(0,5);
                                                        getCountry("zipcode", tempA, setFieldValue);
                                                        setFieldValue("zipcode", tempA);
                                            }}
                                            
                                            isInvalid={!!errors.zipcode}
                                        />
                                        {
                                        err && <div className="text-danger">Please enter valid zip code.</div> ||
                                        <div className="text-danger">
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
                                            onBlur={handleChange}
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
                                <div className="col-lg-12 text-right  mobile-off">
                                    <ul className="profile-btnList">
                                        {/* <li><button type="button" className="submt-btn submt-btn-lignt" onClick={() => resetForm()}>Cancel</button></li> */}
                                        <li onClick={() => { history.replace("/") }}><a class="submt-btn submt-btn-lignt mr10 pointer">Cancel</a></li>
                                        <li><button type="submit" className="submt-btn submt-btn-dark" disabled={!isValid || err || isSubmitting || !dirty} onClick={handleSubmit}>Save</button></li>
                                    </ul>
                                </div>
                            </div>
                            <section class="mobile-btn-section desktop-off">
                                <div class="container">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="proPg-btnArea">
                                                <ul>
                                                    <li onClick={() => { history.replace("/") }} ><a class="submt-btn submt-btn-lignt mr10 pointer">Cancel</a></li>
                                                    <li><button type="submit" className="submt-btn submt-btn-dark probtn-pading" disabled={!isValid || err || isSubmitting || !dirty} onClick={handleSubmit}>Save</button></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    </>;
}

export default memo(MyProfile);