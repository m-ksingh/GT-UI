import React, { useState, useContext } from 'react';
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Form, InputGroup } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { SubmitField } from "../Shared/InputType";
import { useAuthState } from  '../../contexts/AuthContext/context';
import { useHistory } from 'react-router-dom';
import useToast from '../../commons/ToastHook';
let defaultValues = {
    password: '',
    newPassword:'',
    newConfirmPassword: ''
};
const ChangePassword = () => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const history = useHistory();
    let userDetails = useAuthState();
    const [initialValues, setInitialValues] = useState(defaultValues);
    const schema = Yup.object().shape({
        password: Yup.string()
        .required('Please Enter your password'),
        newPassword: Yup.string()
        .required('Please Enter your new password')
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
          "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
        ),
        newConfirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required("Required!"),
      });
      const onPasswordSubmitted = (values, { setSubmitting, resetForm }) => {
        try {
            if (!_.isEmpty(values)) {
                spinner.show("Please wait...");
                ApiService.changePassword(values.password, values.newConfirmPassword, userDetails.user.sid).then(
                    response => {
                        resetForm();
                        Toast.success({ message: 'Password updated successfully', time: 2000});
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
    return <>
        <h2 className="card-title-header">Change Password</h2>
        <div className="myac-piBox">
            <Formik
            enableReinitialize={true}
            validationSchema={schema}
            initialValues={initialValues}
            onSubmit={onPasswordSubmitted}>
            {({ handleSubmit, isSubmitting, handleChange, resetForm, errors, values, isValid, dirty }) => (
                <Form noValidate>
                    <Form.Group>
                        <Form.Label><span>Enter Current Password<sup className='sup-color'>*</sup></span></Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><span>Enter New Password<sup className='sup-color'>*</sup></span></Form.Label>
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
                        <Form.Label><span>Confirm New Password<sup className='sup-color'>*</sup></span></Form.Label>
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
                    <div className="row">
                                <div className="col-lg-12 text-right  mobile-off">
                                    <ul className="profile-btnList">
                                        {/* <li><button type="button" className="submt-btn submt-btn-lignt" onClick={() => resetForm()}>Cancel</button></li> */}
                                        <li onClick={() => {history.replace("/")}}><a class="submt-btn submt-btn-lignt mr10 pointer">Cancel</a></li>
                                        <li><button type="submit" className="submt-btn submt-btn-dark" disabled={!isValid || isSubmitting || !dirty} onClick={handleSubmit}>Save</button></li>
                                    </ul>
                                </div>
                            </div>
                            <section class="mobile-btn-section desktop-off">
                                <div class="container">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="proPg-btnArea">
                                                <ul>
                                                <li onClick={() => {history.replace("/")}} ><a class="submt-btn submt-btn-lignt mr10 pointer">Cancel</a></li>
                                                    <li><button type="submit" className="submt-btn submt-btn-dark probtn-pading" disabled={!isValid || isSubmitting || !dirty} onClick={handleSubmit}>Save</button></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                    {/* <div class="row justify-content-center mr-2 .chnage-pass">
                        <input onClick={handleSubmit} disabled={(isSubmitting || !isValid || !dirty)} type="button" name="next" class="next action-button nextBtn" value="Save" />
                    </div> */}
                </Form>)}
            </Formik>
        </div>
    </>;
}

export default ChangePassword;