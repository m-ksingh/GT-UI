import React, { useContext, useEffect, memo } from 'react'
import _ from 'lodash';
import $ from 'jquery';
import { CartContext } from '../../../contexts/CartContext';
import { AppContext } from '../../../contexts/AppContext';
import MakeBidView from './MakeBidView';
import DetailsFormView from './DetailsFormView';
import CartAmountSummary from './CartAmountSummary';
import PaymentsView from './PaymentsView';
import LocationView from './LocationView';
import PlacedView from './PlacedView';
import { useParams, useHistory } from "react-router-dom";
import ApiService from "../../../services/api.service";
import Spinner from "rct-tpt-spnr";
import GLOBAL_CONSTANTS from "../../../Constants/GlobalConstants";

const Tabs = ({ 
    orderBy, 
    isBid, 
    setTab, 
    tab, 
    product, 
    bidCountInfo, 
    tradePriceWith, 
    setTradePriceWith, 
    valueToMatch, 
    setValueToMatch,
    tabWiseData,
    defaultDetailsValues,
    handleUpdateBidCountInfo = () => {}
}) => {
    const { type } = useParams();
    const spinner = useContext(Spinner);
    const stepsByOfferTrade = [{
        name: 'Submit Offer',
        id: 'info'
    }, {
        name: 'Select Payment',
        id: 'payment'
    }, {
        name: 'Set Pickup Location',
        id: 'location'
    }, {
        name: 'Offer Placed',
        id: 'post'
    }
    ];

    const stepsByBid = [{
        name: 'Submit Bid',
        id: 'info'
    }, {
        name: 'Select Payment',
        id: 'payment'
    }, {
        name: 'Set Pickup Location',
        id: 'location'
    }, {
        name: 'Bid Placed',
        id: 'post'
    }
    ];

    const stepsByBuy = [{
        name: 'Payment Info',
        id: 'payment'
    }, {
        name: 'Set Pickup Location',
        id: 'location'
    }, {
        name: 'Place Order',
        id: 'post'
    }
    ];

    let stepsBy;
    switch (orderBy) {
        case 'buy':
            stepsBy = stepsByBuy;
            break;
        case 'trade':
            stepsBy = stepsByOfferTrade;
            break;
        case 'bid':
            stepsBy = stepsByBid;
            break;
        default:
            console.log('Not matching!');
    }

    const DefferPrice = () => {
        let val = (_.toNumber(product.sellPrice) - _.toNumber(tradePriceWith))
        return val > 0 ? val : 0
    }

    const { carts } = useContext(AppContext);
    const { cartItems } = useContext(CartContext);
    tabWiseData.carts = _.cloneDeep(carts);

    // this method trigger when user click on wizards
    const onClickStep = (id) => {
        $(`#${id}`).hasClass("active") && setTab(id)
    }


    // toggle listing
    const toggleListing = (list = [], disable = false) => {
        spinner.show("Please wait...");
        let payload = {
            "listingSids": list.map(r => r.sid),
            "toggle": disable
        };
        ApiService.isOfferedForTrade(payload).then(
            response => { },
            err => { }
        ).finally(() => {
            spinner.hide();
        });
    }

    // init component
    useEffect(() => {
        
        // while component unmounted
        return (() => {
            if(!tabWiseData.isTradePlaced && type === GLOBAL_CONSTANTS.ORDER_TYPE.TRADE) {
                if(!_.isEmpty(tabWiseData.tradeListItems)) toggleListing(tabWiseData.tradeListItems);
            }
        })
    }, [])

    return (
        <div class="container-fluid">
            <div class="row justify-content-center mt-0">
                <div class="col-12 text-center p-0 mt-3 mb-2">
                    <div class="card nobg">
                        <ul id="trade-progressbar" class="d-flex justify-content-center">
                            {
                                stepsBy.map((steps, index) => {
                                    return <li onClick={() => { onClickStep(steps.id) }} className={`pointer ${index === 0 && "active"}`} id={steps.id} key={index}><strong>{steps.name}</strong></li>
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>

            <div class="row justify-content-center mt-0">
                <div class="col-12 col-sm-9 col-md-7 col-lg-12 text-center mb-2">

                    <div>
                        <div id="msform" className="order-placed-main">
                            <div class="card border noRadious proDetails-left">
                                <div class="bg-white justify-content-between">
                                    {tab === "info" && (isBid ? <MakeBidView {...{ setTab, product, bidCountInfo, tabWiseData, handleUpdateBidCountInfo }} /> : <DetailsFormView {...{ orderBy, setTab, product, tradePriceWith, setTradePriceWith, valueToMatch, setValueToMatch, tab, defaultDetailsValues, tabWiseData }} />)}
                                    {/* {tab === "cart" && <Checkout {...{ setTab }} />} */}
                                    {tab === "cartsummary" && <CartAmountSummary {...{ orderBy, setTab }} />}
                                    {tab === "payment" && <PaymentsView {...{ orderBy, setTab, product, valueToMatch, tabWiseData }} />}
                                    {tab === "location" && <LocationView {...{ setTab, product, bidCountInfo, valueToMatch, tabWiseData, handleUpdateBidCountInfo }} />}
                                    {tab === "post" && <PlacedView {...{ setTab, tab, product, DefferPrice, valueToMatch, tabWiseData }} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(Tabs);