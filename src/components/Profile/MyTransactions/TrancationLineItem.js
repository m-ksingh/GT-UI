import React, { useState, useContext, memo, Fragment, useEffect } from 'react';
import { NOTIFICATION_CONSTANTS } from '../Notification/Constants/NotificationConstants';
import { IcnCircleInfo, IcnLocation, TRADE_ICON, ICN_CHEVRON_RIGHT, ICN_CHEVRON_DOWN, ICN_YES_GREEN, ICN_CLOSE_RED, ICN_TRADE_MX, IcnWarningCircle, IcnCalender, IcnTrashRed } from '../../icons';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import { showLabelByStatus, showDateTime } from '../../../services/CommonServices';
import PickUpDate from '../Notification/PickUpDate';
import ConformDate from '../Notification/ConformDate';
import moment from 'moment';
import { Button, Collapse } from 'react-bootstrap';
import CounterTrade from '../Notification/CounterTrade';
import ArrivedSteps from '../Notification/ArrivedSteps';
import Spinner from "rct-tpt-spnr";
import _ from 'lodash';
import useToast from '../../../commons/ToastHook';
import { isToday, isTodayCurrentHour } from '../../../services/CommonServices';
import { Link, useHistory } from 'react-router-dom';
import SelectFflAndDate from '../Notification/SelectFflAndDate';
import ReturnConfirmDate from '../Notification/ReturnConfirmDate';
import ReturnArrivedSteps from '../Notification/ReturnArrivedSteps';
import { useAuthDispatch, useAuthState } from '../../../contexts/AuthContext';
import ReportIssue from "../../Shared/ReportIssue";
import ProvideShippingInfo from '../Notification/ProvideShippingInfo';
import { useConfirmationModal } from '../../../commons/ConfirmationModal/ConfirmationModalHook';
import ViewLocation from '../../Shared/ViewLocation';
import { AppContext } from '../../../contexts/AppContext';
import { useBasicModal } from '../../../commons/BasicModal/BasicModalHook';
import StoreRenewalModal from '../Notification/StoreRenewalModal';
import ApiService from '../../../services/api.service';
import ReturnConfirm from '../MyOrders/ReturnConfirm';
import OrderDetailsTimeline from './OrderDetailsTimeline';
import FareBreakUpModal from './FareBreakUpModal';
import { getBuyType, getBuyTitle, getOrderTitle, getOrderDescription } from '../Notification/Service/NotificationService';

