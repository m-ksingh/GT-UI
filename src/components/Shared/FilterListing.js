import React, { useState, useEffect, useContext } from "react";
import { useHistory } from 'react-router-dom';
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import { Form } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import FormikCotext from '../Shared/FormikContext';
import { extractCategoryList, getSelectedCategoryTitleBySid, getSelectedOptionBySid } from "../../services/CommonServices";
import CustomDropdown from "../Shared/CustomDropdown/CustomDropdown";

const defaultValues = {
    category: '',
    tcondition: '',
    manufacturer: '',
    model: '',
    caliber: '',
    barrelLength: '',
    capacity: '',
    frameFinish: '',
    grips: '',
};
function FilterListing({
    setListingValues,
    setListingModel,
    selectedSpecificListing = defaultValues,
}) {
    const [initialValues, setInitialValues] = useState((!_.isEmpty(selectedSpecificListing) && selectedSpecificListing) || defaultValues);
    const schema = Yup.object().shape({
        selectedCategoryName: Yup.string().required("Required!"),
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
        selectedCaliberName: Yup.string(),
        selectedBarrelName: Yup.string(),
        selectedCapacityName: Yup.string(),
        selectedFrameName: Yup.string(),
        selectedGripsName: Yup.string()
    });
    useEffect(() => {
        setInitialValues((!_.isEmpty(selectedSpecificListing) && selectedSpecificListing) || defaultValues);
    }, [selectedSpecificListing])
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
        const specifiTradeFilter = getMyPayload(values);
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
            setListingValues(values);
        }
        setListingModel(false);
    }

    return (
        <>
            <div className="cd-signin-modal js-signin-modal specific-trade-filter">
                <div className="cd-signin-modal__container choose-listing">
                    <div class="col-12 win-header m-0 px15">
                        <p class="text-left mt-2 mb-0">Define Trade Specifications</p>
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
                                                        validationSchema={schema}
                                                        initialValues={initialValues}
                                                        onSubmit={onSpecificTradeFilters}>
                                                        {({ handleSubmit, isSubmitting, handleChange, handleBlur, touched, errors, values, isValid, dirty, setFieldValue }) => (
                                                            <Form noValidate>
                                                                <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                                                <p class="m-0 px15 py10">Only trade with items having following specifications</p>
                                                                <div class="add-filter-body filter-box-ctn">
                                                                    <Form.Group>
                                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Category<sup>*</sup></h5></Form.Label>
                                                                        <CustomDropdown {...{
                                                                            data: (listOfCategory?.length && listOfCategory) || [],
                                                                            bindKey: "displayName",
                                                                            searchKeywords: "",
                                                                            title: (!_.isEmpty(values.category) && getSelectedCategoryTitleBySid({ list: (listOfCategory?.length && listOfCategory) || [], sid: values.category }))
                                                                                || values.selectedCategoryName
                                                                                || "- Select Category -",
                                                                            onSelect: (data) => {
                                                                                setFieldValue("category", data.sid)
                                                                                setFieldValue("selectedCategoryName", data.selectedOption);
                                                                                setFieldValue("selectedMandatory", JSON.parse(data.mandatory));
                                                                            }
                                                                        }} />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.category}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("condition")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Condition<sup>*</sup></h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.tcondition}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                        }
                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("manufacturer")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Manufacturer<sup>*</sup></h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.manufacturer}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }

                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("model")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Model<sup>*</sup></h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.model}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("caliber")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Caliber</h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.caliber}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("barrel length")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Barrel Length</h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.barrelLength}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("capacity")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Capacity</h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.capacity}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("frame finish")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Frame Finish</h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.frameFinish}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                    {
                                                                        values.selectedMandatory
                                                                        && values.selectedMandatory.includes("grips")
                                                                        && <Form.Group>
                                                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Grips</h5></Form.Label>
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
                                                                                }
                                                                            }} />
                                                                            <Form.Control.Feedback type="invalid">
                                                                                {errors.grips}
                                                                            </Form.Control.Feedback>
                                                                        </Form.Group>
                                                                    }
                                                                </div>
                                                                <div class="flx specific-add-filter-footer p-3">
                                                                    <div className="flx1 mr10"><input type="button" value="Cancel" class="submt-btn submt-btn-lignt display-inline w100" onClick={() => selectItem()} /></div>
                                                                    <div className="flx1"><input type="submit" disabled={(isSubmitting || !isValid || !dirty)} value="Apply" class="submt-btn submt-btn-dark display-inline w100" onClick={handleSubmit} /></div>
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

export default FilterListing;