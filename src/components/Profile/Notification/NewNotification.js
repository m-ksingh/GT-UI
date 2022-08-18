import React, { useContext, useState, useEffect } from 'react';
import PickUpDate from '../Notification/PickUpDate';
import ConformDate from '../Notification/ConformDate';
import { ICN_YES_GREEN, ICN_CLOSE_RED, IcnCircleInfo, ICN_TRADE_MX, IcnLocation, IcnWarningCircle, IcnCalender, IcnTrashRed } from '../../icons';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import { NOTIFICATION_CONSTANTS } from './Constants/NotificationConstants';
import CounterTrade from './CounterTrade';
import ArrivedSteps from './ArrivedSteps';
import ApiService from '../../../services/api.service';
import Spinner from "rct-tpt-spnr";
import _ from 'lodash';
import { getMyImage } from './Service/NotificationService';
import useToast from '../../../commons/ToastHook';
import { isToday, isTodayCurrentHour } from '../../../services/CommonServices';
import { Link, useHistory } from 'react-router-dom';
import SelectFflAndDate from './SelectFflAndDate';
import ReturnConfirmDate from './ReturnConfirmDate';
import ReturnArrivedSteps from './ReturnArrivedSteps';
import { useAuthDispatch, useAuthState } from '../../../contexts/AuthContext';
import ReportIssue from "../../Shared/ReportIssue";
import ProvideShippingInfo from './ProvideShippingInfo';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import { useConfirmationModal } from '../../../commons/ConfirmationModal/ConfirmationModalHook';
import ViewLocation from '../../Shared/ViewLocation';
import { AppContext } from '../../../contexts/AppContext';
import { useBasicModal } from '../../../commons/BasicModal/BasicModalHook';
import StoreRenewalModal from './StoreRenewalModal';
import { getOrderTitle, getOrderDescription } from './Service/NotificationService';

