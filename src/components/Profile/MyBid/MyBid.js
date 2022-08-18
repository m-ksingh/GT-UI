import React, { useEffect, useState, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../services/api.service';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { Tab, Nav, Button } from 'react-bootstrap';
import BidList from './BidList';
import './bid.css'
import useToast from '../../../commons/ToastHook';


const MyBid = () => {
    const [key, setKey] = useState("bid-placed");
    const [isReloadList, setIsReloadList] = useState(false);
    const [myLists, setMyList] = useState([]);
    const [myListReceived, setMyListReceived] = useState([])
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);


    // get received bid       
    const getAllReceived = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getAllReceived(userDetails.user.sid).then(
                response => {
                    setMyListReceived(response.data);
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'Please try after sometime', time: 2000});
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
                setIsReloadList(false);
            });
        } catch (err) {
            console.error('error occur on getAllReceived()', err)
        }
    }

    // get placed bid
    const getAllPlaced = () => {
        spinner.show("Please wait...");
        ApiService.getAllPlaced(userDetails.user.sid).then(
            response => {
                setMyList(response.data);
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.error || err.response.data.status) : 'Please try after sometime.', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
            setIsReloadList(false);
        });
    }


    // get bids
    useEffect(() => {
        if(userDetails?.user?.sid){
            key === "bid-placed" ? getAllPlaced() : getAllReceived()
        }
    }, [key, isReloadList]);


    return (<>
        <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)}>
            <Nav className="nav-tabs myac-tab-head" id="myTab" >
                <Nav.Item>
                    <Nav.Link eventKey={"bid-placed"} id="bid-placed">{"Bids Placed"}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"bid-received"} id="bid-received">{"Bids Received"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="tab-body">
                <Tab.Pane eventKey={"bid-placed"} >
                    {key === "bid-placed" && <>
                        <BidList {...{ myLists, isDataLoaded, bidType: 'placed', setIsReloadList }} /> </>}
                </Tab.Pane>
                <Tab.Pane eventKey={"bid-received"} >
                    {key === "bid-received" && <>
                        {isDataLoaded && <>  <BidList {...{ myLists: myListReceived, isDataLoaded, bidType: 'received', setIsReloadList }} /></>}
                    </>}
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </>)

}

export default MyBid;


