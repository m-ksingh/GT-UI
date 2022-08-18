import React, { useState, useContext } from 'react'
import Spinner from "rct-tpt-spnr";
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import { Form, InputGroup } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { SubmitField } from "../Shared/InputType";
import useToast from '../../commons/ToastHook';

const RequestVerificationLink = ({ setModalTab }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [alreadyVerify, setAlreadyVerify] = useState(false);
    const [isRequestSent, setIsRequestSent] = useState(false);
    const schema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email format")
            .required("Required!")
    });

    const onSubmitted = (values) => {
        if(values.email) {
            try {
                spinner.show("Requesting link... Please wait...");
                ApiService.requestEmailLink(values.email).then(
                    response => {
                        setIsRequestSent(true);
                    },
                    err => {
                        if(err && err.response?.status === 406) setAlreadyVerify(true);
                        if(err && err.response?.status === 401) Toast.error({ message: "Please enter valid email address."})
                        setIsRequestSent(false);
                        console.error('Error occurred in requestEmailLink--', err);
                    }
                ).finally(() => {
                    spinner.hide();
                });
            } catch (err) {
                setIsRequestSent(false);
                spinner.hide();
                console.error('Error occurred in requestEmailLink--', err);
            }
        }
    }
    return (<>
        <div className=" js-signin-modal-block">
            <h2>Request Verification Link</h2>
            <p className="log-cap cd-signin-modal__message">Please enter your email address. You will receive a link to verify your email id.</p>
            <Formik
                validationSchema={schema}
                initialValues={{
                    email: '',
                }}
                onSubmit={onSubmitted}>
                {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty }) => (
                    <Form noValidate>
                  {!isRequestSent && !alreadyVerify && <div>
                            <Form.Group>
                                <Form.Label><span>Email</span></Form.Label>
                                <InputGroup>
                                    <Form.Control
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
                            <SubmitField id="gt-request-verification-link" label="Request Link" disabled={!isValid || !dirty} onClick={handleSubmit} />
                        </div>}
                        {isRequestSent && <div className="text-center py20">
                            <div>Verification link successfully sent to <span className="text-semi-bold">{values.email ? values.email : " email id. "}</span> Please check your mail.</div>
                        </div>}
                        {alreadyVerify && <div className="text-center py20">Your email id is already verified.</div>}
                        
                        <p className="cd-signin-modal__bottom-message js-signin-modal-trigger"><a onClick={() => setModalTab("login")}>Back to log-in</a></p>
                    </Form>
                )}
            </Formik>
        </div>
    </>)
}
export default RequestVerificationLink;