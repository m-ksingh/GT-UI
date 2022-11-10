import React, { useEffect, useState, useContext, useRef } from 'react';
import { Formik } from "formik"
import { Button } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import ApiService from '../../../services/api.service';
import OtpInput from 'react-otp-input';
import { useAuthState } from "../../../contexts/AuthContext/context";
import { NOTIFICATION_CONSTANTS } from './Constants/NotificationConstants';
import Spinner from "rct-tpt-spnr";
import './notification.css'
import useToast from '../../../commons/ToastHook';
import haversine from 'haversine-distance';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';

const AuthenticateMeet = ({
    show,
    setShow,
    nl,
    updateNotification = () => { },
    onSuccess = () => { },
    type,
    requestAgain = () => { },
    fromMyTransaction = false
}) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const timerRef = useRef();
    const [otp, setOtp] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [invalid, setInvalid] = useState(null);
    const [timerExpired, setTimerExpired] = useState(false);
    const [timer, setTimer] = useState(GLOBAL_CONSTANTS.OTP_EXP_LIMIT);
    const [dealSuccess, setDealSuccess] = useState(false);
    const [otpExpireCount, setOtpExpireCount] = useState(0);
    const [latitude1, setLatitude] = useState(0);
    const [longitude1, setLongitude] = useState(0);
    const [flag, setFlag] = useState(0);
    const [orderDetails, setOrderDetails] = useState([]);
   
    const userDetails = useAuthState();
    let latitude = null, longitude = null
    let distanceInMeters=0;
    

    const updateTimer = () => {
        setTimer(prevTimer => prevTimer - 1)
    }

    /**  this method trigger when seller authenticate buyer's otp
     * @param {String} otp = otp of buyer
     * @param {String} ohl = order has listing sid
    */
    const validateOtp = ({ otp = "", ohl = "" }) => {
        try {
            ApiService.authenticateOtp(otp, ohl).then(
                response => {
                    onSuccess();
                    setShow(false);
                },
                err => {
                    if (err && err.response.status === 403) {
                        setInvalid(true);
                    } else {
                        setShow(false);
                        Toast.error({ message: err.response.message || err.response.error || err.response.status, time: 2000 });
                    }
                }
            );
        } catch (err) {
            setShow(false);
            console.error('error occur on validateOtp()', err);
        }
    }

    const getAllOrders = async(ohl) => {
        
        let point1 = {}, point2 = {};
        const userSid = userDetails.user.sid;

        
        console.log("apne func k and")
        console.log(latitude)
        console.log(longitude)

        point1["lat"] = latitude;
        point1["lng"] = longitude;
       
        const response = await ApiService.getLocationByOrderid(ohl);
        

        console.log("new response:" +  response.data.latitude)
        console.log("new response:" +  response.data.longitue)
        point2["lat"] = response.data.latitude;
        point2["lng"] = response.data.longitue;

        distanceInMeters=parseInt(haversine(point1, point2));
        console.log(distanceInMeters);
        if (distanceInMeters > 100) {
            setFlag(0);
            Toast.error({
                message: `You are yet to arrive at the location, you are ${distanceInMeters - 100} meters away`,
                time: 6000,
            });
            
        }
        else {
            setFlag(1);
            Toast.success({
                message: `You have arrived at the location, you are within ${100 - distanceInMeters} meters`,
                time: 6000,
            });
            
        }
       
    };

    function Notreached() {
        return <p className="am-otp-label mt-3 mb-2" style={{ color: "#FD0902" }}>You have not arrived yet!</p>;
      }

    
    // this method trigger to generate otp
    const generateOTP = async(ohl, latitude, longitude, isPermissionGranted) => {
        try {
            spinner.show("Please wait...");
            
                ApiService.arrivedBuyerWithLocation(ohl, { latitude, longitude, isPermissionGranted }).then(
                    response => {
                        spinner.hide();
                        setShow(true);
                        timerRef.current = setInterval(() => updateTimer(), 1000);
                        setOtp(response.data.otp);
                    },
                    err => {
                        spinner.hide();
                        if (err && err.response.status === 406) {
                            setDealSuccess(true);
                        } else {
                            Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                        }
                    }
                );
            
       }
        catch (err) {
            console.error("Error in generateOTP---", err)
        }
    }

    /**  this method trigger when buyer click on i have arrived
    * @param {String} ohl = order has listing sid
    */
    const buyerArrive = async (ohl) => {
        try {
            spinner.show("Please wait...");
            // To get live location of user
            const asyncGetCurrentPosition = options => new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

           let isPermissionGranted = false;
            try {
                let { coords } = await asyncGetCurrentPosition({ timeout: 3000 });
                console.log("ye unka")
                console.log(coords)
                latitude = coords?.latitude;
                longitude = coords?.longitude;
                console.log("Lat:"+latitude)
                console.log("Long:"+longitude)

                console.log("Cordsl:"+coords.latitude)
                console.log("Cordsla:"+coords.longitude)

                setLongitude(coords.longitude);
                setLatitude(coords.latitude);
                console.log("ye hmara"+latitude1)
                console.log("ye long hmara"+longitude1);
                isPermissionGranted = true;
            } catch (err) {
                // Current location of client was not retrieved
            }
            getAllOrders(nl.notificationJson.orderDetailsSid);
            
            generateOTP(ohl, latitude, longitude, isPermissionGranted);
           
        } catch (err) {
            spinner.hide();
            Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            console.error('error occur on buyerArrive()', err);
        }
    }

    /**
     * This method used to mark the delivery completed
     * @param {String} sid - Notification sid 
     */
    const completeDelivery = (sid) => {
        const hideModals = () => {
            spinner.hide();
            setShowConfirmation(false);
            setShow(false);
        }

        try {
            spinner.show("Please wait...");
            ApiService.completeDelivery(sid).then(
                response => {
                    hideModals();
                    onSuccess();
                },
                err => {
                    hideModals();
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.message) : 'API Failed', time: 2000 });
                }
            );
        } catch (err) {
            hideModals();
            Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.message) : 'API Failed', time: 2000 });
            console.error('error occur on completeDelivery()', err);
        }
    }

    const OtpExpire = () => {
        try {
            let defaultCount = otpExpireCount;
            setOtpExpireCount(defaultCount + 1);
        } catch (err) {
            console.error("Error in OtpExpire---", err)
        }
    }

    useEffect(() => {
        if (timer === 0) {
            clearInterval(timerRef.current);
            setTimerExpired(true);
        }
    }, [timer,flag])

    useEffect(() => {
        if (nl && type === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER) {
            buyerArrive(nl.notificationJson.ohl);
        }

    }, [type])

    return (<div>
        {
            !showConfirmation
            && <Modal {...{ show, setShow, className: "pickup-container" }}>
                <div className="pickup-box">
                    <div className="">Authenticate the Meet</div>
                    <div className="border-top my10"></div>
                    {
                        type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER
                            ? <Formik>
                                {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty }) => (<form>
                                    <div className="am-otp-label">Enter the 4-Digit Meeting Code provided by the {type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? " buyer " : " seller "}<span className="mandatory">*</span></div>
                                    <div className="otp-inp-box jcc">
                                      {console.log("flag val:",flag)}
                                   <div>
                                            <OtpInput
                                                value={otp}
                                                onChange={(o) => { setOtp(o); setInvalid(false); }}
                                                numInputs={4}
                                                shouldAutoFocus={true}
                                                inputStyle="otp-inp"
                                                isInputNum={true}
                                            />
                                            {
                                                otpExpireCount < 3 && invalid && <div className="text-danger py10 f12">Incorrect OTP! Please re-enter.</div>
                                            }
                                            {
                                                (otpExpireCount >= 3) && <div className="text-danger py10 f12">You have entered OTP 3 times incorrectly. Please ask the buyer to generate new OTP and try again.</div>
                                            }
                                        </div>
                                    </div>
                                    <div className="my10">
                                        <Button
                                            variant="success"
                                            className="btn-block f16 theme_background"
                                            disabled={(otp === '') || (otp && otp.length < 4) ? true : false || invalid}
                                            onClick={() => {
                                                validateOtp({ otp, ohl: nl.notificationJson.ohl });
                                                OtpExpire();
                                            }}
                                        >Submit the code</Button>
                                    </div>

                                </form>)}
                            </Formik>
                            : <div>
                                {!dealSuccess && <div className="am-otp-label">Once the seller hand overs the item, please provide the following 'Meeting Code' to the seller</div>}
                                {flag==1?<div className="jcc py10">
                                    <div className="text-center">
                                    <div className="jcb">
                                            {
                                                otp
                                                && otp.toString().split("").map((d, i) => <div key={i} className="otp-num">{d}</div>)
                                            }
                                        </div>
                                        {
                                            dealSuccess
                                                ? <div className="am-otp-label">Seller has validated OTP and marked this meet as successful. Please complete the purchase.</div>
                                                : <>
                                                    {
                                                        timerExpired
                                                            ? <div className="text-danger f12 pt20 fdc">
                                                                <div className="text-danger f11">OTP expired! Click below button to generate new OTP.</div>
                                                                <button className="btn btn-sm btn-outline-info" onClick={() => {
                                                                    setTimer(GLOBAL_CONSTANTS.OTP_EXP_LIMIT);
                                                                    setTimerExpired(false);
                                                                    requestAgain();
                                                                    generateOTP(nl.notificationJson.ohl, null, null, false);
                                                                }}>Re-generate OTP</button>
                                                            </div>
                                                            : <div className="c666 f12 pt20 mt20 fw600 " ref={timerRef}>OTP expires in {timer} Seconds.</div>
                                                    }

                                                    {/* <div className="text-danger f12 pt20 fdc">
                                                           { timer <= 1 && <div className="text-danger f11">OTP expired! Click below button to generate new OTP.</div>}
                                                            <button className="btn btn-sm btn-outline-info" onClick={() => {
                                                                setTimer(GLOBAL_CONSTANTS.OTP_EXP_LIMIT);
                                                                setTimerExpired(false);
                                                                requestAgain();
                                                                generateOTP(nl.notificationJson.ohl, null, null, false);
                                                            }}>Re-generate OTP</button>
                                                        </div>
                                                    {timer >= 1 && <div className="c666 f12 pt20 mt20 fw600 " ref={timerRef}>OTP expires in {timer} Seconds.</div>}
                                                 */}
                                                </>
                                        }

                                    </div>
                                </div>:<Notreached/>}
                                <p className="am-otp-label mt-3 mb-2" style={{ color: "#EF5009" }}>Note: Once you click on 'Complete Purchase', this transaction will be completed</p>
                                <div className="my10">
                                    {/* setShow(false); updateNotification(nl.sid) */}
                                    <Button variant="success" className="btn-block f16 theme_background" onClick={() => { setShowConfirmation(true) }}>Complete Purchase</Button>
                                </div>
                            </div>
                    }
                </div>
            </Modal>
        }
        {
            showConfirmation
            && <Modal {...{ show, setShow, className: "pickup-container" }}>
                <div className="pickup-box">
                    <div className="">Purchase Confirmation</div>
                    <div className="border-top my10"></div>
                    <div>
                        <div>Please Confirm</div>
                        <p>1. You have <span className="px5 text-semi-bold">received the item</span> that you have ordered.</p>
                        <p>2. You have provided the <span className="px5 text-semi-bold">'Meeting Code'</span> to the seller</p>
                        <div className="my10">
                            <Button variant="light" className="btn-block f16" onClick={() => setShowConfirmation(false)}>Go Back</Button>
                            <Button variant="success" className="btn-block f16 theme_background" onClick={() => completeDelivery(fromMyTransaction ? nl.notificationSid : nl.sid)}>I Confirm</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        }
    </div>)
}
export default AuthenticateMeet