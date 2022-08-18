import React, { useEffect, useContext, useRef, useState, memo } from 'react'
import ApiService from "../../services/api.service";
import { AppContext } from '../../contexts/AppContext';
import { useAuthState } from '../../contexts/AuthContext/context';
import {useHistory } from "react-router-dom";
import _ from 'lodash';
import moment from 'moment';
import Spinner from "rct-tpt-spnr";
import useToast from "../../commons/ToastHook"
import { ListingContext } from './Context/ListingContext';
import ListingItemsView from './ListingItemsView';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';
import { services } from '@tomtom-international/web-sdk-services';
import { MAP_API_KEY } from '../../commons/utils';
// owl-carousel
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const ListingPost = ({ setTab, listInfoByView, setListInfoByView, setIsBlocking, onCancelStep = () => {} }) => {
    const {bundleItems} = useContext(ListingContext)
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const history = useHistory();
    const listDetail = _.cloneDeep(listInfoByView);
    const { fflStore, setValueBy, platformVariables } = useContext(AppContext);
    let submitFormRef = useRef();
    const [address, setAddress] = useState(null);

    const deleteListing = (sid = "") => {
        try {
            spinner.show("Deleting... Please wait...");
            ApiService.deleteIncompleListing(sid).then(
                response => {
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data?.error || err.response?.data?.message || err.response?.data.status) : '', time: 2000 });
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

    // this method trigger to get location
    const getMyLocation = (latlng) => {
        try {
            function callbackFn(resp) {
                setAddress(resp.addresses[0]);
             }
             services.reverseGeocode({
                 key: MAP_API_KEY,
                 position: latlng
             }).then(callbackFn);
        } catch (err) {
            console.error("Error occured while getMyLocation--", err);
        }
    }

    useEffect(() =>{
        getMyLocation({lat: Number(listInfoByView.location.lat), lng: Number(listInfoByView.location.lng)});
    },[]);
    

    function getMyPayload(fromBulk=false, data={}) {
        const images = listDetail.images.map((img, index) => {
            return {
                fileName: img,
                mediaType: "images",
                order: index
            };
        });
        const payload = {
            "appUser": {
                "sid": userDetails.user.sid
            },
            "auction": listDetail.info.auction,
            "auctionReservePrice": listDetail.info.auction ? listDetail.info.auctionReservePrice : null,
            "availableOtherLocation": listDetail.info.availableOtherLocation,
            "anyOtherLocation": listDetail?.anyOtherLocation && !_.isEmpty(listDetail?.anyOtherLocation) ? JSON.stringify(listDetail.anyOtherLocation) : null,
            "returnable": listDetail.info.returnable,
            "platformVariables": listDetail.info.platformVariables ? JSON.stringify({"returnPeriod" :  listDetail.info.platformVariables.returnPeriod.toString(), "restockingFees": { "percentage": listDetail.info.platformVariables.restockingFees.percentage.toString(), "amount":  listDetail.info.platformVariables.restockingFees.amount.toString()}}) : null,
            "barrelLength": {
                "sid": fromBulk ? (data?.barrelLength ?? null) : (listDetail.info.barrelLength?.sid ?? null)
            },
            "caliber": {
                "sid":fromBulk ? (data?.caliber ?? null) : (listDetail.info?.caliber?.sid ?? null)
            },
            "capacity": {
                "sid":fromBulk ? (data?.capacity ?? null) : (listDetail.info?.capacity?.sid ?? null)
            },
            "category": {
                "sid":fromBulk ? (data?.category ?? null ) : listDetail.info.category?.sid
            },
            "tcondition": {
                "sid": fromBulk ? (data?.tcondition ?? null) : (listDetail.info?.tcondition?.sid ?? null)
            },
            "consentProvided": true,
            "deliveryType": listDetail.info.deliveryType,
            "description":fromBulk ? data.description : listDetail.info?.description,
            "frameFinish": {
                "sid":fromBulk ? (data?.frameFinish ?? null ) : (listDetail.info?.frameFinish?.sid ?? null)
            },
            "grips": {
                "sid":fromBulk ? (data?.grips ?? null ) : (listDetail.info?.grips?.sid ?? null)
            },
            "listingLocation": JSON.stringify(address?.address),
            // "latitude": listDetail.location ? listDetail.location.lat : '',
            // "longitude": listDetail.location ? listDetail.location?.lng || listDetail.location?.lon : '',
            "latitude": listInfoByView.location.lat,
            "longitude": listInfoByView.location.lng,
            "listingDetailsStatus": "ACTIVE",
            "listingType": userDetails.user.appUserType || 'INDIVIDUAL',
            "listing_details_content": JSON.stringify(images),
            "manufacturer": {
                "sid":fromBulk ? (data?.manufacturer ?? null) : (listDetail.info?.manufacturer?.sid ?? null)
            },
            "model": {
                "sid":fromBulk ? (data?.model ?? null) : (listDetail.info?.model?.sid ?? null)
            },
            "sell": listDetail.info.sell,
            "sellPrice": listDetail.info.sell ? listDetail.info.price : null,
            "estimatedPrice": fromBulk ? data.estimatedPrice : listDetail.info.price,
            "title": fromBulk ? data.title : listDetail.info.title,
            "trade": listDetail.info.trade,
            "tradeReservePrice": listDetail.info.trade ? (fromBulk ? data.tradeReservePrice : listDetail.info.tradeReservePrice) : null,
            "pre1968":fromBulk ? data.pre1968 : listDetail.info.pre1968,
            "serialNumber": userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore && ((fromBulk && data?.serialNumber) || listDetail?.info?.serialNumber) ? JSON.stringify({"listing": "Item 1", "serialNumber": fromBulk ? data.serialNumber : listDetail.info.serialNumber}) : null,
            "auctionExpireOn": listDetail.info.auction 
                ? (listDetail.info.auctionExpireOn 
                    && listDetail.info.auctionExpireOn.length <= 2 
                    ? moment().add('days', listDetail.info.auctionExpireOn) 
                    : (
                        listDetail.info.auctionExpireOn 
                        && new Date(listDetail.info.auctionExpireOn).getTime() < new Date().getTime()
                        ? moment().add('days', 7) 
                        : moment(listDetail.info.auctionExpireOn).add('days', 7)
                    ))
                : null,
            "tradeExpiresOn": listDetail.info.trade
                ? (listDetail.info.tradeExpiresOn 
                    && listDetail.info.tradeExpiresOn.length <= 2 
                    ? moment().add('days', listDetail.info.tradeExpiresOn) 
                    : (
                        listDetail.info.tradeExpiresOn 
                        ? moment(listDetail.info.tradeExpiresOn).add('days', 7) 
                        : null
                    )
                )
                : null,
            "sellExpiresOn": listDetail.info.sell 
                ? (listDetail.info.sellExpiresOn 
                    && listDetail.info.sellExpiresOn.length <= 2 
                    ? moment().add('days', listDetail.info.sellExpiresOn) 
                    : (
                        listDetail.info.sellExpiresOn 
                        && new Date(listDetail.info.sellExpiresOn).getTime() < new Date().getTime()
                        ? moment().add('days', 7) 
                        : moment(listDetail.info.sellExpiresOn).add('days', 7)
                    ))
                : null,
            "postedOn": listDetail.info.postedOn ? listDetail.info.postedOn : new Date().getTime(),
            "secondaryListings":fromBulk ? JSON.stringify(listInfoByView.listingItem) : null, 
            "currency": {
                "sid": GLOBAL_CONSTANTS.CURRENCY.DOLLAR
            },
            "sid": listDetail.sid ? listDetail.sid : null,
            "offeredATrade": listInfoByView.isFromTrade ? true : false,
            "quantity": listDetail.info.quantity,
            "sheriffOfficeEnabled": listDetail.info.sheriffOfficeEnabled,
            "sheriffOfficeLocation": listDetail.info?.sheriffOfficeLocation ? JSON.stringify(listDetail.info.sheriffOfficeLocation) : null,
            "listingPreferredDistance": listDetail.info.listingPreferredDistance,
            "shipBeyondPreferredDistance": userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore ? listDetail.info.shipBeyondPreferredDistance : true,
            "shippingFeesLocationBased": listDetail.info.shippingFree ? false : listDetail.info.shippingFeesLocationBased,
            "shippingFree": listDetail.info.shippingFree,
            "fixedSippingFees": listDetail.info.shippingFree ? "" : listDetail.info.fixedSippingFees,
            "itemType": listDetail.info.itemType,
            "fflStore": userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore ? null : ((userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) && listDetail.info.fflStoreLocation?.sid ? {"sid": listDetail.info.fflStoreLocation.sid} : null),
            "fflStoreLocation": listDetail.info.fflStoreLocation ? JSON.stringify(listDetail.info.fflStoreLocation) : null,
            "fflStoreEnabled": userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL && !userDetails.user.adminToFFlStore ? listDetail.info.fflStoreEnabled : true,
        };
        if(fromBulk){
            let totalEstimate = listInfoByView.listingItem.length > 0 ? listInfoByView.listingItem.reduce((a, {estimatedPrice}) => a + parseInt(estimatedPrice), 0) : listInfoByView.listingItem[0].estimatedPrice
            payload.bundled = true;
            payload.primary =  true;
            payload.totalEstimatedPrice = totalEstimate;
            payload.sellPrice = totalEstimate;
            payload.tradeReservePrice = listDetail.info.trade ? totalEstimate : null;
            payload.auctionReservePrice = listDetail.info.auction ? totalEstimate : null;
        }
        // if (!_.isEmpty(fflStore)) {
        //     payload.fflStore = {
        //         sid: fflStore
        //     }
        //     payload.listingType = 'DEALER';
        // } else {
        //     payload.listingType = 'INDIVIDUAL';
        // }
        if (listDetail.info.specificTrade && !_.isEmpty(listDetail.info.specificTrade)) {
            payload.tradeWithListing = null;
            // payload.tradeWithListing = {
            //     sid: listDetail.info.specificTrade.sid
            // };
            payload.trade_with_listing_type = JSON.stringify(listDetail.info.specificTrade);
        }
        return payload;
    }

    const createListing = (payload) => {
        try {
            ApiService.createListing(payload).then(
                response => {
                    if(listDetail.listingStatus === GLOBAL_CONSTANTS.LISTING_STATUS.INCOMPLETE && listDetail.incompleteListingSid) {
                        deleteListing(listDetail.incompleteListingSid);
                    }
                    setListInfoByView({...listInfoByView, "listingStatus": GLOBAL_CONSTANTS.LISTING_STATUS.COMPLETED, "incompleteListingSid": null});
                    if (!_.isEmpty(fflStore)) {
                        history.push('/mystore/listing/' + fflStore);
                        setValueBy('SET_FFLSTORE', '');
                    } else if(listInfoByView.isFromTrade) {
                        history.push({ 
                            pathname: `/order/trade/${history.location?.state?.product?.sid}`,
                            state: {
                                breadcrumb: [
                                ...(history?.location?.state?.breadcrumb ? history?.location?.state?.breadcrumb.slice(0, -1) : []),
                                ],
                                newListingInfo: response.data,
                                tradeListItems: history.location?.state?.tradeListItems ? history.location?.state.tradeListItems : []
                            }
                        })
                    } else {
                        history.push({
                            pathname: `/profile/mylisting`,
                            state: {
                                breadcrumb: [{
                                    name: "Home",
                                    path: "/"
                                },
                                {
                                    name: "My Listings"
                                }]
                            }
                        });
                    }
                    Toast.success({ message: `${listDetail.info.isSingle ? payload.title : "Bulk "} list ${listDetail.sid ? " updated " : " created "} successfully!`, time: 2000});
                },
                err => {
                    submitFormRef.current = true;
                    Toast.error({ message: err.response?.data ? (err.response?.data?.error || err.response?.data?.message || err.response?.data.status || "") : '' });
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error("Error in createListing--", err);
        }
    }
    
    const postItem = () => {
        try {
            if (!submitFormRef.current) {
                submitFormRef.current = true;
                setIsBlocking(false); // don't show prompt message which prevent to route and save temp data
                spinner.show("Please wait...");
                const payload = listDetail.info.isSingle ? getMyPayload() : getMyPayload(true, listInfoByView.listingItem[0])
                createListing(payload);
            }
        } catch (err) {
            submitFormRef.current = false;
            spinner.hide();
            console.error("Error occurred while postItem--", err);
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    return (<fieldset>
        <div className="form-card">
        { spinner.hide()}
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="row justify-content-center">
                        <div className="col-lg-5">
                            <div id="demo-pranab" className="listing-item-pic">
                                <OwlCarousel id="owl-item-details" className='owl-theme carousel-container' loop nav autoplay autoplayHoverPause margin={20} items={1} autoplayTimeout={2000} responsive={{
                                    0: {
                                        items: 1
                                    },
                                    600: {
                                        items: 1
                                    },
                                    1000: {
                                        items: 1
                                    }
                                }}>
                                    {listDetail.images.map((item, index) => {
                                        return <div className="item" key={index}>
                                            <div className="prod-image-div" style={{ backgroundImage: `url(${item})` }}></div>
                                        </div>
                                    })}
                                </OwlCarousel>
                            </div>


                        </div>
                        
                        <div className="col-lg-7 proDetails-left text-left">
                            {
                                !listDetail.info.isSingle 
                                && <ListingItemsView {...{bundleItems: listInfoByView.listingItem, listingInfo: listDetail.info, fromListing: false}}/>
                            }
                            { 
                                listDetail.info.isSingle 
                                && <div className="row bg-white bg-none justify-content-between">
                                <div className="col-lg-8 col-8">
                                    <h2>{listDetail.info.title}</h2>
                                    <div className="aic">
                                        {
                                            listDetail.info.sell
                                            && <div className="mr20">
                                                <p className="price-tag f12 fw100">Buy Now Price</p>
                                                <p className="pro-price buyNowPrice">${listDetail.info.price}</p>
                                            </div>
                                        }
                                        {
                                            listDetail.info.auction
                                            && <div className="mr20">
                                                <p className="price-tag f12 fw100">Reserve Price</p>
                                                <p className="pro-price">{Number(listDetail.info?.auctionReservePrice) ? `${'$'+ listDetail.info.auctionReservePrice}` : "No Reserve Price"}</p>
                                            </div>
                                        }
                                        {
                                            listDetail.info.trade
                                            && <div className="mr20">
                                                <p className="price-tag f12 fw100">Trade Value</p>
                                                <p className="pro-price">{listDetail.info?.tradeReservePrice ? `${'$'+ listDetail.info.tradeReservePrice}` : "0"}</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-lg-4 col-4 proDetails-right">
                                    <p className="mod-used-cls"><span className="item-cond-badge">{listDetail.info.tcondition?.name ?? '-'}</span></p>
                                </div>
                                <div className="col-lg-12 mt-3">
                                    <div className="pro-dtle-box">
                                        <p className="pro-description">{listDetail.info.description}</p>
                                        <h4 className="pro-spc-head">Specifications</h4>
                                        <table className="table table-borderless pro-dtails-table">
                                            <tbody>
                                            <tr>
                                                    <td>Category :</td>
                                                    <td><div className="spec-label">{listDetail.info.category?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Condition :</td>
                                                    <td><div className="spec-label">{listDetail.info.tcondition?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Manufacturer :</td>
                                                    <td><div className="spec-label">{listDetail.info.manufacturer?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Model :</td>
                                                    <td><div className="spec-label">{listDetail.info.model?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Caliber :</td>
                                                    <td><div className="spec-label">{listDetail.info.caliber?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Barrel Length :</td>
                                                    <td><div className="spec-label">{listDetail.info.barrelLength?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Capacity :</td>
                                                    <td><div className="spec-label">{listDetail.info.capacity?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Frame Finish :</td>
                                                    <td><div className="spec-label">{listDetail.info.frameFinish?.name ?? '-'}</div></td>
                                                </tr>
                                                <tr>
                                                    <td>Grips :</td>
                                                    <td><div className="spec-label">{listDetail.info.grips?.name ?? '-'}</div></td>
                                                </tr>
                                                {
                                                    !listDetail.info.pre1968 && !_.isEmpty(listDetail.info.serialNumber) && <tr>
                                                        <td>Serial Number :</td>
                                                        <td><div className="spec-label">{listDetail.info.serialNumber}</div></td>
                                                    </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="row bg-white mb-2">
                                    <div class="col-lg-12">
                                        <div class="ind-seller-box">
                                            <h6>Available At</h6>
                                            <div className="mt-2 d-flex">
                                                {(listDetail.info.fflStoreEnabled || userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore) && <div className="speciality-btn">FFL Stores</div>}
                                                {listDetail.info.sheriffOfficeEnabled && <div className="speciality-btn">Sherriff's Office</div>}
                                                {listDetail.info.availableOtherLocation && <div className="speciality-btn">Other</div>}
                                            </div>
                                            {
                                                listDetail.info?.shipBeyondPreferredDistance || userDetails.user.appUserType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || userDetails.user.adminToFFlStore
                                                ? <div className="ready-to-ship f12 pl5 py10"><span><i class="fa fa-info-circle" aria-hidden="true"></i></span> This seller is ready to ship the item</div>
                                                : <div className="shipment-charges-notification f12 pl5 py10"><span><i class="fa fa-info-circle" aria-hidden="true"></i></span> This seller does not ship the item</div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                
                            </div>}
                            {
                                listDetail.info 
                                && listDetail.info.returnable 
                                && !_.isEmpty(platformVariables)
                                && <div className={`col-lg-12 mt-3 ${!listDetail.info.isSingle ? "pl40" : ""}`}>
                                    <div className="pro-dtle-box">
                                        <h4 className="f12 text-semi-bold">Return Policy</h4>
                                        <div className="fdc mt-2 f12 c111">
                                        <span>This item is eligible for return, within <span className="text-semi-bold">{listDetail.info.platformVariables.returnPeriod} days</span> of the delivery.</span>
                                                <span>Restocking fees of <span className="text-semi-bold">{listDetail.info.platformVariables.restockingFees.percentage}%</span><span className="px5">or</span><span className="text-semi-bold">${listDetail.info.platformVariables.restockingFees.amount}</span> will be charged on the item's cost whichever is higher.</span>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    
                    </div>
                </div>
            </div>
        </div>
        {/* <input type="button" name="make_payment" className="next action-button nextBtn" value={listDetail.sid ? "Update & Post" : "Post"} onClick={postItem} /> */}
        <div class="aic py15 jcc mobile-off">
            {/* <input type="button" value="Previous" class="submt-btn submt-btn-lignt mr10" onClick={() => onPrevNav(values)}></input> */}
            <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => onCancelStep()}></input>
            <input type="button" name="next" className="next action-button nextBtn nextBtnfst px20" value={listDetail.sid ? "Update & Post" : "Post"} onClick={postItem} />
        </div>
        <section class="mobile-btn-section desktop-off">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="proPg-btnArea">
                                <ul>
                                    {/* <li onClick={() => onPrevNav(values)} name="make_payment"><a class="submt-btn submt-btn-lignt mr10">Previous</a></li> */}
                                    <li onClick={() => onCancelStep()}><a class="submt-btn submt-btn-lignt mr10 text-center">Cancel</a></li>
                                    <li onClick={postItem}><a class="submt-btn submt-btn-dark">{listDetail.sid ? "Update & Post" : "Post"}</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
        </section>
    </fieldset>)
}
export default memo(ListingPost)