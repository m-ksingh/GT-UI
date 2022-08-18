import React, { useEffect, useState, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../services/api.service';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { Tab, Nav, Button } from 'react-bootstrap';
import BidList from '../MyBid/BidList';
import './tradeOffer.css'
import TradeOfferList from './TradeOfferList';
import _ from 'lodash';
import useToast from '../../../commons/ToastHook';


const MyTradeOffer = () => {
    const [key, setKey] = useState("trade-placed");
    const [isReloadList, setIsReloadList] = useState(false);
    const [tradeReceived, setTradeReceived] = useState([]);
    const [myTradeOffer, setMyTradeOffer] = useState([])
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);


    // get received bid       
    const getAllPlaced = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getTradeOffer(userDetails.user.sid).then(
                response => {
                    setMyTradeOffer(_.chain(response.data).orderBy('placedOn', 'desc').value());
                },
                err => {
                    Toast.error({ message: err.response && err.response.data ? (err.response.data.error || err.response.data.status) : 'Please try after sometime.', time: 2000});
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
    const getAllReceived = () => {
        ApiService.getTradeReceived(userDetails.user.sid).then(
            response => {
                setTradeReceived(_.chain(response.data).orderBy('placedOn', 'desc').value());
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.error || err.response.data.status) : 'Please try after sometime.', time: 2000});
            }
        ).finally(() => {
            setIsDataLoaded(true);
        });
    }


    // get bids
    useEffect(() => {
        if(userDetails?.user?.sid){
            key === "trade-placed" ? getAllPlaced() : getAllReceived()
        }
    }, [key, isReloadList]);


    return (<>
        <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)}>
            <Nav className="nav-tabs myac-tab-head" id="myTab" >
                <Nav.Item>
                    <Nav.Link eventKey={"trade-placed"} id="trade-placed">{"Offers Sent"}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"trade-received"} id="trade-received">{"Offers Received"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="tab-body">
                <Tab.Pane eventKey={"trade-placed"}>
                    {key === "trade-placed" && <>
                        <TradeOfferList {...{ myLists: myTradeOffer, isDataLoaded, setIsReloadList, tradeType: 'Submitted' }} /> </>}
                </Tab.Pane>
                <Tab.Pane eventKey={"trade-received"} >
                    {
                        key === "trade-received"
                        && <TradeOfferList {...{
                            myLists: tradeReceived,
                            isDataLoaded,
                            setIsReloadList,
                            tradeType: 'Received',
                            updateList: () => {
                                getAllReceived()
                            }
                        }}
                        />
                    }
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </>)

}

export default MyTradeOffer;


