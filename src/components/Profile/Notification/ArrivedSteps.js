import React, { useState, useContext, useEffect } from 'react';
import Modal from "../../Shared/Modal";
import { Button } from "react-bootstrap";
import ApiService from '../../../services/api.service';
import AuthenticateMeet from './AuthenticateMeet'; 
import { useAuthState } from "../../../contexts/AuthContext/context";
import bgCheckmarkIcon from '../../../assets/images/icon/bg_checkmark.png';
import ReportIssue from "../../Shared/ReportIssue";
import ShareExperience from "../../Shared/ShareExperience";
import { NOTIFICATION_CONSTANTS } from './Constants/NotificationConstants';
import useToast from '../../../commons/ToastHook';
import TermsAndPrivacy from '../../Shared/TermAndCondition/TermsAndPrivacy';
import { AppContext } from '../../../contexts/AppContext';
import haversine from 'haversine-distance';

const ArrivedSteps = ({
    show,
    setShow,
    nl,
    getAllNotificationsList = () => { },
    onSuccess = () => { },
    type = NOTIFICATION_CONSTANTS.USER_TYPE.SELLER,
    fromMyTransaction = false
}) => {
    const Toast = useToast();

    let { setHasUpdateScheduleList, setUpdateMyTransactionAt, location } = useContext(AppContext);
    const [authenticate, setAuthenticate] = useState(false);
    const [success, setSuccess] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [shareExpModal, setShareExpModal] = useState(false);
    const [showTerm, setShowTerm] = useState(false);
    const [tpType, setTpType] = useState('');
    const [orderDetails, setOrderDetails] = useState([]);
    let user = localStorage.getItem('currentUser');
    var flag=0;
    const userDetails = useAuthState();
    var distanceInMeters=0, point1 = {};
    let latitude = null, longitude = null;

    /**  this method is triggered when seller click on i have arrived at the location
     * @param {String} ohl = order has listing sid
    */
    const ihaveArrived = async (ohl) => {
        try {
            // To get live location of user
            // console.log(nl.notificationJson);
            const asyncGetCurrentPosition = options => new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

            let isPermissionGranted = false;
            try {
                let { coords } = await asyncGetCurrentPosition({ timeout: 3000 });
                latitude = coords?.latitude;
                longitude = coords?.longitude;
                isPermissionGranted = true;
                await getAllOrders(nl.notificationJson.orderDetailsSid);
            } catch (err) {
                // Current location of client was not retrieved
            }
            if(flag)
            {
                ApiService.arrivedSellerWithLocation(ohl, { latitude, longitude, isPermissionGranted }).then(
                    response => {
                        setAuthenticate(true);
                    },
                    err => {
                        if (err && err.response.status === 401) {
                            Toast.success({ message: 'Please Wait for buyer to initiate the OTP Process.', time: 3000 });
                        }
                        setShow(false);
                    }
                );
               
            }

           
        } catch (err) {
            Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            console.error('error occur on ihaveArrived()', err);
        }
    }

    /**  this method is update notification
   * @param {String} ohl = order has listing sid
  */
    const updateNotification = (ohl) => {
        try {
            ApiService.updateNotification(ohl).then(
                response => {
                    setUpdateMyTransactionAt(new Date());
                    setHasUpdateScheduleList(true);
                    getAllNotificationsList()
                },
                err => {
                    if (err && err.response.status === 401) {
                        //                        
                    }
                    setShow(false);
                }
            );
        } catch (err) {
            Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            console.error('error occur on updateNotification()', err);
        }
    }

    const getAllOrders = async(ohl) => {
        //First point in your haversine calculation
        //Second point in your haversine calculation
        //let a, b;
        let point1 = {}, point2 = {};
        const userSid = userDetails.user.sid;

        //await navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        // if (navigator.geolocation) {
        // 	navigator.geolocation.getCurrentPosition((position) => {

        // 		setLatitude(position.coords.latitude);
        // 		setLongitude(position.coords.longitude);

        // 	});
        // }
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
            flag = 0;
            Toast.error({
                message: `You are yet to arrive at the location, you are ${distanceInMeters - 100} meters away`,
                time: 6000,
            });
            
        }
        else {
            flag = 1;
            Toast.success({
                message: `You have arrived at the location, you are within ${100 - distanceInMeters} meters`,
                time: 6000,
            });
            
        }
       
    };

  

    return <div>
        <Modal {...{ show, setShow, className: "stf-container" }}>
            <div className="pickup-box">
                {success && <div className="auth-success">
                    <div className="auth-s-body">
                        <div className="jcc my20"><img src={bgCheckmarkIcon} /></div>
                        <div className="jcc f16 text-semi-bold">Congratulations</div>
                        <div className="jcc mt20 f14">
                            You have successfully completed your deal.
                        </div>
                        <div className="jcc mb20 f14">
                            <div className="aic">
                                <p>The amount<span className="px5 text-semi-bold"> ${nl && nl.notificationJson && nl.notificationJson.price ? Number(nl.notificationJson.price).toFixed(2) : 0}</span>
                                    will be {(type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER && "credited to") || "debited from"} your account</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-right my10">
                        <Button variant="warning" className="btn-block f16 aic jcc" onClick={() => setShareExpModal(true)}>Share Experience</Button>
                    </div>
                    <div className="text-right my10">
                        <Button variant="success" className="btn-block f16" onClick={() => { updateNotification(fromMyTransaction ? nl.notificationSid : nl.sid); setShow(false) }}>Finish</Button>
                    </div>
                </div>}
                {!success && <>
                    <div className="stf-header">{type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? "SELLER - STEPS TO FOLLOW" : "BUYER - STEPS TO FOLLOW"}</div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">1</div></div>
                        <div className="stf-text mr20"><span className="text-semi-bold text-ul">Step 1:</span> <span className=""> Once you reach the pickup location, please click on <span className="text-semi-bold">‘I have arrived at the location’</span> button to notify the {type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? " buyer " : " seller "} that you have reached the location {type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? " with the product" : " to pickup item "}.</span></div>
                    </div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">2</div></div>
                        <div className="stf-text mr20"><span className="text-semi-bold text-ul">Step 2:</span>
                            <span className="">
                                {
                                    type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER
                                        ? <span> Once you meet the buyer, buyer will provide you the 4-Digit <span className="text-semi-bold">‘Meeting Code’</span>.</span>
                                        : <span> Clicking on <span className="text-semi-bold">‘I have arrived at the location’ </span> will generate a 4-Digit <span className="text-semi-bold">‘Meeting Code’</span>.</span>
                                }
                            </span>
                        </div>
                    </div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">3</div></div>
                        <div className="stf-text mr20"><span className="text-semi-bold text-ul">Step 3:</span>
                            <span className="">
                                {
                                    type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER
                                        ? <span> Enter the 4-Digit ‘Meeting code’ into the prompt which was asked on your screen in order to get the amount credited to your account.</span>
                                        : <span> Once you meet the seller, examine and accept the item and provide the 4-Digit <span className="text-semi-bold">‘Meeting Code’</span> prompted on your screen.</span>
                                }

                            </span>
                        </div>
                    </div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">4</div></div>
                        <div className="stf-text mr20"><span className="text-semi-bold text-ul">Step 4:</span> <span className=""> In case the meeting did not go well or you were not able to meet. Please report the reason by clicking on the <span className="text-semi-bold">‘Report Problem’</span> link.</span></div>
                    </div>

                    <div className="text-center f10">
                        By clicking on ‘I Have Arrived’ button, I have read and agree to the <a className="a-ul" onClick={() => {
                            setShowTerm(true);
                            setTpType(NOTIFICATION_CONSTANTS.TERMS_TYPE.TERMS);

                        }}>Terms & Conditions</a> and <a className="a-ul" onClick={() => {
                            setShowTerm(true);
                            setTpType(NOTIFICATION_CONSTANTS.TERMS_TYPE.POLICY)
                        }}>Privacy Policy.</a>
                    </div>

                    <div className="text-right my10">
                        <Button variant="warning" className="btn-block f16 btn-size" onClick={() => {
                            if (type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER) {
                                // ihaveArrived(n1.notificationJson.orderDetailsSid)
                                console.log(nl.notificationJson);
                                ihaveArrived(nl.notificationJson.ohl);
                            }
                            // else if (type === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER) {
                            //     console.log(nl.notificationJson);
                            //     ihaveArrived(nl.notificationJson.ohl);
                            //     // setAuthenticate(true);

                            // } 
                            else {
                                setAuthenticate(true);
                            }
                        }}>I have arrived at the location</Button>
                    </div>

                    <div className="stf-ra" onClick={() => setReportModal(true)}>Report Problem</div>
                </>}
            </div>
        </Modal>
        {authenticate && <AuthenticateMeet {...{ show: authenticate, setShow: setAuthenticate, updateNotification, nl, onSuccess: () => { onSuccess(); setSuccess(true); }, type, fromMyTransaction }} />}
        {reportModal && <ReportIssue {...{ reportModal, setShow, setReportModal, listingInfo: nl, reportType: type, updateNotification }} />}
        {shareExpModal && <ShareExperience {...{ shareExpModal, setShow, setShareExpModal, listingInfo: nl, updateNotification }} />}
        {showTerm && <TermsAndPrivacy {...{ show: showTerm, setShow: setShowTerm, type: tpType }} />}
    </div>;
}

export default ArrivedSteps;