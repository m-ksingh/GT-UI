import React, { useContext, useState, useEffect, memo } from "react";
import { Formik } from "formik";
import _ from "lodash";
import $ from "jquery";
import Spinner from "rct-tpt-spnr";
import { Form, Row } from "react-bootstrap";
import ApiService from "../../../services/api.service";
import { useAuthState } from "../../../contexts/AuthContext/context";
import { CartContext } from "../../../contexts/CartContext";
import GMap from "../../GMap/GMap";
import { AppContext } from "../../../contexts/AppContext";
import FormikCotext from "../../Shared/FormikContext";
import useToast from "../../../commons/ToastHook";
import { useParams, useHistory } from "react-router-dom";
import { goToTopOfWindow } from "../../../commons/utils";
import { IcnLocation } from "../../icons";
import GLOBAL_CONSTANTS from "../../../Constants/GlobalConstants";
import TermAndCondition from "../../Shared/TermAndCondition/TermAndCondition.";
import { useBasicModal } from "../../../commons/BasicModal/BasicModalHook";
import { useConfirmationModal } from "../../../commons/ConfirmationModal/ConfirmationModalHook";

const LocationView = ({
    setTab,
    product,
    bidCountInfo,
    valueToMatch,
    tabWiseData,
    handleUpdateBidCountInfo = () => { },
}) => {
    const userDetails = useAuthState();
    const history = useHistory();
    const { location } = useContext(AppContext);
    let prepopulateZipcode;
    if (
        !_.isEmpty(userDetails.user.appUserHasAddressTO) &&
        !_.isEmpty(userDetails.user.appUserHasAddressTO.zipcode)
    ) {
        prepopulateZipcode = userDetails.user.appUserHasAddressTO.zipcode;
    } else if (!_.isEmpty(location)) {
        prepopulateZipcode = location.address.postalCode;
    }
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [zipCode, setZipCode] = useState(
        product?.fflPremiseZipCode || product?.fflStoreLocation?.premZipCode || prepopulateZipcode
    );
    const { type, productId } = useParams();
    const [listOfFFLStore, setListOfFFLStore] = useState([]);
    const [listOfSheriffLocation, setListOfSheriffLocation] = useState([]);
    const [locationFormValues, setLocationFormValues] = useState({});
    const [sheriffOffice, setSheriffOffice] = useState(
        product?.sheriffOfficeEnabled && product?.sheriffOfficeLocation
            ? product.sheriffOfficeLocation
            : null
    );
    const [fflStoreLocation, setFflStoreLocation] = useState(
        product?.fflStoreLocation ? product.fflStoreLocation : {}
    );
    const [otherLocations, setOtherLocations] = useState(
        product?.availableOtherLocation && product?.anyOtherLocations
            ? product.anyOtherLocations
            : null
    );
    const [myLocation, setMyLocation] = useState({
        address: (!_.isEmpty(location?.address) && { ...location.address }) || "",
        location: (!_.isEmpty(location?.position) && {
            ...location.position,
            lng: location?.position?.lng || location?.position?.lon,
        }) || { lat: 0, lng: 0 },
    });
    const { cartItems, clearCart } = useContext(CartContext);
    const [paymentModal, setPaymentModal] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);

    const [initialValues, setInitialValues] = useState({
        pickup: tabWiseData?.pickupLocation?.pickup
            ? tabWiseData.pickupLocation.pickup
            : ((product.fflStoreEnabled && "FFL") || (product.sheriffOfficeEnabled && "SHERIFF_OFFICE") || (product.availableOtherLocation && "OTHER_LOCATION")),
        fflStore: "",
        sheriffLocation: "",
    });

    // show bid confirmation modal when user click on complete purchase
    const [showBidConfirmModal, BidConfirmationComponent] = useConfirmationModal({
        title: "Bid Confirmation",
        body: "Once you submit bid, it cannot be retracted",
        onConfirm: (sid) => {
            setPaymentModal(true);
        },
        onCancel: () => { }
    })

    // show listing update confirmation modal when seller update listing during place item
    const [showListingUpdate, ListingUpdateAlertComponent] = useBasicModal({
        body: "The seller has updated the details of this item! Please refresh to get the new details.",
        hideHeader: true,
        onClose: (d) => {
            handleUpdateListingDuringPlaceItem(d);
        },
        btnLabel: "Refresh"
    });

    // this method triggers when placed item and same time seller update listing
    const handleUpdateListingDuringPlaceItem = (item) => {
        try {
            if (item.sid) {
                history.push({
                    pathname: `/product/${item.sid}`,
                    state: {
                        breadcrumb: [{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: item.title,
                            path: `/product/${item.sid}`
                        }]
                    }
                });
            }

        } catch (err) {
            console.error("Error occured while handleUpdateListingDuringPlaceItem-- ", err);
        }
    }

    /**  this method is update notification status
     * @param {String} ohl = order has listing sid
     */
    const fifteenMinBidRule = (sid) => {
        try {
            if (sid) {
                spinner.show("Please wait...");
                ApiService.fifteenMinBidRule(sid).then(
                    (response) => {
                        spinner.hide();
                    },
                    (err) => {
                        spinner.hide();
                        console.error("error occur on fifteenMinBidRule()", err);
                    }
                );
            }
        } catch (err) {
            spinner.hide();
            console.error("error occur on fifteenMinBidRule()", err);
        }
    };

    /**  this method is update notification status
     * @param {String} ohl = order has listing sid
     */
    const updateNotification = (notifId) => {
        try {
            if (notifId) {
                spinner.show("Please wait...");
                ApiService.updateNotification(notifId).then(
                    (response) => {
                        spinner.hide();
                    },
                    (err) => {
                        spinner.hide();
                        console.error("error occur on updateNotification()", err);
                    }
                );
            }
        } catch (err) {
            spinner.hide();
            console.error("error occur on updateNotification()", err);
        }
    };

    const initPlaceOrder = () => {
        let fflStoreLocationObj = null;
        if (tabWiseData.pickupLocation.pickup === "FFL") {
            fflStoreLocationObj = JSON.stringify(
                tabWiseData.pickupLocation.fflStore
                    ? listOfFFLStore[tabWiseData.pickupLocation.fflStore]
                    : fflStoreLocation
            );
        }
        const payload = {
            deliverFFLStore: tabWiseData.pickupLocation.pickup === "FFL",
            deliveryLocationType: tabWiseData.pickupLocation.pickup,
            fflStoreLocation: fflStoreLocationObj,
            // itemsOrdered: cartItems.map((cart) => {
            //     return {
            //         buyType: "BUY",
            //         listingDetails: {
            //             sid: cart.sid,
            //             sellPrice: cart.sellPrice
            //         },
            //         quantity: cart.quantity,
            //     };
            // }),
            itemsOrdered: [
                {
                    buyType: "BUY",
                    listingDetails: {
                        sid: product.sid,
                        sellPrice: product.sellPrice
                    },
                    quantity: history?.location?.state?.itemQuantity
                        ? Number(history.location.state.itemQuantity)
                        : 1,
                },
            ],
            placedBy: {
                sid: userDetails.user.sid,
            },
            sheriffOfficeLocation: sheriffOffice
                ? JSON.stringify(sheriffOffice)
                : null,
            cardTO: {
                sid: tabWiseData.paymentCard.sid,
            },
            buyType: "BUY",
            platformFee: tabWiseData.platformFee,
            totalPrice: tabWiseData.totalPrice,
            totalTaxes: tabWiseData.totalTaxes,
            quantity: history?.location?.state?.itemQuantity
                ? Number(history.location.state.itemQuantity)
                : 1,
            listingDistance: product.distance || "0",
            otherLocation: product?.anyOtherLocations
                ? product.anyOtherLocations
                : null,
        };
        spinner.show("Please wait...");
        ApiService.placeOrder(payload)
            .then(
                (response) => {
                    clearCart();
                    goToNextAfterSuccess(response);
                    tabWiseData.paymentCard = {};
                },
                (err) => {
                    if (err?.response?.status === 403) {
                        showListingUpdate(product);
                    } else {
                        Toast.error({
                            message:
                                err.response && err.response.data
                                    ? err.response.data.message ||
                                    err.response.data.error ||
                                    err.response.data.status
                                    : "Internal server error! Please try after sometime.",
                            time: 4000,
                        });
                    }
                }
            )
            .finally(() => {
                setPaymentModal(false);
                spinner.hide();
            });
    };
    const initBidPlace = () => {
        let fflStoreLocationObj = null;
        if (tabWiseData.pickupLocation.pickup === "FFL") {
            fflStoreLocationObj = JSON.stringify(
                tabWiseData.pickupLocation.fflStore
                    ? listOfFFLStore[tabWiseData.pickupLocation.fflStore]
                    : fflStoreLocation
            );
        }
        const payload = {
            deliverFFLStore: tabWiseData.pickupLocation.pickup === "FFL",
            deliveryLocationType: tabWiseData.pickupLocation.pickup,
            fflStoreLocation: fflStoreLocationObj,
            itemsOrdered: [
                {
                    buyType: "BID",
                    listingDetails: {
                        sid: product.sid,
                        auctionReservePrice: product.auctionReservePrice
                    },
                    bidAmount: tabWiseData.bidInfo.bidValue,
                },
            ],
            placedBy: {
                sid: userDetails.user.sid,
            },
            sheriffOfficeLocation: sheriffOffice
                ? JSON.stringify(sheriffOffice)
                : null,
            cardTO: {
                sid: tabWiseData.paymentCard.sid,
            },
            buyType: "BID",
            platformFee: tabWiseData.platformFee,
            totalPrice: tabWiseData.totalPrice,
            totalTaxes: tabWiseData.totalTaxes,
            quantity: history?.location?.state?.itemQuantity
                ? Number(history.location.state.itemQuantity)
                : 1,
            listingDistance: product.distance || "0",
            otherLocation: product?.anyOtherLocations
                ? product.anyOtherLocations
                : null,
        };
        spinner.show("Please wait...");
        ApiService.placeOrder(payload)
            .then(
                (response) => {
                    fifteenMinBidRule(product.sid);
                    goToNextAfterSuccess(response);
                },
                (err) => {
                    if (err?.response?.status === 403) {
                        showListingUpdate(product);
                    } else {
                        if (err?.response?.status === 406 && err?.response?.data?.error === "Bid can not be placed.Bid Amount is less than highest bid.") {
                            handleUpdateBidCountInfo();
                            $("#info").addClass("active");
                            setTab("info");
                        } else {
                            cancelAction();
                        }
                        Toast.error({
                            message:
                                err.response && err.response.data
                                    ? err.response.data.message ||
                                    err.response.data.error ||
                                    err.response.data.status
                                    : "Internal server error! Please try after sometime.",
                            time: 4000,
                        });
                    }
                }
            )
            .finally(() => {
                setPaymentModal(false);
                spinner.hide();
            });
    };
    const initTradePlace = () => {
        let fflStoreLocationObj = null;
        if (tabWiseData.pickupLocation.pickup === "FFL") {
            fflStoreLocationObj = JSON.stringify(
                tabWiseData.pickupLocation.fflStore
                    ? listOfFFLStore[tabWiseData.pickupLocation.fflStore]
                    : fflStoreLocation
            );
        }
        const payload = {
            deliverFFLStore: tabWiseData.pickupLocation.pickup === "FFL",
            deliveryLocationType: tabWiseData.pickupLocation.pickup,
            fflStoreLocation: fflStoreLocationObj,
            itemsOrdered: [
                {
                    buyType: "TRADE",
                    listingDetails: {
                        sid: product.sid,
                        tradeReservePrice: product.tradeReservePrice
                    },
                    tradeListingDetailsOffered: tabWiseData?.tradeListItems.map((r) => ({
                        sid: r.sid,
                    })),
                    tradeAmount: _.toString(tabWiseData.totalTradePriceWith),
                    tradeOfferBalance: _.toString(
                        (valueToMatch.isPayBalance && valueToMatch.amount) || 0
                    ),
                },
            ],
            placedBy: {
                sid: userDetails.user.sid,
            },
            sheriffOfficeLocation: sheriffOffice
                ? JSON.stringify(sheriffOffice)
                : null,
            cardTO: {
                sid: tabWiseData.paymentCard.sid,
            },
            buyType: "TRADE",
            platformFee: tabWiseData.platformFee,
            totalPrice: tabWiseData.totalPrice,
            totalTaxes: tabWiseData.totalTaxes,
            quantity: 1,
            listingDistance: product.distance || "0",
            otherLocation: product?.anyOtherLocations
                ? product.anyOtherLocations
                : null,
        };
        spinner.show("Please wait...");
        ApiService.placeOrder(payload)
            .then(
                (response) => {
                    tabWiseData.isTradePlaced = true;
                    goToNextAfterSuccess(response);
                },
                (err) => {
                    if (err?.response?.status === 403) {
                        if (tabWiseData.tradeListItems && tabWiseData.tradeListItems.length > 0)
                            toggleListing(tabWiseData.tradeListItems, false);
                        showListingUpdate(product);
                    } else {
                        Toast.error({
                            message:
                                err.response && err.response.data
                                    ? err.response.data.message ||
                                    err.response.data.error ||
                                    err.response.data.status
                                    : "Internal server error! Please try after sometime.",
                            time: 4000,
                        });
                    }
                }
            )
            .finally(() => {
                setPaymentModal(false);
                spinner.hide();
            });
    };

    // this method trigger to toggle listing if user cancelling order
    const toggleListing = (list = [], disable = true) => {
        spinner.show("Please wait...");
        let payload = {
            listingSids: list.map((r) => r.sid),
            toggle: disable,
        };
        ApiService.isOfferedForTrade(payload)
            .then(
                (response) => { },
                (err) => { }
            )
            .finally(() => {
                spinner.hide();
            });
    };

    const initFFLStoreList = (pin) => {
        if (_.isEmpty(pin) || pin.length < 5) {
            return;
        }
        spinner.show("Please wait...");
        ApiService.fflStoreListByZipCode(pin)
            .then(
                (response) => {
                    setListOfFFLStore(response.data);
                },
                (err) => {
                    Toast.error({
                        message:
                            err.response && err.response.data
                                ? err.response.data.message ||
                                err.response.data.error ||
                                err.response.data.status
                                : "Internal server error! Please try after sometime.",
                        time: 2000,
                    });
                }
            )
            .finally(() => {
                spinner.hide();
            });
    };

    // this method trigger while user click on next button
    const goToNextAfterSuccess = (postData) => {
        if (history.location && history.location?.state?.notifId)
            updateNotification(history.location.state.notifId);
        tabWiseData.postData = {
            ...postData,
            bidValue:
                tabWiseData.bidInfo.bidValue || tabWiseData.totalPrice
                    ? Number(tabWiseData.totalPrice).toFixed(2)
                    : "-",
            fflStoreLocation: postData?.fflStoreLocation
                ? JSON.parse(postData.fflStoreLocation)
                : null,
        };
        tabWiseData.bidInfo.bidValue = "";
        tabWiseData.paymentCard = {};
        tabWiseData.pickupLocation = "";
        if (type === GLOBAL_CONSTANTS.ORDER_TYPE.TRADE) tabWiseData.isTradePlaced = true;
        $("#post").addClass("active");
        setTab("post");
    };

    // cancel order
    const cancelAction = () => {
        if (tabWiseData.tradeListItems && tabWiseData.tradeListItems.length > 0)
            toggleListing(tabWiseData.tradeListItems, false);
        tabWiseData.tradeListItems = [];
        history.replace("/");
        goToTopOfWindow();
    };

    // listening for form value change
    const handleChangeByChange = (values) => {
        setLocationFormValues(values);
        if (values.pickup) tabWiseData.pickupLocation = values;
        if (values.pickup === "FFL") {
            setInitialValues({
                ...values,
                sheriffLocation: "",
            });
            setSheriffOffice(null);
            setOtherLocations(null);
            const preSelectFFLStore = _.filter(listOfFFLStore, (lic, i) => {
                return !_.isEmpty(values.fflStore) && i === values.fflStore;
            });
            if (preSelectFFLStore && preSelectFFLStore.length) {
                setFflStoreLocation(preSelectFFLStore[0]);
            }
            if (!values.fflStore) {
                setFflStoreLocation(
                    product.fflStoreLocation ? product.fflStoreLocation : {}
                );
            }
            if (!listOfFFLStore.length) {
                initFFLStoreList(
                    product.fflPremiseZipCode
                        ? product.fflPremiseZipCode
                        : prepopulateZipcode
                );
            }
        } else if (values.pickup === "SHERIFF_OFFICE") {
            setInitialValues({
                ...values,
                fflStore: "",
            });
            setOtherLocations(null);
            setSheriffOffice(
                product?.sheriffOfficeEnabled && product?.sheriffOfficeLocation
                    ? product.sheriffOfficeLocation
                    : null
            );
        } else if (values.pickup === "OTHER_LOCATION") {
            setInitialValues({
                ...values,
                fflStore: "",
                sheriffLocation: "",
            });
            setSheriffOffice(null);
        }
    };

    // listening fir zip code
    useEffect(() => {
        initFFLStoreList(zipCode);
    }, [zipCode]);

    const onNextStep = (values) => {
        goToTopOfWindow();
        tabWiseData.pickupLocation = _.cloneDeep(values);
        if (type === GLOBAL_CONSTANTS.ORDER_TYPE.BUY) {
            initPlaceOrder();
        } else if (type === GLOBAL_CONSTANTS.ORDER_TYPE.BID) {
            initBidPlace();
        } else if (type === GLOBAL_CONSTANTS.ORDER_TYPE.TRADE) {
            initTradePlace();
        }
    };

    return (
        <div>
            <h2 class="card-title-header">Select Pickup Location</h2>
            <div className="mb20">
                {
                    product.listingType ===
                    GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL
                    && <>
                        <small class="text-danger">WARNING: </small>
                        <p>
                            {
                                "We strongly recommend that you complete your purchase at either our FFL network provider or a Sheriff's station for safety reasons."
                            }
                        </p>
                    </>
                }
            </div>
            <div>
                <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    onSubmit={(values) => {
                        setOrderInfo(values);
                        type === "bid"
                            ? showBidConfirmModal()
                            : setPaymentModal(true);
                    }}
                >
                    {({
                        handleSubmit,
                        isSubmitting,
                        setFieldValue,
                        handleChange,
                        touched,
                        errors,
                        values,
                        isValid,
                        dirty,
                    }) => (
                        <Form noValidate>
                            <FormikCotext
                                {...{
                                    callback: (val) => handleChangeByChange(val, setFieldValue),
                                }}
                            />
                            <Form.Group as={Row} className="pl15 py20">
                                <div class="col-lg-12 d-flex location-buttons magic-box">
                                    {
                                        product.fflStoreEnabled
                                        && <div class="radio-btn flx1 color-blue">
                                            <Form.Check
                                                id="l-store-location"
                                                onChange={handleChange}
                                                checked={values.pickup === "FFL"}
                                                type="radio"
                                                value="FFL"
                                                name="pickup"
                                                label="FFL Store"
                                            />
                                        </div>
                                    }
                                    {product.listingType ===
                                        GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && (
                                            <>
                                                {
                                                    product.sheriffOfficeEnabled
                                                    && <div class="radio-btn flx1 color-yellow">
                                                        <Form.Check
                                                            id="l-sherriff-office"
                                                            onChange={handleChange}
                                                            checked={values.pickup === "SHERIFF_OFFICE"}
                                                            type="radio"
                                                            value="SHERIFF_OFFICE"
                                                            name="pickup"
                                                            label="Sheriff's Office"
                                                            disabled={
                                                                ((product.listingType ===
                                                                    GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore) ||
                                                                !product.sheriffOfficeEnabled
                                                            }
                                                        />
                                                    </div>
                                                }
                                                {
                                                    product.availableOtherLocation
                                                    && <div class="radio-btn flx1 color-red">
                                                        <Form.Check
                                                            id="l-any-other-location"
                                                            onChange={handleChange}
                                                            checked={values.pickup === "OTHER_LOCATION"}
                                                            type="radio"
                                                            value="OTHER_LOCATION"
                                                            name="pickup"
                                                            label="Other"
                                                            disabled={
                                                                ((product.listingType ===
                                                                    GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore) ||
                                                                !product.availableOtherLocation
                                                            }
                                                        />
                                                    </div>
                                                }
                                            </>
                                        )}
                                </div>
                            </Form.Group>
                            {values.pickup && (
                                <>
                                    <Form.Group as={Row} className="pl15 fdc">
                                        {values.pickup === "FFL" &&
                                            product.shipBeyondPreferredDistance &&
                                            (((product.listingType ===
                                                GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore) ||
                                                history?.location?.state?.distance >
                                                Number(product.listingPreferredDistance)) && (
                                                <div className="text-muted f12 jcb pl15">
                                                    Note : You can enter the ZIP Code and search your
                                                    preferred FFL
                                                </div>
                                            )}
                                        <div class="col d-flex delivery-zip-block">
                                            {
                                                values.pickup === "FFL" &&
                                                (
                                                    ((product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore)
                                                    || (
                                                        product.shipBeyondPreferredDistance
                                                        && history?.location?.state?.distance > Number(product.listingPreferredDistance)
                                                    )
                                                )
                                                && (
                                                    <div class="deliveryLocation">
                                                        <div>
                                                            <input
                                                                type="text"
                                                                required="required"
                                                                placeholder="Enter Zipcode"
                                                                className="form-control full-w"
                                                                name="zipCode"
                                                                value={zipCode}
                                                                id="lv-zip-code"
                                                                onChange={(e) => {
                                                                    if (
                                                                        !isNaN(e.target.value) &&
                                                                        e.target.value.length <= 5
                                                                    ) {
                                                                        setZipCode(e.target.value);
                                                                    }
                                                                }}
                                                            />

                                                        </div>
                                                        {(!zipCode.length || zipCode.length < 5) && (
                                                            <div class="invalid-feedback display-block">
                                                                Please enter correct pincode
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            }
                                            {
                                                values.pickup === "FFL"
                                                && product.fflStoreEnabled
                                                && (
                                                    <>
                                                        {(((product.listingType ===
                                                            GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore) ||
                                                            (product.shipBeyondPreferredDistance &&
                                                                Number(product.distance) >
                                                                Number(product.listingPreferredDistance))) && (
                                                                <>
                                                                    <Form.Group className="text-left">
                                                                        <Form.Control
                                                                            as="select"
                                                                            className="deliver-location-list"
                                                                            name="fflStore"
                                                                            value={values.fflStore}
                                                                            onChange={handleChange}
                                                                            isInvalid={!!errors.fflStore}
                                                                            disabled={!listOfFFLStore.length || zipCode.length < 5}
                                                                        >
                                                                            {zipCode.length < 5 && <option value="">{""}</option>}
                                                                            {listOfFFLStore.map((list, index) => {
                                                                                return (
                                                                                    <option
                                                                                        key={index}
                                                                                        name={
                                                                                            list.storeName || list.licHolderName
                                                                                        }
                                                                                        value={index}
                                                                                    >
                                                                                        {`${list.storeName || list.licHolderName}, ${list.premCity}, ${list.premState}`}
                                                                                    </option>
                                                                                );
                                                                            })}
                                                                        </Form.Control>
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.fflStore}
                                                                        </Form.Control.Feedback>
                                                                        {!listOfFFLStore.length && (
                                                                            <div class="invalid-feedback display-block">
                                                                                There are no FFL store found in this
                                                                                location
                                                                            </div>
                                                                        )}
                                                                    </Form.Group>
                                                                </>
                                                            )}
                                                        {product.listingType ===
                                                            GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL
                                                            && (product.distance <
                                                                Number(product.listingPreferredDistance) ||
                                                                (product.distance >
                                                                    Number(product.listingPreferredDistance) &&
                                                                    !product.shipBeyondPreferredDistance)) && (
                                                                <div className="f13 text-semi-bold">
                                                                    <span className="mr10">
                                                                        <IcnLocation {...{ fill: "#5BA018" }} />
                                                                    </span>
                                                                    {`${(product?.fflStoreName && product.fflStoreName + ",") ||
                                                                        (product?.fflStoreLocation?.licHolderName && product.fflStoreLocation.licHolderName + ",") ||
                                                                        (product?.fflStoreLocation?.name && product.fflStoreLocation.name + ",") ||
                                                                        ""
                                                                        } ${(product?.fflPremiseCity && product?.fflPremiseCity + ",") ||
                                                                        (product?.fflStoreLocation?.premCity && product.fflStoreLocation.premCity + ",") ||
                                                                        (product?.fflStoreLocation?.premiseCity && product.fflStoreLocation.premiseCity + ",") ||
                                                                        ""
                                                                        } ${(product?.fflPremiseState && product.fflPremiseState + ",") ||
                                                                        (product?.fflStoreLocation?.premState && product.fflStoreLocation.premState + ",") ||
                                                                        (product?.fflStoreLocation?.premiseState && product.fflStoreLocation.premiseState + ",") ||
                                                                        ""
                                                                        } ${(product?.fflPremiseZipCode && product.fflPremiseZipCode) ||
                                                                        (product?.fflStoreLocation?.premZipCode && product.fflStoreLocation.premZipCode) ||
                                                                        (product?.fflStoreLocation?.premiseZipCode && product.fflStoreLocation.premiseZipCode) ||
                                                                        ""
                                                                        }`}
                                                                </div>
                                                            )}
                                                    </>
                                                )}
                                            {
                                                values.pickup === "SHERIFF_OFFICE" &&
                                                product.sheriffOfficeEnabled &&
                                                !_.isEmpty(product.sheriffOfficeLocation) && (
                                                    <>
                                                        <div className="f13 text-semi-bold">
                                                            <span className="mr10">
                                                                <IcnLocation {...{ fill: "#5BA018" }} />
                                                            </span>
                                                            {product.sheriffOfficeLocation.freeformAddress}
                                                        </div>
                                                    </>
                                                )
                                            }
                                            {
                                                values.pickup === "OTHER_LOCATION" &&
                                                product.availableOtherLocation &&
                                                !_.isEmpty(JSON.parse(product.anyOtherLocations)) && (
                                                    <div className="f13 text-semi-bold">
                                                        <span className="mr10">
                                                            <IcnLocation {...{ fill: "#5BA018" }} />
                                                        </span>
                                                        {
                                                            JSON.parse(product.anyOtherLocations)?.formatted_address
                                                            || JSON.parse(product.anyOtherLocations)?.name
                                                            || ""
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </Form.Group>
                                </>
                            )}
                            {values.pickup && values.pickup === "FFL" && (
                                <GMap
                                    {...{
                                        zipCode,
                                        product,
                                        setMyLocation,
                                        pickupLocationBy: values.pickup,
                                        sheriffOffice,
                                        setSheriffOffice,
                                        currLatLng: myLocation.location,
                                        showMapSearch: false,
                                    }}
                                />
                            )}
                            {values.pickup && values.pickup === "SHERIFF_OFFICE" && (
                                <GMap
                                    {...{
                                        zipCode,
                                        setMyLocation,
                                        pickupLocationBy: values.pickup,
                                        sheriffOffice,
                                        listOfSheriffLocation,
                                        setListOfSheriffLocation,
                                        currLatLng: myLocation.location,
                                        showMapSearch: false,
                                    }}
                                />
                            )}
                            {values.pickup && values.pickup === "OTHER_LOCATION" && (
                                <GMap
                                    {...{
                                        zipCode,
                                        pickupLocationBy: values.pickup,
                                        currLatLng: myLocation.location,
                                        showMapSearch: false,
                                    }}
                                />
                            )}
                            <div class="text-right mobile-off">
                                <input
                                    type="button"
                                    name="cancel"
                                    class="cancel-btn mt-2"
                                    value="Cancel"
                                    onClick={cancelAction}
                                />
                                <input
                                    onClick={handleSubmit}
                                    type="button"
                                    name="next"
                                    class="next action-button nextBtn"
                                    value="Complete Purchase"
                                    disabled={
                                        (zipCode.length < 5)
                                        || (
                                            ((product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore)
                                                ? !listOfFFLStore.length
                                                : (Number(product.distance) > Number(product.listingPreferredDistance) && product.shipBeyondPreferredDistance && !listOfFFLStore.length)
                                        )}
                                />
                            </div>
                            <section class="mobile-btn-section desktop-off">
                                <div class="container">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="proPg-btnArea">
                                                <div className="proPg-btnArea-div-outer">
                                                    <div className="proPg-btnArea-div-inner">
                                                        <input
                                                            type="button"
                                                            name="cancel"
                                                            value="Cancel"
                                                            onClick={cancelAction}
                                                            class="submt-btn submt-btn-lignt mr10 text-center full-w"
                                                        />
                                                    </div>
                                                    <div className="proPg-btnArea-div-inner">
                                                        <input
                                                            type="button"
                                                            value="Complete Purchase"
                                                            onClick={() => {
                                                                handleSubmit();
                                                            }}
                                                            disabled={
                                                                (zipCode.length < 5)
                                                                || (
                                                                    ((product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || product.adminToFFlStore)
                                                                        ? !listOfFFLStore.length
                                                                        : (Number(product.distance) > Number(product.listingPreferredDistance) && product.shipBeyondPreferredDistance && !listOfFFLStore.length)
                                                                )}
                                                            class="submt-btn submt-btn-dark text-center full-w"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </Form>
                    )}
                </Formik>
            </div>
            {
                paymentModal
                && orderInfo
                && <TermAndCondition
                    {...{
                        show: paymentModal,
                        setShow: setPaymentModal,
                        onAgreeCallback: () => {
                            onNextStep(orderInfo);
                        },
                        showCaptcha: false,
                        headerLabel: "Payment Terms & Conditions",
                        cancelButtonLabel: "Go Back",
                        submitButtonLabel: "I Agree"
                    }}
                />
            }
            {ListingUpdateAlertComponent}
            {BidConfirmationComponent}
        </div>
    );
};

export default memo(LocationView);
