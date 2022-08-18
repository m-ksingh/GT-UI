import React, { useContext } from 'react';
import { Formik, Field, ErrorMessage } from "formik"
import Input, { isValidPhoneNumber } from 'react-phone-number-input/input'
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Form } from 'react-bootstrap';
import ApiService from '../../../../services/api.service';
import { useAuthState } from '../../../../contexts/AuthContext/context';
import useToast from '../../../../commons/ToastHook';

const defaultValuesAdmin = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
};

const AddAdmin = ({ adminModelAction, storeId }) => {

    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);

    const schema = Yup.object().shape({
        firstName: Yup.string()
            .required("Required!"),
        lastName: Yup.string()
            .required("Required!"),
        email: Yup.string()
            .email("Invalid email format")
            .required("Required!"),
        phoneNumber: Yup.number()
            .required("Required!")
    });


    const initAddAdmin = (values) => {
        spinner.show("Please wait...");
        ApiService.addAdmin(userDetails.user.sid, storeId, values).then(
            response => {
                adminModelAction(false, true);
                Toast.success({ message: 'Store Admin has been added successfully', time: 2000 });
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }


    return (
        <>
            <div className="container p-3">
                <div className="row border-bottom pb-2">
                    <div class="col">
                        <h4>Add Store Admin</h4>
                    </div>
                </div>
                <div className="row justify-content-center mt-3">
                    <div class="col">
                        <Formik
                            validationSchema={schema}
                            initialValues={defaultValuesAdmin}
                            onSubmit={initAddAdmin}>
                            {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty, handleBlur }) => (
                                <Form>
                                    <Form.Group>
                                        <Form.Label><h5 class="label-head">First Name<sup>*</sup></h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={values.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.firstName && !!touched.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.firstName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label><h5 class="label-head">Last Name<sup>*</sup></h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={values.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.lastName && !!touched.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lastName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label><h5 class="label-head">Email<sup>*</sup></h5></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={!!errors.email && !!touched.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label><h5 class="label-head">Phone Number<sup>*</sup></h5></Form.Label>
                                        {/* <Form.Control
                                    type="text"
                                    name="phoneNumber"
                                    value={values.phoneNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={!!errors.phoneNumber && !!touched.phoneNumber}
                                /> */}
                                        <Field
                                            name="phoneNumber"
                                            validate={(value) => (value && isValidPhoneNumber(value) ? '' : `${(value?.length > 0) ? 'Enter valid phone number' : 'Enter valid phone number'}`)} >
                                            {({ field: { name, value }, form: { setFieldTouched } }) => (<div onClick={() => setFieldTouched(name, true)}>
                                                <Input
                                                    defaultCountry="US"
                                                    value={values?.phoneNumber ?? ""}
                                                    //className={`form-control ${errors[name] && 'is-invalid'}`}
                                                    className={`form-control ${touched.phoneNumber && errors.phoneNumber && 'is-invalid' }`}
                                                    onChange={e => { setFieldValue("phoneNumber", e) }}
                                                    isInvalid={!!touched.phoneNumber && !!errors.phoneNumber}
                                                />
                                            </div>)}
                                        </Field>
                                        <ErrorMessage component="span" name="phoneNumber" className="text-danger mb-2 small-text" />
                                    </Form.Group>
                                    <div class="row justify-content-end mr-2">
                                        <input type="button" class="cancel-btn" value="Cancel" onClick={() => adminModelAction(false, false)} />
                                        <input onClick={handleSubmit} disabled={isSubmitting || !isValid || !dirty} type="button" name="save" class="next action-button nextBtn" value="Save" />
                                    </div>
                                </Form>)}
                        </Formik>
                    </div>
                </div>
            </div>
            <a class="cd-signin-modal__close js-close" onClick={() => adminModelAction(false, false)} >Close</a>
        </>
    );
}

export default AddAdmin;