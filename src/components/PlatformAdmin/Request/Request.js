import { useState, useEffect, useContext } from 'react'
import { ICN_YES_GREEN, ICN_CLOSE_RED } from '../../icons';
import { Button } from 'react-bootstrap'
import StoreDetails from './StoreDetails'
import ApiService from '../../../services/api.service';
import moment from 'moment';
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import _ from 'lodash';
import RejectModal from './RejectModal';
import { useAuthState } from '../../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import { Tab, Nav } from 'react-bootstrap';
import '../platform.css'

const Request = () => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [show, setShow] = useState(false);
    const [fflStoreList, setFflStoreList] = useState([]);
    const [renewFflStoreList, setRenewFflStoreList] = useState([]);
    const [selectedStore, setSelectedStore] = useState({});
    const [showRejectModal, setShowRejectModal] = useState(false)
    const userDetails = useAuthState();
    const history = useHistory();
    const [key, setKey] = useState("new-request");
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // get store list list
    const getFFLStoreList = (pageNumber = 1, pageLimit = 500) => {
        try {
            spinner.show("Populating List... Please wait...");
            let payload = ["UNDER_REVIEW"];
            ApiService.getFflRequestList(payload, pageNumber, pageLimit).then(
                response => {
                    setFflStoreList(response.data);
                },
                err => {
                    spinner.hide();
                    console.error('Error occurred in getFFLStoreList--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in getFFLStoreList--', err);
        }
    }

    // get renew store list list
    const getRenewFFLStoreList = (pageNumber = 1, pageLimit = 500) => {
        try {
            spinner.show("Populating List... Please wait...");
            let payload = ["UNDER_REVIEW"];
            ApiService.getRenewFflRequestList(payload, pageNumber, pageLimit).then(
                response => {
                    setRenewFflStoreList(response.data);
                },
                err => {
                    spinner.hide();
                    console.error('Error occurred in getRenewFFLStoreList--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in getRenewFFLStoreList--', err);
        }
    }

    // get store list list
    const updateFflStoreRequestStatus = (res = {}, reviewStatus = "", reason = "") => {
        try {
            let resFFlId = res?.fflStore ? res?.fflStore?.sid : res?.sid
            spinner.show("Please wait...");
            let payload = {
                "sid": resFFlId,
                "approvalComments": reason,
                "approvalStatus": reviewStatus,
            }
            ApiService.updateFflStoreRequestStatus(payload).then(
                response => {
                    if (res?.fflStore?.sid) {
                        getRenewFFLStoreList()
                    }
                    getFFLStoreList();

                    Toast.success({ message: `Successfully ${reviewStatus === "APPROVED" ? "accepted" : "rejected"}`, time: 2000 });
                },
                err => {
                    spinner.hide();
                    console.error('Error occurred in updateFflStoreRequestStatus--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in updateFflStoreRequestStatus--', err);
        }
    }

    // init component
    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
        if (userDetails?.user?.sid) {
            getFFLStoreList();
            getRenewFFLStoreList()
        }
    }, [])

    return (<>

        <Tab.Container defaultActiveKey={key} onSelect={k => setKey(k)} className="mb-2">

            <Nav className="nav-tabs myac-tab-head" id="myTab" >
                <Nav.Item>
                    <Nav.Link eventKey={"new-request"} id="new-request">{`New Request (${Array.isArray(fflStoreList) ? fflStoreList.length : "0"})`}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={"renew-request"} id="past-orders">{`Renew Request (${Array.isArray(renewFflStoreList) ? renewFflStoreList.length : "0"})`}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Tab.Content className="tab-body p-0">
                <Tab.Pane eventKey={"new-request"} >
                    {key === "new-request" && <>

                        <table class="table table-design">
                            <thead>
                                <tr className="">
                                    <th scope="col" className="f10 req-table-col1">STORE INFO</th>
                                    <th scope="col" className="f10">CONTACT INFO</th>
                                    <th scope="col" className="f10">REQUESTED ON</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    fflStoreList.map((res, i) => <tr key={i} className="f13" onClick={() => { setSelectedStore(res); setShow(true) }}>
                                        <td>
                                            <div className='text-semi-bold'>{res.name}</div>
                                            <div>{res.licenseNumber}</div>
                                            <div>{`${res?.premiseStreet ? res.premiseStreet : ""}${res.premiseCity ? ", " + res.premiseCity : ""} ${res?.premiseState ? ", " + res.premiseState : ""} ${res?.premiseZipCode ? ", " + res.premiseZipCode : ""}`}</div>
                                        </td>
                                        <td>
                                            <div>{`${res.firstName} ${res.lastName}`}</div>
                                            <div>{res.email}</div>
                                            <div>{res.phoneNumber}</div>
                                        </td>
                                        <td style={{ "borderRight": "1px solid #ddd" }}>
                                            <div >{moment(res.createdOn).format('L')}</div>
                                        </td>
                                        <td className="jcb">
                                            <div>Request Type : {res.notified7 || res.notified3 || res.licenseExpired ? "Renewal" : "New"}</div>
                                            <div className="aic mt-3">
                                                <div className="acceptRejectBtn" onClick={(event) => event.stopPropagation()}>
                                                    <Button
                                                        variant="outline"
                                                        className="mr10 btn-sm border-round acceptBtn f12"
                                                        onClick={() => updateFflStoreRequestStatus(res, "APPROVED")}
                                                    ><div className="aic"><div className="mr5"><ICN_YES_GREEN /></div><div className="pt2">Approve</div></div>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="btn-sm border-round rejectBtn f12"
                                                        onClick={() => { setSelectedStore(res); setShowRejectModal(true) }}
                                                    ><div className="aic"><div className="mr5"><ICN_CLOSE_RED /></div><div className="pt2">Reject</div></div>
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    )}
                            </tbody>
                        </table>

                    </>}
                </Tab.Pane>
                <Tab.Pane eventKey={"renew-request"} >
                    {key === "renew-request" && <>
                        {<>

                            <table class="table table-design">
                                <thead>
                                    <tr className="">
                                        <th scope="col" className="f10 req-table-col1">STORE INFO</th>
                                        <th scope="col" className="f10">CONTACT INFO</th>
                                        <th scope="col" className="f10">REQUESTED ON</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        renewFflStoreList.map((res, i) => <tr key={i} className="f13" onClick={() => { setSelectedStore(res.fflStore); setShow(true) }}>
                                            <td>
                                                <div className='text-semi-bold'>{res.fflStore.name}</div>
                                                <div>{res.fflStore?.licenseNumber}</div>
                                                <div>{`${res?.fflStore.premiseStreet ? res.fflStore.premiseStreet : ""}${res.fflStore.premiseCity ? ", " + res.fflStore.premiseCity : ""} ${res?.fflStore.premiseState ? ", " + res.fflStore.premiseState : ""} ${res?.fflStore.premiseZipCode ? ", " + res.fflStore.premiseZipCode : ""}`}</div>
                                            </td>
                                            <td>
                                                <div>{`${res.fflStore.firstName} ${res.fflStore.lastName}`}</div>
                                                <div>{res.fflStore.email}</div>
                                                <div>{res.fflStore.phoneNumber}</div>
                                            </td>
                                            <td style={{ "borderRight": "1px solid #ddd" }}>
                                                <div >{moment(res.fflStore.createdOn).format('L')}</div>
                                            </td>
                                            <td className="jcb">
                                                <div>Request Type : {res.fflStore.notified7 || res.fflStore.notified3 || res.fflStore.licenseExpired ? "Renewal" : "New"}</div>
                                                <div className="aic mt-3">
                                                    <div className="acceptRejectBtn" onClick={(event) => event.stopPropagation()}>
                                                        <Button
                                                            variant="outline"
                                                            className="mr10 btn-sm border-round acceptBtn f12"
                                                            onClick={() => updateFflStoreRequestStatus(res, "APPROVED")}
                                                        ><div className="aic"><div className="mr5"><ICN_YES_GREEN /></div><div className="pt2">Approve</div></div>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="btn-sm border-round rejectBtn f12"
                                                            onClick={() => { setSelectedStore(res); setShowRejectModal(true) }}
                                                        ><div className="aic"><div className="mr5"><ICN_CLOSE_RED /></div><div className="pt2">Reject</div></div>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        )}
                                </tbody>
                            </table>
                        </>}
                    </>}
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>

        {
            show
            && !_.isEmpty(selectedStore)
            && <StoreDetails {...{ show, setShow, selectedStore }} />
        }
        {showRejectModal && <RejectModal {...{ show: showRejectModal, setShow: setShowRejectModal, onConfirm: (data) => { updateFflStoreRequestStatus(selectedStore, "REJECTED", data.reason) } }} />}
    </>)

}
export default Request;