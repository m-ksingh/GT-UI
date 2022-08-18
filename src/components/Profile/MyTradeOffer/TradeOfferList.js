import { useState } from 'react';
import { Button } from 'react-bootstrap';
import _ from 'lodash';
import { ICN_YES_GREEN, ICN_CLOSE_RED, ICN_TRADE_MX, ICN_TRADE_EX,IcnCircleInfo, IcnWarningCircle } from '../../icons';
import moment from 'moment'
import ApiService from '../../../services/api.service';
import PickUpDate from '../Notification/PickUpDate';
import ConformDate from '../Notification/ConformDate';
import { NOTIFICATION_CONSTANTS } from '../Notification/Constants/NotificationConstants';
import CounterTrade from '../Notification/CounterTrade';
import useToast from '../../../commons/ToastHook';
import { showLabelByStatus } from '../../../services/CommonServices';

const TradeOfferList = ({ myLists, isDataLoaded, setIsReloadList, tradeType = "Submitted", updateList = () => {} }) => {
    const Toast = useToast();
    const [pickUpDate, setPickUpdate] = useState(false)
    const [showConform, setShowConform] = useState(false)
    const [counterOffer, setCounterOffer] = useState(false)
    const [selectedTrade, setSelectedTrade] = useState({});

    // get received bid       
    const acceptedRejectTrade = (status, sid) => {
        try {
            ApiService.acceptRejectBidTrade(status, sid).then(
                response => {
                    Toast.success({ message: `Trade ${status === NOTIFICATION_CONSTANTS.STATUS.ACCEPTED ? "accepted" : "rejected"} successfully`, time: 2000 });
                    // updateNotification(sid)
                },
                err => {
                    Toast.error({ message: err.response && err.response.data ? (err.response.data.error || err.response.data.status) : 'bid failed', time: 2000 });
                }
            ).finally(() => {
                setIsReloadList(true);
            });
        } catch (err) {
            console.error('error occur on acceptedBid()', err)
        }
    }

    /**  this method is update notification status
     * @param {String} ohl = order has listing sid
    */
    const updateNotification = (notifId) => {
        try {
            ApiService.updateNotification(notifId).then(
                response => {
                    // 
                },
                err => {
                    if (err && err.response.status === 401) {
                        Toast.error({ message: ``, time: 2000 });
                    }
                }
            );
        } catch (err) {
            Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            console.error('error occur on updateNotification()', err);
        }
    }

    // get image
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item)) {
            const imagesByItem = JSON.parse(item)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    return (<div className="">
        <div className="tab-pane">
            <div className="row">
                <div className="col">
                    {
                        isDataLoaded && myLists.map((list, index) => <div key={index} className="myBidbox myWishlistbox">
                            <div className="myBidbox-title jcb">
                                <div className="aic"><span className="mr5"><IcnCircleInfo /></span><span className="pt3 f12">Trade Offer {tradeType}</span></div>

                                <div className="small-size text-muted">
                                    {moment(list.placedOn).startOf('minute').fromNow()}
                                </div>
                            </div>
                            <div className="">
                                <div>
                                    <div className="border-top border-bottom pt-2">
                                        {
                                            tradeType !== "Submitted"
                                            && <div className="font-it">
                                                <span>Trade offer received for your listing. </span>
                                                {Number(list.tradeOfferBalance) > 0 && <span>Additional amount offered is <span className="text-semi-bold">${list.tradeOfferBalance}</span></span>}
                                            </div>
                                        }
                                        {tradeType === "Submitted" && <div className="font-it">You have successfully placed a trade offer with <b>{list.postedByFirstName} {list.postedByLastName}</b> for <b>{list.tradeOfferTitle}</b></div>}

                                        <div className="tradeOffer-container">

                                            {/* ....your product .... */}
                                            <div className="tradeOffer-box">
                                                <div className="text-muted text-center mb-2">LISTED ITEM</div>
                                                <div className="">
                                                    <div className="text-center">
                                                        <div className="prod-thumbnail-img m-auto notif-prod-img" style={{ backgroundImage: `url(${getMyImage(list.yourProductListingContent)})` }}></div>
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-sm-9">
                                                        <h5 className="title-md mb-1">{list.yourProductTitle}</h5>
                                                        <p className="text-muted mb-1">{list.yourProductCategoryName}</p>
                                                    </div>

                                                    <div className="WishlistItem-price col-sm-3">
                                                        <p className="title-md mb-2">${list?.tradeReservePrice || 0}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div>
                                                        <div className="title-sm mb-1">{list.yourProductManufacturerName}</div>
                                                    </div>
                                                    <div>
                                                        <span className="item-cond-badge">{list.yourProductConditionName}</span>
                                                    </div>
                                                </div>
                                                <div className="trade-circle">
                                                    <ICN_TRADE_MX />
                                                </div>
                                            </div>
                                            {/* ....trade offer.... */}
                                            <div className="tradeOffer-box">
                                                <div className="text-muted text-center mb-2">TRADE OFFER</div>
                                                <div className="">
                                                    <div className="text-center">
                                                        <div className="prod-thumbnail-img m-auto notif-prod-img" style={{ backgroundImage: `url(${getMyImage(list.tradeOfferListingContent)})` }}></div>
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-sm-9">
                                                        <h5 className="title-md mb-1">{list.tradeOfferTitle}</h5>
                                                        <p className="text-muted mb-1">{list.tradeOfferCategoryName}</p>
                                                    </div>
                                                    <div className="WishlistItem-price col-sm-3">
                                                        <p className="title-md mb-2">${list?.tradeOfferValue || list?.tradeOfferTradeReservePrice || 0}</p>

                                                    </div>
                                                </div>
                                                <div>
                                                    <div>
                                                        <div className="title-sm mb-1">{list.tradeOfferManufacturerName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="item-cond-badge">{list.yourProductConditionName}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="jcb pt-2 aic">
                                { ((tradeType === 'Received') && list.tradeOfferTradeExpiresOn) || ((tradeType === 'Submitted') && list.tradeExpiresOn) ?
                                    <div>
                                        <div>Expires</div>
                                        <div className="small-size aic">
                                            <div className="pr-2"><IcnWarningCircle /></div>
                                            <div className="pt2 expireTime">{((tradeType === 'Received') && moment(list.tradeOfferTradeExpiresOn).endOf('seconds').fromNow()) || ((tradeType === 'Submitted') && moment(list.tradeExpiresOn).endOf('seconds').fromNow())}</div>
                                        </div>
                                    </div> : ""
                                }
                                <div>
                                    {
                                        tradeType !== 'Submitted'
                                        && (list.status === NOTIFICATION_CONSTANTS.STATUS.PLACED
                                            || list.status === NOTIFICATION_CONSTANTS.STATUS.COUNTER_REJECTED)
                                        && <>
                                            <Button 
                                                variant="dark" 
                                                className="btn-sm border-round mr10 px10 f10" 
                                                onClick={() => { 
                                                    setCounterOffer(true); 
                                                    setSelectedTrade(list) 
                                                }}
                                                disabled={
                                                    list?.tradeCounterCount >= 3 
                                                    || Number(list?.tradeOfferValue) >= Number(list?.tradeReservePrice)
                                                    || ((Number(list?.tradeReservePrice) - (Number(list?.tradeOfferBalance) + Number(list?.tradeOfferValue)) <= 0))
                                                } 
                                            >Counter Offer</Button>
                                            <Button variant="outline" className="mr10 btn-sm border-round acceptBtn f10" onClick={() => acceptedRejectTrade(NOTIFICATION_CONSTANTS.STATUS.ACCEPTED, list.orderHasListingTableSid)}><div className="aic"><div className="mr5"><ICN_YES_GREEN /></div><div className="pt2">Accept</div></div></Button>
                                            <Button variant="outline" className="btn-sm border-round rejectBtn f10" onClick={() => acceptedRejectTrade(NOTIFICATION_CONSTANTS.STATUS.REJECTED, list.orderHasListingTableSid)}><div className="aic"><div className="mr5"><ICN_CLOSE_RED /></div><div className="pt2">Reject</div></div></Button>
                                        </>
                                    }
                                    {
                                        (
                                            (tradeType === 'Submitted') 
                                            || (
                                                tradeType === 'Received' 
                                                && (
                                                    (list.status !== NOTIFICATION_CONSTANTS.STATUS.PLACED && list.status !== NOTIFICATION_CONSTANTS.STATUS.COUNTER_REJECTED)
                                                    // || list.status !== NOTIFICATION_CONSTANTS.STATUS.COUNTER_REJECTED
                                                )
                                            )) && <label>Status: <span class="title-md">{showLabelByStatus(list.status) || list.status}</span></label>
                                    }
                                </div>
                            </div>
                        </div>)
                    }
                    {
                        isDataLoaded && !myLists.length && <div class="gunt-error py-3 mt-2 bg-white">No Data Found</div>
                    }
                </div>
            </div>
        </div>
        {
            counterOffer
            && !_.isEmpty(selectedTrade)
            && <CounterTrade 
                show={counterOffer} 
                setShow={setCounterOffer} 
                {...{ 
                    nl: selectedTrade, 
                    // updateNotification, 
                    callBack: (sid) => {
                        updateList();
                        updateNotification(sid)
                    } 
                }} 
            />
        }
        {pickUpDate && <PickUpDate show={pickUpDate} setShow={setPickUpdate} />}
        {showConform && <ConformDate show={showConform} setShow={setShowConform} />}
    </div>)
}
export default TradeOfferList