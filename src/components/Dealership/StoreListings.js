import React, { useEffect, useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import _ from 'lodash';
import { ICN_BOOKMARK_WHITE, PlusCircleIcon } from '../icons';
import ApiService from '../../services/api.service';
import Spinner from "rct-tpt-spnr";
import { AppContext } from '../../contexts/AppContext';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import UploadListing from '../Profile/UploadListing';
import useToast from '../../commons/ToastHook';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';

const StoreListings = ({ storeId, appUser }) => {
    const { setValueBy, gunModel, manufacturer } = useContext(AppContext);
    const history = useHistory();
    const [lists, setList] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [showUpload, setShowUpload] = useState(false)
    // const [appUser,setAppUser] = useState([])

    const getListing = () => {
        const payload = {
            fflStore: [
                storeId
            ]
        }
        spinner.show("Please wait...");
        ApiService.getStoreListings(payload).then(
            response => {
                setList(response.data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });

    }

    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listingDetailsContent)) {
            const imagesByItem = JSON.parse(item.listingDetailsContent)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }



    const setFFLStoreAndRoute = () => {
        setValueBy('SET_FFLSTORE', storeId);
        history.push({
            pathname: `/create-listing`,
            state: {
                breadcrumb: [
                    {
                        name: "Home",
                        path: `/`
                    },
                    {
                        name: "My Store",
                        path: `/store/mystores`
                    },
                    {
                        name: "Listings",
                        path: `/mystore/listing/${storeId}`
                    },
                    {
                        name: "Create Listing",
                    }
                ]
            }
        });
    }

    useEffect(() => {
        getListing()

    }, [])

    return <div className="myAc-TabContent">
        <div className="tab-pane">
            <div className="store-heading-line flx">
                <div className="flx1 mr10"><h2 className="card-title-header m0">My Listings</h2></div>
                <div>
                    <DropdownButton
                        menuAlign="right"
                        title="Create Listing"
                        id="dropdown-menu-align-right"
                        variant="secondary"
                        size="sm"
                        className="dButton"
                    >
                        <Dropdown.Item className="text-dark" eventKey="1" onClick={setFFLStoreAndRoute}>Create Individually</Dropdown.Item>
                        <Dropdown.Item className="text-dark" eventKey="2" onClick={() => setShowUpload(true)}>Create in Bulk</Dropdown.Item>

                    </DropdownButton>
                </div>
            </div>


            <div className="row">
                <div className="col">
                    {
                        lists.length > 0 && lists.slice().reverse().map((list, index) => {
                            return <div className="myWishlistbox pb-0" key={index}>
                                <div className="mb-2">
                                    <span className="WishlistDate"></span>
                                    <span className="float-right listing-gstyle">Listed On: {new Date(list.updatedOn).toDateString()}</span>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6 col-6">
                                        <div className="WishlistItem">
                                            <div className="media">
                                                <div className="prod-thumbnail-img" style={{ backgroundImage: `url(${getMyImage(list)})` }}></div>
                                                <div className="media-body">
                                                    <h5 className="mt-0">{list.title}</h5>
                                                    <p>{!_.isEmpty(gunModel) && gunModel.find(resp => resp.sid === list.modelSid)?.name}</p>
                                                    <p>{!_.isEmpty(manufacturer) && manufacturer.find(resp => resp.sid === list.manufacturerSid)?.name}</p>
                                                    <p>
                                                        {
                                                            (list.quantity === 0
                                                                || list.listingDetailsStatus === GLOBAL_CONSTANTS.LISTING_STATUS.OUT_OF_STOCK)
                                                                ? ""
                                                                : "Qty Available :"
                                                        }
                                                        {
                                                            (
                                                                list.quantity === 0
                                                                || list.listingDetailsStatus === GLOBAL_CONSTANTS.LISTING_STATUS.OUT_OF_STOCK
                                                            )
                                                                ? <span className="text-danger">Out of stock</span>
                                                                : list.quantity
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-6 text-right">
                                        <div className='row flex justify-content-end'>
                                            {(list.auction || list.trade) && <div className="col-lg-8 col-6">
                                                <div className="WishlistItem-price">
                                                    {
                                                        list.auction && <p className="wprice-label  mb-0 mt-3">Reserve Price</p> ||

                                                        list.trade && <p className="wprice-label  mb-0 mt-3">Trade Value</p>
                                                    }
                                                    {
                                                        list.auction && <p className="spec-label mb-0">{list?.auctionReservePrice ? `${'$' + list.auctionReservePrice}` : "No Reserve Price"}</p> ||
                                                        list.trade && <p className="spec-label mb-0">${list.tradeReservePrice}</p>
                                                    }
                                                </div>
                                            </div>
                                            }
                                            {list.sell && <div className="col-lg-4 col-6 ">

                                                <div className="WishlistItem-price">
                                                    {
                                                        list.sell && <p className="wprice-label mb-0 mt-3 ">Buy Now Price</p>
                                                    }
                                                    {
                                                        list.sellPrice && <p className="spec-label mb-0">${list.sellPrice}</p>
                                                    }
                                                </div>

                                            </div>
                                            }
                                        </div>

                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <p class="listing-gstyle">Listed By:<span className="spec-label"> {!_.isEmpty(appUser) && appUser.find(resp => resp.sid === list.postedBy)?.firstName}</span></p>
                                    </div>
                                </div>
                                <div className="row border-top">
                                    <div className="col-lg-12">
                                        <p className="wprice-label mt-2 mb-2 listing-gstyle d-flex">
                                            <div className='mr10'>Listing Type</div>
                                            {
                                                list.sell && <div className="speciality-btn">Instant Buy</div>
                                            }
                                            {
                                                list.trade && <div className="speciality-btn">Trade</div>
                                            }
                                            {
                                                list.auction && <div className="speciality-btn">Bid</div>
                                            }
                                        </p>
                                    </div>
                                    {
                                        list?.offeredATrade
                                        && <div className='col-lg-12 f12 pl15'>
                                            <span className='fw600'>Note : </span>
                                            <span className='text-danger'>This listing is offered as trade. It will not be visible to buyers untill your offer is rejected.</span>
                                        </div>
                                    }
                                    {
                                        <div className="col-lg-12 f12 pl15">
                                            {
                                                list?.listingDetailsStatus === GLOBAL_CONSTANTS.LISTING_STATUS.EXPIRED
                                                && <span className='text-danger'>This listing is expired!</span>
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        })
                    }
                    {
                        isDataLoaded && !lists.length && <div class="gunt-error">No Data Found</div>
                    }
                </div>
            </div>
        </div>
        {showUpload && <UploadListing {...{ setShowUpload, storeId, getListing }} />}

    </div>;
}

export default StoreListings;