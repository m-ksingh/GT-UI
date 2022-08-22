import React, { useState, useEffect, useContext, memo } from "react";
import { useHistory } from 'react-router-dom';
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import { Form } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import FormikCotext from '../Shared/FormikContext';
import { extractCategoryList, getSelectedCategoryTitleBySid, getSelectedOptionBySid } from "../../services/CommonServices";
import GLOBAL_CONSTANTS from "../../Constants/GlobalConstants";
import CustomDropdown from "../Shared/CustomDropdown/CustomDropdown";
import { ListingContext } from "./Context/ListingContext";
import { useAuthState } from '../../contexts/AuthContext/context';
import useToast from "../../commons/ToastHook";
import Spinner from "rct-tpt-spnr";
import classNames from "classnames";
import './listing.css'


function AddListingItems({
    listingItem,
    setListingItem,
    setAddItemModal,
    selectedListingItem,
    defaultValues,
    selectedIndex,
    isEditItems,
    listInfoByView,
    setListInfoByView
}) {
    const userDetails = useAuthState();
    const [initialValues, setInitialValues] = useState((!_.isEmpty(selectedListingItem) && selectedListingItem) || defaultValues);
    const { setBundleItems } = useContext(ListingContext)
    const Toast = useToast();
    const spinner = useContext(Spinner);


    const schema = Yup.object().shape({
        title: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(100, "Maximum 100 Characters Allowed")
            .required("Required!"),
        description: Yup.string()
            .required("Required!")
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "Maximum 1032 Characters Allowed"),
        //estimatedPrice: Yup.number().required("Required!"),
        selectedCategoryName: Yup.string().required("Required!"),
        selectedConditionName: Yup.string().when('selectedMandatory', {
            is: (val) => val && val.includes("condition"),
            then: Yup.string().required("Required!"),
            otherwise: Yup.string(),
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
        // selectedBarrelName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("barrel length"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string(),
        // }),
        // selectedCapacityName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("capacity"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string(),
        // }),
        // selectedFrameName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("frame finish"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string(),
        // }),
        // selectedGripsName: Yup.string().when('selectedMandatory', {
        //     is: (val) => val && val.includes("grips"),
        //     then: Yup.string().required("Required!"),
        //     otherwise: Yup.string(),
        // }),
        estimatedPrice: Yup.number().typeError("Please enter a valid amount").min(1, "Minimum price should be 1").required("Price is required"),
        // pre1968: Yup.bool(),
        itemType: Yup.string(),
        serialNumber: Yup.string().when("itemType", {
            is: (val) => val === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore,
            then: Yup.string().required("Serial Number required"),
            otherwise: Yup.string().nullable()
        }),
    });
    const schema2 = Yup.object().shape({
        title: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(100, "Maximum 100 Characters Allowed")
            .required("Required!"),
        description: Yup.string()
            .required("Required!")
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "Maximum 1032 Characters Allowed"),
        estimatedPrice: Yup.number().min(0, "Minimum price should be 0").required("Required!"),
    });
    useEffect(() => {
        setInitialValues((!_.isEmpty(selectedListingItem) && selectedListingItem) || defaultValues);
    }, [selectedListingItem])
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
    const [isValidSerialNumber, setIsValidSerialNumber] = useState(true);

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
    useEffect(() => {
        getCategoryData('category');
        getDataByArgs('t_condition');
        getDataByArgs('manufacturer');
        getDataByArgs('model');
        getDataByArgs('caliber');
        getDataByArgs('barrel_length');
        getDataByArgs('capacity');
        getDataByArgs('frame_finish');
        getDataByArgs('grips');
    }, []);

    const handleChangeByChange = (values) => { }

    const getMyPayload = (values) => {
        let payload = _.cloneDeep(values);
        payload.details = {};
        if (values) {
            if (values.category) {
                payload.details.category = _.filter(listOfCategoryByFlatten, { sid: values.category })[0];
            }
            if (values.tcondition) {
                payload.details.condition = _.filter(listOfCondition, { sid: values.tcondition })[0];
            }
            if (values.manufacturer) {
                payload.details.manufacturer = _.filter(listOfManufacturer, { sid: values.manufacturer })[0];
            }
            if (values.model) {
                payload.details.model = _.filter(listOfModel, { sid: values.model })[0];
            }
            if (values.barrelLength) {
                payload.details.barrelLength = _.filter(listOfBarrelLength, { sid: values.barrelLength })[0];
            }
            if (values.caliber) {
                payload.details.caliber = _.filter(listOfCaliber, { sid: values.caliber })[0];
            }
            if (values.capacity) {
                payload.details.capacity = _.filter(listOfCapacity, { sid: values.capacity })[0];
            }
            if (values.frameFinish) {
                payload.details.frameFinish = _.filter(listOfFrameFinish, { sid: values.frameFinish })[0];
            }
            if (values.grips) {
                payload.details.grips = _.filter(listOfGrips, { sid: values.grips })[0];
            }
        }
        return payload;
    }

    const onSpecificTradeFilters = (values) => {
        let val = values;
        if (listInfoByView.listingItem.length === 0) { val.primary = true }
        else { val.primary = false }
        const specifiTradeFilter = getMyPayload(val);
        selectItem(specifiTradeFilter);
    }

    const getLevelOption = (list, level) => {
        return <>
            {level === 0 && <option class={`level_${level}`} key={list.sid} value={list.sid}>{list.name}</option>}
            {level === 1 && <option class={`level_${level}`} key={list.sid} value={list.sid}>&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {level === 2 && <option class={`level_${level}`} key={list.sid} value={list.sid}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {list.childCategory && list.childCategory.length && categoryOptionList(list.childCategory, ++level)}
        </>
    }

    const categoryOptionList = (categorylist, level) => <>
        {categorylist.map((list, index) => {
            return getLevelOption(list, level)
        })}
    </>;

    const selectItem = (values) => {
        if (!_.isEmpty(values)) {
            if (values.lId) {
                let data = listInfoByView.listingItem;
                let foundIndex = data.findIndex(x => x.lId == values.lId);
                data[foundIndex] = values;
                setListingItem(data)
                setBundleItems(data)
                setListInfoByView({ ...listInfoByView, listingItem: data });
            } else {
                let val = { ...values, lId: Date.now() }
                setListingItem([...listingItem, val]);
                setBundleItems([...listingItem, val]);
                setListInfoByView({ ...listInfoByView, listingItem: [...listInfoByView.listingItem, val] });
            }
        }
        setAddItemModal(false);
    }

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
            let trimValue = value.replace(/\s+/g, ' ').trim(); // prevent to paste more than limited characters
            setFieldValue(key, trimValue);
        } catch (err) {
            console.error("Error occurred while onChangeTrim", err);
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

    const isPrimary = () => (selectedIndex === 0 || listInfoByView.listingItem.length === 0)

    return (
        <>
            <div className="cd-signin-modal js-signin-modal specific-trade-filter addPrimarySecondaryListing">
                <div className="cd-signin-modal__container creating-listing-modal">
                    <div class="col-12 win-header m-0">
                        <p class="text-left mt-2 mb-0">{isEditItems ? "Update" : "Add"} {isPrimary() ? 'Primary Item' : "Secondary Item"}</p>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="js-signin-modal-block border-radius" data-type="specificFilter">
                                <section id="specific-filter-section">
                                    <div class="container">
                                        <div class="row text-left">
                                            <div class="col-lg-12 p-0">
                                                <div class="left-sidebar" data-type="filterBox">
                                                    <Formik
                                                        enableReinitialize={true}
                                                        validationSchema={isPrimary() ? schema : schema2}
                                                        initialValues={initialValues}
                                                        onSubmit={onSpecificTradeFilters}>
                                                        {({ handleSubmit, isSubmitting, handleChange, handleBlur, touched, errors, values, isValid, dirty, setFieldValue }) => (
                                                            <Form noValidate>
                                                                <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                                                {/* <p class="m-0 p-2">Only trade with items having following specifications</p> */}
                                                                <div class="listing-item-body filter-box-ctn">
                                                                    <Form.Group>
                                                                        <Form.Label className="px-0"><h5 className="label-head mb-0">Title<sup>*</sup></h5></Form.Label>
                                                                        <Form.Control
                                                                            className={classNames("", { "in-valid": errors.title })}
                                                                            type="text"
                                                                            name="title"
                                                                            value={values.title}
                                                                            onChange={(e) => onChangeLimit("title", e.target.value, setFieldValue, 101)}
                                                                            // onBlur={handleBlur}
                                                                            onBlur={(e) => onChangeTrim("title", e.target.value, setFieldValue)}
                                                                            isInvalid={!!errors.title}
                                                                        />
                                                                        <p className="fild-caption">{values.title.length === 0 ? <div>(100 Characters Maximum, No HTML, Special Characters & All Caps)</div>
                                                                            : values.title.length <= 100 ? <div >
                                                                                <p style={{ color: "#878B8E", fontSize: "14px" }}>{100 - values.title.length} Characters Left
                                                                                    No HTML, Special Characters & All Caps</p>
                                                                            </div> : ''}</p>
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.title}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                    <Form.Group>
                                                                        <Form.Label className="px-0"> <h5 className="label-head mb-0">Description<sup>*</sup></h5></Form.Label>
                                                                        <Form.Control as="textarea" rows={3}
                                                                            className={classNames("", { "in-valid": errors.description })}
                                                                            name="description"
                                                                            value={values.description}
                                                                            onChange={(e) => onChangeLimit("description", e.target.value, setFieldValue, 1033)}
                                                                            // onBlur={handleBlur}
                                                                            onBlur={(e) => onChangeTrim("description", e.target.value, setFieldValue)}
                                                                            isInvalid={!!errors.description}
                                                                        />
                                                                        <p className="fild-caption">
                                                                            {values.description.length === 0 ? <div>(1032 Characters Maximum, No HTML, Special Characters & All Caps) </div> : values.description.length <= 1032 ? <div>
                                                                                <p style={{ color: "#878B8E", fontSize: "14px" }}>{1032 - values.description.length} Characters Left, No HTML, Special Characters & All Caps</p>
                                                                            </div> : ''}
                                                                            </p>
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.description}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                    <Form.Group>
                                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Category {isPrimary() && <sup>*</sup>}</h5></Form.Label>
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
                                                                                setFieldValue("selectedMandatory", JSON.parse(data.mandatory));
                                                                                // validate fire arm selection based upon category if firearm or not
                                                                                setFieldValue("isFireArm", data.firearm);
                                                                                setFieldValue("itemType", data.firearm ? GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM : GLOBAL_CONSTANTS.ITEM_TYPE.NOT_FIRE_ARM)
                                                                            },
                                                                            in_Valid: errors.selectedCategoryName
                                                                        }} />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.selectedCategoryName}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                    {
                                                                        values?.selectedMandatory?.includes("condition")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Condition{isPrimary() && values?.selectedMandatory?.includes("condition") && <sup>*</sup>}</h5></Form.Label>
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
                                                                                in_Valid: errors.selectedConditionName
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.selectedConditionName}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values?.selectedMandatory?.includes("manufacturer")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Manufacturer{isPrimary() && values?.selectedMandatory?.includes("manufacturer") && <sup>*</sup>}</h5></Form.Label>
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
                                                                                in_Valid: errors.selectedManufacturerName
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.selectedManufacturerName}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values?.selectedMandatory?.includes("model")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Model{isPrimary() && values?.selectedMandatory?.includes("model") && <sup>*</sup>}</h5></Form.Label>
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
                                                                                in_Valid: errors.selectedModelName
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.selectedModelName}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values?.selectedMandatory?.includes("caliber")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Caliber {isPrimary() && values?.selectedMandatory?.includes("caliber") && <sup>*</sup>}</h5></Form.Label>
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
                                                                        values?.selectedMandatory?.includes("barrel length")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Barrel Length {isPrimary() && values?.selectedMandatory?.includes("barrel length") 
                                                                            // && <sup>*</sup>
                                                                            }</h5></Form.Label>
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
                                                                        values?.selectedMandatory?.includes("capacity")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Capacity {isPrimary() && values?.selectedMandatory?.includes("capacity") 
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
                                                                        values?.selectedMandatory?.includes("frame finish")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Frame Finish {isPrimary() && values?.selectedMandatory?.includes("frame finish")
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
                                                                        values?.selectedMandatory?.includes("grips")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Grips {isPrimary() && values?.selectedMandatory?.includes("grips") 
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
                                                                    <Form.Group>
                                                                        <Form.Label className="p-0"><h5 className="label-head mb-0">Price <sup>*</sup></h5></Form.Label>
                                                                        <div className="flx flx-a-cent">
                                                                            <div className="mr-2">$</div>
                                                                            <div className="flx1">
                                                                                <Form.Control style={{ "width": "120px" }}
                                                                                    className={classNames("", { "in-valid": errors.estimatedPrice })}
                                                                                    type="number"
                                                                                    name="estimatedPrice"
                                                                                    value={values.estimatedPrice}
                                                                                    onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault() }}
                                                                                    //onKeyDown={(e) => {((e.keyCode === 69) || (e.keyCode === 107) || (e.keyCode === 187) || (e.keyCode === 110) || (e.keyCode === 190) || (e.keyCode === 109) || (e.keyCode === 189) || (e.keyCode === 32)) && e.preventDefault()}}
                                                                                    onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    isInvalid={!!errors.estimatedPrice}
                                                                                />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.estimatedPrice}
                                                                                </Form.Control.Feedback>
                                                                            </div>
                                                                        </div>

                                                                    </Form.Group>
                                                                    {isPrimary() && <>
                                                                        {/* <Form.Group id="pre1968" className="magic-box">
                                                                            <Form.Check
                                                                                onChange={async (e) => {
                                                                                    setFieldValue("pre1968", e?.target?.checked || false);
                                                                                    await Promise.resolve();
                                                                                    e?.target?.checked && setFieldValue("serialNumber", "");
                                                                                    e?.target?.checked && setIsValidSerialNumber(true)
                                                                                }}
                                                                                label=" This belongs to pre 1968"
                                                                                type="checkbox"
                                                                                checked={values.pre1968}
                                                                                onBlur={handleBlur}
                                                                                isInvalid={!!errors.pre1968 && !!touched.pre1968}
                                                                                name="pre1968" />
                                                                        </Form.Group> */}
                                                                        <div className="third-form-part">
                                                                            <div className="form-group magic-box text-left pb20">
                                                                                <h2 className="item-head">Serial Number</h2>
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
                                                                                    // disabled={!values?.isFireArm || false}
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
                                                                                    // disabled={!values?.isFireArm || false}
                                                                                    />
                                                                                </Form.Group>
                                                                                {
                                                                                    values.itemType !== GLOBAL_CONSTANTS.ITEM_TYPE.NOT_FIRE_ARM
                                                                                    && (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore)
                                                                                    && <Form.Group className="pt10">
                                                                                        <Form.Label className="p-0"><h5 className="label-head">{"Serial Number"} {values.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM && <sup>*</sup>}</h5></Form.Label>
                                                                                        <Form.Control
                                                                                            className={classNames("", { "in-valid": errors.serialNumber })}
                                                                                            type="text"
                                                                                            name="serialNumber"
                                                                                            value={values.serialNumber}
                                                                                            onChange={(e) => {
                                                                                                let a = e.target.value.replace(/\s+/g, ' ').trim();
                                                                                                setFieldValue("serialNumber", a);
                                                                                            }}
                                                                                            onBlur={(e) => {
                                                                                                handleBlur(e);
                                                                                                isValidSerialNumberFn(e.target.value)
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
                                                                    </>}

                                                                </div>
                                                                <div class="flx specific-add-filter-footer p-3">
                                                                    <div className="flx1 mr-2"><input type="button" value="Cancel" class="submt-btn submt-btn-lignt display-inline full-w mx-2" onClick={() => selectItem()} /></div>
                                                                    <div className="flx1 mx-2"><input type="submit" disabled={(!isValid || !dirty)} value="Save" class="submt-btn full-w submt-btn-dark display-inline" onClick={handleSubmit} /></div>
                                                                </div>
                                                            </Form>
                                                        )}
                                                    </Formik>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <a class="cd-signin-modal__close js-close" onClick={() => selectItem()} >Close</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default memo(AddListingItems);