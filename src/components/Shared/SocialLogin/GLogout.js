import React, { useContext } from 'react';
import { useAuthDispatch } from  '../../../contexts/AuthContext/context';
import { CartContext } from '../../../contexts/CartContext';
import { useGoogleLogout } from 'react-google-login';
import { useHistory } from 'react-router-dom';
import { goToTopOfWindow } from '../../../commons/utils';

const clientId =
  '930015281305-enqc80tj43f30d6fe54ndn38p9kbb7m2.apps.googleusercontent.com'; // new one
  // '737794481159-tj929h4ttm5a5ekav4s9li7mm41j74tm.apps.googleusercontent.com'; // old one

function GLogout() {
  const dispatch = useAuthDispatch();
  const history = useHistory();
  const {clearCart} = useContext(CartContext);
  const initLogoutProcess = () => {
    clearCart();
    dispatch({ type: 'LOGOUT' });
    history.push('/');
    goToTopOfWindow();
  }
  const onLogoutSuccess = (res) => {
    initLogoutProcess();
  };

  const onFailure = () => {
    initLogoutProcess();
  };

  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess,
    onFailure,
  });

  return (
    <div onClick={signOut}>Logout</div>
  );
}

export default GLogout;
