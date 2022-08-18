import React, { useContext, useState, useEffect } from 'react'
import Layout from '../Layout';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import ApiService from "../../services/api.service";
import Breadcrumb from '../Shared/breadcrumb';
import { useParams, useHistory } from 'react-router-dom'
import { AppContext } from '../../contexts/AppContext';
import useToast from '../../commons/ToastHook';
import ProductView from './OrderScreen/ProductView';
import BidStatusView from './OrderScreen/BidStatusView';
import MatchValueView from './OrderScreen/MatchValueView';
import CartAmountSummary from './OrderScreen/CartAmountSummary';
import Tabs from './OrderScreen/Tabs';
import './product.css'


const ORDER_TYPE = Object.freeze({
    BUY: 'buy',
    BID: 'bid',
    TRADE: 'trade'
})

let tabWiseData = {
    details: {},
    tradeListItems: [],
    bidInfo: {},
    isViewedSpecificTradeModal: false,
    paymentCard: {},
    isTradePlaced: false
};

let defaultDetailsValues = {
    title: '',
    category: '',
    tcondition: '',
    manufacturer: '',
    model: '',
    caliber: '',
    barrelLength: '',
    capacity: '',
    frameFinish: '',
    price: '',
    grips: ''
};

const detectMob = () => {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

const OrderScreen = (props) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const { location, setPlatformVariables } = useContext(AppContext)
    const { type, productId } = useParams();
    const history = useHistory();
    const [bidCountInfo, setBidCountInfo] = useState({});
    const [tradePriceWith, setTradePriceWith] = useState('');
    const [tab, setTab] = useState(type === 'buy' ? "payment" : 'info');
    const [valueToMatch, setValueToMatch] = useState({ isPayBalance: true, amount: 0 });


    const isValidRoute = _.find([ORDER_TYPE.BUY, ORDER_TYPE.BID, ORDER_TYPE.TRADE], (item) => item === type)

    const isBuy = isValidRoute === ORDER_TYPE.BUY;
    const isTrade = isValidRoute === ORDER_TYPE.TRADE;
    const isBid = isValidRoute === ORDER_TYPE.BID;

    if (!isValidRoute) {
        history.replace('/')
    }

    const [product, setProduct] = useState({});
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [, forceRender] = useState();

    // this method populate the product details
    const initProduct = () => {
        spinner.show("Please wait...");
        let payload = {
            "listingSid": productId,
            "latitude": location?.position?.lat,
            "longitude": location?.position?.lng || location?.position?.lon,
            "distance": 1000,
            "distanceUnit": "ml"
        }
        ApiService.productDetail(payload).then(
            response => {
                setProduct({
                    ...response.data,
                    "platformVariables": response.data?.platformVariables ? JSON.parse(response.data?.platformVariables) : null,
                    "sheriffOfficeLocation": response.data?.sheriffOfficeLocation ? JSON.parse(response.data?.sheriffOfficeLocation) : null,
                    "fflStoreLocation": response.data?.fflStoreLocation ? JSON.parse(response.data?.fflStoreLocation) : null,
                });
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }

    // this method to get bid count
    const getMyBid = () => {
        ApiService.bidCount(productId).then(
            response => {
                setBidCountInfo(response.data);
            },
            err => { }
        );
    }

    // this method to get platform variable
    const getPlatformVariables = () => {
        try {
            ApiService.getPlatformVariables().then(
                response => {
                    setPlatformVariables(response.data);
                },
                err => {
                    console.error("Error occur when getPlatformVariables", err);
                }
            )
        } catch (err) {
            console.error("Error occur when getPlatformVariables", err);
        }
    }

    // // listening for location change
    useEffect(() => {
        initProduct();
        if (isBid) {
            getMyBid();
        }
    }, [location?.position?.lat])

    // listening for pathname
    useEffect(() => {
        initProduct();
        if (isBid) {
            getMyBid();
        }
        forceRender(Date.now());
    }, [history?.location?.pathname.split("/")[3]])

    // init component
    useEffect(() => {
        initProduct();
        if (isBid) {
            getMyBid();
        }
        getPlatformVariables();
        return () => {
            tabWiseData = {
                details: {},
                tradeListItems: [],
                bidInfo: {},
                isViewedSpecificTradeModal: false,
                paymentCard: {},
                isTradePlaced: false
            };
        };

    }, []);

    return (
        <Layout view="Offer Trade" title="Product Detail" description="Product detail page" >
            <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
            <section id="item-details-section">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-4 mobile-off">
                            <ProductView {...{ tabWiseData, isTrade, product, type }} />
                            <div class="mt-3 proDetails-left">
                                {isBid && tab !== "info" && <div className="px15 pb20"><BidStatusView {...{ product, bidCountInfo, tabWiseData }} /></div>}
                                {isTrade && <MatchValueView product={product} {...{ tradePriceWith, valueToMatch, setValueToMatch, tab, tabWiseData }} />}
                                {/* {isBuy && <CartAmountSummary {...{ setTab, tabWiseData }} />} */}
                            </div>
                        </div>
                        <div class="col-lg-8">
                            {/* {isBuy && _.isEmpty(tab) && <CartAmountSummary {...{ setTab, tabWiseData }} />} */}
                            {
                                tab
                                && <Tabs
                                    orderBy={type}
                                    {...{
                                        tab,
                                        setTab,
                                        isBid,
                                        product,
                                        tradePriceWith,
                                        setTradePriceWith,
                                        bidCountInfo,
                                        valueToMatch,
                                        setValueToMatch,
                                        tabWiseData,
                                        defaultDetailsValues,
                                        handleUpdateBidCountInfo: () => { getMyBid() }
                                    }}
                                />
                            }
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default OrderScreen;