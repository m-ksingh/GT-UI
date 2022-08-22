import React, { useState, useEffect, useContext, useRef, memo } from 'react'
import { Formik, Field, ErrorMessage } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import classNames from 'classnames';
import $ from 'jquery';
import Spinner from "rct-tpt-spnr";
import { Form } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { AppContext } from '../../contexts/AppContext';
import FilterListing from '../Shared/FilterListing';
import FormikCotext from '../Shared/FormikContext';
import CustomDropdown from "../Shared/CustomDropdown/CustomDropdown";
import { extractCategoryList, getSelectedCategoryTitleBySid, getSelectedOptionBySid } from "../../services/CommonServices";
import SpecificTrade from "./SpecificTrade"
import { RadioBoxKey } from '../Shared/InputType';
import { IcnTrashRed, PlusCircleIcon, TrashIcon } from '../icons';
import useToast from '../../commons/ToastHook';
import AddListingItems from './AddListingItems';
import { ListingContext } from './Context/ListingContext';
import { useAuthState } from '../../contexts/AuthContext/context';
import { useConfirmationModal } from '../../commons/ConfirmationModal/ConfirmationModalHook';
import { MAP_API_KEY } from '../../commons/utils';
import { useHistory } from "react-router-dom";
import GLOBAL_CONSTANTS from "../../Constants/GlobalConstants";
import moment from 'moment';

let specificTradePayload = {};
const defaultValuesItems = {
    "title": "",
    "description": "",
    "category": "",
    "pre1968": false,
    "serialNumber": "",
    "sellPrice": 0,
    "primary": false,
    "bundle": true,
    "estimatedPrice": '',
    "itemType": "NOT_FIRE_ARM",
    "serialNumber": "",
    "trade": '',
    "auction": '',

};

