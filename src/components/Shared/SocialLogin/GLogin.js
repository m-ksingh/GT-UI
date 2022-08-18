import React, {useContext, useEffect } from 'react';
import { useGoogleLogin } from 'react-google-login';
import Spinner from "rct-tpt-spnr";
import ApiService from './../../../services/api.service';
import { useAuthDispatch } from './../../../contexts/AuthContext/index';
// refresh token
import { refreshTokenSetup } from '../../../commons/utils';
import useToast from '../../../commons/ToastHook';
import { gapi } from 'gapi-script';

const clientId =
  '930015281305-enqc80tj43f30d6fe54ndn38p9kbb7m2.apps.googleusercontent.com'; // new one
  // '737794481159-tj929h4ttm5a5ekav4s9li7mm41j74tm.apps.googleusercontent.com'; // old one

const GLogin = ({setLoginModel,setIsLogin}) => {
  const Toast = useToast();
    const spinner = useContext(Spinner);
  const dispatch = useAuthDispatch();
  const onSuccess = (res) => {
    spinner.show("Please wait...");
    const payload = {
      "email": res.profileObj.email,
      "firstName": res.profileObj.name,
      "lastName": res.profileObj.familyName,
      "signUpType": "GOOGLE"
    }
    ApiService.sociallogin(payload).then(
        response => {
            dispatch({ type: 'LOGIN_SUCCESS', payload: {...response.data, "defaultPlatformVariables": response.data?.defaultPlatformVariables ? JSON.parse(response.data.defaultPlatformVariables) : null} });
            setIsLogin(true)
            setLoginModel(false);
        },
        err => {
            dispatch({ type: 'LOGIN_ERROR', error: err.response.data.error });
            Toast.error({ message: err.response && err.response.data ? err.response.data.error : 'Social API Failed', time: 2000});
        }
    ).finally(() => {
        spinner.hide();
    });
    refreshTokenSetup(res);
  };

  const onFailure = (res) => {
    console.log(res);
  };

  const { signIn } = useGoogleLogin({
    onSuccess,
    onFailure,
    clientId,
    isSignedIn: false,
    accessType: 'offline',
  });

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId,
        scope: 'email',
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  return (
    <div className="loginG" onClick={signIn}></div>
  );
}

export default GLogin;
