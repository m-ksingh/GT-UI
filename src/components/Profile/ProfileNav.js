import React, { useEffect, useState , useContext} from 'react';
import {useParams, Link} from 'react-router-dom';
import { ICN_STAR_Y } from '../icons'
import { useAuthState } from  '../../contexts/AuthContext/context';
import ApiService from '../../services/api.service';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";

const ProfileNav = () => {
    const {viewId} = useParams()
    const userDetails = useAuthState();
    const spinner = useContext(Spinner);
    const [sellerRatings, setSellerRatings] = useState([]);
    const [averageReviewRatings, setAverageReviewRatings] = useState();


    const getSellerRatings = async (userDetails) => {
        try {
            spinner.show("Please wait...");
            const payload = {
                "sid": userDetails.user.sid,
                "startPage": 1,
                "noOfData": 10
            }
            await ApiService.getSellerRating(payload).then(
                response => {
                    setSellerRatings(response.data);
                    ratingAverage(response.data);
                },
                err => {
                    console.error("Error occurred in getSellerRatings() --", err);

                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur when getSellerRatings --- ", err);
        }
    };


    const ratingAverage = (value) => {
        try {
            let initRatings = 0;
            const len = value.length;
            for (let i = 0; i < len; i++) {
                initRatings = value[i].sellerRating + initRatings;
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
            getSellerRatings(userDetails)
        }
    }, [userDetails])


    return <div className="bg-light side-menu" id="sidebar-wrapper">
        <div className="sidebar-heading">
            <div className="media">
                <img src={userDetails.user.profileImageLocation || 'images/default-user-icon.jpeg'} className="mr-3" alt="..." />
                <div className="media-body">
                    <h5 className="mt-0">{userDetails.user.firstName}</h5>
                    <div className="rating">
                        {
                            !_.isEmpty(averageReviewRatings) && averageReviewRatings.map((list, index) => {
                                return <span key={index}>{ICN_STAR_Y()}</span>
                            })
                        }
                        <span className="rev-txt pl-0">({sellerRatings?.length ? sellerRatings?.length : 0} reviews)</span>
                    </div>
                    <p className="user-cls">Verified User</p>
                </div>
            </div>
        </div>
        <div className="list-group list-group-flush">
            <Link
                className={`list-group-item list-group-item-action ${viewId === "myaccount" && "active"}`}
                to={{
                    pathname: `/profile/myaccount`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Account"
                        }]
                    }
                }}>My Account</Link>
            <Link
                className={`list-group-item list-group-item-action ${viewId === "mywishlist" && "active"}`}
                to={{
                    pathname: `/profile/mywishlist`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Wishlist",
                            path: "/profile/mywishlist"
                        }]
                    }
                }}>My Wishlist</Link>
                <Link
                    className={`list-group-item list-group-item-action ${viewId === "mytransactions" && "active"}`}
                    to={{
                        pathname: `/profile/mytransactions`,
                        state: {
                            breadcrumb: [{
                                name: "Home",
                                path: "/"
                            },
                            {
                                name: "My Transactions",
                                path: "/profile/mytransactions"
                            }]
                        }
                    }}
                >My Transactions</Link>
            {/* <Link
                className={`list-group-item list-group-item-action ${viewId === "myorders" && "active"}`}
                to={{
                    pathname: `/profile/myorders`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Orders"
                        }]
                    }
                }}>My Orders</Link> */}
            {/* <Link
                className={`list-group-item list-group-item-action ${viewId === "MySales" && "active"}`}
                to={{
                    pathname: `/profile/MySales`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Sales"
                        }]
                    }
                }}>My Sales</Link> */}
            <Link
                className={`list-group-item list-group-item-action ${viewId === "mylisting" && "active"}`}
                to={{
                    pathname: `/profile/mylisting`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Listings"
                        }]
                    }
                }}>My Listings</Link>
            {/* <Link
                className={`list-group-item list-group-item-action ${viewId === "mybid" && "active"}`}
                to={{
                    pathname: `/profile/mybid`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "Bids"
                        }]
                    }
                }}>Bids</Link> */}
            {/* <Link
                className={`list-group-item list-group-item-action ${viewId === "mytrade" && "active"}`}
                to={{
                    pathname: `/profile/mytrade`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "Trade Offers"
                        }]
                    }
                }}>My Trade Offers</Link> */}
            {/* <Link
                className={`list-group-item list-group-item-action ${viewId === "myschedules" && "active"}`}
                to={{
                    pathname: `/profile/myschedules`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Schedules"
                        }]
                    }
                }}>My Schedules</Link> */}
        </div>
    </div>;
}

export default ProfileNav;