import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { Modal, Button, Form, FormControl, Dropdown } from 'react-bootstrap'
import { Formik, Field, ErrorMessage } from "formik";
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import moment from 'moment';
import CustomDropdown from '../../Shared/CustomDropdown/CustomDropdown';
import ApiService from '../../../services/api.service';
import { MAP_API_KEY } from '../../../commons/utils';
import { services } from '@tomtom-international/web-sdk-services';
import { IcnAdd, IcnDownSmall } from '../../icons';
import * as Yup from 'yup';
import classNames from 'classnames';
import ViewLocation from '../../Shared/ViewLocation';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import '../platform.css';

const DEFAULT_VALUE = {
    "newResolutionInfo": {
        "actions": [
            {
                "isEnable": true,
                "function": "",
                "amount": 0,
                "appliedTo": ""
            }
        ],
        "title": ""
    },
    "disputeInfo": {
        "actions": [
            {
                "isEnable": true,
                "function": "",
                "amount": 0,
                "appliedTo": "",
                "title": ""
            }
        ],
        "orderDetailsSid": "",
        "resolutionNote": "",
        "internalNote": ""
    },
    "selectedResolution": {}
}

const ResolveDispute = ({ show, setShow, selectedDispute, onSuccess = () => { } }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [isNew, setIsNew] = useState(false);
    const [resolutionList, setResolutionList] = useState([]);
    const [selectedResolution, setSelectedResolution] = useState({});
    const [resTitle, setResTitle] = useState("");
    const [buyerLocation, setBuyerLocation] = useState({});
    const [sellerLocation, setSellerLocation] = useState({});
    const [selectedSchema, setSelectedSchema] = useState("");
    const [, forceRender] = useState(null);
    const [initialValue, setInitialValue] = useState(DEFAULT_VALUE);

    const createResolutionSchema = Yup.object().shape({
        newResolutionInfo: Yup.object().shape({
            title: Yup.string()
                .required("Title is required"),
            actions: Yup.array().of(
                Yup.object().shape({
                    amount: Yup.number().when('function', {
                        is: (val) => val && val !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.CANCEL_ORDER,
                        then: Yup.number().min(0, "min 0").required("Required"),
                        otherwise: Yup.number()
                    }),
                    appliedTo: Yup.string().when('function', {
                        is: (val) => val && val !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.CANCEL_ORDER,
                        then: Yup.string().required("Required"),
                        otherwise: Yup.string()
                    }),
                    function: Yup.string()
                        .required("Required"),
                })
            )
        })
    });

    const selectedResolutionSchema = Yup.object().shape({
        selectedResolution: Yup.object().shape({
            title: Yup.string()
                .required("Resolution Name is required"),
            actions: Yup.array().of(
                Yup.object().shape({
                    amount: Yup.number().when('function', {
                        is: (val) => val && val !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.REJECT_DISPUTE,
                        then: Yup.number().min(0, "min 0").required("Required"),
                        otherwise: Yup.number()
                    }),
                    appliedTo: Yup.string().when('function', {
                        is: (val) => val && val !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.REJECT_DISPUTE,
                        then: Yup.string().required("Required"),
                        otherwise: Yup.string()
                    }),
                    function: Yup.string()
                        .required("Required"),
                })
            )
        })
    });

    // get all resolution list
    const getAllResolution = () => {
        try {
            spinner.show("Populating resolution list... Please wait...");
            ApiService.getAllResolution().then(
                response => {
                    setResolutionList(response.data);
                },
                err => {
                    spinner.hide();
                    console.error('Error occurred in getAllResolution--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in getAllResolution--', err);
        }
    }

    // this method trigger when create new resolution
    const createResolution = (payload) => {
        try {
            if (payload.newResolutionInfo.title === "") {
                Toast.error({ message: 'Please enter resolution name and functions', time: 2000 });
                return;
            }
            spinner.show("Creating resolution... Please wait...");
            ApiService.createResolution(payload.newResolutionInfo).then(
                response => {
                    getAllResolution();
                    Toast.success({ message: 'Resolution created successfully', time: 2000 });
                    setIsNew(false);
                },
                err => {
                    spinner.hide();
                    console.error('Error occurred in createResolution--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in createResolution--', err);
        }
    }

    /**
     * this method trigger when click on add new action
     */
    const addNewAction = (values, setFieldValue) => {
        try {
            let tmpData = { ...values }
            tmpData.newResolutionInfo.actions.push(GLOBAL_CONSTANTS.DATA.ACTION_OBJ);
            setFieldValue("newResolutionInfo.actions", tmpData.newResolutionInfo.actions);
        } catch (err) {
            console.error('Error occurred in addNewAction--', err);
        }
    }

      /**
     * this method trigger when click on delete icon action
     */
       const deleteAction = (i, values, setFieldValue) => {
        try {
            let tmpData = { ...values }
            let newAction = tmpData.newResolutionInfo.actions && tmpData.newResolutionInfo.actions.length > 0 && tmpData.newResolutionInfo.actions.filter((r, idx) => idx !== i)
            setFieldValue("newResolutionInfo.actions", newAction);
        } catch (err) {
            console.error('Error occurred in deleteAction--', err);
        }
    }

    // this method to resolve dispute
    const resolveDispute = (values) => {
        try {
            spinner.show("Creating resolution... Please wait...");
            let tempAction = [...values.selectedResolution.actions];
            if (!_.isEmpty(tempAction)) tempAction[0].title = selectedResolution?.title ? selectedResolution.title : ""
            let payload = {
                "actions": tempAction,
                "orderDetailsSid": selectedDispute?.orderDetailsSid ? selectedDispute.orderDetailsSid : selectedDispute.listingDetailsSid,
                "resolutionNote": values.disputeInfo.resolutionNote ? values.disputeInfo.resolutionNote : "",
                "internalNote": values.disputeInfo.internalNote ? values.disputeInfo.internalNote : "",
                "orderHasListingDeliveryIssueSid": selectedDispute?.orderHasListingDeliveryIssueSid ? selectedDispute.orderHasListingDeliveryIssueSid : "",
            }
            ApiService.resolveDispute(payload).then(
                response => {
                    onSuccess();
                    Toast.success({ message: 'Dispute resolved successfully', time: 2000 });
                    setShow(false);
                },
                err => {
                    spinner.hide();
                    Toast.error({ message: "Internal server error...", time: 2000 });
                    console.error('Error occurred in createResolution--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error('Error occurred in resolveDispute--', err);
        }
    }

    // get location by lat long
    const getMyLocation = (type = "") => {
        spinner.show("Creating resolution... Please wait...");
        function callbackFn(resp) {
            type === "BUYER"
                ? setBuyerLocation(resp.addresses[0].address)
                : setSellerLocation(resp.addresses[0].address)
            spinner.hide();
        }
        services.reverseGeocode({
            key: MAP_API_KEY,
            position: {
                lat: type === "BUYER" ? selectedDispute?.buyerLocation?.latitude : selectedDispute?.sellerLocation?.latitude,
                lng: type === "BUYER" ? selectedDispute?.buyerLocation?.longitude : selectedDispute?.sellerLocation?.longitude,
            }
        }).then(callbackFn);
    }

    // listening changes for form valid or not
    const isFormValid = (isValid, dirty, values) => {
        let valid = false;
        try {
            if(
                !isValid 
                || !dirty 
                || !(
                    values?.selectedResolution?.actions 
                    && values?.selectedResolution?.actions.length > 0 
                    && values?.selectedResolution?.actions.some(r => r.isEnable)
                )
            ) valid = true;
        } catch (err) {
            console.error('Error occurred in isFormValid--', err);
        }
        return valid;
    }

    // listening for select dispute
    useEffect(() => {
        if (!_.isEmpty(selectedDispute) && selectedDispute.buyerLocation?.isPermissionGranted && selectedDispute.buyerLocation) getMyLocation(GLOBAL_CONSTANTS.USER_TYPE.BUYER);
        if (!_.isEmpty(selectedDispute) && selectedDispute.sellerLocation?.isPermissionGranted && selectedDispute.sellerLocation) getMyLocation(GLOBAL_CONSTANTS.USER_TYPE.SELLER);
    }, [selectedDispute]);

    // forcefully render component to update validation schema
    useEffect(() => {
        setSelectedSchema(isNew ? createResolutionSchema : selectedResolutionSchema)
        if (!isNew) forceRender(Date.now());
    }, [isNew])

    // component init
    useEffect(() => {
        getAllResolution();
    }, []);

    return <Modal className="store-details-model" show={show} size="lg" onHide={() => setShow(false)} animation={false}>
        <Formik
            initialValues={initialValue}
            onSubmit={resolveDispute}
            validationSchema={selectedSchema}
        >
            {({ handleSubmit, isSubmitting, isValid, dirty, errors, values, setFieldValue, handleChange, resetForm }) => (
                <Form noValidate className="w100" onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title className="f16">Resolve Dispute</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bgWhite">
                        <div className="p15">
                            <div className="row">
                                <div className="col-12 col-sm-6">
                                    <Form.Group>
                                        <Form.Label className="f12">Dispute Title :</Form.Label>
                                        <div className="text-semi-bold">{selectedDispute.disputeTitle}</div>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label className="f12">Pickup Location</Form.Label>
                                        <div className="text-semi-bold">
                                            <ViewLocation {...{
                                                deliveryLocation: selectedDispute.deliveryLocation,
                                                showIcon: false
                                            }}
                                            />
                                        </div>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label className="f12">Pickup Schedule</Form.Label>
                                        <div className="text-semi-bold"><div>{moment(selectedDispute.pickUpScheduledOnFrom).format("L hh:mm A")} to {moment(selectedDispute.pickUpScheduledOnTo).format("LT")}</div></div>
                                    </Form.Group>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <div className="b-ddd p20">
                                        <div className="col333 mb20 f12">{"Seller’s & Buyer’s Location at the time of meet"}</div>
                                        <div className="mb15">Seller : <span className="text-semi-bold">{!_.isEmpty(sellerLocation) ? sellerLocation.freeformAddress : "-"}</span></div>
                                        <div className="mb15">Buyer : <span className="text-semi-bold">{!_.isEmpty(buyerLocation) ? buyerLocation.freeformAddress : "-"}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bb-ddd my20"></div>
                            <div>
                                <div className="row">
                                    <div className="col-12 col-sm-6">
                                        <Form.Group className="fdc">
                                            <Form.Label className="f12">Resolution</Form.Label>
                                            <Dropdown className="resolution-title-dropdown">
                                                <Dropdown.Toggle variant="outline" className="b-ddd no-chev jcb" id="dis-res-title-toggle">
                                                    <div>{resTitle ? resTitle : "Select Resolution"}</div>
                                                    <div>
                                                        <IcnDownSmall />
                                                    </div>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <div className="">
                                                        <div className="f13 resolution-list">
                                                            {
                                                                !_.isEmpty(resolutionList)
                                                                && resolutionList.map((resolution, i) => <Dropdown.Item
                                                                    key={i}
                                                                    className="pb5 pointer"
                                                                    onClick={() => {
                                                                        setIsNew(false);
                                                                        setFieldValue("selectedResolution", resolution);
                                                                        setSelectedResolution(resolution);
                                                                        setResTitle(resolution.title)
                                                                    }}
                                                                >{resolution.title}</Dropdown.Item>
                                                                )
                                                            }
                                                            {
                                                                _.isEmpty(resolutionList)
                                                                && <Dropdown.Item ><span className="c777">No resolution found!</span>
                                                            </Dropdown.Item>
                                                            }
                                                        </div>
                                                        <div className="bt-ddd pt10 f12">
                                                            <Dropdown.Item
                                                                className="pointer aic"
                                                                onClick={() => {
                                                                    setFieldValue("newResolutionInfo", GLOBAL_CONSTANTS.DATA.NEW_RES_OBJ);
                                                                    setResTitle("Create New Resolution");
                                                                    setIsNew(true);
                                                                }}><IcnAdd /><span className="pl5">Create New Resolution</span>
                                                            </Dropdown.Item>
                                                        </div>
                                                    </div>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Form.Group>
                                        {
                                            !isNew && <>
                                                {
                                                    !_.isEmpty(values.selectedResolution.actions)
                                                    && values.selectedResolution.actions.map((res, i) => <div key={i} className="aic mb10">
                                                        {
                                                            res.function !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.REJECT_DISPUTE
                                                            && <>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    name="resolution"
                                                                    className="mr5"
                                                                    id={`resolution-${i}`}
                                                                    checked={values.selectedResolution.actions[i]?.isEnable ? values.selectedResolution.actions[i].isEnable : false}
                                                                    onChange={(e) => setFieldValue(`selectedResolution.actions[${i}].isEnable`, e.target.checked)}
                                                                />
                                                                <CustomDropdown {...{
                                                                    data: GLOBAL_CONSTANTS.DATA.ACTION_LIST,
                                                                    bindKey: "displayName",
                                                                    searchKeywords: "",
                                                                    title: values.selectedResolution.actions[i].function ? GLOBAL_CONSTANTS.DATA.ACTION_LIST.find((r) => r.value === values.selectedResolution.actions[i].function).displayName : "- Select -",
                                                                    onSelect: (data) => { setFieldValue(`selectedResolution.actions[${i}].function`, data.value) }
                                                                }} />
                                                                {
                                                                    res.function !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.CANCEL_ORDER
                                                                    && <>
                                                                        <div className="ml10 mr5">$</div>
                                                                        <FormControl 
                                                                            type="number" 
                                                                            className={classNames("px5", { 
                                                                                "border-danger-errors": errors?.selectedResolution?.actions && errors?.selectedResolution?.actions[i]?.amount 
                                                                                }
                                                                            )} 
                                                                            id="amounts" 
                                                                            name={`selectedResolution.actions[${i}].amount`} 
                                                                            value={values?.selectedResolution?.actions[i]?.amount} 
                                                                            onChange={handleChange} 
                                                                        />
                                                                        {/* <ErrorMessage component="span" name={`selectedResolution.actions[${i}].amount`} className="text-danger mb-2 small-text" /> */}
                                                                        <div className="px5">To</div>
                                                                        <CustomDropdown {...{
                                                                            data: GLOBAL_CONSTANTS.DATA.APPLIED_TO_LIST,
                                                                            bindKey: "displayName",
                                                                            searchKeywords: "",
                                                                            title: values.selectedResolution.actions[i].appliedTo ? GLOBAL_CONSTANTS.DATA.APPLIED_TO_LIST.find((r) => r.value === values.selectedResolution.actions[i].appliedTo).displayName : "- Select -",
                                                                            onSelect: (data) => { setFieldValue(`selectedResolution.actions[${i}].appliedTo`, data.value) }
                                                                        }} />
                                                                    </>
                                                                }
                                                            </>
                                                        }
                                                    </div>)
                                                }
                                            </>
                                        }
                                        {
                                            isNew
                                            && <>
                                                <Form.Group>
                                                    <Field 
                                                        name="newResolutionInfo.title"
                                                        className="form-control form-control-sm"
                                                        //className={`form-control form-control-sm ${errors.newResolutionInfo.title && 'is-invalid' }`}
                                                        //isInvalid={!!errors.newResolutionInfo.title && !!touched.newResolutionInfo.title}
                                                        placeholder="Enter Resolution Name" />
                                                    <ErrorMessage component="span" name="newResolutionInfo.title" className="text-danger mb-2 small-text" />
                                                </Form.Group>
                                                {
                                                    !_.isEmpty(values.newResolutionInfo.actions)
                                                    && values.newResolutionInfo.actions.map((newRes, i) => <div key={i} className="aic mb10 select-option">
                                                        <CustomDropdown
                                                            {...{
                                                                data: GLOBAL_CONSTANTS.DATA.ACTION_LIST,
                                                                bindKey: "displayName",
                                                                searchKeywords: "",
                                                                title: values.newResolutionInfo.actions[i].function ? GLOBAL_CONSTANTS.DATA.ACTION_LIST.find((r) => r.value === values.newResolutionInfo.actions[i].function).displayName : "- Select -",
                                                                onSelect: (data) => { setFieldValue(`newResolutionInfo.actions[${i}].function`, data.value) }
                                                            }} />
                                                        {
                                                            newRes.function !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.CANCEL_ORDER
                                                            && <>
                                                                <div className="ml10 mr5">$</div>
                                                                <FormControl 
                                                                    type="number" 
                                                                    className={classNames("px5", { 
                                                                        "border-danger-errors": (
                                                                            _.isArray(errors?.newResolutionInfo?.actions) 
                                                                            && errors.newResolutionInfo.actions[i]?.amount) 
                                                                            }
                                                                    )} 
                                                                    name={`newResolutionInfo.actions[${i}].amount`} 
                                                                    value={values?.newResolutionInfo?.actions[i]?.amount} 
                                                                    onChange={handleChange} 
                                                                />
                                                                {/* <ErrorMessage component="span" name={`newResolutionInfo.actions[${i}].amount`} className="text-danger mb-2 small-text" /> */}
                                                                <div className="px5">To</div>
                                                                <CustomDropdown {...{
                                                                    data: GLOBAL_CONSTANTS.DATA.APPLIED_TO_LIST,
                                                                    bindKey: "displayName",
                                                                    searchKeywords: "",
                                                                    title: values.newResolutionInfo.actions[i].appliedTo ? GLOBAL_CONSTANTS.DATA.APPLIED_TO_LIST.find((r) => r.value === values.newResolutionInfo.actions[i].appliedTo).displayName : "- Select -",
                                                                    onSelect: (data) => { setFieldValue(`newResolutionInfo.actions[${i}].appliedTo`, data.value) }
                                                                }} />
                                                            </>
                                                        }
                                                        {
                                                            <div className={`pl5 ${i >=1 ? "text-danger cp" : ""}`} onClick={() => {i >=1 && deleteAction(i, values, setFieldValue)}}><i className="fa fa-minus-circle"></i></div>
                                                        }
                                                    </div>)
                                                }
                                                <div className="pointer aic" onClick={() => addNewAction(values, setFieldValue)}> <IcnAdd /><span className="pl5">Add Action</span></div>
                                                <div className="jce bt-ddd pt10">
                                                    <Button 
                                                        variant="light" 
                                                        className="f12 px20 b-ddd mr10" 
                                                        onClick={() => {
                                                            setFieldValue("newResolutionInfo", GLOBAL_CONSTANTS.DATA.NEW_RES_OBJ); 
                                                            setIsNew(false); 
                                                            setResTitle(values.selectedResolution.title);
                                                        }}
                                                    >Discard</Button>
                                                    <Button variant="info" disabled={(!isValid || !dirty)} className="f12 px20" onClick={() => createResolution(values)}>{" Save "}</Button>
                                                </div>
                                            </>
                                        }
                                        <Form.Group className="pt20">
                                            <Form.Label className="f12">{`${values?.selectedResolution?.title === "Reject Dispute" && !isNew ? "Reason " : "Resolution Note "} (This will be visible to both Seller and Buyer )`}</Form.Label>
                                            <Field name="disputeInfo.resolutionNote" as="textarea" className="form-control" />
                                        </Form.Group>
                                        <Form.Group className="">
                                            <Form.Label className="f12">Internal Note</Form.Label>
                                            <Field name="disputeInfo.internalNote" as="textarea" className="form-control" />
                                        </Form.Group>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" variant="outline" className="f12 submt-btn-lignt res-dis-btn" onClick={() => setShow(false)}>Cancel</Button>
                        <Button type="submit" variant="outline" disabled={isFormValid(isValid, dirty, values)} className="f12 submt-btn-dark res-dis-btn proBtn-hover">Save</Button>
                    </Modal.Footer>
                </Form>
            )}
        </Formik>
    </Modal>;
}

export default ResolveDispute;