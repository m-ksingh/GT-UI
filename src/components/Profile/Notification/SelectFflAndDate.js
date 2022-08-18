import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../../contexts/AppContext';
import { Button, Form } from 'react-bootstrap';
import Modal from "../../Shared/Modal"
import { Formik } from "formik";
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import './notification.css'
import _ from 'lodash';
import ApiService from '../../../services/api.service';
import GMap from '../../GMap/GMap';
import { DateInput } from '../../Shared/InputType';
import { IcnCalender, IcnLocation } from '../../icons';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import { MAP_API_KEY } from '../../../commons/utils';

const SelectFflAndDate = ({
    show,
    setShow,
    nl,
    updateNotification = () => { },
    fromMyTransaction = false,
}) => {
    const { location } = useContext(AppContext);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [viewType, setViewType] = useState("FFL");
    const [zipCode, setZipCode] = useState("");
    const [listOfFFLStore, setListOfFFLStore] = useState([]);
    const [userTypes, setuserTypes] =useState(false);
    const [myLocation, setMyLocation] = useState({
        address: (!_.isEmpty(location?.address) && { ...location.address }) || "",
        location: (!_.isEmpty(location?.position) && { ...location.position, lng: location?.position?.lng || location?.position?.lon }) || { lat: 0, lng: 0 }
    });

    const [licSeqnNumber, setLicSeqnNumber] = useState('');

    const [initValues, setInitValues] = useState({
        "returnDetailsSid": nl?.notificationJson?.returnDetailsSid ? nl.notificationJson.returnDetailsSid : "",
        "returnFflStore": nl?.notificationJson?.deliveryLocation ? JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location) : "",
        "slots": [
            {
                "returnDateTime": null,
                "slot": "day1"
            },
            {
                "returnDateTime": null,
                "slot": "day2"
            },
            {
                "returnDateTime": null,
                "slot": "day3"
            }
        ]

    });


    // get ffl store list by zip code
    const initFFLStoreList = (zipCode) => {
        spinner.show("Please wait...");
        ApiService.fflStoreListByZipCode(zipCode).then(
            response => {
                 setListOfFFLStore(response.data);
                 let data = response.data;
                 insertAndShift(data);
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.message || err.response.data.error || err.response.data.status) : 'Internal server error! Please try after sometime.', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    // this method trigger when click on select ffl and date to schedule ffl and date for return order request
    const scheduleConfirmReturnOrder = (values) => {
        try {
            spinner.show("Scheduling return order request... Please wait...");
            let payload = { ...values };
            payload.returnFflStore = JSON.stringify(listOfFFLStore[payload.returnFflStore]);
            ApiService.scheduleOrderReturn(payload).then(
                response => {
                    updateNotification(fromMyTransaction ? nl.notificationSid : nl.sid);
                    setShow(false);
                    Toast.success({ message: "Return order scheduled successfully" });
                },
                err => {
                    setShow(false);
                    spinner.hide();
                    console.error("Error occur when scheduleConfirmReturnOrder--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error("Error occur when scheduleConfirmReturnOrder--", err);
        }
    }

    //  get location by zipcode 
    const getGeoLocationByZipcode = (zip) => {
        ApiService.getLocationByPin({
            "key": MAP_API_KEY,
            "zipCode":zip
        }).then(res=>{
            if(res.data.results.length && res.data.results[0]) {
                setMyLocation({
                    address: res.data.results[0].address,
                    location: {...res.data.results[0].position, "lng": res.data.results[0].position?.lng || res.data.results[0].position?.lon},
                })
            }
        });
    }

    useEffect(() => {
        if (_.isEmpty(zipCode) || zipCode.length < 5) {
            return;
        }
        initFFLStoreList(zipCode);
        getGeoLocationByZipcode(zipCode);
    }, [zipCode])

    useEffect(() => {
        try {
            setZipCode(JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseZipCode || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premZipCode);
            setLicSeqnNumber(JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).licSeqn);
            if(nl?.notificationJson.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || nl?.notificationJson.adminToFFlStore)
            setuserTypes(true);
        } catch (err) {
            console.error("Exception occurred in useEffect[nl] -- ", err);
        }
    }, [nl])
    
    const insertAndShift = (data) => {
        try {
            let from = data.findIndex((element) => element.licSeqn === licSeqnNumber);
            data.push(...data.splice(0, from));
            setListOfFFLStore(data);
        } catch (err) {
            console.error("Exception occurred in insertAndShift -- ", err);
        }
    }

    return <Modal {...{ show, setShow, className: "pickup-container" }}>
        <Formik
            enableReinitialize={true}
            initialValues={initValues}
            onSubmit={(values) => { scheduleConfirmReturnOrder(values) }}
        >
            {({ handleSubmit, handleChange, isSubmitting, touched, errors, values, setFieldValue, validateField, isValid, dirty }) => <form onSubmit={handleSubmit}>
            
                <div className="py20">
                    <div className="jcc f14 text-semi-bold">{viewType === "FFL" ? "Select FFL Store" : "Set Return Date"}</div>
                    <div className="jcc f12 py20 px15">
                        <div>
                            <div className="jcc"><IcnLocation {...{ width: "14", height: "20", fill: "#5ca017" }} /></div>
                            <div className={`scheduleLabel active-s-label`}>Select FFL Store</div>
                        </div>
                        <div className={viewType === "FFL" ? "schedule-label-divider" : "schedule-label-divider s-hr-line"}></div>
                        <div>
                            <div className="jcc"><IcnCalender {...{ width: "14.634", height: "16.725", fill: viewType === "FFL" ? "#707070" : "#5ca017" }} /></div>
                            <div className={`scheduleLabel ${viewType !== "FFL" ? "active-s-label" : ""}`}>Select Return Date</div>
                        </div>
                    </div>

                    {
                        viewType === "FFL" && <>
                            <div className="px10">
                                <Form.Group >
                                    <div class="col d-flex delivery-zip-block">
                                        <div class="deliveryLocation">
                                            <div>
                                                <input
                                                    type="text"
                                                    required="required"
                                                    placeholder="Enter Zipcode"
                                                    class="form-control full-w"
                                                    name="zipCode"
                                                    value={zipCode}
                                                    id="selectZipCodeFFL"
                                                    disabled={userTypes}
                                                    onBlur={handleChange}
                                                    onChange={(e) => { if (!isNaN(e.target.value) && e.target.value.length <= 5) { 
                                                         setZipCode(e.target.value); 
                                                    } }}
                                                />
                                            </div>
                                        </div>
                                        <Form.Group className="text-left">
                                            <Form.Control as="select"
                                                className="deliver-location-list"
                                                name="returnFflStore"
                                                value={values?.returnFflStore ? values.returnFflStore : "0"}
                                                onChange={handleChange}
                                                disabled={userTypes}
                                            >
                                                {listOfFFLStore?.map((list, index) => {
                                                    return (
                                                        <option
                                                            key={index}
                                                            name={
                                                                list.storeName || list.licHolderName
                                                            }
                                                            value={index}
                                                        >
                                                            {`${list.storeName || list.licHolderName}, ${list.premCity}, ${list.premState}`}
                                                        </option>
                                                    );
                                                })}
                                                {/* <option value=""> - Select Location - </option>
                                                {listOfFFLStore?.map((list, index) => {
                                                    return <option key={index} name={list.storeName || list.licHolderName} value={index}>{list.storeName || list.licHolderName}</option>
                                                })} */}
                                            </Form.Control>
                                            {!listOfFFLStore.length && <div class="invalid-feedback display-block">There are no FFL store found in this location</div>}
                                        </Form.Group>
                                    </div>
                                </Form.Group>
                            </div>
                            <p class="text-center f12">Or Select from Map</p>
                            <GMap {...{
                                zipCode,
                                setZipCode,
                                setMyLocation,
                                setListOfFFLStore,
                                currLatLng: myLocation.location,
                                showMapSearch: false,
                            }} />
                        </>
                    }
                    {
                        viewType !== "FFL" && <div className="px20">
                            <div className="row aic jic mb20">
                                <div className="col-xs-12 col-sm-2 col-md-2 theme_color f12">{"Slot1"}<span className="mandatory pl5">*</span></div>
                                <div className="col-xs-12 col-sm-10 col-md-10">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DateInput 
                                                name={`slots[0].returnDateTime`} 
                                                className="form-control form-control-sm" 
                                                label="" minDate={new Date()} 
                                                maxDate={new Date().setDate(new Date().getDate() + GLOBAL_CONSTANTS.DEFAULT_FUTURE_DAY_LIMIT)}
                                                excludeDates={[values.slots[1].returnDateTime, values.slots[2].returnDateTime]} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row aic jic mb20">
                                <div className="col-xs-12 col-sm-2 col-md-2 theme_color f12">{"Slot2"}<span className="mandatory pl5">*</span></div>
                                <div className="col-xs-12 col-sm-10 col-md-10">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DateInput 
                                                name={`slots[1].returnDateTime`} 
                                                className="form-control form-control-sm" 
                                                label="" minDate={new Date()}
                                                maxDate={new Date().setDate(new Date().getDate() + GLOBAL_CONSTANTS.DEFAULT_FUTURE_DAY_LIMIT)}
                                                excludeDates={[values.slots[0].returnDateTime, values.slots[2].returnDateTime]} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row aic jic mb20">
                                <div className="col-xs-12 col-sm-2 col-md-2 theme_color f12">{"Slot3"}<span className="mandatory pl5">*</span></div>
                                <div className="col-xs-12 col-sm-10 col-md-10">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <DateInput 
                                                name={`slots[2].returnDateTime`} 
                                                className="form-control form-control-sm" 
                                                label="" 
                                                minDate={new Date()} 
                                                maxDate={new Date().setDate(new Date().getDate() + GLOBAL_CONSTANTS.DEFAULT_FUTURE_DAY_LIMIT)}
                                                excludeDates={[values.slots[0].returnDateTime, values.slots[1].returnDateTime]} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="jcc pt20">
                        <div className="jcb">
                            <Button variant="outline" className="f12 return-s-cancel-btn mr10" onClick={() => setShow(false)}>Cancel</Button>
                            {viewType === "FFL" && <Button
                                variant="success"
                                className=" submt-btn-dark f12"
                                onClick={() => { setViewType("SELECT_DATE") }}
                                disabled={!isValid || !listOfFFLStore.length}
                            >{'Select & Continue'}</Button>
                            }
                            {
                                viewType !== "FFL" && <Button
                                    variant="success"
                                    className=" submt-btn-dark f12"
                                    onClick={() => { scheduleConfirmReturnOrder(values) }}
                                    disabled={(!values.slots[0].returnDateTime || !values.slots[1].returnDateTime || !values.slots[2].returnDateTime)}
                                >{'Select & Submit'}</Button>
                            }

                        </div>
                    </div>
                </div>
            </form>}
        </Formik>
    </Modal>;
}

export default SelectFflAndDate;