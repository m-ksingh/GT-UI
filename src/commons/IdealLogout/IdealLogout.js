import React, { useEffect, useContext, useRef } from 'react';
import ApiService from '../../services/api.service';
import { goToTopOfWindow } from '../utils';
import Spinner from "rct-tpt-spnr";
import useToast from '../ToastHook';
import { useAuthDispatch, useAuthState } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { useBasicModal } from "../BasicModal/BasicModalHook";

const IdealLogout = () => {
    let listenerAddedRef = useRef(false);
    const userDetails = useAuthState();
    const dispatch = useAuthDispatch();
    const Toast = useToast();
    const history = useHistory();
    const spinner = useContext(Spinner);
    let idleTimeout = 1000 * 60 * 15;  // 15 minutes
    let idleEvent;

    // event listeners    
    const events = [
        'mousemove',
        'click',
        'keydown',
        'mousewheel',
        'scroll'
    ];

    const [showLogoutModel, SessionTimeoutComponent] = useBasicModal({
        title: "Session Expired",
        body: "Your session has expired due to inactivity! Please login again.",
        onClose: (d) => {
            logOut();
        }
    });

    // this method triggers when any event happen eg - click, keypress, mousemove, onmousewheel    
    const sessionTimeout = () => {
        if (!!idleEvent) clearTimeout(idleEvent);
        idleEvent = setTimeout(() => { userLogout(); }, idleTimeout); // add seesion expired timedout modal
    };

    // on click okay close expired modal
    const logOut = () => {
        listenerAddedRef.current = false;
    }

    // user logout method
    const userLogout = () => {
        try {
            spinner.show("Please wait... Logging out...");
            ApiService.logout(userDetails.user.sid).then(
                (response) => {
                    dispatch({ type: "LOGOUT" });
                    history.push("/");
                    goToTopOfWindow();
                    spinner.hide();
                    showLogoutModel();
                    listenerAddedRef.current = false;
                    for (let e in events) {
                        window.removeEventListener(events[e], sessionTimeout);
                    }
                },
                (err) => {
                    spinner.hide();
                    Toast.error({
                        message: err.response?.data
                            ? err.response?.data.error || err.response?.data.status
                            : "API Failed",
                        time: 2000,
                    });
                }
            );
        } catch (err) {
            spinner.hide();
            console.error("Error occur in initLogout --" + err);
        }
    };

    // listening for user info changes and add event listeners
    useEffect(() => {
        if (userDetails.user.sid && !listenerAddedRef.current) {
            listenerAddedRef.current = true;
            for (let e in events) {
                window.addEventListener(events[e], sessionTimeout);
            }
            idleEvent = setTimeout(() => { userLogout(); }, idleTimeout); // add session expired time out for first time
        }
        // return 
        return () => {
            for (let e in events) {
                window.removeEventListener(events[e], sessionTimeout);
            }
        }
    }, [userDetails]);

    return <>{SessionTimeoutComponent}</>
}

export default IdealLogout;