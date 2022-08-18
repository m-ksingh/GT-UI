import React, { useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../services/api.service';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { Tab, Nav } from 'react-bootstrap';
import StoreOrderList from './StoreOrderList';
import useToast from '../../../commons/ToastHook';
import './storeorders.css'


const StoreOrders = ({storeId}) => {
    const [key, setKey] = useState("upcoming-orders");
    const [upcomingOrders, setUpcomingOrders] = useState([]);
    const [pastOrders, setPastOrders] = useState([])
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const initUpcomingOrders = () => {
        try {
            spinner.show("Please wait...");
            let listOrdersByMonthly = [];
            ApiService.storeUpcomingOrders(storeId).then(
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
        ApiService.storePastOrders(storeId).then(
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
        key === "upcoming-orders" ? initUpcomingOrders() : initPastOrders()
    }, [key]);


    return (<>
        <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)} className="mb-2">
            {/*<div class="container">
                <div class="row justify-content-start">
                    <div class="col-lg-12 pt-3 pb-3">
                        <h2 className="page-title-h m0">Orders</h2>
                    </div>
                </div>
            </div>*/}
            <Nav className="nav-tabs myac-tab-head" id="myTab" >
                <Nav.Item>
                    <Nav.Link eventKey={"upcoming-orders"} id="upcoming-orders">{"Upcoming Orders"}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"past-orders"} id="past-orders">{"Past Orders"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="">
                <Tab.Pane eventKey={"upcoming-orders"} >
                    {key === "upcoming-orders" && <>
                        <StoreOrderList {...{ lists: upcomingOrders, isDataLoaded, orderType: 'upcoming-orders' }} /> </>}
                </Tab.Pane>
                <Tab.Pane eventKey={"past-orders"} >
                    {key === "past-orders" && <>
                        {isDataLoaded && <>  <StoreOrderList {...{ lists: pastOrders, isDataLoaded, orderType: 'past-orders' }} /></>}
                    </>}
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </>)

}

export default StoreOrders;


