import React, { useEffect, useContext, useState } from 'react';
import { Formik } from "formik"
import { Button, Form } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import ApiService from '../../../services/api.service';
import moment from 'moment';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import './notification.css'
import useToast from '../../../commons/ToastHook';

const ConformDate = ({ 
    show, 
    setShow, 
    ohlSid, 
    nl, 
    updateNotification,
    fromMyTransaction = false,
}) => {
    const CurrentTimeZone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [pickupList, setPickupList] = useState([]);

    // populate pickup date slot list
    const getPickupList = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getPickUpDateList(ohlSid).then(
                response => {
                    spinner.hide();
                    setPickupList(response.data);
                },
                err => {
                    spinner.hide();
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on getPickupList()', err);
        }
    }

    /**  Confirm pickup date
     * @param {Object} slotData = selected slot time by buyer
    */
    const confirmPickupDate = (slotData) => {
        try {
            let payload = {
                "orderHasListingDeliveryScheduleSid": slotData.sid,
                "orderHasListingSid": ohlSid,
                "listingDistance": nl.notificationJson.listingDistance ? nl.notificationJson.listingDistance : null,
                "updatedOrderQuantity": nl.notificationJson.updatedQuantity ? nl.notificationJson.updatedQuantity : null
            }
            spinner.show("Please wait...");
            ApiService.confirmPickUpDate(payload).then(
                response => {
                    updateNotification(fromMyTransaction ? nl.notificationSid : nl.sid)
                    setShow(false);
                    Toast.success({ message: `Pickup date notified to seller`, time: 2000 });
                },
                err => {
                    spinner.hide();
                    setShow(false);
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            );
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error('error occur on confirmPickupDate()', err);
        }
    }



    // component init
    useEffect(() => {
        getPickupList();
    }, [])
    return (<div>
        <Modal {...{ show, setShow, className: "confirm-date-modal" }}>
            <div className="pickup-box confirm-date-modal">
                <div className="text-center">Confirm Pickup Date</div>
                <div className="text-center text-muted">
                    Confirm pickup dates for this order so that seller can meet You at the chosen location
                </div>
                <div className="border-top my10"></div>
                <div className="f12">Schedule a meeting with the seller</div>

                <Formik
                    initialValues={{
                        "selectedDay": "",
                        "selectedTime": ""
                    }}
                >
                    {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty }) => (<form onSubmit={handleSubmit}>
                        {
                            Array.isArray(pickupList)
                            && pickupList.length > 0
                            && <>
                                {/* for day1 */}
                                <div className="conform-box">
                                    <div className="conform-box-radio">
                                        {/* <Form.Check
                                            type="radio"
                                            name="dayslot"
                                        /> */}
                                    </div>
                                    <div className="conform-box-container">
                                        <div className="theme_color f13 pb10">{moment(pickupList[0].orderDeliveryOnFrom).format('LL')}</div>
                                        <div className="f12">
                                            {/* mapping time slot */}
                                            {
                                                pickupList.filter(d1 => d1.identity === "day1").map((slot, idx) => <Form.Check
                                                    type="radio"
                                                    key={idx}
                                                    id={slot.sid}
                                                    label={<div className={new Date(slot.orderDeliveryOnFrom) < new Date() ? "cp-none" : ""}>{`${moment(slot.orderDeliveryOnFrom).format('LT')} - ${moment(slot.orderDeliveryOnTo).format('LT')} (${CurrentTimeZone})`}</div>}
                                                    name="timeSlot"
                                                    onChange={() => {
                                                        setFieldValue("selectedDay", "day1");
                                                        setFieldValue("selectedTime", slot);
                                                    }}
                                                    disabled={new Date(slot.orderDeliveryOnFrom) < new Date()}
                                                />)
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* for day2 */}
                                <div className="conform-box">
                                    {/* <Form.Check
                                            type="radio"
                                            name="dayslot"
                                        /> */}
                                    <div className="conform-box-container">
                                        <div className="theme_color f13 pb10">{moment(pickupList[2].orderDeliveryOnFrom).format('LL')}</div>
                                        <div className="f12">
                                            {
                                                pickupList.filter(d1 => d1.identity === "day2").map((slot, idx) => <Form.Check
                                                    type="radio"
                                                    key={idx}
                                                    id={slot.sid}
                                                    value={slot}
                                                    label={<div className={new Date(slot.orderDeliveryOnFrom) < new Date() ? "cp-none" : ""}>{`${moment(slot.orderDeliveryOnFrom).format('LT')} - ${moment(slot.orderDeliveryOnTo).format('LT')} (${CurrentTimeZone})`}</div>}
                                                    name="timeSlot"
                                                    onChange={() => {
                                                        setFieldValue("selectedDay", "day2");
                                                        setFieldValue("selectedTime", slot);
                                                    }}
                                                    disabled={new Date(slot.orderDeliveryOnFrom) < new Date()}
                                                />)
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* for day3 */}
                                <div className="conform-box">
                                    {/* <Form.Check
                                            type="radio"
                                            name="dayslot"
                                        /> */}
                                    <div className="conform-box-container">
                                        <div className="theme_color f13 pb10">{moment(pickupList[4].orderDeliveryOnFrom).format('LL')}</div>
                                        <div className="f12">
                                            {
                                                pickupList.filter(d1 => d1.identity === "day3").map((slot, idx) => <Form.Check
                                                    type="radio"
                                                    key={idx}
                                                    id={slot.sid}
                                                    label={<div className={new Date(slot.orderDeliveryOnFrom) < new Date() ? "cp-none" : ""}>{`${moment(slot.orderDeliveryOnFrom).format('LT')} - ${moment(slot.orderDeliveryOnTo).format('LT')} (${CurrentTimeZone})`}</div>}
                                                    name="timeSlot"
                                                    onChange={() => {
                                                        setFieldValue("selectedDay", "day3");
                                                        setFieldValue("selectedTime", slot);
                                                    }}
                                                    disabled={new Date(slot.orderDeliveryOnFrom) < new Date()}
                                                />)
                                            }
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                        <Form.Group className="py20">
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
                            <Button variant="warning " className="btn-sm border-round aic jcc" disabled={!values.iconfirm || _.isEmpty(values.selectedTime) || isSubmitting || !dirty || !isValid} onClick={() => confirmPickupDate(values.selectedTime)}>Confirm Pickup Date</Button>
                        </div>
                    </form>)}
                </Formik>
            </div>
        </Modal>
    </div>)
}
export default ConformDate