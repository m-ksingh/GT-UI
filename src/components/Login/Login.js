import React, { useState, useContext,useEffect } from 'react'
import Spinner from "rct-tpt-spnr";
import Register from '../Register/Register'
import ForgetPassword from '../ForgotPassword/ForgotPassword'
import { Formik, Field, ErrorMessage } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import { Form, InputGroup } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { SubmitField } from "../Shared/InputType";
import GLogin from "../Shared/SocialLogin/GLogin";
import FLogin from "../Shared/SocialLogin/FLogin";
import { useAuthDispatch, useAuthState } from '../../contexts/AuthContext/index';
import { DEFAULT_LATLNG, MAP_API_KEY } from '../../commons/utils';
import { AppContext } from '../../contexts/AppContext';
import { services } from '@tomtom-international/web-sdk-services';
import useToast from '../../commons/ToastHook';
import { useHistory } from 'react-router-dom';
import RequestVerificationLink from '../RequestVerificationLink/RequestVerificationLink';

const Login = ({ setLoginModel }) => {
	const [modalTab, setModalTab] = useState("login");
    const [mailVerifyStatus, setMailVerifyStatus] = useState();

    const verificationStatus = (data) => {
        setMailVerifyStatus(data);
    }
	return (<>
		<div className="cd-signin-modal js-signin-modal">
			<div className="cd-signin-modal__container">
				<div className="row">
					<div className="col-lg-5 desktop-login-head">
						<div className="login-left-area">
                        {modalTab === "login" && <>
                            <h2>Login</h2>
							<p>Login to manage your Wishlist, Orders, Bids, Trades, Listings, Schedules & more.</p>
							<p className="text-center"><img src="images/login-comp.png" className="img-fluid" /></p>
                        </>}
                        {modalTab === "signUp" && <>
                            <h2>Create Account</h2>
							<p>Please register to create an account with us! By creating an account you will be able to get exclusive access to our services.</p>
							<p className="text-center"><img src="images/login-comp.png" className="img-fluid" /></p>
                        </>}
                        {modalTab === "reset" && <>
                            <h2>Forget Password</h2>
							<p></p>
							<p className="text-center"><img src="images/login-comp.png" className="img-fluid" /></p>
                        </>}
                        {modalTab === "request-link" && <>
                            <h2>Request Link</h2>
							<p></p>
							<p className="text-center"><img src="images/login-comp.png" className="img-fluid" /></p>
                        </>}
							
						</div>
					</div>
					<div className="col-lg-7 login-right-area">
						{modalTab === "login" && <LoginPage {...{ setModalTab, setLoginModel, mailVerifyStatus }} />}
						{modalTab === "signUp" && <Register {...{ setModalTab, setLoginModel, verificationStatus }} />}
						{modalTab === "reset" && <ForgetPassword {...{ setModalTab }} />}
                        {modalTab === "request-link" && <RequestVerificationLink {...{ setModalTab }} />}
					</div>
				</div>
				<a onClick={() => setLoginModel(false)} className="cd-signin-modal__close js-close">Close</a>
			</div>
		</div>
	</>)

}
export default Login

