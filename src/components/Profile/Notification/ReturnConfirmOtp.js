import React, { useEffect, useState, useContext, useRef} from 'react';
import { Formik } from "formik"
import { Button } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import ApiService from '../../../services/api.service';
import OtpInput from 'react-otp-input'
import { NOTIFICATION_CONSTANTS } from './Constants/NotificationConstants';
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import './notification.css'

const ReturnConfirmOtp = ({ 
    show, 
    setShow, 
    nl, 
    orderDetailsSid,
    onSuccess= () => {},
    requestAgain = () => {},
}) => {
    const returnTimerRef = useRef();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [otp, setOtp] = useState("");
    const [timerExpired, setTimerExpired] = useState(false);
    const [timer, setTimer] = useState(GLOBAL_CONSTANTS.OTP_EXP_LIMIT);
    const [invalid, setInvalid] = useState(null);

    const updateTimer = () => {
        setTimer(prevTimer => prevTimer - 1)
    }

    /**  this method trigger when buyer authenticate seller's otp
     * @param {String} otp = otp of seller
     * @param {String} ohl = order has listing sid
    */
    const completeOrderReturn = (otp = "") => {
        try {
            spinner.show("Please wait...");
            ApiService.completeOrderReturn(orderDetailsSid, otp).then(
                response => {
                    onSuccess();
                    Toast.success({ message: `Item returned successfully`, time: 2000 });
                },
                err => {
                    spinner.hide();
                    if(err && (err.response.status === 406 || err.response.status === 401)) {
                        setInvalid(true);
                    } else {
                        setShow(false);
                        Toast.error({ message: err?.response?.error || err?.response?.message || "", time: 3000 });
                    }
                    console.error('error occur on completeOrderReturn()', err);
                }
            );
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error('error occur on completeOrderReturn()', err);
        }
    }

      /**  this method trigger when buyer authenticate seller's otp
     * @param {String} otp = otp of seller
     * @param {String} ohl = order has listing sid
    */
       const completeShipmentTransaction = (otp = "") => {
        try {
            spinner.show("Please wait...");
            ApiService.completeTransaction(orderDetailsSid, otp).then(
                response => {
                    onSuccess();
                    Toast.success({ message: `Order delivered successfully`, time: 2000 });
                },
                err => {
                    spinner.hide();
                    if(err && (err.response.status === 406 || err.response.status === 401)) {
                        setInvalid(true);
                    } else {
                        setShow(false);
                        Toast.error({ message: err?.response?.error || err?.response?.message || "", time: 3000 });
                    }
                    console.error('error occur on completeShipmentTransaction()', err);
                }
            );
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error('error occur on completeShipmentTransaction()', err);
        }
    }

    useEffect(() => {
        if (timer === 0) {
          clearInterval(returnTimerRef.current);
          setTimerExpired(true);
        }
    }, [timer])

    useEffect(() => {
        returnTimerRef.current = setInterval(() => updateTimer(), 1000);
    }, [])

    return (<div>
        <Modal {...{ show, setShow, className: "pickup-container" }}>
                <div className="pickup-box">
                    <div className="">{nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED ? "Complete Purchase" : "Complete Return"}</div>
                    <div className="border-top my10"></div>
                        <Formik>
                            {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty }) => (<form>
                                <div className="am-otp-label">{nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED ? "Enter the 4-Digit Secret Code provided by the FFL" : "Enter the 4-Digit Return Code provided by the FFL"}<span className="mandatory">*</span></div>
                                <div className="otp-inp-box jcc">
                                    <div>
                                        <OtpInput
                                            value={otp}
                                            onChange={(o) => {setOtp(o); setInvalid(false)}}
                                            numInputs={4}
                                            shouldAutoFocus={true}
                                            inputStyle="otp-inp"
                                            isInputNum={true}
                                        />
                                        <div className="py10 pb5">
                                            {invalid && <div className="text-danger f12">Incorrect OTP! Please re-enter.</div>}
                                        </div>
                                        {
                                            timerExpired
                                            ? <div className="text-danger f12 pt20 jcc fdc">
                                                    <div className="text-danger f11">Secret code expired! Click below button to request new secret code.</div>
                                                    <button className="btn btn-sm btn-outline-info" onClick={() => {
                                                        setOtp(""); 
                                                        setTimer(GLOBAL_CONSTANTS.OTP_EXP_LIMIT);
                                                        setTimerExpired(false);
                                                        requestAgain();
                                                        setInvalid(false);
                                                        returnTimerRef.current = setInterval(() => updateTimer(), 1000);
                                                    }}>Requst Secret Code</button>
                                                </div>
                                            : <div className="c666 f12 mt20 fw600 jcc" ref={returnTimerRef}>OTP expires in {timer} Seconds.</div>
                                        }
                                    </div>
                                </div>
                                <div className="my10">
                                    <Button 
                                        variant="success" 
                                        className="btn-block f16 theme_background" 
                                        disabled={(otp === '') || (otp && otp.length < 4) ? true : false || invalid} 
                                        onClick={() => {
                                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED 
                                            ? completeShipmentTransaction(otp) 
                                            : completeOrderReturn(otp)
                                        }}>Submit the code</Button>
                                </div>
                            </form>)}
                        </Formik>
                </div>
            </Modal>
    </div>)
}
export default ReturnConfirmOtp