const NewNotification = ({ 
    showNotification, 
    setShowNotification, 
    nl, 
    getAllNotificationsList = () => {}, 
    updateNotifActionStatus = () => {} 
}) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    let userDetails = useAuthState();
    const dispatch = useAuthDispatch();
    const history = useHistory();
    let { setUpdateMyTransactionAt } = useContext(AppContext);
    const [pickUpDate, setPickUpdate] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [counterOffer, setCounterOffer] = useState(false)
    const [ohlSid, setOhlSid] = useState("");
    const [arrived, setArrived] = useState(false);
    const [showSelectFFlAndDate, setShowSelectFFlAndDate] = useState(false);
    const [showConfirmReturnDate, setShowConfirmReturnDate] = useState(false);
    const [showReturnArriveStep, setShowReturnArriveStep] = useState(false);
    const [returnDetailsSid, setReturnDetailsSid] = useState("");
    const [orderDetailsSid, setOrderDetailsSid] = useState("");
    const [notificationSid, setNotificationSid] = useState("");
    const [reportModal, setReportModal] = useState(false);
    const [show, setShow] = useState(false);
    const [isProvideShipping, setIsProvideShipping] = useState(false);
    const [isRenewalStore, setIsRenewalStore] = useState(false);
    

    const [showRebidAlert, RebidAlertComponent] = useBasicModal({
        body: "This listing is no more available as item is bought with instant buy.",
        hideHeader: true
    });

     /**  this method is update notification status
      * @param {String} ohl = order has listing sid
     */
      const updateNotification = (notifId) => {
        try {
            spinner.show("Please wait...");
            ApiService.updateNotification(notifId).then(
                response => {
                    setUpdateMyTransactionAt(new Date());
                    getAllNotificationsList();
                    setTimeout(() => {spinner.hide();}, 2000);
                },
                err => {
                    spinner.hide();
                    console.error('error occur on updateNotification()', err);
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on updateNotification()', err);
        }
    }

    // show delete confirmation modal when user click on delete
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Delete",
        body: "Are you sure, you want to delete?",
        onConfirm: (sid) => {
            updateNotification(sid);
        },
        onCancel: () => { }
    })

    /**  this method trigger when user click on view product to check listing is active or not
    * @param {String} sid = listing sid
    * @param {String} notifId = notification sid
    */
     const validateActiveListing = (sid, notifId, title) => {
        try {
            spinner.show("Please wait...");
            ApiService.validateActiveListing(sid).then(
                response => {
                    if(response.data) {
                        if(history?.location?.pathname 
                            && history.location.pathname.split("/")[1] == 'product') {
                                setShowNotification(!showNotification);
                        }
                        history.push({
                            pathname: `/product/${sid}`,
                            state: {
                                breadcrumb: [{
                                    name: "Home",
                                    path: "/"
                                },
                                {
                                    name: title,
                                    path: `/product/${sid}`
                                }]
                            }
                        });
                    } else {
                        updateNotification(notifId);
                        Toast.success({ message: `This listing is no more available`, time: 3000 });
                    }
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    console.error('error occur on validateActiveListing()', err);
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on validateActiveListing()', err)
        }
    }

    // this method trigger when user click on rebid
    const handleRebid = async (nl, type="bid", sell=false) => {
        try {
            spinner.show("Please wait...");
            let isListingActive = await ApiService.validateActiveListing(nl.notificationJson.sid);
            if(isListingActive.data) {
                if(history?.location?.pathname 
                    && (history.location.pathname.split("/")[2] == 'bid' || history.location.pathname.split("/")[1] == 'product')) {
                        setShowNotification(!showNotification);
                        spinner.hide();
                }
                history.push({
                    pathname: sell && type === "buy" ? `/product/${nl.notificationJson.sid}` : `/order/${sell && type === "buy" ? "buy" : "bid"}/${nl.notificationJson.sid}`,
                    state: {
                        breadcrumb: sell && type === "buy" ? [{
                                name: "Home",
                                path: "/"
                            },
                            {
                                name: `${nl.notificationJson.title}`,
                                path: `/product/${nl.notificationJson.sid}`,
                            }] 
                        : [{
                                name: "Home",
                                path: "/"
                            },
                            {
                                name: `${nl.notificationJson.title}`,
                                path: `/product/${nl.notificationJson.sid}`,
                            },
                            {
                                name: `${sell && type === "buy" ? "Buy Now" : "Make a Bid"}`,
                                path: `/order/${sell && type === "buy" ? "buy" : "bid"}/${nl.notificationJson.sid}`,
                            }],
                        notifId: nl.sid,
                        // itemQuantity: 1,
                        // itemInfo: product,
                        // distance: Number(product.distance || 0)
                    }
                })
            } else {
                showRebidAlert(nl);
                updateNotification(nl.sid);
            }
        } catch (err) {
            spinner.hide();
            console.error('error occur on handleRebid()', err);
        }
    }

    /**  this method trigger when get received bid 
    * @param {String} ohld = order has listing details sid
    */
    const acceptRejectBidTrade = (status, sid, notifId, userType) => {
        try {
            spinner.show("Please wait...");
            ApiService.acceptRejectBidTrade(status, sid, userType).then(
                response => {
                    updateNotification(notifId);
                    Toast.success({ message: `Trade ${status === NOTIFICATION_CONSTANTS.STATUS.ACCEPTED ? "accepted" : "rejected"} successfully`, time: 3000 });
                },
                err => {
                    spinner.hide();
                    if (err.response && err.response.status === 401) Toast.error({ message: err.response.data ? (err.response.data.error || err.response.data.message) : 'Internal Server Error!', time: 3000 });
                    if (err.response && err.response.status === 403) {
                        Toast.error({ message: err.response.data && (err.response.data.error || err.response.data.message), time: 3000 });
                        updateNotification(notifId);
                    }
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on acceptRejectBidTrade()---', err);
        }
    }

    /**  this method trigger when buyer reject counter trade offer
    * @param {String} sid = order has listing details sid
    * @param {String} notifId = notification sid
    */
    const rejectCounterTradeByBuyer = (ohld, prevAmount, notifId) => {
        try {
            spinner.show("Please wait...");
            ApiService.rejectCounterTradeByBuyer(ohld, prevAmount).then(
                response => {
                    updateNotification(notifId);
                    Toast.success({ message: `Counter trade offer rejected successfully`, time: 3000 });
                },
                err => {
                    spinner.hide();
                    if (err.response && err.response.status === 401) Toast.error({ message: err.response.data ? (err.response.data.error || err.response.data.message) : 'Internal Server Error!', time: 3000 });
                    if (err.response && err.response.status === 403) {
                        Toast.error({ message: err.response.data && (err.response.data.error || err.response.data.message), time: 3000 });
                        updateNotification(notifId);
                    }
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on rejectCounterTradeByBuyer--', err)
        }
    }

    // save buyer seller location
    const saveLocation = async (ohl, type) => {
        try {
            spinner.show("Please wait...");
            // To get live location of user
            const asyncGetCurrentPosition = options => new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

            let latitude = null, longitude = null, isPermissionGranted = false;
            try {
                let { coords } = await asyncGetCurrentPosition({ timeout: 3000 });
                latitude = coords?.latitude;
                longitude = coords?.longitude;
                isPermissionGranted = true;
            } catch (err) {
                // Current location of client was not retrieved
            }
            let tmpLocation = {};
            tmpLocation.latitude = latitude;
            tmpLocation.longitude = longitude;
            tmpLocation.isPermissionGranted = isPermissionGranted;
            let payload = {
                "location": JSON.stringify(tmpLocation),
                "orderHasListingSid": ohl,
                "type": type
            }
            ApiService.saveLocation(payload).then(
                response => {
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    console.error('error occur on saveLocation()', err)
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on saveLocation()', err)
        }
    }

    // this method trigger when click on reject button to reject order
    const rejectReturnOrder = (orderDetailsSid, notifId) => {
        try {
            spinner.show("Rejecting return order request... Please wait...");
            ApiService.rejectOrderReturn(orderDetailsSid).then(
                response => {
                    updateNotification(notifId);
                    Toast.success({ message: "Return order rejected successfully" });
                },
                err => {
                    spinner.hide();
                    console.error("Error occur when rejectReturnOrder--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur when rejectReturnOrder--", err);
        }
    }

    // this method trigger when click on cancel order
    const cancelOrder = (orderDetailsSid, notifId, quantity) => {
        try {
            spinner.show("Rejecting return order request... Please wait...");
            ApiService.cancelOrder(orderDetailsSid, quantity).then(
                response => {
                    updateNotification(notifId);
                    Toast.success({ message: "Order has been cancelled successfully" });
                },
                err => {
                    spinner.hide();
                    console.error("Error occur when cancelOrder--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur when cancelOrder--", err);
        }
    }

    // this method to update dealership account for current logged in user when dealership request approved by super admin
    const updateDealershipAccount = () => {
        try {
            if (userDetails.user.appUserType !== 'DEALER') {
                userDetails.user.appUserType = 'DEALER';
                dispatch({ type: 'LOGIN_SUCCESS', payload: userDetails.user });
            }
        } catch (err) {
            console.error("Error occur when updateDealershipAccount--");
        }
    }

    const showDateTime = (time) => {
        let tmpTime = "";
        try {
            tmpTime = moment(time).endOf('seconds').fromNow();
        } catch (err) {
            console.error("Error occur when showDateTime --", err);
        }
        return tmpTime;
    }

    // this metho to show dispute label
    const showPenaltyLabel = (disputeResolution) => {
        try {
            let resolution = JSON.parse(disputeResolution).find(r => r.appliedTo === (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_B ? GLOBAL_CONSTANTS.USER_TYPE.BUYER : GLOBAL_CONSTANTS.USER_TYPE.SELLER))
            return <span>The amount of <span className="text-semi-bold">${resolution.amount}</span> has been {resolution.function === GLOBAL_CONSTANTS.TRANSACTION_TYPE.DEBIT ? " debited as a penalty from " : " credited to "} your account.</span>
        } catch (err) {
            console.error("Error in showPenaltyLabel--", err);
        }
    }

    // listening for notification type
    useEffect(() => {
        if (nl.notificationType
            && nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.DEALER_APPLICATION_ACCEPTED)
            updateDealershipAccount();
    }, [nl])

    // Listens changes of dependencies and notifies the same to parent component 
    useEffect(() => {
        updateNotifActionStatus(pickUpDate || showConfirm || counterOffer || arrived || showSelectFFlAndDate || showConfirmReturnDate || showReturnArriveStep || isProvideShipping || isRenewalStore);
    }, [pickUpDate, showConfirm, counterOffer, arrived, showSelectFFlAndDate, showConfirmReturnDate, showReturnArriveStep, isProvideShipping, isRenewalStore])

    return <>
        <div className="notification-box">
            <div className="nb-body py-3">
                <div className="myBidbox-title p-rel">
                    <div className=" jcb aic p-rel">
                        <div className="f12 aic">
                            <span class="mr5"><IcnCircleInfo /></span>
                            <span className="pt3">
                                {getOrderTitle(nl.notificationType, nl)}
                            </span>
                        </div>
                        <div className="text-muted f10">
                            {moment(nl.createdOn).startOf('minute').fromNow()}
                        </div>
                    </div>
                    {
                        nl.notificationJson
                        && nl.notificationJson?.expiresOn
                        && (nl.notificationType !== NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED)
                        && !_.isEmpty(nl.notificationJson?.expiresOn)
                        && new Date(nl.notificationJson?.expiresOn).getTime() < new Date().getTime()
                        && !isToday({"from": nl.notificationJson?.expiresOn})
                        && <div className="notification-delete-icon cp" onClick={() => showConfirmModal(nl.sid)}>
                            <IcnTrashRed {...{width:"12", height:"12", fill:"#e27474"}}/>
                        </div>
                    }
                    
                </div>
                <div className="border-top pt-2">
                    <div className="nl-body-header">
                        {getOrderDescription(nl.notificationType, nl)}
                    </div>
                    <span className="float-right"></span>
                    {
                        (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LISTING_SOLD
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_CONFIRMED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SCHEDULE_ALARM
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_ACCEPTED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NON_TRADE
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_WISHLIST
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_PLACED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_REJECTED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_OTP_REQUESTED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_COMPLETED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_COMPLETED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_SUBMITTED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RAISED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_REJECTED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_REJECTED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPING_INFO
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPMENT_INITIATED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BUYER_REACHED_FFL
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_SUCCESSFUL_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_SUCCESSFUL_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_COMPLETED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_COMPLETED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_CANCELLED_B 
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_CANCELLED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED_FOR_INSTANT_BUY
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_OUTNUMBERED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_LOST 
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_EXPIRED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_REJECTED_FOR_INSTANT_BUY
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_EXPIRED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_PURCHASED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.INSTANT_BUY_EXPIRED
                        )
                        && <div className="row jcb py-3">
                            <div className="col-8">
                                <div className="WishlistItem">
                                    <div className="media">
                                        <img src={getMyImage(nl.notificationJson.pic)} className="mr-3" alt="..." />
                                        <div className="media-body">
                                            <div className="nl-item-name mt-0">{nl.notificationJson.title}</div>
                                            <p className="text-muted m-0 f10">{nl.notificationJson.condition}</p>
                                            <p className="text-muted m-0 f10"><span>Qty : </span>{nl.notificationJson?.quantity || nl.notificationJson.updatedQuantity || nl.notificationJson.reducedQuantity || nl.notificationJson.orderedQuantity ? nl.notificationJson.quantity || nl.notificationJson.updatedQuantity || nl.notificationJson.reducedQuantity || nl.notificationJson.orderedQuantity : 1}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-4 text-right">
                                <div className="WishlistItem-price">
                                    <>
                                        <p className="wprice-label">
                                            {
                                                (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED
                                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED
                                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED_FOR_INSTANT_BUY
                                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_OUTNUMBERED
                                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_LOST 
                                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_EXPIRED
                                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED_B
                                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED_B)
                                                ? "Reserve Price" : "Price"
                                            }
                                        </p>
                                        <p className="nl-price">
                                            { 
                                                Number((
                                                    (nl.notificationJson.price && JSON.parse(nl.notificationJson.price)) 
                                                    || (nl.notificationJson.auctionReservePrice && JSON.parse(nl.notificationJson.auctionReservePrice)) 
                                                    || (nl.notificationJson.tradeReservePrice && JSON.parse(nl.notificationJson.tradeReservePrice)) 
                                                    || 0
                                                )) 
                                                ? "$" + Number((
                                                        (nl.notificationJson.price && JSON.parse(nl.notificationJson.price)) 
                                                        || (nl.notificationJson.auctionReservePrice && JSON.parse(nl.notificationJson.auctionReservePrice)) 
                                                        || (nl.notificationJson.tradeReservePrice && JSON.parse(nl.notificationJson.tradeReservePrice)) 
                                                        || 0
                                                    )).toFixed(2) 
                                                : ((nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED_FOR_INSTANT_BUY
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_OUTNUMBERED
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_LOST 
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_EXPIRED
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_ACCEPTED
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED_B
                                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED_B)
                                                    ? <span className="f10">No Reserve Price</span>
                                                    : "0"
                                                )
                                            }
                                        </p>
                                    </>
                                </div>
                            </div>
                        </div>
                    }

                    {
                        (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_ACCEPTED 
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_ACCEPTED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_REJECTED
                            )
                        && <div className="tradeOffer-container">
                            {/* ....your product .... */}
                            <div className="tradeOffer-box nl-tob">
                                <div className="text-muted text-center f12 pb5">LISTED ITEM</div>
                                <div className="">
                                    <div className="text-center">
                                        <img src={getMyImage(nl.notificationJson.pic)} className="" alt="..." />
                                    </div>
                                </div>
                                <div className="pt-2 tradeContent">
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-12 col-md-12 w100">
                                            <div className="title-md elps" title={nl.notificationJson.title}>{nl.notificationJson.title}</div>
                                        </div>
                                    </div>
                                    <div className="row mb5">
                                        <div className="col-xs-12 col-sm-6 col-md-6 text-muted m-0 f10">{nl.notificationJson.condition}</div>
                                        <div className="col-xs-12 col-sm-6 col-md-6 theme_color m-0 f12"><span className="pl5">${nl.notificationJson.price ? Number(nl.notificationJson.price).toFixed(2) : 0}</span></div>
                                    </div>
                                    <div className="jcb">
                                        <div className="fdc">
                                            <div className="text-muted f10">Manufacturer</div>
                                            <div className="title-sm f10">{nl.notificationJson.manufacturer}</div>
                                        </div>
                                        <div className="fdc">
                                            <div className="text-muted f10">Condition</div>
                                            <div className="title-sm f10">{nl.notificationJson.condition}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="nl-trade-circle">
                                    <ICN_TRADE_MX />    
                                </div>
                            </div>
                            {/* ....trade offer.... */}
                            <div className="tradeOffer-box nl-tob">
                                <div className="text-muted text-center f12 pb5">TRADE OFFER</div>
                                <div className="">
                                    <div className="text-center">
                                        <img src={getMyImage(nl.notificationJson.tradeWithPic)} className="" alt="..." />
                                    </div>
                                </div>
                                <div className="pt-2 tradeContent"> 
                                    <div className="row">   
                                        <div className="col-xs-12 col-sm-12 col-md-12 w100">
                                            <div className="title-md elps" title={nl.notificationJson.tradeWithTitle}>{nl.notificationJson.tradeWithTitle}</div>
                                        </div>
                                    </div>
                                    <div className="row mb5">
                                        <div className="col-xs-12 col-sm-6 col-md-6 text-muted m-0 f10">{nl.notificationJson.tradeWithCondition}</div>
                                        <div className="col-xs-12 col-sm-6 col-md-6 theme_color m-0 f12"><span className="pl5">${nl.notificationJson.tradeWithPrice ? Number(nl.notificationJson.tradeWithPrice).toFixed(2) : 0}</span></div>
                                    </div>
                                    <div className="jcb">
                                        <div className="fdc">
                                            <div className="text-muted f10">Manufacturer</div>
                                            <div className="title-sm f10">{nl.notificationJson.tradeWithManufacturer}</div>
                                        </div>
                                        <div className="fdc">
                                            <div className="text-muted f10">Condition</div>
                                            <div className="title-sm f10">{nl.notificationJson.tradeWithCondition}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NOTIFICATION
                        && <div className="tradeOffer-container">
                            {/* ....your product .... */}
                            <div className="tradeOffer-box nl-tob">
                                <div className="text-muted text-center f12 pb5">LISTED ITEM</div>
                                <div className="">
                                    <div className="text-center">
                                        <img src={getMyImage(nl.notificationJson.myPic)} className="" alt="..." />
                                    </div>
                                </div>
                                <div className="pt-2 tradeContent">
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-12 col-md-12 w100">
                                            <div className="title-md elps" title={nl.notificationJson.myTitle}>{nl.notificationJson.myTitle}</div>
                                        </div>
                                    </div>
                                    <div className="row mb5">
                                        <div className="col-xs-12 col-sm-6 col-md-6 text-muted m-0 f10">{nl.notificationJson.myCondition}</div>
                                        <div className="col-xs-12 col-sm-6 col-md-6 theme_color m-0 f12">
                                            <span className="pl5">
                                                ${
                                                    (Number((
                                                        (nl.notificationJson.myPrice && JSON.parse(nl.notificationJson.myPrice))
                                                        || (nl.notificationJson.myAuctionReservePrice && JSON.parse(nl.notificationJson.myAuctionReservePrice))
                                                        || (nl.notificationJson.myTradeReservePrice && JSON.parse(nl.notificationJson.myTradeReservePrice))
                                                    )).toFixed(2)) 
                                                    || 0
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="jcb">
                                        <div className="fdc">
                                            <div className="text-muted f10">Manufacturer</div>
                                            <div className="title-sm f10">{nl.notificationJson.myManufacturer}</div>
                                        </div>
                                        <div className="fdc">
                                            <div className="text-muted f10">Condition</div>
                                            <div className="title-sm f10">{nl.notificationJson.myCondition}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="nl-trade-circle">
                                    <ICN_TRADE_MX />
                                </div>
                            </div>
                            {/* ....trade offer.... */}
                            <div className="tradeOffer-box nl-tob">
                                <div className="text-muted text-center f12 pb5">MATCHING ITEM</div>
                                <div className="">
                                    <div className="text-center">
                                        <img src={getMyImage(nl.notificationJson.pic)} className="" alt="..." />
                                    </div>
                                </div>
                                <div className="pt-2 tradeContent">
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-12 col-md-12 w100">
                                            <div className="title-md elps" title={nl.notificationJson.title}>{nl.notificationJson.title}</div>
                                        </div>
                                    </div>
                                    <div className="row mb5">
                                        <div className="col-xs-12 col-sm-6 col-md-6 text-muted m-0 f10">{nl.notificationJson.condition}</div>
                                        <div className="col-xs-12 col-sm-6 col-md-6 theme_color m-0 f12">
                                            <span className="pl5">
                                                ${
                                                    (Number((
                                                        (JSON.parse(nl.notificationJson.isBuy) && nl.notificationJson.price && JSON.parse(nl.notificationJson.price)) 
                                                        || (JSON.parse(nl.notificationJson.isBid) && nl.notificationJson.auctionReservePrice && JSON.parse(nl.notificationJson.auctionReservePrice))
                                                        || (JSON.parse(nl.notificationJson.isTrade) && nl.notificationJson.tradeReservePrice && JSON.parse(nl.notificationJson.tradeReservePrice)) 
                                                    )).toFixed(2)) 
                                                    || 0
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="jcb">
                                        <div className="fdc">
                                            <div className="text-muted f10">Manufacturer</div>
                                            <div className="title-sm f10">{nl.notificationJson.manufacturer}</div>
                                        </div>
                                        <div className="fdc">
                                            <div className="text-muted f10">Condition</div>
                                            <div className="title-sm f10">{nl.notificationJson.condition}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_PLACED
                        && <div className="pb20 nl-body-header">{"In order to accept the return, Please select the FFL store & select the return date where the buyer can return your item"}</div>
                    }
                    {
                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPMENT_INITIATED
                        && <div className="pb20 nl-body-header f9">
                            <div className="aic">
                                <div>Shipment Partner : </div>
                                <div className="text-semi-bold pl5">{nl.notificationJson.shipmentPartner}</div>
                            </div>
                            <div className="aic">
                                <div>Tracking ID : </div>
                                <div className="text-semi-bold pl5">{nl.notificationJson.trackingId}</div>
                            </div>
                            <div className="aic">
                                <div>Tracking URL : </div>
                                <div className="text-semi-bold pl5"><a className="text-lint" target="_blank" href={nl.notificationJson.trackngUrl ? JSON.parse(nl.notificationJson.trackngUrl) : ""}>{nl.notificationJson.trackngUrl ? JSON.parse(nl.notificationJson.trackngUrl) : ""}</a></div>
                            </div>
                            <div className="aic">
                                <div>FFL Location : </div>
                                <div className="text-semi-bold pl5">
                                    {
                                        nl.notificationJson.deliveryLocation 
                                        && JSON.parse(nl.notificationJson.deliveryLocation)
                                        && JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                        && <>
                                            {
                                                JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                && <span>
                                                    {(JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).storeName || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).licHolderName) && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).storeName || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).licHolderName}, </span>}
                                                    {/* {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premStreet && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premStreet}, </span>} */}
                                                    {/* {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).mailCity && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).mailCity}, </span>}
                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premState && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premState}, </span>} */}
                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premZipCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premZipCode}</span>}
                                                </span>
                                            }
                                            {
                                                JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                && <span>
                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflStoreName && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflStoreName}, </span>}
                                                    {/* {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseStreet && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseStreet}, </span>} */}
                                                    {/* {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseCity && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseCity}, </span>}
                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseState && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseState}, </span>} */}
                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseZipCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseZipCode}</span>}
                                                </span>
                                            }
                                        </>
                                    }
                                </div>
                            </div>
                            <div className="aic">
                                <div>Estimated Delivery Date : </div>
                                <div className="text-semi-bold pl5">{moment(nl.notificationJson.estimatedDeliveryDate).format('L')}</div>
                            </div>
                            <div className="aic">
                                <div>Shipping Charge : </div>
                                <div className="text-semi-bold pl5">{`${nl.notificationJson.isFreeShipping && JSON.parse(nl.notificationJson.isFreeShipping) ? 'Free Shipping' : '$' + (nl.notificationJson.shipmentCharges || 0)}`}</div>
                            </div>
                            {
                                nl.notificationJson?.isShippingFeesLocationBased 
                                && JSON.parse(nl.notificationJson.isShippingFeesLocationBased) 
                                && nl.notificationJson.isFreeShipping 
                                && !JSON.parse(nl.notificationJson.isFreeShipping)
                                && <div className="shipment-charges-notification">Shipment charges <span className="px5">${nl.notificationJson.shipmentCharges || 0}</span> will be deducted from your selected payment card.</div>
                            }
                        </div>
                    }
                    {
                        (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_SUBMITTED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RAISED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_B
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_S)
                        && <div className="pb20 nl-body-header">
                            <div className="">
                                <span className="text-semi-bold">{"Dispute:"}</span>
                                <span className="px5">:</span>
                                <span>{nl.notificationJson?.disputeTitle ? nl.notificationJson.disputeTitle : "-"}</span>
                            </div>
                            {
                                (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_B
                                    || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_S)
                                && <div className="">
                                    <span className="text-semi-bold">{"Resolution:"}</span>
                                    <span className="px5">:</span>
                                    <span>
                                        {
                                            nl.notificationJson?.disputeResolution
                                            && JSON.parse(nl.notificationJson.disputeResolution)
                                            && <span>
                                                {
                                                   showPenaltyLabel(nl.notificationJson.disputeResolution) 
                                                }
                                                <span className="pl5">
                                                    {
                                                        nl?.notificationJson?.resolutionNote 
                                                        || (nl?.notificationJson?.disputeResolution 
                                                            && JSON.parse(nl.notificationJson.disputeResolution)[0].title) 
                                                        || ""
                                                    }
                                                </span>
                                            </span>
                                        }
                                    </span>
                                </div>
                            }

                        </div>
                    }
                    <div className="nl-location aic">
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_B
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_S
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_B
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_S
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_OTP_REQUESTED)
                            && nl?.notificationJson?.returnFflInfo
                            && <>
                                <div className="fdc">
                                    <div className="jcb">
                                        <div className="mr5"><IcnLocation /></div>
                                        <div className="elps">
                                            <span className="text-semi-bold">{"FFL"}</span>
                                            <span className="px5">:</span>
                                            {
                                                !_.isEmpty(nl.notificationJson.returnFflInfo)
                                                && <span>
                                                    <span>{JSON.parse(nl.notificationJson.returnFflInfo)?.storeName || JSON.parse(nl.notificationJson.returnFflInfo)?.licHolderName || ""}, </span>
                                                    {JSON.parse(nl.notificationJson.returnFflInfo).mailStreet && <span>{JSON.parse(nl.notificationJson.returnFflInfo).mailStreet}, </span>}
                                                    {JSON.parse(nl.notificationJson.returnFflInfo).premZipCode && <span>{JSON.parse(nl.notificationJson.returnFflInfo).premZipCode}</span>}
                                                </span>
                                            }
                                            {
                                                _.isEmpty(nl.notificationJson.returnFflInfo)
                                                && <span className="text-muted">Not available</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="elps pl15">
                                        <span className="text-semi-bold">{"Phone No."}</span>
                                        <span className="px5">:</span>
                                        {
                                            !_.isEmpty(nl.notificationJson.returnFflInfo)
                                            && <span>
                                                {JSON.parse(nl.notificationJson.returnFflInfo).voicePhone && <span>{JSON.parse(nl.notificationJson.returnFflInfo).voicePhone}</span>}
                                            </span>
                                        }
                                        {
                                            (_.isEmpty(nl.notificationJson.returnFflInfo)
                                                || _.isEmpty(JSON.parse(nl.notificationJson.returnFflInfo).voicePhone))
                                            && <span className="text-muted">Not available</span>
                                        }
                                    </div>
                                </div>

                            </>
                        }
                        {
                            nl.notificationJson.deliveryLocation
                            && !nl?.notificationJson?.returnFflInfo
                            && <ViewLocation {...{ deliveryLocation: nl.notificationJson.deliveryLocation }} />
                        }
                    </div>
                    {
                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                        && nl.notificationJson.tradeCounterCount >= 3
                        && <div className="text-danger f10">You have reached maximum counter offer limit</div>
                    }
                    {
                        (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED)
                        && nl.notificationJson?.tradeWithPrice
                        && nl.notificationJson?.price
                        && (Number(nl.notificationJson.tradeWithPrice) >= Number(nl.notificationJson.price) 
                        || ((Number(nl.notificationJson.price) - (Number(nl.notificationJson.tradeOfferBalance) + Number(nl.notificationJson.tradeWithPrice)) <= 0)))
                        && <div className="text-danger f10 counter-offer">You cannot counter offer as the buyer’s trade offer value is greater than or equal to the value of your listing</div>
                    }
                </div>
                {
                    nl.actionRequire 
                    && <div className="jcb pt10 bt-ddd aic">
                    <div className="lnh-15">
                        {
                            nl.notificationJson
                            && nl.notificationJson?.expiresOn
                            && (nl.notificationType !== NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED)
                            && !_.isEmpty(nl.notificationJson?.expiresOn)
                            && <>
                                <div className="f12">{new Date(nl.notificationJson?.expiresOn).getTime() < new Date().getTime() ? "Expired" : "Expires"}</div>
                                <div className="small-size aic">
                                    <div className="pr-2"><IcnWarningCircle /></div>
                                    <div className="pt2 expireTime f10">{showDateTime(nl.notificationJson?.expiresOn)}</div>
                                </div>
                            </>
                        }
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED
                            && nl.notificationJson.bidAttemptsLeft
                            && <div className="small-size aic">
                                <div className="pr-2"><IcnWarningCircle /></div>
                                <div className="pt5 expireTime f10">{nl.notificationJson.bidAttemptsLeft} attempt left</div>
                            </div>
                        }
                    </div>
                    {/* Report an issue for buyer */}
                    {/* <div className="pr-2">
                        {
                            (nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER && "Report")
                            || "Report an issue"
                        }
                    </div> */}
                    <div>
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LISTING_SOLD
                            && <Button variant="warning" className="btn btn-sm btn-warning border-round f12 aic jcc" onClick={() => { setOhlSid(nl.notificationJson.ohl); setPickUpdate(true) }}>
                                <div className="aic">
                                    <div className="pr-2 aic jcc"><IcnCalender /></div>
                                    <div className="">{((nl.notificationJson?.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || nl.notificationJson.adminToFFlStore) ? "Select Items & Pickup Date" : "Set Pickup Date"}</div>
                                </div>
                            </Button>
                        }
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED
                            || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY)
                            && <div className="aic">
                                <Button variant="warning" className="btn btn-sm btn-warning border-round f12 aic jcc" onClick={() => { setOhlSid(nl.notificationJson.ohl); setShowConfirm(true) }}>
                                    <div className="aic">
                                        <div className="pr-2 aic jcc"><IcnCalender /></div>
                                        <div className="">Confirm Pickup Date</div>
                                    </div>
                                </Button>
                                <div>
                                    {
                                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY 
                                        && <Button variant="outline" className="btn-sm rejectBtn f10 notification-button ml5" onClick={() => {cancelOrder(nl.notificationJson.orderDetailsSid, nl.sid, nl.notificationJson.updatedQuantity)}}>Cancel Order</Button>
                                    }
                                </div>
                                
                                
                            </div>
                        }
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SCHEDULE_ALARM
                            && <div className="jcb aic">
                            {/* {userDetails.user.sid && <div className="mr5 report-issue-btn" onClick={() => setReportModal(true)}>Report Problem</div>} */}
                                <Button
                                variant="warning"
                                className="btn btn-sm btn-warning border-round f12 aic jcc"
                                onClick={() => {
                                    setArrived(true);
                                    saveLocation(nl.notificationJson.ohl, nl.notificationJson.type);
                                }}
                                disabled={!isTodayCurrentHour({ from: nl.notificationJson.fromTime, to: nl.notificationJson.expiresOn || nl.notificationJson.toTime })}
                            >
                                <div className="aic">
                                    <div className="">
                                        {
                                            (nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER && "Meet the seller")
                                            || "Meet the buyer"
                                        }
                                    </div>
                                </div>
                            </Button>
                            </div>
                        }
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED 
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                // || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED
                            )
                            && <div className="acceptRejectBtn aic">
                                {
                                    (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED 
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S)
                                    && <Button 
                                            variant="dark" 
                                            className="btn-sm notification-button mr5 px5 f10 aic jcc" 
                                            onClick={() => setCounterOffer(true)}
                                            disabled={
                                                nl.notificationJson?.tradeCounterCount >= 3 
                                                || Number(nl.notificationJson.tradeWithPrice) >= Number(nl.notificationJson.price)
                                                || ((Number(nl.notificationJson.price) - (Number(nl.notificationJson.tradeOfferBalance) + Number(nl.notificationJson.tradeWithPrice)) <= 0))
                                            } 
                                            >Counter Offer
                                    </Button>
                                }
                                
                                {
                                    (
                                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                        // || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_ACCEPTED
                                        // || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                        ) && <>
                                        <Button
                                            variant="outline"
                                            className="mr5 btn-sm acceptBtn f10 notification-button aic jcc"
                                            onClick={() => { acceptRejectBidTrade(NOTIFICATION_CONSTANTS.STATUS.ACCEPTED, nl.notificationJson.ohl, nl.sid, nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED ? NOTIFICATION_CONSTANTS.USER_TYPE.BUYER : NOTIFICATION_CONSTANTS.USER_TYPE.SELLER) }}
                                        >
                                            <div className="aic">
                                                <div className="mr5">
                                                    <ICN_YES_GREEN />
                                                </div>
                                                <div className="">Accept</div>
                                            </div>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="btn-sm rejectBtn f10 notification-button aic jcc"
                                            onClick={() => {
                                                nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED 
                                                ? rejectCounterTradeByBuyer(nl.notificationJson.ohld, nl.notificationJson.previousTradeOfferBalance,  nl.sid) 
                                                : acceptRejectBidTrade(NOTIFICATION_CONSTANTS.STATUS.REJECTED, nl.notificationJson.ohl, nl.sid, nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED ? NOTIFICATION_CONSTANTS.USER_TYPE.BUYER : NOTIFICATION_CONSTANTS.USER_TYPE.SELLER) 
                                            }}
                                        >
                                            <div className="aic">
                                                <div className="mr5"><ICN_CLOSE_RED /></div>
                                                <div className="">Reject</div>
                                            </div>
                                        </Button>
                                    </>
                                }
                            </div>
                        }
                        {
                            ((nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NOTIFICATION && _.isEmpty(nl.notificationJson?.tradeSpecification))
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NON_TRADE
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_WISHLIST)
                            && <Button 
                                    variant="warning" 
                                    className="btn btn-sm border-round f12 aic jcc"
                                    onClick={() => validateActiveListing(nl.notificationJson.sid, nl.sid, nl.notificationJson.title)}
                                >
                                <div className="aic">
                                    <div className="">View Product</div>
                                </div>
                            </Button>
                        }
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_PLACED
                            && <div className="jcb aic">
                                <Button variant="dark" className="btn-sm border-round mr10 px10 f12 aic jcc" onClick={() => { setShowSelectFFlAndDate(true) }}>{"Select FFL Store & Date"}</Button>
                                <Button variant="outline" className="btn-sm border-round rejectBtn f12 aic jcc" onClick={() => { rejectReturnOrder(nl.notificationJson.orderDetailsSid, nl.sid) }}>
                                    <div className="aic">
                                        <div className="mr5"><ICN_CLOSE_RED /></div>
                                        <div className="">Reject</div>
                                    </div>
                                </Button>
                            </div>
                        }
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_S
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_OTP_REQUESTED
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_S
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BUYER_REACHED_FFL)
                            && <a href={`tel:${nl.notificationJson?.returnFflInfo ? JSON.parse(nl.notificationJson.returnFflInfo)?.voicePhone : ""}`}><Button variant="warning" className="btn btn-sm btn-warning border-round f12 aic jcc" onClick={() => { }}>
                                <div className="aic">
                                    <div className="">Contact FFL</div>
                                </div>
                            </Button>
                            </a>
                        }
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_B
                            && <Button variant="warning" className="btn btn-sm btn-warning border-round f12 aic jcc" onClick={() => { setNotificationSid(nl.sid); setReturnDetailsSid(nl.notificationJson.returnDetailsSid); setShowConfirmReturnDate(true) }}>
                                <div className="aic">
                                    <div className="pr-2"><IcnCalender /></div>
                                    <div className="">Confirm Return Date</div>
                                </div>
                            </Button>
                        }
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_B
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED)
                            && <Button
                                variant="warning"
                                className="btn btn-sm btn-warning border-round f12 aic jcc"
                                onClick={() => { setOrderDetailsSid(nl.notificationJson.orderDetailsSid); setShowReturnArriveStep(true) }}
                                disabled={!isToday({ from: nl.notificationJson?.scheduledTimeFrom || nl.notificationJson?.returnDate, to: nl.notificationJson.expiresOn || nl.notificationJson.scheduledTimeTo })}
                            >
                                <div className="aic">
                                    <div className="">Arrived at FFL</div>
                                </div>
                            </Button>
                        }
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.DEALER_APPLICATION_ACCEPTED 
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_RENEWAL_APPROVED
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_RENEWAL_REJECTED)
                            && <Link to="/store/mystores">
                                <Button variant="outline" className="btn-sm border-round acceptBtn f12 aic jcc">
                                    <div className="aic">
                                        <div className="">Go To Store</div>
                                    </div>
                                </Button>
                            </Link>
                        }
                        {/* {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED
                            && nl.notificationJson.bidAttemptsLeft !== "0"
                            && <Link to={`/order/bid/${nl.notificationJson.sid}`}>
                                <Button variant="dark" className="btn-sm notification-button px10 f10">Bid Again</Button>
                            </Link>
                        } */}
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_OUTNUMBERED
                            && <div className="jcb gp10">
                                {nl?.notificationJson?.isInstantBuyAvailable && JSON.parse(nl.notificationJson.isInstantBuyAvailable) && <Button onClick={() => handleRebid(nl, "buy", true)} variant="" className="btn-sm notification-button px10 f10 aic jcc buy-btn proBtn-hover">Buy Now</Button>}
                                <Button onClick={() => handleRebid(nl)} variant="dark" className="btn-sm notification-button px10 f10 aic jcc">Bid Again</Button>
                            </div>
                        }
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRE_ALARM_7 
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRE_ALARM_3
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRED)
                            && <Button onClick={() => setIsRenewalStore(true)} variant="dark" className="btn-sm notification-button px10 f10 aic jcc">Renew License</Button>
                        }
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPING_INFO
                            && <Button
                                variant="warning"
                                className="btn btn-sm btn-warning border-round f12 aic jcc"
                                onClick={() => { setOrderDetailsSid(nl.notificationJson.orderDetailsSid); setIsProvideShipping(true) }}
                            >
                                <div className="aic">
                                    <div className="">Provide Shipping Info</div>
                                </div>
                            </Button>
                        }
                    </div>
                </div>}
            </div>
        </div>
        {
            reportModal 
            && <ReportIssue {...{ 
                reportModal, 
                setReportModal, 
                listingInfo: nl,  
                reportType: nl.notificationJson.type, 
                updateNotification, 
                setShow 
            }}/>
        }
        {
            showSelectFFlAndDate 
            && <SelectFflAndDate {...{ 
                show: showSelectFFlAndDate, 
                setShow: setShowSelectFFlAndDate, 
                nl, 
                updateNotification 
            }}/>
        }
        {
            showConfirmReturnDate 
            && returnDetailsSid 
            && notificationSid 
            && <ReturnConfirmDate {...{ 
                show: showConfirmReturnDate, 
                setShow: setShowConfirmReturnDate, 
                returnDetailsSid, 
                notificationSid, 
                updateNotification 
            }}/>
        }
        {
            showReturnArriveStep 
            && orderDetailsSid 
            && <ReturnArrivedSteps {...{ 
                show: showReturnArriveStep, 
                setShow: setShowReturnArriveStep, 
                nl, 
                orderDetailsSid, 
                updateNotification,
                type: nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? NOTIFICATION_CONSTANTS.USER_TYPE.SELLER : NOTIFICATION_CONSTANTS.USER_TYPE.BUYER
            }}/>
        }
        {
            counterOffer 
            && <CounterTrade {...{ 
                show: counterOffer,
                setShow: setCounterOffer,
                nl, 
                callBack: (sid) => {updateNotification(sid)} 
            }}/>
        }
        {
            pickUpDate 
            && ohlSid 
            && <PickUpDate {...{ 
                    show: pickUpDate,
                    setShow: setPickUpdate,
                    ohlSid, 
                    nl, 
                    updateNotification, 
                    itemType: nl.notificationJson.itemType 
                }} 
            />
        }
        {
            showConfirm 
            && ohlSid 
            && <ConformDate {...{ 
                    show: showConfirm,
                    setShow: setShowConfirm,
                    ohlSid, 
                    updateNotification, 
                    nl 
                }}
            />
        }
        {
            arrived 
            && <ArrivedSteps
                {...{
                    show: arrived,
                    setShow: setArrived,
                    nl,
                    getAllNotificationsList,
                    type: nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? NOTIFICATION_CONSTANTS.USER_TYPE.SELLER : NOTIFICATION_CONSTANTS.USER_TYPE.BUYER
                }}
            />
        }
        {
            isProvideShipping
            && orderDetailsSid
            && <ProvideShippingInfo {...{
                show: isProvideShipping,
                setShow: setIsProvideShipping,
                orderDetailsSid,
                nl,
                updateNotification
            }}/>
        }
        {
            isRenewalStore 
            && <StoreRenewalModal {...{
                show: isRenewalStore, 
                setShow: setIsRenewalStore,
                nl,
                updateNotification
            }}/>
        }
        {ConfirmationComponent}
        {RebidAlertComponent}
    </>;
}

export default NewNotification;