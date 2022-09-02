import React, { useState, useEffect, useContext } from "react";
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import { Form } from 'react-bootstrap';
import $ from 'jquery';
import ApiService from "../../services/api.service";
import FormikCotext from '../Shared/FormikContext';
import { AppContext } from '../../contexts/AppContext';
import Location from '../Shared/Location';
import CustomDropdown from "../Shared/CustomDropdown/CustomDropdown";
import { extractCategoryList, getSelectedCategoryTitleBySid, getSelectedOptionBySid } from "../../services/CommonServices";
import GLOBAL_CONSTANTS from "../../Constants/GlobalConstants";
import InputRange from "react-input-range";
import 'react-input-range/lib/css/index.css'

const defaultValues = {
    keyword: '',
    description: '',
    category: '',
    tcondition: [],
    manufacturer: '',
    model: '',
    caliber: '',
    barrelLength: '',
    capacity: '',
    frameFinish: '',
    grips: '',
    new: false,
    moderately: false,
    heavily: false,
    distance: GLOBAL_CONSTANTS.DEFAULT_DISTANCE,
    nationwide: false,
    priceRangeMin: 0,
    priceRangeMax: 100000,
};

function Filter({
    handleClose,
    setPageNo,
    filterValues = defaultValues,
    setFilterValues,
    setLocationBy,
    resetFilterValues = () => { }
}) {
    const [initialValues, setInitialValues] = useState((!_.isEmpty(filterValues) && filterValues) || defaultValues);
    const [locationModel, setLocationModel] = useState(false)
    const { setValueBy, location } = useContext(AppContext);
    const [filterLocation, setFilterLocation] = useState(location);
    const [clearAll, setClearAll] = useState(true);
    const [defaultRange, setDefaultRange] = useState({
        min: 0,
        max: 100000
    });

    useEffect(() => {
        setInitialValues((!_.isEmpty(filterValues) && filterValues) || defaultValues);
    }, [filterValues])

    const schema = Yup.object().shape({
        keyword: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(100, "100 Characters Maximum"),
        description: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "1032 Characters Maximum"),
        category: Yup.string(),
        // tcondition: Yup.string(),
        manufacturer: Yup.string(),
        model: Yup.string(),
        caliber: Yup.string(),
        barrelLength: Yup.string(),
        capacity: Yup.string(),
        frameFinish: Yup.string(),
        grips: Yup.string(),
        price: Yup.number(),
        new: Yup.bool(),
        moderately: Yup.bool(),
        heavily: Yup.bool(),
        nationwide: Yup.bool(),
    });
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
    const [distance, setDistance] = useState(GLOBAL_CONSTANTS.DEFAULT_DISTANCE);
    const [price, setPrice] = useState('');
    const [maxprice, setMaxPrice] = useState('');

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

    const handleChangeByChange = (values) => {
        setClearAll(false)
        if (!$('.add-filter-footer:visible').length && !_.isEmpty(filterLocation.position)) {
            setPageNo(0);
            setFilterValues(values);
        }
    }

    const onSearchAndExitPopup = (values) => {
        handleClose();
        setPageNo(0);
        setFilterValues(values);
    }

    useEffect(() => {
        setLocationBy(filterLocation);
        setValueBy('SET_LOCATION', filterLocation)
    }, [filterLocation])

    useEffect(() => {
        setLocationBy(location);
        setFilterLocation(location);
    }, [location])

    const resetLocation = () => {
        setFilterLocation(location);
    }

    useEffect(() => {
        setClearAll(true)
    }, [])

    const getLevelOption = (list, level) => {
        return <>
            {level === 0 && <option className={`level_${level}`} key={list.sid} value={list.sid}>{list.name}</option>}
            {level === 1 && <option className={`level_${level}`} key={list.sid} value={list.sid}>&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {level === 2 && <option className={`level_${level}`} key={list.sid} value={list.sid}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {list.childCategory && list.childCategory.length && categoryOptionList(list.childCategory, ++level)}
        </>
    }

    const handleCheckedList = (e, setFieldValue, values) => {
        let checkedList = [...values.tcondition];

        if (e.target.checked) {
            checkedList.push(e.target.value);
            setFieldValue("tcondition", checkedList)

        } else {
            let filterCondtions = [];
            if (checkedList.map(r => r === e.target.value)) {
                filterCondtions = checkedList.splice(1, 1);
                setFieldValue("tcondition", filterCondtions);
            }
        }
    }

    const categoryOptionList = (categorylist, level) => <>
        {categorylist.map((list, index) => {
            return getLevelOption(list, level)
        })}
    </>;

    return (
        <>
            <div className="row">
                <div className="col-lg-12 filter-popup-box">
                    <div className="left-sidebar" data-type="filterBox">
                        <Formik
                            enableReinitialize={true}
                            validationSchema={schema}
                            initialValues={initialValues}
                            onSubmit={onSearchAndExitPopup}>
                            {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty, setFieldValue, resetForm }) => (
                                <Form noValidate>
                                    <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                    <div>
                                        <h3>Filters</h3>
                                        <p className={`desktop-clear-filter text-right mobile-off ${clearAll ? "clearAll" : ''}`}>
                                            <a onClick={() => {
                                                resetForm();
                                                resetLocation();
                                                resetFilterValues();
                                                setDefaultRange({ min: 0, max: 100000 });
                                                setClearAll(true);
                                                (() => setTimeout(() => {
                                                    setClearAll(true);
                                                    setPrice('')
                                                    setMaxPrice('')
                                                }, 500))()
                                            }} className="clear-btn">
                                                Clear All
                                            </a>
                                        </p>
                                    </div>
                                    <div className="add-filter-body filter-box-ctn">
                                        <p className="text-right desktop-off">
                                            <a onClick={() => {
                                                resetFilterValues();
                                                resetForm();
                                                setPrice('')
                                                setMaxPrice('')
                                                setDefaultRange({ min: 0, max: 100000 });
                                            }} className="clear-btn">
                                                Clear All
                                            </a>
                                        </p>
                                        <Form.Group className="desktop-off">
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Keyword</h5></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="keyword"
                                                placeholder="keyword"
                                                value={values.keyword}
                                                onChange={handleChange}
                                                isInvalid={!!errors.keyword}
                                            />
                                            <p className="fild-caption">(100 Characters Maximum, No HTML, Special characters & All Caps)</p>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.keyword}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <h5>Location</h5>
                                        <p className="location-txt">{filterLocation && <span>{filterLocation.address.freeformAddress} </span>} <span className="des-location cp" onClick={() => setLocationModel(true)}>Change</span></p>
                                        <Form.Group>
                                            <Form.Check
                                                onChange={(e) => {
                                                    setValueBy('SET_KEYWOARD', '');
                                                    setFieldValue("nationwide", e.target.checked);
                                                    setFieldValue("distance", (e.target.checked ? "1500" : GLOBAL_CONSTANTS.DEFAULT_DISTANCE));
                                                }}
                                                label="Nation wide"
                                                type="checkbox"
                                                name="nationwide"
                                                id="nation_wide"
                                                checked={values.nationwide}
                                            />
                                        </Form.Group>
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={values.distance}
                                            hidden={values.nationwide}
                                            className={"rangeslider"}
                                            id="myRange"
                                            onChange={e => setDistance(e.target.value)}
                                            onMouseUp={() => setFieldValue("distance", distance)}
                                            onKeyUp={() => setFieldValue("distance", distance)}
                                        />

                                        <p className="range-btext" hidden={values.nationwide}>{`Within ${values.distance} miles`}</p>
                                        <Form.Group>
                                            <h5 className="label-head mb-1">Condition</h5>
                                            {
                                                listOfCondition.map(d => (
                                                    <Form.Group className="mb-0" controlId="tradeSellAuction">
                                                        <Form.Check
                                                            key={d.sid}
                                                            id={d.sid}
                                                            name={d.name}
                                                            value={d.sid}
                                                            onChange={(e) => handleCheckedList(e, setFieldValue, values)}
                                                            type="checkbox"
                                                            label={d.name}
                                                            checked={values.tcondition.some(r => r === d.sid)}
                                                        />
                                                    </Form.Group>
                                                ))
                                            }
                                        </Form.Group>
                                        <Form.Group className="range-selector">
                                            <h5 className="label-head mb-1">Price Range</h5>
                                            {/* <input


                                                className="form-control"
                                                type="text"
                                                value={price}
                                                onChange={e => {
                                                    if (e.target.value >= 0 && e.target.value <= 100000) {
                                                        setPrice(e.target.value.replace(/\D/g,''));
                                                        setDefaultRange({ min: 0, max: e.target.value });


                                                        setFieldValue("priceRangeMax", e.target.value);
                                                    }

                                                }
                                                }

                                            /> */}
                                            <InputRange
                                                formatLabel={() => ""}
                                                minValue={0}
                                                maxValue={100000}
                                                value={defaultRange}
                                                onChange={value => setDefaultRange({ min: value.min, max: value.max })}
                                                onChangeComplete={value => {
                                                    setFieldValue("priceRangeMin", value.min);
                                                    setFieldValue("priceRangeMax", value.max);
                                                }}

                                            />
                                        </Form.Group>
                                        <ul className="p-range form-group">
                                           <div style={{display:"flex" ,flexDirection:"column"}}>
                                           <li className="caption">
                                                <p className="price-lab">Min Price</p>
                                                <p className="price-tag" id="slider-range-value1">
                                                    {/* ${values.priceRangeMin} */}
                                                    <div style={{position:"relative"}}>
                                                    <span style={{position:"absolute", left:"8px", top:"10px"}}>$</span>
                                                    <input
                                                 className="form-control px-4"
                                                 type="text"
                                                 value={values.priceRangeMin}
                                                 onChange={e=>{
                                                     if(e.target.value >=0 && e.target.value<=100000){
                                                        
                                                         setPrice(e.target.value.replace(/\D/g,''));
                                                         setDefaultRange({min:e.target.value, max: 100000});
                                                         
                                                             
                                                             setFieldValue("priceRangeMin", e.target.value);
                                                     }
                                                     
                                                     }
                                                 }
                                                  />
                                                  </div>
                                                </p>
                                            </li>
                                            <li className="text-left caption my-3">
                                                <p className="price-lab">Max Price</p>
                                                <p className="price-tag" id="slider-range-value2">
                                                    {/* ${values.priceRangeMax} */}
                                                    <div style={{position:"relative"}}>
                                                    <span style={{position:"absolute", left:"8px", top:"10px"}}>$</span>
                                                    <input
                                                      className="form-control px-4 "
                                                      
                                                       type="text"
                                                       value={values.priceRangeMax}
                                                       onChange={e=>{
                                                           if(e.target.value >=0 && e.target.value<=100000){
                                                              
                                                               setMaxPrice(e.target.value.replace(/\D/g,''));
                                                               setDefaultRange({min:0, max:e.target.value});
                                                               
                                                                   
                                                                   setFieldValue("priceRangeMax", e.target.value);
                                                           }
                                                           
                                                           }
                                                       }
                                                  />
                                                  </div>
                                                    </p>
                                            </li>
                                           </div>
                                        </ul>
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Category</h5></Form.Label>
                                            <CustomDropdown {...{
                                                data: (listOfCategory?.length && listOfCategory) || [],
                                                bindKey: "displayName",
                                                searchKeywords: "",
                                                title: (!_.isEmpty(values.category) && getSelectedCategoryTitleBySid({ list: (listOfCategory?.length && listOfCategory) || [], sid: values.category }))
                                                    || values.selectedCategoryName
                                                    || ` - Select Category - `,
                                                onSelect: (d) => {
                                                    setFieldValue("category", d.sid)
                                                    setFieldValue("selectedCategoryName", d.selectedOption);
                                                }
                                            }} />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.category}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Manufacturer</h5></Form.Label>
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
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Model</h5></Form.Label>
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
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Caliber</h5></Form.Label>
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
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Barrel Length</h5></Form.Label>
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
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Capacity</h5></Form.Label>
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
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Frame Finish</h5></Form.Label>
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
                                        <Form.Group>
                                            <Form.Label className="p-0"><h5 className="label-head mb-0">Grips</h5></Form.Label>
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
                                      
                                      
                                    </div>
                                    <div className="add-filter-footer desktop-off">
                                        <input type="submit" value="Apply Filters" className="submt-btn submt-btn-dark" onClick={handleSubmit} />
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
            <a className="cd-signin-modal__close js-close desktop-off" onClick={handleClose} >Close</a>
            {locationModel && <Location {...{ locationModel, setLocationModel, setFilterLocation }} />}
        </>
    );
}

export default Filter;