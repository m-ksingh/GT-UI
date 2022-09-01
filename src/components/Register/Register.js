import React, { useContext, useState, useRef } from 'react';
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Form, InputGroup } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { SubmitField } from "../Shared/InputType";
import TermAndCondition from '../Shared/TermAndCondition/TermAndCondition.';
import { useConfirmationModal } from '../../commons/ConfirmationModal/ConfirmationModalHook';
import FormikCotext from '../Shared/FormikContext';

const Register = ({ setModalTab, setLoginModel, verificationStatus = () => { } }) => {
    let termRef = useRef(false);
    const spinner = useContext(Spinner);
    const [validCaptcha, setValidCaptcha] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [agreeTermCondition, setAgreeTermCondition] = useState(false);
    const [showTerm, setShowTerm] = useState(false);
    const [userFirstName, setUserFirstName] = useState('');
    const [initialValue, setInitialValue] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPass: '',
        terms: termRef.current
    })

    const schema = Yup.object().shape({
        firstName: Yup.string()
            .required("Required!"),
        lastName: Yup.string()
            .required("Required!"),

        email: Yup.string()
            .email("Invalid email format")
            .matches(/^[a-zA-Z0-9.]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Invalid email format")
            .required("Required!"),
        password: Yup.string()
            .required('Please Enter your password')
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
            ),
        confirmPass: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required("Required!"),
        terms: Yup.bool().required().oneOf([true], 'Terms must be accepted'),
    });

    const conformModel = (action) => {
        if (!agreeTermCondition) {
            setShowTerm(true)
        }
    }

    // show register confirmation modal when user click on conform
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: `Congratulations ${userFirstName ? userFirstName : ""}!`,
        body: <p>Your account has been created successfully.<br />
            In order to login, please verify your email through the link sent to your registered email address.
        </p>,

        onConfirm: () => {
            setLoginModel(false);
        },
        onCancel: () => { }
    })

    const onRegisterSubmitted = (values, { setSubmitting }) => {
        try {
            if (!_.isEmpty(values)) {
                let firstname = values.firstName + ' ' + values.lastName;
                const userInfo = {
                    "appUserType": "INDIVIDUAL",
                    "authentication": "EMAIL",
                    "email": values.email,
                    "expiryDate": 0,
                    "firstName": firstname,
                    "idDocumentLocation": "",
                    "lastName": "",
                    "password": values.password,
                    "phoneNumber": "",
                    "profileImageLocation": "",
                    "resetPassword": true,
                    "status": "ACTIVE",
                    "tpToken": "",
                    "agreeTermsAndConditions": termRef.current
                };
                spinner.show("Please wait...");
                ApiService.register(userInfo).then(
                    response => {
                        if (response.status == "200") {
                            setModalTab("login");
                            verificationStatus(response.data)
                        }
                        setErrorMessage('')
                    },
                    err => {
                        setErrorMessage(err.response?.data?.message);
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

    /**
     * show the password as text when clicking eye icon 
     * @param {String} id - input field id
    */
    const PasswordEye = ({ id }) => {
        const [eyeIcon, setEyeIcon] = useState('fa fa-eye-slash')
        const [mouseLeave, setMouseLeave] = useState(false)
        const showPassword = () => {
            const password = document.getElementById(id);
            if (password?.type) {
                if (password.type === 'password') {
                    password.type = 'text'
                    setEyeIcon('fa fa-eye')
                    setMouseLeave(true)
                } else {
                    setMouseLeave(false)
                    password.type = 'password'
                    setEyeIcon('fa fa-eye-slash')
                }
            }

        }
        return <span onClick={() => showPassword()} className="text-muted show-password"><i onMouseLeave={() => mouseLeave && showPassword()} className={eyeIcon}></i></span>
    }

    /**
     * listening changes for formic field
     * @param {Object} value = value of formik field 
     * @param {Function} setFieldValue  = to set formik field value
     */
    const handleChangeByChange = (value, setFieldValue) => {
        if (!termRef.current) {
            setFieldValue("terms", false);
        }
    }

    const onChangeTrim = (key, value, setFieldValue) => {
        try {
            let userName = value.replace(/\s+/g, '').trim(); // prevent to paste more than limited characters
            setFieldValue(key, userName);
        } catch (err) {
            console.error("Error occurred while onChangeLimit", err);
        }
    }

    // this method lestening for form is valid or not
    const handleFormValidation = (isValid, dirty) => {
        let isFormValid = false;
        try {
            if ((!isValid || !dirty) || (!termRef.current && !agreeTermCondition)) isFormValid = true;
        } catch (err) {
            console.error("Error occur while handleFormValidation --", err);
        }
        return isFormValid;
    }

    return (<div className="sign-up-modal js-signin-modal-block" >
        <h2>Sign Up</h2>
        <p className="log-cap">Please register with your email and sign up to continue..</p>
        <Formik
            validationSchema={schema}
            initialValues={initialValue}
            onSubmit={onRegisterSubmitted}>
            {({ handleSubmit, isSubmitting, handleChange, setFieldValue, touched, errors, values, isValid, dirty }) => (
                <form onSubmit={handleSubmit}>
                    <FormikCotext {...{ callback: (val) => handleChangeByChange(val, setFieldValue) }} />
                    <div className="row">
                        <div className="col-lg-6">
                            <Form.Group>
                                <Form.Label><span>First Name*</span></Form.Label>
                                <InputGroup>
                                    <Field
                                        name="firstName"
                                        className="form-control "
                                        placeholder="First Name"
                                        onChange={(e) => onChangeTrim("firstName", e.target.value, setFieldValue)}
                                    />
                                </InputGroup>
                                <ErrorMessage component="span" name="firstName" className="text-danger mb-2 small-text" />
                            </Form.Group>
                        </div>
                        <div className="col-lg-6">
                            <Form.Group>
                                <Form.Label><span>Last Name*</span></Form.Label>
                                <InputGroup>
                                    <Field
                                        name="lastName"
                                        className="form-control "
                                        placeholder="Last Name"
                                        onChange={(e) => onChangeTrim("lastName", e.target.value, setFieldValue)}
                                    />
                                </InputGroup>
                                {<ErrorMessage component="span" name="lastName" className="text-danger mb-2 small-text" />}
                            </Form.Group>
                        </div>
                    </div>
                    <Form.Group>
                        <Form.Label><span>Email*</span></Form.Label>
                        <InputGroup>
                            <Field name="email" type="email" className="form-control " placeholder="Email" onKeyUp={() => { setErrorMessage('') }} />
                        </InputGroup>
                        <ErrorMessage component="span" name="email" className="text-danger mb-2 small-text" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><span>Password*</span></Form.Label>
                        <InputGroup>
                            <Field name="password" className="form-control " placeholder="Password" type="password" id="passWord" />
                            <InputGroup.Append>
                                <InputGroup.Text id="basic-add"> <PasswordEye id="passWord" /></InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                        <ErrorMessage component="span" name="password" className="text-danger mb-2 small-text" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><span>Confirm Password*</span></Form.Label>
                        <InputGroup>
                            <Field name="confirmPass" className="form-control" placeholder="Confirm Password" type="password" id="cnfpass" />
                            <InputGroup.Append>
                                <InputGroup.Text id="basic-add"><PasswordEye id="cnfpass" /></InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                        <ErrorMessage component="span" name="confirmPass" className="text-danger mb-2 small-text" />
                    </Form.Group>
                    {errorMessage && <div class="alert alert-danger mt20" role="alert">
                        {errorMessage}
                    </div>}
                    {/* setting terms formic values while close terms and condition modal */}
                    <Form.Group>
                        <Form.Check
                            required
                            name="terms"
                            checked={termRef.current}
                            label={<span class="f13 cd-signin-modal__bottom-message js-signin-modal-trigger">I have read & I agree to the <span class=""><a onClick={() => setShowTerm(true)}> Terms of Use</a></span></span>}
                            onChange={(e) => {
                                handleChange(e);
                                termRef.current = e.target.checked;
                                if (e.target.checked) {
                                    setShowTerm(e.target.checked);
                                } else {
                                    setValidCaptcha(false);
                                    setAgreeTermCondition(false);
                                }
                            }}
                        />
                        {errors?.confirmPass && touched?.confirmPass && !termRef.current && <span className="text-danger mb-2 small-text">Terms must be accepted</span>}
                    </Form.Group>
                    <SubmitField
                        type="submit"
                        id="gt-create-account"
                        label="Signup"
                        disabled={handleFormValidation(isValid, dirty)}
                    />
                    <p className="cd-signin-modal__bottom-message js-signin-modal-trigger">Already have an account? <a onClick={() => setModalTab("login")}> Login</a></p>

                </form>)}
        </Formik>
        {
            showTerm
            && <TermAndCondition
                {...{
                    show: showTerm,
                    setShow: setShowTerm,
                    showCaptcha: true,
                    validCaptcha,
                    setValidCaptcha,
                    setAgreeTermCondition,
                    onAgreeCallback: () => {
                        setAgreeTermCondition(true);
                    },
                    onClickCloseIcon: () => {
                        termRef.current = false;
                        setValidCaptcha(false);
                        setAgreeTermCondition(false);
                    }
                }}
            />
        }
        {ConfirmationComponent}
    </div>)
}
export default Register