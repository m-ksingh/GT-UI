import React, { useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';

const FareBreakUpModal = ({ show, setShow, nl }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [orderTimeline, setOrderTimeline] = useState([]);

    return <Modal size="sm" show={show} onHide={() => setShow(false)}>
        <Modal.Header className="px20" closeButton>
            <Modal.Title className="f16 fw600">Price Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px20">
            <div className="py20 f14 c727">
                <div className="jcb pb10">
                    <div className="">Subtotal</div>
                    <div className="">${
                       (Number(nl?.notificationJson?.quantity) || 1) * ((nl.buyType === "BID" && (nl?.bidAmount || nl?.notificationJson?.price || nl.auctionReservePrice))
                        || (nl.buyType === "BUY" && nl.sellPrice) 
                        || (nl.buyType === "TRADE" && nl.tradeOfferBalance))
                    }</div>
                </div>
                <div className="jcb pb10">
                    <div className="">{`Tax (${nl.taxPercent || 0}%)`}</div>
                    <div className="">${nl.totalTaxes || 0}</div>
                </div>
                <div className="jcb pb10">
                    <div className="">Platform Fee</div>
                    <div className="">${nl.platformFee || 0}</div>
                </div>
                <div className="jcb pb10">
                    <div className="fw600 c111">Total</div>
                    <div className="c111 fw600">${nl.totalPrice ? Number(nl.totalPrice).toFixed(2) : 0 || 0}</div>
                </div>
            </div>
        </Modal.Body>
    </Modal>
}

export default FareBreakUpModal;