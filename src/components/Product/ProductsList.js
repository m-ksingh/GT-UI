import React, { useContext, useState, useEffect, memo } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Spinner from "rct-tpt-spnr";
import ApiService from "../../services/api.service";
import _ from 'lodash';
import { useAuthState } from '../../contexts/AuthContext/context';
import { AppContext } from '../../contexts/AppContext';
import useToast from '../../commons/ToastHook';
import classNames from 'classnames';
import { ICN_BOOKMARK_GREEN, ICN_BOOKMARK_WHITE, ICN_PRIMARY, IcnLocation } from '../icons';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';
// owl-carousel
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const ProductsList = props => {
    const history = useHistory();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const { wishList, setWishList, myListings, setMyListings, location } = useContext(AppContext);
    const [listings, setListings] = useState(myListings);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);

    // construct payload
    const getMyCategory = () => {
        let payload = {
            "exclAppuserId": userDetails.user.sid
        };
        switch (props.view) {
            case 'New Arrivals':
                payload = { ...payload, sort: 'CREATED' }
                break;
            case 'Most Popular':
                payload = { ...payload, sort: 'RATING' }
                break;
            case 'Mostly Viewed':
                payload = {
                    ...payload,
                    "operation": "ALL"
                }
                break;
            case 'Recently Viewed':
                payload = {
                    "appuserSid": userDetails?.user?.sid,
                    "operation": "USERS"
                }
                break;
            default:
                console.log('Nothing Matching');
        }
        payload = {
            ...payload,
            "latitude": location?.position?.lat,
            "longitude": location?.position?.lng || location?.position?.lon,
            "distance": 1000,
            "distanceUnit": "ml"
        }
        return payload
    }

    // populate wishlist
    const getWishList = async (sid) => {
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

    // add wishlist
    const addToWishList = ({ productId }) => {
        try {
            setBtnDisable(true);
            spinner.show("Please wait...");
            let payload = {
                "appUserSid": userDetails.user.sid,
                "listingDetailsSid": productId,
            }
            ApiService.addWishList(payload).then(
                response => {
                    getWishList(userDetails.user.sid);
                    Toast.success({ message: 'Wishlist successfully added' });
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
    const removeFromWishList = ({ productId }) => {
        try {
            setBtnDisable(true);
            spinner.show("Please wait...");
            ApiService.removeWishListByUser(userDetails.user.sid, productId).then(
                response => {
                    getWishList(userDetails.user.sid);
                    Toast.success({ message: 'Wishlist successfully removed', time: 2000 });
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
                //setBtnDisable(false);
            });
        } catch (err) {
            console.error('error occur on addToWishList()', err)
        }
    }

    // populate my listing
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

    // listening for location change
    useEffect(() => {
        getWishList(userDetails.user.sid);
        getMyListing(userDetails.user.sid);
        const fetchData = async () => {
            setIsLoading(true);
            const payload = getMyCategory();
            spinner.show("Please wait...");
            (((_.isEqual(props.view, 'Mostly Viewed') || _.isEqual(props.view, 'Recently Viewed')) && ApiService.getViewListing)
                || ApiService.searchProducts)(payload).then(
                    response => {
                        let data  = response.data.map(r => ({
                            ...r, 
                            "listingLocation": r.listingLocation ? JSON.parse(r.listingLocation) : null,
                            "fflStoreLocation": r.fflStoreLocation ? JSON.parse(r?.fflStoreLocation) : null
                        }))
                        setData(data);
                    },
                    err => {
                        if(err?.response?.status === 406 && err?.response?.data?.error === "Services are only available for United States locations.") {
                            history.replace("/page-not-found");
                        } else {
                            Toast.error({ message: err.response?.data ? err.response?.data?.error : 'Data loading error', time: 2000 });
                        }
                    }
                ).finally(() => {
                    setIsLoading(false);
                    spinner.hide();
                });
        };
        fetchData();
    }, [location?.position?.lat]);

    // this method trigger to get image url
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listingDetailsContent)) {
            const imagesByItem = JSON.parse(item.listingDetailsContent)[0];
            imageUrl = !_.isEmpty(imagesByItem) ? _.isObject(imagesByItem.fileName) ? imagesByItem.fileName.fileName : imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    return (
        <section id="new-arrivals-section">
            <div class="container">
                <div class="row justify-content-start">
                    <div class="col-lg-12 carousel-head">
                        <h2>{props.view}</h2>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-12 mb-4">
                        <div id="demo-pranab">
                            {!isLoading && <OwlCarousel id="owl-new-arrivals" className='owl-theme carousel-container' loop nav autoplay autoplayHoverPause margin={20} items={5} autoplayTimeout={2000} responsive={{
                                0: {
                                    margin: 5,
                                    items: 1
                                },
                                300: {
                                    margin: 5,
                                    items: 1
                                },
                                600: {
                                    items: 2
                                },
                                1000: {
                                    items: 4
                                }
                            }}>
                                {
                                !_.isEmpty(data) 
                                && data.map((item, index) => {
                                    return <Link
                                        key={index}
                                        to={{
                                            pathname: "/product/" + item.sid,
                                            state: {
                                                breadcrumb: [{
                                                    name: "Home",
                                                    path: "/"
                                                },
                                                {
                                                    name: item.title,
                                                    path: `/product/${item.sid}`
                                                }
                                                ],
                                                itemInfo: item
                                            }
                                        }}
                                    >
                                        <div class="item" key={index}>
                                            {item.primary && <div className="prmy-icn">{ICN_PRIMARY}</div>}
                                            <div className="distance-badge f10 text-center aic">{`${Number(item.distance).toFixed(2)} mi`}</div>
                                            {
                                                userDetails?.user?.sid ? listings && (listings.length === 0
                                                    || listings.some((res) => (res?.appUser?.sid || res?.appUserSid) !== item.appUsersSid))
                                                    ? <>
                                                        {
                                                            wishList
                                                                && !wishList.some(res => res.listingDetailsSid === item.sid)
                                                                ?
                                                                <div className={classNames("wishlist-badge f10 text-center aic pointer", { "wishlist-badge f10 text-center aic pointer": !btnDisable, "disable-btn": btnDisable })} onClick={(e) => { addToWishList({ "productId": item.sid }); e.preventDefault(); }}>
                                                                    <span>{ICN_BOOKMARK_WHITE()}</span>

                                                                </div> :

                                                                <div className={classNames("wishlist-badge f10 text-center aic pointer", { "wishlist-badge f10 text-center aic pointer": !btnDisable, "disable-btn": btnDisable })} onClick={(e) => { removeFromWishList({ "productId": item.sid }); e.preventDefault(); }}>
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

                                            <div className="prod-img-thumb" style={{ backgroundImage: `url(${getMyImage(item)})` }}></div>
                                            <div className="pl15 pb10">
                                                <h4 className="prod-name-thumb jcb theme-color f12">{item.title}</h4>
                                                <div className="aic">
                                                    {
                                                        item.sell
                                                        && <div className="mr10">
                                                            <div className="price-tag f12 fw100 text-muted">Buy Now Price</div>
                                                            <div className="pro-price buyNowPrice f14 text-left mb-0">${item.sellPrice}</div>
                                                        </div>
                                                    }
                                                    {
                                                        item.trade
                                                        && <div className="mr10">
                                                            <div className="price-tag f12 fw100 text-muted text-left">Trade Value</div>
                                                            <div className="pro-price f14  text-left mb-0">${item?.tradeReservePrice ? item.tradeReservePrice : "0"}</div>
                                                        </div>
                                                    }
                                                    {
                                                        item.auction
                                                        && <div className="">
                                                            <div className="price-tag f12 fw100 text-muted text-left">Reserve Price</div>
                                                            <div className="pro-price f14  text-left mb-0">{item?.auctionReservePrice ? "$" + item.auctionReservePrice : "No Reserve Price"}</div>
                                                        </div>
                                                    }
                                                </div>
                                                <div className="c777 text-left f12">Qty. : {item.quantity}</div>
                                                {(item.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL) &&
                                                    <div className="c777 text-left f13">
                                                        {<IcnLocation />}
                                                        {item?.listingLocation ? <> {item?.listingLocation?.localName} , {item?.listingLocation?.countrySubdivisionName} </> : " --"}
                                                    </div>
                                                }
                                                {((item.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || item.adminToFFlStore) && item?.fflStoreLocation &&
                                                    <div className="c777 text-left f13">
                                                        {<IcnLocation />}
                                                        {item?.fflStoreLocation ? <> {item?.fflStoreLocation.premiseCity} , {item?.fflStoreLocation.premiseState}</> : " --"}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </Link>
                                })}
                            </OwlCarousel>}
                            {
                                !isLoading && !data.length && <div class="gunt-error">No Data Found</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="divider-line"></div>
        </section>
    );
}

export default memo(ProductsList);