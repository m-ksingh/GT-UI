import React, { useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Spinner from "rct-tpt-spnr";
import useToast from "../../commons/ToastHook";
import _ from 'lodash';
import ApiService from '../../services/api.service';
import * as Yup from 'yup';

function ManageQuantityModal({ show, setShow, selectedListing, callback = () => {} }) {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [quantity, setQuantity] = useState(selectedListing?.quantity || 0);

    const ManageQuantitySchema = Yup.object().shape({
        quantity: Yup.string()
            .matches(/^[+0-9]+$/,"Must be only digits and positive value")
            .required("Quantity is required!"),
    });

    const manageQuantity = (value) => {
        try {
            spinner.show("Updating quantity... Please wait...");
            ApiService.manageQuantity(selectedListing.sid, value.quantity).then(
                response => {
                    callback();
                    Toast.success({ message: "Quantity updated successfully", time: 2000 });
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.message || err.response?.data.status) : '' });
                    console.error("Error occurred in manageQuantity--", err);
                }
            ).finally(() => {
                setShow(false);
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error("Error occurred in manageQuantity--", err);
        }
    }
    
    return (
        <>
            <div className="cd-signin-modal js-signin-modal">
                <div className="cd-signin-modal__container location">
                    <div class="row">
                        <div class="col-lg-12 changeLocation-popup-box">
                            <div class="js-signin-modal-block border-radius" data-type="changeLocation">
                                <div class="p15 fw600">
                                    Manage Quantity
                                </div>
                                <div class="changeLocation-body">
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={{
                                            quantity: quantity
                                        }}
                                        onSubmit={(value) => {manageQuantity(value);}}
                                        validationSchema={ManageQuantitySchema}
                                    >
                                        {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty }) => (
                                            <Form noValidate>
                                               <div className="pb20 mb20">
                                                   <div className="theme-color f12">Available Quantity <sup>*</sup></div>
                                                   <div className="aic">
                                                       <div onClick={() => {Number(values.quantity) > 0 && setQuantity(Number(values.quantity) - 1)}} className={`${Number(values.quantity) > 0 ? "pointer" : "disabled"}`}><i class="fa fa-minus-circle" aria-hidden="true"></i></div>
                                                       <div className="px10">
                                                           <Field onChange={(e) => setQuantity(e.target.value)} value={values.quantity} className="form-control" />
                                                           {/* <ErrorMessage component="div" name="quantity" className="text-danger mb-2 small-text" /> */}
                                                        </div>
                                                       <div onClick={() => setQuantity(Number(values.quantity) + 1)} className="pointer"><i class="fa fa-plus-circle" aria-hidden="true"></i></div>
                                                   </div>
                                                  {!isValid && errors && <div className="text-danger mb-2 small-text pl25">{errors.quantity}</div>}
                                               </div>
                                               <div className="row">
                                                    <div className="col-4"></div>
                                                    <div className="col-8">
                                                        <div class="aic jcc">
                                                            <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => setShow(false)}></input>
                                                            <input type="button" value="Save" class="submt-btn submt-btn-dark" disabled={values.quantity === "" || !isValid} onClick={handleSubmit}></input>
                                                        </div>
                                                    </div>
                                               </div>
                                               
                                            </Form>)
                                        }
                                    </Formik>
                                </div>
                            </div>
                        </div>
                        <a class="cd-signin-modal__close js-close" onClick={() => setShow(false)} >Close</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManageQuantityModal;