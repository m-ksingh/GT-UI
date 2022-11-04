import React, { useState, useEffect, useContext } from "react";
import Layout from "../Layout";
import { useHistory } from 'react-router-dom';
import Breadcrumb from "../Shared/breadcrumb";
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Form } from 'react-bootstrap';
import $ from 'jquery';
import ApiService from "../../services/api.service";
import FormikCotext from '../Shared/FormikContext';
import { AppContext } from '../../contexts/AppContext';
import Location from '../Shared/Location';
import { useAuthState } from '../../contexts/AuthContext';
import { extractCategoryList, getSelectedCategoryTitleBySid, getSelectedOptionBySid } from "../../services/CommonServices";
import CustomDropdown from "../Shared/CustomDropdown/CustomDropdown";
import GLOBAL_CONSTANTS from "../../Constants/GlobalConstants";
import InputRange from "react-input-range";
import 'react-input-range/lib/css/index.css';

function BuyFilter(props) {

    let defaultValues = GLOBAL_CONSTANTS.DATA.DEFAULT_FILTER_VALUE;
    const history = useHistory();
    const spinner = useContext(Spinner);
    const [initialValues, setInitialValues] = useState(defaultValues);
    const [locationModel, setLocationModel] = useState(false)
    const { setValueBy, location } = useContext(AppContext);
    const [filterLocation, setFilterLocation] = useState(location);
    const [clearAll, setClearAll] = useState(true);
    const userDetails = useAuthState();
    const [agree, setAgree] = useState(false);
    const [price, setPrice] = useState('');
    const [maxprice, setMaxPrice] = useState('');

    const schema = Yup.object().shape({
        keyword: Yup.string()
            .max(100, "100 Characters Maximum"),
        description: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "1032 Characters Maximum"),
        category: Yup.string(),
        tcondition: Yup.array(),
        manufacturer: Yup.string(),
        model: Yup.string(),
        caliber: Yup.string(),
        barrelLength: Yup.string(),
        capacity: Yup.string(),
        frameFinish: Yup.string(),
        grips: Yup.string(),
        price: Yup.number(),
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
    const [totalCount, setTotalCount] = useState(0);
    const [sortValues, setSortValues] = useState({ "sort": "REL" });
    const [distance, setDistance] = useState(GLOBAL_CONSTANTS.DEFAULT_DISTANCE);
    const [average, setAverage] = useState({ mindist: "", maxdist: "" });
    const [mindist, SetMindist] = useState('');
    const [maxdist, SetMaxdist] = useState('');
    const [distanceAvg, setDistanceAVG] = useState("50");
    const [a, b] = useState(0);

    const onChange = (e) => {
        let name = e.target.name;
        let value = e.target.value.replace(/\D/g, "");

        const newValues = {
            ...average,
            [name]: value
        };
        setAverage(newValues);
        calcAverage(newValues);
        calcFirst(newValues);
        calcSecond(newValues);
    };

    const calcAverage = (newValues) => {
        const { first, second } = newValues;
        const newAverage = (parseInt(first, 10) + parseInt(second, 10)) / 2;
        setDistanceAVG(newAverage);
        setDistance(distanceAvg)
    };
    const calcFirst = (newValues) => {
        const { sum, second } = newValues;
        const newFirst = parseInt(sum, 10) - parseInt(second, 10);
        SetMindist(newFirst);
    };
    const calcSecond = (newValues) => {
        const { sum, first } = newValues;
        const newSecond = parseInt(sum, 10) - parseInt(first, 10);
        SetMaxdist(newSecond);
    };

    const [defaultRange, setDefaultRange] = useState({
        min: 0,
        max: 100000
    });

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
        onSearchCount(values);
    }

    const resetFilterValues = () => {
        setInitialValues(defaultValues);
    }

    const onSearch = (values) => {
        localStorage.setItem('buyfilter', JSON.stringify(values));
        history.push({
            pathname: '/search',
            state: {
                filterVal: values
            }
        });
    }

    const getMyPayload = (values) => {
        let payload = {
            // "pageIndex": 10,
            "distance": GLOBAL_CONSTANTS.DEFAULT_DISTANCE,
            "latitude": _.toString(location.position.lat),
            "longitude": _.toString(location?.position?.lng || location?.position?.lon),
            "distanceUnit": GLOBAL_CONSTANTS.DEFAULT_DISTANCE_UNIT,
            "resultCount": 10,
            "exclAppuserId": userDetails.user.sid,
            "priceRangeMin": values.priceRangeMin ? values.priceRangeMin : 0,
            "priceRangeMax": values.priceRangeMax ? values.priceRangeMax : 100000
        };
        payload = _.merge({}, payload, sortValues);
        if (!_.isEmpty(values.searchKeyword)) {
            payload.title = values.searchKeyword;
        }
        if (values) {
            if (values.category) {
                payload.category = [values.category];
            }
            if (values.tcondition) {
                payload.condition = values.tcondition;
            }
            if (values.manufacturer) {
                payload.manufacturer = [values.manufacturer];
            }
            if (values.model) {
                payload.model = [values.model];
            }
            if (values.barrelLength) {
                payload.barrelLength = [values.barrelLength];
            }
            if (values.caliber) {
                payload.caliber = [values.caliber];
            }
            if (values.capacity) {
                payload.capacity = [values.capacity];
            }
            if (values.frameFinish) {
                payload.frameFinish = [values.frameFinish];
            }
            if (values.grips) {
                payload.grips = [values.grips];
            }
            if (values.distance && !defaultValues.nationwide) {
                payload.distance = values.distance;
            }
        }
        if (values.nationwide) {
            console.log(values.nationwide);
            payload.distance = GLOBAL_CONSTANTS.US_NATION_RADIUS
            // delete payload.latitude;
            // delete payload.longitude;
            // delete payload.distanceUnit;
        }
        return payload;
    }

    const onSearchCount = (values) => {
        spinner.show("Please wait...");
        const payload = getMyPayload(values);
        ApiService.filterListingCount(payload).then(
            response => {
                setTotalCount(response.data.count);
            },
            err => { }
        ).finally(() => {
            spinner.hide();
        });
    }


    const onSearchAndExitPopup = (values) => {
        onSearch(values);
    }

    useEffect(() => {
        setValueBy('SET_LOCATION', filterLocation)
    }, [filterLocation])


    useEffect(() => {
        setFilterLocation(location);
    }, [location])

    const resetLocation = () => {
        setFilterLocation(location);
    }

    // init component
    useEffect(() => {
        setClearAll(true);
        onSearchCount({});
    }, [])

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

    const getLevelOption = (list, level) => {
        return <>
            {level === 0 && <option class={`level_${level}`} key={list.sid} value={list.sid}>{list.name}</option>}
            {level === 1 && <option class={`level_${level}`} key={list.sid} value={list.sid}>&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {level === 2 && <option class={`level_${level}`} key={list.sid} value={list.sid}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {list.childCategory && list.childCategory.length && categoryOptionList(list.childCategory, ++level)}
        </>
    }

    const categoryOptionList = (categorylist, level) => <>
        {categorylist.map((list) => {
            return getLevelOption(list, level)
        })}
    </>;

    let avergaedistance = (parseInt(maxdist) + parseInt(mindist)) / 2;
    //    const [distance, setDistance] = useState(avergaedistance);

    //    console.log(maxdist);
    //    console.log(mindist);
    //    console.log(avergaedistance);
    console.log(distanceAvg);

    return (

        <Layout title="Buy Products" description="filter view"  >
            <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
            <section id="buy-filter-section">
                <div class="container">
                    <div class="row">
                        <div class="col-12 col-lg-6 filter-popup-box">
                            <div class="left-sidebar" data-type="filterBox">
                                <Formik
                                    enableReinitialize={true}
                                    validationSchema={schema}
                                    initialValues={initialValues}
                                    onSubmit={onSearchAndExitPopup}>
                                    {({ handleSubmit, isSubmitting, handleChange, resetForm, touched, errors, values, isValid, dirty, setFieldValue }) => (
                                        <Form noValidate>
                                            <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                            <div>
                                                <p class={`desktop-clear-filter text-right mobile-off ${clearAll ? "clearAll" : ''}`}>
                                                    <a
                                                        onClick={() => {
                                                            resetForm();
                                                            resetLocation();
                                                            (() => setTimeout(() => {
                                                                setClearAll(true);
                                                                setPrice('')
                                                                setMaxPrice('')
                                                            }, 500))()
                                                            setClearAll(true);
                                                            setDefaultRange({ min: 0, max: 100000 });
                                                        }}
                                                        class="clear-btn"
                                                    >Clear All</a>
                                                </p>
                                            </div>
                                            <div class="add-filter-body filter-box-ctn">
                                                <p class="text-right desktop-off m-0"><a onClick={() => {
                                                    resetForm();
                                                    setDefaultRange({ min: 0, max: 100000 });
                                                    setPrice('')
                                                    setMaxPrice('')
                                                }} class="clear-btn">Clear All</a></p>
                                                <Form.Group className="desktop-off">
                                                    <Form.Label class="p-0"><h5 class="label-head mb-0">Keyword</h5></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="keyword"
                                                        placeholder="keyword"
                                                        value={values.keyword}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.keyword}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.keyword}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <h5>Location</h5>
                                                <p class="location-txt">{filterLocation && <span>{filterLocation.address.freeformAddress} </span>} <span class="des-location cp" onClick={() => setLocationModel(true)}>Change</span></p>
                                                <Form.Group>
                                                    <Form.Check
                                                        onChange={(e) => {
                                                            console.log(e.target.checked);
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
                                                <Form.Group className="range-selector">
                                                    {/* <h5 className="label-head mb-1">Distance Range in(miles)</h5> */}

                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="100"
                                                        value={values.distance}
                                                        hidden={values.nationwide}
                                                        className={"rangeslider"}
                                                        id="myRange"
                                                        onChange={e => {
                                                            setDistance(e.target.value)
                                                             if(e.target.value >=100 || distanceAvg >=100){
                                                                 setFieldValue("nationwide", true);
                                                            }
                                                        }}
                                                        onMouseUp={() => setFieldValue("distance", distance)}
                                                        onKeyUp={() => setFieldValue("distance", distance)}
                                                    />
                                                </Form.Group>
                                                <p class="range-btext" hidden={values.nationwide}>{`Within ${values.distance} miles`}</p>
                                                <ul className="p-range form-group">


                                                    <li className="caption" hidden={values.nationwide}>

                                                        <p className="price-lab" >Min Distance</p>
                                                        <p className="price-tag" id="slider-range-value1">
                                                            {/* $ {values.priceRangeMin} */}

                                                            <input
                                                                className="form-control px-3 my-1"
                                                                type="text"
                                                                name="first"
                                                                id="first"

                                                                onChange={onChange}
                                                            // onChange={e => {
                                                            //     SetMindist(e.target.value);
                                                            //     // b((e.target.value + maxdist)/2);
                                                            //     setFieldValue("distance", e.target.value);
                                                            //     if (e.target.value > 100) {
                                                            //         setFieldValue("nationwide", true);
                                                            //         // setFieldValue("distance", (t ? "1500" : GLOBAL_CONSTANTS.DEFAULT_DISTANCE));
                                                            //     }
                                                            // }}
                                                            />

                                                        </p>

                                                    </li>



                                                    <li className="text-right caption" hidden={values.nationwide}>

                                                        <p className="price-lab" >Max Distance</p>
                                                        <p className="price-tag" id="slider-range-value2">
                                                            {/* ${values.priceRangeMax} */}

                                                            <input
                                                                className="form-control px-3 my-1"
                                                                type="text"
                                                                onChange={onChange}
                                                                name="second"
                                                                id="second"
                                                                // onChange={e => {
                                                                //     SetMaxdist(e.target.value);
                                                                //     // b((e.target.value + mindist)/2);
                                                                //     // setFieldValue("distance", avergaedistance)
                                                                // }}

                                                            />

                                                        </p>

                                                    </li>



                                                </ul>

                                                <Form.Group>
                                                    <h5 className="label-head mb-1">Condition</h5>
                                                    {
                                                        listOfCondition.map((d, idx) => (
                                                            <Form.Group className="mb-0" controlId="tradeSellAuction" key={idx}>
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
                                                    {/* <PriceRange
                                                        {...{
                                                            min: 0,
                                                            max: 100000,
                                                            priceRangeMin: values.priceRangeMin,
                                                            priceRangeMax: values.priceRangeMax,
                                                            onAfterChange: ([min, max]) => {
                                                                setFieldValue("priceRangeMin", min);
                                                                setFieldValue("priceRangeMax", max);
                                                            }
                                                        }}
                                                    /> */}

                                                    {/* <input

                                                     
                                                        className="form-control"
                                                        type="text"
                                                        value={price}
                                                        onChange={e=>{
                                                            if(e.target.value >=0 && e.target.value<=100000){
                                                               
                                                                setPrice(e.target.value.replace(/\D/g,''));
                                                                setDefaultRange({min: 0, max: e.target.value});
                                                                
                                                                    
                                                                    setFieldValue("priceRangeMax", e.target.value);
                                                            }
                                                            
                                                            }
                                                        }

                                                    /> */}
                                                    {/* <div className="row">
                                                 <div className="col-6">
                                                  <Form.Label class="p-0"><h5 class="label-head mb-0">Min Price</h5></Form.Label>
                                                    <input
                                                     
                                                     className="form-control"
                                                     type="text"
                                                     value={price}
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
                                                    <div className="col-6">
                                                    <Form.Label class="p-0"><h5 class="label-head mb-0">Max Price</h5></Form.Label>
                                                    <input
                                                     
                                                     className="form-control"
                                                     type="text"
                                                     value={maxprice}
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
                                                 </div> */}


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


                                                    <li className="caption">

                                                        <p className="price-lab" >Min Price</p>
                                                        <p className="price-tag" id="slider-range-value1">
                                                            {/* $ {values.priceRangeMin} */}
                                                            <div style={{ position: "relative" }}>
                                                                <span style={{ position: "absolute", left: "8px", top: "10px" }}>$</span>
                                                                <input
                                                                    className="form-control px-3 my-1"
                                                                    type="text"
                                                                    value={values.priceRangeMin}
                                                                    onChange={e => {
                                                                        if (e.target.value >= 0 && e.target.value <= 100000) {

                                                                            setPrice(e.target.value.replace(/\D/g, ''));
                                                                            setDefaultRange({ min: e.target.value, max: 100000 });


                                                                            setFieldValue("priceRangeMin", e.target.value);
                                                                        }

                                                                    }
                                                                    }
                                                                />
                                                            </div>
                                                        </p>

                                                    </li>



                                                    <li className="text-right caption">

                                                        <p className="price-lab" >Max Price</p>
                                                        <p className="price-tag" id="slider-range-value2">
                                                            {/* ${values.priceRangeMax} */}
                                                            <div style={{ position: "relative" }}>
                                                                <span style={{ position: "absolute", left: "8px", top: "10px" }}>$</span>
                                                                <input
                                                                    className="form-control px-3 my-1"
                                                                    type="text"
                                                                    value={values.priceRangeMax}
                                                                    onChange={e => {
                                                                        if (e.target.value >= 0 && e.target.value <= 100000) {

                                                                            setMaxPrice(e.target.value.replace(/\D/g, ''));
                                                                            setDefaultRange({ min: 0, max: e.target.value });


                                                                            setFieldValue("priceRangeMax", e.target.value);
                                                                        }

                                                                    }
                                                                    }
                                                                />
                                                            </div>
                                                        </p>

                                                    </li>



                                                </ul>


                                                <Form.Group>
                                                    <Form.Label class="p-0"><h5 class="label-head mb-0">Category</h5></Form.Label>
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
                                                        }
                                                    }} />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.category}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Form.Label class="p-0"><h5 class="label-head mb-0">Manufacturer</h5></Form.Label>
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
                                                    <Form.Label class="p-0"><h5 class="label-head mb-0">Model</h5></Form.Label>
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
                                                <Form.Group>
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
                                                <Form.Group>
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
                                                <Form.Group>
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
                                                <Form.Group>
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


                                            </div>
                                            <div class="add-filter-footer text-center mb-4">
                                                <input type="submit" value={`See all ${totalCount} Matches`} class="submt-btn submt-btn-dark" onClick={handleSubmit} />
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {locationModel && <Location {...{ locationModel, setLocationModel, setFilterLocation }} />}
        </Layout>

    );
}

export default BuyFilter;