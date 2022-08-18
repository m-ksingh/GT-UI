import React from 'react';

export const NOTIFICATION_CONSTANTS = {
    TOTAL_LIMIT: 20,
    NOTIFICATION_STATUS: {
        ALL: "ALL",
    },
    DELIVERY_STATUS: {
        COMPLETED: "COMPLETED",
        RETURN_PLACED: "RETURN_PLACED",
        RETURN_REJECTED: "RETURN_REJECTED",
        RETURN_SCHEDULED: "RETURN_SCHEDULED",
        RETURN_CONFIRMED: "RETURN_CONFIRMED",
        RETURN_OTP_REQUESTED: "RETURN_OTP_REQUESTED",
        RETURN_COMPLETED: "RETURN_COMPLETED",
        RETURN_RETURNED: "RETURN_RETURNED",
        ORDER_DELIVERED: "ORDER_DELIVERED"
    },
    NOTIFICATION_TYPE:{
        LISTING_SOLD: "LISTING_SOLD",
        SHIPPING_INFO_PROVIDED: "SHIPPING_INFO_PROVIDED",
        PICKUP_SCHEDULE_RECEIVED: "PICKUP_SCHEDULE_RECEIVED", 
        UPDATED_BID_PLACED: "UPDATED_BID_PLACED",
        TRADE_OFFER_REJECTED: "TRADE_OFFER_REJECTED",
        TRADE_OFFER_PLACED: "TRADE_OFFER_PLACED",
        TRADE_OFFER_ACCEPTED: "TRADE_OFFER_ACCEPTED",
        TRADE_OFFER_ACCEPTED_B: "TRADE_OFFER_ACCEPTED_B",
        TRADE_COUNTER_RECEIVED: "TRADE_COUNTER_RECEIVED",
        TRADE_COUNTER_RECEIVED_S: "TRADE_COUNTER_RECEIVED_S",
        TRADE_COUNTER_OFFER_REJECTED: "TRADE_COUNTER_OFFER_REJECTED",
        NEW_BID_PLACED: "NEW_BID_PLACED",
        BID_ACCEPTED: "BID_ACCEPTED",
        PICKUP_SCHEDULE_CONFIRMED: "PICKUP_SCHEDULE_CONFIRMED",
        BID_REJECTED: "BID_REJECTED",
        SCHEDULE_ALARM: "SCHEDULE_ALARM",
        BID_REVIVED: "RECEIVED",
        MATCHING_LISTING_NOTIFICATION: "MATCHING_LISTING_NOTIFICATION",
        MATCHING_LISTING_NON_TRADE: "MATCHING_LISTING_NON_TRADE",
        MATCHING_LISTING_WISHLIST: "MATCHING_LISTING_WISHLIST",
        ORDER_RETURN_PLACED: "ORDER_RETURN_PLACED",
        ORDER_RETURN_REJECTED: "ORDER_RETURN_REJECTED",
        ORDER_RETURN_SCHEDULED_B: "ORDER_RETURN_SCHEDULED_B",
        ORDER_RETURN_SCHEDULED_S: "ORDER_RETURN_SCHEDULED_S",
        ORDER_RETURN_DATE_CONFIRMED_B: "ORDER_RETURN_DATE_CONFIRMED_B",
        ORDER_RETURN_DATE_CONFIRMED_S: "ORDER_RETURN_DATE_CONFIRMED_S",
        ORDER_RETURN_OTP_REQUESTED: "ORDER_RETURN_OTP_REQUESTED",
        ORDER_RETURN_COMPLETED_B: "ORDER_RETURN_COMPLETED_B",
        ORDER_RETURN_COMPLETED_S: "ORDER_RETURN_COMPLETED_S",
        DEALER_APPLICATION_REJECTED: "DEALER_APPLICATION_REJECTED",
        DEALER_APPLICATION_ACCEPTED: "DEALER_APPLICATION_ACCEPTED",
        ORDER_DISPUTE_SUBMITTED: "ORDER_DISPUTE_SUBMITTED",
        ORDER_DISPUTE_RAISED: "ORDER_DISPUTE_RAISED",
        ORDER_DISPUTE_RESOLVED_B: "ORDER_DISPUTE_RESOLVED_B",
        ORDER_DISPUTE_RESOLVED_S: "ORDER_DISPUTE_RESOLVED_S",
        ORDER_DISPUTE_REJECTED_S: "ORDER_DISPUTE_REJECTED_S",
        ORDER_DISPUTE_REJECTED_B: "ORDER_DISPUTE_REJECTED_B",
        ORDER_SHIPPING_INFO: "ORDER_SHIPPING_INFO",
        ORDER_SHIPMENT_INITIATED: "ORDER_SHIPMENT_INITIATED",
        ORDER_SHIPPED: "ORDER_SHIPPED",
        PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY: "PICKUP_SCHEDULE_RECEIVED_REDUCED_QUANTITY",
        ORDER_PLACED: "ORDER_PLACED",
        PICKUP_SCHEDULED: "PICKUP_SCHEDULED",
        PICKUP_CONFIRMED: "PICKUP_CONFIRMED",
        ORDER_CANCELLED_B: "ORDER_CANCELLED_B",
        ORDER_CANCELLED_S: "ORDER_CANCELLED_S",
        BUYER_REACHED_FFL: "BUYER_REACHED_FFL",
        TRANSACTION_SUCCESSFUL_B: "TRANSACTION_SUCCESSFUL_B",
        TRANSACTION_SUCCESSFUL_S: "TRANSACTION_SUCCESSFUL_S",
        BID_REJECTED_FOR_INSTANT_BUY: "BID_REJECTED_FOR_INSTANT_BUY",
        BID_OUTNUMBERED: "BID_OUTNUMBERED",
        BID_LOST: "BID_LOST",
        BID_EXPIRED: "BID_EXPIRED",
        BID_CANCELLED: "BID_CANCELLED",
        BID_CANCELLED_B: "BID_CANCELLED_B",
        TRADE_REJECTED_FOR_INSTANT_BUY: "TRADE_REJECTED_FOR_INSTANT_BUY",
        TRADE_EXPIRED: "TRADE_EXPIRED",
        ORDER_PURCHASED: "ORDER_PURCHASED",
        TRANSACTION_COMPLETED_B: "TRANSACTION_COMPLETED_B",
        TRANSACTION_COMPLETED_S: "TRANSACTION_COMPLETED_S",
        LICENSE_EXPIRE_ALARM_7: "LICENSE_EXPIRE_ALARM_7",
        LICENSE_EXPIRE_ALARM_3: "LICENSE_EXPIRE_ALARM_3",
        LICENSE_EXPIRED: "LICENSE_EXPIRED",
        LICENSE_RENEWAL_APPROVED: "LICENSE_RENEWAL_APPROVED",
        LICENSE_RENEWAL_REJECTED: "LICENSE_RENEWAL_REJECTED",
        NEW_BID_PLACED_B: "NEW_BID_PLACED_B",
        TRADE_OFFER_PLACED_B: "TRADE_OFFER_PLACED_B",
        INSTANT_BUY_EXPIRED: "INSTANT_BUY_EXPIRED"
    },
    STATUS: {
        ACCEPTED: "ACCEPTED",
        REJECTED: "REJECTED",
        PLACED: "PLACED",
        COUNTER_REJECTED: "COUNTER_REJECTED"
    },
    USER_TYPE: {
        PRODUCT: "PRODUCT",
        BUYER: "BUYER",
        SELLER: "SELLER"
    },
    TERMS_TYPE: {
        TERMS: "TERMS",
        POLICY: "POLICY"
    },
    FILTER_LIST: [
        {value: "ALL", label: "All Orders"},
        {value: "PURCHASE", label: "Purchase Orders"},
        {value: "SALE", label: "Sale Orders"},
        {value: "EXPIRED", label: "Expired Orders"},
    ],
    LISTING_TYPE_LIST: [
        // {value: "ALL", label: "All"},
        {value: "INSTANT_BUY", label: "Instant Buy"},
        {value: "TRADE", label: "Trade"},
        {value: "BID", label: "Bid"}
    ],
    FILTER_BY: {
        ALL: "ALL",
        PURCHASE: "PURCHASE",
        SALE: "SALE",
        EXPIRED: "EXPIRED"
    },
    LISTING_TYPE: {
        ALL: "ALL",
        TRADE: "TRADE",
        INSTANT_BUY: "INSTANT_BUY",
        BID: "BID",
        BUY: "BUY",
    },
    BUY_TYPE: {
        INSTANT_BUY_PURCHASE: "instant_buy_purchase", 
        BID_PURCHASE: "bid_purchase", 
        TRADE_PURCHASE: "trade_purchase", 
        INSTANT_BUY_SALE: "instant_buy_sale", 
        BID_SALE: "bid_sale", 
        TRADE_SALE: "trade_sale",
        TRADE_OFFER_RECEIVED: "trade_offer_received",
        TRADE_OFFER_PLACED: "trade_offer_placed",
        BID_PLACED: "bid_placed",
        BID_RECEIVED: "bid_received"
    },
    SCHEDULE_INITIAL_VALUE: {
        "slot1Date": {
            "date": "",
            "slot1Time": {
                "label": "",
                "from": "",
                "to": ""
            },
            "slot2Time": {
                "label": "",
                "from": "",
                "to": ""
            }
        },
        "slot2Date": {
            "date": "",
            "slot1Time": {
                "label": "",
                "from": "",
                "to": ""
            },
            "slot2Time": {
                "label": "",
                "from": "",
                "to": ""
            }
        },
        "slot3Date": {
            "date": "",
            "slot1Time": {
                "label": "",
                "from": "",
                "to": ""
            },
            "slot2Time": {
                "label": "",
                "from": "",
                "to": ""
            }
        }
    },
    // SLOT_LIST: [
    //     {
    //         "name": "slot1",
    //         "label": "7:00 AM - 8:00 AM",
    //         "fromTime": 1621387800512,
    //         "toTime": 1621391400840,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot2",
    //         "label": "8:00 AM - 9:00 AM",
    //         "fromTime": 1621391400840,
    //         "toTime": 1621395000671,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot3",
    //         "label": "9:00 AM - 10:00 AM",
    //         "fromTime": 1621395000671,
    //         "toTime": 1621398600592,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot4",
    //         "label": "10:00 AM - 11:00 AM",
    //         "fromTime": 1621398600592,
    //         "toTime": 1621402200336,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot5",
    //         "label": "11:00 AM - 12:00 PM",
    //         "fromTime": 1621402200336,
    //         "toTime": 1621405800162,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot6",
    //         "label": "12:00 PM - 1:00 PM",
    //         "fromTime": 1621405800162,
    //         "toTime": 1621409400610,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot7",
    //         "label": "1:00 PM - 2:00 PM",
    //         "fromTime": 1621409400610,
    //         "toTime": 1621413000937,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot8",
    //         "label": "2:00 PM - 3:00 PM",
    //         "fromTime": 1621413000937,
    //         "toTime": 1621416600473,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot9",
    //         "label": "3:00 PM - 4:00 PM",
    //         "fromTime": 1621416600473,
    //         "toTime": 1621420200299,
    //         "disabled": false,
    //     },
    //     {
    //         "name": "slot10",
    //         "label": "4:00 PM - 5:00 PM",
    //         "fromTime": 1621420200299,
    //         "toTime": 1621423800926,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot11",
    //         "label": "5:00 PM - 6:00 PM",
    //         "fromTime": 1621423800926,
    //         "toTime": 1621427400918,
    //         "disabled": false
    //     },
    //     {
    //         "name": "slot12",
    //         "label": "6:00 PM - 7:00 PM",
    //         "fromTime": 1621427400918,
    //         "toTime": 1621431000918,
    //         "disabled": false
    //     }
    // ],
    SLOT_LIST: [
        {
            "name": "slot1",
            "label": "7:00 AM - 8:00 AM",
            "fromTime": 7,
            "toTime": 8,
            "disabled": false
        },
        {
            "name": "slot2",
            "label": "8:00 AM - 9:00 AM",
            "fromTime": 8,
            "toTime": 9,
            "disabled": false
        },
        {
            "name": "slot3",
            "label": "9:00 AM - 10:00 AM",
            "fromTime": 9,
            "toTime": 10,
            "disabled": false
        },
        {
            "name": "slot4",
            "label": "10:00 AM - 11:00 AM",
            "fromTime": 10,
            "toTime": 11,
            "disabled": false
        },
        {
            "name": "slot5",
            "label": "11:00 AM - 12:00 PM",
            "fromTime": 11,
            "toTime": 12,
            "disabled": false
        },
        {
            "name": "slot6",
            "label": "12:00 PM - 1:00 PM",
            "fromTime": 12,
            "toTime": 13,
            "disabled": false
        },
        {
            "name": "slot7",
            "label": "1:00 PM - 2:00 PM",
            "fromTime": 13,
            "toTime": 14,
            "disabled": false
        },
        {
            "name": "slot8",
            "label": "2:00 PM - 3:00 PM",
            "fromTime": 14,
            "toTime": 15,
            "disabled": false
        },
        {
            "name": "slot9",
            "label": "3:00 PM - 4:00 PM",
            "fromTime": 15,
            "toTime": 16,
            "disabled": false,
        },
        {
            "name": "slot10",
            "label": "4:00 PM - 5:00 PM",
            "fromTime": 16,
            "toTime": 17,
            "disabled": false
        },
        {
            "name": "slot11",
            "label": "5:00 PM - 6:00 PM",
            "fromTime": 17,
            "toTime": 18,
            "disabled": false
        },
        {
            "name": "slot12",
            "label": "6:00 PM - 7:00 PM",
            "fromTime": 18,
            "toTime": 19,
            "disabled": false
        }
    ],
    DATA: {
        PROVIDE_SHIPMENT_INFO: {
            "estimatedDeliveryDate": null,
            "fflLocation": "",
            "orderDetailsSid": "",
            "shipmentCharges": 0,
            "shipmentPartnerName": "",
            "shippedDate": null,
            "sid": "",
            "trackingId": "",
            "trackingUrl": ""
          }
    }
    
}