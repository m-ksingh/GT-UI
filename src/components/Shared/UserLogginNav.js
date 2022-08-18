import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthState, useAuthDispatch } from "../../contexts/AuthContext/context";

const UserLogginNav = ({ notifCount, setShow, updateNotificationAlert, getAllNotificationsList, userLogout}) => {
    const userDetails = useAuthState();
    return <div class="top-menu">
    {/* <div class="top-box1">
        <nav>
            <div class="navbar-right">
                <a id="cart" onClick={initCarts}> Cart({itemCount})</a>
            </div>
        </nav>
        <div class="container-off">
            <div class="shopping-cart">
                <CartProducts />
            </div>
        </div>
    </div> */}
    <div
        class="top-box2 pointer"
        onClick={() => {
            setShow(true);
            updateNotificationAlert();
            getAllNotificationsList();
        }}
    >
        <a>Notification</a>
        <div className={`bag-2 ${notifCount > 0 ? "d-flex" : "d-none"}`}>
            {notifCount}
        </div>
    </div>
    <div class="dropdown top-box3">
        <button
            class="dropbtn dropdown-toggle pt2"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
        >
            {userDetails.user.firstName}
        </button>
        <div class="dropdown-menu dropdown-content">
            <ul>
                {userDetails.user && (userDetails.user.appUserType === "INDIVIDUAL" && !userDetails.user.adminToFFlStore) && (
                        <li class="became-dealer-btn text-center">
                            <Link to="/store/welcome">BECOME A DEALER</Link>
                        </li>
                    )}
                {(userDetails.user && userDetails.user.appUserType === "DEALER" || userDetails.user.adminToFFlStore) && (
                        <>
                            <li>
                                <a href='/#' class="nav-link cp-none">Dealership</a>
                            </li>
                            <li>
                                <Link to="/store/dashboard">Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/store/mystores">My Stores</Link>
                            </li>
                            <li>
                                <Link to="/store/reports">Reports</Link>
                            </li>
                        </>
                    )}
                <li>
                    <a href='/#' class="nav-link cp-none">Account</a>
                </li>
                <li>
                    <Link
                        to={{
                            pathname: `/profile/myaccount`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Account",
                                    },
                                ],
                            },
                        }}
                    >
                        My Account
                    </Link>
                </li>
                <li>
                    <Link
                        to={{
                            pathname: `/profile/mywishlist`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Wishlist",
                                        path: "/profile/mywishlist",
                                    },
                                ],
                            },
                        }}
                    >
                        My Wishlist
                    </Link>
                </li>
                <li>
                    <Link
                        to={{
                            pathname: `/profile/mytransactions`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Transactions",
                                        path: "/profile/mytransactions",
                                    },
                                ],
                            },
                        }}
                    >
                        My Transactions
                    </Link>
                </li>
                {/* <li>
                    <Link
                        to={{
                            pathname: `/profile/myorders`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Orders",
                                    },
                                ],
                            },
                        }}
                    >
                        My Orders
                    </Link>
                </li>
                <li>
                    <Link
                        to={{
                            pathname: `/profile/MySales`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Sales",
                                    },
                                ],
                            },
                        }}
                    >
                        My Sales
                    </Link>
                </li> */}
                <li>
                    <Link
                        to={{
                            pathname: `/profile/mylisting`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Listings",
                                    },
                                ],
                            },
                        }}
                    >
                        My Listings
                    </Link>
                </li>
                {/* <li>
                    <Link
                        to={{
                            pathname: `/profile/mybid`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "Bids",
                                    },
                                ],
                            },
                        }}
                    >
                        Bids
                    </Link>
                </li>
                <li>
                    <Link
                        to={{
                            pathname: `/profile/mytrade`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Trade Offers",
                                    },
                                ],
                            },
                        }}
                    >
                        My Trade Offers
                    </Link>
                </li>
                <li>
                    <Link
                        to={{
                            pathname: `/profile/myschedules`,
                            state: {
                                breadcrumb: [
                                    {
                                        name: "Home",
                                        path: "/",
                                    },
                                    {
                                        name: "My Schedules",
                                    },
                                ],
                            },
                        }}
                    >
                        My Schedules
                    </Link>
                </li> */}
                {/*<li className="disabled"><a>About</a></li>*/}
                <li className="pointer">
                    {/* {userDetails.user.authentication === 'EMAIL' && <a><GLogout /></a>}
                {userDetails.user.authentication !== 'EMAIL' && <a onClick={()=>userLogout()}>Logout</a>} */}

                    {/* Removed google logout for time being, Why because IP and domain name has to be white listed in google oauth configuration` */}
                    <a onClick={() => userLogout()}>Logout</a>
                </li>
            </ul>
        </div>
    </div>
</div>;
}
 
export default UserLogginNav;