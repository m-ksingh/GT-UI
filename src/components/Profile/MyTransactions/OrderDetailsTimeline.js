import React, { useState, useEffect, useContext, memo } from 'react';
import { Modal } from 'react-bootstrap';
import Spinner from "rct-tpt-spnr";
import _ from 'lodash';
import useToast from '../../../commons/ToastHook';
import ApiService from '../../../services/api.service';
import { showLabelByStatus } from '../../../services/CommonServices';
import moment from 'moment';
import { Spinner as Spin } from 'react-bootstrap'
const OrderDetailsTimeline = ({ show, setShow, nl }) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [orderTimeline, setOrderTimeline] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getOrderDetailsTimeline = () => {
        try {
            spinner.show("Fetching order history... Please wait...");
            setIsLoading(true);
            ApiService.getOrderHistory(nl.orderSid).then(
                (response) => {
                    console.log(response.data);
                    setOrderTimeline(response.data);
                    spinner.hide();
                    setIsLoading(false);
                },
                (err) => {
                    spinner.hide();
                    setIsLoading(false);

                    Toast.error({
                        message: err.response?.data
                            ? err.response?.data.error || err.response?.data.status
                            : "API Failed",
                        time: 2000,
                    });
                }
            );
        } catch (err) {
            setIsLoading(false);
            spinner.hide();
            console.error("Error occur in getOrderDetailsTimeline --" + err);
        }
    };

    useEffect(() => {
        getOrderDetailsTimeline();
    }, []);

    return <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header className="px20" closeButton>
            <Modal.Title className="f16 fw600">Activities</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px20">
            <div className="py20">
                {
                    isLoading && 
                    <div className="text-center py20 my20">
                        <Spin animation="border" variant="secondary" />
                    </div>
                }
                <div className="p-rel">
                    {
                        !_.isEmpty(orderTimeline)
                        && !isLoading
                        && orderTimeline.map((r, i) => <div key={i} className="jcb pb20">
                            <div className="aic">
                                <div className="timeline-circle-outer jcc aic">
                                    <div className="timeline-circle-inner"></div>
                                </div>
                                <div className="fw600 pl10">{showLabelByStatus(r.eventStatus)}</div>
                            </div>
                            <div className="c999 f13">{moment(r.eventDate).format('ll')} at {moment(r.eventDate).format('LT')}</div>
                        </div>)
                    }
                    {orderTimeline.length > 1 && <div className="timeline-vertical-line"></div>}
                </div>

            </div>
        </Modal.Body>
    </Modal>
}

export default memo(OrderDetailsTimeline);