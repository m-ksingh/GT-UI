import React, { useState, useEffect, useContext } from 'react';
import ApiService from '../../../services/api.service';
import { useParams, Link, useHistory } from 'react-router-dom';
import _ from 'lodash';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { CartContext } from '../../../contexts/CartContext';
import Spinner from "rct-tpt-spnr";
import { IcnTrashRed } from '../../icons';
import moment from "moment";
import useToast from '../../../commons/ToastHook';
import { useConfirmationModal } from '../../../commons/ConfirmationModal/ConfirmationModalHook';
import StarRating from "../../Shared/StarRating";
const MyWishlistItem = (props) => {
    const Toast = useToast();
    const userDetails = useAuthState();
    const [wishList, setWishList] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    // consuming contexts
    // consuming contexts
    const { addProduct } = useContext(CartContext);
    const spinner = useContext(Spinner);
    const history = useHistory();

    useEffect(() => {
        if(userDetails?.user?.sid){
            const fetchData = async () => {
                setIsLoading(true);
                spinner.show("Please wait...");
                ApiService.getWishList(userDetails.user.sid).then(
                    response => {
                        setWishList(response.data);
                    },
                    err => {
                        // Toast.error({ message: err.response.data ? err.response.data.error: 'Data loading error', time: 2000});
                    }
                ).finally(() => {
                    spinner.hide();
                    setIsLoading(false);
                });
            };
            fetchData();
        }
    }, []);

    // get image
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listing_details_content)) {
            const imagesByItem = JSON.parse(item.listing_details_content)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    // show delete confirmation modal when user click on remove from list
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Remove",
        body: "Are you sure, you want to remove from the wishlist?",
        onConfirm: (sid) => {
            removeFromWishList(sid);
        },
        onCancel: () => { }
    })

    // add wishlist
    const removeFromWishList = (sid) => {
        try {
            setIsLoading(true);
            spinner.show("Please wait...");
            ApiService.removeWishListByUser(userDetails.user.sid, sid).then(
                response => {
                    getWishList(userDetails.user.sid);
                    Toast.success({ message: 'Wishlist successfully removed', time: 2000 });
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            ).finally(() => {
                spinner.hide();
                setIsLoading(false);
            });
        } catch (err) {
            console.error('error occur on addToWishList()', err)
        }
    }

    const getWishList = async (sid) => {
        setIsLoading(true);
        spinner.show("Please wait...");
        ApiService.getWishList(sid).then(
            response => {
                setWishList(response.data);
            },
            err => {
            }
        ).finally(() => {
            spinner.hide();
            setIsLoading(false);
        });
    };

    const initBuyNow = (product) => {
        addProduct(product.listingDetails);
        //TODO: Have to remove set timeout
        spinner.show("Please wait...");
        setTimeout(() => {
            history.push({
                pathname: `/order/buy/${product.listingDetails.sid}`,
                state: {
                    breadcrumb: [
                        ...(props?.location?.state?.breadcrumb ? props?.location?.state?.breadcrumb : []),
                        {
                            name: "Buy Now",
                            path: `/order/buy/${product.listingDetails.sid}`
                        }
                    ]
                }
            });
            spinner.hide();
        }, 3000)
    }

    return <div className="myAc-TabContent">
        <div className="tab-pane">
            {/* <div className="carousel-head myac-head mobile-off">
                <h2 className="card-title-header">
                    My Wishlist
                </h2>
            </div>
            <div className="card-mob-head desktop-off">
                <span>My Wishlist</span>
            </div> */}
            <div className="row">
                <div className="col">
                    {
                        wishList.length > 0 ? wishList.map((order, index) => {
                            return <div className="myWishlistbox" key={index}>
                                <span className="WishlistDate">Saved: {order.addedOn && moment(order.addedOn).format('LL') || ""}</span>
                                <span className="float-right pointer" onClick={() => { showConfirmModal(order.listingDetails.sid) }}>
                                    {<IcnTrashRed width="11px" fill="#000000" />}
                                    {/* <img src="/images/icon/bookmark-dark.svg" alt="bookmark" /> */}
                                </span>
                                <div className="row jcb">
                                    <div className="col-lg-8 col-6">
                                        <div className="WishlistItem">
                                            <div className="media">
                                                <div className="prod-thumbnail-img" style={{ backgroundImage: `url(${getMyImage(order.listingDetails)})` }}></div>

                                                <div className="media-body">
                                                    <h5 className="mt-0">
                                                        <Link
                                                            to={{
                                                                pathname: `/product/${order.listingDetailsSid}`,
                                                                state: {
                                                                    breadcrumb: [
                                                                        ...(props?.location?.state?.breadcrumb ? props?.location?.state?.breadcrumb : []),
                                                                        {
                                                                            name: "Home",
                                                                            path: "/",
                                                                        },
                                                                        {
                                                                            name: order.listingDetails && order.listingDetails.title
                                                                        }
                                                                    ]
                                                                }
                                                            }}>{order.listingDetails && order.listingDetails.title}</Link>
                                                    </h5>
                                                    <p class="my-order-by-width">Sold by: {order.listingDetails && order.listingDetails.appUser.firstName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="col-lg-3 col-3 pl-1 pr-1">
                                        <div className="WishlistItem-rating">
                                            <p>Item ratings</p>
                                            <div className="rating">
                                                <StarRating totalStars={5} selected={0} disabled={true} />
                                            </div>
                                        </div>
                                    </div> */}
                                    {(order.listingDetails.trade || order.listingDetails.auction) &&
                                        <div className="col-lg-2 col-3">
                                            <div className="WishlistItem-price text-right">
                                                {
                                                    order.listingDetails.trade && <p className="wprice-label">Trade Value</p> ||
                                                    order.listingDetails.auction && <p className="wprice-label">Reserve Price</p>
                                                }
                                                {
                                                    order.listingDetails.trade && <p className="wishlist-price">${order.listingDetails.tradeReservePrice}</p> ||
                                                    order.listingDetails.auction && <p className="wishlist-price">{order?.listingDetails?.auctionReservePrice ? `${'$' + order.listingDetails.auctionReservePrice}` : "No Reserve Price"}</p>
                                                }
                                            </div>
                                        </div>}
                                    {order.listingDetails.sell &&
                                        <div className="col-lg-2 col-3">
                                            <div className="WishlistItem-price text-right">
                                                {
                                                    order.listingDetails.sell && <p className="wprice-label">Buy Now Price</p>
                                                }
                                                {
                                                    order.listingDetails.sell && <p className="wishlist-price">${order.listingDetails.estimatedPrice}</p>
                                                }
                                            </div>
                                        </div>}

                                    {/* <div className="col-lg-3 col-3 text-right mobile-off">
                                        <button className="btn move-to-cart btn-sm" onClick={() => initBuyNow(order)}>Move to cart</button>
                                    </div> */}
                                </div>
                                {/* <hr className="desktop-off" />
                                <div class="row text-center desktop-off">
                                    <div className="col-12">
                                        <button className="btn move-to-cart btn-sm" onClick={() => initBuyNow(order)}>Move to cart</button>
                                    </div>
                                </div> */}

                            </div>
                        }) : <>
                            {
                                <div class="gunt-error">No Data Found</div>
                            }
                        </>
                    }

                </div>
            </div>
        </div>
        {ConfirmationComponent}
    </div>;
}

export default MyWishlistItem;