import React, { useState, useContext } from 'react'
import Spinner from "rct-tpt-spnr";
import { Formik, Field } from "formik"
import * as Yup from 'yup';
import _, { values } from 'lodash';
import { Form, FormControl, InputGroup } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { SubmitField } from "../Shared/InputType";
import useToast from '../../commons/ToastHook';

const ForgetPassword = ({ setModalTab }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const notRegisterMailId = [];

    /**
     * This is a formik schema validation
     */
    const schema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email format")
            .required("Required!")
    });

    /**
     * This is used for before send the forgot password link validate the registered or not registered mail id .
     * @param {String} values -- Values for email inputs field.
     * @returns -- Errors through to Yup validation
     */
    const validate = (values) => {
        let errors = {};
        if (notRegisterMailId.includes(values.email)) {
            errors.email = 'Please enter your email address registered with us';
        }
        return errors;
    }

    const onSubmitted = (values, { setSubmitting, setFieldError }) => {
        try {
            if (!_.isEmpty(values)) {
                spinner.show("Please wait...");
                ApiService.forgotPassword(values).then(
                    response => {
                        Toast.word_break_success({ message: 'Email has been sent!, please click on link to reset password', time: 4000 });
                        setModalTab('login');
                    },
                    err => {
                        setFieldError('email', 'Please enter your email address registered with us');
                        notRegisterMailId.push(err?.data?.email);
                        Toast.error({ message: !_.isEmpty(err.response) && err.response.data ? err.response.data.error : 'Something went wrong, Please try after sometimes', time: 2000 });
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
    return (<>
        <div className=" js-signin-modal-block">
            <h2>Reset Password</h2>
            <p className="log-cap cd-signin-modal__message">Please enter your email address. You will receive a link to create a new password.</p>
            <Formik
                validationSchema={schema}
                initialValues={{
                    email: '',
                }}
                onSubmit={onSubmitted}>
                {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty }) => (
                    <Form noValidate>
                        <Form.Group>
                            <Form.Label><span>Email<sup>*</sup></span></Form.Label>
                            <InputGroup>
                                {/* <InputGroup.Prepend>
                                    <InputGroup.Text>
                                        <label className="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" htmlFor="signin-email"></label>
                                    </InputGroup.Text>
                                </InputGroup.Prepend> */}
                                <FormControl
                                    type="text"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={values.email}
                                    onChange={handleChange}
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        <SubmitField id="gt-reset-password" label="Reset Password" disabled={isSubmitting || !isValid || !dirty} onClick={handleSubmit} />
                        <p className="cd-signin-modal__bottom-message js-signin-modal-trigger"><a onClick={() => setModalTab("login")}>Back to log-in</a></p>
                    </Form>
                )}
            </Formik>
        </div>
    </>)
}
export default ForgetPassword