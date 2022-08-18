import React, { useContext, memo } from "react";
import $ from 'jquery';
import ApiService from "../../services/api.service";
import { AppContext } from "../../contexts/AppContext";
import { Formik } from "formik";
import Spinner from "rct-tpt-spnr";
import * as Yup from 'yup';
import { useAuthState } from "../../contexts/AuthContext";
import useToast from "../../commons/ToastHook";


function UploadListing({ setShowUpload, storeId,getListing }) {
    const userDetails = useAuthState();
    const {location} = useContext(AppContext)

    const Toast = useToast();
    const spinner = useContext(Spinner);
    const schema = Yup.object().shape({
        pinCode: Yup.string()
            .required("Required")
            .matches(/^[0-9]+$/, "Must be only digits")
            .min(5, 'Must be exactly 5 digits')
            .max(5, 'Must be exactly 5 digits')
    })


    const uploadCreateListing = (e)=> {
        try{
        let header = {
            "lat": location.position?.lat,
            "longi": location.position?.lon || location.position?.lng
        }
        let formData = new FormData();
        formData.append('file', e);
        spinner.show("Please wait...");
        ApiService.uploadCreateListing(userDetails.user.sid, storeId, formData, header).then(
            response => {
                setShowUpload(false)
                spinner.hide();
                getListing()
                Toast.success({ message: 'Listing created successfully', time: 2000});
            },
            err => {
                Toast.success({ message: err[0]?.message, time: 2000});
                setShowUpload(false)
                  spinner.hide();
                // setFileError(false)
            }
        ).finally(() => {
            setShowUpload(false)
            spinner.hide();
        });
    }catch(err){
        console.error("error occur on uploadCreateListing()",err)
    }
        // Send formData object
    }

    const initImageUpload = () => {
        $('.upload-inputs:visible').trigger('click');
    }

    return (
        <>
            <div className="cd-signin-modal js-signin-modal">
                <div className="cd-signin-modal__container location">
                    <div class="row">
                        <div class="col-lg-12 changeLocation-popup-box">
                            <div class="js-signin-modal-block border-radius" data-type="changeLocation">
                                <div class="changeLocation-head">
                                    <h2>Create Bulk Listing</h2>
                                </div>
                                <div class="changeLocation-body csvFile">
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={{
                                            fileData: ''
                                        }}
                                        onSubmit={(value) => {}}
                                        validationSchema={schema}
                                    >
                                        {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty,setFieldValue }) => (
                                            <form >
                                                <ul class="image-upload-btn d-flex justify-content-center">
                                                    <li class="imgU-btn iuFstbtnSur cursor-pointer pl-3 mx-0" onClick={() => { initImageUpload() }}>Upload Document</li>
                                                </ul>
                                                <p className="fild-caption text-center  label-head">{values.fileData?.name}</p>

                                                <p class="fild-caption  pt-3 label-head"> <a className="underline" href="https://s3.ap-south-1.amazonaws.com/eserve-alchemy-dev/1619944978648-listing_details.csv">Download Sample CSV</a></p>
                                                <input type="file" multiple accept=".csv" className="form-control upload-inputs" onChange={(e)=> setFieldValue("fileData",e.target.files[0]) } />
                                                
                                                <p className="fild-caption   label-head">Download the above sample csv file to fill the information and upload the file</p>
                                                <input type="button" name="next" disabled={!values.fileData} className="next action-button nextBtn full-w mx-0" value="Create Listing" onClick={()=> uploadCreateListing(values.fileData)}/>
                                            </form>)
                                        }
                                    </Formik>
                                </div>
                            </div>
                        </div>
                        <a class="cd-signin-modal__close js-close" onClick={() => setShowUpload(false)} >Close</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default memo(UploadListing);