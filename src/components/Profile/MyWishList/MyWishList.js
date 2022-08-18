import React, { useState } from 'react';
import { Tab, Nav, Button } from 'react-bootstrap';
import MyWishlistItem from './MyWishlistItem';
import CustomWishList from './CustomWishList';


const MyWishList = () => {
    const [key, setKey] = useState("wishlist");
    return (<>
        <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)}>
            <Nav className="nav-tabs myac-tab-head nav-fill desktop-off" id="myTab">
                <Nav.Item>
                    <Nav.Link eventKey={"wishlist"} id="wishlist">{"Wishlist"}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"create-wishlist"} id="create-wishlist">{"Custom Wishlist"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Nav className="nav-tabs myac-tab-head mobile-off" id="myTab">
                <Nav.Item>
                    <Nav.Link eventKey={"wishlist"} id="wishlist">{"Wishlist"}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"create-wishlist"} id="create-wishlist">{"Custom Wishlist"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="tab-body">
                <Tab.Pane eventKey={"wishlist"}>
                    {key === "wishlist" && <>
                               <MyWishlistItem/>
                         </>}
                </Tab.Pane>
                <Tab.Pane eventKey={"create-wishlist"} >
                    {key === "create-wishlist" && <>
                       <CustomWishList/>
                    </>}
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </>)

}

export default MyWishList;


