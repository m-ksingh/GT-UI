import React, { useContext, useState } from 'react';
import _ from 'lodash';
import $ from 'jquery';
import { ErrorMessage, Field, Formik } from "formik";
import { Button, Form } from "react-bootstrap";
import Modal from "../../Shared/Modal";
import ApiService from '../../../services/api.service';
import Spinner from "rct-tpt-spnr";
import { ScheduleSchema, SelectItemSchemaWithSerial, SelectItemSchemaWithoutSerial } from './ValidationSchema/ValidationSchema';
import { NOTIFICATION_CONSTANTS } from './Constants/NotificationConstants';
import useToast from '../../../commons/ToastHook';
import SlotItem from './SlotItem';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import { IcnCalender, ICN_LIST } from '../../icons';
import './notification.css';



const tabWiseData = {
    selectItemsInfo: {},
    setPickupDates: {}
}
const SerialObj = {
    "listing": "",
    "serialNumber": ""
}


const PickUpDate = ({ 
    show, 
    setShow, 
    ohlSid, 
    updateNotification = () => {}, 
    nl,
    itemType = GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM,
    fromMyTransaction = false,
}) => {
    const FullTimeZone = new Date().toLocaleDateString(undefined, {day:'2-digit',timeZoneName: 'long' }).substring(4);
    const CurrentTimeZoneAbbr = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [viewType, setViewType] = useState((nl.notificationJson?.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || nl.notificationJson.adminToFFlStore) ? "selectItem" : "selectPickupDate");
    const [availableQuantity, setAvailableQuantity] = useState(nl.notificationJson?.availableQuantity);
    const [requestedQuantity] = useState(nl.notificationJson?.orderedQuantity);
    const [currenQuantity, setCurrenQuantity] = useState(nl.notificationJson?.orderedQuantity ? nl.notificationJson.orderedQuantity : 1);
    const [serialNumbers, setSerialNumbers] = useState([...Array(Number(requestedQuantity)).keys()].map((r, i) => ({"listing": `Item ${i+1}`, "serialNumber": ""})));
    const [selectedItemInfo, setSelectedItemInfo] = useState({});


    /** update selected time (hour. minutes, seconds) for selected date
    * @param {Object} values = values of selected data and time
    * @param {String} slotDate
    * @param {String} slotTime
    * @param {String} key
    */  
    const updateTime = (values, slotDate, slotTime, key) => {
        let tmpTime = "";
        try {
            let tmpDate = new Date(values[slotDate].date);
            let tStamp = tmpDate.setHours(values[slotDate][slotTime][key], 0, 0);
            tmpTime = new Date(tStamp).getTime();
        } catch (err) {
            console.error("Error occur when updateTime --- ", err);
        }
        return tmpTime;
    }

    /** this method trigger when seller schedule set pick up date
    * @param {Object} values = values of selected data and time
    */  
    const scheduledPickUp = (values) => {
        try {
            spinner.show("Please wait...");
            let payload = {
                "appUserType": nl.notificationJson?.appUserType,
                "quantity": selectedItemInfo.currentQuantity,
                "serialNumbers": JSON.stringify(selectedItemInfo.serialNumbers),
                "quantityReduced": selectedItemInfo.currentQuantity < requestedQuantity,
                "orderHasListingSid": ohlSid,
                "timing": [
                    {
                        "orderDeliveryOnFrom": updateTime(values, "slot1Date", "slot1Time", "from"),
                        "orderDeliveryOnTo": updateTime(values, "slot1Date", "slot1Time", "to"),
                        "identity": "day1"
                    },
                    {
                        "orderDeliveryOnFrom": updateTime(values, "slot1Date", "slot2Time", "from"),
                        "orderDeliveryOnTo": updateTime(values, "slot1Date", "slot2Time", "to"),
                        "identity": "day1"
                    },
                    {
                        "orderDeliveryOnFrom": updateTime(values, "slot2Date", "slot1Time", "from"),
                        "orderDeliveryOnTo": updateTime(values, "slot2Date", "slot1Time", "to"),
                        "identity": "day2"
                    },
                    {
                        "orderDeliveryOnFrom": updateTime(values, "slot2Date", "slot2Time", "from"),
                        "orderDeliveryOnTo": updateTime(values, "slot2Date", "slot2Time", "to"),
                        "identity": "day2"
                    },
                    {
                        "orderDeliveryOnFrom": updateTime(values, "slot3Date", "slot1Time", "from"),
                        "orderDeliveryOnTo": updateTime(values, "slot3Date", "slot1Time", "to"),
                        "identity": "day3"
                    },
                    {
                        "orderDeliveryOnFrom": updateTime(values, "slot3Date", "slot2Time", "from"),
                        "orderDeliveryOnTo": updateTime(values, "slot3Date", "slot2Time", "to"),
                        "identity": "day3"
                    }
                ]
            }
            ApiService.scheduledPickUpList(payload).then(
                response => {
                    updateNotification(fromMyTransaction ? nl.notificationSid : nl.sid);
                    setShow(false);
                    Toast.success({ message: 'Pick Up date set successfully', time: 2000});
                },
                err => {
                    spinner.hide();
                    setShow(false);
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
                }
            );
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error('error occur on scheduledPickUp()', err);
        }
    }

    const handleChangeQuantity = (values, setFieldValue, operation="increase") => {
        if(values.currentQuantity > 1 && operation === "decrease") {
            setFieldValue("currentQuantity", values.currentQuantity - 1);
            !_.isEmpty(values.serialNumbers) && values.serialNumbers.length > 1 && values.serialNumbers.pop();
            setFieldValue("serialNumbers", values.serialNumbers);
        } else if(values.currentQuantity < requestedQuantity && operation === "increase") {
            setFieldValue("currentQuantity", values.currentQuantity + 1)
            setFieldValue("serialNumbers", [...values.serialNumbers, {"listing": `Item ${values.serialNumbers.length + 1}`, "serialNumber": ""}])
        }
    }

    const handleSelectItem = (values) => {
        try {
            setSelectedItemInfo(values);
            setViewType("selectPickupDate");
        } catch (err) {
            console.error("Error occurred while handleSelectItem--", err);
        }
    }

    /**
     * checking for duplicate serial and disable submit and continue button
     * @param {Object} values = values of form
     * @returns isDuplicate = boolean value true either false
     */
    const findDuplicate = (values) => {
        let isDuplicate = false;
        try {
            if (values?.serialNumbers.length > 1) {
                values?.serialNumbers.map((s, i) => {
                    if (!isDuplicate)
                        isDuplicate = $(`#serial-number-inp-${i}`).hasClass('border-danger');
                })
            }
        } catch (err) {
            console.error("Error in findDuplicate--", err);
        }
        return isDuplicate;
    }

    return (<div className="schedule-pick-up select-item-pickup">
        <Modal {...{ show, setShow, className: "pickup-container" }}>
            <div className="pickup-box">
                <div className="text-center fw600">
                    {
                        nl.notificationJson.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || nl.notificationJson.adminToFFlStore
                        ? "Select Item & Pickup Date" 
                        : "Setup Pickup Dates"
                    }
                </div>
                {
                    nl.notificationJson?.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || nl.notificationJson.adminToFFlStore
                    ? <>
                        <div className="jcc f12 py20 px15">
                            <div>
                                <div className="jcc"><ICN_LIST /></div>
                                <div className={`scheduleLabel active-s-label`}>Select Item</div>
                            </div>
                            <div className={viewType === "selectItem" ? "schedule-label-divider" : "schedule-label-divider s-hr-line"}></div>
                            <div>
                                <div className="jcc"><IcnCalender {...{ width: "14.634", height: "16.725", fill: viewType === "selectItem" ? "#707070" : "#5ca017" }} /></div>
                                <div className={`scheduleLabel ${viewType !== "selectItem" ? "active-s-label" : ""}`}>Set Pickup Date</div>
                            </div>
                        </div>
                        {   viewType !== "selectItem"
                            && FullTimeZone 
                            && CurrentTimeZoneAbbr
                            && <div className="text-muted f12 my5">Timezone : <span className='fw600'>{FullTimeZone}{` (${CurrentTimeZoneAbbr})`}</span></div>
                        }
                        <div className="border-top my10"></div>
                    </> 
                    : <> 
                        <div className="text-center text-muted">
                            Set pickup dates for this order so that buyer can meet at the chosen location
                        </div>
                        <div className="border-top my10"></div>
                        <div className="text-muted f12 my5">Note : You can select any 3 days with 2 slots per day</div>
                        {
                            FullTimeZone 
                            && CurrentTimeZoneAbbr
                            && <div className="text-muted f12 my5">Timezone : <span className='fw600'>{FullTimeZone}{` (${CurrentTimeZoneAbbr})`}</span></div>
                        }
                    </>
                }
                {
                    viewType === "selectItem"
                    && <>
                        <Formik
                            initialValues={{
                                "currentQuantity": currenQuantity,
                                "serialNumbers": serialNumbers
                            }}
                            onSubmit={handleSelectItem}
                            validationSchema={itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM ? SelectItemSchemaWithSerial : SelectItemSchemaWithoutSerial}
                        >
                            {({ handleSubmit, isSubmitting, onChange, touched, errors, values, setFieldValue, validateField, isValid, dirty }) => <form onSubmit={handleSubmit}>
                                <div>
                                    <div className="aic my10 f13">
                                        <div className="br-ddd mr10 pr15">Available Qty : <span className="px5 fw600">{availableQuantity}</span></div>
                                        <div className="pl10">Requested Qty : <span className="px5 fw600">{requestedQuantity}</span></div>
                                    </div>
                                    <div className="magic-box">
                                        <div className="pt10 mb10 theme-color">Confirm Quantity to Sell<sup className="mandatory">*</sup></div>
                                        <div className="aic">
                                            <div className={`${values.currentQuantity == 1 ? "disabled" : ""} cp p-1`} disabled={currenQuantity == 1} onClick={() => {handleChangeQuantity(values, setFieldValue, "decrease")}}><i class="fa fa-minus-circle" aria-hidden="true"></i></div>
                                            <div className="px10">
                                                <Field 
                                                    name="currentQuantity"
                                                    // value={values.currenQuantity}
                                                    className="form-control"
                                                    // onChange={(e) => {
                                                    //     if(e.target.value > 1 && e.target.value < requestedQuantity)
                                                    //     setFieldValue("currentQuantity", e.target.value)
                                                    // }}
                                                    disabled
                                                />
                                            </div>
                                            <div className={`${values.currentQuantity == requestedQuantity ? "disabled" : ""} cp p-1`} disabled={currenQuantity == requestedQuantity} onClick={() => {handleChangeQuantity(values, setFieldValue, "increase")}}><i class="fa fa-plus-circle" aria-hidden="true"></i></div>
                                        </div>
                                    </div>
                                    <div className="f12 text-muted my15 pt10" >
                                        Note : Selected items will be blocked for this transaction and the respective quantity will not be visible for other buyers.
                                    </div>
                                    <div className="pick-serial-inputs">
                                        <div className="theme-color">Enter the Serial Number(s) {itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && <sup className="mandatory">*</sup>}</div>
                                        <div className="py10">
                                            {
                                                !_.isEmpty(values.serialNumbers) 
                                                && values.serialNumbers.map((res, i) => <div key={i} className="row f14 pb20">
                                                    <div className="col-3 pt5">{`Item ${i+1}`}{itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && <sup className="mandatory">*</sup>}</div>  
                                                    <div className="col-9">
                                                        <Field 
                                                            name={`serialNumbers.${i}.serialNumber`} 
                                                            type="text"
                                                            onChange={(e) => {
                                                                let a= e.target.value.replace(/\s+/g, ' ').trim();
                                                                setFieldValue(`serialNumbers.${i}.serialNumber`, a);
                                                             }}
                                                            id={`serial-number-inp-${i}`}
                                                            className={`form-control ${values?.serialNumbers.length > 1 && values.serialNumbers[i].serialNumber && values?.serialNumbers.some((r, idx) => (i !== idx && r.serialNumber === values.serialNumbers[i].serialNumber)) ? "border-danger" : ""}`}
                                                        />
                                                        {
                                                            values?.serialNumbers.length > 1 
                                                            && values.serialNumbers[i].serialNumber 
                                                            && values?.serialNumbers.some((r, idx) => (i !== idx && r.serialNumber === values.serialNumbers[i].serialNumber)) 
                                                            && <div className="text-danger mb-2 small-text">Duplicate serial number</div>
                                                        }
                                                        <ErrorMessage component="div" name={`serialNumbers.${i}.serialNumber`} className="text-danger mb-2 small-text" />
                                                    </div>  
                                                    
                                                </div>)
                                            }
                                        </div>
                                    </div>
                                </div>  
                                <div className="text-right mt-4 jce">
                                    <Button 
                                        type="submit" 
                                        variant="warning" 
                                        disabled={
                                            isSubmitting 
                                            || (itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && !dirty )
                                            || !isValid 
                                            || findDuplicate(values)
                                        } 
                                        className="btn-sm border-round aic jcc"
                                    >{"Select & Continue"}</Button>
                                </div>
                            </form>}
                        </Formik>
                    </>
                }
                {
                    viewType !== "selectItem"
                    &&  <>
                        <Formik
                            initialValues={NOTIFICATION_CONSTANTS.SCHEDULE_INITIAL_VALUE}
                            onSubmit={scheduledPickUp}
                            validationSchema={ScheduleSchema}
                        >
                            {({ handleSubmit, isSubmitting, touched, errors, values, setFieldValue, validateField, isValid, dirty }) => <form onSubmit={handleSubmit}>
                                <SlotItem {...{values, setFieldValue, label:"Day 1", slotDate:"slot1Date", excludeDates: [values.slot2Date.date, values.slot3Date.date], validateField}} />
                                <SlotItem {...{values, setFieldValue, label:"Day 2", slotDate:"slot2Date", excludeDates: [values.slot1Date.date, values.slot3Date.date], validateField}} />
                                <SlotItem {...{values, setFieldValue, label:"Day 3", slotDate:"slot3Date", excludeDates: [values.slot1Date.date, values.slot2Date.date], validateField}} />
                                <Form.Group className="py20 f12">
                                    <Form.Check
                                        id="confirm-date-agree"
                                        type="checkbox"
                                        checked={values.iconfirm}
                                        name="iconfirm"
                                        label="If you fail to show up on the slot, no show fees will be charged"
                                        onChange={(e) => { setFieldValue("iconfirm", e.target.checked) }}
                                    />
                                </Form.Group>
                                <div className="text-right mt-4 jce">
                                    <Button type="submit" variant="warning" disabled={!values.iconfirm || isSubmitting || !dirty || !isValid}  className="btn-sm border-round aic jcc">Set Pickup Date</Button>
                                </div>
                            </form>}
                        </Formik>
                    </>
                }
            </div>
        </Modal>
    </div>)
}
export default PickUpDate