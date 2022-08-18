import React, { useContext, useState, useEffect } from 'react'
import { Formik } from "formik"
import Spinner from "rct-tpt-spnr";
import * as Yup from 'yup';
import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import { Form, Row, InputGroup} from 'react-bootstrap';
import ApiService from "../../../services/api.service";
import { useAuthState } from  '../../../contexts/AuthContext/context';
import FormikCotext from '../../Shared/FormikContext';
import useToast from '../../../commons/ToastHook';
import { goToTopOfWindow } from '../../../commons/utils';

const listOfBusinessHours = [
    {
        name: "OO:00AM",
        sid: "00AM"
    },
    {
        name: "O1:00AM",
        sid: "01AM"
    },
    {
        name: "O2:00AM",
        sid: "02AM"
    },
    {
        name: "O3:00AM",
        sid: "03AM"
    },
    {
        name: "O4:00AM",
        sid: "04AM"
    },
    {
        name: "O5:00AM",
        sid: "05AM"
    },
    {
        name: "O6:00AM",
        sid: "06AM"
    },
    {
        name: "O7:00AM",
        sid: "07AM"
    },
    {
        name: "O8:00AM",
        sid: "08AM"
    },
    {
        name: "O9:00AM",
        sid: "09AM"
    },
    {
        name: "10:00AM",
        sid: "10AM"
    },
    {
        name: "11:00AM",
        sid: "11AM"
    },
    {
        name: "12:00PM",
        sid: "12PM"
    },
    {
        name: "01:00PM",
        sid: "01PM"
    },
    {
        name: "02:00PM",
        sid: "02PM"
    },
    {
        name: "03:00PM",
        sid: "03PM"
    },
    {
        name: "04:00PM",
        sid: "04PM"
    },
    {
        name: "05:00PM",
        sid: "05PM"
    },
    {
        name: "06:00PM",
        sid: "06PM"
    },
    {
        name: "07:00PM",
        sid: "07PM"
    },
    {
        name: "08:00PM",
        sid: "08PM"
    },
    {
        name: "09:00PM",
        sid: "09PM"
    },
    {
        name: "10:00PM",
        sid: "10PM"
    },
    {
        name: "11:00PM",
        sid: "11PM"
    }
];

const specialityList = [
    {
        isChecked: false,
        label: 'Gunsmithing',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Antiques',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Revolver',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'AR',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Re-finishing',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Plating',
        certificateDetails: []
    },
    {
        isChecked: false,
        label: 'Precision',
        certificateDetails: []
    }
];

const layawayPeriodList = [
    {
        name: "7 Days",
        sid: "7"
    },
    {
        name: "15 Days",
        sid: "15"
    },
    {
        name: "30 Days",
        sid: "30"
    }
];

const layawayFeesList = [
    {
        name: "10%",
        sid: 10
    },
    {
        name: "25%",
        sid: 25
    },
    {
        name: "50%",
        sid: 50
    }
];

const defaultBusinessInfoValues = {
    openingHour: '10AM',
    closingHour: '10PM',
    fflStoreHasSpecialities: _.cloneDeep(specialityList),
    yearsOfExperience: "",
    appraisalEnabled: false,
    appraisalFeeType: 'PERCENTAGE',
    appraisalFeePercentageTill500: 0,
    appraisalFeePercentageTill1000: 0,
    appraisalFeePercentageAbove1000: 0,
    appraisalFeeFixedPriceTill500: 0,
    appraisalFeeFixedPriceTill1000: 0,
    appraisalFeeFixedPriceAbove1000: 0,
    layawayEnabled: false,
    layawayPeriod: '30',
    layawayFee: 10,
    inspectionEnabled: false,
    inspectionLevel: '1',
    inspectionFee: 0,
    classesEnabled: false,
    permitClassesEnabled: false,
    trainingClassesEnabled: false,
    permitClassFee: 0,
    trainingClassFee: 0,
    fflSaleEnabled: false,
    fflSaleFee: 0
};

let currentBusinessInfoValues = {};

