import { useState, useEffect, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import NonAppLayout from '../../components/NonAppLayout';
import useToast from '../../commons/ToastHook';
import ApiService from '../../services/api.service';
import { useHistory } from 'react-router-dom';
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from 'yup';
import './VerifyEmail.css';

const VerifyEmail = ({ location }) => {
    const history = useHistory()
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [verifySid, setVerifySid] = useState("");
    const [verifySuccess, setVerifySuccess] = useState(false);
    const [isLinkExpired, setIsLinkExpired] = useState(false);
    const [alreadyVerify, setAlreadyVerify] = useState(false);
    const [isRequestSent, setIsRequestSent] = useState(false);
    const [emailId, setEmailId] = useState("");
    const schema = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email format")
            .required("Required!")
    });

    // verify email id
    const verifyUserEmail = (sid) => {
        try {
            spinner.show("Verifying email... Please wait...");
            setIsLinkExpired("");
            ApiService.verifyEmailId(sid).then(
                response => {
                    setVerifySuccess(true);
                },
                err => {
                    if (err && err.response?.status === 406) setAlreadyVerify(true);
                    if (err && err.response?.status === 403) setIsLinkExpired(true);
                    setVerifySuccess(false);
                    console.error('Error occurred in verifyUserEmail--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in verifyUserEmail--', err);
        }
    }

    // request another link
    const requestEmailLink = (values) => {
        if (values.email) {
            try {
                spinner.show("Requesting link... Please wait...");
                ApiService.requestEmailLink(values.email).then(
                    response => {
                        setIsRequestSent(true);
                    },
                    err => {
                        if (err && err.response?.status === 406) setAlreadyVerify(true);
                        if (err && err.response?.status === 401) Toast.error({ message: "Please enter valid email address." })
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

    // listening for location change
    useEffect(() => {
        if (location && location.pathname) {
            setVerifySid(location.pathname.split("/")[location.pathname.split("/").length - 1]);
        }
    }, [location])

    return (
        <NonAppLayout title="Verify Email" description="This is the verify email page" >
            <div className="jcc aic px10">
                <div className="verify-box b-ddd p20 mt20">
                    {(!isRequestSent && !verifySuccess && !alreadyVerify) && <>
                        <div className={`${isLinkExpired ? "link-exp" : ""} verify-title jcc py20`}>{isLinkExpired ? "Link Expired!" : "Verify Your Email"}</div>
                        <p className={`text-center f14`}>{isLinkExpired ? "Your link is expired! Please request for another verification link." : "Please click on verify button below to verify your email address."}</p>
                    </>}
                    <div className="jcc py20">
                        <div className="fdc">
                            <div className="f24 text-center">
                                {!verifySuccess && !isLinkExpired && !alreadyVerify && <div className="verify-btn jcc aic f14" onClick={() => verifyUserEmail(verifySid)}>Verify</div>}
                                {verifySuccess && <div className="theme-color">Email verified successfully.</div>}
                                {!verifySuccess && isLinkExpired && !isRequestSent && !alreadyVerify
                                    && <div className="">
                                        <Formik
                                            validationSchema={schema}
                                            initialValues={{
                                                email: '',
                                            }}
                                        >
                                            {({ handleSubmit, handleChange, touched, errors, values, isValid, dirty }) => (
                                                <div className="row">
                                                    <div className="pb20 col-12 col-sm-8">
                                                        <Field
                                                            name="email"
                                                            className="form-control "
                                                            placeholder="Enter your email"
                                                            onKeyUp={(e) => setEmailId(e.target.value)}
                                                        />
                                                        <ErrorMessage component="div" name="email" className="text-danger mb-2 small-text t-left" />
                                                    </div>
                                                    <div className="col-12 col-sm-4">
                                                        <button className={`verify-btn ml10 jcc aic f14 ${!isValid || !dirty ? "disabled" : ""}`} onClick={() => requestEmailLink(values)}>Request Link</button>
                                                    </div>
                                                </div>
                                            )}
                                        </Formik>
                                    </div>
                                }
                                {isLinkExpired && isRequestSent && <div className="request-sent t-center">Verification link successfully sent to <span className="text-semi-bold">{emailId ? emailId : " email id "}</span>. Please check your mail.</div>}
                                {!verifySuccess && alreadyVerify && <div>Your email id is already verified.</div>}
                            </div>
                            <div>
                                {
                                    (verifySuccess || isRequestSent || alreadyVerify)
                                    && <div className="f14 py10 text-center">{<div>Please click here to<span className="link pointer ml5" onClick={() => history.replace("/")}>Login</span></div>}</div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NonAppLayout>
    );
}

export default VerifyEmail;