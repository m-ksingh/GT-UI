import React, { useState, Fragment, useContext } from 'react';
import Slider from "../../Shared/SliderModal/SliderModal"
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import NewNotification from './NewNotification';
import InfiniteScroll from "react-infinite-scroll-component";
import ApiService from '../../../services/api.service';
import { useAuthState } from '../../../contexts/AuthContext';
import "./notification.css";

const Notification = ({ show, setShow, notificationList, setNotificationList, getAllNotificationsList, loading, updateNotifActionStatus = () => {}, fetchMoreData = () => {}, hasMoreItem = true }) => {
    let userDetails = useAuthState();
    const spinner = useContext(Spinner);

    // this method trigger when click on close icon or anywhere on screen outside the modal to close notificaiton modal
    const clearAllViewedNotifications = () => {
        try {
            spinner.show("Please wait...");
            ApiService.clearAllViewedNotifications(userDetails.user.sid).then(
                response => {
                    setNotificationList([]);
                    getAllNotificationsList();
                },
                err => {
                    spinner.hide();
                    console.error("Error occur when clearAllViewedNotifications--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur when clearAllViewedNotifications--", err);
        }
    }
    return (<>
        <Slider closeModal={() => {clearAllViewedNotifications(); setShow(!show)}} id="notificationModal" animation="slide" speed="faster" closeIcon={() => {clearAllViewedNotifications(); setShow(!show)}}
            toggle={show} size="semi-medium" direction="right">
            <div className="slider-container notification-modal">
                <div className="sliderHeader ">Notifications</div>
                {
                    loading
                    ? <div className="mt-5 text-center">
                        <button className="btn btn-light" type="button" disabled>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span className="px10 pt3">Loading...</span>
                        </button>
                    </div>
                    : <div id="scrollableDiv" className="sliderBody">
                        <InfiniteScroll
                            dataLength={notificationList.length}
                            next={fetchMoreData}
                            hasMore={hasMoreItem}
                            loader={<div className="text-center py20 f14"><span class="spinner-border spinner-border-sm mr5" role="status" aria-hidden="true"></span>Loading...</div>}
                            scrollableTarget="scrollableDiv"
                            endMessage={
                                <div className="text-center py20 f14 text-muted">
                                  <div className="text-semi-bold f14">All caught up!</div>
                                </div>
                            }
                        >
                            {
                                _.isArray(notificationList)
                                && notificationList.length > 0
                                && notificationList.map((nl, i) => <Fragment key={i}>
                                    <NewNotification 
                                        {...{
                                            showNotification: show, 
                                            setShowNotification: setShow, 
                                            nl, 
                                            getAllNotificationsList, 
                                            updateNotifActionStatus 
                                        }} 
                                    />
                                </Fragment>)
                            }
                            {
                                _.isArray(notificationList)
                                && notificationList.length === 0
                                && <div className="gunt-error my20">No Notification Found.</div>
                            }
                        </InfiniteScroll>
                    </div>
                }
            </div>
        </Slider>
    </>)
}
export default Notification