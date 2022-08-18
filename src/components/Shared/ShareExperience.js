import React, { useContext, useState } from 'react';
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import axios from 'axios';
import $ from 'jquery';
import { Form } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { useAuthState } from  '../../contexts/AuthContext/context';
import StarRating from './StarRating';
import { PlusCircleIcon } from "../icons";
import useToast from '../../commons/ToastHook';

function ShareExperience({listingInfo, setShareExpModal, setShow, updateNotification}) { 
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [files, setFiles] = useState([]);
    const [isReachedMaxLimit, setIsReachedMaxLimit] = useState(false);
    const [productRating, setProductRating] = useState(5);
    const [sellerRating, setSellerRating] = useState(5);
    const [fileError, setFileError] = useState(false);
    const schema = Yup.object().shape({
        headline: Yup.string()
        .required("Required!"),
        reviewComment: Yup.string()
        .required("Required!")
    });
    const onReviewSubmitted = (values, { setSubmitting }) => {
        try {
            if (!_.isEmpty(values)) {
                const images = files.map((img, index) => {
                    return {
                        fileName: img,
                        mediaType: "images",
                        order: index
                    };
                });
                const shareExpPayload = {
                    "headline": values.headline,
                    "listingDetailsSid": listingInfo.notificationJson.sid,
                    // "productImageUrl": files.length ? JSON.stringify(files[0].fileName) : null,
                    "productImageUrl": JSON.stringify(images),
                    "productRating": productRating,
                    "reviewComment": values.reviewComment,
                    "reviewerSid": listingInfo.notificationJson.buyerSid,
                    "sellerRating": sellerRating,
                    "sellerSid": userDetails.user.sid
                };
                spinner.show("Please wait...");
                ApiService.shareExperiance(shareExpPayload).then(
                    response => {
                        Toast.success({ message: 'Thanks for sharing your experience', time: 2000});
                        setShareExpModal(false);
                        if (setShow) {
                            updateNotification(listingInfo.sid);
                            setShow(false);
                        }
                    },
                    err => {
                        Toast.error({ message: !_.isEmpty(err.response) && err.response.data ? err.response.data.error : 'Something went wrong, Please try after sometimes', time: 2000});
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

    const initImageUpload = () => {
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

    const sellerSelectedStars = (stars) => {
        setSellerRating(stars);
    }

    const productSelectedStars = (stars) => {
        setProductRating(stars);
    }

  return ( 
    <>
        <div className="cd-signin-modal js-signin-modal">
            <div className="cd-signin-modal__container report-problem">
                <div class="row justify-content-center">
                    <div class="col-11 changeLocation-popup-box">
                        <div class="js-signin-modal-block border-radius" data-type="shareReview">
                            <div class="changeLocation-head pl-0 border-bottom">
                                <h2>Share Experience</h2>
                            </div>
                            <Formik
                                validationSchema={schema}
                                initialValues={{
                                    headline:'',
                                    reviewComment:'',
                                }}
                                onSubmit={onReviewSubmitted}>
                                {({ handleSubmit, isSubmitting, handleChange, handleBlur, touched, errors, values, isValid, dirty }) => (
                                    <Form noValidate className="pt-4">
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 class="label-head mb-0">Add a photo</h5>
                                                <p class="helpful-text">Shoppers find images more helpful than text alone.</p>
                                                <div className="flx gp5 flx-wrap">
                                                    {
                                                        !_.isEmpty(files) && files.map((item, index) => {
                                                            return  <div class="item sm-images" key={index}>
                                                                <img src={item.fileName || item.key} class="img-fluid" alt={item.fileName || item.key} />
                                                            </div>
                                                        })
                                                    }
                                                </div>
                                             
                                                <div className='cp mt10' onClick={() => { initImageUpload(); setFileError(false) }}>
                                                    <PlusCircleIcon width={"20px"} /> <span class="helpful-text">Add Image</span>
                                                </div>
                                                {fileError && <p className="fild-caption text-center pb-2 label-head text-danger">!Error please upload file size less then 40MB</p>}
                                                <input type="file" multiple accept=".jpg,.jpeg,.png" className="form-control upload-input" onChange={uploadFiles} />
                                            </div>
                                        </div>
                                        <Form.Group>
                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Add a headline</h5></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="What’s important to know?"
                                                name="headline"
                                                value={values.headline}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={!!errors.headline && !!touched.headline}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.headline}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Add a written review</h5></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="reviewComment"
                                                placeholder="What did you like or dislike about this product?"
                                                value={values.reviewComment}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                isInvalid={!!errors.reviewComment && !!touched.headline}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.reviewComment}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 class="label-head mb-0">Product rating</h5>
                                                <StarRating totalStars={5} selected={productRating} {...{updateSelectedStars: productSelectedStars}} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-12">
                                                <h5 class="label-head mb-0">Seller rating</h5>
                                                <StarRating totalStars={5} selected={sellerRating} {...{updateSelectedStars: sellerSelectedStars}} />
                                            </div>
                                        </div>
                                        <input onClick={handleSubmit}  disabled={isSubmitting || !isValid || !dirty} type="button" name="next" class="next action-button nextBtn fullWidthBtn" value="Submit" />
                                    </Form>)}
                            </Formik>
                        </div>
                    </div>
                    <a class="cd-signin-modal__close js-close" onClick={() => setShareExpModal(false)}>Close</a>
                </div>
            </div>
        </div>
    </> 
  ); 
} 
  
export default ShareExperience;