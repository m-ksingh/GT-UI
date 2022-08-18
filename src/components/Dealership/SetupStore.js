import React, { useContext, useState, useEffect, useRef } from 'react'
import Layout from '../Layout';
import { Formik, Field, ErrorMessage } from "formik"
import Input, { isValidPhoneNumber } from 'react-phone-number-input/input'
import Spinner from "rct-tpt-spnr";
import * as Yup from 'yup';
import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import { Form, Row, InputGroup, Collapse } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { useAuthState, useAuthDispatch } from '../../contexts/AuthContext/context';
import Breadcrumb from '../Shared/breadcrumb';
import { useHistory } from 'react-router-dom'
import { goToTopOfWindow, MAP_API_KEY } from '../../commons/utils';
import { AppContext } from '../../contexts/AppContext';
import FormikCotext from '../Shared/FormikContext';
import bgCheckmarkIcon from '../../assets/images/icon/bg_checkmark.png'
import useToast from '../../commons/ToastHook';
import classNames from 'classnames';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';
import { ICN_GEO_LOCATION } from '../icons';
import { services } from '@tomtom-international/web-sdk-services';
import DatePicker from 'react-datepicker';
import { DateInput } from '../Shared/InputType';
import {useConfirmationModal} from '../../commons/ConfirmationModal/ConfirmationModalHook';
let getAddress1 = require('extract-country-state-city-from-zip');

let tabWiseData = {
    storeInfo: {},
    businessInfo: {
        fflStoreHasSpecialities: []
    },
    isUnReviewed: false,
    sid: null,
    approvalStatus: 'NOT_SUBMITTED',
    locationInfo: ""
};

let defaultBasicInfoValues = GLOBAL_CONSTANTS.DATA.STORE.BASIC_INFO;
const listOfBusinessHours = GLOBAL_CONSTANTS.DATA.BUSINESS_HOUR;
const specialityList = [
    {
        isChecked: false,
        label: 'Gunsmithing',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Antiques',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Revolver',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'AR',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Re-finishing',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Plating',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Precision',
        certificateDetails: []
    }
];

const layawayPeriodList = [
    {
        name: "7 Days",
        sid: "7"
    },
    {
        name: "15 Days",
        sid: "15"
    },
    {
        name: "30 Days",
        sid: "30"
    }
];

const layawayFeesList = [
    {
        name: "10%",
        sid: 10
    },
    {
        name: "25%",
        sid: 25
    },
    {
        name: "50%",
        sid: 50
    }
];

let defaultBusinessInfoValues = {
    openingHour: '10AM',
    closingHour: '10PM',
    fflStoreHasSpecialities: _.cloneDeep(specialityList),
    yearsOfExperience: "",
    appraisalEnabled: false,
    appraisalFeeType: 'PERCENTAGE',
    appraisalFeePercentageTill500: 0,
    appraisalFeePercentageTill1000: 0,
    appraisalFeePercentageAbove1000: 0,
    appraisalFeeFixedPriceTill500: 0,
    appraisalFeeFixedPriceTill1000: 0,
    appraisalFeeFixedPriceAbove1000: 0,
    layawayEnabled: false,
    layawayPeriod: '30',
    layawayFee: 10,
    inspectionEnabled: false,
    inspectionLevel: '1',
    inspectionFee: 0,
    classesEnabled: false,
    permitClassesEnabled: false,
    trainingClassesEnabled: false,
    permitClassFee: 0,
    trainingClassFee: 0,
    fflSaleEnabled: false,
    fflSaleFee: 0
};
let currentBusinessInfoValues = {};
let selectedListingImages = [];

