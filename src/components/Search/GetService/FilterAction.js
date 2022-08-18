import React, { useState, useEffect, useContext } from "react";
import Layout from "../../Layout";
import { useHistory } from 'react-router-dom';
import Breadcrumb from "../../Shared/breadcrumb";
import { Formik, useField, ErrorMessage } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Form } from 'react-bootstrap';
import ApiService from "../../../services/api.service";
import FormikCotext from '../../Shared/FormikContext';
import { AppContext } from '../../../contexts/AppContext';
import Location from '../../Shared/Location';
import CustomDropdown from "../../Shared/CustomDropdown/CustomDropdown";
import './getService.css'
import GLOBAL_CONSTANTS from "../../../Constants/GlobalConstants";

const defaultValues = {
    "appraisalEnabled": false,
    "classesEnabled": false,
    "distance": GLOBAL_CONSTANTS.DEFAULT_DISTANCE,
    "distanceUnit": null,
    "fflSaleEnabled": false,
    "inspectionEnabled": false,
    "latitude": null,
    "layawayEnabled": false,
    "longitude": null,
    "permitClassesEnabled": false,
    "searchKeyword": "",
    "speciality": [

    ],
    "trainingClassesEnabled": false,
    "yearOfExperienceFrom": 1,
    "yearOfExperienceTo": 5,
    "selectedExpLabel": '',
    "experience": '',
};
function FilterAction({isModal=false,setShow,setList}) {
    const history = useHistory();
    const spinner = useContext(Spinner);
    const [initialValues, setInitialValues] = useState(defaultValues);
    const [locationModel, setLocationModel] = useState(false)
    const { setValueBy, location } = useContext(AppContext);
    const [filterLocation, setFilterLocation] = useState(location);
    const [clearAll, setClearAll] = useState(true);
    const [serviceList, setServiceList] = useState([])


    const schema = Yup.object().shape({
        keyword: Yup.string()
            .max(100, "100 Characters Maximum"),
    });


    const handleChangeByChange = (values) => {
        setClearAll(false)
      !isModal &&  onSearchCount(values);
    }

    const onSearch = () => {
        localStorage.setItem('servicelist', JSON.stringify(serviceList));
        history.push({
            pathname: '/servicelist',
            state: {
                breadcrumb: [
                    { name: "Home", path: `/` },
                    { name: "Search Results" }
                ]
            }
        });
    }

    const getMyPayload = (values) => {
        return ({
            "appraisalEnabled": values.appraisalEnabled,
            "classesEnabled": values.classesEnabled,
            "distance": values.distance,
            "distanceUnit": values.distanceUnit,
            "fflSaleEnabled": values.fflSaleEnabled,
            "inspectionEnabled": values.inspectionEnabled,
            "latitude": values.latitude,
            "layawayEnabled": values.layawayEnabled,
            "longitude": values.longitude,
            "permitClassesEnabled": values.permitClassesEnabled,
            "searchKeyword": values.searchKeyword,
            "speciality": values.speciality,
            "trainingClassesEnabled": values?.trainingClassesEnabled,
            "yearOfExperienceFrom": values?.experience?.start,
            "yearOfExperienceTo": values?.experience?.end,
        })
    }

    const onSearchCount = (values) => {
        const payload = getMyPayload(values);
        ApiService.getService(payload).then(
            response => {
                setServiceList(response.data)
                setList && setList(response.data)
                setShow && setShow(false)
                localStorage.setItem('servicelist', JSON.stringify(response.data));

            },
            err => { }
        ).finally(() => {
            spinner.hide();
            setShow && setShow(false)
        });
    }

    const onSearchAndExitPopup = (values) => {
        onSearchCount(values);
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

    useEffect(() => {
        setClearAll(true);
    }, [])





    // input type checkbox
    const Checkbox = (prop) => {
        const [field, helpers] = useField(prop);
        const { setValue } = helpers;
        return (<>
            <Form.Check
                custom={prop.custom}
                type="checkbox"
                id={`p-${prop.name}`}
                onChange={(e) => setValue(e.target.value)}
                checked={field.value}
                {...field}
                {...prop}
                className={`my-2`}
            />
            <ErrorMessage component="div" name={prop.name} className="text-danger mb-2 small-text" />
        </>)
    };

    // input type CheckboxGroup
    const CheckboxGroup = (prop) => {
        const [field, meta, helpers] = useField(prop);
        const { setValue } = helpers;
        const { value } = meta;
        return (<>
            {prop.options.map((option, i) => <Form.Check
                key={i}
                custom={prop.custom}
                label={option}
                id={option}
                inline
                checked={value.some(res => res === option)}
                type="checkbox"
                onChange={(e) => e.target.checked ? setValue([...value, option]) : setValue(value.filter(res => res !== option))}
            />)}
            <ErrorMessage component="div" name={prop.name} className="text-danger mb-2 small-text" />
        </>)
    };

    const expList = [
        { label: '1 to 5', end: 5, start: 1 },
        { label: '6 to 10', end: 10, start: 6 },
        { label: '11 & above..', end: 100, start: 11 },
    ]

    return (<>
            <Formik 
                enableReinitialize={true}
                validationSchema={schema}
                initialValues={initialValues}
                onSubmit={onSearchAndExitPopup}>
                {({ handleSubmit, isSubmitting, handleChange, resetForm, touched, errors, values, isValid, dirty, setFieldValue }) => (
                    <Form noValidate className={`${isModal && "modal-scroll left-sidebar"}`}>
                        {isModal &&  <div className="wishList-header"> Services - Filter </div>}
                      <div className={`${isModal && "service-body"}`}>
                     <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                        <div>
                            <p class={`desktop-clear-filter text-right mobile-off ${clearAll ? "clearAll" : 'disable'}`}>
                                <a 
                                    onClick={() => { 
                                        resetLocation(); 
                                        resetForm(); 
                                        setClearAll(true);
                                        (() => setTimeout(() => {
                                            setClearAll(true); 
                                        }, 500))()
                                    }} 
                                    class="clear-btn"
                                >Clear All</a></p>
                        </div>
                        <div class="add-filter-body filter-box-ctn ">
                            <p class="text-right desktop-off m-0"><a onClick={resetForm} class="clear-btn">Clear All</a></p>
                            <Form.Group className="">
                                <Form.Label class="p-0"><h5 class="label-head mb-0">Keyword</h5></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="searchKeyword"
                                    placeholder="keyword"
                                    value={values.searchKeyword}
                                    onChange={handleChange}
                                    isInvalid={!!errors.searchKeyword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.searchKeyword}
                                </Form.Control.Feedback>
                            </Form.Group>
                            {/* <h5>Location</h5>
                        <p class="location-txt">{filterLocation && <span>{filterLocation.address.localName || filterLocation.address.municipality}, {filterLocation.address.freeformAddress} </span>} <span class="des-location" onClick={() => setLocationModel(true)}>Change</span></p>
                        <input type="range" min="1" max="100" value={values.distance} class="rangeslider" id="myRange" onChange={e => setFieldValue("distance", e.target.value)} />
                        <p class="range-btext">{`Within ${values.distance} miles`}</p> */}
                            <Form.Group>
                                <Form.Label class="p-0"><h5 class="label-head mb-0">Year of Experience</h5></Form.Label>
                                <CustomDropdown {...{
                                    data: expList,
                                    bindKey: "label",
                                    searchKeywords: "",
                                    title: values.selectedExpLabel || "- Select Year -",
                                    onSelect: (data) => {
                                        setFieldValue("experience", data)
                                        setFieldValue("selectedExpLabel", data.label);
                                    }
                                }} />
                                <Form.Control.Feedback type="invalid">
                                    {errors.category}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Label class="p-0"><h5 class="label-head mb-0">Speciality</h5></Form.Label>
                            <div className="gt-service-check fdc">
                                <CheckboxGroup name="speciality" options={['Gunsmithing', 'Antiques', 'Revolver', 'AR', 'Re-finishing', 'Plating', 'Precision']} />
                            </div>
                            <Form.Label class="p-0"><h5 class="label-head mb-0 mt-3">Services Offered</h5></Form.Label>
                            <Checkbox label="Appraisals" name="appraisalEnabled" />
                            <Checkbox label="Layaway" name="layawayEnabled" />
                            <Checkbox label="Inspections" name="inspectionEnabled" />
                            <Checkbox label="Classes" name="classesEnabled" />
                            <Checkbox label="FFL Sale (Peer-to-Per)" name="fflSaleEnabled" />

                        </div>

                        {!isModal && <div class="text-center mb-4">
                            <input type="submit" value={`See all ${serviceList.length} Matches`} class="submt-btn submt-btn-dark service-btn" onClick={() => onSearch()} />
                        </div>   
                        }

                        </div>
                        {isModal && <div className="wishList-footer">
                                <div className=""><input type="submit" disabled={(isSubmitting || !isValid || !dirty)} value="Apply Filter" class="submt-btn submt-btn-dark display-inline px-5" onClick={handleSubmit} /></div>
                        </div>}
                    </Form>
                )}
            </Formik>
        {locationModel && <Location {...{ locationModel, setLocationModel, setFilterLocation }} />}


    </>);
}

export default FilterAction;