const StoreBusinessInfo = ({ setStoreViewBy, storeId }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [initialValues, setInitialValues] = useState(defaultBusinessInfoValues);
    const [uploadIndex, setUploadIndex] = useState('');

    const schema = Yup.object().shape({
        openingHour: Yup.string()
        .required("Required!"),
        closingHour: Yup.string()
        .required("Required!"),
        yearsOfExperience: Yup.number()
            .typeError("Please enter valid year")
            .min(0,"Minimum experience should be 0")
            .max(500, "Experience cannot be more than '500'")
            .required("Required!"),
        appraisalEnabled: Yup.bool(),
        appraisalFeeType: Yup.string(),
        appraisalFeePercentageTill500: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeePercentageTill1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeePercentageAbove1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeeFixedPriceTill500: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeeFixedPriceTill1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        appraisalFeeFixedPriceAbove1000: Yup.number().typeError("Please enter a valid price").min(0, "Appraisal cannot be less than '0'"),
        layawayEnabled: Yup.bool(),
        layawayPeriod: Yup.string().nullable(),
        layawayFee: Yup.number(),
        inspectionEnabled: Yup.bool(),
        inspectionLevel: Yup.string(),
        inspectionFee: Yup.number().typeError("Please enter a valid price").min(0, "Inspection Fees cannot be less than '0'"),
        classesEnabled: Yup.bool(),
        permitClassesEnabled: Yup.bool(),
        trainingClassesEnabled: Yup.bool(),
        permitClassFee: Yup.number().typeError("Please enter a valid price").min(0, "Fees cannot be less than '0'"),
        trainingClassFee: Yup.number().typeError("Please enter a valid price").min(0, "Fees cannot be less than '0'"),
        fflSaleEnabled: Yup.bool(),
        fflSaleFee: Yup.number().typeError("Please enter a valid price").min(0, "Fees cannot be less than '0'")
    });
    const initCertificateUpload = (uploadInd, values) => {
        setUploadIndex(uploadInd);
        currentBusinessInfoValues = _.cloneDeep(values);
        $('.upload-input:visible').trigger('click');
    }

    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, (file, index) => {
            return {
                fileName: file.data,
                mediaType: "images",
                order: index
            };
        });
        currentBusinessInfoValues.fflStoreHasSpecialities[uploadIndex].certificateDetails = _.concat(currentBusinessInfoValues.fflStoreHasSpecialities[uploadIndex].certificateDetails, uploadedFiles);
        setInitialValues(currentBusinessInfoValues);
    }

    const removeCertificateBy = (index, fIndex) => {
        currentBusinessInfoValues.fflStoreHasSpecialities[index].certificateDetails.splice(fIndex,1);
        setInitialValues(currentBusinessInfoValues);
    }

    function uploadFiles(e) {
        // Create an object of formData
        let formData;
        const listOfFiles = [];
        _.each(e.target.files, file => {
            formData = new FormData();
            formData.append('file', file);
            listOfFiles.push(ApiService.uploadMultiPart(formData))
        })
        spinner.show("Please wait...");
        axios.all(listOfFiles).then(
            response => {
                setMultiFilesToDisplay(response);
            },
            err => {
                console.log(err);
            }
        ).finally(() => {
            spinner.hide();
            e.target.value = null;
        });
        // Send formData object
    }

    const prepopulateStoreInfo = (storeInfo) => {
        let specialityObj = null;
        storeInfo.fflStoreHasSpecialities = _.map(_.cloneDeep(specialityList), (speciality, index) => {
            specialityObj = _.filter(storeInfo.fflStoreHasSpecialities, {name: speciality.label});
            if (specialityObj && specialityObj.length) {
                speciality.isChecked = true;
                speciality.certificateDetails = JSON.parse(specialityObj[0].certificateDetails);
            }
            return speciality;
        });
        if (storeInfo.appraisalFeeType === 'PERCENTAGE') {
            storeInfo.appraisalFeeFixedPriceAbove1000 = 0;
            storeInfo.appraisalFeeFixedPriceTill500 = 0;
            storeInfo.appraisalFeeFixedPriceTill1000 = 0;
        } else if (storeInfo.appraisalFeeType === 'FIXED_PRICE') {
            storeInfo.appraisalFeePercentageAbove1000 = 0;
            storeInfo.appraisalFeePercentageTill500 = 0;
            storeInfo.appraisalFeePercentageTill1000 = 0;
        }
        storeInfo.inspectionLevel = _.toString(storeInfo.inspectionLevel);
        setInitialValues(storeInfo);
    }

    useEffect(() => {
        spinner.show("Please wait...");
        ApiService.getStore(storeId).then(
            response => {
                prepopulateStoreInfo(response.data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        });
    }, []);

    const getMyPayload = (values) => {
        const payload = _.cloneDeep(values);
        payload.fflStoreHasSpecialities = _.chain(payload.fflStoreHasSpecialities).filter({isChecked: true}).map(function(d) {
            return {
                certificateDetails: JSON.stringify(d.certificateDetails),
                name: d.label
            };
        }).values();
        if (payload.appraisalFeeType === 'PERCENTAGE') {
            payload.appraisalFeeFixedPriceAbove1000 = null;
            payload.appraisalFeeFixedPriceTill500 = null;
            payload.appraisalFeeFixedPriceTill1000 = null;
        } else if (payload.appraisalFeeType === 'FIXED_PRICE') {
            payload.appraisalFeePercentageAbove1000 = null;
            payload.appraisalFeePercentageTill500 = null;
            payload.appraisalFeePercentageTill1000 = null;
        }
        payload.updatedBy = {
            sid: userDetails.user.sid
        };
        return payload;
    }

    const saveBusinessInfo = (values) => {
          spinner.show("Please wait...");
          const payload = getMyPayload(values);
          payload.createdBy = {
              sid: payload.sid
          };
          
        ApiService.updateStore(userDetails.user.sid, payload).then(
            response => {
                prepopulateStoreInfo(response.data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    const handleChangeByChange = (values) => {
        currentBusinessInfoValues = _.cloneDeep(values);
    }

    return (
        <>
            <fieldset>
                <div class="row bg-white p-0 justify-content-center">
                    <div class="col-lg-12 text-center">
                        <h4>Business Info</h4>
                        <p class="pro-description">Enter the information about your business</p>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-card-store store-form">
                            <Formik
                                enableReinitialize={true}
                                validationSchema={schema}
                                initialValues={initialValues}
                                onSubmit={saveBusinessInfo}>
                                {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty }) => (
                                    <Form noValidate>
                                        <FormikCotext {...{callback: (val) => handleChangeByChange(val)}} />
                                        <div class="form-group text-left">
                                            <div className="row">
                                                <div className="col-5">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Business Hours</h5></Form.Label>
                                                        <Form.Control class="p-2 text-center" as="select"
                                                            name="openingHour"
                                                            value={values.openingHour}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.openingHour}
                                                        >
                                                            {listOfBusinessHours.map((list, index) => {
                                                                return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                            })}
                                                        </Form.Control>
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.openingHour}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-2">
                                                    <p class="middle-label">To</p>
                                                </div>
                                                <div className="col-5">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">&nbsp;</h5></Form.Label>
                                                        <Form.Control class="p-2 text-center" as="select"
                                                            name="closingHour"
                                                            value={values.closingHour}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.closingHour}
                                                        >
                                                            {listOfBusinessHours.map((list, index) => {
                                                                return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                            })}
                                                        </Form.Control>
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.closingHour}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 class="label-head mb-0">Speciality</h5>
                                        {
                                            values.fflStoreHasSpecialities.map((list, index) => {
                                                return <Form.Group className="Specialityblock" key={index}>
                                                    <Form.Check onChange={handleChange} type="checkbox" checked={list.isChecked} name={`fflStoreHasSpecialities.${index}.isChecked`} id={`sbi-fflStoreHasSpecialities.${index}.isChecked`} className="form-checklabel-padding" label={list.label} />
                                                    {
                                                        list.isChecked && <div class="upload-certificates-block mt-2 ml-4">
                                                            <div class="title ml-2">Upload certificates</div>
                                                            {
                                                                !_.isEmpty(list.certificateDetails) && list.certificateDetails.map((file, cIndex) => {
                                                                    return <div class="m-2 border p-2 docList" key={cIndex}>
                                                                        <p className="m0">{file.fileName.split('/').pop()}</p>
                                                                        <span class="delete" onClick={() => removeCertificateBy(index,cIndex)}>x</span>
                                                                    </div>
                                                                })
                                                            }
                                                            <div className="ml-2">
                                                                <a className="add-certificates" data-signin="add" onClick={() => initCertificateUpload(index, values)}>Add New</a>
                                                            </div>
                                                        </div>
                                                    }
                                                </Form.Group>
                                            })
                                        }
                                        <Form.Group>
                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Years of experience<sup>*</sup></h5></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="yearsOfExperience"
                                                value={values.yearsOfExperience}
                                                onChange={handleChange}
                                                onKeyDown={e => e.keyCode === 69 && e.preventDefault()}
                                                isInvalid={!!errors.yearsOfExperience}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.yearsOfExperience}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <h5 class="label-head mb-2">Services Offered</h5>
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} checked={values.appraisalEnabled} type="checkbox" id="sbi-appraisalEnabled" name="appraisalEnabled" label="Appraisals" className="form-checklabel-padding"/>
                                        </Form.Group>
                                        <div>
                                        {values.appraisalEnabled && 
                                            <div className="pl15">
                                                <Form.Group>
                                                    <div class="flx radio-grp">
                                                        <div class="radio-btn mr-3">
                                                            <Form.Check onChange={handleChange} checked={values.appraisalFeeType === 'PERCENTAGE'} type="radio" id="sbi-p-appraisalFeeType" value="PERCENTAGE" name="appraisalFeeType" label="Percentage(%)" className="form-checklabel-padding"/>
                                                        </div>
                                                        <div class="radio-btn">
                                                            <Form.Check onChange={handleChange} checked={values.appraisalFeeType === 'FIXED_PRICE'} type="radio" id="sbi-f-appraisalFeeType" value="FIXED_PRICE" name="appraisalFeeType" label="Fixed Price($)" className="form-checklabel-padding" />
                                                        </div>
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        }
                                        {
                                            values.appraisalEnabled && values.appraisalFeeType === 'PERCENTAGE' && <div className="sub-form-grp">
                                                    <Form.Group as={Row} className="mb-0">
                                                        <div class="col-12">
                                                            <Form.Group as={Row}>
                                                                <Form.Label class="col-6 col-lg-3 mt-2" >0 to 500</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                        type="text"
                                                                            aria-describedby="inputGroupPrependPercentageTill500"
                                                                            name="appraisalFeePercentageTill500"
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                            value={values.appraisalFeePercentageTill500}
                                                                            onChange={handleChange}
                                                                            isInvalid={!!errors.appraisalFeePercentageTill500}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependPercentageTill500">%</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                        {errors.appraisalFeePercentageTill500}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div class="col-12">
                                                            <Form.Group as={Row}>
                                                                <Form.Label class="col-6 col-lg-3 mt-2">501 to 1000</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                        type="text"
                                                                        aria-describedby="inputGroupPrependPercentageTill1000"
                                                                        name="appraisalFeePercentageTill1000"
                                                                        value={values.appraisalFeePercentageTill1000}
                                                                        onPaste={e => e.preventDefault()}
                                                                        onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.appraisalFeePercentageTill1000}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependPercentageTill1000">%</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                        {errors.appraisalFeePercentageTill1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div class="col-12">
                                                            <Form.Group as={Row} className="mb-0">
                                                                <Form.Label class="col-6 col-lg-3 mt-2">Above 1000</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                        type="text"
                                                                        aria-describedby="inputGroupPrependPercentageAbove1000"
                                                                        name="appraisalFeePercentageAbove1000"
                                                                        value={values.appraisalFeePercentageAbove1000}
                                                                        onPaste={e => e.preventDefault()}
                                                                        onKeyDown={e => ((e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 69 || e.keyCode === 107 || e.keyCode === 187) && e.preventDefault())}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.appraisalFeePercentageAbove1000}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependPercentageAbove1000">%</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                        {errors.appraisalFeePercentageAbove1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                            </div>
                                        }
                                        {
                                            values.appraisalEnabled && values.appraisalFeeType === 'FIXED_PRICE' && <div className="sub-form-grp">
                                                
                                                    <Form.Group as={Row} className="mb-0">
                                                        <div class="col-12">
                                                            <Form.Group as={Row}>
                                                                <Form.Label class="col-6 col-lg-3 mt-2" >0 to 500</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                        type="text"
                                                                        aria-describedby="inputGroupPrependFPTill500"
                                                                        name="appraisalFeeFixedPriceTill500"
                                                                        value={values.appraisalFeeFixedPriceTill500}
                                                                        onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.appraisalFeeFixedPriceTill500}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependFPTill500">$</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                        {errors.appraisalFeeFixedPriceTill500}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div class="col-12">
                                                            <Form.Group as={Row}>
                                                                <Form.Label class="col-6 col-lg-3 mt-2">501 to 1000</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                        type="text"
                                                                        aria-describedby="inputGroupPrependFPTill1000"
                                                                        name="appraisalFeeFixedPriceTill1000"
                                                                        value={values.appraisalFeeFixedPriceTill1000}
                                                                        onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.appraisalFeeFixedPriceTill1000}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependFPTill1000">$</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                        {errors.appraisalFeeFixedPriceTill1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div class="col-12">
                                                            <Form.Group as={Row} className="mb-0">
                                                                <Form.Label class="col-6 col-lg-3 mt-2">Above 1000</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                        type="text"
                                                                        aria-describedby="inputGroupPrependFPAbove1000"
                                                                        name="appraisalFeeFixedPriceAbove1000"
                                                                        value={values.appraisalFeeFixedPriceAbove1000}
                                                                        onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.appraisalFeeFixedPriceAbove1000}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupPrependFPAbove1000">$</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                        {errors.appraisalFeeFixedPriceAbove1000}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                            </div>
                                        }
                                        </div>
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} checked={values.layawayEnabled} type="checkbox" id="sbi-layawayEnabled" name="layawayEnabled" label="Layaway" className="form-checklabel-padding" />
                                        </Form.Group>
                                        {
                                            values.layawayEnabled && <div className="sub-form-grp">
                                                    <Form.Group as={Row}>
                                                        <div class="col-12">
                                                            <Form.Group as={Row}>
                                                                <Form.Label class="col-6 col-lg-3 mt-2" >Layaway Period</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <Form.Control class="p-2 text-center" as="select"
                                                                        name="layawayPeriod"
                                                                        value={values.layawayPeriod}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.layawayPeriod}
                                                                    >
                                                                        {layawayPeriodList.map((list, index) => {
                                                                            return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                                        })}
                                                                    </Form.Control>
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.layawayPeriod}
                                                                    </Form.Control.Feedback>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                                    <Form.Group as={Row} className="mb-0">
                                                        <div class="col-12">
                                                            <Form.Group as={Row} className="mb-0">
                                                                <Form.Label class="col-6 col-lg-3 mt-2" >Layaway Fees</Form.Label>
                                                                <div class="col-6 col-lg-4">
                                                                    <Form.Control class="p-2 text-center" as="select"
                                                                        name="layawayFee"
                                                                        value={values.layawayFee}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.layawayFee}
                                                                    >
                                                                        {layawayFeesList.map((list, index) => {
                                                                            return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                                        })}
                                                                    </Form.Control>
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.layawayFee}
                                                                    </Form.Control.Feedback>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                            </div>
                                        }
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} checked={values.inspectionEnabled} type="checkbox" id="sbi-inspectionEnabled" name="inspectionEnabled" label="Inspections" className="form-checklabel-padding" />
                                        </Form.Group>
                                        {values.inspectionEnabled && 
                                            <div class="container">
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                    <Form.Group>
                                                        <div class="d-flex">
                                                            <div class="radio-btn p-2">
                                                                <Form.Check onChange={handleChange} checked={values.inspectionLevel === '1'}  type="radio" id="sbi-inspectionLevel-l1" value="1" name="inspectionLevel" label="Level 1" className="form-checklabel-padding"/>
                                                            </div>
                                                            <div class="radio-btn p-2">
                                                                <Form.Check onChange={handleChange} checked={values.inspectionLevel === '2'}  type="radio" id="sbi-inspectionLevel-l2" value="2" name="inspectionLevel" label="Level 2" className="form-checklabel-padding"/>
                                                            </div>
                                                            <div class="radio-btn p-2">
                                                                <Form.Check onChange={handleChange} checked={values.inspectionLevel === '3'}  type="radio" id="sbi-inspectionLevel-l3" value="3" name="inspectionLevel" label="Level 3" className="form-checklabel-padding"/>
                                                            </div>
                                                        </div>
                                                    </Form.Group>
                                                    </div>
                                                </div>
                                                <div className="row justify-content-center">
                                                    <div className="col-lg-12">
                                                        {
                                                            values.inspectionLevel === '1' && <div class="ml-4 inception-level-block">
                                                                <p class="m-0 pl-2">Preliminary Inspection</p>
                                                                <p class="m-0 pl-2">Function Test</p>
                                                                <p class="m-0 pl-2">Wear & Tear Inspection</p>
                                                            </div>
                                                        }
                                                        {
                                                            values.inspectionLevel === '2' && <div class="ml-4 inception-level-block">
                                                                <p class="m-0 pl-2">Complete Inspection</p>
                                                                <p class="m-0 pl-2">Dis-assembly</p>
                                                            </div>
                                                        }
                                                        {
                                                            values.inspectionLevel === '3' && <div class="ml-4 inception-level-block">
                                                                <p class="m-0 pl-2">Test Firing, etc.,</p>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <Form.Group as={Row} className="justify-content-start">
                                                            <div class="col-10 d-flex ml-4 mt-4">
                                                                <Form.Group as={Row}>
                                                                    <Form.Label column col="6" class="col-6 mt-2 pl-4" >Inspection Fees</Form.Label>
                                                                    <div class="col-6">
                                                                        <InputGroup>
                                                                            <Form.Control
                                                                            type="text"
                                                                            aria-describedby="inputGroupInspectionFee"
                                                                            name="inspectionFee"
                                                                            value={values.inspectionFee}
                                                                            onPaste={e => e.preventDefault()}
                                                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                            onChange={handleChange}
                                                                            isInvalid={!!errors.inspectionFee}
                                                                            />
                                                                            <InputGroup.Append>
                                                                                <InputGroup.Text id="inputGroupInspectionFee">$</InputGroup.Text>
                                                                            </InputGroup.Append>
                                                                            <Form.Control.Feedback type="invalid">
                                                                            {errors.inspectionFee}
                                                                            </Form.Control.Feedback>
                                                                        </InputGroup>
                                                                    </div>
                                                                </Form.Group>
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} checked={values.classesEnabled} type="checkbox" className="form-checklabel-padding" id="sbi-classesEnabled" name="classesEnabled" label="Classes" />
                                        </Form.Group>
                                        {
                                            values.classesEnabled &&
                                            <div class="container">
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                        <Form.Group className="">
                                                            <Form.Check onChange={handleChange} type="checkbox" checked={values.permitClassesEnabled} className="form-checklabel-padding" id="sbi-permitClassesEnabled" name="permitClassesEnabled" label="Permit Classes" />
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                                {
                                                    values.classesEnabled && values.permitClassesEnabled && 
                                                    <div className="row">
                                                        <div className="col-lg-12">
                                                            <Form.Group as={Row} className="justify-content-start">
                                                                <div class="col-10 d-flex ml-4">
                                                                    <Form.Group as={Row}>
                                                                        <Form.Label class="col-6 mt-2 pl-4" >Fees</Form.Label>
                                                                        <div class="col-6">
                                                                            <InputGroup>
                                                                                <Form.Control
                                                                                type="text"
                                                                                aria-describedby="inputGroupPermitClassFee"
                                                                                name="permitClassFee"
                                                                                value={values.permitClassFee}
                                                                                onPaste={e => e.preventDefault()}
                                                                                onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                                onChange={handleChange}
                                                                                isInvalid={!!errors.permitClassFee}
                                                                                />
                                                                                <InputGroup.Append>
                                                                                    <InputGroup.Text id="inputGroupPermitClassFee">$</InputGroup.Text>
                                                                                </InputGroup.Append>
                                                                                <Form.Control.Feedback type="invalid">
                                                                                {errors.permitClassFee}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </div>
                                                                    </Form.Group>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                }
                                                <div className="row">
                                                    <div className="col-lg-12">
                                                    <Form.Group className="">
                                                        <Form.Check onChange={handleChange} type="checkbox" checked={values.trainingClassesEnabled} className="form-checklabel-padding" id="sbi-trainingClassesEnabled" name="trainingClassesEnabled" label="Training Classes" />
                                                    </Form.Group>
                                                    </div>
                                                </div>
                                                {
                                                    values.classesEnabled && values.trainingClassesEnabled && 
                                                    <div className="row">
                                                        <div className="col-lg-12">
                                                            <Form.Group as={Row} className="justify-content-start">
                                                                <div class="col-10 d-flex ml-4">
                                                                    <Form.Group as={Row}>
                                                                        <Form.Label class="col-6 mt-2 pl-4" >Fees</Form.Label>
                                                                        <div class="col-6">
                                                                            <InputGroup>
                                                                                <Form.Control
                                                                                type="text"
                                                                                aria-describedby="inputGroupTrainingClassFee"
                                                                                name="trainingClassFee"
                                                                                value={values.trainingClassFee}
                                                                                onPaste={e => e.preventDefault()}
                                                                                onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                                onChange={handleChange}
                                                                                isInvalid={!!errors.trainingClassFee}
                                                                                />
                                                                                <InputGroup.Append>
                                                                                    <InputGroup.Text id="inputGroupTrainingClassFee">$</InputGroup.Text>
                                                                                </InputGroup.Append>
                                                                                <Form.Control.Feedback type="invalid">
                                                                                {errors.trainingClassFee}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </div>
                                                                    </Form.Group>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        }
                                        <Form.Group className="">
                                            <Form.Check onChange={handleChange} checked={values.fflSaleEnabled} type="checkbox" id="sbi-fflSaleEnabled" className="form-checklabel-padding" name="fflSaleEnabled" label="FFL Sale (Peer to Peer)" />
                                        </Form.Group>
                                        {
                                            values.fflSaleEnabled && 
                                            <div className="row">
                                                <div className="col-lg-12">
                                                    <Form.Group as={Row} className="justify-content-start">
                                                        <div class="col-10 d-flex ml-4">
                                                            <Form.Group as={Row}>
                                                                <Form.Label class="col-6 mt-2 pl-4" >Fees</Form.Label>
                                                                <div class="col-6">
                                                                    <InputGroup>
                                                                        <Form.Control
                                                                        type="text"
                                                                        aria-describedby="inputGroupFFLSaleFee"
                                                                        name="fflSaleFee"
                                                                        value={values.fflSaleFee}
                                                                        onPaste={e => e.preventDefault()}
                                                                        onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                                        onChange={handleChange}
                                                                        isInvalid={!!errors.fflSaleFee}
                                                                        />
                                                                        <InputGroup.Append>
                                                                            <InputGroup.Text id="inputGroupFFLSaleFee">$</InputGroup.Text>
                                                                        </InputGroup.Append>
                                                                        <Form.Control.Feedback type="invalid">
                                                                        {errors.fflSaleFee}
                                                                        </Form.Control.Feedback>
                                                                    </InputGroup>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        }
                                        <div class="row justify-content-end p-3">
                                            <input type="file" accept=".pdf,.doc,.docx" multiple="multiple" className="form-control upload-input" onChange={uploadFiles} />
                                            <input type="button" name="cancel" class="cancel-btn w150px" value="Cancel" onClick={() => {
                                                setStoreViewBy({
                                                    view: '',
                                                    title: ''
                                                });
                                                goToTopOfWindow();
                                            }}/>
                                            <input onClick={handleSubmit} disabled={(isSubmitting || !isValid || !dirty)} type="button" name="next" class="next action-button nextBtn w150px" value="Save" />
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </fieldset>
        </>
    )
}

export default StoreBusinessInfo;