const BasicInfo = ({ setTab, cancelStoreSetup, className = "", resetStoreSetup, isResetForm, setHasPartiallySubmitted }) => {
    const licInnerRef = useRef();
    const placeInputRef = useRef(null);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const history = useHistory();
    const { location } = useContext(AppContext);
    const [initialValues, setInitialValues] = useState(defaultBasicInfoValues);
    const [licNumberInfo, setLicNumberInfo] = useState({});
    const [licInitialValues, setLicInitialValues] = useState({
        licRegn: '',
        licDist: '',
        licSeqn: ''
    });
    const [selectedLocation, setSelectedLocation] = useState({
        lat: "",
        lng: "",
        info: {},
    });
    const [locationErr, setLocationErr] = useState(null);
    const [locationSearchText, setLocationSearchText] = useState("");
    const formikStoreInfo = useRef();
    const [err, setErr] = useState(false);
    const [promiseZipCode, setPromiseZipCode] = useState();

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

    useEffect(() => {
        if(!userDetails?.user?.sid){
            history.push('/');
        }
    },[])

    useEffect(() => {
        tabWiseData = { ...tabWiseData, "storeInfo": { ...tabWiseData.storeInfo, "latitude": selectedLocation.lat, "longitude": selectedLocation.lng } }
    }, [selectedLocation])

    const schema = Yup.object().shape({
        licRegn: Yup.number().min(1).required("Required!"),
        licDist: Yup.number().min(1).required("Required!"),
        licSeqn: Yup.number().min(5).required("Required!"),
        name: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
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
            .required("Required!"),
        contactPhoneNumber: Yup.string().nullable()
            .required("Required!"),
        premiseStreet: Yup.string()
            .required("Required!"),
        premiseCity: Yup.string()
            .required("Required!"),
        premiseState: Yup.string()
            .required("Required!"),
        premiseZipCode: Yup.string()
            .required("Required!"),
            licenseExpireOn: Yup.string()
            .required("Required!"),
    });

    const [files, setFiles] = useState((!_.isEmpty(selectedListingImages) && selectedListingImages) || []);
    const [licenceDoc, setLicenceDoc] = useState('');

    const initVerifyUpload = () => {
        $('.upload-input:visible').trigger('click');
    }

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
        const fileName = uploadedFiles[0].fileName.split('/').pop()
        $('#doc').val(fileName);
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

    const setFFLStoreValues = (data, values) => {
        const readonlyValues = {
            name: data.storeName || data.licHolderName,
            firstName: !_.isEmpty(data.licHolderName.replace(/\s+/g, '').split(',')[0]) ? data.licHolderName.replace(/\s+/g, '').split(',')[0] : '-',
            lastName: !_.isEmpty(data.licHolderName.replace(/\s+/g, '').split(',')[1]) ? data.licHolderName.replace(/\s+/g, '').split(',')[1] : '-',
            phoneNumber: (_.isString(data.voicePhone) && !data.voicePhone.startsWith("+") && `+1${data.voicePhone}`) ?? data.voicePhone,
            contactPhoneNumber: (_.isString(data.voicePhone) && !data.voicePhone.startsWith("+") && `+1${data.voicePhone}`) ?? data.voicePhone,
            premiseStreet: data.premStreet,
            premiseCity: data.premCity,
            premiseState: data.premState,
            premiseZipCode: data.premZipCode,
            licenseExpireOn: new Date().toISOString(),
            isFetched: true,
        }
        setInitialValues({ ...values, ...readonlyValues });
        setPromiseZipCode(data.premZipCode);

    }

    const checkFFLStoreAvailability = (values) => {
        const licenseNumber = values.licRegn + '-' + values.licDist + '-xxx-xx-xx-' + values.licSeqn;
        ApiService.fflStoreAvailability(licenseNumber).then(
            response => {
                if (response.status === 200) {
                    Toast.error({ message: 'FFL store already added please choose diff license no. ', time: 2000 });
                } else if (response.status === 204) {
                    initFFLStoreInfo(values);
                }
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.message || err.response.data.error) : 'FFL Store Availability', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    const initFFLStoreInfo = (values) => {
        const payload = {
            "licDist": values.licDist,
            "licRegn": values.licRegn,
            "licSeqn": values.licSeqn
        };
        spinner.show("Please wait...");
        ApiService.fflCheck(payload).then(
            response => {
                if (response.status === 200) {
                    setFFLStoreValues(response.data, values);
                    setPromiseZipCode(response.data.premZipCode);
                    getCountry(response.data, values);
                } else {
                    Toast.warning({ message: 'Looks like license number wrong, please check it', time: 2000 });
                }
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.message || err.response.data.error) : 'FFL Store', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    const getFFLStoreBasicInfo = (values) => {
        if (values.licRegn.length >= 1 && values.licDist.length >= 1 && values.licSeqn.length >= 5 && !values.isFetched && !tabWiseData.isUnReviewed) {
            checkFFLStoreAvailability(values)
        }
    }

    const handleChangeByChange = (values) => {
        setLicNumberInfo(values);
    }

    useEffect(() => {
        if(licNumberInfo 
            && licNumberInfo.licDist 
            && licNumberInfo.licRegn 
            && licNumberInfo.licSeqn ) {
                 getFFLStoreBasicInfo(licNumberInfo);
        }
    }, [licNumberInfo])

    const getMyPayload = () => {
        const payload = { ...tabWiseData.businessInfo, ...tabWiseData.storeInfo };
        payload.fflStoreHasSpecialities = _.chain(payload.fflStoreHasSpecialities).filter({ isChecked: true }).map(function (d) {
            return {
                certificateDetails: JSON.stringify(d.certificateDetails),
                name: d.label
            };
        }).values();
        payload.createdBy = {
            sid: userDetails.user.sid
        };
        payload.approvalStatus = tabWiseData.approvalStatus;
        return payload;
    }

    const onNextStep = () => {
        $('#businessInfo').addClass('active');
        setTab('businessInfo');
        goToTopOfWindow();
    }

    const initPartiallySaveStore = (values) => {
        tabWiseData.storeInfo = { ...tabWiseData.storeInfo, ...values, ...licNumberInfo };
        tabWiseData.storeInfo.license = files[0].fileName;
        tabWiseData.storeInfo.licenseNumber = values.licRegn + '-' + values.licDist + '-xxx-xx-xx-' + values.licSeqn;
        const payload = getMyPayload();
        spinner.show("Please wait...");
        ApiService.addStore(userDetails.user.sid, payload).then(
            response => {
                tabWiseData.sid = response.data.sid;
                tabWiseData.approvalStatus = response.data.approvalStatus;
                onNextStep();
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : '', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    

    const validateBasicStoreForm = (isValid, dirty, tmpLocation) => {
        let isFormValid = false;
        try {
            if(
                (!isValid 
                || !files.length 
                || (!dirty && !tabWiseData.isUnReviewed))
                || tmpLocation.lat === ""
            ) isFormValid = true;
        } catch (err) {
            console.error("Error in validateBasicStoreForm-- ", err);
        }
        return isFormValid;
    }

    // show reset confirmation modal when user click on conform
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Are you sure?",
        body: <p>All the data you have entered will be cleared!<br/></p>,

        onConfirm: () => {
            onResetStoreInfo();
        },
        onCancel: () => { }
    })

    const onResetStoreInfo = () =>{
        try{
            spinner.show("Please wait...");
            if (tabWiseData.sid === null) {
                formikStoreInfo.current?.resetForm();
                setLicInitialValues({ ...licInitialValues, temp: Date.now() })
                setInitialValues(defaultBasicInfoValues);
                setSelectedLocation({
                    lat: "",
                    lng: "",
                    info: null,
                });
                goToTopOfWindow();
                resetStoreSetup();
            }
            else {
                resetStoreSetup();
                formikStoreInfo.current?.resetForm();                
            }
            spinner.hide();
            window.location.reload();


        }catch (err) {
            console.error("Exception occurred in onResetStoreInfo --- " + err);
        }
    }

    const resetFormData = () => {
        try {
            spinner.show("Please wait...");
            setInitialValues(defaultBasicInfoValues);
            setSelectedLocation({
                lat: "",
                lng: "",
                info: null,
            });
            // setLocationSearchText("");
            // placeInputRef.current.value = "";
            setHasPartiallySubmitted(false);
            spinner.hide();
        } catch (err) {
            console.error("Error in resetFormData--", err);
        }
    }

    /**
     * This method used to get city and state values from based on pincode.
     * @param {String} key - This is city & state name of key
     * @param {string} value - This city & state of value
     * @param {Function} setFieldValue - This is set the value of state and city.
     */
     const getCountry = (data, values) => {
        try {
            let FFLZipCode = data.premZipCode
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

    useEffect(() => {
        getCountry();
    }, [promiseZipCode]);

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

    useEffect(() => {
        if (isResetForm) {
            setLicNumberInfo({})
            resetFormData();
        }
    }, [isResetForm])

    useEffect(() => {
        if(defaultBasicInfoValues.latitude) 
        // getMyLocation({ "lat": Number(defaultBasicInfoValues.latitude), "lng": Number(defaultBasicInfoValues.longitude) });
        setInitialValues(defaultBasicInfoValues);
        setLicInitialValues({
            ...{
                licRegn: defaultBasicInfoValues.licRegn,
                licDist: defaultBasicInfoValues.licDist,
                licSeqn: defaultBasicInfoValues.licSeqn
            }
        });
        if (!_.isEmpty(defaultBasicInfoValues.license) && !_.isEmpty(tabWiseData.sid)) {
            setLicenceDoc(defaultBasicInfoValues.license);
            $('#doc').val(defaultBasicInfoValues.license);
            setFiles([{
                fileName: defaultBasicInfoValues.license,
                mediaType: "doc",
                order: 0
            }]);
        } else {
            setLicenceDoc(defaultBasicInfoValues.license);
            $('#doc').val(defaultBasicInfoValues.license);
            setFiles([]);
        }
    }, [defaultBasicInfoValues]);

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
            <fieldset className={className}>
                <div className="row bg-white justify-content-center p-4">
                    <div className="col-lg-12 text-center">
                        <h4>Basic Info</h4>
                        <p className="pro-description">Enter the basic details about your store</p>
                    </div>
                    <div className="col-lg-6">
                        <div className="form-card-store">
                            <Formik
                                innerRef={licInnerRef}
                                enableReinitialize={true}
                                validationSchema={schema}
                                initialValues={licInitialValues}>
                                {({ handleSubmit, isSubmitting, handleChange, handleBlur, touched, errors, values, isValid, dirty, setFieldValue, resetForm }) => (
                                    <Form noValidate>
                                        <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                        <div className="form-group text-left">
                                            <div className="row">
                                                <div className="col-lg-12 mt-4">
                                                    <h5 className="label-head mb-3">Enter your license number<sup>*</sup></h5>
                                                </div>
                                            </div>
                                            <div className="row pl-3 pr-3 license-input-block">
                                                <div className="flx1 mr10">
                                                    <Form.Group className="m0">
                                                        <Form.Control
                                                            type="tel"
                                                            name="licRegn"
                                                            placeholder="Regn"
                                                            value={values.licRegn}
                                                            onChange={(e) => {
                                                                if (!isNaN(e.target.value))
                                                                    setFieldValue("licRegn", e.target.value)
                                                            }}
                                                            onBlur={handleBlur}
                                                            isInvalid={!!errors.licRegn}
                                                            pattern="[0-9]*"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licRegn}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="flx1 mr10">
                                                    <Form.Group className="m0">
                                                        <Form.Control
                                                            type="tel"
                                                            name="licDist"
                                                            placeholder="Dist"
                                                            value={values.licDist}
                                                            onChange={(e) => {
                                                                if (!isNaN(e.target.value))
                                                                    setFieldValue("licDist", e.target.value)
                                                            }}
                                                            onBlur={handleBlur}
                                                            isInvalid={!!errors.licDist}
                                                            pattern="[0-9]*"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licDist}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="flx1 mr10 text-center">
                                                    <p className="m0"> - xxx - xx - xx- </p>
                                                </div>
                                                <div className="flx1">
                                                    <Form.Group className="m0">
                                                        <Form.Control
                                                            type="tel"
                                                            name="licSeqn"
                                                            placeholder="Seqn"
                                                            value={values.licSeqn}
                                                            onChange={(e) => {
                                                                if (!isNaN(e.target.value))
                                                                    setFieldValue("licSeqn", e.target.value)
                                                            }}
                                                            isInvalid={!!errors.licSeqn}
                                                            onBlur={handleBlur}
                                                            pattern="[0-9]*"
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licSeqn}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                            <Formik
                                innerRef={formikStoreInfo}
                                enableReinitialize={true}
                                validationSchema={schema}
                                initialValues={initialValues}
                                onSubmit={initPartiallySaveStore}>
                                {({ handleSubmit, isSubmitting, handleChange, setFieldValue,handleBlur, touched, errors, values, isValid, dirty, resetForm }) => (
                                    <Form noValidate>
                                        <div className="form-group text-left">
                                            <Form.Group>
                                                <Form.Label><h5 className="label-head">Store Name<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    disabled
                                                    value={values.name}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.name}
                                                    onBlur={handleBlur}
                                                    className={classNames("", { "border border-danger": errors.name })}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label><h5 className="label-head">Description<sup>*</sup></h5></Form.Label>
                                                <Form.Control as="textarea" rows={3}
                                                    name="description"
                                                    value={values.description}
                                                    // onChange={handleChange}
                                                    onChange={(e) => {
                                                        onChangeLimit("description", e.target.value, setFieldValue, 1033);
                                                    }}
                                                    // onBlur={handleBlur}
                                                    onBlur={(e) => onChangeTrim("description", e.target.value, setFieldValue)}
                                                    className={classNames("", { "border border-danger": errors.description })}
                                                    isInvalid={!!errors.description}
                                                />
                                                <p className="fild-caption">(1032 Characters Maximum, No HTML, Special characters & All Caps)</p>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.description}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label><h5 className="label-head">First Name<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="firstName"
                                                            // disabled
                                                            value={values.firstName}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.firstName}
                                                            onBlur={handleBlur}
                                                            className={classNames("", { "border border-danger": errors.firstName })}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.firstName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label><h5 className="label-head">Last Name<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="lastName"
                                                            // disabled
                                                            value={values.lastName}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.lastName}
                                                            onBlur={handleBlur}
                                                            className={classNames("", { "border border-danger": errors.lastName })}
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
                                                    type="email"
                                                    name="email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={classNames("", { "border border-danger": errors.email })}
                                                    isInvalid={!!errors.email}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label className="p-0"><h5 className="label-head mb-0">Phone Number<sup>*</sup></h5></Form.Label>
                                                <Field
                                                    name="phoneNumber"
                                                    validate={(value) => (value && isValidPhoneNumber(value) ? '' : `${(value?.length > 0) ? 'Enter valid phone number' : 'Enter valid phone number'}`)} >
                                                    {({ field: { name, value }, form: { setFieldTouched } }) => (<div onClick={() => setFieldTouched(name, true)}>
                                                        <Input
                                                            defaultCountry="US"
                                                            value={values?.phoneNumber ?? ""}
                                                            disabled
                                                            className={`form-control ${errors[name] && 'is-invalid'}`}
                                                            onChange={e => { setFieldValue("phoneNumber", e) }}
                                                            onBlur={handleBlur}
                                                        />
                                                    </div>)}
                                                </Field>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phoneNumber}
                                                </Form.Control.Feedback>
                                                {/* {errors.phoneNumber && <ErrorMessage component="span" name="phoneNumber" className="text-danger mb-2 small-text" />} */}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Contact Email Address<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="contactEmailAddress"
                                                    placeholder="Contact Email Address"
                                                    value={values.contactEmailAddress}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={classNames("", { "border border-danger": errors.contactEmailAddress })}
                                                    isInvalid={!!errors.contactEmailAddress }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.contactEmailAddress}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label className="p-0"><h5 className="label-head mb-0">Contact Phone Number<sup>*</sup></h5></Form.Label>
                                                <Field
                                                    name="contactPhoneNumber"
                                                    validate={(value) => (value && isValidPhoneNumber(value) ? '' : `${(value?.length > 0) ? 'Enter valid phone number' : 'Enter valid phone number'}`)} >
                                                    {({ field: { name, value }, form: { setFieldTouched } }) => (<div onClick={() => setFieldTouched(name, true)}>
                                                        <Input
                                                            defaultCountry="US"
                                                            value={values?.contactPhoneNumber ?? ""}
                                                            className={`form-control ${errors[name] && 'is-invalid'}`}
                                                            onChange={e => { setFieldValue("contactPhoneNumber", e) }}
                                                            onBlur={handleBlur}
                                                        />
                                                    </div>)}
                                                </Field>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.contactPhoneNumber}
                                                </Form.Control.Feedback>
                                                {/* <ErrorMessage component="span" name="contactPhoneNumber" className="text-danger mb-2 small-text" /> */}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label className="p-0"><h5 className="label-head mb-0">Fax Number</h5></Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="fax"
                                                    placeholder="Fax Number"
                                                    value={values.fax}
                                                    isInvalid={!!errors.fax}
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
                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">Street<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="premiseStreet"
                                                            disabled
                                                            placeholder="Street Address"
                                                            value={values.premiseStreet}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={classNames("", { "border border-danger": errors.premiseStreet })}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.premiseStreet}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">City<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="premiseCity"
                                                            disabled
                                                            placeholder="City"
                                                            value={values.premiseCity}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={classNames("", { "border border-danger": errors.premiseCity })}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.premiseCity}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">State<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="premiseState"
                                                            disabled
                                                            placeholder="State"
                                                            value={values.premiseState}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={classNames("", { "border border-danger": errors.premiseState })}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.premiseState}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            <div className="row justify-content-start">
                                                <div className="col-lg-6">
                                                    <Form.Group>
                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">Zipcode<sup>*</sup></h5></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="premiseZipCode"
                                                            disabled
                                                            placeholder="Zipcode"
                                                            value={values.premiseZipCode}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={classNames("", { "border border-danger": errors.premiseZipCode })}
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
                                                        <Form.Control 
                                                            type="text" 
                                                            name="location" 
                                                            className={classNames("form-control", { "border border-danger": selectedLocation.lat === "" })}
                                                            ref={placeInputRef} 
                                                            onChange={(e) => setLocationSearchText(e.target.value)} 
                                                            placeholder={"Search location"}
                                                            onBlur={handleBlur}
                                                        />
                                                        {
                                                            selectedLocation.lat === ""
                                                             && <div className="f10 text-danger">Required!</div>
                                                        }

                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.location}
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
                                                    <h5 className="label-head mb-2">Licence Doc<sup>*</sup>(<i className="hint-color">mandatory to upload doc</i>)</h5>
                                                    <div className="form-group">
                                                        <Form.Group>
                                                        <input readOnly type="text" 
                                                        required="required" 
                                                        placeholder="Upload a copy of your FFL License"
                                                        onBlur={handleBlur}
                                                        isInvalid={!!errors.doc}
                                                        className={classNames("form-control ac-doc-setup", { "border border-danger": !files.length})}
                                                        name="doc" 
                                                        value={licenceDoc.split('/').pop()} 
                                                        id="doc" 
                                                        onClick={initVerifyUpload} />
                                                        <input type="file" 
                                                        accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,application/msword" 
                                                        className="form-control upload-input" onChange={uploadFiles} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.doc}
                                                        </Form.Control.Feedback>
                                                        </Form.Group>
                                                        
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
                                                            className={classNames("form-control", { "border border-danger": errors.licenseExpireOn })}
                                                            selected={values?.licenseExpireOn ? new Date(values.licenseExpireOn) : null}
                                                            minDate={new Date()}
                                                            dateFormat="MM/dd/yyyy"
                                                            placeholderText="MM/DD/YYYY"
                                                            onChange={(e) => {
                                                                setFieldValue("licenseExpireOn", e.toISOString());
                                                            }}
                                                            onBlur={handleBlur}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.licenseExpireOn}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            
                                        </div>

                                        <div id="product-pgBtn-section">
                                            <div className="row justify-content-end action-footer-setup-store pr-3 pt-4">
                                                {
                                                    tabWiseData.approvalStatus === 'NOT_SUBMITTED' 
                                                    && <input 
                                                        type="button" 
                                                        name="reset" 
                                                        className="reset-btn reset-btn-width" 
                                                        value="Reset" 
                                                        onClick={() => {
                                                            showConfirmModal();
                                                        }} 
                                                    />
                                                }
                                                <input type="button" name="cancel" className="cancel-btn cancel-btn-width" value="Cancel" onClick={cancelStoreSetup} />
                                                <input 
                                                    onClick={handleSubmit} 
                                                    disabled={validateBasicStoreForm(isValid, selectedLocation)} 
                                                    type="button" 
                                                    name="next" 
                                                    className="next action-button save-btn" 
                                                    value="Save & Continue" 
                                                />
                                            </div>
                                        </div>

                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                    {ConfirmationComponent}
                </div>
            </fieldset>
        </>
    )

}

