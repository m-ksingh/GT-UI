import React, { useState, useContext } from 'react';
import { Formik, ErrorMessage} from 'formik';
import { Button, Form } from 'react-bootstrap';
import Modal from '../../Shared/Modal';
import axios from 'axios';
import ApiService from '../../../services/api.service';
import _ from 'lodash';
import $ from 'jquery';
import Spinner from "rct-tpt-spnr";
import classNames from 'classnames';
import { DateInput } from '../../Shared/InputType';
import useToast from '../../../commons/ToastHook';
import { RenewStoreLicenseSchema } from './ValidationSchema/ValidationSchema';

const StoreRenewalModal = ({ 
    show, 
    setShow, 
    nl, 
    updateNotification,
    selectedStore
}) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [files, setFiles] = useState([]);
    const [licenceDoc, setLicenceDoc] = useState('');

    /**  this method trigger to renew store license
    * @param {Object} values = values of renewal form
    */
    const renewStoreLicense = (values) => {
        try {
            spinner.show("Please wait...");
            let storeId = selectedStore ? selectedStore : nl?.notificationJson?.storeSid ? nl?.notificationJson?.storeSid : null;
            let payload = {
                "fflStoreSid": storeId,
                "licenseExpiresOn": values.licenseExpiresOn,
                "storeLicenseUrl": JSON.stringify(licenceDoc)
            }
            ApiService.renewStoreLicense(payload).then(
                response => {
                    if(nl?.notificationJson?.storeSid) {
                        updateNotification(nl?.sid)
                    } 

                    Toast.word_break_success({ message: `Request sent successfully to admin for store license renewal`, time: 3000 });
                    setShow(false);
                    window.location.reload();

                    spinner.hide();
                },
                err => {
                    if(err.response?.status === 406 && nl?.notificationJson?.storeSid){
                        updateNotification(nl?.sid);
                    }
                    spinner.hide();
                    Toast.error({ message: err.response?.data?.error || err.response?.data?.message || "Internal server error...", time: 3000 });
                    setShow(false);
            window.location.reload();

                    console.error('error occur on renewStoreLicense()', err);
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on renewStoreLicense()', err);
        }
    }

    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, (file, index) => {
            return {
                fileName: file,
                mediaType: "doc",
                order: index
            };
        });
        setFiles(uploadedFiles);
        setLicenceDoc(uploadedFiles[0].fileName.data);
        const fileName = uploadedFiles[0].fileName.data.split('/').pop()
        $('#doc').val(fileName);
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
                console.error(err);
            }
        ).finally(() => {
            spinner.hide();
            e.target.value = null;
        });
        // Send formData object
    }

    const initVerifyUpload = () => {
        $('.upload-input:visible').trigger('click');
    }

    return <Modal {...{ show, setShow, className: "pickup-container" }}>
        <div className="pickup-box">
            <div className="fw600">Renew FFL Store License</div>
            <div className="border-top my10"></div>
            <Formik
                initialValues={{
                    "doc": "",
                    "licenseExpiresOn": ""
                }}
                onSubmit={renewStoreLicense}
                validationSchema={RenewStoreLicenseSchema}
            >
                {({ handleSubmit, handleBlur, isSubmitting, touched, errors, values, setFieldValue, validateField, isValid, dirty }) => <form onSubmit={handleSubmit}>
                    <div className="">
                        <div className="row">
                            <div className="col-lg-12">
                                <h5 className="label-head mb-2">Licence Doc<sup>*</sup>(<i className="hint-color">mandatory to upload doc</i>)</h5>
                                <div className="form-group">
                                    <Form.Group>
                                        <input 
                                            readOnly 
                                            type="text" 
                                            required="required" 
                                            placeholder="Upload a copy of your FFL License"
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.doc}
                                            className={classNames("form-control ac-doc-setup", { "border border-danger": !files.length})}
                                            name="doc" 
                                            // value={licenceDoc?.split('/').pop() || ""} 
                                            id="doc" 
                                            onClick={initVerifyUpload} 
                                        />
                                        <input 
                                            type="file" 
                                            accept=".jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,application/msword" 
                                            className="form-control upload-input" 
                                            onChange={uploadFiles} 
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.doc}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <p className="fild-caption">If you choose to upload a copy of your signed and dated FFL License, you must write "For Transfer Only" on the uploaded document, We will email this to the seller if the buyer chooses you.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Form.Group className="pb20">
                            <h5 className="label-head">Expires On<sup>*</sup></h5>
                            <div className="row">
                                <div className="col-sm-6">
                                    <DateInput 
                                        name="licenseExpiresOn" 
                                        className="form-control" 
                                        dateFormat="MM-dd-yyyy" 
                                        minDate={new Date()} 
                                    />
                                </div>
                            </div>
                            <ErrorMessage component="span" name="licenseExpiresOn" className="text-danger mb-2 small-text" />
                        </Form.Group>
                    </div>
                    <div className="my10 jcb aic">
                        <Button variant="light" className="f16 otp-close mr10 w100" onClick={() => { setShow(false) }}>Close</Button>
                        <Button type="submit" disabled={_.isEmpty(licenceDoc) || (isSubmitting || !isValid)} variant="warning h100" className="f16 w100">Renew</Button>
                    </div>
                </form>}
            </Formik>
        </div>
    </Modal>;
}

export default StoreRenewalModal;