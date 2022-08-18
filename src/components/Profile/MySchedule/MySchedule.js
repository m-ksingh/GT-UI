import React, { useEffect, useState, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../services/api.service';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { Tab, Nav } from 'react-bootstrap';
import ScheduleList from './ScheduleList';
import { NOTIFICATION_CONSTANTS } from '../Notification/Constants/NotificationConstants';
import _ from 'lodash';
import useToast from '../../../commons/ToastHook';
import { AppContext } from '../../../contexts/AppContext';

const MySchedule = () => {
    const [key, setKey] = useState("seller");
    const { hasUpdateScheduleList, setHasUpdateScheduleList } = useContext(AppContext);
    const [isReloadList, setIsReloadList] = useState(false);
    const [buyerList, setBuyerList] = useState([]);
    const [sellerList, setSellerList] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);

    // get all notification list
    const getAllAlarmNotificationsList = () => {
        try {
            spinner.show("Please wait...");
            let payload = {
                "noOfData": 100,
                "recipientSid": userDetails.user.sid,
                "startPage": 1,
                "status": "ALL"
            }
            ApiService.getAllAlarmNotificationsList(payload).then(
                response => {
                    if(hasUpdateScheduleList) setHasUpdateScheduleList(false);
                    setIsDataLoaded(true);
                    let tmpList = _.chain(response.data).orderBy('createdOn', 'desc').map((d) => ({ ...d, notificationJson: JSON.parse(d.notificationJson) })).value();
                    setBuyerList(tmpList.filter(n => n.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER));
                    setSellerList(tmpList.filter(n => n.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER));
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
                }
            );
        } catch (err) {
            spinner.hide();
            console.error('error occur on getAllAlarmNotificationsList()', err)
        }
    }

    useEffect(() => { 
        if(hasUpdateScheduleList){
            getAllAlarmNotificationsList();
        }
    }, [hasUpdateScheduleList])


    // get bids
    useEffect(() => {
        if(userDetails.user.sid){
            getAllAlarmNotificationsList();
        }
    }, [key, isReloadList]);


    return (<>
        <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)}>
            <Nav className="nav-tabs myac-tab-head" id="myTab" >
                <Nav.Item>
                    <Nav.Link eventKey={"seller"} id="seller">{"As a Seller"}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"buyer"} id="buyer">{"As a Buyer"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="tab-body">
                <Tab.Pane eventKey={"seller"} >
                    {key === "seller" && <>
                        <ScheduleList {...{ myLists: sellerList, getAllAlarmNotificationsList, isDataLoaded, type: 'seller', setIsReloadList }} /> </>}
                </Tab.Pane>
                <Tab.Pane eventKey={"buyer"} >
                    {key === "buyer" && <>
                        {isDataLoaded && <>  <ScheduleList {...{ myLists: buyerList, getAllAlarmNotificationsList, isDataLoaded, type: 'buyer', setIsReloadList }} /></>}
                    </>}
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </>)

}

export default MySchedule;