const BusinessInfo = ({ setTab, cancelStoreSetup, className, resetStoreSetup }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const { location } = useContext(AppContext);
    const [initialValues, setInitialValues] = useState(defaultBusinessInfoValues);
    const [uploadIndex, setUploadIndex] = useState('');
    const formikRef = useRef();
    
    const schema = Yup.object().shape({
        openingHour: Yup.string()
            .required("Required!"),
        closingHour: Yup.string()
            .required("Required!"),
        yearsOfExperience: Yup.number()
            .typeError("Please enter valid year")
            .min(0, "Experience cannot be less than '0'")
            .max(500, "Experience cannot be more than '500'")
            .required("Required!"),
        appraisalEnabled: Yup.bool(),
        appraisalFeeType: Yup.string(),
        appraisalFeePercentageTill500: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeePercentageTill1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeePercentageAbove1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeeFixedPriceTill500: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeeFixedPriceTill1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeeFixedPriceAbove1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        layawayEnabled: Yup.bool(),
        layawayPeriod: Yup.string(),
        layawayFee: Yup.number(),
        inspectionEnabled: Yup.bool(),
        inspectionLevel: Yup.string(),
        inspectionFee: Yup.number().typeError("Please enter a valid price").min(0, "Inspection Fees cannot be less than '0'"),
        classesEnabled: Yup.bool(),
        permitClassesEnabled: Yup.bool(),
        trainingClassesEnabled: Yup.bool(),
        permitClassFee: Yup.number().typeError("Please enter a valid price").min(0, "Fees cannot be less than '0'"),
        trainingClassFee: Yup.number().typeError("Please enter a valid price").min(0, "Fees cannot be less than '0'"),
        fflSaleEnabled: Yup.bool(),
        fflSaleFee: Yup.number().typeError("Please enter a valid price").min(0, "Fees cannot be less than '0'")
    });
    const initCertificateUpload = (uploadInd, values) => {
        setUploadIndex(uploadInd);
        currentBusinessInfoValues = _.cloneDeep(values);
        $('.upload-input:visible').trigger('click');
    }

    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, (file, index) => {
            return {
                fileName: file.data,
                mediaType: "images",
                order: index
            };
        });
        currentBusinessInfoValues.fflStoreHasSpecialities[uploadIndex].certificateDetails = _.concat(currentBusinessInfoValues.fflStoreHasSpecialities[uploadIndex].certificateDetails, uploadedFiles);
        setInitialValues(currentBusinessInfoValues);
    }

    const removeCertificateBy = (index, fIndex) => {
        currentBusinessInfoValues.fflStoreHasSpecialities[index].certificateDetails.splice(fIndex, 1);
        setInitialValues(currentBusinessInfoValues);
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
                setMultiFilesToDisplay(response);
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

    const handleChangeByChange = (values) => {
        currentBusinessInfoValues = _.cloneDeep(values);
    }

    const getMyPayload = () => {
        const payload = _.merge(tabWiseData.storeInfo, tabWiseData.businessInfo);
        payload.fflStoreHasSpecialities = _.chain(payload.fflStoreHasSpecialities).filter({ isChecked: true }).map(function (d) {
            return {
                certificateDetails: JSON.stringify(d.certificateDetails),
                name: d.label
            };
        });
        payload.createdBy = {
            sid: userDetails.user.sid
        };
        payload.approvalStatus = tabWiseData.approvalStatus;
        payload.sid = tabWiseData?.sid ? tabWiseData.sid : "";
        return payload;
    }

    const onNextStep = () => {
        $('#accountSetup').addClass('active');
        setTab('accountSetup');
        goToTopOfWindow();
    }

    const initPartiallySaveStore = (values) => {
        tabWiseData.businessInfo = values;
        const payload = getMyPayload();
        spinner.show("Please wait...");
        ApiService.addStore(userDetails.user.sid, payload).then(
            response => {
                tabWiseData.sid = response.data.sid;
                tabWiseData.approvalStatus = response.data.approvalStatus;
                onNextStep();
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : '', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    // show reset confirmation modal when user click on conform
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Are you sure?",
        body: <p>All the data you have entered will be cleared!<br/></p>,
        onConfirm: () => {
            onResetBusinessInfo();
        },
        onCancel: () => { }
    })

    const onResetBusinessInfo = () =>{
        try{
            spinner.show("Please wait...");
            formikRef.current?.resetForm();
            setInitialValues(defaultBusinessInfoValues);
            goToTopOfWindow();
            spinner.hide();
        }catch (err) {
            console.error("Exception occurred in onResetForm --- " + err);
        }
    }

    useEffect(() => {
        setInitialValues(defaultBusinessInfoValues);
    }, [defaultBusinessInfoValues]);

    return (
        <>
            <fieldset className={className}>
                <div className="row bg-white  justify-content-center m-0 businessInfo-setup">
                    <div className="col-lg-12 text-center">
                        <h4>Business Info</h4>
                        <p className="pro-description">Enter the information about your business</p>
                    </div>
                    <div className="col-lg-6 pt-4">
                        <div className="form-card-store">
                            <Formik
                                enableReinitialize={true}
                                validationSchema={schema}
                                innerRef={formikRef}
                                initialValues={initialValues}
                                onSubmit={initPartiallySaveStore}>
                                {({ handleSubmit, isSubmitting, handleChange, handleBlur, touched, errors, values, isValid, dirty, resetForm }) => (
                                    <Form noValidate>
                                        <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                        <div className="form-group text-left">
                                            <div className="row">
                                                <div className="col-5">
                                                    <Form.Group>
                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">Business Hours</h5></Form.Label>
                                                        <Form.Control className="p-2 text-center" as="select"
                                                            name="openingHour"
                                                            value={values.openingHour}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.openingHour}
                                                        >
                                                            {listOfBusinessHours.map((list, index) => {
                                                                return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                            })}
                                                        </Form.Control>
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.openingHour}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-2">
                                                    <p className="middle-label">To</p>
                                                </div>
                                                <div className="col-5">
                                                    <Form.Group>
                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">&nbsp;</h5></Form.Label>
                                                        <Form.Control className="p-2 text-center" as="select"
                                                            name="closingHour"
                                                            value={values.closingHour}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.closingHour}
                                                        >
                                                            {listOfBusinessHours.map((list, index) => {
                                                                return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                            })}
                                                        </Form.Control>
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.closingHour}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="label-head mb-0">Speciality</h5>
                                        {
                                            values.fflStoreHasSpecialities.map((list, index) => {
                                                return <Form.Group className="Specialityblock" key={index}>
                                                    <Form.Check onChange={handleChange} type="checkbox" checked={values.fflStoreHasSpecialities[index].isChecked} name={`fflStoreHasSpecialities.${index}.isChecked`} id={`dss-fflStoreHasSpecialities.${index}.isChecked`} label={list.label } className="form-checklabel-padding" />
                                                    {
                                                        list.isChecked && <div className="upload-certificates-block ml-4">
                                                            <div className="title ml-2">Upload certificates</div>
                                                            {
                                                                !_.isEmpty(list.certificateDetails) && list.certificateDetails.map((file, cIndex) => {
                                                                    return <div className="m-2 border p-2 docList" key={cIndex}>
                                                                        <p className="m0">{file.fileName.split('/').pop()}</p>
                                                                        <span className="delete" onClick={() => removeCertificateBy(index, cIndex)}>x</span>
                                                                    </div>
                                                                })
                                                            }
                                                            <div className="ml-2">
                                                                <a className="add-certificates" data-signin="add" onClick={() => initCertificateUpload(index, values)}>Add New</a>
                                                            </div>
                                                        </div>
                                                    }
                                                </Form.Group>
                                            })
                                        }
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Years of experience<sup>*</sup></h5></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="yearsOfExperience"
                                                value={values.yearsOfExperience}
                                                onKeyDown={e => e.keyCode === 69 && e.preventDefault()}
                                                onChange={handleChange}
                                                isInvalid={!!errors.yearsOfExperience}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.yearsOfExperience}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <h5 className="label-head mb-0">Services Offered</h5>
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} type="checkbox" onBlur={handleBlur} checked={values.appraisalEnabled} name="appraisalEnabled" id="appraisalEnabled" label="Appraisals" className="form-checklabel-padding" />
                                        </Form.Group>
                                        {values.appraisalEnabled &&
                                            <div className="container">
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <Form.Group as={Row}>
                                                            <div className="col-lg-12 d-flex justify-content-between m-2">
                                                                <div className="radio-btn p-2">
                                                                    <Form.Check onChange={handleChange} type="radio" value="PERCENTAGE" id="dss-P-appraisalFeeType"  name="appraisalFeeType" label="Percentage(%)" className="form-checklabel-padding"/>
                                                                </div>
                                                                <div className="radio-btn p-2">
                                                                    <Form.Check onChange={handleChange} type="radio" value="FIXED_PRICE" id="dss-F-appraisalFeeType"  name="appraisalFeeType" label="Fixed Price($)" className="form-checklabel-padding"/>
                                                                </div>
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        {
                                            values.appraisalEnabled && values.appraisalFeeType === 'PERCENTAGE' && <div className="row">
                                                <div className="col-lg-12">
                                                    <Form.Group as={Row} className="justify-content-center">
                                                        <div className="col-10 d-flex">
                                                            <Form.Group as={Row}>
                                                                <Form.Label column col="4" className="col-4  pl-4">0 to 500 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Form.Label>
                                                                <div className="col-8">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupPrependPercentageTill500"
                                                                            name="appraisalFeePercentageTill500"
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                            value={values.appraisalFeePercentageTill500}
                                                                            onChange={handleChange}
                                                                            isInvalid={!!errors.appraisalFeePercentageTill500}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependPercentageTill500">%</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.appraisalFeePercentageTill500}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-10 d-flex">
                                                            <Form.Group as={Row}>
                                                                <Form.Label column col="4" className="col-4  pl-4">501 to 1000</Form.Label>
                                                                <div className="col-8">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupPrependPercentageTill1000"
                                                                            name="appraisalFeePercentageTill1000"
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                            value={values.appraisalFeePercentageTill1000}
                                                                            onChange={handleChange}
                                                                            isInvalid={!!errors.appraisalFeePercentageTill1000}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependPercentageTill1000">%</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.appraisalFeePercentageTill1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-10 d-flex">
                                                            <Form.Group as={Row}>
                                                                <Form.Label column className="col-4  pl-4">Above 1000</Form.Label>
                                                                <div className="col-8">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupPrependPercentageAbove1000"
                                                                            name="appraisalFeePercentageAbove1000"
                                                                            value={values.appraisalFeePercentageAbove1000}
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                            onChange={handleChange}
                                                                            isInvalid={!!errors.appraisalFeePercentageAbove1000}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependPercentageAbove1000">%</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.appraisalFeePercentageAbove1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        }
                                        {
                                            values.appraisalEnabled && values.appraisalFeeType === 'FIXED_PRICE' && <div className="row">
                                                <div className="col-lg-12">
                                                    <Form.Group as={Row} className="justify-content-center">
                                                        <div className="col-10 d-flex">
                                                            <Form.Group as={Row}>
                                                                <Form.Label column col="4" className="col-4  pl-4">0 to 500 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Form.Label>
                                                                <div className="col-8">
                                                                    <InputGroup className="mb-3">
                                                                        <InputGroup.Prepend>
                                                                            <InputGroup.Text>$</InputGroup.Text>
                                                                        </InputGroup.Prepend>
                                                                        <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupPrependFPTill500"
                                                                            name="appraisalFeeFixedPriceTill500"
                                                                            value={values.appraisalFeeFixedPriceTill500}
                                                                            onChange={handleChange}
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                            //onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 110 || e.keyCode === 190 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                            isInvalid={!!errors.appraisalFeeFixedPriceTill500}
                                                                        />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.appraisalFeeFixedPriceTill500}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-10 d-flex">
                                                            <Form.Group as={Row}>
                                                                <Form.Label column col="4" className="col-4  pl-4">501 to 1000</Form.Label>
                                                                <div className="col-8">
                                                                    <InputGroup>
                                                                        <InputGroup.Prepend>
                                                                            <InputGroup.Text>$</InputGroup.Text>
                                                                        </InputGroup.Prepend>
                                                                        <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupPrependFPTill1000"
                                                                            name="appraisalFeeFixedPriceTill1000"
                                                                            value={values.appraisalFeeFixedPriceTill1000}
                                                                            onChange={handleChange}
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                            //onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 110 || e.keyCode === 190 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                            isInvalid={!!errors.appraisalFeeFixedPriceTill1000}
                                                                        />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.appraisalFeeFixedPriceTill1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-10 d-flex">
                                                            <Form.Group as={Row}>
                                                                <Form.Label column className="col-4  pl-4">Above 1000</Form.Label>
                                                                <div className="col-8">
                                                                    <InputGroup>
                                                                        <InputGroup.Prepend>
                                                                            <InputGroup.Text>$</InputGroup.Text>
                                                                        </InputGroup.Prepend>
                                                                        <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupPrependFPAbove1000"
                                                                            name="appraisalFeeFixedPriceAbove1000"
                                                                            value={values.appraisalFeeFixedPriceAbove1000}
                                                                            onChange={handleChange}
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                            isInvalid={!!errors.appraisalFeeFixedPriceAbove1000}
                                                                        />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.appraisalFeeFixedPriceAbove1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        }
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} onBlur={handleBlur} checked={values.layawayEnabled} type="checkbox" id="dss-layawayEnabled" name="layawayEnabled" label="Layaway" className="form-checklabel-padding" />
                                        </Form.Group>
                                        {
                                            values.layawayEnabled && <div className="row">
                                                <div className="col-lg-12">
                                                    <Form.Group as={Row} className="justify-content-center">
                                                        <div className="col-10">
                                                            <Form.Group as={Row}>
                                                                <Form.Label className="col-6 mt-2 pl-4" >Layaway Period</Form.Label>
                                                                <div className="col-6">
                                                                    <Form.Control className="p-2 text-center" as="select"
                                                                        name="layawayPeriod"
                                                                        value={values.layawayPeriod}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.layawayPeriod}
                                                                    >
                                                                        {layawayPeriodList.map((list, index) => {
                                                                            return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                                        })}
                                                                    </Form.Control>
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.layawayPeriod}
                                                                    </Form.Control.Feedback>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                                    <Form.Group as={Row} className="justify-content-center">
                                                        <div className="col-10">
                                                            <Form.Group as={Row}>
                                                                <Form.Label className="col-6 mt-2 pl-4" >Layaway Fees</Form.Label>
                                                                <div className="col-6">
                                                                    <Form.Control className="p-2 text-center" as="select"
                                                                        name="layawayFee"
                                                                        value={values.layawayFee}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.layawayFee}
                                                                    >
                                                                        {layawayFeesList.map((list, index) => {
                                                                            return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                                        })}
                                                                    </Form.Control>
                                                                    <p className="fild-caption">(% of the price of the product)
                                                                    </p>
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.layawayFee}
                                                                    </Form.Control.Feedback>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        }
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} onBlur={handleBlur} checked={values.inspectionEnabled} type="checkbox" name="inspectionEnabled" id="dss-inspectionEnabled" label="Inspections" className="form-checklabel-padding" />
                                        </Form.Group>
                                        {values.inspectionEnabled &&
                                            <div className="container">
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <Form.Group as={Row}>
                                                            <div className="col-lg-12 d-flex justify-content-between">
                                                                <div className="radio-btn p-2">
                                                                    <Form.Check onChange={handleChange} id="dss-inspectionEnabled-l1" type="radio" value="1" name="inspectionLevel" label="Level 1" className="form-checklabel-padding"/>
                                                                </div>
                                                                <div className="radio-btn p-2">
                                                                    <Form.Check onChange={handleChange} id="dss-inspectionEnabled-l2" type="radio" value="2" name="inspectionLevel" label="Level 2" className="form-checklabel-padding" />
                                                                </div>
                                                                <div className="radio-btn p-2">
                                                                    <Form.Check onChange={handleChange} id="dss-inspectionEnabled-l3" type="radio" value="3" name="inspectionLevel" label="Level 3" className="form-checklabel-padding" />
                                                                </div>
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                                <div className="row justify-content-center">
                                                    <div className="col-lg-12">
                                                        {
                                                            values.inspectionLevel === '1' && <div className="ml-4 inception-level-block">
                                                                <p className="m-0 pl-2">Preliminary Inspection</p>
                                                                <p className="m-0 pl-2">Function Test</p>
                                                                <p className="m-0 pl-2">Wear & Tear Inspection</p>
                                                            </div>
                                                        }
                                                        {
                                                            values.inspectionLevel === '2' && <div className="ml-4 inception-level-block">
                                                                <p className="m-0 pl-2">Complete Inspection</p>
                                                                <p className="m-0 pl-2">Dis-assembly</p>
                                                            </div>
                                                        }
                                                        {
                                                            values.inspectionLevel === '3' && <div className="ml-4 inception-level-block">
                                                                <p className="m-0 pl-2">Test Firing, etc.,</p>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <Form.Group as={Row} className="justify-content-start">
                                                            <div className="col-10 d-flex ml-4 mt-4">
                                                                <Form.Group as={Row}>
                                                                    <Form.Label column col="5" className="col-5 mt-2 pl-4" >Inspection Fees</Form.Label>
                                                                    <div className="col-6">
                                                                        <InputGroup className="mb-3">
                                                                            <InputGroup.Prepend>
                                                                                <InputGroup.Text>$</InputGroup.Text>
                                                                            </InputGroup.Prepend>
                                                                            <Form.Control
                                                                                type="text"
                                                                                aria-describedby="inputGroupInspectionFee"
                                                                                name="inspectionFee"
                                                                                value={values.inspectionFee}
                                                                                onPaste={e => e.preventDefault()}
                                                                                onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                                onChange={handleChange}
                                                                                isInvalid={!!errors.inspectionFee}
                                                                            />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.inspectionFee}
                                                                            </Form.Control.Feedback>
                                                                        </InputGroup>
                                                                    </div>
                                                                </Form.Group>
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} onBlur={handleBlur} checked={values.classesEnabled} type="checkbox" name="classesEnabled" id="dss-classesEnabled" label="Classes" className="form-checklabel-padding"/>
                                        </Form.Group>
                                        {
                                            values.classesEnabled &&
                                            <div className="container">
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <Form.Group className="">
                                                            <Form.Check onChange={handleChange} type="checkbox" name="permitClassesEnabled" id="dss-permitClassesEnabled" label="Permit Classes" className="form-checklabel-padding"/>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                                {
                                                    values.classesEnabled && values.permitClassesEnabled &&
                                                    <div className="row">
                                                        <p className="c777 classes-line">We provide classes on permits according to your local law's
                                                        </p>
                                                        <div className="col-lg-12">
                                                            <Form.Group as={Row} className="justify-content-start">
                                                                <div className="col-10 d-flex ml-4">
                                                                    <Form.Group as={Row}>
                                                                        <Form.Label className="col-6 mt-2 pl-4" >Fees</Form.Label>
                                                                        <div className="col-6">
                                                                            <InputGroup>
                                                                                <InputGroup.Prepend>
                                                                                    <InputGroup.Text>$</InputGroup.Text>
                                                                                </InputGroup.Prepend>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    aria-describedby="inputGroupPermitClassFee"
                                                                                    name="permitClassFee"
                                                                                    value={values.permitClassFee}
                                                                                    onPaste={e => e.preventDefault()}
                                                                                    onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                                    onChange={handleChange}
                                                                                    isInvalid={!!errors.permitClassFee}
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.permitClassFee}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </div>
                                                                    </Form.Group>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                }
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <Form.Group className="">
                                                            <Form.Check onChange={handleChange} type="checkbox" name="trainingClassesEnabled" id="dss-trainingClassesEnabled" label="Training Classes" className="form-checklabel-padding"/>
                                                        </Form.Group>

                                                    </div>
                                                </div>
                                                {
                                                    values.classesEnabled && values.trainingClassesEnabled &&
                                                    <div className="row">
                                                        <div className="col-lg-12">
                                                            <Form.Group as={Row} className="justify-content-start">
                                                                <p className="c777 classes-line">We provide training on how to operate your arms & ammunitions
                                                                </p>
                                                                <div className="col-10 d-flex ml-4">
                                                                    <Form.Group as={Row}>
                                                                        <Form.Label className="col-6 mt-2 pl-4" >Fees</Form.Label>
                                                                        <div className="col-6">
                                                                            <InputGroup>
                                                                                <InputGroup.Prepend>
                                                                                    <InputGroup.Text>$</InputGroup.Text>
                                                                                </InputGroup.Prepend>
                                                                                <Form.Control
                                                                                    type="text"
                                                                                    aria-describedby="inputGroupTrainingClassFee"
                                                                                    name="trainingClassFee"
                                                                                    value={values.trainingClassFee}
                                                                                    onPaste={e => e.preventDefault()}
                                                                                    onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                                    onChange={handleChange}
                                                                                    isInvalid={!!errors.trainingClassFee}
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.trainingClassFee}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </div>
                                                                    </Form.Group>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        }
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} onBlur={handleBlur} checked={values.fflSaleEnabled} type="checkbox" name="fflSaleEnabled" id="dss-fflSaleEnabled" label="FFL Sale (Peer to Peer)" className="form-checklabel-padding"/>
                                        </Form.Group>
                                        {
                                            values.fflSaleEnabled &&
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <Form.Group as={Row} className="justify-content-start">
                                                        <div className="col-10 d-flex ml-4">
                                                            <Form.Group as={Row}>
                                                                <Form.Label className="col-6 mt-2 pl-5" >Fees</Form.Label>
                                                                <div className="col-6 pl-3">
                                                                    <InputGroup>
                                                                        <InputGroup.Prepend>
                                                                            <InputGroup.Text>$</InputGroup.Text>
                                                                        </InputGroup.Prepend>
                                                                        <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupFFLSaleFee"
                                                                            name="fflSaleFee"
                                                                            value={values.fflSaleFee}
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                            //onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 110 || e.keyCode === 190 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                            onChange={handleChange}
                                                                            isInvalid={!!errors.fflSaleFee}
                                                                        />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.fflSaleFee}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        }
                                        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,application/msword" multiple="multiple" className="form-control upload-input" onChange={uploadFiles} />
                                        <div id="product-pgBtn-section">
                                            <div className="row justify-content-end action-footer-setup-store pr-3 pt-4">

                                                {tabWiseData.approvalStatus === 'NOT_SUBMITTED' && 
                                                <input type="button" name="reset" className="reset-btn reset-btn-width" value="Reset" 
                                                onClick={() => {
                                                    showConfirmModal();
                                                }} />}
                                                <input type="button" name="cancel" className="cancel-btn cancel-btn-width" value="Cancel" onClick={cancelStoreSetup} />
                                                <input onClick={handleSubmit} disabled={(!isValid || (!dirty && !tabWiseData.isUnReviewed))} type="button" name="next" className="next action-button save-btn" value="Save & Continue" />
                                            </div>
                                        </div>

                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                    {ConfirmationComponent}
                </div>
            </fieldset>
        </>
    )
}

