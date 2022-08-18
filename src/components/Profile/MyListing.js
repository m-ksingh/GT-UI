import React, { useEffect, useState, useContext, memo } from 'react';
import { Link, useHistory } from 'react-router-dom';
import _ from 'lodash';
import { ICN_BOOKMARK_WHITE, PlusCircleIcon, ICN_SEARCH } from '../icons';
import ApiService from '../../services/api.service';
import { useAuthState } from '../../contexts/AuthContext/context';
import GLOBAL_CONSTANTS from "../../Constants/GlobalConstants";
import moment from 'moment';
import Spinner from "rct-tpt-spnr";
import { AppContext } from '../../contexts/AppContext';
import useToast from '../../commons/ToastHook';
import { Dropdown } from 'react-bootstrap';
import { useConfirmationModal } from '../../commons/ConfirmationModal/ConfirmationModalHook';
import ManageQuantityModal from './ManageQuantityModal';
import ViewListInfo from '../Product/OrderScreen/ViewListInfo';
const ICN_MORE = <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 18 18"><path d="M9 5.5c.83 0 1.5-.67 1.5-1.5S9.83 2.5 9 2.5 7.5 3.17 7.5 4 8.17 5.5 9 5.5zm0 2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S9.83 7.5 9 7.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>

const MyListing = () => {
    const history = useHistory();
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [myList, setMyList] = useState([]);
    const [myLocalLists, setLocalMyList] = useState([]);
    const {setMyListings} = useContext(AppContext);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [manageQuantityModal, setManageQuantityModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState({});
    const [searchText, setSearchText] = useState("");
    const [sortBy, setSortBy] = useState(GLOBAL_CONSTANTS.LISTING_STATUS.ALL);
    const [showViewInfo, setShowViewInfo] = useState(false);

    const detailView = (p) => {
        setSelectedListing(p);
        setShowViewInfo(true);
    }
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <div className="flx pointer"
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
        </div>
    ));

    // show delete confirmation modal when user click on delete
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Delete",
        body: "Are you sure, you want to delete?",
        onConfirm: (list) => {
            deleteListing(list.listInfo, list.list);
        },
        onCancel: () => { }
    })

    const deleteListing = (listInfo, list) => {
        try {
            spinner.show("Deleting... Please wait...");
            let tmpMethod = listInfo.listingDetailsStatus === GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE ? ApiService.deleteIncompleListing : ApiService.deleteListing;
            tmpMethod(listInfo.sid).then(
                response => {
                    let tmpArr = list.filter(l => l.sid != listInfo.sid);
                    setMyList(tmpArr);
                    setLocalMyList(tmpArr);
                    setMyListings(tmpArr);
                    Toast.success({ message: `${listInfo?.title || listInfo.listingDetails?.info?.title || ""} deleted successfully`, time: 3000 });
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data?.error || err.response?.data?.message || err.response?.data.status) : '', time: 3000 });
                    console.error("Error occurred in deleteListing--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error("Error occurred in deleteListing--", err);
        }
    }

    const handleEditNavigation = (list) => {
        try {
            history.push({
                pathname: '/edit-listing',
                state: {
                    breadcrumb: [{
                        name: "Home",
                        path: "/"
                    },
                    {
                        name: "My Listing",
                        path: "/profile/mylisting",
                    },
                    {
                        name: "Edit Listing",
                        path: "/edit-listing"
                    }],
                    currentListing: list
                }
            });
        } catch (err) {
            console.error("Error occurred whilw navigate", err);
        }
    }

    const validateEditListing = (list) => {
        try {
            spinner.show("Please wait...");
            ApiService.validateEditListing(list.sid).then(
                response => {
                    handleEditNavigation(list);
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data?.message || err.response?.data?.error || err.response?.data.status) : '' , time: 3000});
                    console.error("Error occurred in validateEditListing--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error("Error occurred in validateEditListing--", err);
        }
    }

    const getListing = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getMyLists(userDetails.user.sid).then(
                response => {
                    getAllIncompleteListings(response.data);
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            );
        } catch (err) {
            spinner.hide();
            console.error("Error occurred in getListing--", err);
        }
    }

    /**
     * this method to fetch all incomplete listings
     */
    const getAllIncompleteListings = (listings) => {
        try {
            spinner.show("Please wait...");
            ApiService.getAllIncompleListings(userDetails.user.sid).then(
                response => {
                    let tmpArr = !_.isEmpty(response.data) ? response.data.map(e => (
                        {
                            ...e, 
                            "listingDetails": JSON.parse(e.listingDetails),
                            "listingDetailsStatus": GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE
                        }
                    )) : [];
                    let sortedArrByDatePosted = _.orderBy([...listings, ...tmpArr].map(r => ({...r, "postedOn": new Date(r.postedOn).getTime()})), "postedOn", 'desc');
                    setMyList(sortedArrByDatePosted);
                    setLocalMyList(sortedArrByDatePosted);
                    setMyListings(listings); // setting only completed listings to global my listing
                    setIsDataLoaded(true);
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    console.error("Error occur when getAllIncompleteListings", err);
                }
            )
        } catch (err) {
            spinner.hide();
            console.error("Error occur when getAllIncompleteListings", err);
        }
    }

    // this method trigger when user start search - local search
    const handleSearchSort = () => {
        try {
            let tempSeachedList = [];
            if (myLocalLists.length > 0 && sortBy != GLOBAL_CONSTANTS.LISTING_STATUS.ALL) {
                tempSeachedList = myLocalLists.filter(res => res.listingDetailsStatus === sortBy).filter(res => Object.values(res).some(val => val && typeof val === "string" && val.toLowerCase().includes(searchText.toLowerCase())));
            } else if (searchText && sortBy === GLOBAL_CONSTANTS.LISTING_STATUS.ALL && myLocalLists.length > 0) {
                tempSeachedList = myLocalLists.filter(res => Object.values(res).some(val => val && typeof val === "string" && val.toLowerCase().includes(searchText.toLowerCase())));
            } else {
                tempSeachedList = myLocalLists;
            }
            setMyList(tempSeachedList);
        } catch (err) {
            console.error("Error occurred in handleSearchSort--", err);
        }
    }

    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listing_details_content)) {
            const imagesByItem = JSON.parse(item.listing_details_content)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    useEffect(() => {
        handleSearchSort();
    }, [searchText, sortBy]);

    useEffect(() => {
        if(userDetails?.user?.sid){
            getListing();
        }
    }, []);

    return <div className="myAc-TabContent">
        <div className="tab-pane">
            <div className="carousel-head myac-head mobile-off">
                <h2 className="card-title-header">My Listing</h2>
                <span className="float-right">
                    <Link
                        class="create-listing-block"
                        to={{
                            pathname: "/create-listing",
                            state: {
                                breadcrumb: [{
                                    name: "Home",
                                    path: "/"
                                },
                                {
                                    name: "My Listing",
                                    path: "/profile/mylisting",
                                },
                                {
                                    name: "Create Listing",
                                    path: "/create-listing"
                                }]
                            }
                        }}
                    >
                        <PlusCircleIcon width={"20px"} /> Create Listing
                    </Link>
                </span>
            </div>
            <div className="card-mob-head desktop-off"><a href="" className="">
                {ICN_BOOKMARK_WHITE}
                <span>My Listings</span></a>
                <span className="float-right">
                    <Link 
                        to={{
                            pathname: "/create-listing",
                            state: {
                                breadcrumb: [{
                                    name: "Home",
                                    path: "/"
                                },
                                {
                                    name: "My Listing",
                                    path: "/profile/mylisting",
                                },
                                {
                                    name: "Create Listing",
                                    path: "/create-listing"
                                }]
                            }
                        }} 
                        class="create-listing-block"
                    >
                        <PlusCircleIcon width={"20px"} /> Create Listing
                    </Link>
                </span>
            </div>
            <div className='jcb pb10'>
                <div className=''>
                    <select 
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setSearchText("");
                        }}
                        className='form-control form-control-sm pr10'
                        value={sortBy}
                    >
                        <option value={GLOBAL_CONSTANTS.LISTING_STATUS.ALL} id="listing_all">All Listings</option>
                        <option value={GLOBAL_CONSTANTS.LISTING_STATUS.ACTIVE} id="listing_all">Available </option>
                        <option value={GLOBAL_CONSTANTS.LISTING_STATUS.OUT_OF_STOCK} id="listing_all">Out of stock </option>
                        <option value={GLOBAL_CONSTANTS.LISTING_STATUS.EXPIRED} id="listing_all">Expired</option>
                        <option value={GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE} id="listing_all">Incomplete</option>
                    </select>
                </div>
                <div className='p-rel'>
                    <div className='listing-search'>
                        <ICN_SEARCH {...{height:"18.727", width:"18.66", fill:"#777"}}/>
                    </div>
                    <input 
                        onChange={(e) => setSearchText(e.target.value)}
                        className='form-control form-control-sm pl40'
                        placeholder='Search...'
                        value={searchText}
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    {
                        isDataLoaded && myList.length > 0 && myList.slice().map((list, index) => {
                            return <div className="myWishlistbox" key={index}>
                                <span className="WishlistDate">Created On: {moment(list.postedOn).format('LL')}</span>
                                <span className="float-right">
                                    <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} id="create-update-listing">
                                            {ICN_MORE}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {
                                                list.listingType === "DEALER" 
                                                && list.listingDetailsStatus !== GLOBAL_CONSTANTS.LISTING_STATUS.EXPIRED
                                                && (!list.auction && !list.trade) 
                                                && <Dropdown.Item onClick={() => {
                                                    setSelectedListing(list); 
                                                    setManageQuantityModal(true)
                                                }}>Manage Quantity</Dropdown.Item>
                                            }
                                            {
                                                list.listingDetailsStatus !== GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE 
                                                && <Dropdown.Item onClick={() => detailView(list)}>Preview Listing</Dropdown.Item>
                                            }
                                            <Dropdown.Item onClick={() => { 
                                                list.listingDetailsStatus === GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE
                                                    ? handleEditNavigation(list)
                                                    : validateEditListing(list) 
                                            }}>
                                               {list.listingDetailsStatus === GLOBAL_CONSTANTS.LISTING_STATUS.EXPIRED ? "Re-Listing" : "Edit Listing"}
                                            </Dropdown.Item>
                                            {
                                                list.listingDetailsStatus !== GLOBAL_CONSTANTS.LISTING_STATUS.EXPIRED
                                                && <Dropdown.Item onClick={() => showConfirmModal({ "listInfo": list, "list": myList })}>Delete Listing</Dropdown.Item>
                                            }
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </span>
                                <div className="row jcb">
                                    <div className="col-lg-4 col-6 ">
                                        <div className="WishlistItem">
                                            <div className="media">
                                                <div className="prod-thumbnail-img" style={{ backgroundImage: `url(${(list?.listingDetails?.images.length > 0 && list?.listingDetails?.images[0]) || getMyImage(list)})` }}></div>
                                                  
                                                <div className="media-body">
                                                    <h5 className="mt-0" title={list?.title || list?.listingDetails?.info?.title || ""}>{list?.title || list?.listingDetails?.info?.title || ""}</h5>
                                                    <p className="model-wd">Model : {list?.model?.name || list?.listingDetails?.info?.model?.name || list?.listingDetails?.info?.selectedModelName || "" }</p>
                                                    
                                                    {
                                                        list.listingDetailsStatus != GLOBAL_CONSTANTS.LISTING_STATUS.EXPIRED
                                                        && (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore)
                                                        && <p className="model-wd mobile-off">
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
                                                                    : (list?.quantity || list?.listingDetails?.info?.quantity || "")
                                                            }
                                                        </p>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="WishlistItem desktop-off">
                                            <div className="media">
                                                <div className="prod-thumbnail-img border-none">
                                                {
                                                    (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) && <p className="t-center f10 t-PC">{(list.quantity === 0 || list.listingDetailsStatus === "OUTOFSTOCK") ? <span className="text-danger">Out of stock</span>  : list.quantity}</p>}
                                                {    
                                                    (userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) && <p className="wprice-label t-center f9">{(list.quantity === 0 || list.listingDetailsStatus === "OUTOFSTOCK") ?"" : "Qty Available :"}</p>
                                                }    
                                                </div>
                                                <div className="media-body">
                                                    <h5 className="mt-0">Manufacturer</h5>
                                                    <p className="listing-value">{list?.manufacturer?.name || list?.listingDetails?.info?.selectedManufacturerName || ""}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-2 mobile-off">
                                        <div className="WishlistItem-price">
                                            <p className="wprice-label">Manufacturer</p>
                                            <p className="wishlist-price">{list?.manufacturer?.name || list?.listingDetails?.info?.selectedManufacturerName || ""}</p>
                                        </div>
                                    </div>
                                    <div className="col-lg-2 col-2 mobile-off">
                                        <div className="WishlistItem-price ">
                                            <p className="wprice-label">Condition</p>
                                            <p className="wishlist-price">{list?.tcondition?.name || list?.listingDetails?.info?.selectedConditionName || ""}</p>
                                        </div>
                                    </div>

                                    <div className="col-lg-4 col-6">
                                        <div className="row d-flex justify-content-end">
                                            {(list.auction || list.trade || list?.listingDetails?.info?.auction || list?.listingDetails?.info?.trade) && <div className="col-lg-6 col-6">
                                                <div className="WishlistItem-price text-right">
                                                    {
                                                        (list.auction || list?.listingDetails?.info?.auction) && <p className="wprice-label">Reserve Price</p> ||

                                                        (list.trade || list?.listingDetails?.info?.trade) && <p className="wprice-label">Trade Value</p>
                                                    }
                                                    {
                                                        (list.auction || list?.listingDetails?.info?.auction) && <p className="wishlist-price">{(list?.auctionReservePrice || list?.listingDetails?.info?.auctionReservePrice) ? `${'$'+ (list?.auctionReservePrice || list?.listingDetails?.info?.auctionReservePrice)}` : "No Reserve Price"}</p> ||
                                                        (list.trade || list?.listingDetails?.info?.trade) && <p className="wishlist-price">${list.tradeReservePrice || list?.listingDetails?.info?.tradeReservePrice}</p>
                                                    }
                                                </div>
                                                <div className="WishlistItem-price mt-4 desktop-off">
                                                    <p className="wprice-label">Condition</p>
                                                    <p className="wishlist-price">{list.tcondition?.name || list?.listingDetails?.info?.selectedConditionName || ""}</p>
                                                </div>
                                            </div>}
                                            { (list.sell || list?.listingDetails?.info?.sell) && <div className="col-lg-6 col-6">
                                                <div className="WishlistItem-price text-right">
                                                    {
                                                        (list.sell || list?.listingDetails?.info?.sell) && <p className="wprice-label">Buy Now Price </p>
                                                    }
                                                    {
                                                        <p className="wishlist-price">${list.sellPrice || list?.listingDetails?.info?.price}</p>
                                                    }
                                                </div>
                                            </div>}
                                        </div>
                                    </div>

                                </div>
                                <div className="row border-top mt-2">
                                    <div className="col-lg-12">
                                        <p className="wprice-label mt-2 mb-2 listing-gstyle aic pt5">
                                            <span className="mr10 pt5">Listing Type</span>
                                            <span className="d-flex">
                                                {
                                                     (list.sell || list?.listingDetails?.info?.sell) && <span className="speciality-btn">Instant Buy</span>
                                                }
                                                {
                                                    (list.trade || list?.listingDetails?.info?.trade) && <span className="speciality-btn">Trade</span>
                                                }
                                                {
                                                    (list.auction || list?.listingDetails?.info?.auction) && <span className="speciality-btn">Bid</span>
                                                }
                                            </span>
                                        </p>
                                    </div>
                                    {
                                        (list.offeredATrade || list?.listingDetails?.info?.offeredATrade)
                                        && <div className='col-lg-12 f12 pl15'>
                                            <span className='fw600'>Note : </span>
                                            <span className='text-danger'>This listing is offered as trade. It will not be visible to buyers untill your offer is rejected.</span>
                                        </div>
                                    }
                                    {
                                        <div className="col-lg-12 f12 pl15">
                                            {
                                                list.listingDetailsStatus ===  GLOBAL_CONSTANTS.LISTING_STATUS.EXPIRED 
                                                && <span className='text-danger'>This listing is expired!</span>
                                            }
                                            {
                                                list.listingDetailsStatus ===  GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE 
                                                && <span className='text-danger'>Incomplete listing! Hence it will not visible to any buyers!</span>
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        })
                    }
                    {
                        !isDataLoaded && myList.length === 0 && (() => {spinner.show(GLOBAL_CONSTANTS.MSG.SPINNER.LOADING)})()
                    }
                    {
                        isDataLoaded && !myList.length && <div class="gunt-error">No Data Found</div>
                    }
                </div>
            </div>
        </div>
        {
            selectedListing
            && showViewInfo
            && <ViewListInfo {...{
                setViewListing: setShowViewInfo,
                viewListingInfo: selectedListing
            }}/>
        }
        {manageQuantityModal && !_.isEmpty(selectedListing) && <ManageQuantityModal {...{show: manageQuantityModal, setShow: setManageQuantityModal, selectedListing, callback: () => {getListing()}}}/>}
        {ConfirmationComponent}
    </div>;
}

export default memo(MyListing);