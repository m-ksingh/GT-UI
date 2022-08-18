import _ from 'lodash';
import GLOBAL_CONSTANTS from '../../../../Constants/GlobalConstants';
import { NOTIFICATION_CONSTANTS } from '../Constants/NotificationConstants';
import moment from 'moment';

/**  get image url
 * @param {String} item = item which contains images
*/
export const getMyImage = (item) => {
    let imageUrl = '../../images/no-image-available.png';
    if (!_.isEmpty(item)) {
        const imagesByItem = JSON.parse(item)[0];
        imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../../images/no-image-available.png';
    }
    return imageUrl;
}

export const getBuyType = (type) => {
    let tmp = "";
    try {
        switch(type) {
            case NOTIFICATION_CONSTANTS.BUY_TYPE.INSTANT_BUY_PURCHASE:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.BID_PLACED:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.BID_PURCHASE:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.TRADE_PURCHASE:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.TRADE_OFFER_PLACED:
                tmp = "Purchase";
                break;
            case NOTIFICATION_CONSTANTS.BUY_TYPE.INSTANT_BUY_SALE:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.BID_SALE:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.BID_RECEIVED:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.TRADE_SALE:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.TRADE_OFFER_RECEIVED:
                tmp = "Sale";
                break;
            default:
                tmp = ""
        }
    } catch (err) {
        // err
    }
    return tmp;
}

export const getBuyTitle = (type) => {
    let tmp = "";
    try {
        switch(type) {
            case NOTIFICATION_CONSTANTS.LISTING_TYPE.BUY:
                tmp = "Instant Buy";
                break;
            case NOTIFICATION_CONSTANTS.LISTING_TYPE.BID:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.BID_RECEIVED:
                tmp = "Bid";
                break;
            case NOTIFICATION_CONSTANTS.BUY_TYPE.TRADE_OFFER_RECEIVED:
            case NOTIFICATION_CONSTANTS.LISTING_TYPE.TRADE:
                tmp = "Trade Offer";
                break;
            default:
                tmp = ""
        }
    } catch (err) {
        // err
    }
    return tmp;
}

export const getOrderTitle = (type, nl) => {
    let tmp = "";
    try {
        switch(type) {
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LISTING_SOLD:
                tmp = nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULED ? "Pickup Date Provided" : 
                <span>{`${typeof nl.isShipBeyondPreferredDistance === "string" && JSON.parse(nl.isShipBeyondPreferredDistance) && typeof nl.isDeliveryTypeFflStore === "string" && JSON.parse(nl.isDeliveryTypeFflStore) ? "Shipped Order" : "New Order"} - ${((nl?.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || nl.adminToFFlStore) ? "Select Items & Set Pickup Date" : " Set Pickup date"}`}</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED:
                tmp = "Confirm Pickup date";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.TRADE_OFFER_RECEIVED:
                tmp = "Trade Offer Received";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED:
            case NOTIFICATION_CONSTANTS.BUY_TYPE.BID_RECEIVED:
                tmp = "Bid Received";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S:
                tmp = "Counter Trade Offer Received";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED:
                tmp = "Counter Trade Offer Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_CONFIRMED:
                tmp = "Pickup Schedule Confirm";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_ACCEPTED:
                tmp = "Bid Accepted";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED:
                tmp = "Bid Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_ACCEPTED:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_ACCEPTED_B:
                tmp = "Trade Offer Accepted";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_REJECTED:
                tmp = "Trade Offer Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SCHEDULE_ALARM:
                tmp = <span>Meet the {(nl.userType === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER && "Buyer") || "Seller"}</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_PLACED:
                tmp = <span>{`Order #${nl.orderId || nl?.notificationJson?.orderId || ""} - Return Requested`}</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_REJECTED:
                tmp = "Return Item Request Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_B:
                tmp = "Return Order - Confirm Return Date";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_S:
                tmp = "Return Order - Inform FFL";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_B:
                tmp = "Return Order - Return Item at FFL";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_S:
                tmp = "Return Date - Confirm";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_OTP_REQUESTED:
                tmp = "Return Order - Return Code";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_COMPLETED_B:
                tmp = "Return Order Successful";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_COMPLETED_S:
                tmp = "Item Returned";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NOTIFICATION:
                tmp = <span>
                    {
                        !_.isEmpty(nl?.tradeSpecification)
                            ? <span>New Trade Offer Match Found</span>
                            : <span>New Match Found for Trading</span>
                    }
                </span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NON_TRADE:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_WISHLIST:
                tmp = "New Match Found";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.DEALER_APPLICATION_ACCEPTED:
                tmp = "Dealership Request Approved";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.DEALER_APPLICATION_REJECTED:
                tmp = "Dealership Request Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_SUBMITTED:
                tmp = "Dispute Submitted";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RAISED:
                tmp = "Dispute Raised";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_B:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_S:
                tmp = "Dispute Resolved";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_REJECTED_S:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_REJECTED_B:
                tmp = "Dispute Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPING_INFO:
                tmp = "New Order - Initiate Shipping";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPMENT_INITIATED:
                tmp = "Shipment initiated for your order";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED:
                tmp = "Shipped Order - Visit FFL";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY:
                tmp = "Confirm Pickup Date";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_CANCELLED_B:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_CANCELLED_S:
                tmp = "Order Cancelled";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BUYER_REACHED_FFL:
                tmp = "Buyer Reached FF";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_SUCCESSFUL_B:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_COMPLETED_B:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_SUCCESSFUL_S:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_COMPLETED_S:
                tmp = "Transaction Successful";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED_B:
                tmp = "Bid Cancelled";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED_FOR_INSTANT_BUY:
                tmp = "Bid Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_OUTNUMBERED:
                tmp = "Your bid was outnumbered!";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_LOST:
                tmp = "Bid is lost";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_EXPIRED:
                tmp = "Your bid item expired";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_REJECTED_FOR_INSTANT_BUY:
                tmp = "Trade Rejected for Instant Buy";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_EXPIRED:
                tmp = "Trade Expired";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.INSTANT_BUY_EXPIRED:
                tmp = "Instant Buy Expired";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_PURCHASED:
                tmp = "Order Placed";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRE_ALARM_7:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRE_ALARM_3:
                tmp = "FFL Store License Expire Alert";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRED:
                tmp = "FFL Store License Expired";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_RENEWAL_APPROVED:
                tmp = "Store Renewal Approved";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_RENEWAL_REJECTED:
                tmp = "Store Renewal Request Rejected";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED_B:
                tmp = "Bid Placed";
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED_B:
                tmp = "Offer Placed";
                break;
            default:
                tmp = ""
        }
    } catch (err) {
        // err
    }
    return tmp;
}

