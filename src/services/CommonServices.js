import _ from 'lodash';
import GLOBAL_CONSTANTS from '../Constants/GlobalConstants';
import moment from 'moment';
/*
* Get price with tax 
*/

export const getMyPromtPrice = (price) => {
    price = _.toNumber(price);
    return price + ((price * 10) / 100)
}

/*
* Get condition by condition sid 
*/
export const getConditionBySid = (list, sid) => {
    let condition = "";
    try {
        let conditionObj = _.isArray(list) && list.length > 0 && list.find(r => r.sid === sid);
        if (!_.isEmpty(conditionObj)) {
            condition = conditionObj.name;
        }
    } catch (err) {
        console.error("Error in getConditionBySid---", err);
    }
    return condition;
}

/**
    * This method used to extract nested children category to display in customized dropdown. 
    * @param {Array of Objects} list 
    * @returns Array of Objects
*/
export const extractCategoryList = (list = []) => {
    let temp = [];
    const fn = (data = [], level = 0, label = "",mandatory="", firearm = false) => data.map((e) => {
        temp.push({
            ...e,
            displayName: (level && `${Array(level * 5).fill('\xa0').join('')}${e.name}`) || e.name,
            childCategory: null,
            disabled: !_.isEmpty(e.childCategory),
            selectedOption: (_.isEmpty(label) && e.name) || `${label} > ${e.name}`,
            mandatory:  mandatory,
            firearm: firearm
        })
        if (e.childCategory)
            fn(e.childCategory, level + 1, (_.isEmpty(label) && e.name) || `${label} > ${e.name}`,(_.isEmpty(mandatory) && e.mandatory) || `${mandatory}`,  e.firearm || firearm)
    })
    fn(list);
    return temp;
}

/**
 * Returns matching category object by sid
 * @param {Array} param0 - Category list
 * @param {String} param1 - Category sid
 * @returns 
 */
export const getSelectedCategoryTitleBySid = ({
    list = [],
    sid = null
}) => {
    let temp = null;
    try {
        if (!_.isEmpty(list)
            && list?.length > 0
            && !_.isEmpty(sid)) {
            let category = list.find(e => e.sid === sid);
            if (!_.isEmpty(category))
                temp = category.selectedOption;
        }
    } catch (err) {
        console.error("Exception occurred in getSelectedCategoryTitleBySid -- ", err)
    }
    return temp;
}

/**
 * Returns boolean by validating current time falls in between `from time` and `to time`
 * @param {Date String} param0 
 * @param {Date String} param1
 * @returns Boolean
 */
export const isValidateScheduleTime = ({
    from = null,
    to = null
}) => {
    let flag = false;
    try {
        let fromTime = new Date(from).getTime();
        let toTime = new Date(to).getTime();
        let currentTime = Date.now();
        if (currentTime >= fromTime
            && currentTime <= toTime) {
            flag = true
        }
    } catch (err) {
        flag = false;
    }
    return flag;
}

/**
 * Returns passed timestamp belongs today's timestamp or not
 * @param1 {Date} from
 * @param2 {Date} to
 * @returns Boolean
 */
export function isToday({
    from = null,
    to = null
}) {
    try {
        let timestamp = new Date(from || to)
        let today = new Date();
        return _.isEqual(timestamp.getDate(), today.getDate())
            && _.isEqual(timestamp.getMonth(), today.getMonth())
            && _.isEqual(timestamp.getFullYear(), today.getFullYear());
    } catch (err) {
        return false;
    }
}

/**
 * Returns passed timestamp belongs today's timestamp or not
 * @param1 {Date} from
 * @param2 {Date} to
 * @returns Boolean
 */
 export function isTodayCurrentHour({
    from = null,
    to = null
}) {
    let isValid = false;
    try {
        let tepmFrom = new Date(from).getTime();
        let tempTo = new Date(to).getTime();
        let today = new Date().getTime();
        if(today > tepmFrom && today < tempTo) isValid = true;
    } catch (err) {
        return false;
    }
    return isValid;
}

/** 
 * Returns matching object by sid
 * @param {Array} param0 - Category list
 * @param {String} param1 - Category sid
 * @returns 
 */