const ListingInfo = ({
    setTab,
    listInfoByView,
    setListInfoByView,
    tempListingInfo,
    setTempListingInfo,
    listInfoByViewRef,
    onCancelStep = () => {}
}) => {
    let tempListingInfoRef = useRef(null);
    const history = useHistory();
    const anyOtherlocationRef = useRef(null);
    const userDetails = useAuthState();
    const spinner = useContext(Spinner);
    const { platformVariables } = useContext(AppContext);
    const { setBundleItems, bundleItems } = useContext(ListingContext);
    let defaultValues = GLOBAL_CONSTANTS.DATA.CREATE_LISTING_DEFAULT;
    let defaultSpecificListing = {};
    const [listOfCategory, setListOfCategory] = useState([]);
    const [listOfCategoryByFlatten, setListOfCategoryByFlatten] = useState([]);
    const [listOfCondition, setListOfCondition] = useState([]);
    const [listOfManufacturer, setListOfManufacturer] = useState([]);
    const [listOfModel, setListOfModel] = useState([]);
    const [listOfCaliber, setListOfCaliber] = useState([]);
    const [listOfBarrelLength, setListOfBarrelLength] = useState([]);
    const [listOfCapacity, setListOfCapacity] = useState([]);
    const [listOfFrameFinish, setListOfFrameFinish] = useState([]);
    const [listOfGrips, setListOfGrips] = useState([]);
    const [listingModel, setListingModel] = useState(false);
    const [isValidSerialNumber, setIsValidSerialNumber] = useState(true);
    const [addItemModal, setAddItemModal] = useState(false)
    const [listingItem, setListingItem] = useState([])
    const [selectedListingItem, setSelectedListingItem] = useState(null)
    const [totalListPrice, setTotalListPrice] = useState(0)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isEditItems, setIsEditItems] = useState(false)
    const [distance, setDistance] = useState(listInfoByView.info.listingPreferredDistance);
    const [myStoreList, setMyStoreList] = useState([]);
    const [fflStoreList, setFflStoreList] = useState([]);
    const [selectedFfl, setSelectedFfl] = useState(listInfoByView.info?.fflStoreLocation ? listInfoByView.info.fflStoreLocation : {});
    const [listOfSheriffLocation, setListOfSheriffLocation] = useState([]);
    const [selectedSherriffOffice, setSelectedSherriffOffice] = useState(listInfoByView.info?.sheriffOfficeLocation ? listInfoByView.info.sheriffOfficeLocation : {});
    const [anyOtherLocation, setAnyOtherLocation] = useState(
        listInfoByView?.anyOtherLocation?.formatted_address
        || listInfoByView?.info?.anyOtherLocation?.formatted_address
        || listInfoByView?.anyOtherLocation?.name
        || listInfoByView?.info?.anyOtherLocation?.name
        || listInfoByView?.info?.googleLocation
        || "");
    const [selectedAnyOtherLocation, setSelectedAnyOtherLocation] = useState({
        lat: "",
        lng: "",
        info: listInfoByView?.anyOtherLocation || listInfoByView?.info?.anyOtherLocation || {},
    })
    const [listDetail, setListDetail] = useState(_.cloneDeep(listInfoByView));
    const [selectedSpecificListing, setSelectedSpecificListing] = useState(defaultSpecificListing);
    const [initialValues, setInitialValues] = useState(defaultValues);
    const [isAnyOtherLocationSet, setIsAnyOtherLocationSet] = useState(false);
    const [isSingle, setIsSingle] = useState(listInfoByView?.info.isSingle);
    const Toast = useToast();

    const handleUpdateListingInfo = (listingInfo) => {
        try {
            if (!_.isEmpty(listingInfo.info)) {
                defaultValues = _.cloneDeep(listingInfo.info);
                defaultValues.category = defaultValues.category?.sid ? defaultValues.category.sid : defaultValues.category;
                defaultValues.tcondition = defaultValues.tcondition?.sid ? defaultValues.tcondition.sid : defaultValues.tcondition;
                defaultValues.manufacturer = defaultValues.manufacturer?.sid ? defaultValues.manufacturer.sid : defaultValues.manufacturer;
                defaultValues.model = defaultValues.model?.sid ? defaultValues.model.sid : defaultValues.model;
                defaultValues.caliber = defaultValues.caliber?.sid ? defaultValues.caliber.sid : defaultValues.caliber;
                defaultValues.barrelLength = defaultValues.barrelLength?.sid ? defaultValues.barrelLength.sid : defaultValues.barrelLength;
                defaultValues.capacity = defaultValues.capacity?.sid ? defaultValues.capacity.sid : defaultValues.capacity;
                defaultValues.frameFinish = defaultValues.frameFinish?.sid ? defaultValues.frameFinish.sid : defaultValues.frameFinish;
                defaultValues.grips = defaultValues.grips?.sid ? defaultValues.grips.sid : defaultValues.grips;

                let tempTradeExpire = moment(defaultValues?.tradeExpiresOn);
                let tempActionExpire = moment(defaultValues.auctionExpireOn);
                let tempSellExpire = moment(defaultValues.sellExpiresOn);
                let b = new Date(defaultValues.postedOn);
                defaultValues.tradeExpiresOn = tempTradeExpire.diff(b, 'days');
                defaultValues.auctionExpireOn = tempActionExpire.diff(b, 'days');
                defaultValues.sellExpiresOn = tempSellExpire.diff(b, 'days');

                
                // name update
                defaultValues.selectedCategoryName = defaultValues?.category?.name || defaultValues?.selectedCategoryName || defaultValues?.category || "";
                defaultValues.selectedConditionName = defaultValues?.tcondition?.name || defaultValues?.selectedConditionName || defaultValues?.tcondition || "";
                defaultValues.selectedManufacturerName = defaultValues?.manufacturer?.name || defaultValues?.selectedManufacturerName || defaultValues?.manufacturer || "";
                defaultValues.selectedModelName = defaultValues?.model?.name || defaultValues.selectedModelName || defaultValues?.model || "";
                defaultValues.selectedCaliberName = defaultValues?.caliber?.name || defaultValues?.selectedCaliberName || defaultValues?.caliber || "";
                defaultValues.selectedBarrelName = defaultValues?.barrelLength?.name || defaultValues?.selectedBarrelName || defaultValues?.barrelLength || "";
                defaultValues.selectedCapacityName = defaultValues?.capacity?.name || defaultValues?.selectedCapacityName || defaultValues?.capacity || "";
                defaultValues.selectedFrameName = defaultValues?.frameFinish?.name || defaultValues?.selectedFrameName || defaultValues?.frameFinish || "";
                defaultValues.selectedGripsName = defaultValues?.grips?.name || defaultValues?.selectedGripsName || defaultValues?.grips || "";

                defaultValues.selectedDealerStoreName = defaultValues?.fflStoreLocation.name || defaultValues?.fflStore?.name ? defaultValues.fflStoreLocation.name || defaultValues.fflStore.name : "";
                // setting value for anyother
                defaultValues.googleLocation = (!_.isEmpty(defaultValues?.googleLocation) && defaultValues?.googleLocation) || (!_.isEmpty(defaultValues?.anyOtherLocation) && (defaultValues?.anyOtherLocation?.formatted_address || defaultValues?.anyOtherLocation?.name)) || "";
                defaultValues.platformVariables = {
                    "returnPeriod": defaultValues?.platformVariables?.returnPeriod
                        || userDetails.user?.defaultPlatformVariables?.returnPeriod
                        || platformVariables.returnPeriod
                        || "",
                    "restockingFees": {
                        "percentage": defaultValues?.platformVariables?.restockingFees?.percentage
                            || userDetails.user?.defaultPlatformVariables?.restockingFees?.percentage
                            || platformVariables?.restockingFees?.percentage
                            || "",
                        "amount": defaultValues?.platformVariables?.restockingFees?.amount
                            || userDetails.user?.defaultPlatformVariables?.restockingFees?.amount
                            || platformVariables?.restockingFees?.amount
                            || "",
                    }
                };
                defaultValues.listingType = ((userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER) || userDetails.user.adminToFFlStore) ? GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER : GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL;
                defaultSpecificListing = _.cloneDeep(defaultValues.specificTrade);
                setInitialValues(defaultValues);

            }
        } catch (err) {
            console.error("Error occurred while handleUpdateListingInfo--", err);
        }
    }

    const individualSchema = Yup.object().shape({
        title: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(100, "Maximum 100 Characters Allowed")
            .required("Required!"),
        description: Yup.string()
            .required("Required!")
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "Maximum 1032 Characters Allowed"),
        selectedCategoryName: Yup.string()
            .required("Required!"),
        selectedConditionName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("condition"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string().nullable(),
        }),
        selectedManufacturerName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("manufacturer"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string().nullable(),
        }),
        selectedModelName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("model"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string().nullable(),
        }),
        selectedCaliberName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("caliber"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string().nullable(),
        }),
        // selectedBarrelName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("barrel length"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string().nullable(),
        // }),
        // selectedCapacityName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("capacity"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string().nullable(),
        // }),
        // selectedFrameName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("frame finish"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string().nullable(),
        // }),
        // selectedGripsName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("grips"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string().nullable(),
        // }),
        itemType: Yup.string(),
        serialNumber: Yup.string().when("itemType", {
            is: (val) => val === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && (userDetails.user.appUserType !== GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER && !userDetails.user.adminToFFlStore),
            then: Yup.string().required("Serial number required"),
            otherwise: Yup.string().nullable()
        }),
        auction: Yup.bool(),
        sell: Yup.bool(),
        trade: Yup.bool(),
        auctionExpireOn: Yup.string().when("auction", {
            is: (val) => val === true,
            then: Yup.string().required("Auction expires on required"),
            otherwise: Yup.string().nullable().notRequired()
        }),
        deliveryType: Yup.string().required("Delivery Type is required"),
        quantity: Yup.number().typeError("Please enter a valid number").min(1, "Minimum quantity should be 1").required("Required!"),
        price: Yup.number().when("sell", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").min(1, "Minimum price should be 1").max(999999999, "Maximum price should be 999999999").required("Price is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        tradeReservePrice: Yup.number().when("trade", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(1, "Minimum trade value should be 1").required("Trade value is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        auctionReservePrice: Yup.number().when("auction", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(0, "Minimum reserve price should be 0").required("Reserve price is required. If not required, please enter ‘0’."),
            otherwise: Yup.number().nullable().notRequired()
        }),
        fixedSippingFees: Yup.number().when("shippingFeesLocationBased", {
            is: (val) => val === false,
            then: Yup.number().typeError("Please enter a valid price").min(0, "Minimum fixed shipping fee should be 0").required("Fixed shipping fee is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        fflStoreEnabled: Yup.bool(),
        sheriffOfficeEnabled: Yup.bool(),
        availableOtherLocation: Yup.bool(),

        fflStoreLocation: Yup.object().when('fflStoreEnabled', {
            is: true,
            then: Yup.object().required("Required!").nullable(),
            otherwise: Yup.object().nullable().notRequired()
        }),

        sheriffOfficeLocation: Yup.object().when('sheriffOfficeEnabled', {
            is: true,
            then: Yup.object().required("Required!").nullable(),
            otherwise: Yup.object().nullable().notRequired()
        }),

        googleLocation: Yup.string().when('availableOtherLocation', {
            is: true,
            then: Yup.string().required("Required!").nullable(),
            otherwise: Yup.string().nullable().notRequired()
        }),
        platformVariables: Yup.object().shape({
            returnPeriod: Yup.number().integer("Invalid number").when('returnable', {
                is: (val) => val === true,
                then: Yup.number(),
                otherwise: Yup.number().nullable().notRequired()
            }),
            restockingFees: Yup.object().shape({
                percentage: Yup.string().when('returnable', {
                    is: (val) => val === true,
                    then: Yup.string().matches(/^[+0-9]+$/, "Numbers only allowed"),
                    otherwise: Yup.string().nullable().notRequired()
                }),
                amount: Yup.number().integer("Invalid price").when('returnable', {
                    is: (val) => val === true,
                    then: Yup.number(),
                    otherwise: Yup.number().nullable().notRequired()
                }),
            })
        })
    });

    const dealerSchema = Yup.object().shape({
        title: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(100, "Maximum 100 Characters Allowed")
            .required("Required!"),
        description: Yup.string()
            .required("Required!")
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "Maximum 1032 Characters Allowed"),
        selectedCategoryName: Yup.string()
            .required("Required!"),
        selectedConditionName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("condition"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string().nullable(),
        }),
        selectedManufacturerName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("manufacturer"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
        }),
        selectedModelName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("model"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
        }),
        selectedCaliberName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("caliber"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
        }),
        selectedBarrelName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("barrel length"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
        }),
        selectedCapacityName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("capacity"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
        }),
        selectedFrameName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("frame finish"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
        }),
        selectedGripsName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("grips"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
        }),
        itemType: Yup.string(),
        serialNumber: Yup.string().when("itemType", {
            is: (val) => val === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore,
            then: Yup.string().required("Serial Number required"),
            otherwise: Yup.string().nullable()
        }),
        auction: Yup.bool(),
        sell: Yup.bool(),
        trade: Yup.bool(),
        auctionExpireOn: Yup.string().when("auction", {
            is: (val) => val === true,
            then: Yup.string().required("Auction expires on required"),
            otherwise: Yup.string().nullable().notRequired()
        }),
        availableOtherLocation: Yup.bool(),
        deliveryType: Yup.string().required("Delivery Type is required"),
        quantity: Yup.number().typeError("Please enter a valid number").min(1, "Minimum quantity should be 1").required("Required!"),
        price: Yup.number().when("sell", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(1, "Minimum price should be 1").required("Price is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        tradeReservePrice: Yup.number().when("trade", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(1, "Minimum trade value should be 1").required("Trade value is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        auctionReservePrice: Yup.number().when("auction", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(0, "Minimum reserve price should be 0").required("Reserve price is required. If not required, please enter ‘0’."),
            otherwise: Yup.number().nullable().notRequired()
        }),
        fixedSippingFees: Yup.number().when("shippingFeesLocationBased", {
            is: (val) => val === false,
            then: Yup.number().typeError("Please enter a valid price").min(0, "Minimum fixed shipping fee should be 0").required("Fixed shipping fee is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        selectedDealerStoreName: Yup.string().required("Store is required"),
        platformVariables: Yup.object().shape({
            returnPeriod: Yup.number().integer("Invalid number").when('returnable', {
                is: (val) => val === true,
                then: Yup.number(),
                otherwise: Yup.number().nullable().notRequired()
            }),
            restockingFees: Yup.object().shape({
                percentage: Yup.string().when('returnable', {
                    is: (val) => val === true,
                    then: Yup.string().matches(/^[+0-9]+$/, "Numbers only allowed"),
                    otherwise: Yup.string().nullable().notRequired()
                }),
                amount: Yup.number().integer("Invalid price").when('returnable', {
                    is: (val) => val === true,
                    then: Yup.number(),
                    otherwise: Yup.number().nullable().notRequired()
                }),
            })
        })
    });

    const IndividaulBundleSchema = Yup.object().shape({
        auction: Yup.bool(),
        sell: Yup.bool(),
        trade: Yup.bool(),
        auctionExpireOn: Yup.string().when("auction", {
            is: (val) => val === true,
            then: Yup.string().required("Auction expires on required"),
            otherwise: Yup.string().nullable().notRequired()
        }),
        availableOtherLocation: Yup.bool(),
        deliveryType: Yup.string().required("Delivery Type is required"),
        quantity: Yup.number().typeError("Please enter a valid number").min(1, "Minimum quantity should be 1").required("Required!"),
        price: Yup.number().when("sell", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(1, "Minimum price should be 1").required("Price is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        tradeReservePrice: Yup.number().when("trade", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(1, "Minimum trade value should be 1").required("Trade value is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        auctionReservePrice: Yup.number().when("auction", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(0, "Minimum reserve price should be 0").required("Reserve price is required. If not required, please enter ‘0’."),
            otherwise: Yup.number().nullable().notRequired()
        }),
        fixedSippingFees: Yup.number().when("shippingFeesLocationBased", {
            is: (val) => val === false,
            then: Yup.number().typeError("Please enter a valid price").min(0, "Minimum fixed shipping fee should be 0").required("Fixed shipping fee is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        fflStoreEnabled: Yup.bool(),
        sheriffOfficeEnabled: Yup.bool(),
        availableOtherLocation: Yup.bool(),

        fflStoreLocation: Yup.object().when('fflStoreEnabled', {
            is: true,
            then: Yup.object().required("Required!").nullable(),
            otherwise: Yup.object().nullable().notRequired()
        }),

        sheriffOfficeLocation: Yup.object().when('sheriffOfficeEnabled', {
            is: true,
            then: Yup.object().required("Required!").nullable(),
            otherwise: Yup.object().nullable().notRequired()
        }),

        googleLocation: Yup.string().when('availableOtherLocation', {
            is: true,
            then: Yup.string().required("Required!").nullable(),
            otherwise: Yup.string().nullable().notRequired()
        }),
        platformVariables: Yup.object().shape({
            returnPeriod: Yup.number().integer("Invalid number").when('returnable', {
                is: (val) => val === true,
                then: Yup.number(),
                otherwise: Yup.number().nullable().notRequired()
            }),
            restockingFees: Yup.object().shape({
                percentage: Yup.string().when('returnable', {
                    is: (val) => val === true,
                    then: Yup.string().matches(/^[+0-9]+$/, "Numbers only allowed"),
                    otherwise: Yup.string().nullable().notRequired()
                }),
                amount: Yup.number().integer("Invalid price").when('returnable', {
                    is: (val) => val === true,
                    then: Yup.number(),
                    otherwise: Yup.number().nullable().notRequired()
                }),
            })
        })
    });

    const DealerBundleSchema = Yup.object().shape({
        auction: Yup.bool(),
        sell: Yup.bool(),
        trade: Yup.bool(),
        auctionExpireOn: Yup.string().when("auction", {
            is: (val) => val === true,
            then: Yup.string().required("Auction expires on required"),
            otherwise: Yup.string().nullable().notRequired()
        }),
        availableOtherLocation: Yup.bool(),
        deliveryType: Yup.string().required("Delivery Type is required"),
        quantity: Yup.number().typeError("Please enter a valid number").min(1, "Minimum quantity should be 1").required("Required!"),
        price: Yup.number().when("sell", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(1, "Minimum price should be 1").required("Price is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        tradeReservePrice: Yup.number().when("trade", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(1, "Minimum trade value should be 1").required("Trade value is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        auctionReservePrice: Yup.number().when("auction", {
            is: (val) => val === true,
            then: Yup.number().typeError("Please enter a valid price").max(999999999, "Maximum price should be 999999999").min(0, "Minimum reserve price should be 0").required("Reserve price is required. If not required, please enter ‘0’."),
            otherwise: Yup.number().nullable().notRequired()
        }),
        fixedSippingFees: Yup.number().when("shippingFeesLocationBased", {
            is: (val) => val === false,
            then: Yup.number().typeError("Please enter a valid price").min(0, "Minimum fixed shipping fee should be 0").required("Fixed shipping fee is required"),
            otherwise: Yup.number().nullable().notRequired()
        }),
        selectedDealerStoreName: Yup.string().required("Store is required"),
        platformVariables: Yup.object().shape({
            returnPeriod: Yup.number().integer("Invalid number").when('returnable', {
                is: (val) => val === true,
                then: Yup.number(),
                otherwise: Yup.number().nullable().notRequired()
            }),
            restockingFees: Yup.object().shape({
                percentage: Yup.string().when('returnable', {
                    is: (val) => val === true,
                    then: Yup.string().matches(/^[+0-9]+$/, "Numbers only allowed"),
                    otherwise: Yup.string().nullable().notRequired()
                }),
                amount: Yup.number().integer("Invalid price").when('returnable', {
                    is: (val) => val === true,
                    then: Yup.number(),
                    otherwise: Yup.number().nullable().notRequired()
                }),
            })
        })
    });
    const listOfTradeWith = [
        {
            id: 'open',
            name: 'with any item'
        },
        {
            id: 'specific',
            name: 'with specific item'
        }
    ];
    const expriesOption = [
        {
            id: '1',
            name: '1'
        },
        {
            id: '3',
            name: '3'
        },
        {
            id: '7',
            name: '7'
        },
        {
            id: '15',
            name: '15'
        },
        {
            id: '30',
            name: '30'
        }
    ];

    // show delete confirmation modal when user click on delete
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Delete",
        body: "Are you sure, you want to delete?",
        onConfirm: (data) => {
            deleteItems(data)
        },
        onCancel: () => { }
    })

    const setListByArgs = (args, dataset) => {
        switch (args) {
            case 'category':
                setListOfCategory(dataset);
                break;
            case 't_condition':
                setListOfCondition(dataset);
                break;
            case 'manufacturer':
                setListOfManufacturer(dataset);
                break;
            case 'model':
                setListOfModel(dataset);
                break;
            case 'caliber':
                setListOfCaliber(dataset);
                break;
            case 'barrel_length':
                setListOfBarrelLength(dataset);
                break;
            case 'capacity':
                setListOfCapacity(dataset);
                break;
            case 'frame_finish':
                setListOfFrameFinish(dataset);
                break;
            case 'grips':
                setListOfGrips(dataset);
                break;
            default:
                console.log('Nothing Matched!');
        }
    }
    const getDataByArgs = (args) => {
        ApiService.getListByArg(args).then(
            response => {
                setListByArgs(args, response.data || []);
            },
            err => { }
        );
    }
    const getCategoriesByFlatten = (list) => {
        const results = [];
        function rec(list) {
            _.each(list, (d, index) => {
                results.push(d);
                if (d.childCategory && d.childCategory.length) {
                    rec(d.childCategory);
                }
            });
        }
        rec(list);
        return results;
    }

    const getCategoryData = (args) => {
        ApiService.getCategories(args).then(
            response => {
                setListOfCategory(extractCategoryList(response.data || []));
                setListOfCategoryByFlatten(getCategoriesByFlatten((_.cloneDeep(response.data) || [])));
            },
            err => { }
        );
    }

    const updateListOptions = (values) => {
        if (values.trade && values.tradeWith === 'specific') {
            values.sell = false;
            values.auction = false;
        }
        if (values.trade && values.tradeWith === 'open') {
            setSelectedSpecificListing({});
        }
        if (!values.trade) {
            values.tradeWith = 'open';
            values.tradeExpiresOn = '7';
            setSelectedSpecificListing({});
        }
        if (!values.auction) {
            values.auctionExpireOn = '7';
        }
        if (!values.sell) {
            values.sellExpiresOn = '7';
        }
    }

    // get mya store list
    const populateMyStoreList = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getMyStoreList(userDetails.user.sid).then(
                response => {
                    setMyStoreList(response.data.filter(r => (r.approvalStatus === GLOBAL_CONSTANTS.APPROVAL_STATUS.APPROVED || r.approvalStatus === GLOBAL_CONSTANTS.APPROVAL_STATUS.EXPIRED)));
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    console.error("Error occured while populateMyStoreList--", err);
                }
            );
        } catch (err) {
            spinner.hide();
            console.error("Error occured while populateMyStoreList--", err);
        }
    }

    // get ffl store list
    const populateFflStoreList = (distance) => {
        try {
            spinner.show("Loading... Please wait...");
            let payload = {
                "latitude": listInfoByView.location.lat,
                "longitude": listInfoByView.location.lng,
                // "latitude": userDetails?.user?.appUserHasAddressTO?.latitude,
                // "longitude": userDetails?.user?.appUserHasAddressTO?.longitude,
                "distance": distance ? distance : "100",
                "distanceUnit": "ml"
            }
            ApiService.getFflStoreList(payload).then(
                response => {
                    setFflStoreList(response.data);
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    console.error("Error occured while populateFflStoreList--", err);
                }
            );
        } catch (err) {
            spinner.hide();
            console.error("Error occured while populateFflStoreList--", err);
        }
    }

    /**
     * This method used to set sheriff locations by longitude and latitude.
     * @param {Object} coords -  longitude and latitude
     */
    const fetchSheriffOfficesByLatLng = (coords = {}, distance) => {
        try {
            const payload = {
                lat: coords.lat,
                lon: coords.lng || coords.lon,
                radius: distance ? distance : '100',
                key: MAP_API_KEY
            }

            ApiService.getSheriffLocation(payload).then(
                response => {
                    let tmpArr = response?.data?.results.map(r => ({ ...r.address }));
                    setListOfSheriffLocation(tmpArr || []);
                }, err => {
                    console.error("Exception occurred when fetchSheriffOfficesByLatLng -- ", err);
                })
        } catch (err) {
            console.error("Exception occurred when updateMyLocationByLatLng -- ", err);
        }
    }

    const addManufacturerList = (newManufatList) => {
        spinner.show("Please wait...");
        try {
            const payload = {
                iconLocation: null,
                name: newManufatList,
            }
            ApiService.createManufacturer(payload).then(
                response => {
                    listOfManufacturer.push(response.data)
                    spinner.hide()
                    Toast.success({ message: 'Manufacturer name created successfully!', time: 2000 });
                }, err => {
                    spinner.hide();
                    Toast.error({ message: 'Internal server error', time: 2000 });
                    console.error("Exception occurred when addManufacturerList -- ", err);
                }
            )
        } catch (err) {
            spinner.hide()
            console.error("Exception occurred when addManufacturerList -- ", err);
        }
    }

    const isValidSerialNumberFn = (sNumber) => {
        ApiService.isValidSerialNumber(sNumber).then(
            response => {
                if (response.status === 200) {
                    setIsValidSerialNumber(true);
                } else {
                    setIsValidSerialNumber(false);
                }
            },
            err => {
                setIsValidSerialNumber(false);
            }
        );
    }

    const setListingValues = (list) => {
        setSelectedSpecificListing(list);
    }

    const handleChangeByChange = (values, setFieldValue, validateField) => {
        if (values) {
            setTempListingInfo(values);
            updateListOptions(values);
            specificTradePayload = values;
            setIsSingle(values.isSingle);
            if (!values.isSingle) {
                setFieldValue("price", totalListPrice);
                // setFieldValue("auctionReservePrice", totalListPrice); // freee 
                setFieldValue("tradeReservePrice", totalListPrice);
                if (!_.isEmpty(listInfoByView?.listingItem[0])) {
                    _.isEmpty(values.title) && setFieldValue("title", listInfoByView?.listingItem[0]?.title || "");
                    _.isEmpty(values.description) && setFieldValue("description", listInfoByView?.listingItem[0]?.description || "");
                    _.isEmpty(values.category) && setFieldValue("category", listInfoByView?.listingItem[0]?.category || "");
                    _.isEmpty(values.selectedCategoryName) && setFieldValue("selectedCategoryName", listInfoByView?.listingItem[0]?.selectedCategoryName || "");
                }
            }
        }
    }

    /**
     * this method triggers to set limited the value
     * @param {String} key - name of the key to set value
     * @param {String} value - value of the input field
     * @param {Function} setFieldValue - function to set value
     * @param {Number} limit - limit of the field
     */
    const onChangeLimit = (key, value, setFieldValue, limit) => {
        try {
            let a = value.substring(0, limit); // prevent to paste more than limited characters
            setFieldValue(key, a);
        } catch (err) {
            console.error("Error occurred while onChangeLimit", err);
        }
    }

    const onChangeTrim = (key, value, setFieldValue) => {
        try {
            let trimValue = value.replace(/\s+/g, ' ').trim(); 
            setFieldValue(key, trimValue);
        } catch (err) {
            console.error("Error occurred while onChangeTrim", err);
        }
    }

    // validate for Return Period
    const validateReturnPeriod = (value) => {
        let error = "";
        if (!value) {
            error = "Required";
        } else {
            if (Number(value) < 0) {
                error = "Please enter positive value"
            } else if (value == 0) {
                error = "Value should not be 0"
            }
        }
        return error;
    }
    // delete item by index
    const deleteItems = (data) => {
        let filterdListItem = data.bundleItems.filter(res => res.lId !== data.res.lId);
        setListingItem(filterdListItem);
        setBundleItems(filterdListItem);
        setListInfoByView({ ...listInfoByView, listingItem: filterdListItem });
        Toast.success({ message: 'Secondary item successfully deleted' });
    }

    // initialize the google place autocomplete
    const initPlaceAPI = () => {
        if (window.google && window.google.maps) {
            let autocomplete = new window.google.maps.places.Autocomplete(anyOtherlocationRef.current, GLOBAL_CONSTANTS.DATA.GOOGLE_SEARCH_OPTION);
            new window.google.maps.event.addListener(autocomplete, "place_changed", function () {
                let place = autocomplete.getPlace();
                setSelectedAnyOtherLocation({
                    info: place,
                    lat: place?.geometry?.location.lat() ? place?.geometry?.location.lat() : "",
                    lng: place?.geometry?.location.lng() ? place?.geometry?.location.lng() : ""
                })
            });
        }
    };

    const getFflStoreListByPrefferredDistance = (distance, setFieldValue) => {
        try {
            setSelectedFfl(null);
            setFieldValue("fflStoreEnabled", false);
            setFieldValue("fflStoreLocation", null);

            setSelectedSherriffOffice(null);
            setFieldValue("sheriffOfficeLocation", null);
            setFieldValue("sheriffOfficeEnabled", false);

            setFieldValue("listingPreferredDistance", distance);
            populateFflStoreList(distance);
            fetchSheriffOfficesByLatLng(listInfoByView.location, distance);

            setFieldValue("availableOtherLocation", false);
            setFieldValue("googleLocation", "");
            setAnyOtherLocation("");
            anyOtherlocationRef.current.value = "";

            setSelectedAnyOtherLocation({
                info: null,
                lat: "",
                lng: ""
            });
        } catch (err) {
            console.error("Error occur while getFflStoreListByPrefferredDistance--", err);
        }
    }

    // this method lestening for form is valid or not
    const handleFormValidation = (isSubmitting, isValid, dirty, values) => {
        let isFormValid = false;
        try {
            if (
                isSubmitting
                || !isValid
                || (_.isEmpty(listDetail.info) && !dirty)
                || ((values.itemType === "FIRE_ARM" || values.itemType === "PRE_1968") && !isValidSerialNumber)
                || (values.tradeWith === 'specific' && _.isEmpty(selectedSpecificListing))
                || (!values.trade && !values.sell && !values.auction)
                || (
                    userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore
                    && ((!values.availableOtherLocation && !values.fflStoreEnabled && !values.sheriffOfficeEnabled)
                        || (
                            (values.sheriffOfficeEnabled && _.isEmpty(values.sheriffOfficeLocation))
                            || (values.fflStoreEnabled && _.isEmpty(values.fflStoreLocation))
                            || (values.availableOtherLocation && _.isEmpty(values.googleLocation))
                        ))
                )
                || values.isExpired
            ) isFormValid = true;
        } catch (err) {
            console.error("Error occur while handleFormValidation --", err);
        }
        return isFormValid;
    }

    const handleDataConvertion = (values) => {
        let tmpValues = { ...values };
        try {
            tmpValues.category = _.filter(listOfCategoryByFlatten, { sid: values.category })[0];
            tmpValues.tcondition = _.filter(listOfCondition, { sid: values.tcondition })[0];
            tmpValues.manufacturer = _.filter(listOfManufacturer, { sid: values.manufacturer })[0];
            tmpValues.model = _.filter(listOfModel, { sid: values.model })[0];
            tmpValues.caliber = _.filter(listOfCaliber, { sid: values.caliber })[0];
            tmpValues.barrelLength = _.filter(listOfBarrelLength, { sid: values.barrelLength })[0];
            tmpValues.capacity = _.filter(listOfCapacity, { sid: values.capacity })[0];
            tmpValues.frameFinish = _.filter(listOfFrameFinish, { sid: values.frameFinish })[0];
            tmpValues.grips = _.filter(listOfGrips, { sid: values.grips })[0];
            tmpValues.specificTrade = _.cloneDeep(selectedSpecificListing);
            tmpValues.anyOtherLocation = (!_.isEmpty(values.anyOtherLocation) && values.anyOtherLocation) || selectedAnyOtherLocation?.info || {};
        } catch (err) {
            console.error("Error occurred handleDataConvertion");
        }
        return tmpValues;
    }

    const onPrevNav = () => {
        $('#info').removeClass('active');
        setTab('location');
    }

    const onNextStep = (values, isPrev = false) => {
        let tmpVal = handleDataConvertion(values);
        setListInfoByView({ ...listInfoByView, 'info': { ...listInfoByView.info, ...tmpVal } });
        setBundleItems(listingItem)
        if (isPrev) {
            onPrevNav()
        } else {
            $('#image').addClass('active pointer');
            setTab('image');
        }
    }

    useEffect(() => {
        let totalEstimate = listInfoByView.listingItem.length > 0 ? listInfoByView.listingItem.reduce((a, { estimatedPrice }) => a + parseInt(estimatedPrice), 0) : listDetail.estimatedPrice
        setTotalListPrice(totalEstimate)
    }, [listInfoByView])

    useEffect(() => {
        setListInfoByView({ ...listInfoByView, "anyOtherLocation": selectedAnyOtherLocation.info })
    }, [selectedAnyOtherLocation])

    useEffect(() => {
        initPlaceAPI(); // init google autocomplete search map
    }, [anyOtherLocation])

    useEffect(() => {
        if (listInfoByView && listInfoByView.info && !_.isEmpty(listInfoByView.info)) {
            setListDetail(_.cloneDeep(listInfoByView));
            handleUpdateListingInfo(_.cloneDeep(listInfoByView));
        }
    }, [listInfoByView?.info && listInfoByView.info])

    useEffect(() => {
        if (listInfoByView?.info?.anyOtherLocation && (listInfoByView?.info?.anyOtherLocation?.formatted_address || listInfoByView?.info?.anyOtherLocation?.name) && anyOtherlocationRef?.current?.value === "" && !isAnyOtherLocationSet) {
            anyOtherlocationRef.current.value = listInfoByView?.info?.anyOtherLocation?.formatted_address || listInfoByView?.info?.anyOtherLocation?.name || "";
            setIsAnyOtherLocationSet(true);
        }
    }, [anyOtherlocationRef?.current?.value])

    useEffect(() => {
        tempListingInfoRef.current = tempListingInfo;
    }, [tempListingInfo])

    useEffect(() => {
        if (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore) {
            if (listInfoByView.location) fetchSheriffOfficesByLatLng(listInfoByView.location);
            populateFflStoreList();
        } else {
            populateMyStoreList();
        }
        getCategoryData('category');
        getDataByArgs('t_condition');
        getDataByArgs('manufacturer');
        getDataByArgs('model');
        getDataByArgs('caliber');
        getDataByArgs('barrel_length');
        getDataByArgs('capacity');
        getDataByArgs('frame_finish');
        getDataByArgs('grips');
        window.scrollTo(0, 0);
        // setListingItem(bundleItems)
        listDetail?.info?.specificTrade ? setSelectedSpecificListing(listDetail.info.specificTrade) : setSelectedSpecificListing({})
        if (listDetail.sid && listingItem && listingItem.length === 0 && bundleItems && bundleItems.length === 0) {
            setListingItem(listDetail.listingItem ? listDetail.listingItem : []);
            setBundleItems(listDetail.listingItem ? listDetail.listingItem : []);
        }

        // cleanup funtion - trigger when listingInfo component destroy or unmount
        return () => {
            listInfoByViewRef.current = {
                ...listInfoByViewRef.current,
                "info": { ...listInfoByViewRef.current.info, ...tempListingInfoRef.current }
            }
        };

    }, [])
    const styles = {
        Active: {
            color: 'black'
        },
        Inactive: {
            color:"red"
        },
    }

    return (<fieldset>
        <div className="row justify-content-center">
            <div className="col-lg-6">
                <div className="form-card create-listing">
                    <Formik
                        enableReinitialize={true}
                        validationSchema={
                            !isSingle
                                ? ((userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) ? DealerBundleSchema : IndividaulBundleSchema)
                                : ((userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) ? dealerSchema : individualSchema)
                        }
                        initialValues={initialValues}
                        onSubmit={(value) => onNextStep(value)}>
                        {({
                            handleSubmit,
                            isSubmitting,
                            handleChange,
                            touched,
                            errors,
                            values,
                            isValid,
                            dirty,
                            handleBlur,
                            setFieldValue,
                            setFieldTouched,
                            validateField,
                            resetForm
                        }) => (
                            <Form noValidate>
                                <FormikCotext {...{ callback: (val) => handleChangeByChange(val, setFieldValue, validateField) }} />
                                <div className="fst-form-part">
                                    <div className="form-group text-left pb20">
                                        <div className="mb-2 flx f13 text-dark magic-box listing-type">
                                            <RadioBoxKey
                                                name="isSingle"
                                                options={
                                                    [
                                                        { label: "List Single Item", value: true },
                                                        { label: "List Multiple Item bundled", value: false, disabled: false }
                                                    ]
                                                }
                                                onChange={(e) => {
                                                    if (e?.value === false) {
                                                        setInitialValues({
                                                            ...defaultValues,
                                                            isSingle: false,
                                                            platformVariables: {
                                                                returnPeriod: userDetails.user?.defaultPlatformVariables?.returnPeriod
                                                                    || platformVariables.returnPeriod,
                                                                restockingFees: {
                                                                    percentage: userDetails.user?.defaultPlatformVariables?.restockingFees?.percentage
                                                                        || platformVariables?.restockingFees?.percentage,
                                                                    amount: userDetails.user?.defaultPlatformVariables?.restockingFees?.amount
                                                                        || platformVariables?.restockingFees?.amount
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        setInitialValues({
                                                           ... defaultValues,
                                                            title: "",
                                                            description: "",
                                                            isSingle: true,
                                                            platformVariables: {
                                                                returnPeriod: userDetails.user?.defaultPlatformVariables?.returnPeriod
                                                                    || platformVariables.returnPeriod,
                                                                restockingFees: {
                                                                    percentage: userDetails.user?.defaultPlatformVariables?.restockingFees?.percentage
                                                                        || platformVariables?.restockingFees?.percentage,
                                                                    amount: userDetails.user?.defaultPlatformVariables?.restockingFees?.amount
                                                                        || platformVariables?.restockingFees?.amount
                                                                }
                                                            }
                                                        });
                                                    }

                                                }}
                                            />                                            
                                        </div>
                                        {
                                            !values?.isSingle
                                            && <div>
                                                <div>
                                                    {
                                                        listInfoByView.listingItem?.map((res, idx) => <div key={idx} className="list-item-s">
                                                            {idx === 0 && <div className="primary-tag">Primary</div>}
                                                            <div>
                                                                <div className="title1 pointer my-0" onClick={() => { setSelectedIndex(idx); setIsEditItems(true); setSelectedListingItem(res); setAddItemModal(true) }}>{res.title}</div>
                                                                <div>{res.selectedModelName}</div>
                                                            </div>
                                                            <div className="aic">
                                                                <div className="text-right">
                                                                    <div>Price</div>
                                                                    <div className="title1 my-0">${res?.estimatedPrice ?? 0}</div>
                                                                </div>
                                                                {listInfoByView.listingItem.length > 1 && idx !== 0 && <div className="px-2 pl-4 pointer" onClick={() => showConfirmModal({ res, bundleItems: listInfoByView.listingItem })}>{<IcnTrashRed width="12px" fill="#111111" />}</div>}
                                                            </div>
                                                        </div>)
                                                    }
                                                    <div>
                                                    </div>
                                                </div>
                                                <div className="aic jcb full-w">
                                                    {listInfoByView.listingItem.length < 5 && <div className="addListingItem" onClick={() => { setAddItemModal(true); setSelectedListingItem(defaultValuesItems); setSelectedIndex(selectedIndex + 1); setIsEditItems(false) }}>
                                                        <PlusCircleIcon width={'20px'} /> {listInfoByView.listingItem.length > 0 ? "Add Secondary Item" : "Add Primary Item"}
                                                        
                                                    </div>}
                                                </div>
                                                {
                                                    ((listInfoByView.listingItem.length > 0 && listInfoByView.listingItem.length < 2) 
                                                    && <div className="invalid-feedback display-block">Please add at least one secondary item</div>)
                                                    || ((listInfoByView.listingItem.length < 1) 
                                                    && <div className="invalid-feedback display-block">Please add at least one primary item</div>)
                                                }

                                            </div>
                                        }
                                        {
                                            values?.isSingle
                                            && <div className="listing-field">
                                                <div className="form-hd">
                                                    <h2 className="item-head">Item Details</h2>
                                                </div>
                                                <Form.Group>
                                                    <Form.Label><h5 className="label-head">Title<sup>*</sup></h5></Form.Label>
                                                    <Form.Control
                                                        className={classNames("", { "in-valid": errors.title })}
                                                        type="text"
                                                        name="title"
                                                        value={values.title}
                                                        onChange={(e) => {
                                                            onChangeLimit("title", e.target.value, setFieldValue, 101);
                                                        }}
                                                        onBlur={(e) => onChangeTrim("title", e.target.value, setFieldValue)}
                                                        isInvalid={!!errors.title}
                                                    />
                                                  <p className="fild-caption">{values.title.length === 0 ?<div>(100 Characters Maximum, No HTML, Special Characters & All Caps)</div> 
                                                   : values.title.length <=100 ? <div >
                                                    <p style={{color:"#878B8E", fontSize:"14px"}}>{100 - values.title.length} Characters Left
                                                     No HTML, Special Characters & All Caps</p> 
                                                   </div> : ''}</p>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.title}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label><h5 className="label-head">Description<sup>*</sup></h5></Form.Label>
                                                    <Form.Control as="textarea" rows={3}
                                                        className={classNames("", { "in-valid": errors.description })}
                                                        name="description"
                                                        value={values.description}
                                                        onChange={(e) => {
                                                            onChangeLimit("description", e.target.value, setFieldValue, 1033);
                                                        }}
                                                        onBlur={(e) => onChangeTrim("description", e.target.value, setFieldValue)}
                                                        isInvalid={!!errors.description}
                                                    />
                                                    <p className="fild-caption">
                                                        {values.description.length === 0 ?<div>(1032 Characters Maximum, No HTML, Special Characters & All Caps) </div> : values.description.length <=1032 ? <div>
                                                      <p style={{color:"#878B8E", fontSize:"14px"}}>{1032 - values.description.length} Characters Left, No HTML, Special Characters & All Caps</p>
                                                        </div>: ''}</p>
                                                    
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.description}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label><h5 className="label-head">Category<sup>*</sup></h5></Form.Label>
                                                    <CustomDropdown {...{
                                                        data: (listOfCategory?.length && listOfCategory) || [],
                                                        bindKey: "displayName",
                                                        searchKeywords: "",
                                                        title: (!_.isEmpty(values.category) && getSelectedCategoryTitleBySid({ list: (listOfCategory?.length && listOfCategory) || [], sid: values.category }))
                                                            || values.selectedCategoryName
                                                            || "- Select Category -",
                                                        onSelect: async (data) => {
                                                            setFieldValue("category", data.sid)
                                                            await setFieldValue("selectedCategoryName", data.selectedOption);
                                                            setFieldTouched("selectedCategoryName", true);
                                                            setFieldValue("selectedMandatory", JSON.parse(data.mandatory));
                                                            // validate fire arm selection based upon category if firearm or not
                                                            setFieldValue("isFireArm", data.firearm);
                                                            setFieldValue("itemType", data.firearm ? GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM : GLOBAL_CONSTANTS.ITEM_TYPE.NOT_FIRE_ARM)
                                                        },
                                                        disabled: !_.isEmpty(listInfoByView.product?.trade_with_listing_type),
                                                        in_Valid: errors.selectedCategoryName
                                                    }} />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.selectedCategoryName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("condition")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Condition {values.selectedMandatory && values.selectedMandatory.includes("condition") && <sup>*</sup>}</h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfCondition?.length && listOfCondition) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.tcondition) && getSelectedOptionBySid({ list: (listOfCondition?.length && listOfCondition) || [], sid: values.tcondition }))
                                                                || values.selectedConditionName
                                                                || ` - Select Condition - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("tcondition", data.sid)
                                                                setFieldValue("selectedConditionName", data.name);
                                                            },
                                                            disabled: !_.isEmpty(listInfoByView.product?.trade_with_listing_type),
                                                            in_Valid: errors.selectedConditionName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedConditionName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("manufacturer")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Manufacturer{values.selectedMandatory && values.selectedMandatory.includes("manufacturer") && <sup>*</sup>}</h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfManufacturer?.length && listOfManufacturer) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.manufacturer) && getSelectedOptionBySid({ list: (listOfManufacturer?.length && listOfManufacturer) || [], sid: values.manufacturer }))
                                                                || values.selectedManufacturerName
                                                                || ` - Select Manufacturer - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("manufacturer", data.sid)
                                                                setFieldValue("selectedManufacturerName", data.name);
                                                            },
                                                            onAddList: (e) => {
                                                                let newManufatList = e.replace(/\s+/g, ' ').trim();
                                                                if (newManufatList.length > 2 && listOfManufacturer.some(r => r.name === newManufatList)) {
                                                                    setListOfManufacturer([...listOfManufacturer]);
                                                                } else if (newManufatList.length > 2) {
                                                                    addManufacturerList(newManufatList);
                                                                }
                                                            },
                                                            disabled: !_.isEmpty(listInfoByView.product?.trade_with_listing_type),
                                                            in_Valid: errors.selectedManufacturerName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedManufacturerName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("model")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Model{values.selectedMandatory && values.selectedMandatory.includes("model") && <sup>*</sup>}</h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfModel?.length && listOfModel) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.model) && getSelectedOptionBySid({ list: (listOfModel?.length && listOfModel) || [], sid: values.model }))
                                                                || values.selectedModelName
                                                                || ` - Select Model - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("model", data.sid)
                                                                setFieldValue("selectedModelName", data.name);
                                                            },
                                                            disabled: !_.isEmpty(listInfoByView.product?.trade_with_listing_type),
                                                            in_Valid: errors.selectedModelName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedModelName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("caliber")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Caliber{values.selectedMandatory && values.selectedMandatory.includes("caliber") && <sup>*</sup>}</h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfCaliber?.length && listOfCaliber) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.caliber) && getSelectedOptionBySid({ list: (listOfCaliber?.length && listOfCaliber) || [], sid: values.caliber }))
                                                                || values.selectedCaliberName
                                                                || ` - Select Caliber - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("caliber", data.sid)
                                                                setFieldValue("selectedCaliberName", data.name);
                                                            },
                                                            in_Valid: errors.selectedCaliberName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedCaliberName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("capacity")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Capacity{values.selectedMandatory && values.selectedMandatory.includes("capacity") 
                                                        // && <sup>*</sup>
                                                        }</h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfCapacity?.length && listOfCapacity) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.capacity) && getSelectedOptionBySid({ list: (listOfCapacity?.length && listOfCapacity) || [], sid: values.capacity }))
                                                                || values.selectedCapacityName
                                                                || ` - Select Capacity - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("capacity", data.sid)
                                                                setFieldValue("selectedCapacityName", data.name);
                                                            },
                                                            in_Valid: errors.selectedCapacityName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedCapacityName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("barrel length")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Barrel Length{values.selectedMandatory && values.selectedMandatory.includes("barrel length")
                                                        //  && <sup>*</sup>
                                                         }
                                                         </h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfBarrelLength?.length && listOfBarrelLength) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.barrelLength) && getSelectedOptionBySid({ list: (listOfBarrelLength?.length && listOfBarrelLength) || [], sid: values.barrelLength }))
                                                                || values.selectedBarrelName
                                                                || ` - Select Barrel Length - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("barrelLength", data.sid)
                                                                setFieldValue("selectedBarrelName", data.name);
                                                            },
                                                            in_Valid: errors.selectedBarrelName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedBarrelName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("frame finish")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Frame Finish{values.selectedMandatory && values.selectedMandatory.includes("frame finish")
                                                        //  && <sup>*</sup>
                                                         }</h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfFrameFinish?.length && listOfFrameFinish) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.frameFinish) && getSelectedOptionBySid({ list: (listOfFrameFinish?.length && listOfFrameFinish) || [], sid: values.frameFinish }))
                                                                || values.selectedFrameName
                                                                || ` - Select Frame Finish - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("frameFinish", data.sid)
                                                                setFieldValue("selectedFrameName", data.name);
                                                            },
                                                            in_Valid: errors.selectedFrameName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedFrameName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                                {
                                                    values.selectedMandatory
                                                    && values.selectedMandatory.includes("grips")
                                                    && <Form.Group>
                                                        <Form.Label><h5 className="label-head">Grips{values.selectedMandatory && values.selectedMandatory.includes("grips") 
                                                        // && <sup>*</sup>
                                                        }</h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: (listOfGrips?.length && listOfGrips) || [],
                                                            bindKey: "name",
                                                            searchKeywords: "",
                                                            title: (!_.isEmpty(values.grips) && getSelectedOptionBySid({ list: (listOfGrips?.length && listOfGrips) || [], sid: values.grips }))
                                                                || values.selectedGripsName
                                                                || ` - Select Grips - `,
                                                            onSelect: (data) => {
                                                                setFieldValue("grips", data.sid)
                                                                setFieldValue("selectedGripsName", data.name);
                                                            },
                                                            in_Valid: errors.selectedGripsName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.selectedGripsName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className="second-form-part">
                                    <div className="form-group ePrice text-left">
                                        <div className="form-hd">
                                            <h2 className="item-head">Listing Details</h2>
                                        </div>
                                    </div>
                                    {/* Quantity Selection for dealer only */}
                                    {
                                        (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER 
                                        || userDetails.user.adminToFFlStore) 
                                        && <div className="pt10 row">
                                            <div className="col-4">
                                                <Form.Group>
                                                    <h5 className="label-head">{"Quantity(Qty.)"}<sup>*</sup></h5>
                                                    <Field
                                                        name="quantity"
                                                        className={classNames("form-control form-control-sm", { "in-valid": errors.quantity })}
                                                        onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                        onKeyUp={() => {
                                                            if (values.auction && values.quantity > 1) setFieldValue("auction", false);
                                                            if (values.trade && values.quantity > 1) setFieldValue("trade", false);
                                                        }}
                                                    />
                                                    <ErrorMessage component="span" name="quantity" className="text-danger mb-2 small-text d-flex" />
                                                </Form.Group>
                                            </div>
                                        </div>
                                    }
                                    <div className="form-group magic-box pb20">
                                        <h5 className="label-head">Listing Type<sup>*</sup></h5>
                                        {/* sell / instant buy */}
                                        <div className="form-group instant-buy">
                                            <Form.Group id="tradeSellAuction" className="">
                                                <Form.Check id="instant-buy-check" onChange={handleChange} onBlur={handleBlur} checked={values.sell} disabled={values.tradeWith === 'specific'} type="checkbox" name="sell" label="Instant Buy" />
                                            </Form.Group>
                                            {
                                                values.sell &&
                                                <>
                                                    <div className="row">
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-8">
                                                            <div className="jcb pl40 aic">
                                                                <div className="mr20 flx1 col111 mw100px">Price<sup className="mandatory">*</sup></div>
                                                                <div className="flx2">
                                                                    <Form.Control
                                                                        className={classNames("dollarSign", { "in-valid": errors.price })}
                                                                        disabled={!values.isSingle}
                                                                        type="text"
                                                                        name="price"
                                                                        onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                        value={values.isSingle ? values.price : totalListPrice}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        isInvalid={errors.price}
                                                                    />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.price}
                                                                    </Form.Control.Feedback>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row mb20">
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-8">
                                                        <div className="jcb aic pl40">
                                                            <div className="pr25 flx1 col111 mw100px">Instant Expires In</div>
                                                            <div className="aic flx2">
                                                                <Form.Control
                                                                    size="sm"
                                                                    id="auctionExpriesIn"
                                                                    className="tradeExpriesSelection retunable-inp max-w100px form-control form-control-sm col-7 col-sm-5 col-md-8"
                                                                    as="select"
                                                                    name="sellExpiresOn"
                                                                    value={values.sellExpiresOn}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                >
                                                                    {expriesOption.map((list, index) => {
                                                                        return <option key={list.id} value={list.id}>{list.name}</option>
                                                                    })}
                                                                </Form.Control>
                                                                <span className="pl10">Days</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                </>
                                            }
                                        </div>
                                        {/* trade */}
                                        <div className="form-group trade-listing">
                                            <Form.Group id="tradeSellAuction" className="">
                                                <div className="jcb mb20 col-12 col-md-6 col-lg-8 px-0">
                                                    <Form.Check
                                                        id="trade-check"
                                                        onChange={((e) => {
                                                            setFieldValue("trade", e.target.checked);
                                                            setFieldValue("auction", false);
                                                        })}
                                                        onBlur={handleBlur}
                                                        type="radio"
                                                        checked={values.trade}
                                                        name="trade"
                                                        label="Trade"
                                                        disabled={(userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) && values.quantity > 1}
                                                    />
                                                    <div className="col-8 col-md-6 col-lg-8">
                                                        {
                                                            values.trade && <Form.Control id="tradeWidth" as="select"
                                                                name="tradeWith"
                                                                value={values.tradeWith}
                                                                disabled={!values.trade}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                            >
                                                                {listOfTradeWith.map((list, index) => {
                                                                    return <option key={list.id} value={list.id}>{list.name}</option>
                                                                })}
                                                            </Form.Control>
                                                        }
                                                    </div>

                                                </div>
                                            </Form.Group>
                                            {
                                                values.trade && <>
                                                    <div className="row">
                                                        <div className="col-12 col-sm-12 col-md-6 col-lg-8">
                                                            <div className="jcb pl40 aic">
                                                                <div className="mr20 flx1 col111 pr10 mw100px">Trade Value<sup className="mandatory">*</sup></div>
                                                                <div className="flx2">
                                                                    <Form.Control
                                                                        className={classNames("dollarSign", { "in-valid": errors.tradeReservePrice })}
                                                                        disabled={!values.isSingle}
                                                                        type="text"
                                                                        name="tradeReservePrice"
                                                                        onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                        value={values.isSingle ? values.tradeReservePrice : totalListPrice}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        isInvalid={errors.tradeReservePrice}
                                                                    />
                                                                    
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.tradeReservePrice}
                                                                    </Form.Control.Feedback>
                                                                    

                                                                   
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group pl40">
                                                        <div className="row">
                                                            <div className="col-12 col-sm-12 col-md-6 col-lg-8">
                                                                <div className="jcb aic mt10">
                                                                    <div className="pr25 flx1 col111 mw100px">Trade Expires In</div>
                                                                    <div className="aic flx2">
                                                                        <Form.Control
                                                                            size="sm"
                                                                            id="tradeExpriesIn"
                                                                            className="tradeExpriesSelection retunable-inp max-w100px col-7 col-sm-5 col-md-8"
                                                                            as="select"
                                                                            name="tradeExpiresOn"
                                                                            value={values.tradeExpiresOn}
                                                                            onChange={handleChange}
                                                                            onBlur={handleBlur}
                                                                        >
                                                                            {expriesOption.map((list, index) => {
                                                                                return <option key={list.id} value={list.id}>{list.name}</option>
                                                                            })}
                                                                        </Form.Control>
                                                                        <span className="pl10">Days</span>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                        {values.tradeWith === 'specific' &&
                                                            <div className="row mt-1">
                                                                {
                                                                    _.isEmpty(selectedSpecificListing) &&
                                                                    <div className="p-3 add-new-specific-listing">
                                                                        <a className="specific-trade-add-btn" data-signin="addcard" onClick={() => { setListingModel(true) }}>Define Trade Specifications<sup className="mandatory">*</sup></a>
                                                                    </div>
                                                                }
                                                                {
                                                                    values.tradeWith === 'specific'
                                                                    && _.isEmpty(selectedSpecificListing)
                                                                    && <div className="invalid-feedback display-block pl40 ml10">Please define trade specification</div>
                                                                }
                                                                {
                                                                    !_.isEmpty(selectedSpecificListing) && <div className="col-12">
                                                                        <SpecificTrade {... { selectedSpecificListing, setListingModel }} />
                                                                    </div>
                                                                }
                                                            </div>
                                                        }
                                                        {values.tradeWith === 'specific' && <p className="fild-caption mt-3 mb-2" style={{ color: "#6c757d" }}>Note: When you want to trade this with a specific item, you will not be able to instantly sell or auction this item, You can only trade</p>}
                                                    </div>
                                                </>
                                            }
                                        </div>
                                        {/* bid */}
                                        <div className="form-group bid-listing">
                                            <Form.Group id="tradeSellAuction" className="tradeWithBlock">
                                                <Form.Check
                                                    id="bid-check"
                                                    onChange={((e) => {
                                                        setFieldValue("auction", e.target.checked);
                                                        setFieldValue("trade", false);
                                                    })}
                                                    onBlur={handleBlur}
                                                    checked={values.auction}
                                                    type="radio"
                                                    name="auction"
                                                    label={<div className={listInfoByView.isFromTrade ? "cp-none" : "cp"}>Bid</div>}
                                                    disabled={(userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) && values.quantity > 1 || listInfoByView.isFromTrade || values.tradeWith === 'specific' }
                                                />
                                            </Form.Group>
                                            {((values.auction && !_.isArray(values.auction)) || (_.isArray(values.auction) && !_.isEmpty(values.auction))) && <>
                                                <div className="row mb20">
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-8">
                                                        <div className="jcb pl40 aic">
                                                            <div className="mr20 flx1 col111 mw100px">Reserve Price<sup className="mandatory">*</sup></div>
                                                            <div className="flx2">
                                                                <Form.Control
                                                                    className={classNames("dollarSign", { "in-valid": errors.auctionReservePrice })}
                                                                    type="text"
                                                                    name="auctionReservePrice"
                                                                    onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                    value={values.auctionReservePrice}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                    isInvalid={errors.auctionReservePrice}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.auctionReservePrice}
                                                                </Form.Control.Feedback>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mb20">
                                                    <div className="col-12 col-sm-12 col-md-6 col-lg-8">
                                                        <div className="jcb aic pl40">
                                                            <div className="pr25 flx1 col111 mw100px">Auction Expires In</div>
                                                            <div className="aic flx2">
                                                                <Form.Control
                                                                    size="sm"
                                                                    id="auctionExpriesIn"
                                                                    className="tradeExpriesSelection retunable-inp max-w100px form-control form-control-sm col-7 col-sm-5 col-md-8"
                                                                    as="select"
                                                                    name="auctionExpireOn"
                                                                    value={values.auctionExpireOn}
                                                                    onChange={handleChange}
                                                                    onBlur={handleBlur}
                                                                >
                                                                    {expriesOption.map((list, index) => {
                                                                        return <option key={list.id} value={list.id}>{list.name}</option>
                                                                    })}
                                                                </Form.Control>
                                                                <span className="pl10">Days</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                            }
                                        </div>
                                        {(!values.trade && !values.sell && !values.auction) && <div className="invalid-feedback display-block">Please select at least one for listing type</div>}
                                        <div className="row">
                                            <span
                                                className={`col-1 pointer mx-0 ${values.sell || values.trade || values.auction ? "text-danger" : "col111"}`}
                                                onClick={() => {
                                                    setFieldValue("trade", false);
                                                    setFieldValue("auction", false);
                                                    setFieldValue("sell", false);
                                                    setFieldValue("price", '');
                                                    setFieldValue("tradeReservePrice", '');
                                                    setFieldValue("auctionReservePrice", 0);
                                                }}
                                            >Reset</span>
                                        </div>
                                        <div className="row">
                                            <div className="col-12 text-muted f10">Note: Single item can be listed either only for trade or bid along with instant buy</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Item type - firearms  or not, or pre 1968 */}
                                {
                                    values?.isSingle
                                    && <div className="third-form-part">
                                        <div className="form-group magic-box text-left pb20">
                                            <h2 className="item-head pb-3">Item Type</h2>
                                            <Form.Group>
                                                <Form.Check
                                                    id="notFireArm"
                                                    type="radio"
                                                    name="itemType"
                                                    value={GLOBAL_CONSTANTS.ITEM_TYPE.NOT_FIRE_ARM}
                                                    checked={values.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.NOT_FIRE_ARM}
                                                    label="This item is not a Firearm"
                                                    onChange={(e) => { setFieldValue("itemType", e.target.value); }}
                                                    disabled={values?.isFireArm ? values.isFireArm : false}
                                                />
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Check
                                                    id="fireArm"
                                                    type="radio"
                                                    name="itemType"
                                                    value={GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM}
                                                    checked={values.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM}
                                                    label="This item is a Firearm with Serial Number"
                                                    onChange={(e) => { setFieldValue("itemType", e.target.value); }}
                                                />
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Check
                                                    id="pre-1968"
                                                    type="radio"
                                                    name="itemType"
                                                    value={GLOBAL_CONSTANTS.ITEM_TYPE.PRE_1968}
                                                    checked={values.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.PRE_1968}
                                                    label="This item is a pre 1968 model"
                                                    onChange={(e) => { setFieldValue("itemType", e.target.value); }}
                                                />
                                            </Form.Group>
                                            {
                                                values.itemType !== GLOBAL_CONSTANTS.ITEM_TYPE.NOT_FIRE_ARM
                                                && userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore
                                                && <Form.Group className="pt10">
                                                    <Form.Label className="p-0"><h5 className="label-head">{"Serial Number(s)"} {values.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && <sup>*</sup>}</h5></Form.Label>
                                                    <Form.Control
                                                        className={classNames("", { "in-valid": errors.serialNumber })}
                                                        type="text"
                                                        name="serialNumber"
                                                        value={values.serialNumber}
                                                        onChange={(e) => {
                                                           let a= e.target.value.replace(/\s+/g, ' ').trim();
                                                           setFieldValue("serialNumber", a);
                                                        }}
                                                        onBlur={(e) => {
                                                            handleBlur(e);
                                                            e.target.value
                                                                ? isValidSerialNumberFn(e.target.value)
                                                                : setIsValidSerialNumber(true);
                                                        }}
                                                        isInvalid={!!errors.serialNumber}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.serialNumber}
                                                    </Form.Control.Feedback>
                                                    {!isValidSerialNumber && !values.itemType && !_.isEmpty(values.serialNumber) && <div class="invalid-feedback display-block">Invalid Serial Number</div>}
                                                </Form.Group>
                                            }
                                        </div>
                                    </div>
                                }

                                {/* Pickup Location - set preferred location - FFL Store, Sherif's Office and other location */}
                                <div className="third-form-part">
                                    <div className="form-group magic-box text-left pb20">
                                        <h2 className="item-head pb-3">Pickup Location</h2>
                                        {
                                            userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore
                                            && <>
                                                <Form.Group>
                                                    <Form.Label className="p-0"><h5 className="label-head">My Preferred Distance</h5></Form.Label>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="100"
                                                        value={distance}
                                                        className={"rangeslider"}
                                                        id="listingPreferredDistance"
                                                        onChange={e => {
                                                            setDistance(e.target.value);
                                                        }}
                                                        onMouseUp={() => getFflStoreListByPrefferredDistance(distance, setFieldValue)}
                                                        onKeyUp={() => getFflStoreListByPrefferredDistance(distance, setFieldValue)}
                                                    />
                                                    <p class="range-btext">{`Within ${distance} miles`}</p>
                                                </Form.Group>
                                                <Form.Group className="">
                                                    <Form.Check
                                                        id="ship-beyond-preferred-distance"
                                                        onChange={(e) => setFieldValue("shipBeyondPreferredDistance", e.target.checked)}
                                                        checked={values.shipBeyondPreferredDistance}
                                                        onBlur={handleBlur}
                                                        type="checkbox"
                                                        name="shipBeyondPreferredDistance"
                                                        label="Willing to ship beyond the preferred distance"
                                                    />
                                                    {
                                                        values.shipBeyondPreferredDistance
                                                        && <div className="pl40 pt10">
                                                            <Form.Group>
                                                                <Form.Check
                                                                    id="fixed-shipping-fee"
                                                                    className="aic"
                                                                    type="radio"
                                                                    name="shippingFeesLocationBased"
                                                                    value={values.shippingFeesLocationBased}
                                                                    checked={values.shippingFeesLocationBased === false}
                                                                    label={<div className="aic">
                                                                        <span className="mr5">{"Fixed Shipping Fees of $"}{(!values.shippingFeesLocationBased && !values.shippingFree) && <sup className="mandatory">*</sup>}</span>
                                                                        <span>
                                                                            <Field 
                                                                                name="fixedSippingFees" 
                                                                                disabled={values.shippingFeesLocationBased || values.shippingFree} 
                                                                                className={classNames("form-control form-control-sm", {"in-valid": errors.fixedSippingFees && values.shippingFeesLocationBased !== null && !values.shippingFeesLocationBased, "disabledfess": values.shippingFeesLocationBased})}
                                                                            />
                                                                            {
                                                                                !values.shippingFeesLocationBased
                                                                                && <ErrorMessage component="div" name="fixedSippingFees" className="text-danger mb-2 small-text pt3" />
                                                                            }
                                                                        </span>
                                                                    </div>}
                                                                    onChange={(e) => {
                                                                        setFieldValue("shippingFeesLocationBased", false);
                                                                        setFieldValue("shippingFree", false);
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check
                                                                    id="actual-shipping-fee"
                                                                    className="aic"
                                                                    type="radio"
                                                                    name="shippingFeesLocationBased"
                                                                    value={values.shippingFeesLocationBased}
                                                                    checked={values.shippingFeesLocationBased === true}
                                                                    label={<div className="f12">Shipping fees actuals based on location</div>}
                                                                    onChange={(e) => {
                                                                        setFieldValue("shippingFeesLocationBased", true);
                                                                        setFieldValue("fixedSippingFees","");
                                                                        setFieldValue("shippingFree", false);
                                                                        
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <Form.Check
                                                                    id="shipping-free"
                                                                    className="aic"
                                                                    type="radio"
                                                                    name="shippingFree"
                                                                    value={values.shippingFree}
                                                                    checked={values.shippingFree}
                                                                    label={<div className="f12">Free Shipping Fees</div>}
                                                                    onChange={(e) => {
                                                                        setFieldValue("shippingFree", e.target.checked)
                                                                        setFieldValue("fixedSippingFees","");
                                                                        setFieldValue("shippingFeesLocationBased", e.target.checked ? null : false);
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    }
                                                </Form.Group>
                                            </>
                                        }


                                        <div>
                                            {
                                                (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER
                                                || userDetails.user.adminToFFlStore)
                                                && <div className="pt10">
                                                    <Form.Label className="px-0 m-0"><h5 className="label-head">Shipping Fees<sup>*</sup></h5></Form.Label>
                                                    <Form.Group>
                                                        <Form.Check
                                                            id="fixed-shipping-fee"
                                                            className="aic"
                                                            type="radio"
                                                            name="shippingFeesLocationBased"
                                                            value={values.shippingFeesLocationBased}
                                                            checked={values.shippingFeesLocationBased === false}
                                                            label={<div className="aic">
                                                                <span className="mr5">{"Fixed Shipping Fee of "}{(!values.shippingFeesLocationBased && !values.shippingFree) && <sup className="mandatory">*</sup>}</span>
                                                                <span >
                                                                    <Field 
                                                                        name="fixedSippingFees" 
                                                                        disabled={values.shippingFeesLocationBased || values.shippingFree} 
                                                                        className={classNames("form-control form-control-sm", {"in-valid": errors.fixedSippingFees && values.shippingFeesLocationBased !== null && !values.shippingFeesLocationBased, "disabledfess": values.shippingFeesLocationBased})} 
                                                                    />
                                                                    {
                                                                        !values.shippingFeesLocationBased
                                                                        && <ErrorMessage component="div" name="fixedSippingFees" className="text-danger mb-2 small-text pt3" />
                                                                    }
                                                                    
                                                                </span>
                                                            </div>}
                                                            onChange={(e) => {
                                                                setFieldValue("shippingFeesLocationBased", false);
                                                                setFieldValue("shippingFree", false);
                                                            }}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Check
                                                            id="actual-shipping-fee"
                                                            className="aic"
                                                            type="radio"
                                                            name="shippingFeesLocationBased"
                                                            value={values.shippingFeesLocationBased}
                                                            checked={values.shippingFeesLocationBased === true}
                                                            label={<div className="f12">Shipping fee actuals based on location</div>}
                                                            onChange={(e) => {
                                                                setFieldValue("shippingFeesLocationBased", true);
                                                                setFieldValue("fixedSippingFees","");
                                                                setFieldValue("shippingFree", false);
                                                            }}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Check
                                                            id="shipping-free"
                                                            className="aic"
                                                            type="radio"
                                                            name="shippingFree"
                                                            value={values.shippingFree}
                                                            checked={values.shippingFree}
                                                            label={<div className="f12">Free Shipping Fees</div>}
                                                            onChange={(e) => {
                                                                setFieldValue("shippingFree", e.target.checked);
                                                                setFieldValue("fixedSippingFees","");
                                                                setFieldValue("shippingFeesLocationBased", e.target.checked ? null : false);
                                                            }}
                                                        />
                                                    </Form.Group>
                                                </div>
                                            }
                                        </div>

                                        <div className="pt20">
                                            <Form.Label className="p-0"><h5 className="label-head">Item will be available for the buyer at...<sup>*</sup></h5></Form.Label>
                                        </div>
                                        {
                                            userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER
                                            || userDetails.user.adminToFFlStore
                                                ? <>
                                                    <Form.Group>
                                                        <Form.Label className="px-0"><h5 className="label-head">{"Select from My Store(s)"}<sup>*</sup></h5></Form.Label>
                                                        <CustomDropdown {...{
                                                            data: !_.isEmpty(myStoreList) && myStoreList ? myStoreList : [],
                                                            bindKey: "name",
                                                            multiKey: "premiseCity",
                                                            multiKey1: "premiseState",
                                                            searchKeywords: "",
                                                            title: `${values?.fflStoreLocation?.name ? `${values?.fflStoreLocation?.name}, ${values?.fflStoreLocation?.premiseCity}, ${values?.fflStoreLocation?.premiseState}` : " - Select FFL Store - "}`,
                                                            onSelect: (data) => {
                                                                setFieldValue("isExpired", data.licenseExpired);
                                                                setListInfoByView({ ...listInfoByView, "location": { ...listInfoByView.location, "lat": data.latitude, "lng": data.longitude } });
                                                                setFieldValue("selectedStore", data);
                                                                setFieldValue("fflStoreLocation", data);
                                                                setFieldValue("selectedDealerStoreName", data.name)
                                                            },
                                                            noRecordMessage: "There are no FFL stores in the selected location",
                                                            in_Valid: errors.selectedDealerStoreName
                                                        }} />
                                                        <Form.Control.Feedback type="invalid text-danger f12 ">
                                                            {errors.selectedDealerStoreName}
                                                        </Form.Control.Feedback>
                                                        {values.isExpired && <div className="text-danger f12">This store has expired. You will not be able to list any item. Please request for renewal from My Store.</div>}
                                                    </Form.Group>
                                                </>
                                                : <>
                                                    <Form.Group>
                                                        <Field name="fflStoreEnabled">
                                                            {({ field, form: { touched, errors }, meta }) => (
                                                                <Form.Check
                                                                    id="ffl-store-check"
                                                                    checked={values.fflStoreEnabled}
                                                                    type="checkbox"
                                                                    label="FFL Store"
                                                                    {...field}
                                                                />
                                                            )}
                                                        </Field>
                                                        {
                                                            values.fflStoreEnabled
                                                            && <div className="pl40 pt10">
                                                                <Form.Group>
                                                                    <Form.Label className="px-0"><h5 className="label-head">Preferred FFL<sup className="">*</sup></h5></Form.Label>
                                                                    <CustomDropdown {...{
                                                                        data: Array.isArray(fflStoreList) ? fflStoreList : [],
                                                                        bindKey: "storeName",
                                                                        multiKey: "licHolderName",
                                                                        multiKey1: "premCity",
                                                                        multiKey2: "premState",
                                                                        multipleKeys: ["storeName","licHolderName", "premCity", "premState"],
                                                                        title: `${(values?.fflStoreLocation?.storeName || values?.fflStoreLocation?.licHolderName) ? `${values?.fflStoreLocation?.storeName ? values?.fflStoreLocation?.storeName + ", " : ""} ${values?.fflStoreLocation?.licHolderName || ""}, ${values?.fflStoreLocation?.premCity || ""}, ${values?.fflStoreLocation?.premState || ""}` : " - Select FFL Store - "}`,
                                                                        searchKeywords: "",
                                                                        onSelect: (data) => {
                                                                            setFieldValue("fflStoreLocation", data);
                                                                            setSelectedFfl(data);
                                                                        },
                                                                        noRecordMessage: "There are no FFL stores in the selected location",
                                                                        in_Valid: errors.fflStoreLocation
                                                                    }} />
                                                                    <Form.Control.Feedback type="invalid  f12 text-danger ">
                                                                        {errors.fflStoreLocation}
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </div>
                                                        }
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Field name="sheriffOfficeEnabled">
                                                            {({ field, form: { touched, errors }, meta }) => (
                                                                <Form.Check
                                                                    id="sherriff-office-check"
                                                                    checked={values.sheriffOfficeEnabled}
                                                                    type="checkbox"
                                                                    label="Sherriff's Office"
                                                                    {...field}
                                                                />
                                                            )}
                                                        </Field>
                                                        {
                                                            values.sheriffOfficeEnabled
                                                            && <div className="pl40 pt10">
                                                                <Form.Group>
                                                                    <Form.Label className="px-0"><h5 className="label-head">Sherriff's Office<sup className="">*</sup></h5></Form.Label>
                                                                    <CustomDropdown {...{
                                                                        data: Array.isArray(listOfSheriffLocation) ? listOfSheriffLocation : [],
                                                                        bindKey: "freeformAddress",
                                                                        searchKeywords: "",
                                                                        title: selectedSherriffOffice?.freeformAddress || values?.sheriffOfficeLocation?.freeformAddress || ` - Select Sherriff's Office - `,
                                                                        onSelect: (data) => {
                                                                            setSelectedSherriffOffice(data);
                                                                            setFieldValue("sheriffOfficeLocation", data);
                                                                        },
                                                                        noRecordMessage: "There are no sherriff's office in the selected location",
                                                                        in_Valid: errors.sheriffOfficeLocation
                                                                    }} />
                                                                    <Form.Control.Feedback type="invalid text-danger f12 ">
                                                                        {errors.sheriffOfficeLocation}
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </div>
                                                        }
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Field name="availableOtherLocation">
                                                            {({ field, form: { touched, errors }, meta }) => (
                                                                <Form.Check
                                                                    id="any-other-location-check"
                                                                    checked={values.availableOtherLocation}
                                                                    type="checkbox"
                                                                    label="Any Other Location"
                                                                    {...field}
                                                                />
                                                            )}
                                                        </Field>
                                                        {
                                                            values.availableOtherLocation
                                                            && <div className="pl40 pt10">
                                                                <Form.Group>
                                                                    <Form.Label className="px-0"><h5 className="label-head">Location<sup className="">*</sup></h5></Form.Label>
                                                                    <input
                                                                        type="text"
                                                                        name="googleLocation"
                                                                        ref={anyOtherlocationRef}
                                                                        id="otherLocationID"
                                                                        onChange={(e) => setAnyOtherLocation(e.target.value)}
                                                                        className={classNames("form-control", { "in-valid": errors.googleLocation })}
                                                                        placeholder={"Search any other location..."}
                                                                        onBlur={handleChange}
                                                                    />
                                                                    {
                                                                        <Form.Control.Feedback type="invalid text-danger f12 ">
                                                                            {errors.googleLocation}
                                                                        </Form.Control.Feedback>}
                                                                </Form.Group>
                                                            </div>
                                                        }
                                                    </Form.Group>
                                                </>}
                                        {(!values.fflStoreEnabled && !values.sheriffOfficeEnabled && !values.availableOtherLocation) && userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore && <div className="invalid-feedback display-block">Please select at least one for location</div>}
                                    </div>
                                </div>

                                <div className="third-form-part">
                                    <div className="form-group magic-box text-left pb20">
                                        <h2 className="item-head pb-3">Return Policy</h2>
                                        <Form.Group>
                                            <Form.Check
                                                id="returnable"
                                                type="checkbox"
                                                checked={values.returnable}
                                                name="returnable"
                                                label="Eligible for return"
                                                onChange={(e) => { setFieldValue("returnable", e.target.checked) }}
                                            />
                                        </Form.Group>
                                        {
                                            !_.isEmpty(platformVariables)
                                            && values.returnable
                                            && <div className="pl40 f12 ml5 col111">
                                                <div className="mb20 aic">
                                                    <span className="mr20">Return Period<sup className="mandatory">*</sup></span>
                                                    <span className="mw50px">
                                                        <Field name="platformVariables.returnPeriod"
                                                            type="number"
                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                            validate={validateReturnPeriod}
                                                            className={classNames("form-control form-control-sm px10 returnable-input retunable-inp p-rel", { "in-valid": errors.platformVariables?.returnPeriod })} />
                                                        <span className="return-period-err"><ErrorMessage component="span" name="platformVariables.returnPeriod" className="text-danger mb-2 small-text float-left" /></span>
                                                    </span>
                                                    <span>Days from delivery</span>
                                                </div>
                                                <span className="aic pb20">
                                                    <div className="aic">
                                                        <span className="mr10 mw80px">{"Restocking Fees"}<sup className="mandatory">*</sup></span>
                                                        <span className="mw50px">
                                                            <Field name="platformVariables.restockingFees.percentage"
                                                                type="number"
                                                                onKeyDown={e => e.keyCode === 69 && e.preventDefault()}
                                                                validate={validateReturnPeriod}
                                                                className={classNames("form-control form-control-sm px10 retunable-inp p-rel", { "in-valid": errors?.platformVariables?.restockingFees?.percentage })}
                                                                />
                                                        </span>
                                                        <div className="return-percentage-err"><ErrorMessage component="span" name="platformVariables.restockingFees.percentage" className="text-danger mb-2 small-text float-left" /></div>
                                                    </div>
                                                    <div className="aic">
                                                        <span className="pl5 mw50px"> % or $</span>
                                                        <span className="mr10 mw75px">
                                                            <Field name="platformVariables.restockingFees.amount"
                                                                type="number"
                                                                onKeyDown={e => e.keyCode === 69 && e.preventDefault()}
                                                                validate={validateReturnPeriod}
                                                                className={classNames("form-control form-control-sm px10 retunable-inp p-rel", { "in-valid": errors?.platformVariables?.restockingFees?.amount })}
                                                            /></span>
                                                        <div className="return-dollal-err"><ErrorMessage component="span" name="platformVariables.restockingFees.amount" className="text-danger mb-2 small-text float-left" /></div>
                                                        <span className="col-12 px-0 mobile-off">{"of the item's cost whichever higher"}</span>
                                                    </div>
                                                </span>
                                                <div className="col-12 px-0 desktop-off">{"of the item's cost whichever higher"}</div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="text-center mobile-off">
                                    {
                                        (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore)
                                        ? <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => { onCancelStep(tempListingInfoRef) }}></input>
                                        : <>
                                            <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => { onCancelStep(tempListingInfoRef) }}></input>
                                        </>
                                    }
                                    <input
                                        onClick={handleSubmit}
                                        disabled={handleFormValidation(isSubmitting, isValid, dirty, values) || (!values.isSingle && listInfoByView.listingItem.length <= 1)}
                                        type="button"
                                        name="next"
                                        className="next action-button nextBtn"
                                        value="Next"
                                    />
                                </div>
                                <section class="mobile-btn-section desktop-off">
                                    <div class="container">
                                        <div class="row">
                                            <div class="col-lg-12">
                                                <div class="proPg-btnArea">
                                                    <ul>
                                                        {
                                                            (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore)
                                                            ? <li onClick={() => onCancelStep(tempListingInfoRef)}><a class="submt-btn submt-btn-lignt mr10">Cancel</a></li>
                                                            : <>
                                                                <li onClick={() => onCancelStep(tempListingInfoRef)}><a class="submt-btn submt-btn-lignt mr10">Cancel</a></li>
                                                            </>
                                                        }
                                                        <li onClick={handleSubmit}>
                                                            <a
                                                                disabled={handleFormValidation(isSubmitting, isValid, dirty, values) || (!values.isSingle && listInfoByView.listingItem.length <= 1)}
                                                                class="submt-btn submt-btn-dark"
                                                            >Next</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
        {addItemModal && <AddListingItems {...{ addItemModal, setAddItemModal, listingItem, setListingItem, selectedListingItem, defaultValues: defaultValuesItems, selectedIndex, isEditItems, setIsEditItems, listInfoByView, setListInfoByView }} />}
        {listingModel && <FilterListing {...{ listingModel, setListingModel, setListingValues, selectedSpecificListing }} />}
        {ConfirmationComponent}
    </fieldset>)
}

export default memo(ListingInfo)