export const getOrderDescription = (type, nl) => {
    let tmp = "";
    try {
        switch(type) {
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LISTING_SOLD:
                tmp = nl.deliveryStatus === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULED ? "You have provided pickup date for buyer, please wait for buyer to confirm date." :  <>
                    {
                        ((nl.notificationJson.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || nl.notificationJson.adminToFFlStore)
                        ? <div>
                            <div>Congratulations! <span className="text-semi-bold c111">{nl.notificationJson.orderedQuantity || 1}</span> quantities of this item has been purchased!</div>
                            <div>Please select the items & provide pickup dates for the buyer to meet you at the below location</div>
                        </div>
                        : (typeof nl.notificationJson.isShipBeyondPreferredDistance === "string" && JSON.parse(nl.notificationJson.isShipBeyondPreferredDistance) ? <span>Once your order reached the FFL please provide the pickup dates for the buyer to visit the ffl</span> : <span> Congratulations! This item has been purchased! Provide the pickup dates for the buyer to meet you at the below location</span>)
                    }
                </>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED:
                tmp = <span>
                    {"The Seller has provided the pickup dates for your "}{nl?.notificationJson?.orderType === "TRADE" ? "trade offer!" : "recent order!"}{" Confirm the pickup dates for the seller to meet you at the below location"}
                </span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED:
                tmp = <>
                    <span>Trade offer received for your listing. </span>
                    {
                        Number(nl.notificationJson.tradeOfferBalance) && Number(nl.notificationJson.tradeOfferBalance) > 0
                        && <span> Difference amount offered is <span className="text-semi-bold c111">${nl.notificationJson.tradeOfferBalance}</span></span>
                    }
                </>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED:
                tmp = <span>Bid of <span className="text-semi-bold c111">${nl.notificationJson.bidPrice}</span> received for your product</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED:
                tmp = <span>Seller has offered a counter trade offer of <span className="text-semi-bold fw600 c111">${nl.notificationJson.tradeCounterAmount || nl.notificationJson.tradeOfferBalance || 0}</span> for your trade offer.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_RECEIVED_S:
                tmp = <span>Buyer has offered a counter trade offer of <span className="text-semi-bold fw600 c111">${nl.notificationJson.tradeCounterAmount || nl.notificationJson.tradeOfferBalance || 0}</span> for your counter offer.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_COUNTER_OFFER_REJECTED:
                tmp = <span>Buyer has rejected your counter offer of {nl.notificationJson?.sellerPrevoiusCounterAmonunt && <span className="text-semi-bold fw600 c111">${nl.notificationJson.sellerPrevoiusCounterAmonunt}</span>}.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_CONFIRMED:
                tmp = <span>Buyer has confirmed pickup schedule.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_ACCEPTED:
                tmp = <span>Congratulations! Your bid of <span className="text-semi-bold c111">${nl.notificationJson.bidPrice}</span> has been accepted! <span></span></span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED:
                tmp = <span>Your bid of <span className="text-semi-bold c111">${nl.notificationJson.bidPrice}</span> for the below item has been rejected by the seller!</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_ACCEPTED:
                tmp = <span>Congratulations! Seller accepted your trade offer and the trade order has been placed. You will be notified once the seller provides the pickup dates to confirm.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_ACCEPTED_B:
                tmp = <span>Congratulations! You have accepted the counter offer and the trade order has been placed. You will be notified once the seller provides the pickup dates to confirm.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_REJECTED:
                tmp = <span>Seller rejected your trade offer</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SCHEDULE_ALARM:
                tmp = <>
                    <div class="fw600 c111">
                        {moment(nl.notificationJson.fromTime).calendar() + " - " + moment(nl.notificationJson.toTime).format('LT')}
                    </div>
                    <div>
                        {"Please meet the "}{nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? "buyer " : "seller "}{" at the below mentioned location and click on the below button to indicate that you have arrived in order to  "}{(nl?.notificationJson?.orderType === "TRADE" ? "trade" : "") || (nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? "hand over " : "receive ")}{" the below mentioned item."}
                    </div>
                </>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_PLACED:
                tmp = nl?.deliveryStatus === NOTIFICATION_CONSTANTS.DELIVERY_STATUS.RETURN_REJECTED ? "" : <span> The buyer has requested to return your following item that was Purchased on <span className="text-semi-bold c111">{nl?.notificationJson?.purchasedOn ? moment(nl.notificationJson.returnDate).format("LL") : "-"}</span></span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_REJECTED:
                tmp = <span>Your request to return the below item has been rejected by the seller</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_B:
                tmp = <span>The seller has accepted your return request! Please confirm the return dates provide by seller to return the item at below mentioned location</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_SCHEDULED_S:
                tmp = <span>You have accepted the return request! Please inform the FFL about the return request of below mentioned item</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_B:
                tmp = <div>
                    <div className="text-semi-bold c111">{moment(nl.notificationJson.returnDate).format("LL")}</div>
                    <div>Please return the item at the below mentioned FFL and click on the below button to indicate that you have arrived in order to initiate the return process</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_DATE_CONFIRMED_S:
                tmp = <span>Return date has been confirmed by buyer on - <span class="fw600 c111">{moment(nl.notificationJson.returnDate).format("LL")}</span></span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_OTP_REQUESTED:
                tmp = <div>
                    <div>The buyer has returned your item at below FFL store and requesting for the below return code.</div>
                    <div className="f14 text-semi-bold c111">{nl.notificationJson.returnOtp}</div>
                    <div>Please provide the above return code to the FFL store after confirming that Your product is returned and inspected by the FFL in order to initiate the return request</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_COMPLETED_B:
                tmp = <span>Return process is completed! The refund of <span className="text-semi-bold c111">${nl.notificationJson.refundableAmount}</span> is initiated after the deduction of restocking fees <span className="text-semi-bold c111">{nl.notificationJson?.restockingFeesType === "percentage" ? "" : "$"}{nl.notificationJson.restockingFees}{nl.notificationJson?.restockingFeesType === "percentage" ? "%" : ""}</span>. The amount will be refunded to your payment card which was used to purchase this item</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_RETURN_COMPLETED_S:
                tmp = <span>Return process is completed! The refund of <span className="text-semi-bold c111">${nl.notificationJson.refundableAmount}</span> will be transferred to the buyer excluding the restocking fees <span className="text-semi-bold c111">{nl.notificationJson?.restockingFeesType === "percentage" ? "" : "$"}{nl.notificationJson.restockingFees}{nl.notificationJson?.restockingFeesType === "percentage" ? "%" : ""}</span>.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NOTIFICATION:
                tmp = <span>
                    {
                        !_.isEmpty(nl.notificationJson?.tradeSpecification)
                            ? <span>There is an item matching with your item listed for specific trade.</span>
                            : <span>There is an item matching with your item listed for trading.</span>
                    }
                </span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_NON_TRADE:
                tmp = <span>There is a matching item available for your recent search.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.MATCHING_LISTING_WISHLIST:
                tmp = <span>There is a matching item available for your Wishlist <span className="text-semi-bold c111">{nl?.notificationJson?.wishlistName}</span>.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.DEALER_APPLICATION_ACCEPTED:
                tmp = <div>
                    <div className="mb20">Congratulations! Your dealership request for the store <span className="text-semi-bold c111">{nl.notificationJson?.storeName ? nl.notificationJson.storeName : ""}</span> has been approved by the Guntraderz.</div>
                    <div>You will be able to manage your store under 'Dealership' section alongside 'My Account' section</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.DEALER_APPLICATION_REJECTED:
                tmp = <div>
                    <div className="mb20">Your dealership request for the store <span className="text-semi-bold c111">{nl.notificationJson?.storeName ? nl.notificationJson.storeName : ""}</span> has been rejected by the Guntraderz.</div>
                    <div><span className="col666">Reason : </span>{nl.notificationJson.reviewComments}</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_SUBMITTED:
                tmp = <span>You have raised a dispute for the below item.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RAISED:
                tmp = <span>The <span>{nl.notificationJson?.userType === GLOBAL_CONSTANTS.USER_TYPE.SELLER ? "seller" : "buyer"}</span> has raised a dispute on your below item.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_B:
                tmp = <span>Your dispute has been resolved by Guntraderz for the below item.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_RESOLVED_S:
                tmp = <span>The dispute on your below item has been resolved by Guntraderz.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_REJECTED_S:
                tmp = <span>The dispute on your below item has been rejected by Guntraderz.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_DISPUTE_REJECTED_B:
                tmp = <span>Your dispute has been rejected by Guntraderz for the below item.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPING_INFO:
                tmp = <div>
                    <div>Congratulations! This item has been purchased!</div>
                    <div>Please ship the item to the below FFL and provide the shipping info</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPMENT_INITIATED:
                tmp = <span>Your order has been handed over to the shipment partner</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_SHIPPED:
                tmp = <div>
                    <div className="text-semi-bold c111">{moment(nl.notificationJson.scheduledTimeFrom).calendar()} - {moment(nl.notificationJson.scheduledTimeTo).format('LT')}</div>
                    <div>Please visit the below mentioned FFL and click on the 'Arrive at FFL' button to indicate that you have arrived in order to purchase the item</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY:
                tmp = <div>
                    <div>The seller has updated the quantity to<span className="px5 text-semi-bold c111">{nl.notificationJson.updatedQuantity}</span>against your ordered quantity of<span className="px5 text-semi-bold c111">{nl.notificationJson.orderedQuantity}</span>and provided the pickup dates for your recent order!</div>
                    <div>Confirm the pickup dates for the seller to meet you to at the below location.</div>
                    <div>Excess amount will be credited back to your original payment card.</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_CANCELLED_B:
                tmp = <div>
                    <div>This order has been cancelled by you!</div>
                    <div>The amount <span className="text-semi-bold c111">${nl.notificationJson.price ? Number(nl.notificationJson.price).toFixed(2) : 0}</span> will be credited back to your original payment card.</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_CANCELLED_S:
                tmp = <div>
                    <div>The buyer has cancelled this order, as the selling quantity of <span className="text-semi-bold c111">{nl.notificationJson.reducedQuantity || "-"}</span> provided by you against the buyer ordered quantity of <span className="px5 text-semi-bold c111">{nl.notificationJson.orderedQuantity || "-"}</span> is not accepted the buyer.</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BUYER_REACHED_FFL:
                tmp = <div>
                    <div>The buyer has reached below FFL store and requesting for the below secret code.</div>
                    <div className="f14 text-semi-bold c111">{nl.notificationJson.secretCode}</div>
                    <div>Please provide the above secrete code to the FFL store after confirming that Buyer is at the FFL and ready to accept your item</div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_SUCCESSFUL_B:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_COMPLETED_B:
                tmp = <div>
                    <div>Congratulations!</div>
                    <div className="">You have successfully completed the purchase for your below item.</div>
                    <div><span className="text-semi-bold c111">${nl.notificationJson.price ? Number(nl.notificationJson.price).toFixed(2) : 0}</span><span> will be debited from your selected payment card.</span></div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_SUCCESSFUL_S:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRANSACTION_COMPLETED_S:
                tmp = <div>
                    <div>Congratulations!</div>
                    <div className="">You have successfully completed the sales for your below item.</div>
                    <div><span className="text-semi-bold c111">${nl.notificationJson.price ? Number(nl.notificationJson.price).toFixed(2) : 0}</span><span> will be transferred to you.</span></div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED:
                tmp = <span>Your bid of <span className="fw600 c111">${nl.notificationJson.bidPrice ? Number(nl.notificationJson.bidPrice).toFixed(2) : "0"}</span> for the below item has been cancelled as it has not Met the seller's reserve price by anyone.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_CANCELLED_B:
                tmp = <span>You have successfully cancelled your bid</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_REJECTED_FOR_INSTANT_BUY:
                tmp = <span>Your bid is rejected as item is bought with <span className="fw600 c111">Instant Buy</span></span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_OUTNUMBERED:
                tmp = <span>Your bid of <span className="fw600 c111">${nl.notificationJson.bidPrice ? Number(nl.notificationJson.bidPrice).toFixed(2) : "0"}</span> for the below item has been outnumbered by someone else for <span className="fw600 c111">${nl.notificationJson.outNumberedAmount ? Number(nl.notificationJson.outNumberedAmount).toFixed(2) : "0"}</span> ! &nbsp;Click on 'bid again' to update your bid amount.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_LOST:
                tmp = <span>Your have lost the bid of <span className="fw600 c111">${nl.notificationJson.bidPrice ? Number(nl.notificationJson.bidPrice).toFixed(2) : "0"}</span> for the below item as it has been awarded to the other highest bidder.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.BID_EXPIRED:
                tmp = <span>{nl.notificationJson?.isAnyBidPlaced && !JSON.parse(nl.notificationJson?.isAnyBidPlaced) ? "Your item is expired with no order placed" : "The bid for your item has been expired as no buyer's were able to meet the reserve price set by you."}</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_REJECTED_FOR_INSTANT_BUY:
                tmp = <span>Trade rejected for instant buy</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_EXPIRED:
                tmp = <span>Your trade item is expired</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.INSTANT_BUY_EXPIRED:
                tmp = <span>Your listing item is expired</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ORDER_PURCHASED:
                tmp = <span>Congratulations! Your order has been successfully placed. Please wait for the seller to provide pickup dates.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRE_ALARM_7:
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRE_ALARM_3:
                tmp = <div>
                    <div className="mb10">
                        <div>This is a gentle reminder for you to renew your ffl store license with license No. <span className="fw600 c111">{nl.notificationJson?.licenseNumber || "-"}</span>.
                            License for your store <span className="fw600 c111">{nl.notificationJson?.storeName || "-"}</span> will expire in next <span className="fw600 c111">{nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRE_ALARM_7 ? "7": "3"} days </span>.</div>
                        <div>Please renew your license to avoid any disruptions in services.</div>
                    </div>
                    <div className="">
                        <span>
                            <span>Expire On : </span>
                            <span className="fw600 c111">{moment(nl.notificationJson.licenseExpiresOn).format('L')}</span>
                        </span>
                    </div>
                    <div className="mb10">
                        <span>
                            <span>License Number : </span>
                            <span className="fw600 c111">{nl.notificationJson?.licenseNumber || "-"}</span>
                        </span>
                    </div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_EXPIRED:
                tmp = <span>Your store <span className="fw600 c111"> {nl.notificationJson?.storeName || "-"} </span> license is expired, please renew your store license to continue our services. thanks</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_RENEWAL_APPROVED:
                tmp = <span>Congratulations! Your request for store renewal <span className="fw600 c111"> {nl.notificationJson?.storeName || "-"} </span> has been approved by platform admin. All blocked services are made available. You will be able to  access all the services offered by our platform.</span>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.LICENSE_RENEWAL_REJECTED:
                tmp = <div>
                    <div className="mb20"><span>Your store renewal request is rejected. We regret to inform you that your request for renewal for store with license No. <span className="fw600 c111"> {nl.notificationJson?.licenseNumber || "-"} </span> is rejected by the platform admin.</span></div>
                    <div className=""><span className="col666">Reason : </span> {nl.notificationJson.reviewComments}</div>
                    <div><span>You can reapply for store renewal from My Store.</span></div>
                    <div><span>We strongly recommend you to verify your details before submitting store renewal request to avoid further delay.</span></div>
                </div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.NEW_BID_PLACED_B:
                tmp =  <div>You have successfully placed bid of amount <span className="fw600">${nl.notificationJson?.bidPrice}</span></div>;
                break;
            case NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.TRADE_OFFER_PLACED_B:
                tmp = "You have successfully placed trade";
                break;
            default:
                tmp = ""
        }
    } catch (err) {
        // err
    }
    return tmp;
}