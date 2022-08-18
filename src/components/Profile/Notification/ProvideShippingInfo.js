import React, { useContext } from 'react';
import { ErrorMessage, Field, Formik } from "formik";
import { Button, Form } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import ApiService from '../../../services/api.service';
import Spinner from "rct-tpt-spnr";
import { ProvideShippingSchema } from './ValidationSchema/ValidationSchema';
import useToast from '../../../commons/ToastHook';
import { DateInput } from '../../Shared/InputType';
import { IcnLocation } from '../../icons';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import './notification.css'


const ProvideShippingInfo = ({ 
    show, 
    setShow, 
    orderDetailsSid, 
    updateNotification, 
    nl,
    fromMyTransaction = false,
}) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);


    /** this method trigger when seller schedule set pick up date
    * @param {Object} values = values of selected data and time
    */  
    const submitShippingInfo = (values) => {
        try {
            spinner.show("Please wait...");
            let payload = {...values};
            payload.orderDetailsSid = orderDetailsSid;
            payload.fflLocation = JSON.stringify(payload.fflLocation)
            payload.trackingUrl = JSON.stringify(payload.trackingUrl);
            ApiService.provideShippingInfo(payload).then(
                response => {
                    updateNotification(nl?.notificationSid || nl.sid);
                    setShow(false);
                    Toast.success({ message: 'Shipping info provided successfully', time: 2000});
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
            console.error('error occur on submitShippingInfo()', err);
        }
    }

    return (<div className="schedule-pick-up provide-shipping-info">
        <Modal {...{ show, setShow, className: "pickup-container" }}>
            <div className="pickup-box">
                <div className="text-center text-semi-bold ls-05 pb20">Provide Shipping Info</div>
                <Formik
                    initialValues={{
                        "estimatedDeliveryDate": "",
                        "fflLocation": nl?.notificationJson?.deliveryLocation 
                            && JSON.parse(nl.notificationJson.deliveryLocation).location
                            && JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location) 
                            ? `${
                                    JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).storeName
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).licHolderName
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflStoreName 
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).name 
                                    || ""
                                }, ${
                                    JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premCity
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseCity
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseCity
                                    || ""
                                }, ${
                                    JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premState
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseState 
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseState
                                    || ""
                                    
                                }, ${
                                    JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premZipCode
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseZipCode
                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseZipCode 
                                    || ""
                                    
                                }` 
                            : "",
                        "orderDetailsSid": orderDetailsSid ? orderDetailsSid : null,
                        "shipmentCharges": nl?.notificationJson?.isShippingFeeBasedOnLocation && JSON.parse(nl.notificationJson.isShippingFeeBasedOnLocation) ?  "" : nl?.notificationJson?.fixedShippingFee || 0,  
                        "shipmentPartnerName": "",
                        "shippedDate": "",
                        "trackingId": "",
                        "trackingUrl": ""
                    }}
                    onSubmit={submitShippingInfo}
                    validationSchema={ProvideShippingSchema}
                >
                    {({ handleSubmit, isSubmitting, touched, errors, values, setFieldValue, validateField, isValid, dirty }) => <form onSubmit={handleSubmit}>
                        <div>
                            <Form.Group>
                                <h5 className="label-head">Shipment Partner Name<sup>*</sup></h5>
                                <Field className="form-control" name="shipmentPartnerName" />
                                <ErrorMessage component="span" name="shipmentPartnerName" className="text-danger mb-2 small-text" />
                            </Form.Group>
                            <Form.Group>
                                <h5 className="label-head">Tracking ID<sup>*</sup></h5>
                                <Field className="form-control" name="trackingId" />
                                <ErrorMessage component="span" name="trackingId" className="text-danger mb-2 small-text" />
                            </Form.Group>
                            <Form.Group>
                                <h5 className="label-head">Tracking URL<sup>*</sup></h5>
                                <Field className="form-control" name="trackingUrl" />
                                <ErrorMessage component="span" name="trackingUrl" className="text-danger mb-2 small-text" />
                            </Form.Group>
                            <Form.Group>
                                <h5 className="label-head">FFL Location<sup>*</sup></h5>
                                <div className="p-rel">
                                    <div className="icn-location-div"><IcnLocation /></div>
                                    <Field className="form-control pl30 pt10" name="fflLocation" disabled/>
                                </div>
                                <ErrorMessage component="span" name="fflLocation" className="text-danger mb-2 small-text" />
                            </Form.Group>
                            <div className="jcb">
                                <Form.Group className="">
                                    <h5 className="label-head">Shipped Date<sup>*</sup></h5>
                                    <DateInput 
                                        name="shippedDate" 
                                        className="form-control" 
                                        dateFormat="MM-dd-yyyy" 
                                        minDate={new Date()} 
                                        maxDate={new Date().setDate(new Date().getDate() + GLOBAL_CONSTANTS.DEFAULT_FUTURE_DAY_LIMIT)}
                                        onChange={() => setFieldValue("estimatedDeliveryDate", "")}
                                    />
                                    <ErrorMessage component="span" name="shippedDate" className="text-danger mb-2 small-text" />
                                </Form.Group>
                                <Form.Group>
                                    <h5 className="label-head">Estimated Delivery Date<sup>*</sup></h5>
                                    <DateInput 
                                        name="estimatedDeliveryDate" 
                                        className="form-control" 
                                        dateFormat="MM-dd-yyyy" 
                                        minDate={values?.shippedDate ? values?.shippedDate : new Date()} 
                                        maxDate={values?.shippedDate 
                                            ? new Date(values.shippedDate).setDate(new Date(values.shippedDate).getDate() + GLOBAL_CONSTANTS.DEFAULT_FUTURE_DAY_LIMIT)
                                            : new Date().setDate(new Date().getDate() + GLOBAL_CONSTANTS.DEFAULT_FUTURE_DAY_LIMIT)}
                                        disabled={!values?.shippedDate}
                                    />
                                    <ErrorMessage component="span" name="estimatedDeliveryDate" className="text-danger mb-2 small-text" />
                                </Form.Group>
                            </div>
                            <Form.Group className="col-4 px-0">
                                <h5 className="label-head">Shipment Charges{nl.notificationJson.isFreeShipping
                                    && !JSON.parse(nl.notificationJson.isFreeShipping) && <sup>*</sup>}</h5>
                                {
                                    nl.notificationJson.isFreeShipping
                                    && JSON.parse(nl.notificationJson.isFreeShipping)
                                    ? <div className="fw600">Free Shipping</div>
                                    : <>
                                        <div className="aic">
                                        <div className="mr5">$</div>
                                        <Field 
                                            className="form-control" 
                                            name="shipmentCharges" 
                                            disabled={nl?.notificationJson?.isShippingFeeBasedOnLocation && !JSON.parse(nl.notificationJson.isShippingFeeBasedOnLocation)}
                                        />
                                    </div>
                                    <ErrorMessage component="span" name="shipmentCharges" className="text-danger mb-2 small-text pl15" />     
                                    </>
                                }
                                
                            </Form.Group>
                        </div>
                        <div className="text-right mt-4 jce">
                            <Button type="submit" variant="warning" disabled={isSubmitting || !dirty || !isValid}  className="btn-sm border-round aic jcc">Submit</Button>
                        </div>
                    </form>}
                </Formik>
            </div>
        </Modal>
    </div>)
}
export default ProvideShippingInfo