const LoginPage = ({ setModalTab, setLoginModel, mailVerifyStatus }) => {
    const Toast = useToast();
    const history = useHistory()
    const {setWishList,setMyListings,setValueBy} = useContext(AppContext)
    const userDetails = useAuthState();
    const [isLogeIn,setIsLogin] = useState(false)
    const [hasInvalidCredential, setHasInvalidCredential] = useState(false)
    const [errorMessage,setErrorMessage] = useState('');
    const [isNotVerifiedEmail, setIsNotVerifiedEmail] = useState(false);

    /**
    * show the password as text when clicking eye icon 
    * @param {String} id - input field id
    */
    const PasswordEye =({ id }) => {
        const [eyeIcon, setEyeIcon] = useState('fa fa-eye-slash')
        const [mouseLeave, setMouseLeave] = useState(false)

        const showPassword = () => {
            const password = document.getElementById(id);
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
        return <span onClick={() => showPassword()} className="text-muted show-password"><i onMouseLeave={() => mouseLeave && showPassword()} className={eyeIcon}></i></span>
    }

    const dispatch = useAuthDispatch();
    const spinner = useContext(Spinner);
	const schema = Yup.object().shape({
        email: Yup.string()
        .email("Invalid email format")
        .required("Required!"),
        password: Yup.string()
        .required('Please Enter your password')
      });

    const onLoginSubmitted = (values) => {
        try {
            if (!_.isEmpty(values)) {
                dispatch({ type: 'REQUEST_LOGIN' });
                spinner.show("Please wait...");
                ApiService.login(values).then(
                    response => {
                        dispatch({ type: 'LOGIN_SUCCESS', payload: {...response.data, "defaultPlatformVariables": response.data?.defaultPlatformVariables ? JSON.parse(response.data.defaultPlatformVariables) : null} });
                        setLoginModel(false);
                        if(response?.data?.appUserType === "SUPERADMIN") history.replace("/platform-dashboard/request");
                        getWidhList(response.data.sid)
                        getMyListing(response.data.sid)
                        getUserProfileDetails(response.data.sid)
                        setErrorMessage('')
                        
                    },
                    err => {
                        dispatch({ type: 'LOGIN_ERROR', error: err.response?.data?.message });
                        if(err.response.status === 403 && err.response?.data?.message) {
                            setIsNotVerifiedEmail(true);
                            setErrorMessage("Your email id is not verified! Please verify your email first through the link sent to your registered email id. If in case verification email is expired or deleted, you can request for another verification link.")
                        }
                        if((err.response.status === 401 || err.response.status === 404 ) && err.response?.data?.message) setErrorMessage(err.response?.data?.message)
                        setHasInvalidCredential(true);
                    }
                ).finally(() => {
                    spinner.hide();
                });                
            }
        } catch (err) {
            console.error("Exception occurred in onSubmitted --- " + err);
        }
    }

    const getWidhList = async (sid) => {
        spinner.show("Please wait...");
        ApiService.getWishList(sid).then(
            response => {
                setWishList(response.data);
            },
            err => {
                // Toast.error({ message: err.response.data ? err.response.data.error: 'Data loading error', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        });
    };

    const getMyListing = async (sid)=>{
        try{
        ApiService.getMyLists(sid).then(
            response => {
                setMyListings(response.data);
            },
            err => {
                // Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        }); 
     } catch(err){
        console.error("Error occur on getMyListing()",err)
     }
    }

    const getUserProfileDetails = (sid) =>{
        ApiService.getMyProfile(sid).then(
            response => {
                response.data.appUserHasAddressTO &&  updateGeoLocationByZipcode(response.data.appUserHasAddressTO.zipcode)
            },
            err => {
                console.err("")
                // Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            // setIsDataLoaded(true);
        });
    }

    const updateGeoLocationByZipcode = (zipCode) => {

        if(zipCode){
        ApiService.getLocationByPin({
            key: MAP_API_KEY,
            zipCode:zipCode
          }).then(res=>{
            //  handleResults(res.data)
            res.data.results.length> 0 ? setValueBy('SET_LOCATION',res.data.results[0]): getMyLocation(DEFAULT_LATLNG)
              
          });
        }else{
            getLocation()
        }
    }
  
    useEffect(() => {
        if(isLogeIn){
            getWidhList(userDetails.user.sid)
            getMyListing(userDetails.user.sid)
            getUserProfileDetails(userDetails.user.sid)
        }
    }, [isLogeIn])

    const getMyLocation = (latlng) => {
        function callbackFn(resp) {
            setValueBy('SET_LOCATION',resp.addresses[0]);
        }
        services.reverseGeocode({
            key: MAP_API_KEY,
            position: latlng
        }).then(callbackFn);
    }

    const getLocation =()=> {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else { 
            console.log("Geolocation is not supported by this browser.")
        }
      }
      
      const showPosition =(position) =>{
        getMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
        })
      }

    useEffect(() => {
          getLocation()
    }, [])

	return (<div className=" js-signin-modal-block" >
		<h2>Welcome</h2>
		<p className="log-cap">Please login or sign up to continue..</p>
		<ul className="loginSocial">
			<li>
                <GLogin {...{ setLoginModel,setIsLogin }} />
            </li>
			<li className="loginF">
                <FLogin {...{ setLoginModel,setIsLogin }} />
            </li>
            <p>Or login with email</p>
		</ul>
        {
            hasInvalidCredential 
            && <div class="alert alert-danger mt20" role="alert">
                {/* Please enter valid username or password */}
                {errorMessage}
            </div>
        }
        {
            ((mailVerifyStatus?.email && mailVerifyStatus?.emailVerified === false && !errorMessage))
            && <div class="alert alert-success mt20" role="alert">
                    <p>Your signup was successful! Welcome to Guntraderz <br></br>
                    Before you login, please check your registered email to verify your account.</p>
            </div>
        }
		<Formik
			validationSchema={schema}
            initialValues={{
                email:'',
                password: '',
                rememberMe: false
            }}
			onSubmit={onLoginSubmitted}>
            {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty, handleReset }) => (
				<form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label><span>Email</span></Form.Label>
                        <InputGroup>
                            {/* <InputGroup.Prepend>
                                <InputGroup.Text>
                                    <label className="cd-signin-modal__label cd-signin-modal__label--email cd-signin-modal__label--image-replace" htmlFor="signin-email"></label>
                                </InputGroup.Text>
                            </InputGroup.Prepend> */}
                            <Field 
                                name="email" 
                                className="form-control " 
                                placeholder="Enter your email" 
                                onKeyUp={() => {hasInvalidCredential && setHasInvalidCredential(false)}}
                            />
                        </InputGroup>
                        <ErrorMessage component="span" name="email" className="text-danger mb-2 small-text" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label><span>Password</span></Form.Label>
                        <InputGroup>
                            {/* <InputGroup.Prepend>
                                <InputGroup.Text>
                                    <label className="cd-signin-modal__label cd-signin-modal__label--password cd-signin-modal__label--image-replace" htmlFor="signin-password"></label>
                                </InputGroup.Text>
                            </InputGroup.Prepend> */}
                            <Field 
                                name="password" 
                                className="form-control " 
                                placeholder="Enter your password" 
                                type="password" 
                                id="login-password"
                                onKeyUp={() => {hasInvalidCredential && setHasInvalidCredential(false)}}
                            />
                            <InputGroup.Append>
                                <InputGroup.Text id="basic-addon2"> <PasswordEye id="login-password"/></InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                        <ErrorMessage component="span" name="password" className="text-danger mb-2 small-text" />
                    </Form.Group>
                    <div className="jcb">
                        <p className="cd-signin-modal__bottom-message js-signin-modal-trigger f-RequestVerification p-0">{isNotVerifiedEmail && <a onClick={() => setModalTab("request-link")}>Request Verification Link</a>}</p>
                        <p className="cd-signin-modal__bottom-message js-signin-modal-trigger f-passArea p-0"><a onClick={() => setModalTab("reset")} id="gt-forgot-password">Forgot your password?</a></p>
                    </div>
					{/* <Form.Group>
                        <Form.Check
                        name="rememberMe"
                        label="Remember me"
                        onChange={handleChange}
                        isInvalid={!!errors.rememberMe}
                        feedback={errors.rememberMe}
                        />
                    </Form.Group> */}
					<SubmitField label="Login" id="gt-login" disabled={!isValid || !dirty} />
				</form>
			)}
		</Formik>
		<p className="cd-signin-modal__bottom-message js-signin-modal-trigger">Don’t have an account? <a onClick={() => setModalTab("signUp")}>Sign Up</a></p>
	</div>)
    
}