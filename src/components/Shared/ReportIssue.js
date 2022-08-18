import React, { useContext, useState, useEffect, useRef } from 'react';
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Form, InputGroup } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { SubmitField } from "../Shared/InputType";
import { useAuthState, useAuthDispatch } from '../../contexts/AuthContext/context';
import useToast from '../../commons/ToastHook';
import { NOTIFICATION_CONSTANTS } from '../Profile/Notification/Constants/NotificationConstants';
import { IcnTrashRed } from '../icons'
// owl-carousel
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import $ from 'jquery';
import axios from 'axios';

function ReportIssue({ listingInfo, setReportModal, reportType, setShow, updateNotification, NewNotification }) {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [listOfIssueTypes, setListOfIssueTypes] = useState([]);

    let imgInfoRef = useRef();
    const [fileError, setFileError] = useState(false);
    const [isReachedMaxLimit, setIsReachedMaxLimit] = useState(false);
    const [files, setFiles] = useState([]);
    const [, forceRender] = useState();

    const initImageUpload = () => {
        $('.camera-input:visible').trigger('click');
    }

    const initOpenCamera = () => {
        $('.upload-input:visible').trigger('click');
    }

    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, file => {
            return file.data;
        });
        const filesList = _.concat(files, uploadedFiles);
        setFiles(filesList);
    }

    function uploadFiles(e) {
        // Create an object of formData
        let formData;
        const fileValue = e.target.files[0]?.size / (1024 * 1024)
        const listOfFiles = [];
        if ([...e.target.files, ...files].length > 5) {
            setIsReachedMaxLimit(true);
            return;
        } else {
            setIsReachedMaxLimit(false);
        }
        if (fileValue > 40) {
            setFileError(true)
            return;
        }
        _.each(e.target.files, file => {
            formData = new FormData();
            formData.append('file', file);
            listOfFiles.push(ApiService.uploadMultiPart(formData))

        })
        spinner.show("Please wait...");
        axios.all(listOfFiles).then(
            response => {
                setMultiFilesToDisplay(response);
                setFileError(false)
            },
            err => {
                console.error(err);
                setFileError(false)
            }
        ).finally(() => {
            spinner.hide();
            e.target.value = null;
        });
        // Send formData object
    }

    // this method call to delete image
    const deleteImage = (index) => {
        try {
            let tmpImg = [...files];
            tmpImg.splice(index, 1);
            setFiles(tmpImg);
            
            if (tmpImg.length <= 5 ) {
                setIsReachedMaxLimit(false);
            }
        } catch (err) {
            console.error("Error occur when deleteImage--", err);
        }
    }

    useEffect(() => {
        forceRender(Date.now());
        imgInfoRef.current = files;
    }, [files])





    const schema = Yup.object().shape({
        deliveryIssuesSid: Yup.string()
            .required("Required!"),
        description: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(1032, "1032 Characters Maximum")
            .required("Required!")
    });
    
    const onReportSubmitted = (values, { setSubmitting }) => {
        try {
            if (!_.isEmpty(values)) {
                const images = files.map((img, index) => {
                    return {
                        fileName: img,
                        mediaType: "images",
                        order: index
                    };
                });
                const reportIssues = {
                    "appUsersSid": userDetails.user.sid,
                    "deliveryIssuesSid": values.deliveryIssuesSid,
                    "deliveryIssueContent": JSON.stringify(images),
                    "description": values.description,
                    "type": reportType,
                    "listingSid": reportType === NOTIFICATION_CONSTANTS.USER_TYPE.PRODUCT ? listingInfo.sid : listingInfo.notificationJson.sid,
                    "orderHasListingSid": null
                };
                if (reportType === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER
                    || reportType === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER)
                    reportIssues.orderHasListingSid = listingInfo.notificationJson.ohl;
                spinner.show("Please wait...");
                ApiService.reportIssue(reportIssues).then(
                    response => {
                        Toast.success({ message: 'Thanks for reporting the problem', time: 2000 });
                        // if report problem raised from notification then delete notification once reported successfully
                        if(setShow) {
                            updateNotification(listingInfo.sid);
                            setShow(false);
                        }
                        setReportModal(false);
                    },
                    err => {
                        Toast.error({ message: err.response && err.response.data ? err.response.data.error : 'Internal server error! Please try after sometime.', time: 2000 });
                    }
                ).finally(() => {
                    spinner.hide();
                    setSubmitting(false);
                });
            }
        } catch (err) {
            setSubmitting(false);
            console.error("Exception occurred in onSubmitted --- " + err);
        }
    }

    const initIssueTypeList = () => {
        spinner.show("Please wait...");
        ApiService.issueTypeList(reportType).then(
            response => {
                setListOfIssueTypes(response.data);
            },
            err => {
                console.error(err);
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    useEffect(() => {
        initIssueTypeList();
    }, [])

    return (
        <>
            <div id="report-issue-owl" className="cd-signin-modal js-signin-modal">
                <div className="cd-signin-modal__container report-problem">
                    <div class="row justify-content-center">
                        <div class="col-11 changeLocation-popup-box">
                            <div class="js-signin-modal-block border-radius" data-type="shareReview">
                                <div class="changeLocation-head pl-0 border-bottom">
                                    <h2>Report an issue</h2>
                                </div>
                                <Formik
                                    validationSchema={schema}
                                    initialValues={{
                                        deliveryIssuesSid: '',
                                        description: '',
                                    }}
                                    onSubmit={onReportSubmitted}>
                                    {({ handleSubmit, isSubmitting, handleChange, handleBlur, touched, errors, values, isValid, dirty }) => (
                                        <Form noValidate className="pt-4 pb-4" encType="multipart/form-data">
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Select the issue type<sup>*</sup></h5></Form.Label>
                                                <Form.Control as="select"
                                                    name="deliveryIssuesSid"
                                                    value={values.deliveryIssuesSid}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={!!errors.deliveryIssuesSid && !!touched.deliveryIssuesSid}
                                                >
                                                    <option value=""> - Select an Issue - </option>
                                                    {listOfIssueTypes.map((list, index) => (
                                                        <option key={index} value={list.sid}>{list.issue}</option>
                                                    ))}
                                                </Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.deliveryIssuesSid}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Describe your issue<sup>*</sup></h5></Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={5}
                                                    name="description"
                                                    placeholder="Write..."
                                                    value={values.description}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    isInvalid={!!errors.description && !!touched.description}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.description}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label class="p-0"><h5 class="label-head mb-0">Upload Photo(s)</h5></Form.Label>
                                                <p>Upload image(s) describing the issue so that we can resolve your issue smoothly</p>
                                            </Form.Group>
                                            {fileError && <p className="fild-caption text-center pb-2 label-head text-danger">!Error please upload file size less then 40MB</p>}

                                            <ul className="image-upload-btn-issue">
                                                <li className="imgU-btn iuFstbtn cursor-pointer" disabled={files.length > 5} onClick={() => { initImageUpload(); setFileError(false) }}>Upload Picture</li>
                                            </ul>
                                            <p className={`fild-caption text-center pt-3 label-head ${isReachedMaxLimit ? "text-danger" : ""}`}>(Minimum 1 photo & Maximum 5 photos allowed)<sup>*</sup></p>
                                            <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" className="form-control upload-input" onChange={uploadFiles} />
                                            <input type="file" multiple accept="image/*" capture="camera" className="form-control camera-input" onChange={uploadFiles} />
                                            <div className="col-lg-12 mb-5">
                                                <div className="row">
                                                    <div className="col-lg-12 d-flex justify-content-center">
                                                        <div className="col-lg-6">
                                                            <div id="demo-pranab report-issue-img">
                                                                {
                                                                    !_.isEmpty(files)
                                                                    && <OwlCarousel id="owl-item-details" className='owl-theme carousel-container' loop nav autoplay autoplayHoverPause margin={20} items={1} autoplayTimeout={2000} responsive={{
                                                                        0: {
                                                                            items: 1
                                                                        },
                                                                        600: {
                                                                            items: 1
                                                                        },
                                                                        1000: {
                                                                            items: 1
                                                                        }
                                                                    }}>
                                                                        {
                                                                            files.length && files.map((item, index) => {
                                                                                return <div className="item product-images-min product-images-max" key={index}>
                                                                                    <div className="upload-delete-icn" onClick={() => deleteImage(index)}><IcnTrashRed /></div>
                                                                                    <div className="prod-image-div prod-image-div-issue" style={{ backgroundImage: `url(${item})` }} accept="image/*"></div>
                                                                                </div>
                                                                            })
                                                                        }
                                                                    </OwlCarousel>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <input onClick={handleSubmit} disabled={isSubmitting || !isValid || !dirty} type="submit" name="next" class="next action-button nextBtn fullWidthBtn" value="Submit" />
                                        </Form>
                                        )}
                                </Formik>
                            </div>
                        </div>
                        <a class="cd-signin-modal__close js-close" onClick={() => setReportModal(false)} >Close</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReportIssue;