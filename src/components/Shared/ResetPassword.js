import React, { useState, useContext, useEffect } from 'react';
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Form } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { useParams, useHistory} from 'react-router-dom';
import useToast from '../../commons/ToastHook';
let defaultValues = {
    newPassword:'',
    newConfirmPassword: ''
};
const ResetPassword = () => {

    const Toast = useToast();
    const spinner = useContext(Spinner);
    // get id of current product
    const {token} = useParams();
    const history = useHistory();
    const [appUser, setAppUser] = useState({});
    const [initialValues, setInitialValues] = useState(defaultValues);
    const schema = Yup.object().shape({
        newPassword: Yup.string()
        .required('Please Enter your password')
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
          "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
        ),
        newConfirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required("Required!"),
      });
      const onResetPasswordSubmitted = (values, { setSubmitting, resetForm }) => {
        try {
            if (!_.isEmpty(values) && appUser.sid) {
                spinner.show("Please wait...");
                ApiService.resetPassword(values.newConfirmPassword, token, appUser.sid).then(
                    response => {
                        resetForm();
                        Toast.success({ message: 'Password reset successfully. please login.', time: 2000});
                        history.push('/');
                    },
                    err => {
                        setSubmitting(false);
                        Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
                    }
                ).finally(() => {
                    spinner.hide();
                });                
            }
        } catch (err) {
            setSubmitting(false);
            console.error("Exception occurred in onSubmitted --- " + err);
        }
    }

    const initAppUserByToken = () => {
        spinner.show("Please wait...");
        ApiService.appUserByToken(token).then(
            response => {
                setAppUser(response.data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        });                
    }

    useEffect(() => {
        initAppUserByToken();
    }, [])
    return <>
        <section id="reset-password-section">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-10 pt-2">
                        <div className="carousel-head myac-head">
                            <h2>Change Password</h2>
                        </div>

                        <div className="myac-piBox">
                            <Formik
                            enableReinitialize={true}
                            validationSchema={schema}
                            initialValues={initialValues}
                            onSubmit={onResetPasswordSubmitted}>
                            {({ handleSubmit, isSubmitting, handleChange, resetForm, errors, values, isValid, dirty }) => (
                                <Form noValidate>
                                    <Form.Group>
                                        <Form.Label><span>Enter New Password</span></Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter New Password"
                                            name="newPassword"
                                            value={values.newPassword}
                                            onChange={handleChange}
                                            isInvalid={!!errors.newPassword}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.newPassword}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label><span>Confirm New Password</span></Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm New Password"
                                            name="newConfirmPassword"
                                            value={values.newConfirmPassword}
                                            onChange={handleChange}
                                            isInvalid={!!errors.newConfirmPassword}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.newConfirmPassword}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <div class="row justify-content-end mr-2">
                                        <input onClick={handleSubmit} disabled={(isSubmitting || !isValid || !dirty)} type="button" name="next" class="next action-button nextBtn text-center" value="Reset Password" />
                                    </div>
                                </Form>)}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>;
}

export default ResetPassword;