import { useState, useContext } from 'react'
import { Link } from "react-router-dom";
import { Tab, Nav, Dropdown } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../services/api.service';
import { useAuthState, useAuthDispatch } from '../../../contexts/AuthContext';
import useToast from '../../../commons/ToastHook';          
import '../platform.css'

const PlatFormHeader = () => {
    const history = useHistory();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const dispatch = useAuthDispatch();
    const [key, setKey] = useState("REQUESTS");

    // user logout method
    const userLogout = () => {
    try {
        spinner.show("Please wait... Logging out...");
        ApiService.logout(userDetails.user.sid).then(
            response => {
                dispatch({ type: 'LOGOUT' });
                history.push('/');
                spinner.hide();
                Toast.success({ message: 'You have been successfully logged out', time: 2000});
            },
            err => {
                spinner.hide();
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        );
    } catch (err) {
        spinner.hide();
        console.error("Error occur in initLogout --" + err);
    }
}

    return (<div className="platform-header aic">
        <div class="platform-logo pb10">
            <img src="images/logo.svg" class="img-fluid" alt="Gun Traderz" />
        </div>
        <div className="myac-tab">
            <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)} className="myac-tab">
                <Nav className="nav-tabs">
                    <Nav.Item>
                        <Nav.Link eventKey={"REQUESTS"} ><Link to="/platform-dashboard/request" className="f12 p20">{"REQUESTS"}</Link></Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey={"DISPUTES"}><Link to="/platform-dashboard/dispute" className="f12 p20">{"DISPUTES"}</Link></Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey={"GLOBALS"} ><Link to="/platform-dashboard/global" className="f12 p20">{"GLOBALS"}</Link></Nav.Link>
                    </Nav.Item>
                </Nav>
            </Tab.Container>
        </div>
        <Dropdown className="top-box3">
            <Dropdown.Toggle id="super-admin-logout" className="super-admin-logout no-chev">
                <div className="pointer aic pt3">
                    {`${userDetails?.user?.firstName} ${userDetails?.user?.lastName}`} 
                    <i className={`fa acc-chev text-muted ml-2  fa-chevron-down`}></i>
                </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => userLogout()}>Logout</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    </div>)
}

export default PlatFormHeader