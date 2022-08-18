import React, {useContext} from 'react';
import { Tab, Nav, Button } from 'react-bootstrap';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { ICN_TRADE_EX, ICN_YES_GREEN, ICN_CLOSE_RED, IcnWarningCircle } from '../../icons';
import moment from 'moment';
import ApiService from '../../../services/api.service';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { useConfirmationModal } from '../../../commons/ConfirmationModal/ConfirmationModalHook';
import useToast from '../../../commons/ToastHook';
import { showLabelByStatus } from '../../../services/CommonServices';

const BidList = ({ myLists, isDataLoaded, bidType="placed", setIsReloadList }) => {
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);
  
    // get received bid     
    const acceptedBid = (status,sid) => {
    try {
          spinner.show("Please wait...");
        ApiService.acceptRejectBidTrade(status,sid).then(
            response => {
                Toast.success({ message: `Bid ${status === "ACCEPTED" ? "accepted" : "rejected"} successfully`, time: 2000});
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.error || err.response.data.status) : 'Bid failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
            setIsReloadList(true);
        });
    } catch (err) {
        console.error('error occur on acceptedBid()', err)
    }
}

   // show delete confirmation modal when user click on delete
   const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
    title: "Bid Cancel",
    body: "Are you sure, you want to cancel from bid list?",
    onConfirm: (sid) => {
        cancelBid(sid);
    },
    onCancel: () => { }
})

  // get cancel Bid bid       
  const cancelBid = (sid) => {
    try {
          spinner.show("Please wait...");
        ApiService.cancelBid(sid).then(
            response => {
                Toast.success({ message: `Bid cancel successfully`, time: 2000});
               
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.error || err.response.data.status) : 'Please try after sometime.', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
            setIsReloadList(true);
        });
    } catch (err) {
        console.error('error occur on rejectedBid()', err)
    }
}


    // get image
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.yourProductListingContent)) {
            const imagesByItem = JSON.parse(item.yourProductListingContent)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    return (<div className="">
        <div className="tab-pane">
            <div className="row">
                <div className="col">
                    {
                        isDataLoaded && myLists.map((list, index) => {
                            return <div className="myBidbox myWishlistbox py-3" key={index}>
                                <div className="myBidbox-title jcb">
                                    <div className="aic"><span className="mr5">{ICN_TRADE_EX}</span><span className="pt3">Bid {(list.status === "PLACED" && bidType === 'received') ? "Received" : "Placed"}</span></div>
                                    
                                    <div className="small-size text-muted">
                                        {moment(list.placedOn).startOf('minute').fromNow()}
                                    </div>
                                    </div>
                                <div className="border-top border-bottom pt-2">
                                  {bidType === 'placed' &&  <div className="font-it f12">You have successfully placed a bid of <b>${list.bidAmount || "-"}</b> with <b>{list.postedByFirstName} {list.postedByLastName}</b> for <b>{list.yourProductCategoryName}</b></div>}
                                  {bidType === 'received' &&    <div  className="font-it f12">Bid of <b>${list.bidAmount}</b> received for your product!</div> }
                                    <span className="float-right"></span>
                                    <div className="row jcb py-3">
                                        <div className="col-lg-9 col-9">
                                            <div className="WishlistItem">
                                                <div className="media">
                                                    <div className="prod-thumbnail-img" style={{backgroundImage: `url(${getMyImage(list)})`}}></div>
                                                    <div className="media-body">
                                                        <h5 className="mt-0">{list.yourProductTitle}</h5>
                                                        <p>{list.yourProductCategoryName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-3 col-3 text-right">
                                            <div className="WishlistItem-price">
                                                <p className="wprice-label">Reserve price</p>
                                                <p className="wishlist-price">{list?.auctionReservePrice ? "$" + list.auctionReservePrice : "No Reserve Price"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="jcb pt-2 aic">
                                    <div>
                                        <div>Expires</div>
                                        <div className="small-size aic">
                                            <div className="pr-2"><IcnWarningCircle /></div>
                                            <div className="pt2 expireTime">{moment(list.auctionExpiresOn).endOf('seconds').fromNow()}</div>
                                        </div>
                                    </div>
                                    <div>
                                       {/* {
                                            bidType !== 'placed' 
                                            && list.status === 'PLACED' 
                                            &&<>
                                                <Button variant="outline" className="mr10 btn-sm border-round acceptBtn f12" onClick={()=>acceptedBid("ACCEPTED",list.orderHasListingTableSid)}><div className="aic"><div className="mr5"><ICN_YES_GREEN /></div><div className="pt2">Accept</div></div></Button>
                                                <Button variant="outline" className="btn-sm border-round rejectBtn f12" onClick={()=> acceptedBid("REJECTED",list.orderHasListingTableSid)}><div className="aic"><div className="mr5"><ICN_CLOSE_RED /></div><div className="pt2">Reject</div></div></Button>
                                            </>
                                        } */}

                                        {/* once bid placed can not retract the bid show cancel button not required */}
                                        {/* {bidType === 'placed' && list.status === 'PLACED' &&<>
                                        <Button variant="outline" className="btn-sm border-round rejectBtn f12" onClick={() => {showConfirmModal(list.orderHasListingsDetailsSid)}}><div className="aic"><div className="mr5"><ICN_CLOSE_RED /></div><div className="pt2">Cancel</div></div></Button>
                                        </>} */}
                                        {/* {((bidType === 'received' && list.status !== 'PLACED')) &&<>
                                            <label>Status: <span class="title-md">{showLabelByStatus(list.status) || list.status}</span></label>
                                        </>} */}
                                        <label>Status: <span class="title-md">{showLabelByStatus(list.status) || list.status || ""}</span></label>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                    {
                        isDataLoaded && !myLists.length && <div class="gunt-error py-3 mt-2 bg-white">No Data Found</div>
                    }
                </div>
            </div>
        </div>
        {ConfirmationComponent}
    </div>)
    
}
export default BidList