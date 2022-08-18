import React, { useState, useContext, useEffect, memo } from 'react'
import { Tab, Nav } from 'react-bootstrap';
import _ from 'lodash';
import ReportIssue from '../Shared/ReportIssue';
import { useAuthState } from '../../contexts/AuthContext';
import './listing.css'

const ListingItemsView = ({ bundleItems, listingInfo=null, updatQuantity = () => {}, fromListing = true }) => {
    const [reportModal, setReportModal] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState("1");
    const userDetails = useAuthState();

    useEffect(() => {
        if(selectedQuantity) {
            updatQuantity(selectedQuantity);
        }
    }, [selectedQuantity])
    return (<>
        {bundleItems && 
        <div className="listing-item-tab bc-white px20">
            <div className="mb-3">
                <div className="">
                    <div className="pl15 f11 pt10 aic">
                        {
                            listingInfo?.sell
                            && <div className="pr20">
                                <p className="price-tag fw100">Buy Now Price</p>
                                <p className="pro-price">${bundleItems.reduce((a, {estimatedPrice}) => a + parseInt(estimatedPrice), 0)}</p>
                            </div>
                        }
                        {
                            listingInfo?.auction
                            && <div className="">
                                <p className="price-tag fw100">Reserve Price</p>
                                <p className="pro-price">{listingInfo?.auctionReservePrice ? `$${listingInfo.auctionReservePrice}` : "No Reserve Price"}</p>
                            </div>
                        }
                        {
                            listingInfo?.trade
                            && <div className="">
                                <p className="price-tag fw100">Trade Value</p>
                                <p className="pro-price">${listingInfo?.tradeReservePrice ? listingInfo.tradeReservePrice : "0"}</p>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <Tab.Container id="left-tabs-example" defaultActiveKey='item0'>
                <Nav variant="pills" className="">
                    {bundleItems && bundleItems.map((res, i) => <Nav.Item>
                        <Nav.Link eventKey={`item${i}`}>Item {i + 1}{i===0 && "(Primary)"} </Nav.Link>
                    </Nav.Item>)}
                </Nav>
                <Tab.Content>
                    {bundleItems && bundleItems.map((res, i) => <Tab.Pane eventKey={`item${i}`}>
                        
                        <div className="row bg-white bg-none justify-content-between">
                            <div className="jcb w100 pl15">
                                <div className="flx2">
                                    <h2 className="title1">{res.title}</h2>
                                    <p className="price-tag f11 c999">Price</p>
                                    <p className="pro-price vl-price">${res.estimatedPrice}</p>
                                </div>
                                <div className="proDetails-right">
                                    <p className="mod-used-cls jce">{res?.selectedConditionName &&<span className="item-cond-badge">{res?.selectedConditionName ?? '-'}</span>}</p>
                                    {userDetails.user.sid && <p class="report-cls text-right" onClick={() => setReportModal(true)}><img className="mr-2" src="images/icon/conversation.svg"></img>Report Issue</p>}
                                </div>
                            </div>
                            {/* quantity */}
                            {
                                fromListing 
                                && <div className="col-12 col-lg-12 mt-3">
                                    <div className="aic">
                                        <div className="mr10">Qty.</div>
                                        <div>
                                            <select 
                                                className="form-control" 
                                                defaultValue={selectedQuantity} 
                                                onChange={(e) => {setSelectedQuantity(e.target.value)}}
                                                disabled={!listingInfo.sell}
                                            >
                                                {[...Array(listingInfo.quantity >= 1 ? listingInfo.quantity : 1).keys()].map(res => <option className="form-control" value={res+1} name={res+1}>{res+1}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            }

                            <div className="col-lg-12 mt-3">
                                <div className="pro-dtle-box">
                                    <p className="pro-description">{res.description}</p>
                                    <h4 className="pro-spc-head">Specifications</h4>
                                    <table className="table table-borderless pro-dtails-table">
                                        <tbody>
                                        <tr>
                                                <td>Category :</td>
                                                <td><div className="spec-label">{res?.selectedCategoryName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Condition :</td>
                                                <td><div className="spec-label">{res?.selectedConditionName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Manufacturer :</td>
                                                <td><div className="spec-label">{res?.selectedManufacturerName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Model :</td>
                                                <td><div className="spec-label">{res?.selectedModelName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Caliber :</td>
                                                <td><div className="spec-label">{res?.selectedCaliberName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Barrel Length :</td>
                                                <td><div className="spec-label">{res?.selectedBarrelName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Capacity :</td>
                                                <td><div className="spec-label">{res?.selectedCapacityName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Frame Finish :</td>
                                                <td><div className="spec-label">{res?.selectedFrameName ?? '-'}</div></td>
                                            </tr>
                                            <tr>
                                                <td>Grips :</td>
                                                <td><div className="spec-label">{res?.selectedGripsName ?? '-'}</div></td>
                                            </tr>
                                            {
                                                !res.pre1968 && !_.isEmpty(res.serialNumber) && <tr>
                                                    <td>Serial Number :</td>
                                                    <td><div className="spec-label">{res.serialNumber}</div></td>
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Tab.Pane>)}
                </Tab.Content>
            </Tab.Container>
        </div>}
        {reportModal && listingInfo &&  <ReportIssue {...{ reportModal, setReportModal, listingInfo: listingInfo, reportType: 'PRODUCT' }} />}
    </>)
}
export default memo(ListingItemsView)