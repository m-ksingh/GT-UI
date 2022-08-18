import React, { useEffect, useState, useContext } from 'react';
import { Button } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import _ from 'lodash'
import './myorders.css'
import ApiService from '../../../services/api.service';
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import { AppContext } from '../../../contexts/AppContext';
import { ICN_YES_GREEN, ICN_CLOSE_RED } from '../../icons';

const ReturnConfirm = ({ show, setShow, selectedOrder, onSuccess = () => {}}) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const { platformVariables } = useContext(AppContext);

    const calculateReturnPrice = () => {
        let returnablePrice = "";
        try {
            if(selectedOrder.listingDetails.platformVariables) {
                let platformVariables = JSON.parse(selectedOrder.listingDetails.platformVariables)
                let perAmount = (selectedOrder.listingDetails.sellPrice * platformVariables.restockingFees.percentage)/100;
                returnablePrice = perAmount > platformVariables.restockingFees.amount ? perAmount : platformVariables.restockingFees.amount
            }
        } catch (err) {
            console.error("Error occurred while calculateReturnPrice--", err);
        }
        return "$" + returnablePrice;
    }

    // this method trigger when click on confirm button to return order
    const confirmReturnOrder = () => {
        try {
            spinner.show("Please wait...");
            ApiService.returnOrder(selectedOrder.notificationJson.ohl ||  selectedOrder.orderHasListingSid).then(
                response => {
                    spinner.hide();
                    setShow(false);
                    onSuccess(response.data);
                    Toast.success({ message: "Return request sent successfully"});
                },
                err => {
                    setShow(false);
                    spinner.hide();
                    console.error("Error occur when confirmReturnOrder--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur when confirmReturnOrder--", err);
        }
    }
    return <Modal {...{ show, setShow, className: "pickup-container" }}>
        <div className="p20">
            <div className="jcc f14 text-semi-bold">Return Request</div>
            <div className="jcc f14 pt20 text-center pb20">Once the seller accepts your return request, seller will select the FFL & provide the slots for you to return for which you will be notified</div>
            <div className="jcc f14 pb20 text-center">
            {
                selectedOrder?.listingDetails?.platformVariables
                && <div>
                    <span>Once you hand over the item back to the seller/FFL and complete the return process using ‘Return Code’. Your amount will be refunded with deduction of the applicable Restocking fees of </span>
                    <span className="fw600">{selectedOrder && calculateReturnPrice()}</span>
                    {/* <span>{JSON.parse(selectedOrder.listingDetails.platformVariables).restockingFees.type === "percentage" ? "" : "$"}</span>
                    {selectedOrder.listingDetails.platformVariables ? JSON.parse(selectedOrder.listingDetails.platformVariables).restockingFees.value : "-"}
                    <span>{JSON.parse(selectedOrder.listingDetails.platformVariables).restockingFees.type === "percentage" ? "%" : ""}</span> */}
                </div>
            }
            </div>
            <div className="jcc pt20">
                <Button variant="outline" className="mr10 btn-sm border-round confirmBtn f12 btn btn-outline" onClick={() => confirmReturnOrder()}>
                    <div className="aic">
                        <div className="mr5">
                            <ICN_YES_GREEN />
                        </div>
                        <div className="">Confirm</div>
                    </div>
                </Button>
                <Button variant="outline" className="btn-sm border-round rejectBtn f12 btn btn-outline" onClick={() => setShow(false)}>
                    <div className="aic">
                        <div className="mr5"><ICN_CLOSE_RED /></div>
                        <div className="">Cancel</div>
                    </div>
                </Button>
            </div>
        </div>
    </Modal>
}
export default ReturnConfirm