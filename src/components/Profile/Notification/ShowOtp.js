import React from 'react';
import { Button } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import _ from 'lodash'
import './notification.css'

const ShowOtp = ({ 
    show, 
    setShow, 
    otp = "", 
    nl, 
    updateNotification,
    fromMyTransaction = false,
}) => {
    return (<div>
        <Modal {...{ show, setShow, className: "pickup-container" }}>
            <div className="pickup-box">
                <div className="">Authenticate the Meet</div>
                <div className="border-top my10"></div>
                <div>
                    <div className="am-otp-label">Provide the following ‘Meeting Code’ to the seller</div>
                    <div className="otp-inp-box jcc">
                        {
                            otp && otp.toString().split("").map((d, i) => <div key={i} className="otp-num">{d}</div>)
                        }
                    </div>
                    <div className="my10">
                        <Button variant="light" className="btn-block f16 otp-close" onClick={() => { updateNotification(fromMyTransaction ? nl.notificationSid : nl.sid); setShow(false)}}>Close</Button>
                    </div>
                </div>
            </div>
        </Modal>
    </div>)
}
export default ShowOtp