const TrancationLineItem = ({
    trnsItem: nl,
    onSuccess = () => { },
    fromMyTransaction = true
}) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    let userDetails = useAuthState();
    const dispatch = useAuthDispatch();
    const history = useHistory();
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
    const [selectedOrder, setSelectedOrder] = useState({});
    const [showReturnConfirm, setShowReturnConfirm] = useState(false);
    const [timelineModal, setTimelineModal] = useState(false);
    const [fareBreakUpModal, setFareBreakUpModal] = useState(false);
    const [timer, setTimer] = useState("");
    const [open, setOpen] = useState(false);
    const [activeKey, setActiveKey] = useState([]);
    const [tradeOffers, setTradeOffers] = useState({});
    const [otherTradeOffers, setOtherTradeOffers] = useState({});


    const [priceDetails, setPriceDetails] = useState({});

    const [showRebidAlert, RebidAlertComponent] = useBasicModal({
        body: "This listing is no more available as item is bought with instant buy.",
        hideHeader: true
    });

    // console.log(nl.deliveryStatus);
    /**
        Check true or false of expand and collapse data 
        @prams - sid : selected item id 
    */
    const checkExpandData = (idx) => activeKey.some(r => r === idx)

    /**
       set the accordion key id as a array
       @prams - sid : onClick get sid oe current accordion
    */
    const onExpCollapse = (idx) => checkExpandData(idx)
        ? setActiveKey(activeKey.filter(r => r !== idx))
        : setActiveKey(activeKey.concat(idx))

    const getAllTradeOfferList = (listingDetailsSid) => {
        try {
            spinner.show("Fetching trade offers... Please wait...");
            ApiService.getAllTradeOffer(userDetails.user.sid, listingDetailsSid).then(
                (response) => {
                    let tmpResponse = response.data.map(r => ({ ...r, "notificationJson": r.notificationJson ? JSON.parse(r.notificationJson) : null }))
                    setTradeOffers({ ...tradeOffers, [listingDetailsSid]: tmpResponse });
                    spinner.hide();
                },
                (err) => {
                    spinner.hide();
                    Toast.error({
                        message: err.response?.data
                            ? err.response?.data.error || err.response?.data.status
                            : "API Failed",
                        time: 2000,
                    });
                }
            );
        } catch (err) {
            spinner.hide();
            console.error("Error occured while getAllTradeOfferList--", err);
        }
    }

    const getPriceDetails = (orderDetailsSid) => {
        try {
            spinner.show("Fetching price details... Please wait...");
            ApiService.getPriceDetails(orderDetailsSid).then(
                (response) => {
                    setPriceDetails(response.data);
                    spinner.hide();
                },
                (err) => {
                    spinner.hide();
                    Toast.error({
                        message: err.response?.data
                            ? err.response?.data.error || err.response?.data.status
                            : "API Failed",
                        time: 2000,
                    });
                }
            );
        } catch (err) {
            spinner.hide();
            console.error("Error occured while getPriceDetails--", err);
        }
    }

    const viewMoreTradeItems = (info) => {
        try {
            ApiService.viewOtherTradeItems(info.orderHasListingsDetailsSid, info.tradeOfferListingSid).then(
                (response) => {
                    setOtherTradeOffers({ ...tradeOffers, [info.tradeOfferListingSid]: response.data });
                    spinner.hide();
                },
                (err) => {
                    spinner.hide();
                    Toast.error({
                        message: err.response?.data
                            ? err.response?.data.error || err.response?.data.status
                            : "API Failed",
                        time: 2000,
                    });
                }
            );
        } catch (err) {
            spinner.hide();
            console.error("Error occured while viewMoreTradeItems--", err);
        }
    }

    // shwo image
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item)) {
            const imagesByItem = JSON.parse(item)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    /**  this method is update notification status
      * @param {String} ohl = order has listing sid
     */
    const updateNotification = (notifId) => {
        try {
            spinner.show("Please wait...");
            onSuccess(); // to update transaction list
            ApiService.updateNotification(notifId).then(
                response => {
                    setTimeout(() => { spinner.hide(); }, 2000);
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

    /**  this method trigger when user click on view product to check listing is active or not
    * @param {String} sid = listing sid
    * @param {String} notifId = notification sid
    */
    const validateActiveListing = (sid, notifId, title) => {
        try {
            spinner.show("Please wait...");
            ApiService.validateActiveListing(sid).then(
                response => {
                    if (response.data) {
                        if (history?.location?.pathname
                            && history.location.pathname.split("/")[1] == 'product') {
                            // setShowNotification(!showNotification);
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
            console.error('error occur on validateActiveListing()', err);
        }
    }

    // this method trigger when user click on rebid
    const handleRebid = async (nl, type = "bid", sell = false) => {
        try {
            spinner.show("Please wait...");
            let isListingActive = await ApiService.validateActiveListing(nl.notificationJson.sid);
            if (isListingActive.data) {
                if (history?.location?.pathname
                    && (history.location.pathname.split("/")[2] == 'bid' || history.location.pathname.split("/")[1] == 'product')) {
                    spinner.hide();
                }
                history.push({
                    pathname: sell && type === "buy" ? `/product/${nl.notificationJson.sid}` : `/order/bid/${nl.notificationJson.sid}`,
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
                                name: `Make a Bid`,
                                path: `/order/bid/${nl.notificationJson.sid}`,
                            }],
                        notifId: nl.sid
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
                    onSuccess();
                    Toast.success({ message: `Trade ${status === NOTIFICATION_CONSTANTS.STATUS.ACCEPTED ? "accepted" : "rejected"} successfully`, time: 3000 });
                },
                err => {
                    spinner.hide();
                    if (err.response && err.response.status === 401) Toast.error({ message: err.response.data ? (err.response.data.error || err.response.data.message) : 'Internal Server Error!', time: 3000 });
                    if (err.response && err.response.status === 403) {
                        Toast.error({ message: err.response.data && (err.response.data.error || err.response.data.message), time: 3000 });
                        updateNotification(notifId);
                        onSuccess();
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
                        getAllTradeOfferList(selectedOrder.listingDetailsSid);
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

    // this metho to show dispute label
    const showPenaltyLabel = (disputeResolution) => {
        try {
            let resolution = JSON.parse(disputeResolution).find(r => r.appliedTo === (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_B ? GLOBAL_CONSTANTS.USER_TYPE.BUYER : GLOBAL_CONSTANTS.USER_TYPE.SELLER))
            return <span>The amount of <span className="text-semi-bold">${resolution.amount}</span> has been {resolution.function === GLOBAL_CONSTANTS.TRANSACTION_TYPE.DEBIT ? " debited as a penalty from " : " credited to "} your account.</span>
        } catch (err) {
            console.error("Error in showPenaltyLabel--", err);
        }
    }

    // listening for bid exp time
    useEffect(() => {
        if (!_.isEmpty(nl.auctionExpireOn) && nl.type === NOTIFICATION_CONSTANTS.BUY_TYPE.BID_RECEIVED) {
            spinner.show("Please wait...");
            let bidExpire = nl.auctionExpireOn;
            const interval = setInterval(() => {
                let todayDate = moment(new Date());
                let bidExpireDate = moment(bidExpire);
                let diff = bidExpireDate.diff(todayDate);
                let diffDuration = moment.duration(diff);

                let expireTimes = ((diffDuration?.days() > 0 ? `${diffDuration.days() + "d "}` : 0) +
                    (diffDuration?.hours() > 0 ? `${diffDuration.hours() + "h "}` : 0) +
                    (diffDuration?.minutes() > 0 ? `${diffDuration.minutes() + "m "}` : 0) +
                    (diffDuration?.seconds() > 0 ? `${diffDuration.seconds()}` + "s" : 0)
                );
                setTimer(expireTimes);
                spinner.hide();
            }, 1000);
            return () => {
                clearInterval(interval);
            }
        }
    }, [nl]);

    return <div className="trn-item b-ddd b-rad-4 mb10">
        <div className="trn-ite-h bb-ddd jcb py10 px15">
            <div className="flx">
                <div className="mr10"><IcnCircleInfo {...{ height: "12px", width: "12px" }} /></div>
                <div className={`mr10 trn-bt-label ${getBuyType(nl.type) === "Sale" ? "trn-bt-label-sell" : ""}`}>
                    {getBuyType(nl.type)}
                </div>
                <div className="trn-item-h-title">{getBuyTitle(nl.buyType || nl.type)}{(nl.notificationType || nl.type) && " - "}{getOrderTitle(nl.notificationType || nl.type, nl)}</div>
            </div>
            <div className="c727 f12">{moment(nl.placedOn || nl.postedOn).format('LL')}</div>
        </div>
        <div className="row px15 pt15">
            <div className="col-sm-12 col-md-8 pr-0">
                <div className="row w100 trn-item-details gp5">
                    <div className="flx col-sm-12 col-md-7">
                        {
                            nl.buyType === "TRADE"
                                && nl.type === NOTIFICATION_CONSTANTS.BUY_TYPE.TRADE_OFFER_PLACED
                                ? <Fragment>
                                    <div className="trn-item-trade-box p-rel">
                                        <div className="jcc f8 py5 c727">YOUR PRODUCT</div>
                                        <div className="jcc "><div className="trn-item-img" style={{ backgroundImage: `url(${getMyImage(nl.yourProductListingContent)})` }}></div></div>
                                        <div className="pt5">
                                            <div className="f14 theme-color elps" title={nl.yourProductTitle}>{nl.yourProductTitle}</div>
                                            <div className="jcb">
                                                <div className="f10 c727">{nl.yourProductConditionName}</div>
                                                <div className="f12 theme-color">${nl?.tradeReservePrice || 0}</div>
                                            </div>
                                        </div>
                                        <div className="trn-trade-circle">
                                            <ICN_TRADE_MX />
                                        </div>
                                    </div>
                                    <div className="trn-item-trade-box">
                                        <div className="jcc f8 py5 c727">TRADE OFFER</div>
                                        <div className="jcc"><div className="trn-item-img" style={{ backgroundImage: `url(${getMyImage(nl.tradeOfferListingContent)})` }}></div></div>
                                        <div>
                                            <div className="f14 theme-color elps" title={nl.tradeOfferTitle}>{nl.tradeOfferTitle}</div>
                                            <div className="jcb">
                                                <div className="f10 c727">{nl.tradeOfferConditionName}</div>
                                                <div className="f12 theme-color">${nl?.tradeOfferValue || nl?.tradeOfferTradeReservePrice || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Fragment>
                                :
                                <Fragment>
                                    <div className="trn-item-img" style={{ backgroundImage: `url(${getMyImage(nl.listingDetailsContent)})` }}></div>
                                    <div className="pl10">
                                        <div className="trn-item-title f14 fw600" title={nl.title}>{nl.title}</div>
                                        <div className="f12 c727">{nl.tconditionName}</div>
                                        <div className="f12 c727">Qty. {nl.orderQuantity || 1}</div>
                                    </div>
                                </Fragment>
                        }

                    </div>
                    <div className="col-sm-12 col-md-4">
                        {
                            nl.type === NOTIFICATION_CONSTANTS.BUY_TYPE.BID_RECEIVED
                                ? <div className="">
                                    <div className="f12 c727 jcb trn-item-bid-status"><div className="flx1">Current Bids :</div><div className="fw600 c111 text-left flx1">{nl.bidCount || "-"}</div></div>
                                    <div className="f12 c727 jcb trn-item-bid-status"><div className="flx1">Highest Bid :</div><div className="fw600 c111 text-left flx1">{nl.highestBidAmount || "-"}</div></div>
                                    <div className="f12 c727 jcb trn-item-bid-status"><div className="flx1">Time left :</div><div className="fw600 trn-item-exp text-left flx1">{timer}</div></div>
                                </div>
                                : <>
                                    {nl.type !== "trade_offer_received" && <div className="ml10">
                                        <div className="f12 c727">Total Price</div>
                                        <div className="trn-item-price">${nl.totalPrice ? Number(nl.totalPrice).toFixed(2) : 0}</div>
                                        <div
                                            className="text-link f11"
                                            onClick={() => {
                                                // getPriceDetails(nl.notificationJson?.orderDetailsSid || nl?.orderSid); 
                                                setSelectedOrder(nl);
                                                setFareBreakUpModal(true);
                                            }}
                                        >View Price Details</div>
                                    </div>}
                                </>
                        }
                    </div>
                </div>
                <div className="pt5 f10 c333">
                    {/* <span className="mr5"><IcnLocation /></span>
                <span className="f10 c727">
                    <span className="fw600">FFL Store </span> : Gun Store, Main Street, NYC 10046
                </span> */}
                    {
                        nl?.notificationJson?.deliveryLocation
                        && <ViewLocation {...{ deliveryLocation: nl.notificationJson.deliveryLocation }} />
                    }
                </div>
                {
                    nl.deliveryStatus &&  
                    <div className={`trn-item-timeline jcb mb10 col-sm-8 ${nl.orderSid ? "" : "cp-none"}`} onClick={() => { setTimelineModal(true) }}>
                        <div className="f13 c111 fw600">{nl.deliveryStatus ? showLabelByStatus(nl.deliveryStatus) : ""}</div>
                        <div className="f10 jcb aic">
                            <div className="c727">{nl.orderLatestActivityDate ? `${moment(nl.orderLatestActivityDate).format('ll')} at ${moment(nl.orderLatestActivityDate).format('LT')}` : ""}</div>
                            <div className="px10 trn-item-timeline-arrow"><ICN_CHEVRON_RIGHT {...{ stroke: "#8DB761" }} />
                            </div>
                        </div>
                    </div>
                }
            </div>
            <div className="col-sm-12 col-md-4 trn-item-desc c727 f12">
                <div>
                    {getOrderDescription(nl.notificationType, nl)}
                </div>
                <div className="jab aic pt10">
                    <div className="">

                        {/* ------------- return request button ------------------- */}
                        <div className="">
                            {
                                nl.userType === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER
                                && nl.deliveryStatus !== NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_SCHEDULED
                                && nl.deliveryStatus !== NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_CONFIRMED
                                && nl.returnable
                                && nl.eligibleReturnDate
                                && <button
                                    className="btn-sm border-round rejectBtn f12 btn btn-outline"
                                    onClick={() => { setSelectedOrder(nl); setShowReturnConfirm(true) }}
                                    disabled={(nl?.eligibleReturnDate && new Date().getTime() > new Date(nl.eligibleReturnDate).getTime()) || nl.deliveryStatus !== NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED}
                                >
                                    {nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_PLACED && "Return Placed"}
                                    {nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_REJECTED && "Return Rejected"}
                                    {/* {nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_SCHEDULED && "Return Scheduled"} */}
                                    {nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_CONFIRMED && "Return Date Confirmed"}
                                    {nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_OTP_REQUESTED && "Return OTP Requested"}
                                    {nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_COMPLETED && "Return Completed"}
                                    {
                                        (nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED
                                            || nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)
                                        && <span>Return Item</span>
                                    }
                                </button>
                            }
                            {
                                nl.returnable
                                && nl.eligibleReturnDate
                                && (nl.eligibleReturnDate > moment().format()
                                    && ((nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED)
                                        || (nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)))
                                && <div className="f11 c777">Return eligible till <span className="fw600">{moment(nl.eligibleReturnDate).format("LL")}</span></div>
                            }
                            {
                                nl.returnable
                                && nl.eligibleReturnDate
                                && (nl.eligibleReturnDate < moment().format()
                                    && ((nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED)
                                        || (nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)))
                                && <div className="f11 c777">Return closed on <span className="fw600">{moment(nl.eligibleReturnDate).format("LL")}</span></div>
                            }
                        </div>
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LISTING_SOLD
                            && (nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_PLACED
                                || nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SHIPPING_INFO_PROVIDED)
                            && <div className="">
                                <Button variant="warning" className="btn btn-sm btn-warning border-round f12 aic jcc" onClick={() => { setOhlSid(nl.notificationJson.ohl); setPickUpdate(true) }}>
                                    <div className="aic">
                                        <div className="pr-2 aic jcc"><IcnCalender /></div>
                                        <div className="">{((nl.notificationJson?.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || nl.notificationJson.adminToFFlStore) ? "Select Items & Pickup Date" : "Set Pickup Date"}</div>
                                    </div>
                                </Button>
                                <div className="">
                                    {
                                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LISTING_SOLD
                                        && nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_PLACED
                                        && nl.notificationJson.isShipBeyondPreferredDistance
                                        && nl.notificationJson.orderShippingInfoJson
                                        && <Button
                                            variant="warning"
                                            className="btn btn-sm btn-warning border-round f12 aic jcc mt10"
                                            onClick={() => { setOrderDetailsSid(nl.notificationJson.orderDetailsSid); setIsProvideShipping(true) }}
                                        >
                                            <div className="aic">
                                                <div className="">Provide Shipping Info</div>
                                            </div>
                                        </Button>
                                    }
                                </div>
                            </div>
                        }
                        {
                            (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED
                                || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY)
                            && nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULED
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
                                        && <Button variant="outline" className="btn-sm rejectBtn f10 notification-button ml5" onClick={() => { cancelOrder(nl.notificationJson.orderDetailsSid, fromMyTransaction ? nl.notificationSid : nl.sid, nl.notificationJson.updatedQuantity) }}>Cancel Order</Button>
                                    }
                                </div>
                            </div>
                        }
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SCHEDULE_ALARM
                            && nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_CONFIRMED
                            && <div className="jcb aic">
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
                                // || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                            )
                            && <div className="acceptRejectBtn aic">
                                {
                                    (nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                        // || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED)
                                    && <Button
                                        variant="dark"
                                        className="btn-sm notification-button mr5 px5 f10 aic jcc"
                                        onClick={() => {
                                            setSelectedOrder(nl);
                                            setCounterOffer(true)
                                        }}
                                        disabled={
                                            nl.notificationJson?.tradeCounterCount >= 3
                                            || Number(nl.notificationJson.tradeWithPrice) >= Number(nl.notificationJson.price)
                                            || ((Number(nl.notificationJson.price) - (Number(nl.notificationJson.tradeOfferBalance) + Number(nl.notificationJson.tradeWithPrice)) <= 0))
                                        }
                                    >Counter Offer
                                    </Button>
                                }

                                {
                                    nl.userType === "BUYER"
                                    && (
                                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                        || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED
                                        // || nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                    ) && <>
                                        <Button
                                            variant="outline"
                                            className="mr5 btn-sm acceptBtn f10 notification-button aic jcc"
                                            onClick={() => { acceptRejectBidTrade(NOTIFICATION_CONSTANTS.STATUS.ACCEPTED, nl.notificationJson.ohl, fromMyTransaction ? nl.notificationSid : nl.sid, nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED ? NOTIFICATION_CONSTANTS.USER_TYPE.BUYER : NOTIFICATION_CONSTANTS.USER_TYPE.SELLER) }}
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
                                                setSelectedOrder(nl);
                                                nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED
                                                    ? rejectCounterTradeByBuyer(nl.notificationJson.ohld, nl.notificationJson.previousTradeOfferBalance, fromMyTransaction ? nl.notificationSid : nl.sid)
                                                    : acceptRejectBidTrade(NOTIFICATION_CONSTANTS.STATUS.REJECTED, nl.notificationJson.ohl, fromMyTransaction ? nl.notificationSid : nl.sid, nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED ? NOTIFICATION_CONSTANTS.USER_TYPE.BUYER : NOTIFICATION_CONSTANTS.USER_TYPE.SELLER)
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
                                onClick={() => validateActiveListing(nl.notificationJson.sid, fromMyTransaction ? nl.notificationSid : nl.sid, nl.notificationJson.title)}
                            >
                                <div className="aic">
                                    <div className="">View Product</div>
                                </div>
                            </Button>
                        }
                        {
                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_PLACED
                            && (nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_PLACED || nl.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_PLACED)
                            && <div className="jcb aic">
                                <Button variant="dark" className="btn-sm border-round mr10 px10 f12 aic jcc" onClick={() => { setShowSelectFFlAndDate(true) }}>{"Select FFL Store & Date"}</Button>
                                <Button variant="outline" className="btn-sm border-round rejectBtn f12 aic jcc" onClick={() => { rejectReturnOrder(nl.notificationJson.orderDetailsSid, fromMyTransaction ? nl.notificationSid : nl.sid) }}>
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
                            && <Button variant="warning" className="btn btn-sm btn-warning border-round f12 aic jcc" onClick={() => { setNotificationSid(fromMyTransaction ? nl.notificationSid : nl.sid); setReturnDetailsSid(nl.notificationJson.returnDetailsSid); setShowConfirmReturnDate(true) }}>
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

                </div>
                <div className="lnh-15 pt5 pb10">
                    {
                        nl.notificationJson
                        && nl.notificationJson?.expiresOn
                        && (nl.notificationType !== NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED)
                        && !_.isEmpty(nl.notificationJson?.expiresOn)
                        && <div className="aic">
                            <div className="f12 mr5 trn-item-exp">{new Date(nl.notificationJson?.expiresOn).getTime() < new Date().getTime() ? "Expired" : "Expires"}</div>
                            <div className="small-size aic">
                                {/* <div className="pr-2"><IcnWarningCircle /></div> */}
                                <div className="pt2 trn-item-exp f12">{showDateTime(nl.notificationJson?.expiresOn)}</div>
                            </div>
                        </div>
                    }
                    {
                        nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED
                        && nl.notificationJson.bidAttemptsLeft
                        && <div className="small-size aic">
                            <div className="pr-2"><IcnWarningCircle /></div>
                            <div className="pt5 trn-item-exp f10">{nl.notificationJson.bidAttemptsLeft} attempt left</div>
                        </div>
                    }
                </div>
            </div>
            {
                nl.type === "trade_offer_received"
                && <>
                    <div
                        onClick={() => {
                            setOpen(!open);
                            if (!open)
                                getAllTradeOfferList(nl.listingDetailsSid);
                        }}
                        aria-controls="active-trade-offer"
                        aria-expanded={open}
                        className="trn-view-active-offer pl15 aic b-rad-2"
                    ><div className="trn-vao-icon">{open ? <ICN_CHEVRON_DOWN {...{ width: "9px", height: "5px", stroke: "#E83106" }} /> : <ICN_CHEVRON_RIGHT {...{ width: "5px", height: "9px", stroke: "#E83106" }} />}</div><div className="pl5 pt2">View Active Offers</div></div>
                    <Collapse in={open}>
                        <div id="active-trade-offer" className="px15 w100">
                            <div className="mt10">
                                {
                                    _.isEmpty(tradeOffers[nl.listingDetailsSid])
                                    && <div className="text-center c727 pb5">No active offers</div>
                                }
                                {
                                    !_.isEmpty(tradeOffers)
                                    && tradeOffers[nl.listingDetailsSid].map((tradeOfferItem, toi) => <div className="b-ddd b-rad-4 mb10 px15" key={tradeOfferItem.sid || toi}>
                                        <div className="row trn-vao-list-item aic px15" onClick={() => { setSelectedOrder(tradeOfferItem); onExpCollapse(toi) }}>
                                            <div className="col-sm-12 col-md-6 px-0">
                                                <div className="jcb aic">
                                                    <div className="jcb aic">
                                                        <div className="mr10 trn-vao-icon">
                                                            {
                                                                checkExpandData(toi)
                                                                    ? <ICN_CHEVRON_DOWN {...{ width: "9px", height: "5px", stroke: "#333333" }} />
                                                                    : <ICN_CHEVRON_RIGHT {...{ width: "5px", height: "9px", stroke: "#333333" }} />
                                                            }
                                                        </div>
                                                        <div className="pr10"><TRADE_ICON /></div>
                                                        <div className="f14 fw600">
                                                            {tradeOfferItem.tradeOfferTitle}
                                                            {tradeOfferItem.otherOfferedItemCount >= 1 && <span className="pl5">{"& "}{tradeOfferItem.otherOfferedItemCount} item(s)</span>}
                                                        </div>
                                                    </div>
                                                    <div className="aic jcb"><div className="f12 c727 pr10">Total Price</div><div className="theme-color f16 fw600">${tradeOfferItem.totalPrice ? Number(tradeOfferItem.totalPrice).toFixed(2) : 0}</div></div>
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-6 px-0">
                                                <div className="jcb aic pl5">
                                                    <div
                                                        className="text-link f11"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrder(tradeOfferItem);
                                                            setFareBreakUpModal(true);
                                                        }}
                                                    >View Price Details</div>
                                                    <div className="f12 c727">{moment(tradeOfferItem.placedOn).format("LL")}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <Collapse in={checkExpandData(toi)}>

                                            <div className="w100 bt-ddd">
                                                <div className="f12 pt5"><span className="c333 mr5">Total Cash Offered :</span><span className="fw600">${tradeOfferItem.tradeOfferBalance ? Number(tradeOfferItem.tradeOfferBalance).toFixed(2) : 0}</span></div>
                                                <div className="row mt5">
                                                    <div className="col-sm-12 col-md-7">
                                                        <div className="flx mb10">
                                                            <div className="flx3 aic w100">
                                                                <div className="trn-item-img" style={{ backgroundImage: `url(${getMyImage(tradeOfferItem.tradeOfferListingContent)})` }}></div>
                                                                <div className="pl10">
                                                                    <div className="trn-item-title f14 fw600" title={tradeOfferItem.tradeOfferTitle}>
                                                                        {tradeOfferItem.tradeOfferTitle}

                                                                    </div>
                                                                    <div className="f12 c727">{tradeOfferItem.tradeOfferConditionName}</div>
                                                                    <div className="f12 c727">Qty. {tradeOfferItem.orderQuantity || 1}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flx1">
                                                                <div className="ml10">
                                                                    <div className="f12 c727">Item Value</div>
                                                                    <div className="fw600 f14 c333">
                                                                        ${Number((tradeOfferItem.tradeofferSellPrice && tradeOfferItem.tradeOfferTradeReservePrice && tradeOfferItem.tradeofferSellPrice > tradeOfferItem.tradeOfferTradeReservePrice ? tradeOfferItem.tradeofferSellPrice : tradeOfferItem.tradeOfferTradeReservePrice) || tradeOfferItem.tradeOfferTradeReservePrice || tradeOfferItem.tradeofferSellPrice).toFixed(2) || 0}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {
                                                            !_.isEmpty(otherTradeOffers)
                                                            && !_.isEmpty(otherTradeOffers[tradeOfferItem.tradeOfferListingSid])
                                                            && otherTradeOffers[tradeOfferItem.tradeOfferListingSid].map((othrOffer, othrIndex) => <div key={othrIndex} className="flx mb10">
                                                                <div className="flx3 aic w100">
                                                                    <div className="trn-item-img" style={{ backgroundImage: `url(${getMyImage(othrOffer.listingDetailsContent)})` }}></div>
                                                                    <div className="pl10">
                                                                        <div className="trn-item-title f14 fw600" title={othrOffer.title}>
                                                                            {othrOffer.title}

                                                                        </div>
                                                                        <div className="f12 c727">{othrOffer.tconditionName}</div>
                                                                        <div className="f12 c727">Qty. {othrOffer.quantity || 1}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flx1">
                                                                    <div className="ml10">
                                                                        <div className="f12 c727">Item Value</div>
                                                                        <div className="fw600 f14 c333">
                                                                            ${Number((othrOffer.trade && othrOffer.sell && othrOffer.tradeReservePrice > othrOffer.sellPrice ? othrOffer.tradeReservePrice : othrOffer.sellPrice) || (othrOffer.trade && othrOffer.tradeReservePrice) || (othrOffer.sell && othrOffer.sellPrice)).toFixed(2) || 0}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>)
                                                        }
                                                        {
                                                            tradeOfferItem.otherOfferedItemCount >= 1
                                                            && _.isEmpty(otherTradeOffers[tradeOfferItem.tradeOfferListingSid])
                                                            && <div className="text-link f12" onClick={() => viewMoreTradeItems(tradeOfferItem)}>View {tradeOfferItem.otherOfferedItemCount} more item(s)</div>
                                                        }
                                                    </div>
                                                    <div className="col-sm-12 col-md-5">
                                                        <div className="mb10 f11 c333">{getOrderDescription(tradeOfferItem.notificationType, tradeOfferItem)}</div>
                                                        <div>
                                                            {
                                                                tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                                                && tradeOfferItem.notificationJson.tradeCounterCount >= 3
                                                                && <div className="text-danger f10">You have reached maximum counter offer limit</div>
                                                            }
                                                            {
                                                                (tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                                                    || tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED)
                                                                && tradeOfferItem.notificationJson?.tradeWithPrice
                                                                && tradeOfferItem.notificationJson?.price
                                                                && (Number(tradeOfferItem.notificationJson.tradeWithPrice) >= Number(tradeOfferItem.notificationJson.price)
                                                                    || ((Number(tradeOfferItem.notificationJson.price) - (Number(tradeOfferItem.notificationJson.tradeOfferBalance) + Number(tradeOfferItem.notificationJson.tradeWithPrice)) <= 0)))
                                                                && <div className="text-danger f10 counter-offer">You cannot counter offer as the buyer’s trade offer value is greater than or equal to the value of your listing</div>
                                                            }
                                                        </div>
                                                        {
                                                            (tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                                                || tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S
                                                                // || tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                                            )
                                                            && <div className="acceptRejectBtn aic">
                                                                {
                                                                    (tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                                                        // || tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                                                        || tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S)
                                                                    && <Button
                                                                        variant="dark"
                                                                        className="btn-sm notification-button mr5 px5 f10 aic jcc"
                                                                        onClick={() => {
                                                                            setSelectedOrder(tradeOfferItem);
                                                                            setCounterOffer(true)
                                                                        }}
                                                                        disabled={
                                                                            tradeOfferItem.notificationJson?.tradeCounterCount >= 3
                                                                            || Number(tradeOfferItem.notificationJson.tradeWithPrice) >= Number(tradeOfferItem.notificationJson.price)
                                                                            || ((Number(tradeOfferItem.notificationJson.price) - (Number(tradeOfferItem.notificationJson.tradeOfferBalance) + Number(tradeOfferItem.notificationJson.tradeWithPrice)) <= 0))
                                                                        }
                                                                    >Counter Offer
                                                                    </Button>
                                                                }

                                                                {
                                                                    (
                                                                        tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED
                                                                        || tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S
                                                                        // || tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED
                                                                    ) && <>
                                                                        <Button
                                                                            variant="outline"
                                                                            className="mr5 btn-sm acceptBtn f10 notification-button aic jcc"
                                                                            onClick={() => { acceptRejectBidTrade(NOTIFICATION_CONSTANTS.STATUS.ACCEPTED, tradeOfferItem.notificationJson.ohl, fromMyTransaction ? tradeOfferItem.notificationSid : tradeOfferItem.sid, tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED ? NOTIFICATION_CONSTANTS.USER_TYPE.BUYER : NOTIFICATION_CONSTANTS.USER_TYPE.SELLER) }}
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
                                                                                setSelectedOrder(tradeOfferItem);
                                                                                tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED
                                                                                    ? rejectCounterTradeByBuyer(tradeOfferItem.notificationJson.ohld, tradeOfferItem.notificationJson.previousTradeOfferBalance, fromMyTransaction ? tradeOfferItem.notificationSid : tradeOfferItem.sid)
                                                                                    : acceptRejectBidTrade(NOTIFICATION_CONSTANTS.STATUS.REJECTED, tradeOfferItem.notificationJson.ohl, fromMyTransaction ? tradeOfferItem.notificationSid : tradeOfferItem.sid, tradeOfferItem.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED ? NOTIFICATION_CONSTANTS.USER_TYPE.BUYER : NOTIFICATION_CONSTANTS.USER_TYPE.SELLER)
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
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="pt5 f10 c333">
                                                        {
                                                            tradeOfferItem?.notificationJson?.deliveryLocation
                                                            && <ViewLocation {...{ deliveryLocation: tradeOfferItem.notificationJson.deliveryLocation }} />
                                                        }
                                                    </div>

                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                    )}
                            </div>
                        </div>
                    </Collapse>
                </>
            }
        </div>

        {
            reportModal
            && <ReportIssue {...{
                reportModal,
                setReportModal,
                listingInfo: nl,
                reportType: nl.notificationJson.type,
                updateNotification: (sid) => {
                    updateNotification(nl.notificationSid);
                },
                setShow,
                fromMyTransaction
            }} />
        }
        {
            showSelectFFlAndDate
            && <SelectFflAndDate {...{
                show: showSelectFFlAndDate,
                setShow: setShowSelectFFlAndDate,
                nl,
                updateNotification: (sid) => {
                    updateNotification(nl.notificationSid);
                },
                fromMyTransaction
            }} />
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
                updateNotification: (sid) => {
                    updateNotification(nl.notificationSid);
                },
                fromMyTransaction
            }} />
        }
        {
            showReturnArriveStep
            && orderDetailsSid
            && <ReturnArrivedSteps {...{
                show: showReturnArriveStep,
                setShow: setShowReturnArriveStep,
                nl,
                orderDetailsSid,
                updateNotification: (sid) => {
                    updateNotification(nl.notificationSid);
                },
                type: nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? NOTIFICATION_CONSTANTS.USER_TYPE.SELLER : NOTIFICATION_CONSTANTS.USER_TYPE.BUYER,
                fromMyTransaction
            }} />
        }
        {
            counterOffer
            && <CounterTrade {...{
                show: counterOffer,
                setShow: setCounterOffer,
                nl: selectedOrder,
                callBack: (sid) => {
                    updateNotification(selectedOrder.notificationSid);
                },
                fromMyTransaction
            }} />
        }
        {
            pickUpDate
            && ohlSid
            && <PickUpDate {...{
                show: pickUpDate,
                setShow: setPickUpdate,
                ohlSid,
                nl,
                updateNotification: (sid) => {
                    updateNotification(nl.notificationSid);
                },
                itemType: nl.notificationJson.itemType,
                fromMyTransaction
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
                updateNotification: (sid) => {
                    updateNotification(nl.notificationSid);
                },
                nl,
                fromMyTransaction
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
                    // getAllNotificationsList,
                    onSuccess,
                    type: nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? NOTIFICATION_CONSTANTS.USER_TYPE.SELLER : NOTIFICATION_CONSTANTS.USER_TYPE.BUYER,
                    fromMyTransaction
                }} />
        }
        {
            isProvideShipping
            && orderDetailsSid
            && nl.notificationJson.orderShippingInfoJson
            && <ProvideShippingInfo {...{
                show: isProvideShipping,
                setShow: setIsProvideShipping,
                orderDetailsSid,
                nl: { ...JSON.parse(nl.notificationJson.orderShippingInfoJson), "notificationJson": JSON.parse(JSON.parse(nl.notificationJson.orderShippingInfoJson).notificationJson) } || nl,
                updateNotification: (sid) => {
                    updateNotification(sid);
                },
                fromMyTransaction
            }} />
        }
        {
            isRenewalStore
            && <StoreRenewalModal {...{
                show: isRenewalStore,
                setShow: setIsRenewalStore,
                nl,
                updateNotification: (sid) => {
                    updateNotification(nl.notificationSid);
                },
                fromMyTransaction
            }} />
        }
        {
            !_.isEmpty(selectedOrder)
            && showReturnConfirm
            && <ReturnConfirm {...{
                show: showReturnConfirm,
                setShow: setShowReturnConfirm,
                selectedOrder,
                onSuccess
            }} />
        }
        {
            timelineModal
            && nl.orderSid
            && <OrderDetailsTimeline {...{ show: timelineModal, setShow: setTimelineModal, nl }} />
        }
        {
            fareBreakUpModal
            && !_.isEmpty(selectedOrder)
            && <FareBreakUpModal {...{ show: fareBreakUpModal, setShow: setFareBreakUpModal, nl: selectedOrder }} />
        }
        {RebidAlertComponent}
    </div>;
}

export default memo(TrancationLineItem);