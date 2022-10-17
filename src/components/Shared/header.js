import React, { useContext, useState, useEffect, useRef } from "react";
import Spinner from "rct-tpt-spnr";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { services } from "@tomtom-international/web-sdk-services";
import { AppContext } from "../../contexts/AppContext";
import { CartContext } from "../../contexts/CartContext";
import { useAuthState, useAuthDispatch } from "../../contexts/AuthContext/context";
import { Logo, ICN_CHEVRON_RIGHT_G, ICN_SEARCH } from "../icons";
import { Link, useHistory } from "react-router-dom";
import $ from "jquery";
import Login from "../Login/Login";
import CartModel from "../Cart/CartModel";
import ApiService from "../../services/api.service";
import { goToTopOfWindow, MAP_API_KEY, DEFAULT_LATLNG } from "../../commons/utils";
import _ from "lodash";
import Notification from "../Profile/Notification/Notification";
import Location from "./../Shared/Location";
import useToast from "../../commons/ToastHook";
import useOnClickOutside from "../../contexts/useOnClickOutside";
import { NOTIFICATION_CONSTANTS } from "../Profile/Notification/Constants/NotificationConstants";
import GLOBAL_CONSTANTS from "../../Constants/GlobalConstants";
import LogginButton from "./LogginButton";
import UserLogginNav from "./UserLogginNav";
import "./header.css";

