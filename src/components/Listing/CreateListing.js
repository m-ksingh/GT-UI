import React, { useState, useEffect, useContext, useRef, memo } from 'react'
import Layout from "../Layout"
import Breadcrumb from "../Shared/breadcrumb"
import _ from 'lodash';
import $ from 'jquery';
import Spinner from "rct-tpt-spnr";
import useToast from "../../commons/ToastHook";
import ApiService from "../../services/api.service";
import { AppContext } from '../../contexts/AppContext';
import ListingLocation from "./ListingLocation"
import ListingImg from "./ListingImg"
import ListingTerm from "./ListingTerm"
import ListingPost from "./ListingPost"
import ListingInfo from "./ListingInfo"
import ListingContextProvider from "./Context/ListingContext";
import GLOBAL_CONSTANTS from "../../Constants/GlobalConstants";
import { useAuthState } from '../../contexts/AuthContext/context';
import { useConfirmationModal } from "../../commons/ConfirmationModal/ConfirmationModalHook";
import { useHistory, Prompt } from 'react-router-dom';
import { Modal, Button } from "react-bootstrap";
import './listing.css'

let platformVariablesObj = {
    "returnPeriod": "",
    "restockingFees": {
        "percentage": "",
        "amount": ""
    }
}

const Listing = (props) => {
    const history = useHistory();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const listInfoByViewRef = useRef({
        address: {},
        anyOtherLocation: {},
        location: {},
        info: GLOBAL_CONSTANTS.DATA.CREATE_LISTING_DEFAULT,
        images: [],
        condition: {},
        listingItem: [],
        sid: null,
        isFromTrade: false,
        isEditFromTrade: false,
        product: {},
        listingStatus: GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE,
        incompleteListingSid: null,
        autoSave: true
    });
    const userDetails = useAuthState();
    const { setValueBy, location, platformVariables, setPlatformVariables } = useContext(AppContext);
    const [listInfoByView, setListInfoByView] = useState({
        address: {},
        anyOtherLocation: {},
        location: {
            lat: userDetails?.user?.appUserHasAddressTO?.latitude,
            lng: userDetails?.user?.appUserHasAddressTO?.longitude,
        },
        info: GLOBAL_CONSTANTS.DATA.CREATE_LISTING_DEFAULT,
        images: [],
        condition: {},
        listingItem: [],
        sid: null,
        isFromTrade: false,
        isEditFromTrade: false,
        product: {},
        listingStatus: GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE,
        incompleteListingSid: null,
        autoSave: true
    });
    const [isBlocking, setIsBlocking] = useState(true);
    const [tempListingInfo, setTempListingInfo] = useState({});
    const [tab, setTab] = useState(userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore ? "info" : "info");
    const [currentPageId, setCurrentPageID] = useState("");
    const [show, setShow] = useState(null);

    // this method trigger when user click on wizard icons to jump one step to another step directly
    const onClickStep = (id) => {
        setCurrentPageID(id)
        if ((id != "info" && tab === "info") && $(`#info`).hasClass("active")) {
            showConfirmModal(id);
        } else {
            $(`#${id}`).hasClass("active") && setTab(id);
        }
    }

    // show confirmation modal when user click on navigation
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Alert",
        body: "You have unsaved changes! Please save your changes by clicking next button! otherwise you will lose your data.",
        onConfirm: (id) => {
            $(`#${id}`).hasClass("active") && setTab(id);
            setListInfoByView(listInfoByViewRef.current); // prevent to data loss save data on switching wizard
        },
        onCancel: () => { }
    })

    // this method to get platform data
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

    // this method to save incompleteListing
    const saveIncompleteListing = (values) => {
        try {
            let payload = {
                "appUserSid": userDetails.user.sid,
                "listingDetails": JSON.stringify(values),
                "postedOn": null,
                "sid": listInfoByViewRef.current?.incompleteListingSid
            }
            ApiService.createIncompleListing(payload).then(
                response => {
                    spinner.hide();
                    if (!listInfoByViewRef.current.autoSave) handleNavigate();
                    Toast.success({ message: `Incomplete listing saved temporarily!`, time: 3000 });
                },
                err => {
                    spinner.hide();
                    console.error("Error occur when saveIncompleteListing", err);
                }
            )
        } catch (err) {
            spinner.hide();
            console.error("Error occur when saveIncompleteListing", err);
        }
    }

    const handleSaveIncompleteData = (value, type = "DISCARD") => {
        try {
            setShow(false);
            spinner.show("Please wait...");
            setTimeout(() => {
                if (type === "DISCARD") {
                    spinner.hide();
                    handleNavigate();
                } else {
                    saveIncompleteListing(value);
                }
            }, 900)
        } catch (error) {
            console.error("Error in handleSaveIncompleteData", error);
        }
    }

    // this method triggers when user clicks on cancel button during listing creation
    const onCancelStep = (tempInfoValue) => {
        listInfoByViewRef.current = tempInfoValue?.current
            ? { ...listInfoByViewRef.current, "autoSave": false, "info": tempInfoValue.current }
            : { ...listInfoByViewRef.current, "autoSave": false }
        setIsBlocking(false);
        setShow(true);
    }

    // on cancel modal close
    const handleCloseCancelModal = () => {
        listInfoByViewRef.current = { ...listInfoByViewRef.current, "autoSave": true }
        setIsBlocking(true);
        setShow(false);
    }


    // this method triggers when user click on cancel button
    const handleNavigate = () => {
        try {
            if (_.isArray(history.location.state.breadcrumb)) {
                let tmpBreadcrumb = [...history.location.state.breadcrumb];
                if (listInfoByView.isFromTrade && tmpBreadcrumb.length > 1) {
                    tmpBreadcrumb.pop();
                }
                history.push({
                    pathname: history.location.state.breadcrumb.length === 3 ? '/profile/mylisting' : (listInfoByView.isFromTrade ? `/order/trade/${history.location?.state?.product?.sid}` : "/"),
                    state: {
                        breadcrumb: history.location.state.breadcrumb.length === 3 ? [{
                            name: "Home",
                            path: `/`
                        },
                        {
                            name: "My Listings",
                        }] : tmpBreadcrumb
                    }
                });
            }
        } catch (err) {
            console.error("Error in handleNavigate---", err);
        }
    }

    // listening for location changes to update listing data
    useEffect(() => {
        let tempListInfo = { ...listInfoByView };
        if (props?.location?.state?.currentListing) {
            if (props?.location?.state?.currentListing?.listingDetailsStatus !== GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE) {
                tempListInfo.listingStatus = GLOBAL_CONSTANTS.LISTING_STATUS.COMPLETED;
                tempListInfo.incompleteListingSid = null;
                setIsBlocking(false); // while editing complete listing don't ask for prompt message while navigating away from create listing
                let listInfo = props?.location?.state?.currentListing;
                tempListInfo.location = { "lat": listInfo?.latitude, "lng": listInfo?.longitude };
                tempListInfo.info = listInfo;
                tempListInfo.info.price = listInfo.estimatedPrice;
                tempListInfo.info.platformVariables = listInfo?.platformVariables ? JSON.parse(listInfo.platformVariables) : platformVariablesObj;
                tempListInfo.info.anyOtherLocation = listInfo?.anyOtherLocation ? JSON.parse(listInfo.anyOtherLocation) : "";
                tempListInfo.info.fflStoreLocation = listInfo?.fflStoreLocation && typeof listInfo?.fflStoreLocation === "string" ? JSON.parse(listInfo.fflStoreLocation) : (listInfo?.fflStoreLocation || "");
                tempListInfo.info.sheriffOfficeLocation = listInfo?.sheriffOfficeLocation ? JSON.parse(listInfo.sheriffOfficeLocation) : "";
                tempListInfo.info.serialNumber = listInfo?.serialNumber ? JSON.parse(listInfo.serialNumber).serialNumber : "";
                tempListInfo.info.estimatedPrice = listInfo.estimatedPrice;
                tempListInfo.info.isFireArm = listInfo.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM;
                tempListInfo.info.isSingle = !listInfo.bundled;
                tempListInfo.anyOtherLocation = listInfo.anyOtherLocation;
                tempListInfo.info.shippingFeesLocationBased = listInfo.shippingFree ? null : listInfo.shippingFeesLocationBased;
                tempListInfo.info.fixedSippingFees = listInfo.shippingFree ? "" : listInfo.fixedSippingFees;
                // for specifictrade
                if (_.isString(listInfo?.trade_with_listing_type)) {
                    tempListInfo.info.specificTrade = JSON.parse(listInfo.trade_with_listing_type);
                    tempListInfo.info.tradeWith = "specific"
                } else {
                    tempListInfo.info.tradeWith = "open"
                }
                tempListInfo.images = Array.isArray(JSON.parse(listInfo?.listing_details_content)) && JSON.parse(listInfo?.listing_details_content).length > 0 && JSON.parse(listInfo?.listing_details_content).map(r => r.fileName);
                tempListInfo.condition.terms = true;
                tempListInfo.sid = listInfo.sid;
                tempListInfo.listingItem = tempListInfo.info?.secondaryListings ? JSON.parse(tempListInfo.info.secondaryListings) : [];
                tempListInfo.incompleteListingSid = null; // setting null value if normal listing is editing
                tempListInfo.listingStatus = GLOBAL_CONSTANTS.LISTING_STATUS.ACTIVE;
                listInfoByViewRef.current = tempListInfo;
            } else if (props?.location?.state?.currentListing?.listingDetailsStatus === GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE) {
                tempListInfo = props?.location?.state?.currentListing?.listingDetails; // setting incomplete listInfoByView value to edit
                tempListInfo.listingStatus = GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE;
                tempListInfo.incompleteListingSid = props?.location?.state?.currentListing?.sid || null;
                tempListInfo.sid = null;
            }
            setListInfoByView(tempListInfo);
        }
        if (props?.location?.state?.isFromTrade && props?.location?.state?.product) {
            if (props?.location?.state?.product && props?.location?.state?.product.trade_with_listing_type) {
                tempListInfo.product = props?.location?.state?.product
                if (_.isString(props?.location?.state?.product.trade_with_listing_type)) {
                    tempListInfo.product.trade_with_listing_type = JSON.parse(props?.location?.state?.product.trade_with_listing_type);
                }
                tempListInfo.info = {
                    ...tempListInfo.info,
                    ...tempListInfo.product.trade_with_listing_type
                };
            }
            tempListInfo.isFromTrade = props?.location?.state.isFromTrade;
            tempListInfo.isEditFromTrade = props?.location?.state.isEditFromTrade;
            setListInfoByView(tempListInfo);
        }
    }, [props.location.state])

    // listening for listInfoByView update to set current value to listInfoByViewRef
    useEffect(() => {
        listInfoByViewRef.current = listInfoByView;
    }, [listInfoByView]);

    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
    }, [])

    // component init
    useEffect(() => {
        getPlatformVariables();
        // cleanup funtion trigger when create listing component destroy or unmount
        // creating incomple listing when component is destroyed
        return () => {
            spinner.show("Please wait...");
            setTimeout(() => {
                if (listInfoByViewRef.current && listInfoByViewRef.current.listingStatus === GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE && listInfoByViewRef.current.autoSave) {
                    saveIncompleteListing(listInfoByViewRef.current);
                } else {
                    spinner.hide();
                }
            }, 2000);
        };
    }, [])

    return (<>
        <ListingContextProvider>
            <Layout title="Listing" description="Listing page">
                <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
                <section id="create-listing-section">
                    <div className="container-fluid">
                        <div className="row justify-content-center mt-0">
                            <div className="col-12 col-sm-9 col-md-7 col-lg-6 text-center p-0 mt-3 mb-2">
                                <div className="card nobg">
                                    <ul id="progressbar" className='d-flex justify-content-center'>
                                        {/* {userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && <li onClick={() => { onClickStep('location') }} className="active pointer" id="location"><strong>Location</strong></li>} */}
                                        <li onClick={() => onClickStep('info')} className={userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore ? "active pointer" : "active pointer"} id="info"><strong>Info</strong></li>
                                        <li onClick={() => onClickStep('image')} className=" " id="image"><strong>Image</strong></li>
                                        <li onClick={() => onClickStep('terms')} className=" " id="terms"><strong>Terms</strong></li>
                                        <li onClick={() => onClickStep('post')} className=" " id="post"><strong>Post</strong></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="justify-content-center mt-0">
                            <div className="col-12 text-center p-0 mt-3 mb-2">
                                <div className="col-md-12 mx-0">
                                    <div id="msform">
                                        {/* {tab === "location" && userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && <ListingLocation {...{ setTab, listInfoByView, setListInfoByView, initialLocation: location, onCancelStep }} />} */}
                                        {tab === "info" && <ListingInfo {...{ setTab, listInfoByView, setListInfoByView, tempListingInfo, setTempListingInfo, listInfoByViewRef, onCancelStep }} />}
                                        {tab === "image" && <ListingImg {...{ setTab, listInfoByView, setListInfoByView, listInfoByViewRef, onCancelStep }} />}
                                        {tab === "terms" && <ListingTerm {...{ setTab, listInfoByView, setListInfoByView, onCancelStep }} />}
                                        {tab === "post" && <ListingPost {...{ setTab, listInfoByView, setListInfoByView, setIsBlocking, onCancelStep }} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </ListingContextProvider>
        <Modal show={show} onHide={handleCloseCancelModal}>
            <Modal.Header closeButton>
                <Modal.Title>Alert</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {`${!listInfoByView.sid
                        ? "You have unsaved changes! Do you want to save your data temporarily and later you can edit your incomplete listing from my listing section? Click on confirm otherwise discard your changes."
                        : "Do you want to cancel ?"
                    }
                `}
            </Modal.Body>
            <Modal.Footer className="flx-none">
                <div className="jcb">
                    <div>
                        {
                            !listInfoByView.sid
                            && <Button variant="secondary" onClick={() => { handleSaveIncompleteData(listInfoByViewRef.current, "DISCARD"); }}>
                                Discard
                            </Button>
                        }
                    </div>
                    <div>
                        <Button variant="primary" onClick={() => { handleSaveIncompleteData(listInfoByViewRef.current, !listInfoByView.sid ? "CONFIRM" : "DISCARD"); }}>
                            Confirm
                        </Button>
                        <Button variant="secondary" onClick={handleCloseCancelModal} className="ml10">
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
        {
            isBlocking && userDetails?.user?.sid
            && <Prompt
                when={isBlocking}
                message={location =>
                    `You have unsaved changes! Your listing will be saved temporarily, later you can edit from my listings.`
                }
            />
        }
        {ConfirmationComponent}
    </>)
}
export default memo(Listing);
