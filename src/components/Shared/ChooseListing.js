import React, { useEffect, useState, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import _ from 'lodash';
import ApiService from '../../services/api.service';
import { useAuthState } from  '../../contexts/AuthContext/context';
import useToast from '../../commons/ToastHook';
import { AppContext } from '../../contexts/AppContext';
import { Form } from 'react-bootstrap';
import { ICN_PRIMARY_LG } from '../icons';

const ChooseListing = ({setListingModel, tabWiseData, handleSetListingValues, specificTrade}) => {
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const appContext = useContext(AppContext);
    const [myLists, setMyList] = useState(appContext.myListings ? appContext.myListings.filter(r => !r.auction).map(r => ({...r, "selectedQuantity": 1})) : []);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [listings, setListings] = useState(tabWiseData.tradeListItems ? tabWiseData.tradeListItems : []);

    const initOpenTradeListing = () => {
        spinner.show("Please wait...");
        ApiService.getMyUnOrderedLists(userDetails.user.sid).then(
            response => {
                setMyList(!_.isEmpty(response.data) ? response.data.filter(r => !r.auction).map(r => ({...r, "selectedQuantity": 1})) : []);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }

    const getMyPayload = (fValues) => {
        let payload =  {
            "postedBy": [userDetails.user.sid]
        };
        if(fValues) {
            if (fValues.category){
                payload.category = [fValues.category];
            }
            if (fValues.tcondition){
                payload.condition = [fValues.tcondition];
            }
            if (fValues.manufacturer){
                payload.manufacturer = [fValues.manufacturer];
            }
            if (fValues.model){
                payload.model = [fValues.model];
            }
            if (fValues.barrelLength){
                payload.barrelLength = [fValues.barrelLength];
            }
            if (fValues.caliber){
                payload.caliber = [fValues.caliber];
            }
            if (fValues.capacity){
                payload.capacity = [fValues.capacity];
            }
            if (fValues.frameFinish){
                payload.frameFinish = [fValues.frameFinish];
            }
            if (fValues.grips){
                payload.grips = [fValues.grips];
            }
        }
        return payload;
    }

    const initSpecificTradeListing = () => {
        const payload = getMyPayload(specificTrade)
        spinner.show("Please wait...");
        ApiService.getMyUnOrderedListsBySpecific(payload).then(
            response => {
                setMyList(!_.isEmpty(response.data) ? response.data.filter(r => !r.auction).map(r => ({...r, "selectedQuantity": 1})) : []);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }
      
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listing_details_content)) {
            const imagesByItem = JSON.parse(item.listing_details_content)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    const selectItem = (list) => {
        const values = {
            title: list.title,
            category: list.category ? list.category.sid : '',
            tcondition: list.tcondition ? list.tcondition.sid : '',
            manufacturer: list.manufacturer ? list.manufacturer.sid : '',
            model: list.model ? list.model.sid : '',
            caliber: list.caliber ? list.caliber.sid : '',
            barrelLength: list.barrelLength ? list.barrelLength.sid : '',
            capacity: list.capacity ? list.capacity.sid : '',
            frameFinish: list.frameFinish ? list.frameFinish.sid : '',
            price: list.sellPrice,
            grips: list.grips ? list.grips.sid : ''
        };
        const images = JSON.parse(list.listing_details_content);
        handleSetListingValues(values, images, list);
        setListingModel(false);
    }

    const handleCheckListing = (e, list) => {
        try {
            let tmpList = [...listings];
            if(e.target.checked) {
                tmpList.push(list);
            } else {
                tmpList = tmpList.filter(r => r.sid !== list.sid);
            }
            setListings(tmpList);
        } catch (err) {
            console.error("Error occur in handleCheckListing--", err);
        }
    }

    const initIsOfferedForTrade = (list = [], disable = true) => {
        spinner.show("Please wait...");
        let payload = {
            "listingSids": list.map(r => r.sid),
            "toggle": disable
        };
        ApiService.isOfferedForTrade(payload).then(
            response => { },
            err => { }
        ).finally(() => {
            spinner.hide();
        });
    }

    const handleSelect = () => {
        let tmpList = [...listings];
        tabWiseData.tradeListItems = tmpList;
        setListingModel(false); // close modal
        initIsOfferedForTrade(tmpList);
    }

    useEffect(() => {
        if (!_.isEmpty(specificTrade)) {
            initSpecificTradeListing();
        } else {
            initOpenTradeListing();
        }    
    }, []);

    return ( 
        <>
        <div className="cd-signin-modal js-signin-modal specific-trade-filter">
            <div className="cd-signin-modal__container creating-listing-modal">
                <div class="col-12 win-header m-0">
                    <p class="text-left mt-2 mb-0 text-semi-bold">{!_.isEmpty(specificTrade) ? "Your listing with matching specifications" : "Choose from existing listings"}</p>
                </div>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="js-signin-modal-block border-radius" data-type="specificFilter">
                            <section id="specific-filter-section">
                                <div class="">
                                    <div className="py5 text-left px20">My Listings</div>
                                    <div className="fixed-modal">
                                    {
                                        isDataLoaded 
                                        && myLists.length> 0 
                                        &&  myLists.slice().reverse().map((list, index) => {
                                                return <div className="myWishlistbox p-rel py15 px20">
                                                    {list.primary && <div className="cl-prmy-icn">{ICN_PRIMARY_LG}</div>}
                                                    <div className="aic">
                                                        <div className="px20">
                                                            <Form.Check
                                                                id={`listings-${list.sid}`}
                                                                type="checkbox"
                                                                checked={listings.some(r => r.sid === list.sid)}
                                                                name={`listings-${list.sid}`}
                                                                onChange={(e) => { handleCheckListing(e, list) }}
                                                            />
                                                        </div>
                                                        <div className="WishlistItem px10">
                                                            <img src={getMyImage(list)} className="mr-3" alt="..." />
                                                        </div>
                                                        <div className="text-left pt10">
                                                            <div className="mt-0 f12 text-semi-bold theme-color lnh-1">{list.title}</div>
                                                            <div className="WishlistItem-price lnh-15 pt10">
                                                                <div className="wprice-label f10">{list?.tcondition?.name || "-"}</div>
                                                                <div className="wprice-label f10">Qty : {list.quantity}</div>
                                                            </div>
                                                        </div>
                                                        <div className="aic jce pt20 text-right flx2">
                                                            {   
                                                                list.trade 
                                                                && <div className="WishlistItem-price">
                                                                    <div className="wprice-label f10">Trade value</div>
                                                                    <div className="f12 text-semi-bold lnh-05 theme-color">${list.tradeReservePrice}</div>
                                                                </div>
                                                            }
                                                            {   
                                                                list.auction 
                                                                && <div className="WishlistItem-price">
                                                                    <div className="wprice-label f10">Reserve Price</div>
                                                                    <div className="f12 text-semi-bold lnh-05 theme-color">{list.auctionReservePrice ? "$" + list.auctionReservePrice : "No Reserve Price"}</div>
                                                                </div>
                                                            }
                                                            {
                                                                list.sell 
                                                                && <div className="WishlistItem-price pl20">
                                                                    <div className="wprice-label f10">Buy Now Price</div>
                                                                    <div className="f12 text-semi-bold lnh-05 theme-color">${list.sellPrice}</div>
                                                                </div>
                                                            }
                                                        </div>
                                                        
                                                    </div>
                                                </div>
                                            })
                                        }
                                        
                                        {
                                            isDataLoaded && !myLists.length && <div class="gunt-error py10">No Listing Found</div>
                                        }
                                    </div>
                                    <div class="flx specific-add-filter-footer p-3">
                                        <div className="flx1 mr-2"><input type="button" value="Cancel" class="submt-btn submt-btn-lignt display-inline full-w mx-2" onClick={() => setListingModel(false)} /></div>
                                        <div className="flx1 mx-2"><input type="submit" disabled={listings.length === 0} value="Select" class="submt-btn full-w submt-btn-dark display-inline" onClick={() => handleSelect()} /></div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                    <a class="cd-signin-modal__close js-close" onClick={() => setListingModel(false)} >Close</a>
                </div>
            </div>
        </div>
    </>
  ); 
} 
  
export default ChooseListing;