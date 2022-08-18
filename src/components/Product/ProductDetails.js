import React, { useContext, useEffect, useState } from 'react'
import { useParams, Link, useHistory } from 'react-router-dom'
import { ProductsContext } from '../../contexts/ProductsContext';
import { CartContext } from '../../contexts/CartContext';
import { useAuthState } from '../../contexts/AuthContext/context';
import Layout from '../Layout';
import Breadcrumb from '../Shared/breadcrumb';
import ApiService from "../../services/api.service";
import Login from '../Login/Login';
import Spinner from "rct-tpt-spnr";
import _, { set } from 'lodash';
import ReportIssue from "./../Shared/ReportIssue";
import { ICN_BOOKMARK_GREEN, ICN_PRIMARY_LG, ICN_BOOKMARK_WHITE, IcnLocation, ICN_STAR_Y } from '../icons';
import { AppContext } from '../../contexts/AppContext';
import useToast from '../../commons/ToastHook';
import TermAndCondition from '../Shared/TermAndCondition/TermAndCondition.';
import ListingItemsView from '../Listing/ListingItemsView';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';
import classNames from 'classnames';
import StoreDetails from '../PlatformAdmin/Request/StoreDetails';
// owl-carousel
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

function ProductDetail(props) {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const { wishList, setWishList, myListings, setMyListings, location, setValueBy, isLogin } = useContext(AppContext);
    const [showTerm, setShowTerm] = useState(false)
    const [reportModal, setReportModal] = useState(false);
    const userDetails = useAuthState();
    const history = useHistory();
    const [validCaptcha, setValidCaptcha] = useState(false)
    const [agreeTermCondition, setAgreeTermCondition] = useState(false)
    const [actionTaken, setActionTaken] = useState('buy')
    const [loginModel, setLoginModel] = useState(false)
    const [showFFlStoreDetails, setShowFFlStoreDetails] = useState(false);
    const [selectedStore, setSelectedStore] = useState({});
    // consuming contexts
    const { addProduct, cartItems, increase } = useContext(CartContext);
    const [selectedQuantity, setSelectedQuantity] = useState("1");
    const [listings, setListings] = useState(myListings);
    const [listingRatings, setListingRatings] = useState([]);
    const [averageReviewRatings, setAverageReviewRatings] = useState();

    // get id of current product
    const { productId } = useParams()

    // fetch all products data
    const { products } = useContext(ProductsContext)

    // filter the product with matching id
    let thisProduct = products.filter(product => product.sid === productId)

    const isInCart = () => {
        return !!cartItems.find(item => item.sid === productId);
    }


    const [images, setImages] = useState([]);
    const [product, setProduct] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);
    const [, forceRender] = useState();

    const getMyListing = async (sid) => {
        try {
            ApiService.getMyLists(sid).then(
                response => {
                    setMyListings(response.data);
                    setListings(response.data);
                },
                err => {
                    // Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur on getMyListing()", err)
        }
    }

    const getProductDetails = () => {
        try {
            let payload = {
                "listingSid": productId,
                "latitude": location?.position?.lat,
                "longitude": location?.position?.lng || location?.position?.lon,
                "distance": GLOBAL_CONSTANTS.US_NATION_RADIUS,
                "distanceUnit": "ml"
            }
            ApiService.productDetail(payload).then(
                response => {
                    setProduct({
                        ...response.data,
                        "platformVariables": response.data?.platformVariables ? JSON.parse(response.data.platformVariables) : null,
                        "sheriffOfficeLocation": response.data?.sheriffOfficeLocation ? JSON.parse(response.data?.sheriffOfficeLocation) : null,
                        "fflStoreLocation": response.data?.fflStoreLocation ? JSON.parse(response.data?.fflStoreLocation) : null,
                        "listingLocation": response.data?.listingLocation ? JSON.parse(response.data?.listingLocation) : null,
                    });
                    console.log("Product", JSON.parse(response.data.fflStoreLocation).sid);
                    if (response.data.listingDetailsContent) {
                        if (!_.includes(JSON.parse(response.data.listingDetailsContent), 'listingContent')) {
                            setImages(JSON.parse(response.data.listingDetailsContent));
                        } else {
                            setImages([{
                                "fileName": "../images/no-image-available.png"
                            }]);
                        }
                    } else {
                        setImages([{
                            "fileName": "../images/no-image-available.png"
                        }]);
                    }
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
            });
        } catch (err) {
            console.error("Error occurred in getProductDetails--", err);
        }
    }

    useEffect(() => {
        getProductDetails();
    }, [location?.position?.lat])

    useEffect(() => {
        forceRender(Date.now());
    }, [images])

    useEffect(() => {
        getProductDetails();
        forceRender(Date.now());
    }, [history?.location?.pathname.split("/")[2]])

    useEffect(() => {
        spinner.show("Please wait...");
        getMyListing(userDetails.user.sid);
        ApiService.createViewList({
            "appuserSid": userDetails?.user?.sid || null,
            "listingSid": productId,
            "latitude": location?.position?.lat,
            "longitude": location?.position?.lng || location?.position?.lon
        });
    }, []);

    // add wishlist
    const addToWishList = () => {
        try {
            setBtnDisable(true);
            spinner.show("Please wait...");
            let payload = {
                "appUserSid": userDetails.user.sid,
                "listingDetailsSid": productId,
            }
            ApiService.addWishList(payload).then(
                response => {
                    if (response.status == "200") {
                        getWishList(userDetails.user.sid);
                        Toast.success({ message: 'Wishlist successfully added', time: 2000 });
                    }
                },
                err => {
                    if (!userDetails?.user?.sid) {
                        Toast.error({ message: 'Please login or sign up to continue.', time: 2000 });
                    } else {
                        Toast.error({ message: err.response && err.response.data ? (err.response.data.message || err.response.data.error || err.response.data.status) : 'Internal server error! Please try after sometime.', time: 2000 });
                    }
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
                // setBtnDisable(false);
            });
        } catch (err) {
            console.error('error occur on addToWishList()', err)
        }
    }

    // add wishlist
    const removeFromWishList = () => {
        try {
            setBtnDisable(true);
            spinner.show("Please wait...");
            ApiService.removeWishListByUser(userDetails.user.sid, productId).then(
                response => {
                    if (response.status == "200") {
                        getWishList(userDetails.user.sid);
                        Toast.success({ message: 'Wishlist successfully removed', time: 2000 });
                    }
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
                // setBtnDisable(false);
            });
        } catch (err) {
            console.error('error occur on addToWishList()', err)
        }
    }

    const initBuyNow = (product) => {
        addProduct(product);
        //TODO: Have to remove set timeout
        spinner.show("Please wait...");
        setTimeout(() => {
            history.push({
                pathname: `/order/buy/${product.sid}`,
                state: {
                    breadcrumb: [
                        ...(props?.location?.state?.breadcrumb ? props?.location?.state?.breadcrumb : []),
                        {
                            name: "Buy Now",
                            path: `/order/buy/${product.sid}`
                        }
                    ],
                    itemQuantity: selectedQuantity,
                    itemInfo: product,
                    distance: Number(product.distance || 0)
                }
            });
            spinner.hide();
        }, 2000)
    }

    const getWishList = (sid) => {
        spinner.show("Please wait...");
        ApiService.getWishList(sid).then(
            response => {
                setWishList(response.data);
                setBtnDisable(false);
            },
            err => {
                console.error("Error occurred while --", err);
                setBtnDisable(false);
            }
        ).finally(() => {
            spinner.hide();
        });
    };

    const initProductAction = () => {
        if (agreeTermCondition) {
            switch (actionTaken) {
                case 'buy':
                    initBuyNow(product);
                    break;
                case 'trade':
                    history.push({
                        pathname: `/order/trade/${product.sid}`,
                        state: {
                            breadcrumb: [
                                ...(props?.location?.state?.breadcrumb ? props?.location?.state?.breadcrumb : []),
                                {
                                    name: !_.isEmpty(product.trade_with_listing_type) ? "Offer Specific Trade" : "Offer Trade",
                                    path: `/order/trade/${product.sid}`
                                }
                            ],
                            itemQuantity: selectedQuantity || 1,
                            itemInfo: product,
                            distance: Number(product.distance || 0)
                        }
                    });
                    break;
                case 'bid':
                    history.push({
                        pathname: `/order/bid/${product.sid}`,
                        state: {
                            breadcrumb: [
                                ...(props?.location?.state?.breadcrumb ? props?.location?.state?.breadcrumb : []),
                                {
                                    name: "Make a Bid",
                                    path: `/order/bid/${product.sid}`
                                }
                            ],
                            itemQuantity: selectedQuantity || 1,
                            itemInfo: product,
                            distance: Number(product.distance || 0)
                        }
                    });
                    break;
                default:
                    console.log('No Action Match');
            }
        }
    }

    const conformModel = async (action) => {

        if (userDetails && userDetails.user && userDetails.user.sid) {
            let isListingActive = await ApiService.validateActiveListing(productId);
            if (isListingActive.data) {
                !agreeTermCondition && setShowTerm(true)
                setActionTaken(action)
            } else {
                history.push("/");
                Toast.warning({ message: 'Sorry! This item is currently sold out!', time: 2000 });
            }

        } else {
            setValueBy('SET_LOGIN', true);
        }
    }

    const getListingRatings = async (productId) => {
        try {
            spinner.show("Please wait...");
            const payload = {
                "sid": productId,
                "startPage": 1,
                "noOfData": 10
            }
            await ApiService.getListingRating(payload).then(
                response => {
                    setListingRatings(response.data);
                    ratingAverage(response.data);
                },
                err => {
                    console.error("Error occurred in getListingRatings() --", err);

                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur when getListingRatings --- ", err);
        }
    };


    const ratingAverage = (value) => {
        try {
            let initRatings = 0;
            const len = value.length;
            for (let i = 0; i < len; i++) {
                initRatings = value[i].productRating + initRatings;
            }
            const averageratings = Math.round(initRatings / len)
            let array = []
            for (let i = 0; i < averageratings; i++) {
                array.push("")
            }
            setAverageReviewRatings(array);
        } catch (err) {
            console.error("Error occur when ratingAverage --- ", err);
        }
    }

    useEffect(() => {
        if (userDetails?.user) {
            getListingRatings(productId)
        }
    }, [productId])


    useEffect(() => {
        if (isLogin) {
            setLoginModel(true);
        }
    }, [isLogin])

    useEffect(() => {
        if (!loginModel) {
            setValueBy('SET_LOGIN', false);
        }
    }, [loginModel])

    useEffect(() => {
        agreeTermCondition && initProductAction()
    }, [agreeTermCondition])



    // render JSX
    return (<>
        {product && <Layout titleserialNumber="Product Detail" description="Product detail page" >
            <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
            <section id="item-details-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 mb-4">
                            <div id="demo-pranab" className="pos-rel">
                                <OwlCarousel id="owl-item-details" className='owl-theme carousel-container' loop nav autoplay autoplayHoverPause margin={20} items={1} autoplayTimeout={2000} responsive={{
                                    0: {
                                        items: 1
                                    },
                                    600: {
                                        items: 1
                                    },
                                    1000: {
                                        items: 1
                                    }
                                }}>
                                    {!_.isEmpty(images) && images.map((item, index) => {
                                        return <div className="item product-images" key={index}>
                                            {product.primary && <div className="prmy-icn">{ICN_PRIMARY_LG}</div>}
                                            <div className="distance-badge f10 text-center aic">{`${Number(product.distance).toFixed(2)} mi`}</div>
                                            {/* <div className={classNames("wishlist-badge f10 text-center aic", { "wishlist-badge f10 text-center aic": !btnDisable, "disable-btn": btnDisable })}>
                                                {
                                                    userDetails?.user?.sid ? listings && (listings.length === 0
                                                        || listings.some((res) => res.appUser.sid !== product.appUsersSid))
                                                        ? <>
                                                            {
                                                                wishList
                                                                    && !wishList.some(res => res.listingDetailsSid === productId)
                                                                    ? <span onClick={() => { addToWishList();}}><span>{ICN_BOOKMARK_WHITE()}</span></span>
                                                                    : <span onClick={() => { removeFromWishList(); }}><span>{ICN_BOOKMARK_GREEN()}</span></span>
                                                            }

                                                        </>
                                                        : <a onClick={(e) => {e.preventDefault(); Toast.error({ message: "This is your own listing item you can't add to Wishlist", time: 2000 })}}><span>{ICN_BOOKMARK_WHITE()} </span></a>
                                                        : <a onClick={(e) => {e.preventDefault(); Toast.error({ message: 'Please login or sign up to continue.', time: 2000 })}}><span>{ICN_BOOKMARK_WHITE()} </span></a>
                                                }
                                            </div> */}
                                            {
                                                userDetails?.user?.sid ? listings && (listings.length === 0
                                                    || listings.some((res) => res.appUser.sid !== product.appUsersSid))
                                                    ? <>
                                                        {
                                                            wishList
                                                                && !wishList.some(res => res.listingDetailsSid === productId)
                                                                ?
                                                                <div className={classNames("wishlist-badge f10 text-center aic pointer", { "wishlist-badge f10 text-center aic pointer": !btnDisable, "disable-btn": btnDisable })} onClick={() => { addToWishList(); }}>
                                                                    <span>{ICN_BOOKMARK_WHITE()}</span>

                                                                </div> :

                                                                <div className={classNames("wishlist-badge f10 text-center aic pointer", { "wishlist-badge f10 text-center aic pointer": !btnDisable, "disable-btn": btnDisable })} onClick={() => { removeFromWishList(); }}>
                                                                    <span>{ICN_BOOKMARK_GREEN()}</span>
                                                                </div>
                                                        }
                                                    </>
                                                    : <div className="wishlist-badge f10 text-center aic pointer" onClick={(e) => { e.preventDefault(); Toast.error({ message: "This is your own listing item you can't add to Wishlist", time: 2000 }) }}>
                                                        <span>{ICN_BOOKMARK_WHITE()}</span>
                                                    </div>
                                                    : <div className="wishlist-badge f10 text-center aic pointer" onClick={(e) => { e.preventDefault(); Toast.error({ message: 'Please login or sign up to continue.', time: 2000 }) }}>
                                                        <span>{ICN_BOOKMARK_WHITE()}</span>
                                                    </div>
                                            }
                                            <div className="prod-image-div" style={{ backgroundImage: `url(${item.fileName || item.key})` }}></div>
                                        </div>
                                    })}
                                </OwlCarousel>
                                {
                                    <>
                                        {/* <div className="pro-pg-btnArea"> */}
                                        {/* <div className={classNames("pro-pg-btnArea",{"pro-pg-btnArea": !loadings, "disable-btn": loadings})}>
                                            {
                                                listings
                                                    && (listings.length === 0
                                                        || listings.some((res) => res.appUser.sid !== product.appUsersSid))
                                                    ? <>
                                                        {
                                                            wishList
                                                                && !wishList.some(res => res.listingDetailsSid === productId)
                                                                ? <span><a onClick={() => {addToWishList(); onClickBtnDisable();}} className="probtnLight pro-pg-btn"><span className="mr-2">{ICN_BOOKMARK_GREEN()} </span>Add to Wishlist</a></span>
                                                                : <span><a onClick={() => {removeFromWishList(); onClickBtnDisable();}} className="probtnLight pro-pg-btn"><span className="mr-2">{ICN_BOOKMARK_GREEN()} </span> Remove Wishlist</a></span>
                                                        }

                                                    </>
                                                    : <a onClick={() => Toast.error({ message: "This is your own listing item you can't add to Wishlist", time: 2000 })} className="probtnLight pro-pg-btn"><span className="mr-2">{ICN_BOOKMARK_GREEN()} </span>Add to Wishlist</a>
                                            }
                                            {
                                                product.sell && isInCart(thisProduct) &&
                                                <span onClick={() => increase(product)}><a className="probtnLightSnd pro-pg-btn">Add more</a></span>
                                            }
                                            {
                                                product.sell && !isInCart(thisProduct) &&
                                                <span onClick={() => addProduct(product)}><a className="probtnLightSnd pro-pg-btn"><Link to={`/order/buy/${product.sid}`} className="proBtn">Add to cart</Link></a></span>
                                            }
                                        </div> */}
                                        <div className="proPg-btnArea mobile-off">
                                            {
                                                userDetails?.user?.sid ? listings
                                                    && (listings.length === 0
                                                        || listings.some((res) => res.appUser.sid !== product.appUsersSid))
                                                    ? <>
                                                        <ul>
                                                            {product.sell && <li onClick={() => { conformModel('buy') }}><a className="proBtn buy-btn proBtn-hover">Buy Now</a></li>}
                                                            {product.trade && <li onClick={() => conformModel('trade')}><a className="proBtn trade-offer-btn proBtn-hover">{!_.isEmpty(product.trade_with_listing_type) ? "Offer Specific Trade" : "Offer Trade"}</a></li>}
                                                            {product.auction && <li onClick={() => conformModel('bid')}><a className="proBtn bid-btn bid-btn-hover">Make a Bid</a></li>}
                                                        </ul>
                                                    </>
                                                    : <ul>
                                                        {product.sell && <li onClick={() => Toast.error({ message: "This is your own listing item you can't buy", time: 2000 })}><a className="proBtn buy-btn proBtn-hover">Buy Now</a></li>}
                                                        {product.trade && <li><a onClick={() => Toast.error({ message: "This is your own listing item you can't trade", time: 2000 })} className="proBtn trade-offer-btn proBtn-hover">{!_.isEmpty(product.trade_with_listing_type) ? "Offer Specific Trade" : "Offer Trade"}</a></li>}
                                                        {product.auction && <li><a onClick={() => Toast.error({ message: "This is your own listing item you can't bid", time: 2000 })} className="proBtn bid-btn bid-btn-hover">Make a Bid</a></li>}
                                                    </ul>
                                                    : <ul>
                                                        {product.sell && <li onClick={() => setLoginModel(true)}><a className="proBtn buy-btn proBtn-hover">Buy Now</a></li>}
                                                        {product.trade && <li><a onClick={() => setLoginModel(true)} className="proBtn trade-offer-btn proBtn-hover">{!_.isEmpty(product.trade_with_listing_type) ? "Offer Specific Trade" : "Offer Trade"}</a></li>}
                                                        {product.auction && <li><a onClick={() => setLoginModel(true)} className="proBtn bid-btn bid-btn-hover">Make a Bid</a></li>}
                                                    </ul>
                                            }
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                        <div className="col-lg-8">
                            {!product.primary && <div className="row bg-white mb-2 justify-content-between">
                                <div className="col-lg-8 col-6">
                                    <h2 className="product-title">{product.title}</h2>
                                    <div className="aic">
                                        {
                                            product.sell
                                            && <div className="mr20">
                                                <p className="price-tag f12 fw100">Buy Now Price</p>
                                                <p className="pro-price buyNowPrice">${product?.sellPrice ? product.sellPrice : "0"}</p>
                                            </div>
                                        }
                                        {
                                            product.auction
                                            && <div className="mr20">
                                                <p className="price-tag f12 fw100">Reserve Price</p>
                                                <p className="pro-price">{product?.auctionReservePrice ? `$${product.auctionReservePrice}` : "No Reserve Price"}</p>
                                            </div>
                                        }
                                        {
                                            product.trade
                                            && <div className="">
                                                <p className="price-tag f12 fw100">Trade Value</p>
                                                <p className="pro-price">${product?.tradeReservePrice ? `${product.tradeReservePrice}` : "0"}</p>
                                            </div>
                                        }
                                    </div>
                                    {/* <p className="rating">
                                        <span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                <defs>
                                                </defs>
                                                <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                            </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                <defs>
                                                </defs>
                                                <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                            </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                <defs>
                                                </defs>
                                                <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                            </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                <defs>
                                                </defs>
                                                <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                            </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                <defs>
                                                </defs>
                                                <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                            </svg></span></p> */}
                                </div>
                                <div className="col-lg-4 col-6 proDetails-right">
                                    <p className="mod-used-cls text-right jce"><span className="item-cond-badge">{product.tconditionName || ""}</span></p>
                                    {/* <p className="pro-rev-cls">136 reviews</p> */}
                                    {userDetails.user.sid && <p className="report-cls text-right" onClick={() => setReportModal(true)}><img className="mr-2" src="images/icon/conversation.svg"></img>Report Issue</p>}
                                </div>
                                {/* quantity */}
                                <div className="col-12 col-lg-12 mt-3">
                                    <div className="aic">
                                        <div className="mr10">Qty.</div>
                                        <div>
                                            <select
                                                className="form-control"
                                                defaultValue={selectedQuantity}
                                                onChange={(e) => { setSelectedQuantity(e.target.value) }}
                                                disabled={!product.sell}
                                            >
                                                {[...Array(product.quantity >= 1 ? product.quantity : 1).keys()].map((res, i) => <option key={i} className="form-control" value={res + 1} name={res + 1}>{res + 1}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12 mt-3">
                                    <div className="pro-dtle-box">
                                        <p className="pro-description">{product.description}</p>
                                        {(product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL) && product?.listingLocation &&
                                            <p className="c777 text-left f13">
                                                {<IcnLocation />}
                                                {product?.listingLocation ? <> {product?.listingLocation?.localName} , {product?.listingLocation?.countrySubdivisionName} </> : " --"}
                                            </p>
                                        }
                                        {((product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore) && product?.fflStoreLocation &&
                                            <p className="c777 text-left f13">
                                                {<IcnLocation />}
                                                {product?.fflStoreLocation ? <> {product?.fflStoreLocation.premiseCity} , {product?.fflStoreLocation.premiseState}</> : " --"}
                                            </p>
                                        }

                                        <h4 className="pro-spc-head">Specifications</h4>
                                        <table className="table table-borderless pro-dtails-table">
                                            <tbody>
                                                <tr>
                                                    <td>Category :</td>
                                                    <td><div className="spec-label">{product.categoryName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Condition :</td>
                                                    <td><div className="spec-label">{product.tconditionName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Manufacturer :</td>
                                                    <td><div className="spec-label">{product.manufacturerName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Model :</td>
                                                    <td><div className="spec-label">{product.modelName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Caliber :</td>
                                                    <td><div className="spec-label">{product.caliberName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Barrel Length :</td>
                                                    <td><div className="spec-label">{product.barrelLengthName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Capacity :</td>
                                                    <td><div className="spec-label">{product.capacityName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Frame Finish :</td>
                                                    <td><div className="spec-label">{product.frameFinishName || ""}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Grips :</td>
                                                    <td><div className="spec-label">{product.gripsName || ""}</div></td>
                                                </tr>
                                                {
                                                    product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL
                                                    && (product.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM || product.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.PRE_1968)
                                                    && !_.isEmpty(product.serialNumber) && <tr>
                                                        <td>Serial Number :</td>
                                                        <td><div className="spec-label">{product?.serialNumber ? JSON.parse(product.serialNumber)?.serialNumber || "" : ""}</div></td>
                                                    </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>}
                            {product.primary && <div className="row bg-white mb-2"><ListingItemsView {...{ bundleItems: product?.secondaryListings ? JSON.parse(product.secondaryListings) : null, listingInfo: product, updatQuantity: (q) => { setSelectedQuantity(q) } }} /></div>}
                            {/* <div className="row bg-white mb-2">
                                <div className="col-lg-12">
                                    <div className="ind-seller-box">
                                        <h6>Seller</h6>
                                        {
                                            product.fflStore &&
                                            <div className="mt-2">
                                                <p className="m-0 seller-info-name">{product.fflStore.name}</p>
                                            </div>
                                        }
                                        {
                                            (!product.fflStore && product.appUser) &&
                                            <div className="mt-2">
                                                <p className="m-0 seller-info-name">{product.appUser.firstName} {product.appUser.lastName}</p>
                                                <p className="m-0 seller-info-email">{product.appUser.email}</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div> */}
                            {product.fflStoreName &&
                                <div className="row bg-white mb-2">
                                    <div className="col-lg-12">
                                        <div className="ind-seller-box">
                                            {product.fflStoreName && <h6 className='cp underline' onClick={() => { setSelectedStore(product.fflStoreLocation); setShowFFlStoreDetails(true) }}>{`${product?.fflStoreName} , ${product?.fflPremiseState}`}</h6>}
                                            <div className="rating">
                                                {
                                                    !_.isEmpty(averageReviewRatings) && averageReviewRatings.map((list, index) => {
                                                        return <span key={index}>{ICN_STAR_Y()}</span>
                                                    })
                                                }
                                            </div>

                                        </div>
                                    </div>
                                </div>}

                            <div className="row bg-white mb-2">
                                <div className="col-lg-12">
                                    <div className="ind-seller-box">
                                        <h6>Available At</h6>
                                        <div className="mt-2 d-flex">
                                            {(product.fflStoreEnabled || (product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore) && <div className="speciality-btn">FFL Stores</div>}
                                            {product.sheriffOfficeEnabled && <div className="speciality-btn">Sherriff's Office</div>}
                                            {product.availableOtherLocation && <div className="speciality-btn">Other</div>}
                                        </div>
                                        {
                                            product?.shipBeyondPreferredDistance
                                                ? <div className="ready-to-ship f12 pl5 py10"><span><i className="fa fa-info-circle" aria-hidden="true"></i></span> This seller is ready to ship the item</div>
                                                : <div className="shipment-charges-notification f12 pl5 py10"><span><i className="fa fa-info-circle" aria-hidden="true"></i></span> This seller does not ship the item</div>
                                        }
                                    </div>
                                </div>
                            </div>
                            {
                                product &&
                                product.returnable &&
                                product.platformVariables && <div className="row bg-white mb-2">
                                    <div className="col-lg-12">
                                        <div className="ind-seller-box">
                                            <h6>Return Policy</h6>
                                            <div className="fdc mt-2 f12">
                                                <span>This item is eligible for return, within <span className="text-semi-bold">{product.platformVariables.returnPeriod} days</span> of the delivery.</span>
                                                <span>Restocking fees of <span className="text-semi-bold">{product.platformVariables.restockingFees.percentage}%</span><span className="px5">or</span><span className="text-semi-bold">${product.platformVariables.restockingFees.amount}</span> will be charged on the item's cost whichever is higher.</span>
                                                {/* {product.platformVariables.restockingFees.type === "percentage" ? product.platformVariables.restockingFees.value + "%" : "$" + product.platformVariables.restockingFees.value} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            {/* <div className="row bg-white mt-3">
                                <div className="col-lg-12">
                                    <div className="ind-seller-box">
                                        <h6>Individual Seller</h6>
                                        <p className="rating"><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                    <defs>
                                                    </defs>
                                                    <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                    <defs></defs>
                                                    <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                    <defs></defs>
                                                    <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                    <defs></defs>
                                                    <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                    <defs></defs>
                                                    <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                </svg></span></p>
                                    </div>
                                </div>
                            </div> */}

                            {/* <div className="row bg-white mt-3">
                                <div className="col-lg-12">
                                    <div className="pro-review-box">
                                        <h6>Reviews</h6>
                                        <div className="pro-review-item">
                                            <p className="review-title">Review title</p>
                                            <p className="rating"><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs></defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs></defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs></defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs></defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs></defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span> <span className="float-right">2 months ago</span></p>
                                            <p className="review-desc">Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                                        </div>
                                        <div className="pro-review-item">
                                            <p className="review-title">Review title</p>
                                            <p className="rating"><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs></defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span> <span className="float-right">2 months ago</span></p>
                                            <p className="review-desc">Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                                        </div>
                                        <div className="pro-review-item">
                                            <p className="review-title">Review title</p>
                                            <p className="rating"><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span> <span className="float-right">2 months ago</span></p>
                                            <p className="review-desc">Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                                        </div>
                                        <div className="pro-review-item">
                                            <p className="review-title">Review title</p>
                                            <p className="rating"><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span><span><svg xmlns="http://www.w3.org/2000/svg" width="6.305" height="6.042" viewBox="0 0 6.305 6.042">
                                                        <defs>

                                                        </defs>
                                                        <path className="aaa" d="M6.288,2.775A.334.334,0,0,0,6,2.545L4.18,2.38,3.461.7a.335.335,0,0,0-.616,0L2.125,2.38.3,2.545a.335.335,0,0,0-.19.586L1.49,4.338,1.084,6.124a.335.335,0,0,0,.5.362l1.57-.938,1.569.938a.335.335,0,0,0,.5-.362L4.815,4.338,6.19,3.132A.335.335,0,0,0,6.288,2.775Zm0,0" transform="translate(0 -0.492)"></path>
                                                    </svg></span> <span className="float-right">2 months ago</span></p>
                                            <p className="review-desc">Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                                        </div>
                                        <div className="review-viewBtn">View all</div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </section>
            {/* {!props?.location?.state?.fromListing &&  */}
            <section id="product-pgBtn-section" className="desktop-off">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="proPg-btnArea">

                                {
                                    listings
                                        && (listings.length === 0 || listings.some((res) => res.appUser.sid !== product.appUsersSid))
                                        ? <ul>
                                            {product.sell && <li onClick={() => { conformModel('buy') }}><a className="proBtn buy-btn proBtn-hover">Buy Now</a></li>}
                                            {product.trade && <li onClick={() => conformModel('trade')}><a className="proBtn trade-offer-btn proBtn-hover">{!_.isEmpty(product.trade_with_listing_type) ? "Offer Specific Trade" : "Offer Trade"}</a></li>}
                                            {product.auction && <li onClick={() => conformModel('bid')}><a className="proBtn bid-btn bid-btn-hover">Make a Bid</a></li>}
                                        </ul>
                                        : <ul>
                                            {product.sell && <li onClick={() => Toast.error({ message: "This is your own listing item you can't buy", time: 2000 })}><a className="proBtn buy-btn proBtn-hover">Buy Now</a></li>}
                                            {product.trade && <li><a onClick={() => Toast.error({ message: "This is your own listing item you can't trade", time: 2000 })} className="proBtn trade-offer-btn proBtn-hover">{!_.isEmpty(product.trade_with_listing_type) ? "Offer Specific Trade" : "Offer Trade"}</a></li>}
                                            {product.auction && <li><a onClick={() => Toast.error({ message: "This is your own listing item you can't bid", time: 2000 })} className="proBtn bid-btn bid-btn-hover">Make a Bid</a></li>}
                                        </ul>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {
                showFFlStoreDetails
                && !_.isEmpty(selectedStore)
                && <StoreDetails {...{
                    show: showFFlStoreDetails,
                    setShow: setShowFFlStoreDetails,
                    sellerStoreInfo: true,
                    selectedStore
                }} />
            }
            {reportModal && <ReportIssue {...{ reportModal, setReportModal, listingInfo: product, reportType: 'PRODUCT' }} />}
            {loginModel && <Login {...{ loginModel, setLoginModel }} />}
            {
                showTerm
                && <TermAndCondition
                    {...{
                        show: showTerm,
                        setShow: setShowTerm,
                        showCaptcha: true,
                        validCaptcha,
                        setValidCaptcha,
                        setAgreeTermCondition,
                        onAgreeCallback: () => {
                            setAgreeTermCondition(true)
                        }
                    }}
                />
            }
        </Layout>
        }</>);
}

export default ProductDetail