export const getSelectedOptionBySid = ({
    list = [],
    sid = null
}) => {
    let temp = null;
    try {
        if (!_.isEmpty(list)
            && list?.length > 0
            && !_.isEmpty(sid)) {
            let option = list.find(e => e.sid === sid);
            if (!_.isEmpty(option))
                temp = option.name;
        }
    } catch (err) {
        console.error("Exception occurred in getSelectedOptionBySid -- ", err)
    }
    return temp;
}

/** 
 * get time in 
 * @param {String} time - exp time
 * @returns tmpTime
 */
export const showDateTime = (time) => {
    let tmpTime = "";
    try {
        tmpTime = moment(time).endOf('seconds').fromNow();
    } catch (err) {
        console.error("Error occur when showDateTime --", err);
    }
    return tmpTime;
}

/** 
 * Returns matching object by sid
 * @param {String} status - order status
 * @returns 
 */
export const showLabelByStatus = (status = "") => {
        let tmpStatus = "";
        try {
            switch (status) {
                case "ORDER_PLACED":
                case "LISTING_SOLD":
                    tmpStatus = "Order Placed"
                    break;
                case "PLACED":
                    tmpStatus = "Placed"
                    break;
                case "SHIPPING_INFO_PROVIDED":
                    tmpStatus = "Shipping Info Provided"
                    break;
                case "PICKUP_SCHEDULED":
                case "PICKUP_DATE_PROVIDED":
                    tmpStatus = "Pickup Date Provided"
                    break;
                case "PICKUP_CONFIRMED":
                    tmpStatus = "Pickup Date Confirmed"
                    break;
                case "DELIVERED":
                case "COMPLETED":
                case "ORDER_DELIVERED":
                    tmpStatus = "Delivered"
                    break;
                case "RETURN_PLACED":
                case "ORDER_RETURN_PLACED":
                    tmpStatus = "Return Placed"
                    break;
                case "RETURN_SCHEDULED":
                case "ORDER_RETURN_SCHEDULED":
                    tmpStatus = "Return Date Provided"
                    break;
                case "RETURN_CONFIRMED":
                case "ORDER_RETURN_CONFIRMED":
                    tmpStatus = "Return Date Confirmed"
                    break;
                case "RETURN_COMPLETED":
                case "ORDER_RETURN_COMPLETED":
                    tmpStatus = "Returned"
                    break;
                case "RETURN_REJECTED":
                case "ORDER_RETURN_REJECTED":
                    tmpStatus = "Return Rejected"
                    break;
                case "REJECTED":
                    tmpStatus = "Rejected"
                    break;
                case "COUNTER_REJECTED":
                        tmpStatus = "Counter Rejected"
                        break;
                case "OTP_REQUESTED":
                    tmpStatus = "OTP Requested"
                    break;
                case "ORDER_CANCELLED":
                case "CANCELLED":
                    tmpStatus = "Order Cancelled"
                    break;
                case "BID_CANCELLED":
                    tmpStatus = "Bid Cancelled"
                    break;
                case "BID_OUTNUMBERED":
                    tmpStatus = "Bid Outnumbered"
                    break;
                case "BID_REJECTED":
                    tmpStatus = "Bid Rejected"
                    break;
                case "COUNTER_PLACED":
                        tmpStatus = "Counter Placed"
                        break;
                case "RETURN_OTP_REQUESTED":
                    tmpStatus = "Return OTP Requested"
                    break;
                case GLOBAL_CONSTANTS.USER_TYPE.SELLER:
                    tmpStatus = "Seller"
                    break;
                case GLOBAL_CONSTANTS.USER_TYPE.BUYER:
                    tmpStatus = "Buyer"
                    break;
                case GLOBAL_CONSTANTS.USER_TYPE.PLATFORM:
                    tmpStatus = "Platform"
                    break;
                case GLOBAL_CONSTANTS.TRANSACTION_TYPE.CREDIT:
                    tmpStatus = "Credit"
                    break;
                case GLOBAL_CONSTANTS.TRANSACTION_TYPE.DEBIT:
                    tmpStatus = "Debit"
                    break;
                case GLOBAL_CONSTANTS.TRANSACTION_TYPE.CANCEL_ORDER:
                    tmpStatus = "Cancel Order"
                    break;
                case GLOBAL_CONSTANTS.TRANSACTION_TYPE.REJECT_DISPUTE:
                    tmpStatus = "Reject Dispute"
                    break;
                default:
                    tmpStatus = ""
                    break;
            }
        } catch (err) {
            console.error("Error occrred while showLabelByStatus--")
        }
        return tmpStatus;
    }