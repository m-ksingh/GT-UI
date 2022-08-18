import { useState,useEffect,useContext } from 'react'
import Modal from '../../Shared/Modal'
import './wishList.css'
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import { Form } from 'react-bootstrap';
import ApiService from '../../../services/api.service'
import CustomDropdown from "../../Shared/CustomDropdown/CustomDropdown";
import FormikCotext from '../../Shared/FormikContext';
import { useAuthState } from "../../../contexts/AuthContext";
import useToast from '../../../commons/ToastHook';
import Spinner from "rct-tpt-spnr";

import { extractCategoryList, getSelectedCategoryTitleBySid, getSelectedOptionBySid } from "../../../services/CommonServices";


const defaultValues = {
    name: '',
    category: '',
    tcondition: '',
    manufacturer: '',
    model: '',
};

const schema = Yup.object().shape({
    name: Yup.string().required("Required!"),   
    selectedCategoryName: Yup.string().required("Required!"),
    selectedConditionName: Yup.string().required("Required!"),
    selectedManufacturerName: Yup.string().required("Required!"),
    selectedModelName: Yup.string().required("Required!")
});

const CreateWishList = ({ show, setShow,  setListingValues,
    selectedSpecificListing,getCustomWishList}) => {
    const [initialValues, setInitialValues] = useState((!_.isEmpty(selectedSpecificListing) && selectedSpecificListing) );
    const Toast = useToast();
    const userDetails = useAuthState();
    const spinner = useContext(Spinner);

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
        }
        return payload;
    }

    const onSpecificTradeFilters = (values) => {
        const specifiTradeFilter = getMyPayload(values);
        selectItem(specifiTradeFilter);
    }

     // get custom wishlist
     const createCustomWishList = (values)=>{
         let payload ={
            name: values.name,
            model: values.model,
            category: values.category,
            manufacturer:values.manufacturer,
            tcondition:values.tcondition,
            selectedCategoryName:values.selectedCategoryName,
            selectedConditionName: values.selectedConditionName,
            selectedManufacturerName: values.selectedManufacturerName,
            selectedModelName: values.selectedModelName,
         }

        spinner.show("Please wait...");
        ApiService.createWishList(userDetails.user.sid,payload).then(
            response => {
                setShow(false);
                getCustomWishList()
                Toast.success({ message: 'Custom wishlist created successfully', time: 2000});
            },  
            err => {
                setShow(false);
                Toast.error({ message: err?.response?.data ? err.response?.data.error: 'Data loading error', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        });
}

 // get custom wishlist
 const updateCustomWishList = (values)=>{
    let payload ={
       model: values.model,
       category: values.category,
       manufacturer:values.manufacturer,
       tcondition:values.tcondition,
       selectedCategoryName:values.selectedCategoryName,
       selectedConditionName: values.selectedConditionName,
       selectedManufacturerName: values.selectedManufacturerName,
       selectedModelName: values.selectedModelName,
    }

    let newPayload = {
        name: values.name,
        wishlistJson: JSON.stringify(payload),
        sid: values.sid
    }
    
   spinner.show("Please wait...");
   ApiService.updateCustomWishList(newPayload).then(
       response => {
           setShow(false);
           getCustomWishList()
           Toast.success({ message: 'Custom wishlist updated  successfully', time: 2000});
       },  
       err => {
           setShow(false);
           Toast.error({ message: err?.response?.data ? err.response?.data.error: 'Data loading error', time: 2000});
       }
   ).finally(() => {
       spinner.hide();
   });
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
            selectedSpecificListing?.sid && updateCustomWishList(values) 
            selectedSpecificListing === null && createCustomWishList(values)
            setListingValues(values);
        }
        setShow(false);
    }

    return (<>
        <Modal {...{ show, setShow }} className="wishList-modal">
                <Formik
                    enableReinitialize={true}
                    validationSchema={schema}
                    initialValues={initialValues}
                    onSubmit={onSpecificTradeFilters}>
                        {({ handleSubmit, isSubmitting, handleChange, handleBlur, touched, errors, values, isValid, dirty, setFieldValue }) => (
                                 <Form noValidate>
                                <div className="wishList-header">
                                    Create Custom Wishlist
                                </div>
                                    <div className="wishList-body">
                                                    <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                                                <div class="add-filter-body filter-box-ctn">
                                                                <Form.Group>
                                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Wishlist Name<sup>*</sup></h5></Form.Label>
                                                                        <Form.Control
                                                                        type="text"
                                                                        name="name"
                                                                        value={values.name}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        isInvalid={!!errors.name && !!touched.name}
                                                                    />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.name}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
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
                                                                            }
                                                                            
                                                                        }} isInvalid={true} />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.selectedCategoryName}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                    <Form.Group>
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
                                                                            {errors.selectedConditionName}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                    <Form.Group>
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
                                                                            {errors.selectedManufacturerName}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>

                                                                    <Form.Group>
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
                                                                            {errors.selectedModelName}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                </div>
                                            </div>
                                                    <div className="wishList-footer">
                                                    <div className="mr-2"><input type="button" value="Cancel" class="submt-btn submt-btn-lignt display-inline px-5" onClick={() => setShow(false)} /></div>
                                                    <div className=""><input type="submit" disabled={(isSubmitting || !isValid || !dirty)} value="Apply" class="submt-btn submt-btn-dark display-inline px-5" onClick={handleSubmit} /></div>
                                            </div>
                </Form>
                 )}
             </Formik>
        </Modal>
    </>)
}

export default CreateWishList