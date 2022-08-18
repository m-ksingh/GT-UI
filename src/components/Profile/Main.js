import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Layout from '../Layout';
import ProfileNav from './ProfileNav';
import ChangePassword from './ChangePassword';
import MyProfile from './MyProfile';
import { Tab, Nav } from 'react-bootstrap';
import MyListing from './MyListing';
import MyOrders from './MyOrders/MyOrders';
import MySales from './MySells/MySells';
import MyBid from './MyBid/MyBid';
import { Link } from 'react-router-dom';
import MyTradeOffer from './MyTradeOffer/MyTradeOffer';
import MyWishList from './MyWishList/MyWishList';
import DefaultSettings from './DefaultSettings';
import Breadcrumb from '../Shared/breadcrumb';
import MySchedule from './MySchedule/MySchedule';
import { useAuthState } from '../../contexts/AuthContext';
import MyTransactions from './MyTransactions/MyTransactions';

const Main = (props) => {
    let userDetails = useAuthState();
    const [key, setKey] = useState("profile-tab");
    const { viewId } = useParams();
    const history = useHistory();

    // init component
    useEffect(() => {
        if(!userDetails?.user?.sid){
            history.push('/');
        }
    },[])

    return (
        <Layout title="My Profile" description="This is the my profile page">
            <section id="breadcrumb-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
                        </div>
                    </div>
                </div>
            </section>

            <section id="my-account-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 mobile-off">
                            <ProfileNav />
                        </div>

                        <div className="col-lg-9">

                            {
                                viewId === "myaccount"
                                && <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)}>
                                    <Nav className="nav-tabs myac-tab-head" id="myTab" >
                                        <Nav.Item>
                                            <Nav.Link eventKey={"profile-tab"} id="profile-tab">{"My Profile"}</Nav.Link>
                                        </Nav.Item>
                                        {/* <Nav.Item>
                                            <Nav.Link eventKey={"cards-tab"} id="cards-tab">{"Manage Payment Cards"}</Nav.Link>
                                        </Nav.Item> */}
                                        <Nav.Item>
                                            <Nav.Link eventKey={"password-tab"} id="password-tab">{"Change Password"}</Nav.Link>
                                        </Nav.Item>
                                        {
                                             <Nav.Item>
                                                <Nav.Link eventKey={"default-settings-tab"} id="default-settings-tab">{"Default Settings"}</Nav.Link>
                                            </Nav.Item>
                                        }
                                    </Nav>
                                    <Tab.Content className="myAc-TabContent">
                                        <Tab.Pane eventKey={"profile-tab"} id="profile">
                                            {key === "profile-tab" &&
                                                <MyProfile />
                                            }
                                        </Tab.Pane>
                                        {/* <Tab.Pane eventKey={"cards-tab"} id="cards">
                                            {key === "cards-tab" &&
                                                <ManageCards />
                                            }
                                        </Tab.Pane> */}
                                        <Tab.Pane eventKey={"password-tab"} id="password">
                                            {key === "password-tab" &&
                                                <ChangePassword />
                                            }
                                        </Tab.Pane>
                                        {
                                            <Tab.Pane eventKey={"default-settings-tab"} id="defaultsettings">
                                                {key === "default-settings-tab" &&
                                                    <DefaultSettings />
                                                }
                                            </Tab.Pane>
                                        }
                                    </Tab.Content>
                                </Tab.Container>
                            }
                            {
                                viewId === "mywishlist" && <MyWishList {...props} />
                            }
                            {
                                viewId === "mytransactions" && <MyTransactions {...props} />
                            }
                            {
                                viewId === "myorders" && <MyOrders {...props} />
                            }
                            {
                                viewId === "MySales" && <MySales {...props} />
                            }
                            {
                                viewId === "mylisting" && <MyListing {...props} />
                            }
                            {
                                viewId === "mybid" && <MyBid {...props} />
                            }
                            {
                                viewId === "mytrade" && <MyTradeOffer {...props} />
                            }
                            {
                                viewId === "myschedules" && <MySchedule {...props} />
                            }
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default Main;