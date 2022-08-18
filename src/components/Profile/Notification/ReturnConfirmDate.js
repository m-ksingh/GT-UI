import React, { useEffect, useContext, useState } from 'react';
import { Formik } from "formik"
import { Button, Form } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import ApiService from '../../../services/api.service';
import moment from 'moment';
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import classNames from 'classnames';
import './notification.css'

const ReturnConfirmDate = ({ show, setShow, returnDetailsSid, notificationSid, updateNotification = () => {} }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [pickupList, setPickupList] = useState([]);

    // populate return date slot list
    const getReturnSlotDateList = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getReturnDateSlots(returnDetailsSid).then(
                response => {
                    spinner.hide();
                    setPickupList(response.data);
                },
                err => {
                    spinner.hide();
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on getReturnSlotDateList()', err);
        }
    }

    // this method to confirm return date 
    const confirmReturnOrderDate = (values) => {
        try {
            spinner.show("Please wait...");
            let payload = {...values}
            ApiService.confirmReturnDate(payload.selectedSlot.sid).then(
                response => {
                    updateNotification(notificationSid)
                    setShow(false);
                    Toast.success({ message: `Return date notified to seller`, time: 2000 });
                },
                err => {
                    spinner.hide();
                    setShow(false);
                }
            );
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error('error occur on confirmReturnOrderDate()', err);
        }
    }

    // component init
    useEffect(() => {
        getReturnSlotDateList();
    }, [])
    
    return (<div>
        <Modal {...{ show, setShow, className: "pickup-container" }}>
            <div className="pickup-box return-confirm-date">
                <div className="text-center">Confirm Return Date</div>
                <div className="text-center text-muted pt20">
                    Confirm pickup date provided by the seller to return the item at FFL
                </div>
                <div className="f12 text-semi-bold py20">Select date to return</div>

                <Formik
                    initialValues={{
                        "selectedSlot": ""
                    }}
                    onSubmit={confirmReturnOrderDate}
                >
                    {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty }) => (<form onSubmit={handleSubmit}>
                        {
                            pickupList.map((slot, i) => <Form.Group>
                                <Form.Check
                                    key={i}
                                    id={slot.sid}
                                    type="radio"
                                    label={<span className={classNames("active-s-label", { "disable-s-label": (moment(slot.returnDateTime).format('YYYY-MM-DD') < (moment().format('YYYY-MM-DD'))) })}>{moment(slot.returnDateTime).format("LL")}</span>}
                                    name="timeSlot"
                                    onChange={() => {setFieldValue("selectedSlot", slot)}}
                                    disabled={(moment(slot.returnDateTime).format('YYYY-MM-DD') < (moment().format('YYYY-MM-DD')))}
                                />
                            </Form.Group>
                        )}
                        <div className="text-right mt-4 jce">
                            <Button type="submit" variant="warning" disabled={!isValid || !dirty} className="btn-sm border-round aic jcc">Confirm Return Date</Button>
                        </div>
                    </form>)}
                </Formik>
            </div>
        </Modal>
    </div>)
}
export default ReturnConfirmDate