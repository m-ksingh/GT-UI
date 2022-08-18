import React, {useContext} from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import Spinner from "rct-tpt-spnr";
import ApiService from './../../../services/api.service';
import { useAuthDispatch } from './../../../contexts/AuthContext/index';
// refresh token
import useToast from '../../../commons/ToastHook';

const appId = '1130023640846495';

const FLogin = ({setLoginModel,setIsLogin}) => {
  const Toast = useToast();
  const spinner = useContext(Spinner);
  const dispatch = useAuthDispatch();
  const onSuccess = (res) => {
    if (res.status === 'unknown') {
      Toast.error({ message: 'Something went wrong in FB oAuth', time: 2000});
        return;
    }
    spinner.show("Please wait...");
    const payload = {
      "email": res.email,
      "firstName": res.name,
      "lastName": '',
      "signUpType": "FACEBOOK"
    }
    ApiService.sociallogin(payload).then(
        response => {
            dispatch({ type: 'LOGIN_SUCCESS', payload: {...response.data, "defaultPlatformVariables": response.data?.defaultPlatformVariables ? JSON.parse(response.data.defaultPlatformVariables) : null} });
            setLoginModel(false);
            setIsLogin(true)
        },
        err => {
            dispatch({ type: 'LOGIN_ERROR', error: err.response.data.error });
            Toast.error({ message: err.response && err.response.data ? err.response.data.error : 'Social API Failed', time: 2000});
        }
    ).finally(() => {
        spinner.hide();
    });
  };

  return (
    <FacebookLogin
        appId={appId}
        fields="name,email,picture"
        callback={onSuccess}
        render={renderProps => (
            <div className="loginF" onClick={renderProps.onClick}></div>
        )} />
  );
}

export default FLogin;
