import React, { useEffect, useState, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../services/api.service';
import { useAuthState } from  '../../../contexts/AuthContext/context';
import { Tab, Nav } from 'react-bootstrap';
import MyOrderList from './MyOrderList';
import './myorders.css'
import useToast from '../../../commons/ToastHook';
import _ from 'lodash';
import moment from 'moment';

const MyOrders = ({storeId}) => {
    const [key, setKey] = useState("upcoming-orders");
    const [upcomingOrders, setUpcomingOrders] = useState([]);
    const [pastOrders, setPastOrders] = useState([])
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const initUpcomingOrders = () => {
        try {
            spinner.show("Please wait...");
            let listOrdersByMonthly = [];
            ApiService.myOrders(userDetails.user.sid).then(
                response => {
                    response.data = _.map(response.data, o => {
                        if (o.orderDetailsTO.deliveryLocationType === 'SHERIFF_OFFICE') {
                            o.orderDetailsTO.sheriffOfficeLocation = JSON.parse(o.orderDetailsTO.sheriffOfficeLocation);
                        } else if (o.orderDetailsTO.deliveryLocationType === 'FFL') {
                            o.orderDetailsTO.fflStoreLocation = JSON.parse(o.orderDetailsTO.fflStoreLocation);
                        } else if (o.orderDetailsTO.deliveryLocationType === "OTHER_LOCATION") {
                            o.orderDetailsTO.otherLocation = JSON.parse(o.orderDetailsTO.otherLocation);
                        } 
                        return o;
                    });
                    listOrdersByMonthly = _.chain(response.data).orderBy(da => {
                        return da.orderDetailsTO.placedOn;
                    }, 'desc').groupBy(result => {
                        return moment(result.orderDetailsTO.placedOn).format("MMMM YYYY");
                    }).map((orders, month) => {
                        return {
                            orders,
                            month
                        }
                    }).value();
                    setUpcomingOrders(listOrdersByMonthly);
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
            });
        } catch (err) {
            console.error('error occur on getAllReceived()', err)
        }
    }

    const initPastOrders = () => {
        spinner.show("Please wait...");
        let listOrdersByMonthly = [];
        ApiService.myPastOrders(userDetails.user.sid).then(
            response => {
                response.data = _.map(response.data, o => {
                    if (o.orderDetailsTO.deliveryLocationType === 'SHERIFF_OFFICE') {
                        o.orderDetailsTO.sheriffOfficeLocation = JSON.parse(o.orderDetailsTO.sheriffOfficeLocation);
                    } else if (o.orderDetailsTO.deliveryLocationType === 'FFL') {
                        o.orderDetailsTO.fflStoreLocation = JSON.parse(o.orderDetailsTO.fflStoreLocation);
                    }
                    return o;
                });
                listOrdersByMonthly = _.chain(response.data).orderBy(da => {
                    return da.orderDetailsTO.placedOn;
                }, 'desc').groupBy(result => {
                    return moment(result.orderDetailsTO.placedOn).format("MMMM YYYY");
                }).map((orders, month) => {
                    return {
                        orders,
                        month
                    }
                }).value();
                setPastOrders(listOrdersByMonthly);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }


    // get bids
    useEffect(() => {
        if(userDetails.user.sid){
            key === "upcoming-orders" ? initUpcomingOrders() : initPastOrders()
        }
    }, [key]);


    return (<>
        <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)} className="mb-2">
           
            <Nav className="nav-tabs myac-tab-head" id="myTab" >
                <Nav.Item>
                    <Nav.Link eventKey={"upcoming-orders"} id="upcoming-orders">{"Upcoming Orders"}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"past-orders"} id="past-orders">{"Past Orders"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="tab-body p-0">
                <Tab.Pane eventKey={"upcoming-orders"} >
                    {key === "upcoming-orders" && <>
                        <MyOrderList {...{ lists: upcomingOrders, isDataLoaded, orderType: 'upcoming' }} /> </>}
                </Tab.Pane>
                <Tab.Pane eventKey={"past-orders"} >
                    {key === "past-orders" && <>
                        {isDataLoaded && <>  <MyOrderList {...{ lists: pastOrders, isDataLoaded, orderType: 'past', onSuccess: () => initPastOrders() }} /></>}
                    </>}
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </>)

}

export default MyOrders;


