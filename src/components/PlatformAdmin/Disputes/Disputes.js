import React, { useState, useEffect, useContext } from 'react'
import { Collapse } from "react-bootstrap";
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import ApiService from '../../../services/api.service';
import moment from 'moment';
import { getMyImage } from '../../Profile/Notification/Service/NotificationService';
import ResolveDispute from './ResolveDispute';
import _ from 'lodash';
import ViewLocation from '../../Shared/ViewLocation';
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';
import { showLabelByStatus } from '../../../services/CommonServices';
import { useAuthState } from '../../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import AttachedReportFile from './AttachedReportFile';

const Disputes = () => {
    const spinner = useContext(Spinner);
    const [activeKey, setActiveKey] = useState([]);
    const [disputeList, setDisputeList] = useState([]);
    const [show, setShow] = useState(false);
    const [selectedDispute, setSelectedDispute] = useState({})
    const userDetails = useAuthState();
    const history = useHistory();

    const [attacheFileOpen, setAttacheFileOpen] = useState(false);

    // get all dispute list
    const getAllDisputes = () => {
        try {
            spinner.show("Populating dispute list... Please wait...");
            ApiService.getAllDisputes().then(
                response => {
                    let tmpData = response.data.map(e => ({
                        ...e,
                        "fflStore": e.fflStore ? JSON.parse(e.fflStore) : "",
                        "resolutionActions": e.resolutionActions ? JSON.parse(e.resolutionActions) : "",
                        "buyerLocation": e.buyerLocation ? JSON.parse(e.buyerLocation) : "",
                        "sellerLocation": e.sellerLocation ? JSON.parse(e.sellerLocation) : ""
                    }));
                    setDisputeList(tmpData);
                },
                err => {
                    spinner.hide();
                    console.error('Error occurred in getAllDisputes--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in getAllDisputes--', err);
        }
    }

    /**
    Check true or false of expand and collapse data 
    @prams - sid : selected item id 
*/
    const checkExpandData = (idx) => activeKey.some(r => r === idx)

    /**
       set the accordion key id as a array
       @prams - sid : onClick get sid oe current accordion
   */
    const onExpCollapse = (idx) => checkExpandData(idx)
        ? setActiveKey(activeKey.filter(r => r !== idx))
        : setActiveKey(activeKey.concat(idx))


    // init component
    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
        if (userDetails?.user?.sid) {
            getAllDisputes()
        }
    }, []);

    return (<div className="dispute">
        <div className="platForm-border">Disputes ({disputeList.length})</div>
        {disputeList.map((res, idx) => <div className="card-view f13 mb10" key={idx}>
            <div className="card-view-header jcb"
                aria-expanded={checkExpandData(idx)}
                onClick={() => onExpCollapse(idx)}>
                <div className="flx1">
                    <i className={`fa acc-chev mr5 ${checkExpandData(idx) ? "fa-chevron-down" : "fa-chevron-right"}`}></i>
                    <span className="text-semi-bold">{res.disputeTitle}</span>
                </div>
                <div className="flx1">
                    Order# {res.orderId}
                </div>
                <div className="flx1">
                    Reported On : {moment(res.reportedOn).format("L hh:mm A")}
                </div>
                <div className="flx1">
                    Reported By : {res.type === "BUYER" ? `${res.buyerFirstName} ${res.buyerLastName} (Buyer)` : `${res.sellerFirstName} ${res.sellerLastName} (Seller)`}
                </div>
                <div className="jce" onClick={(e) => e.stopPropagation()}>
                    {res.status === "RESOLVED" && <div className="aic jcc dis-res-label">RESOLVED</div>}
                    {res.status === "REJECTED" && <div className="aic jcc dis-reject-label">REJECTED</div>}
                    {res.status === "PENDING" && <div className="handle-btn aic jcc pt2" onClick={() => { setSelectedDispute(res); setShow(true) }}>HANDLE</div>}
                </div>
            </div>
            <Collapse in={checkExpandData(idx)}><div className='pointer-auto'>
                <div className="">
                    <div>Description : {res.disputeDescription}</div>
                    {
                        res.deliveryIssueContent &&
                        <div>Attached files : <span className="text-primary cp" onClick={() => {
                            setSelectedDispute(res);
                            setAttacheFileOpen(true);
                        }}>View attached file</span>
                        </div>
                    }
                    <div>Pickup Schedule : {moment(res.pickUpScheduledOnFrom).format("L hh:mm A")} to {moment(res.pickUpScheduledOnTo).format("LT")}</div>
                </div>

                <div>
                    <table class="table table-design pointer-auto">
                        <thead>
                            <tr>
                                <th scope="col">ITEM INFO</th>
                                <th scope="col">ORDER INFO</th>
                                <th scope="col">SELLER INFO</th>
                                <th scope="col">BUYER INFO</th>
                                <th scope="col">CARD INFO</th>

                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='pointer-auto'>
                                    <div className="flx">
                                        <div className="pt5">
                                            <div className="img-card">
                                                <img src={getMyImage(res.itemPic)} className="mr-3" alt="..." />
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-semi-bold theme-color f14'>{res.itemTitle ? res.itemTitle : "-"}</div>
                                            <div className="f10">{res.condition ? res.condition : "-"}</div>
                                            <div className="f13">{res.itemPrice ? `$${res.itemPrice}` : "-"}</div>
                                        </div>
                                    </div>

                                </td>
                                <td className='pointer-auto'>
                                    <div>Order# {res.orderId}</div>
                                    <div>{res.itemOrderedOn ? moment(res.itemOrderedOn).format("L hh:mm A") : "-"}</div>
                                    <ViewLocation {...{
                                        deliveryLocation: res.deliveryLocation,
                                        showIcon: false
                                    }}
                                    />
                                </td>
                                <td className='pointer-auto'>
                                    <div>{res.sellerFirstName + " " + res.sellerLastName}</div>
                                    <div>{res.sellerEmail ? res.sellerEmail : "-"}</div>
                                    <div>{res.sellerNumber ? res.sellerNumber : "-"}</div>
                                </td>
                                <td className='pointer-auto'>
                                    <div>{res.buyerFirstName + " " + res.buyerLastName}</div>
                                    <div>{res.buyerEmail ? res.buyerEmail : "-"}</div>
                                    <div>{res.buyerNumber ? res.buyerNumber : "-"}</div>
                                </td>
                                <td className='pointer-auto'>
                                    <div className="title1">$ {res.cardAmount ? res.cardAmount : "0"}</div>
                                    <div>{res.cardType ? res.cardType : "Debit"} Card : {res?.cardNumber ? res.cardNumber : "Ending 1234"}</div>
                                    <div>IN ESCROW</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {
                        (res.status === "RESOLVED"
                            || res.status === "REJECTED")
                        && <div className="card-view-bottom">
                            <div>
                                <div>Resolution : {res.resolutionNote ? res.resolutionNote : (!_.isEmpty(res.resolutionActions) && res.resolutionActions[0]?.title ? res.resolutionActions[0].title : "-")}</div>
                                <div className="res-action-status">
                                    {
                                        !_.isEmpty(res.resolutionActions)
                                        && res.resolutionActions.map((data, index) => <React.Fragment key={index}>
                                            {
                                                data.function
                                                && data.function !== "REJECT_DISPUTE"
                                                && <div key={index} className="flx f12">
                                                    <div className={`mr5 ${data.function === GLOBAL_CONSTANTS.TRANSACTION_TYPE.CANCEL_ORDER ? "text-semi-bold" : ""}`}>{showLabelByStatus(data.function) || data?.function || "-"}</div>
                                                    {
                                                        data.function !== GLOBAL_CONSTANTS.TRANSACTION_TYPE.CANCEL_ORDER
                                                        && <>
                                                            <div className="mr5 text-semi-bold">${data.amount ? data.amount : "-"}</div>
                                                            <div className="mr5">to</div>
                                                            <div className="text-semi-bold">{showLabelByStatus(data.appliedTo) || data?.appliedTo || "-"}</div>
                                                        </>
                                                    }

                                                </div>
                                            }

                                        </React.Fragment>)
                                    }
                                </div>

                            </div>
                            <div>
                                <div className="f12">Notes : {res.internalNote ? res.internalNote : "-"}</div>
                                <div>Resolved On : {res?.resolvedOn ? moment(res.resolvedOn).format("L hh:mm A") : "-"}</div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            </Collapse>
        </div>
        )}
        {
            show 
            && !_.isEmpty(selectedDispute)
            && <ResolveDispute {...{ 
                show, 
                setShow, 
                selectedDispute, 
                onSuccess: () => getAllDisputes() 
            }}/>
        }
        {
            attacheFileOpen
            && <AttachedReportFile
                {...{
                    show: attacheFileOpen,
                    setShow: setAttacheFileOpen,
                    selectedDispute
                }}
            />
        }

    </div>)

}
export default Disputes;