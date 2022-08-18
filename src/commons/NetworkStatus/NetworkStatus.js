/*********
    * 
    * CallComm Technologies, Inc. Confidential
    * ____
    * 
    *  Copyright CallComm Technologies, Inc. 2021. All rights reserved
    * 
    * NOTICE:  All information contained herein is, and remains
    * the property of CallComm Technologies, Inc. and its suppliers,
    * if any.  The intellectual and technical concepts contained
    * herein are proprietary to CallComm Technologies, Inc.
    * and its suppliers and may be covered by U.S. and Foreign Patents,
    * patents in process, and are protected by trade secret or copyright law.
    * Dissemination of this information or reproduction of this material
    * is strictly forbidden unless prior written permission is obtained
    * from CallComm Technologies, Inc.
*/
import React, { useEffect, useState } from 'react';
import "./network_banner.css"

export const NetworkStatus = props => {
    const [message, setMessage] = useState(null);
    const STATUS = {
        "ONLINE": "ONLINE",
        "OFFLINE": "OFFLINE",
        "SLOW": "SLOW",
        "OFFLINE_MESSAGE": "You are not connected to the internet. Please check your connection!",
        "SLOW_MESSAGE": "You seem to have a bad network connection. Please check your connection!"
    }

    // This method used to remove app critical messages by type
    const removeMessage = () => setMessage(null);

    const getBannerLayout = (messages) => {
        let banner = null;
        if (messages && messages.status === STATUS.OFFLINE)
            banner = <div className="banner no-network"><i className="fa fa-exclamation-triangle mr5"></i> {messages.message} </div>;
        else if (messages && messages.status === STATUS.SLOW)
            banner = <div className="banner slow-network"><i className="fa fa-exclamation-triangle mr5"></i> {messages.message} </div>;
        else
            banner = <div className="banner app-error"><i className="fa fa-exclamation-triangle mr5"> {messages.message} </i></div>;
        return banner;
    }

    // This method used to add a network listeners online/offline/change
    useEffect(() => {
        try {
            // Fires when changes in network connection
            if (navigator && navigator.connection) {
                navigator.connection.addEventListener('change', () => {
                    try {
                        removeMessage();
                        if (navigator.connection.downlink <= 1)
                            setMessage({ "status": STATUS.SLOW, "message": STATUS.SLOW_MESSAGE })
                    } catch (err) {
                        console.error("Error occurred in addNetworkListener -- Network change -- " + err);
                    }
                })
            }
        } catch (err) {
            console.error("Error occurred in addNetworkListener -- " + err);
        }
    }, [])

    // Adding and removing class for critical messages
    useEffect(() => {
        if (!message) {
            document.body.classList.remove("show-error");
        } else {
            document.body.classList.add("show-error");
        }
    }, [message])

    return <>
        {message && getBannerLayout(message)}
        {props.children}
    </>
}