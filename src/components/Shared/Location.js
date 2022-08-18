import React, { useState, useEffect, useContext } from "react";
import { services } from '@tomtom-international/web-sdk-services';
import $, { data } from 'jquery';
import { MAP_API_KEY } from '../../commons/utils';
import ApiService from "../../services/api.service";
import { AppContext } from "../../contexts/AppContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Spinner from "rct-tpt-spnr";
import * as Yup from 'yup';
import useToast from "../../commons/ToastHook";


function Location({ setFilterLocation, setLocationModel, updateUserLocation }) {
    const { setValueBy } = useContext(AppContext);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [err, setErr] = useState(false)

    const [ipLocation, setIpLocation] = useState({});
    const [saveApply, setSaveApply] = useState(false)
    const schema = Yup.object().shape({
        pinCode: Yup.string()
            .required("Required")
            .matches(/^[0-9]+$/, "Must be only digits")
            .min(5, 'Must be exactly 5 digits')
            .max(5, 'Must be exactly 5 digits')
    })
    const ipInfo = () => {
        $.get("http://ip-api.com/json", function (response) {
            setIpLocation(response);
        });
    }
    const updateGeoLocationByZipcode = (value) => {
        spinner.show("Please wait...");
        ApiService.getLocationByPin({
            key: MAP_API_KEY,
            zipCode: value.pinCode
        }).then(res => {
            if (res.data.results.length > 0) {
                if (updateUserLocation) {
                    updateUserLocation(res.data.results[0]);
                }
                if (setFilterLocation) {
                    setFilterLocation(res.data.results[0]);
                }
                setLocationModel(false);
                setValueBy('SET_LOCATION', res.data.results[0]);
                setSaveApply(true)
                setErr(false)
            } else {
                setErr(true)
            }

            spinner.hide("Please wait...");
        });
    }

    const getMyLocation = (latlng) => {
        function callbackFn(resp) {
            // if(resp.addresses[0].country === "United States"){
                if (updateUserLocation) {
                    updateUserLocation(resp.addresses[0]);
                }
                if (setFilterLocation) {
                    setFilterLocation(resp.addresses[0]);
                }
                setValueBy('SET_LOCATION', resp.addresses[0]);
            // }else{
            //     Toast.warning({message: "Sorry! Services available for only US.", time: 4000});
            // }
            
        }
        services.reverseGeocode({
            key: MAP_API_KEY,
            position: latlng
        }).then(callbackFn);
    }

    const geoFindMe = () => {
        if (!navigator.geolocation) {
            Toast.error({ message: 'Geolocation is not supported by your browser', time: 3000 });
            setLocationModel(false);
            return;
        }

        spinner.show("Please wait...");
        function success(position) {
            spinner.hide("Please wait...");
            setLocationModel(false);
            getMyLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        }
        function error() {
            spinner.hide("Please wait...");
            Toast.error({ message: 'Unable to retrieve your location. Please check location permission', time: 2000 });
            setLocationModel(false);
        }
        navigator.geolocation.getCurrentPosition(success, error, { timeout: 3000 });
    }

    useEffect(() => {
        ipInfo();
    }, []);


    return (
        <>
            <div className="cd-signin-modal js-signin-modal">
                <div className="cd-signin-modal__container location">
                    <div class="row">
                        <div class="col-lg-12 changeLocation-popup-box">
                            <div class="js-signin-modal-block border-radius" data-type="changeLocation">
                                <div class="changeLocation-head">
                                    <h2>Update Location</h2>
                                </div>
                                <div class="changeLocation-body">
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={{
                                            pinCode: ''
                                        }}
                                        onSubmit={(value) => updateGeoLocationByZipcode(value)}
                                        validationSchema={schema}
                                    >
                                        {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty }) => (
                                            <Form noValidate>
                                                <div className="d-flex">
                                                    <div className="flx1 mr10">
                                                        <Field type="text" name="pinCode" placeholder="Enter Zipcode" class="form-control" id="updateZipcode" />
                                                    </div>
                                                    <div>
                                                        <input type="submit" value="Apply" class="submt-btn submt-btn-dark"  disabled={!isValid || !dirty} /></div>
                                                </div>
                                                <div className="text-danger">
                                                    <ErrorMessage name="pinCode" />
                                                </div>
                                                {
                                                    err
                                                    && <div className="text-danger">Please enter valid zip code.</div>
                                                }
                                                <p class="searchTxt-cap">OR</p>
                                                <input type="submit" value="Use my Current Location" class="submt-btn searchBtn-dark" onClick={geoFindMe} />
                                                <p class="searchTxt-cap">We’ll need permission to use your device’s location</p>
                                            </Form>)
                                        }
                                    </Formik>
                                </div>
                            </div>
                        </div>
                        <a class="cd-signin-modal__close js-close" onClick={() => setLocationModel(false)} >Close</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Location;