const NOTIFICATION_TIMER = 1000 * 60;
const Header = () => {
	const dispatch = useAuthDispatch();
	const Toast = useToast();
	const spinner = useContext(Spinner);
	const { itemCount, clearCart, initCart, addCartSid } = useContext(CartContext);
	const { setValueBy, searchKeyword, location, isLogin, updateNotificationAt } = useContext(AppContext);
	const [loginModel, setLoginModel] = useState(false);
	const [locationModel, setLocationModel] = useState(false);
	const [cartModel, setCartModel] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [categories, setCategories] = useState(GLOBAL_CONSTANTS.DATA.CATEGORY || []);
	const [show, setShow] = useState(false);
	const [notificationList, setNotificationList] = useState([]);
	const [notifCount, setNotifCount] = useState(0);
	const history = useHistory();
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMoreItem, setHasMoreItem] = useState(true);
	const [searchLoading, setSearchLoading] = useState(false);
	const userDetails = useAuthState();
	const [recentSearch, setRecentSearch] = useState([]);
	const [showResentSearch, setShowResentSearch] = useState(false);
	const wrapperRef = useRef(null);
	const [localSearch, setLocalSearch] = useState("");
	const NO_LOGGEDIN_USER = <LogginButton {...{setLoginModel}}/>;
	const [userLoggedInNav, setUserLoggedInNav] = useState(NO_LOGGEDIN_USER);
	let notifActionFlag = useRef(false);
	let user = localStorage.getItem('currentUser')

	const initCarts = () => {
		$(".shopping-cart").fadeToggle("fast");
	};

	// check to see if the user clicked outside of this component
	useOnClickOutside(wrapperRef, () => {
		try {
			setShowResentSearch(false);
		} catch (err) {
			console.error("error occur on useOnClickOutside()");
		}
	});

	// user logout method
	const userLogout = () => {
		try {
			spinner.show("Please wait... Logging out...");
			ApiService.logout(userDetails.user.sid).then(
				(response) => {
					clearCart();
					dispatch({ type: "LOGOUT" });
					history.push("/");
					goToTopOfWindow();
					spinner.hide();
					Toast.success({
						message: "You have been successfully logged out",
						time: 2000,
					});
				},
				(err) => {
					spinner.hide();
					Toast.error({
						message: err.response?.data
							? err.response?.data.error || err.response?.data.status
							: "API Failed",
						time: 2000,
					});
				}
			);
		} catch (err) {
			spinner.hide();
			console.error("Error occur in initLogout --" + err);
		}
	};

	// get all notification list
	const getAllNotificationsList = (fetchNext = false) => {
		try {
			if (_.isEmpty(notificationList)) setLoading(true);
			let payload = {
				noOfData: NOTIFICATION_CONSTANTS.TOTAL_LIMIT,
				recipientSid: userDetails.user.sid,
				startPage: fetchNext ? currentPage + 1 : 1,
				status: NOTIFICATION_CONSTANTS.NOTIFICATION_STATUS.ALL,
			};
			setTimeout(() => {
				ApiService.getAllNotificationsList(payload).then(
					(response) => {
						if (response.data && !_.isEmpty(response.data)) {
							setCurrentPage(fetchNext ? currentPage + 1 : 1);
							let tmpData = _.chain(response.data)
								.orderBy("createdOn", "desc")
								.map((d) => ({
									...d,
									notificationJson: JSON.parse(d.notificationJson),
								}))
								.value();
							// console.log(tmpData);
							setNotificationList(
								fetchNext ? [...notificationList, ...tmpData] : tmpData
							);
							let count = response.data.filter(
								(res) => res.notificationStatus === "NEW"
							);
							setNotifCount(count.length);
						}
						setHasMoreItem(
							response.data && !_.isEmpty(response.data) ? true : false
						);
						setLoading(false);
					},
					(err) => {
						setLoading(false);
						setHasMoreItem(false);
						console.error("error occur on getAllNotificationsList()", err);
					}
				);
			}, 1500);
		} catch (err) {
			setLoading(false);
			console.error("error occur on getAllNotificationsList()", err);
		}
	};

	const initCategoriesHeader = () => {
		spinner.show("Please wait...");
		ApiService.getCategories()
			.then(
				(response) => {
					setCategories(response.data.splice(0, 7));
				},
				(err) => {
					Toast.error({
						message:
							err.response && err.response.data
								? err.response.data.error || err.response.data.status
								: "Please try after sometime.",
						time: 2000,
					});
				}
			)
			.finally(() => {
				spinner.hide();
			});
	};

	// show the notification alert
	const updateNotificationAlert = () => {
		ApiService.changeNotifAlert(userDetails.user.sid)
			.then(
				(response) => {
					setNotifCount(0);
				},
				(err) => {
					Toast.error({
						message:
							err.response && err.response.data
								? err.response.data.error || err.response.data.status
								: "Please try after sometime.",
						time: 2000,
					});
				}
			)
			.finally(() => {
				spinner.hide();
			});
	};

	const updateCartSummart = (data) => {
		setValueBy("CART_SUMMARY", data);
		addCartSid(data.sid);
		const listOfCarts = data.cartHasListingDetailsTOList.map((c) => {
			c.listingDetails.quantity = c.quantity;
			c.listingDetails.cartItemAction = c.cartItemAction;
			return c.listingDetails;
		});
		localStorage.setItem("cart", JSON.stringify(listOfCarts));
		initCart();
	};

	const initCartsByUser = () => {
		if (!userDetails.user || !userDetails.user.sid) {
			return;
		}
		spinner.show("Please wait...");
		ApiService.getMyCarts(userDetails.user.sid)
			.then(
				(response) => {
					updateCartSummart(response.data);
				},
				(err) => {
					console.log("No carts Found!");
				}
			)
			.finally(() => {
				spinner.hide();
			});
	};

	const updateUserLocation = (location) => {
		setValueBy("SET_LOCATION", location);
	};

	const getMyLocation = (latlng) => {
		function callbackFn(resp) {
			setValueBy("SET_LOCATION", resp.addresses[0]);
		}
		services
			.reverseGeocode({
				key: MAP_API_KEY,
				position: latlng,
			})
			.then(callbackFn);
	};

	const geoFindMe = () => {
		if (!navigator.geolocation) {
			console.log("Geolocation is not supported by your browser");
			return;
		}
		function success(position) {
			getMyLocation({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			});
		}
		function error() {
			getMyLocation(DEFAULT_LATLNG);
			console.log("Unable to retrieve your location");
		}
		navigator.geolocation.getCurrentPosition(success, error, { timeout: 5000 });
	};

	function handlePermission() {
		function report(result) {
			if (result.state === "granted") {
				geoFindMe(result.state);
			} else if (result.state === "prompt") {
				geoFindMe();
			} else if (result.state === "denied") {
				getMyLocation(DEFAULT_LATLNG);
			}
		}
		if (navigator.permissions && navigator.permissions.query) {
			navigator.permissions
				.query({ name: "geolocation" })
				.then(function (result) {
					report(result);
					result.onchange = function () {
						report(result);
					};
				});
		} else {
			geoFindMe();
		}
	}

	const onKeywoardSearch = (e) => {
		if (e.key === "Enter") {
			setValueBy("SET_KEYWOARD", e.target.value);
			history.push("/search");
			goToTopOfWindow();
			setShowResentSearch(false);
		}
	};

	const onRecentSearch = (value) => {
		setShowResentSearch(false);
		setValueBy("SET_KEYWOARD", value);
		history.push("/search");
	};

	const mobileSidebarNav = (e) => {
		e.preventDefault();
		e.stopPropagation();
		var offcanvas_id = $('[data-trigger="#navbar_main"]').attr("data-trigger");
		$(offcanvas_id).toggleClass("show");
		$("body").toggleClass("offcanvas-active");
		$(".screen-overlay").toggleClass("show");
	};

	const mobileSidebarNavClose = () => {
		$(".screen-overlay").removeClass("show");
		$(".mobile-offcanvas").removeClass("show");
		$("body").removeClass("offcanvas-active");
	};

	const getRecentSearch = () => {
		try {
			setSearchLoading(true);
			let payload = {
				exclAppuserId: userDetails.user.sid,
				latitude: location.position?.lat,
				longitude: location.position?.lng || location.position?.lon,
				distance: GLOBAL_CONSTANTS.DEFAULT_DISTANCE,
				distanceUnit: "ml",
				pageIndex: 0,
				resultCount: 3,
				sort: "REL",
				title: "",
			};
			ApiService.listSearch(userDetails.user.sid, payload)
				.then(
					(response) => {
						setRecentSearch(response.data);
						setSearchLoading(false);
					},
					(err) => {
						setSearchLoading(false);
						Toast.error({ message: err.response?.data?.message, time: 2000 });
					}
				)
				.finally(() => {
					setSearchLoading(false);
				});
		} catch (err) {
			console.error("error occur on onRecentSearch()", err);
		}
	};

	useEffect(() => {
		let role = userDetails?.user && userDetails.user?.appUserType;
		switch (role) {
			case GLOBAL_CONSTANTS.USER_ROLE.SUPERADMIN:
				history.replace("/platform-dashboard/request");
				break;
			case GLOBAL_CONSTANTS.USER_ROLE.INDIVIDUAL:
			case GLOBAL_CONSTANTS.USER_ROLE.DEALER:
				setUserLoggedInNav(<UserLogginNav {...{
					notifCount, 
					setShow, 
					updateNotificationAlert, 
					getAllNotificationsList, 
					userLogout
				}}/>);
				break;
			default:
				setUserLoggedInNav(NO_LOGGEDIN_USER);
				break;
		}
	}, [userDetails, notifCount ]);

	// update notification list whenever user take action in mytransactions
	useEffect(() => {
		if(!_.isEmpty(updateNotificationAt)) {
			getAllNotificationsList();
		}
	}, [updateNotificationAt])

	// init component
	useEffect(() => {
		getAllNotificationsList(); // get notification as soon as component is loading
		// call every minute to get updated notification list
		const notificationInterval = setInterval(() => {
			if (
				userDetails &&
				userDetails.user &&
				userDetails.user.sid &&
				!notifActionFlag.current
			)
				getAllNotificationsList();
		}, NOTIFICATION_TIMER);
		return () => clearInterval(notificationInterval);
	}, []);

	useEffect(() => {
		if (_.isEmpty(location.address)) {
			handlePermission();
		}
		// initCartsByUser();
	}, [userDetails]);

	useEffect(() => {
		initCategoriesHeader();
		// initCartsByUser();
	}, []);

	useEffect(() => {
		if (_.isEmpty(searchKeyword)) {
			$("#search input").val("");
		}
	}, [searchKeyword]);

	useEffect(() => {
		if (isLogin) {
			setLoginModel(true);
		}
	}, [isLogin]);

	useEffect(() => {
		if (!loginModel) {
			setValueBy("SET_LOGIN", false);
		}
	}, [loginModel]);

	const initBuySell = (path) => {
        if (userDetails && userDetails.user && userDetails.user.sid) {
            history.push({
                pathname: path,
                state: {
                    breadcrumb: [
                        { name: "Home",path: `/` },
                        {  name: (path === "/getservice" && "Get Service") || (path === "/buyfilter" && "Buy") || (path === "/create-listing" && "Create Listing")}
                    ]
                }
            });
        } else {
            setValueBy('SET_LOGIN', true);
        }
    }

	return (
		<>
			<div id="" class="top-section head-margin-top">
					<div class="container">
						<div class="row aic">
							<div class="col-lg-3 mobile-off">
								<ul class="nav">
									<li class="nav-item">
										<a class="nav-link nav-text-color" href="#">Contact Us</a>
									</li>
								</ul>
							</div>
							<div class="col-lg-9 col-sm-12">
								<ul class="nav justify-content-end">
									<li class="nav-item" onClick={() => initBuySell('/buyfilter')}>
										<a class="nav-link cp nav-text-color">Buy</a>
									</li>
									<li class="nav-item" onClick={() => initBuySell('/create-listing')}>
										<a class="nav-link cp nav-text-color">Sell</a>
									</li>
									<li class="nav-item" onClick={() => initBuySell('/getservice')}>
										<a class="nav-link cp nav-text-color">Get Service</a>
									</li>

									{userDetails.user && (userDetails.user.appUserType === "INDIVIDUAL" && !userDetails.user.adminToFFlStore) && <li class="nav-item">
										<Link
											class="nav-link nav-text-color"
											to={{
												pathname: `/store/welcome`,
												state: {
													breadcrumb: [
														{
															name: "Home",
															path: "/",
														},
														{
															name: "Become a Dealer",
														},
													],
												},
											}}
										>
											Become a Dealer
										</Link>
									</li>}
									{(userDetails.user && userDetails.user.appUserType === "DEALER" || userDetails.user.adminToFFlStore) && <li class="nav-item">
										<Link
											class="nav-link nav-text-color"
											to={{
												pathname: "store/mystores",
												state: {
													breadcrumb: [
														{
															name: "Home",
															path: "/"
														},
														{
															name: "My Stores",
															path: "/store/mystores"
														},
														{
															name: "My Stores"
														}
													]
												}
											}}
										>
											My Stores
										</Link>
									</li>}
								</ul>
							</div>
						</div>
					</div>
				</div>
			<header id="main-header" class="section-header sticky">
				{/* <div id="top-head" class="top-section head-margin-top">
					<div class="container">
						<div class="row aic">
							<div class="col-lg-3 mobile-off">
								<ul class="nav">
									<li class="nav-item">
										<a class="nav-link nav-text-color" href="#">Contact Us</a>
									</li>
								</ul>
							</div>
							<div class="col-lg-9 col-sm-12">
								<ul class="nav justify-content-end">
									<li class="nav-item desktop-off">
										<a class="nav-link nav-text-color" href="#">Contact Us</a>
									</li>
									<li class="nav-item" onClick={() => initBuySell('/buyfilter')}>
										<a class="nav-link cp nav-text-color">Buy</a>
									</li>
									<li class="nav-item" onClick={() => initBuySell('/create-listing')}>
										<a class="nav-link cp nav-text-color">Sell</a>
									</li>
									<li class="nav-item" onClick={() => initBuySell('/getservice')}>
										<a class="nav-link cp nav-text-color">Get Service</a>
									</li>

									{userDetails.user && (userDetails.user.appUserType === "INDIVIDUAL" && !userDetails.user.adminToFFlStore) && <li class="nav-item">
										<Link
											class="nav-link nav-text-color"
											to={{
												pathname: `/store/welcome`,
												state: {
													breadcrumb: [
														{
															name: "Home",
															path: "/",
														},
														{
															name: "Become a Dealer",
														},
													],
												},
											}}
										>
											Become a Dealer
										</Link>
									</li>}
									{(userDetails.user && userDetails.user.appUserType === "DEALER" || userDetails.user.adminToFFlStore) && <li class="nav-item">
										<Link
											class="nav-link nav-text-color"
											to={{
												pathname: "/store/onboard/new",
												state: {
													breadcrumb: [
														{
															name: "Home",
															path: "/"
														},
														{
															name: "My Store",
															path: "/store/mystores"
														},
														{
															name: "New Store"
														}
													]
												}
											}}
										>
											New Store
										</Link>
									</li>}
								</ul>
							</div>
						</div>
					</div>
				</div> */}
				<div id="top-head" class="py-3">
					<div class="container">
						
						<div class="row aic">
							<div class="col-6 col-md-6 col-lg-2 mob-border">
								<div class="logo">
									<Link
										to="/"
										onClick={() => {
											setValueBy("SET_KEYWOARD", "");
											setValueBy("SET_CATEGORY", "");
											mobileSidebarNavClose();
										}}
										className="logo-container"
									>
										<img
											src="images/logo.svg"
											class="img-fluid"
											alt="Gun Traderz"
										/>
									</Link>
								</div>
							</div>
							<div class="col-6 mobile-right-menu pb10">
								<ul>
									{!showSearch ? (
										<li
											class="mrm-first"
											onClick={() => setShowSearch(true)}
										></li>
									) : (
										<li
											class="mrm-close"
											onClick={() => setShowSearch(false)}
										></li>
									)}
									{/* <li class="mrm-second" onClick={initCarts}></li> */}
									{/* <a id="cart-mobile" onClick={() => setCartModel(true)}>{userDetails.user && <span>({itemCount})</span>}</a> */}
									{userDetails.user && (
										<li
											class="mrm-third"
											onClick={() => {
												setShow(true);
												updateNotificationAlert();
												getAllNotificationsList();
											}}
										>
											<div
												className={`bag-2 ${notifCount > 0 ? "d-flex" : "d-none"
													}`}
												style={{ position: "inherit" }}
											>
												{notifCount}
											</div>
										</li>
									)}
									{!userDetails.user && (
										<li
											class="mrm-login"
											onClick={() => setLoginModel(true)}
										></li>
									)}
								</ul>
							</div>
							<div className={`col-lg-4 search-box ${showSearch && "enable"}`}>
								<div id="search">
									<InputGroup className="">
										<input
											size="40"
											type="text"
											className="form-control"
											placeholder="Search products, models, manufacturers and anything..."
											value={localSearch}
											onChange={(e) => setLocalSearch(e.target.value)}
											onClick={() => {
												userDetails.user?.sid && getRecentSearch();
												userDetails.user?.sid && setShowResentSearch(true);
											}}
											onKeyDown={onKeywoardSearch}
										/>
										<InputGroup.Append className="top-search-icon">
											<Button
												id="header-search-btn"
												variant="outlined"
												onClick={() => {
													// if (localSearch) {
													// 	setValueBy("SET_KEYWOARD", localSearch);
													// 	history.push("/search");
													// 	goToTopOfWindow();
													// 	setShowResentSearch(false);
													// }
													history.push("/search");
												}}
												className="theme-bg"
											>
												<ICN_SEARCH />
											</Button>
										</InputGroup.Append>
									</InputGroup>
								</div>
								<div>
									{showResentSearch && (
										<div className="recent-search" ref={wrapperRef}>
											<div className="py-2 text-muted">Recent Searches</div>
											{searchLoading ? (
												<div className="mt-1 text-center">
													<button
														className="btn btn-light"
														type="button"
														disabled
													>
														<span
															className="spinner-border spinner-border-sm mr-2"
															role="status"
															aria-hidden="true"
														></span>
														Loading...
													</button>
												</div>
											) : (
												recentSearch.map((resp, i) => {
													return (
														<div
															key={i}
															className="search-item"
															onClick={() => onRecentSearch(resp.searchKeyword)}
														>
															<div className="search-item-title elps">
																{resp.searchKeyword}
															</div>
															<div>
																<span className="font-weight-bold">
																	{resp.productCount}
																</span>{" "}
																<span className="mr-2 text-muted">New</span>{" "}
																{ICN_CHEVRON_RIGHT_G}
															</div>
														</div>
													);
												})
											)}
										</div>
									)}
								</div>
							</div>
							<div class="col-lg-3 location-box">
								<div className="user-location-cont">
									<div className="user-location">
										{location && location.address && user ? (
											<span
												className="pointer"
												onClick={() => setLocationModel(true)}
											>
												{" "}
												{location.address.freeformAddress ? (
													location.address.freeformAddress
												) : (
													<>
														{location.address.municipality},
														{location.address.postalCode}{" "}
													</>
												)
											}
											</span>
										): (
											<span
												className="pointer"
												onClick={() => setLocationModel(true)}
											>
												{" "}
												{location.address.countrySubdivision ? (
												
													<>
														{location.address.municipality},
														{location.address.countrySubdivision}{" "}
													</>
												):
												(
													<>
														{location.address.municipality}, 
														{location.address.postalCode}{" "}
													</>
												) 
												
											}
											</span>
										)}
									</div>
									<div>
										<span class="mob-des-location">
											<a onClick={() => setLocationModel(true)}>Change</a>
										</span>
									</div>
								</div>
							</div>
							<div class="col-lg-3">{userLoggedInNav}</div>
						</div>
					</div>
				</div>
				<div id="header-menu">
					<div class="container">
						<button
							data-trigger="#navbar_main"
							class="d-lg-none btn btn-menu"
							type="text"
							onClick={mobileSidebarNav}
						>
							<Logo />
						</button>
						<nav
							id="navbar_main"
							class="mobile-offcanvas navbar navbar-expand-lg navbar-dark"
						>
							<div class="offcanvas-header">
								<button
									class="cross-btn btn-close float-right"
									onClick={mobileSidebarNavClose}
								>
									{" "}
								</button>
								<h5 class="py-2 text-white">
									Hi, {userDetails.user.firstName || "there!"}
								</h5>
							</div>
							{userDetails.user && (userDetails.user.appUserType === "INDIVIDUAL" && !userDetails.user.adminToFFlStore) && (
								<ul class="navbar-nav menu1">
									<li class="became-dealer-btn">
										<Link to="/store/welcome">BECOME A DEALER</Link>
									</li>
								</ul>
							)}
							{(userDetails.user && userDetails.user.appUserType === "DEALER" || userDetails.user.adminToFFlStore) && (
								<ul class="navbar-nav menu1">
									<li class="mn-head">Dealership</li>
									<li class="nav-item">
										<Link
											class="nav-link"
											to="/store/dashboard"
											onClick={mobileSidebarNavClose}
										>
											Dashboard
										</Link>
									</li>
									<li class="nav-item">
										<Link
											class="nav-link"
											to="/store/mystores"
											onClick={mobileSidebarNavClose}
										>
											My Stores
										</Link>
									</li>
									<li class="nav-item">
										<Link
											class="nav-link"
											to="/store/reports"
											onClick={mobileSidebarNavClose}
										>
											Reports
										</Link>
									</li>
								</ul>
							)}
							{userDetails.user && (
								<ul class="navbar-nav menu1">
									<li class="mn-head">ACCOUNT</li>
									<li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Account
										</Link>
									</li>
									<li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Wishlist
										</Link>
									</li>
									<li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Transactions
										</Link>
									</li>
									{/* <li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Orders
										</Link>
									</li>
									<li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Sales
										</Link>
									</li> */}
									<li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Listings
										</Link>
									</li>
									{/* <li class="nav-item">
										<Link
											class="nav-link"
											to={{
												pathname: `/profile/mybid`,
												state: {
													breadcrumb: [
														{
															name: "Home",
															path: "/",
														},
														{
															name: "My Bids",
														},
													],
												},
											}}
											onClick={mobileSidebarNavClose}
										>
											Bids
										</Link>
									</li>
									<li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Trade Offers
										</Link>
									</li>
									<li class="nav-item">
										<Link
											class="nav-link"
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
											onClick={mobileSidebarNavClose}
										>
											My Schedules
										</Link>
									</li> */}
									<li class="nav-item">
										<a class="nav-link">About</a>
									</li>
									<li class="nav-item">
										{/* {userDetails.user.authentication === 'EMAIL' && <a class="nav-link"><GLogout /></a>}
                                    {userDetails.user.authentication !== 'EMAIL' && <a class="nav-link" onClick={()=>userLogout()}>Logout</a>} */}

										{/* Removed google logout for time being, Why because IP and domain name has to be white listed in google oauth configuration` */}
										<a className="nav-link" onClick={() => userLogout()}>
											Logout
										</a>
									</li>
								</ul>
							)}
							<ul class="navbar-nav menu2">
								<li class="mn-head">SHOP BY CATEGORY</li>
								{categories.map((category, i) => {
									return (
										<li key={i} class="nav-item">
											<Link
												class="nav-link"
												to={{
													pathname: "/search",
													state: {
														breadcrumb: [
															{
																name: "Home",
																path: "/",
															},
															{
																name: category.name,
																path: "/search",
																data: category,
															},
														],
													},
												}}
												onClick={() => {
													setValueBy("SET_KEYWOARD", "");
													setValueBy("SET_CATEGORY", category);
													mobileSidebarNavClose();
												}}
											>
												{category.name}
											</Link>
										</li>
									);
								})}
							</ul>
							<ul class="navbar-nav menu3">
								<li class="mn-head">HELP & SUPPORT</li>
								<li class="nav-item">
									{" "}
									<a class="nav-link">Customer Care</a>{" "}
								</li>
								<li class="nav-item">
									<a class="nav-link">FAQ’s</a>
								</li>
								<li class="nav-item">
									<a class="nav-link">Resources</a>
								</li>
								<li class="nav-item">
									<a class="nav-link">Terms & Conditions</a>
								</li>
								<li class="nav-item">
									<a class="nav-link">Security Policy</a>
								</li>
							</ul>
							<div class="mb-social-footer">
								<ul>
									<li class="social-g">
										<a></a>
									</li>
									<li class="social-t">
										<a></a>
									</li>
									<li class="social-f">
										<a></a>
									</li>
									<li class="social-i">
										<a></a>
									</li>
								</ul>
								<p>© 2021 Guntraderz. All rights reserved.</p>
							</div>
						</nav>
					</div>
				</div>
			</header>
			
			{loginModel && <Login {...{ loginModel, setLoginModel }} />}
			{cartModel && <CartModel {...{ cartModel, setCartModel }} />}
			{show && (
				<Notification
					{...{
						show,
						setShow,
						notificationList,
						setNotificationList,
						getAllNotificationsList,
						loading,
						fetchMoreData: () => getAllNotificationsList(true),
						hasMoreItem,
					}}
					updateNotifActionStatus={(bool) => {
						notifActionFlag.current = bool;
					}}
				/>
			)}
			{locationModel && (
				<Location
					{...{ locationModel, setLocationModel, updateUserLocation }}
				/>
			)}
		</>
	);
};

export default Header;
