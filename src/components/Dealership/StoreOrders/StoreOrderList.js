import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'react-bootstrap';
import _ from 'lodash';
import moment from 'moment';
import { Collapse } from 'react-bootstrap';
import { ICN_STAR_Y, ICN_YES_GREEN, ICN_CLOSE_RED, IcnCircleInfo, ICN_CHEVRON_RIGHT, ICN_CHEVRON_DOWN } from '../../icons';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { showLabelByStatus } from '../../../services/CommonServices';
import { NOTIFICATION_CONSTANTS } from '../../Profile/Notification/Constants/NotificationConstants';
import ApiService from '../../../services/api.service';
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';

const StoreOrderList = ({ lists, isDataLoaded, orderType="placed" }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [show, setShow] = useState(false);
    const [activeKey, setActiveKey] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState({});
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listing_details_content)) {
            const imagesByItem = JSON.parse(item.listing_details_content)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    const getOrderHistoryDetails = (sid) => {
        let tmpList = [...myOrders];
        spinner.show("Please wait...");
        ApiService.getOrderHistory(sid).then(
            response => {
                tmpList.map((ordersByMonth) => {
                    ordersByMonth.orders.map((order) => {
                        if (order.orderDetailsTO.sid === sid) {
                            response.data.shift();
                            order.orderHistoryDetails = response.data;
                        }
                    })
                })
                setMyOrders(tmpList);
            },
            err => {
                console.error("Error occur when getOrderHistoryDetails--", err);
            }
        ).finally(() => {
            spinner.hide();
        });
    }

        /**
        Check true or false of expand and collapse data 
        @prams - sid : selected item id 
    */
        const checkExpandData = (sid) => activeKey.some(r => r === sid)

        /**
            set the accordion key id as a array
            @prams - sid : onClick get sid oe current accordion
        */
        const onExpCollapse = (sid) => checkExpandData(sid)
            ? setActiveKey(activeKey.filter(r => r !== sid))
            : setActiveKey(activeKey.concat(sid))

    useEffect(() => { setMyOrders(lists) }, [lists])

    return (<div className="">
        <div className="tab-pane">
            <div className="row">
                <div className="col">
                    {/* {
                        isDataLoaded && lists.slice().reverse().map((order, index) => {
                            return <div className="myWishlistbox m-2" key={index}>
                            <div className="row border-bottom m-1">
                                <div className="col-lg-6 col-6 p-0">
                                    <span className="orderno"></span>
                                </div>
                                <div className="col-lg-6 col-6 p-0 text-right">
                                    <span className="orderDate">Placed On: {new Date(order.placedOn).toDateString()}</span>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-6 col-6">
                                    <div className="WishlistItem">
                                        <div className="media">
                                            <img src={getMyImage(order.listingDetails)} className="mr-3" alt="..." />
                                            <div className="media-body">
                                                <h5 className="mt-0">{order.itemsOrdered[0].listingDetails.title}</h5>
                                                <p>Sold to: {order.placedBy?.firstName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-3">
                                    <div className="WishlistItem-rating">
                                       
                                    </div>
                                </div>
                                <div className="col-lg-3 col-3 text-right">
                                    <div className="WishlistItem-price">
                                        <p className="wprice-label">Price</p>
                                        <p className="wishlist-price">${order.itemsOrdered[0].listingDetails.sellPrice}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row order-footer pl5">
                                <div className="col-lg-12 location-box pl30">
                                   
                                        <label className="order-location">
                                            {
                                                order.deliveryLocationType === 'FFL' && <span>FFL Store :
                                                    {
                                                        !_.isEmpty(order.fflStoreLocation)
                                                        && <span className="pl5">
                                                            {
                                                                order?.fflStoreLocation?.storeName
                                                                || order?.fflStoreLocation?.licHolderName
                                                                || order?.fflStoreLocation?.name
                                                                || ''
                                                            },
                                                            {
                                                                order?.fflStoreLocation?.premStreet
                                                                || order?.fflStoreLocation?.premiseStreet
                                                                || ""

                                                            },
                                                            {
                                                                order?.fflStoreLocation?.premZipCode
                                                                || order?.fflStoreLocation?.premiseZipCode
                                                                || ""
                                                            }
                                                        </span>
                                                    }
                                                </span>
                                            }
                                            {
                                                order.deliveryLocationType === 'SHERIFF_OFFICE'
                                                && <span className="pl5">Sheriff Office :
                                                    {
                                                        order?.sheriffOfficeLocation?.poi?.name
                                                        || order?.sheriffOfficeLocation?.address?.freeformAddress
                                                        || order?.sheriffOfficeLocation?.freeformAddress
                                                        || ""
                                                    }
                                                </span>
                                            }
                                            {order.deliveryLocationType === 'OTHER_LOCATION' && <span>Other : {order?.otherLocation?.formatted_address || order?.otherLocation?.name || ""}</span>}
                                        </label>
                                    </div>
                                {
                                    order.deliveryStatus
                                    && <div className="col-lg-12 mt-1">
                                        <button className="ml-2 btn btn-success btn-sm order-status-btn">{showLabelByStatus(order.deliveryStatus)}</button>
                                        <span className="ml-2 orderDate"></span>
                                    </div>
                                }
                            </div>
                        </div>
                        })
                    }
                    {
                        isDataLoaded && !lists.length && <div class="gunt-error py-3 mt-2 bg-white">No Data Found</div>
                    } */}

                    {
                        isDataLoaded && lists.map((ordersByMonth, i) => {
                            return <div key={i} className="orders-by-month-block p-0">
                                <div className="orders-title-block pt-4">
                                    <label className="text-left">{ordersByMonth.month}</label>
                                    <label className="text-right">{ordersByMonth.orders.length} Orders</label>
                                </div>
                                <div className="orders-list-block">
                                    {ordersByMonth.orders.map((order, index) => {
                                        return <div className="myWishlistbox" key={index}>
                                            <div className="row border-bottom  pt-2 pb-2 pl-0 pr-0 mb-3">
                                                <div className="col pl-2">
                                                    <span class="mr5"><IcnCircleInfo /></span>
                                                    <span className="ordersDate orderId">Order #{order.orderDetailsTO.orderId}</span>
                                                    <span className="ordersDate float-right m-0">{moment(order.orderDetailsTO.placedOn).format('LL')}</span>
                                                </div>
                                            </div>
                                            <div className="row jcb">
                                                <div className="col-lg-5 col-7 pl-1 pr-1">
                                                    <div className="WishlistItem">
                                                        <div className="media">
                                                            <div className="prod-thumbnail-img" style={{ backgroundImage: `url(${getMyImage(order.listingDetails)})` }}></div>

                                                            <div className="media-body">
                                                                <h5 className="mt-0">{order.listingDetails.title}</h5>
                                                                <p class="my-order-by-width">Sold by: {order.listingDetails && order.listingDetails.fflStore ? ' ' + order.listingDetails.fflStore.name : order.listingDetails.appUser.firstName} </p>
                                                                <p class="my-order-by-width">Qty : {order.orderDetailsTO.quantity} | {order.listingDetails.appUser.appUserType}-{order.buyType}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <div className="col-lg-1 col-3 pl-1 pr-1">
                                                    <div className="WishlistItem-rating">
                                                        <p>Item ratings</p>
                                                        <div className="rating">
                                                            <StarRating totalStars={5} selected={0} disabled={true} />
                                                        </div>
                                                    </div>
                                                </div> */}

                                                <div className="col-lg-1 col-2 pl-1 pr-1">
                                                    <div className="WishlistItem-price text-right pr-2">
                                                        <p className="wprice-label">Price</p>
                                                        <p className="wishlist-price">${order.orderDetailsTO.totalPrice ? Number(order.orderDetailsTO.totalPrice).toFixed(2) : 0}</p>
                                                    </div>
                                                </div>
                                                <div className="col-lg-5 col-12 pl-3 pr-1">
                                                    <div className="location-block">
                                                        <p className="location-box m-0 p-o"></p>
                                                        <label className="order-location">
                                                            {
                                                                order.orderDetailsTO.deliveryLocationType === 'FFL' && <span>FFL Store :
                                                                    {
                                                                        !_.isEmpty(order.orderDetailsTO.fflStoreLocation)
                                                                        && <span className="pl5">
                                                                            {
                                                                                order?.orderDetailsTO?.fflStoreLocation?.storeName
                                                                                || order?.orderDetailsTO?.fflStoreLocation?.licHolderName
                                                                                || order?.orderDetailsTO?.fflStoreLocation?.name
                                                                                || ''
                                                                            },
                                                                            {
                                                                                order?.orderDetailsTO?.fflStoreLocation?.premStreet
                                                                                || order?.orderDetailsTO?.fflStoreLocation?.premiseStreet
                                                                                || ""

                                                                            },
                                                                            {
                                                                                order?.orderDetailsTO?.fflStoreLocation?.premZipCode
                                                                                || order?.orderDetailsTO?.fflStoreLocation?.premiseZipCode
                                                                                || ""
                                                                            }
                                                                        </span>
                                                                    }
                                                                </span>
                                                            }
                                                            {
                                                                order.orderDetailsTO.deliveryLocationType === 'SHERIFF_OFFICE'
                                                                && <span className="pl5">Sheriff Office :
                                                                    {
                                                                        order.orderDetailsTO?.sheriffOfficeLocation?.poi?.name
                                                                        || order.orderDetailsTO?.sheriffOfficeLocation?.address?.freeformAddress
                                                                        || order?.orderDetailsTO?.sheriffOfficeLocation?.freeformAddress
                                                                        || ""
                                                                    }
                                                                </span>
                                                            }
                                                            {order.orderDetailsTO.deliveryLocationType === 'OTHER_LOCATION' && <span>Other : {order.orderDetailsTO?.otherLocation?.formatted_address || order.orderDetailsTO?.otherLocation?.name || ""}</span>}
                                                        </label>
                                                    </div>
                                                    {/* <div className="mt-1 ml-2">
                                                        {
                                                            order.returnable
                                                            && order.eligibleReturnDate
                                                            && <button
                                                                className="btn-sm border-round rejectBtn f12 btn btn-outline"
                                                                onClick={() => {setSelectedOrder(order); setShow(true) }}
                                                                disabled={order.orderDetailsTO.deliveryStatus !== NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED}
                                                            >
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_PLACED && "Return Placed"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_REJECTED && "Return Rejected"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_SCHEDULED && "Return Scheduled"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_CONFIRMED && "Return Date Confirmed"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_OTP_REQUESTED && "Return OTP Requested"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_COMPLETED && "Return Completed"}
                                                                {
                                                                    (order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED) 
                                                                    || (order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)
                                                                    && <span>Return Item</span>
                                                                }
                                                            </button>
                                                        }
                                                        {
                                                            order.returnable
                                                            && order.eligibleReturnDate
                                                            && (order.eligibleReturnDate > moment().format()
                                                                && ((order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED) 
                                                                || (order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)))
                                                            && <div className="order-location">Return eligible through <span className="fw600">{moment(order.eligibleReturnDate).format("LL")}</span></div>
                                                        }
                                                        {
                                                            order.returnable
                                                            && order.eligibleReturnDate
                                                            && (order.eligibleReturnDate < moment().format()
                                                                && ((order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED) 
                                                                || (order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)))
                                                            && <div className="order-location">Return closed on <span className="fw600">{moment(order.eligibleReturnDate).format("LL")}</span></div>
                                                        }
                                                        {
                                                            !order.returnable 
                                                            && orderType
                                                            && <button className="order-status-btn statusBtn aic jcc">
                                                                {order?.orderListingDetailsStatus || (orderType === "upcoming" ? "Accepted" : "Completed")}
                                                            </button>
                                                        }
                                                        <span className="ml-2 orderDate"></span>
                                                    </div> */}
                                                </div>
                                            </div>
                                            {/* <div className="row order-footer desktop-off">
                                                <div className="col-lg-12 location-box">
                                                    <label className="order-location ml-3">
                                                        {order.orderDetailsTO.deliveryLocationType === 'FFL' && <span>FFL Store : {!_.isEmpty(order.orderDetailsTO.fflStoreLocation) && !_.isEmpty(order.orderDetailsTO.fflStoreLocation.storeName) ? order.orderDetailsTO.fflStoreLocation.storeName : (!_.isEmpty(order.orderDetailsTO.fflStoreLocation) && order.orderDetailsTO.fflStoreLocation.licHolderName) || ''}, {!_.isEmpty(order.orderDetailsTO.fflStoreLocation) && order.orderDetailsTO.fflStoreLocation.premStreet}, {!_.isEmpty(order.orderDetailsTO.fflStoreLocation) && order.orderDetailsTO.fflStoreLocation.premZipCode}</span>}
                                                        {order.orderDetailsTO.deliveryLocationType === 'SHERIFF_OFFICE' && <span>Sheriff Office : {order.orderDetailsTO.sheriffOfficeLocation.poi?.name}, {order.orderDetailsTO.sheriffOfficeLocation.address.freeformAddress}</span>}
                                                    </label>
                                                </div>
                                                <div className="col-lg-12 mt-1">
                                                {!order.returnable && order.orderListingDetailsStatus && <button className="ml-2 btn btn-success btn-sm order-status-btn">{order.orderListingDetailsStatus}</button>}
                                                    <span className="ml-2 orderDate"></span>
                                                </div>
                                            </div> */}

                                            {/* order history details */}
                                            <div className="ohs-div mb-3">

                                                <div className="ohs-box-h-line">

                                                </div>
                                                <div className="ohs-box mt-1 pl15">
                                                    <div
                                                        className="p-rel"
                                                        aria-expanded={checkExpandData(order.orderHasListingSid)}
                                                        onClick={() => {
                                                            onExpCollapse(order.orderHasListingSid);
                                                            getOrderHistoryDetails(order.orderDetailsTO.sid);
                                                        }}
                                                    >
                                                        <div className="ohs-item pointer aic f10">
                                                            <div className="ohs-item-round mr10"></div>
                                                            <div className="mr10 ohs-item-title elps text-semi-bold">{order.orderDetailsTO.deliveryStatus ? showLabelByStatus(order.orderDetailsTO.deliveryStatus) : ""}</div>
                                                            <div className="ohs-date">{order.orderDetailsTO.orderLatestActivityDate ? `${moment(order.orderDetailsTO.orderLatestActivityDate).format('ll')} at ${moment(order.orderDetailsTO.orderLatestActivityDate).format('LT')}` : ""}</div>
                                                        </div>
                                                    </div>
                                                    <div className="ohd-toggle-icon">
                                                        {/* <i className={classNames("fa ibvm mr5", {
                                                            "fa-angle-down": checkExpandData(order.orderHasListingSid),
                                                            "fa-angle-right": !checkExpandData(order.orderHasListingSid)
                                                        })}></i> */}
                                                        {!checkExpandData(order.orderHasListingSid) && <span><ICN_CHEVRON_RIGHT /></span>}
                                                        {checkExpandData(order.orderHasListingSid) && <span><ICN_CHEVRON_DOWN /></span>}
                                                    </div>
                                                    {
                                                        !_.isEmpty(order)
                                                        && !_.isEmpty(order.orderHistoryDetails)
                                                        && checkExpandData(order.orderHasListingSid)
                                                        && order.orderHistoryDetails.map((r, i) => <Collapse in={checkExpandData(order.orderHasListingSid)} key={i}>
                                                            <div className="ohs-item aic f10">
                                                                <div className="ohs-item-round mr10"></div>
                                                                <div className="mr10 ohs-item-title elps text-semi-bold">{showLabelByStatus(r.eventStatus)}</div>
                                                                <div className="ohs-date">{moment(r.eventDate).format('ll')} at {moment(r.eventDate).format('LT')}</div>
                                                            </div>
                                                        </Collapse>)
                                                    }
                                                </div>
                                            </div>
                                            <div className="row border-top justify-content-end">
                                                <div className="pt10 pr15">
                                                    <div className="text-right">
                                                        {
                                                            order.returnable
                                                            && order.eligibleReturnDate
                                                            && <button
                                                                className="btn-sm border-round rejectBtn f12 btn btn-outline"
                                                                onClick={() => { setSelectedOrder(order); setShow(true) }}
                                                                disabled={order.orderDetailsTO.deliveryStatus !== NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED}
                                                            >
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_PLACED && "Return Placed"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_REJECTED && "Return Rejected"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_SCHEDULED && "Return Scheduled"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_CONFIRMED && "Return Date Confirmed"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_OTP_REQUESTED && "Return OTP Requested"}
                                                                {order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_COMPLETED && "Return Completed"}
                                                                {
                                                                    order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED
                                                                    || order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED
                                                                    && <span>Return Item</span>
                                                                }
                                                            </button>
                                                        }
                                                        {
                                                            order.returnable
                                                            && order.eligibleReturnDate
                                                            && (order.eligibleReturnDate > moment().format()
                                                                && ((order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED)
                                                                    || (order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)))
                                                            && <div className="f11 c777">Return eligible through <span className="fw600">{moment(order.eligibleReturnDate).format("LL")}</span></div>
                                                        }
                                                        {
                                                            order.returnable
                                                            && order.eligibleReturnDate
                                                            && (order.eligibleReturnDate < moment().format()
                                                                && ((order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.COMPLETED)
                                                                    || (order.orderDetailsTO.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.ORDER_DELIVERED)))
                                                            && <div className="f11 c777">Return closed on <span className="fw600">{moment(order.eligibleReturnDate).format("LL")}</span></div>
                                                        }
                                                        {
                                                            !order.returnable
                                                            && orderType
                                                            && <button className="order-status-btn statusBtn aic jcc w100px cp-none h25px">
                                                                {showLabelByStatus(order?.orderDetailsTO?.deliveryStatus)}
                                                            </button>
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    })
                                    }
                                </div>
                            </div>
                        })
                    }
                    {
                        isDataLoaded && !lists.length && <div class="gunt-error">No Data Found</div>
                    }
                </div>
            </div>
        </div>
    </div>)
}
export default StoreOrderList