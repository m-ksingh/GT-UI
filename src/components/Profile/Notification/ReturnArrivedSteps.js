import React, { useState, useContext } from 'react';
import Modal from "../../Shared/Modal";
import { Button } from "react-bootstrap";
import ApiService from '../../../services/api.service';
import AuthenticateMeet from './AuthenticateMeet';
import bgCheckmarkIcon from '../../../assets/images/icon/bg_checkmark.png';
import ReportIssue from "../../Shared/ReportIssue";
import ShareExperience from "../../Shared/ShareExperience";
import { NOTIFICATION_CONSTANTS } from './Constants/NotificationConstants';
import useToast from '../../../commons/ToastHook';
import ReturnConfirmOtp from './ReturnConfirmOtp';
import Spinner from "rct-tpt-spnr";

const ReturnArrivedSteps = ({ 
    show, 
    setShow, 
    nl, 
    orderDetailsSid,
    updateNotification,
    type = NOTIFICATION_CONSTANTS.USER_TYPE.SELLER,
    fromMyTransaction = false,
 }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [authenticate, setAuthenticate] = useState(false);
    const [success, setSuccess] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [shareExpModal, setShareExpModal] = useState(false);

    const returnRequestCode = () => {
        try {
            spinner.show("Please wait...");
            ApiService.returnRequestCode(orderDetailsSid).then(
                response => {
                    Toast.success({ message: 'Otp request sent successfully to seller', time: 5000});
                    setAuthenticate(true);
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    setShow(false);
                    console.error('error occur on returnRequestCode()', err);
                }
            );
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error('error occur on returnRequestCode()', err);
        }
    }

    // after shipped order request for secret code once reached at ffl
    const requestSecretCode = () => {
        try {
            spinner.show("Please wait...");
            ApiService.requestSecretCode(orderDetailsSid).then(
                response => {
                    Toast.success({ message: 'Otp request sent successfully to seller', time: 5000});
                    setAuthenticate(true);
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    setShow(false);
                    console.error('error occur on requestSecretCode()', err);
                }
            );
        } catch (err) {
            spinner.hide();
            setShow(false);
            console.error('error occur on requestSecretCode()', err);
        }
    }

    // callback fn on successfully authenticate
    const onSuccess = () => {
        try {
            updateNotification(fromMyTransaction ? nl.notificationSid : nl.sid);
            setShow(false);
        } catch (err) {
            console.error("err occur when onSuccess callback--", err);
        }
    }

    return <div>
        <Modal {...{ show, setShow, className: "stf-container" }}>
            <div className="pickup-box">
                <>
                    <div className="stf-header">BUYER - STEPS TO FOLLOW</div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">1</div></div>
                        <div className="stf-text mr20">
                            <span className="text-semi-bold">Step 1 : </span>
                            {
                                nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED 
                                ? <span>Once you inspect and are satisfied with the item, please click on the ‘Request Secret Code’ button</span>
                                : <span className="">Hand over the item to FFL and get confirmation from the FFL store that the inspection is satisfactory.</span>
                            }
                        </div>   
                    </div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">2</div></div>
                        <div className="stf-text mr20"><span className="text-semi-bold">Step 2 : </span>
                            {
                                nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED 
                                ? <span>Once clicked, please ask FFL to provide the secret code given by the seller.</span>
                                : <span className="">Click on ‘Request Return Code’ in order to request return code from the seller. In case seller is not present, FFL will provide the return code given by the seller.</span>
                            }
                        </div>
                    </div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">3</div></div>
                        <div className="stf-text mr20"><span className="text-semi-bold">Step 3 : </span>
                            {
                                nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED 
                                ? <span>Once you enter the ‘secret code’ and submit, the amount will be deducted from your payment card</span>
                                : <span className="">
                                    Once you enter the ‘return code’ and submit, the return process is complete and the refund will be initiated
                                </span>
                            } 
                            
                        </div>
                    </div>
                    <div className="jcb mb20 steps-box">
                        <div className="mr-2"><div className="stf-circle">4</div></div>
                        <div className="stf-text mr20"><span className="text-semi-bold">Step 4 : </span>
                            {
                                nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED 
                                ? <span>In case the return did not go well or you were not able to meet. Please report the reason by clicking on the ‘Report Problem’ link.</span>
                                : <span className="">In case the return did not go well or you were not able to meet. Please report the reason by clicking on the ‘Report Problem’ link.</span>
                            }
                            
                        </div>
                    </div>

                    <div className="text-center f10">
                        By clicking on ‘I Have Arrived’ button, I have read and agree to the Terms & Conditions and Privacy Policy.
                    </div>

                    <div className="text-right my10">
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED 
                            ? <Button variant="warning" className="btn-block f16 h48px" onClick={() => {requestSecretCode()}}>Request ‘Secret Code’</Button>
                            : <Button variant="warning" className="btn-block f16 h48px" onClick={() => {returnRequestCode()}}>Request 'Return Code'</Button>
                        }
                    </div>

                    <div className="stf-ra" onClick={() => setReportModal(true)}>Report Problem</div>
                </>
            </div>
        </Modal>
        {
            authenticate && orderDetailsSid 
            && <ReturnConfirmOtp {...{
                    show: authenticate, 
                    setShow: setAuthenticate, 
                    nl, 
                    orderDetailsSid, 
                    onSuccess,
                    requestAgain: () => {
                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED 
                        ? requestSecretCode() 
                        : returnRequestCode()
                    }
                }}
            />}
        {/* {authenticate && <AuthenticateMeet {...{show: authenticate, setShow: setAuthenticate, updateNotification, nl, onSuccess, type}}/>} */}
        {reportModal && <ReportIssue {...{reportModal, setShow, setReportModal, listingInfo: nl, reportType: type, updateNotification}}/>}
        {/* {shareExpModal && <ShareExperience {...{shareExpModal, setShow, setShareExpModal, listingInfo: nl, updateNotification}}/>} */}
    </div>;
}

export default ReturnArrivedSteps;