function ExpandCollapse({ name, data }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="p-1 pointer aic" onClick={() => setOpen(!open)}>
                <i className={classNames("fa ibvm mr5", {
                    "fa-chevron-down": open,
                    "fa-chevron-right": !open
                })}></i>
                {name}
            </div>
            <Collapse in={open}>
                <div className="col-lg-12">
                    <table className="table-overflow-anywhere">
                        <tbody>
                            {
                                _.isArray(data)
                                && data.map((e, idx) => <tr key={idx}>
                                    <td>{e.name} :</td>
                                    <td style={{ width: "170px" }}><b>{e.value}</b></td>
                                </tr>)
                            }
                        </tbody>
                    </table>
                </div>
            </Collapse>
        </>
    );
}


const StorePreview = ({ setTab, cancelStoreSetup, className, setStoreSubmitted, resetStoreSetup }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    let userDetails = useAuthState();
    const dispatch = useAuthDispatch();
    const getMyPayload = () => {
        const payload = { ...tabWiseData.storeInfo, ...tabWiseData.businessInfo };
        payload.fflStoreHasSpecialities = _.chain(payload.fflStoreHasSpecialities).filter({ isChecked: true }).map(function (d) {
            return {
                certificateDetails: JSON.stringify(d.certificateDetails),
                name: d.label
            };
        });
        payload.createdBy = {
            sid: userDetails.user.sid
        };
        payload.approvalStatus = "UNDER_REVIEW";
        payload.sid = tabWiseData?.sid ? tabWiseData.sid : "";
        return payload;
    }

    const onNextStep = (values) => {
        $('#preview').addClass('active');
        setTab('preview');
        goToTopOfWindow();
    }

    const initSaveStore = () => {
        const payload = getMyPayload();
        spinner.show("Please wait...");
        ApiService.addStore(userDetails.user.sid, payload).then(
            response => {
                tabWiseData.sid = response.data.sid;
                tabWiseData.approvalStatus = response.data.approvalStatus;
                setStoreSubmitted(true);
                onNextStep();
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : '', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    return (<div className={className}>
        <div className="row bg-white justify-content-center m-0 p-0">
            <div className="col-12 store-preview">
                <div className="row bg-white">
                    <div className="col-lg-12 col-12">
                        <h4>{tabWiseData.storeInfo.name}</h4>
                    </div>
                    <div className="col-lg-12 col-12">
                        <p>{tabWiseData.storeInfo.premiseStreet}</p>
                    </div>
                    <div className="col-lg-5 col-5">
                        <p>{tabWiseData.businessInfo.openingHour} to {tabWiseData.businessInfo.closingHour}</p>
                    </div>
                    <div className="col-lg-7 col-7">
                        <p className="text-right">{tabWiseData.businessInfo.yearsOfExperience} Years of experience</p>
                    </div>
                    <div className="col-lg-12 col-12">
                        <hr />
                    </div>
                    <div className="col-lg-12 col-12">
                        <p>
                            {tabWiseData.storeInfo.description}
                        </p>
                    </div>
                    <div className="col-lg-12 col-12">
                        <h5 className="label-head mb-0">Specialities</h5>
                        <div className="d-flex">
                            {
                                tabWiseData.businessInfo.fflStoreHasSpecialities.map((list, index) => {
                                    return list.isChecked ? <div className="speciality-btn">{list.label}</div> : '';
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="row bg-white pl-4 pr-4">
                    <h5 className="label-head mb-0">Contact Info</h5>
                    <div className="col-lg-12">
                        <table className="table table-borderless " class="table-overflow-anywhere">
                            <tbody>
                                <tr>
                                    <td>First Name :</td>
                                    <td><b>{tabWiseData.storeInfo.firstName}</b></td>
                                </tr>
                                <tr>
                                    <td>Last Name :</td>
                                    <td><b>{tabWiseData.storeInfo.lastName}</b></td>
                                </tr>
                                <tr>
                                    <td>Email :</td>
                                    <td><b>{tabWiseData.storeInfo.email}</b></td>
                                </tr>
                                <tr>
                                    <td>Phone Number :</td>
                                    <td><b>{tabWiseData.storeInfo.phoneNumber}</b></td>
                                </tr>
                                <tr>
                                    <td>Fax Number :</td>
                                    <td><b>{tabWiseData.storeInfo.fax}</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row bg-white pl-4 pr-4">
                    <h5 className="label-head mb-0">Service Offered</h5>
                    <div className="col-lg-12">
                        {
                            tabWiseData.businessInfo.appraisalEnabled && <ExpandCollapse
                                name="Appraisals"
                                data={
                                    [
                                        {
                                            name: "0 to 500",
                                            value: (_.isEqual("PERCENTAGE", tabWiseData.businessInfo.appraisalFeeType) && `${tabWiseData.businessInfo.appraisalFeePercentageTill500}%`) || `${tabWiseData.businessInfo.appraisalFeeFixedPriceTill500}`
                                        },
                                        {
                                            name: "501 to 1000",
                                            value: (_.isEqual("PERCENTAGE", tabWiseData.businessInfo.appraisalFeeType) && `${tabWiseData.businessInfo.appraisalFeePercentageTill1000}%`) || `${tabWiseData.businessInfo.appraisalFeeFixedPriceTill1000}`
                                        },
                                        {
                                            name: "1000+",
                                            value: (_.isEqual("PERCENTAGE", tabWiseData.businessInfo.appraisalFeeType) && `${tabWiseData.businessInfo.appraisalFeePercentageAbove1000}%`) || `${tabWiseData.businessInfo.appraisalFeeFixedPriceAbove1000}`
                                        }
                                    ]
                                } />
                        }
                        {
                            tabWiseData.businessInfo.layawayEnabled
                            && <ExpandCollapse
                                name="Layaway"
                                data={[
                                    {
                                        name: "Layaway Period",
                                        value: `${tabWiseData.businessInfo.layawayPeriod} Day(s)`
                                    },
                                    {
                                        name: "Layaway Fees",
                                        value: `${tabWiseData.businessInfo.layawayFee}%`
                                    }
                                ]} />
                        }
                        {
                            tabWiseData.businessInfo.inspectionEnabled &&
                            <ExpandCollapse
                                name="Inspections"
                                data={[
                                    {
                                        name: "Appraisal Level",
                                        value: `Level ${tabWiseData.businessInfo.inspectionLevel}`
                                    },
                                    {
                                        name: "Appraisal Fees",
                                        value: `$${tabWiseData.businessInfo.inspectionFee}`
                                    }
                                ]} />
                        }
                        {
                            tabWiseData.businessInfo.classesEnabled
                            && <ExpandCollapse
                                name="Classes"
                                data={[
                                    {
                                        name: "Permit Classes Fees",
                                        value: `$${tabWiseData.businessInfo.permitClassFee}`
                                    },
                                    {
                                        name: "Training Classes Fees",
                                        value: `$${tabWiseData.businessInfo.trainingClassFee}`
                                    }
                                ]} />
                        }
                        {
                            tabWiseData.businessInfo.fflSaleEnabled
                            && <ExpandCollapse
                                name="FFL Sales"
                                data={[
                                    {
                                        name: "FFL Sale Fees",
                                        value: `$${tabWiseData.businessInfo.fflSaleFee}`
                                    }
                                ]} />
                        }
                        {!tabWiseData.businessInfo.appraisalEnabled && !tabWiseData.businessInfo.layawayEnabled && !tabWiseData.businessInfo.inspectionEnabled && !tabWiseData.businessInfo.classesEnabled && !tabWiseData.businessInfo.fflSaleEnabled && '- None -'}
                    </div>
                </div>
                <div id="product-pgBtn-section">
                    <div className="row justify-content-end action-footer-setup-store pr-3 pt-4">
                        {/* {tabWiseData.approvalStatus === 'NOT_SUBMITTED' && 
                        <input type="button" 
                        name="reset" className="reset-btn reset-btn-width" 
                        value="Reset" 
                        onClick={resetStoreSetup} 
                        />} */}
                        <input type="button" name="cancel" className="cancel-btn cancel-btn-width" value="Cancel" onClick={cancelStoreSetup} />
                        <input onClick={initSaveStore} type="button" name="next" className="next action-button nextBtn nextBtn-Width" value="Submit" />
                    </div>
                </div>
            </div>
        </div>
    </div>)
}

export const StoreSubmit = ({ setTab = () => { }, className, message = "" }) => {
    const history = useHistory()
    const storeCreatedSuccess = () => {
        goToTopOfWindow();
        history.replace('/')
    }
    return (<div className={className}>
        <div className="bg-white  d-flex flex-column align-items-center justify-content-center">
            <div className="col-lg-4 p-4 col-4 text-center">
                <img src={bgCheckmarkIcon} alt="ordered" />
            </div>
            <h2 className="text-center">{message ? message : "You’ve submitted Store Request"}</h2>
            <div className="col-lg-7">
                <div className="row bg-white bg-none justify-content-between">
                    <div className="col-lg-12">
                        <div className="pro-dtle-box">
                            <p className="pro-description">
                                Verification under progress, once approved you will be notified and you will be able to access your store
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <input type="button" name="done" className="next action-button nextBtn" value="Finish" onClick={storeCreatedSuccess} />
        </div>
    </div>)
}

const StepsToSetup = ({ tab, setTab, setHasPartiallySubmitted }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const history = useHistory()
    const [storeSubmitted, setStoreSubmitted] = useState(false);
    const [isResetForm, setIsResetForm] = useState(false);
    const stepsBySetupStore = [{
        name: 'Basic Info',
        id: 'basicInfo'
    }, {
        name: 'Business Info',
        id: 'businessInfo'
    }, {
        name: 'Account Setup',
        id: 'accountSetup'
    }, {
        name: 'Submit',
        id: 'preview'
    }
    ];

    const cancelStoreSetup = () => {
        goToTopOfWindow();
        if (userDetails.user.appUserType === 'DEALER' || userDetails.user.adminToFFlStore) {
            history.replace('/store/mystores');
        } else {
            history.replace('/');
        }
    }

    const onStepFrontBack = (sid, idx) => {
        if (!storeSubmitted) {
            $(`#${sid}`).hasClass("active") && setTab(sid)
            for (let i = idx; i <= 3; i++) {
                i !== 0 && i !== idx && $(`#${stepsBySetupStore[i]?.id}`).removeClass("active")
            }
        }
    }

    const resetDefaultValues = () => {
        defaultBasicInfoValues = {
            licRegn: "",
            licDist: "",
            licSeqn: "",
            name: "",
            description: "",
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            contactEmailAddress: "",
            contactPhoneNumber: "",
            fax: "",
            premiseStreet: "",
            premiseCity: "",
            premiseState: "",
            premiseZipCode: "",
            license: "",
            licenseExpireOn: null,
            licenseNumber: "",
            isFetched: false
        };
        defaultBusinessInfoValues = {
            openingHour: '10AM',
            closingHour: '10PM',
            fflStoreHasSpecialities: _.cloneDeep(specialityList),
            yearsOfExperience: "",
            appraisalEnabled: false,
            appraisalFeeType: 'PERCENTAGE',
            appraisalFeePercentageTill500: 0,
            appraisalFeePercentageTill1000: 0,
            appraisalFeePercentageAbove1000: 0,
            appraisalFeeFixedPriceTill500: 0,
            appraisalFeeFixedPriceTill1000: 0,
            appraisalFeeFixedPriceAbove1000: 0,
            layawayEnabled: false,
            layawayPeriod: '30',
            layawayFee: 10,
            inspectionEnabled: false,
            inspectionLevel: '1',
            inspectionFee: 0,
            classesEnabled: false,
            permitClassesEnabled: false,
            trainingClassesEnabled: false,
            permitClassFee: 0,
            trainingClassFee: 0,
            fflSaleEnabled: false,
            fflSaleFee: 0
        };
        currentBusinessInfoValues = {};
        selectedListingImages = [];
    }

    const resetStoreSetup = () => {
        spinner.show("Please wait...");
        ApiService.resetStore(tabWiseData.sid).then(
            response => {
                tabWiseData = {
                    storeInfo: {},
                    businessInfo: {
                        fflStoreHasSpecialities: []
                    },
                    isUnReviewed: false,
                    sid: null,
                    approvalStatus: 'NOT_SUBMITTED'
                };
                setIsResetForm(true);
                resetDefaultValues();
                if(tab != 'basicInfo') {
                    onStepFrontBack('basicInfo', 0);
                };
                goToTopOfWindow();
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : '', time: 2000 });
            }
        ).finally(() => {
            setTimeout(() => {
                spinner.hide();
            }, 3000);
        });
    }

    return (
        <div className="container-fluid">
            <div className="col-12 flx store-name-page setup-store-padding ">
                <div className="mr10">
                    <svg className="dis-block" xmlns="http://www.w3.org/2000/svg" width="16" height="12.801" viewBox="0 0 16 12.801"><path id="store-icon" d="M8,9.6H3.2v-4H1.6V12a.8.8,0,0,0,.8.8H8.8a.8.8,0,0,0,.8-.8V5.6H8Zm7.866-6.046L13.736.355A.8.8,0,0,0,13.069,0H2.938a.8.8,0,0,0-.665.355L.14,3.555A.8.8,0,0,0,.8,4.8H15.2A.8.8,0,0,0,15.869,3.555ZM12.8,12.4a.4.4,0,0,0,.4.4H14a.4.4,0,0,0,.4-.4V5.6H12.8Z" transform="translate(-0.004)" fill="#5ca017" /></svg>
                </div>
                <div className="flx1 setup-store-css pt5">Setup Store</div>
            </div>
            <div className="row justify-content-center mt-0">
                <div className="col-11 col-sm-9 col-md-7 col-lg-12 text-center p-0 mt-3 mb-2">
                    <div className="card nobg">
                        <ul id="trade-progressbar" className="d-flex justify-content-center">
                            {
                                stepsBySetupStore.map((steps, index) => {
                                    return <li onClick={() => onStepFrontBack(steps.id, index)} className={`pointer ${index === 0 && "active"}`} id={steps.id} key={index}><strong>{steps.name}</strong></li>
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center mt-0">
                <div className="col-11 col-sm-9 col-md-7 col-lg-12 p-0 mb-2">
                    <div className="row">
                        <div className="col-md-12 mx-0">
                            <div className="noRadious">
                                <div className="justify-content-between">
                                    <BasicInfo className={tab === "basicInfo" ? 'd-block' : "d-none"} {...{ setTab, cancelStoreSetup, resetStoreSetup, isResetForm, setHasPartiallySubmitted}} />
                                    <BusinessInfo className={tab === "businessInfo" ? 'd-block' : "d-none"} {...{ setTab, cancelStoreSetup, resetStoreSetup }} />
                                    <StorePreview className={tab === "accountSetup" ? 'd-block' : "d-none"} {...{ setTab, cancelStoreSetup, setStoreSubmitted, resetStoreSetup }} />
                                    <StoreSubmit className={tab === "preview" ? 'd-block' : "d-none"} {...{ setTab, tab }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SetupStore(props) {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [tab, setTab] = useState('basicInfo');
    const [hasPartiallySubmitted, setHasPartiallySubmitted] = useState(false);

    const setStoreInfo = (storeInfo) => {
        let isSpecialitiesExistsIndex;
        let isSpecialitiesExists;
        const licSplit = storeInfo.licenseNumber.split('-');
        storeInfo.licRegn = licSplit[0];
        storeInfo.licDist = licSplit[1];
        storeInfo.licSeqn = licSplit[5];
        storeInfo.licenseExpireOn = new Date().toISOString();
        if (storeInfo.fflStoreHasSpecialities && !storeInfo.fflStoreHasSpecialities.length) {
            storeInfo.fflStoreHasSpecialities = _.cloneDeep(specialityList);
        } else if (storeInfo.fflStoreHasSpecialities && storeInfo.fflStoreHasSpecialities.length) {
            storeInfo.fflStoreHasSpecialities = _.map(_.cloneDeep(specialityList), s => {
                isSpecialitiesExistsIndex = _.findIndex(storeInfo.fflStoreHasSpecialities, { name: s.label });
                isSpecialitiesExists = storeInfo.fflStoreHasSpecialities[isSpecialitiesExistsIndex];
                return isSpecialitiesExistsIndex !== -1 ? {
                    isChecked: true,
                    label: isSpecialitiesExists.name,
                    certificateDetails: _.isString(isSpecialitiesExists.certificateDetails) ? JSON.parse(isSpecialitiesExists.certificateDetails) : isSpecialitiesExists.certificateDetails
                } : {
                    isChecked: false,
                    label: s.label,
                    certificateDetails: _.isString(s.certificateDetails) ? JSON.parse(s.certificateDetails) : s.certificateDetails
                };
            })
        }
        if (_.isEmpty(storeInfo.openingHour)) {
            storeInfo.openingHour = '10AM';
        }
        if (_.isEmpty(storeInfo.closingHour)) {
            storeInfo.closingHour = '10PM';
        }
        // Business Default Values
        storeInfo.appraisalFeeType = _.isEmpty(storeInfo.appraisalFeeType) ? 'PERCENTAGE' : storeInfo.appraisalFeeType;
        storeInfo.appraisalFeePercentageTill500 = _.isEmpty(storeInfo.appraisalFeePercentageTill500) ? 0 : storeInfo.appraisalFeePercentageTill500;
        storeInfo.appraisalFeePercentageTill1000 = _.isEmpty(storeInfo.appraisalFeePercentageTill1000) ? 0 : storeInfo.appraisalFeePercentageTill1000;
        storeInfo.appraisalFeePercentageAbove1000 = _.isEmpty(storeInfo.appraisalFeePercentageAbove1000) ? 0 : storeInfo.appraisalFeePercentageAbove1000;
        storeInfo.appraisalFeeFixedPriceTill500 = _.isEmpty(storeInfo.appraisalFeeFixedPriceTill500) ? 0 : storeInfo.appraisalFeeFixedPriceTill500;
        storeInfo.appraisalFeeFixedPriceTill1000 = _.isEmpty(storeInfo.appraisalFeeFixedPriceTill1000) ? 0 : storeInfo.appraisalFeeFixedPriceTill1000;
        storeInfo.appraisalFeeFixedPriceAbove1000 = _.isEmpty(storeInfo.appraisalFeeFixedPriceAbove1000) ? 0 : storeInfo.appraisalFeeFixedPriceAbove1000;
        storeInfo.layawayPeriod = _.isEmpty(storeInfo.layawayPeriod) ? '30' : storeInfo.layawayPeriod;
        storeInfo.layawayFee = _.isEmpty(storeInfo.layawayFee) ? 10 : storeInfo.layawayFee;
        storeInfo.inspectionLevel = _.isEmpty(storeInfo.inspectionLevel) ? '1' : storeInfo.inspectionLevel;
        storeInfo.inspectionFee = _.isEmpty(storeInfo.inspectionFee) ? 0 : storeInfo.inspectionFee;
        storeInfo.permitClassFee = _.isEmpty(storeInfo.permitClassFee) ? 0 : storeInfo.permitClassFee;
        storeInfo.trainingClassFee = _.isEmpty(storeInfo.trainingClassFee) ? 0 : storeInfo.trainingClassFee;
        storeInfo.fflSaleFee = _.isEmpty(storeInfo.fflSaleFee) ? 0 : storeInfo.fflSaleFee;
        const basicInfo = { ...defaultBasicInfoValues, ...storeInfo };
        const businessInfo = { ...defaultBusinessInfoValues, ...storeInfo }
        tabWiseData.storeInfo = _.cloneDeep(basicInfo);
        tabWiseData.businessInfo = _.cloneDeep(businessInfo);
        defaultBasicInfoValues = _.cloneDeep(basicInfo);
        defaultBusinessInfoValues = _.cloneDeep(businessInfo);
    }

    // populate store information
    const populateStoreInfo = (isRejectedStores) => {
        if(userDetails.user.sid){
            spinner.show("Please wait...");
        ApiService.populateUnSavedStore(userDetails.user.sid).then(
            response => {
                tabWiseData = {
                    storeInfo: {},
                    businessInfo: {
                        fflStoreHasSpecialities: []
                    },
                    isUnReviewed: false,
                    sid: null,
                    approvalStatus: 'NOT_SUBMITTED'
                };
                const isUnReviewedStore = _.filter(!_.isEmpty(response.data) ? response.data : isRejectedStores, { approvalStatus: !_.isEmpty(response.data) ? 'NOT_SUBMITTED' : "REJECTED" });
                if (isUnReviewedStore && isUnReviewedStore.length) {
                    setStoreInfo({ ...isUnReviewedStore[0], "approvalStatus": "NOT_SUBMITTED" });
                    tabWiseData.isUnReviewed = true;
                    tabWiseData.sid = isUnReviewedStore[0].sid;
                    tabWiseData.approvalStatus = 'NOT_SUBMITTED';
                    setHasPartiallySubmitted(true);
                }
                if(tabWiseData.businessInfo.yearsOfExperience && tabWiseData.storeInfo.name && tabWiseData.storeInfo.latitude && tabWiseData.storeInfo.longitude){
                    $('#accountSetup').addClass('active');
                    $('#businessInfo').addClass('active');
                    setTab('accountSetup');
                   }else if(!tabWiseData.businessInfo.yearsOfExperience && tabWiseData.storeInfo.name && tabWiseData.storeInfo.latitude && tabWiseData.storeInfo.longitude){
                    $('#businessInfo').addClass('active');
                    setTab('businessInfo');
                   }else{
                    $('#basicInfo').addClass('active');
                    setTab('basicInfo');
                   }
                goToTopOfWindow();
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : '', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
        }
        
    }

    // get store list list
    const getFFLStoreList = (pageNumber = 1, pageLimit = 500) => {
        try {
            spinner.show("Populating List... Please wait...");
            let payload = ["REJECTED"];
            ApiService.getFflRequestList(payload, pageNumber, pageLimit).then(
                response => {
                    const isRejectedStores = _.filter(response.data, { createdBy: { "sid": userDetails.user.sid } });
                    populateStoreInfo(isRejectedStores);
                },
                err => {
                    spinner.hide();
                    console.error('Error occurred in getFFLStoreList--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in getFFLStoreList--', err);
        }
    }

    // init component
    useEffect(() => {
        getFFLStoreList();
    }, []);

    return (
        <Layout view="Setup Store" title="Setup Store" description="Setup Store page" >
            <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
            <section id="store-details-section" className="p-0">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            {
                                ((hasPartiallySubmitted && tabWiseData.sid)
                                    || (!hasPartiallySubmitted))
                                && <StepsToSetup {...{tab, setTab, setHasPartiallySubmitted}} />
                            }
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default SetupStore;
