import React, { useState, useEffect, useContext } from "react";
import _ from 'lodash';
import ListingItemsView from "../../Listing/ListingItemsView";
import { ICN_PRIMARY_LG } from '../../icons';
import GLOBAL_CONSTANTS from "../../../Constants/GlobalConstants";
// owl-carousel
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const ViewListInfo = ({setViewListing, viewListingInfo}) => {
    const [images, setImages] = useState([]);
    const [listingInfo, setListingInfo] = useState(null);
    const [, forceRender] = useState();
    useEffect(() => {
        if(!_.isEmpty(viewListingInfo)) setListingInfo({
            ...viewListingInfo, 
            "platformVariables": viewListingInfo?.platformVariables && typeof viewListingInfo.platformVariables === "string"
            ? JSON.parse(viewListingInfo.platformVariables) 
            : viewListingInfo.platformVariables});
        if (viewListingInfo.listing_details_content) {
            if (!_.includes(JSON.parse(viewListingInfo.listing_details_content), 'listingContent')) {
                setImages(JSON.parse(viewListingInfo.listing_details_content));
            } else {
                setImages([{
                    "fileName": "../../images/no-image-available.png"
                }]);
            }
        } else {
            setImages([{
                "fileName": "../../images/no-image-available.png"
            }]);
        }
    }, viewListingInfo)
    
    // Listens files changes and makes component to forcefully re-render due to file carousel inside formik but it does not react for outside state changes
    useEffect(() => {
        forceRender(Date.now());
    }, [images])
    return (
        <>
            <div className="cd-signin-modal js-signin-modal specific-trade-filter">
                <div className="cd-signin-modal__container creating-listing-modal">
                    <div class="col-12 win-header m-0 bb-ddd">
                        <p class="text-left mt-2 mb-0 text-semi-bold">View Listing</p>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <section className="view95vh bc-eee">
                                <div class="container">
                                    <div className="justify-content-center">
                                        <div className="w100">
                                            <div className="row justify-content-center">
                                                <div className="w100 p15">
                                                    <div id="demo-pranab" className="listing-item-pic">
                                                        <OwlCarousel 
                                                            id="owl-item-details" 
                                                            className='owl-theme carousel-container' 
                                                            loop 
                                                            nav 
                                                            autoplay 
                                                            autoplayHoverPause 
                                                            margin={20} 
                                                            items={1} 
                                                            autoplayTimeout={2000} 
                                                            responsive={{
                                                                0: {
                                                                    items: 1
                                                                },
                                                                600: {
                                                                    items: 1
                                                                },
                                                                1000: {
                                                                    items: 1
                                                                }
                                                            }}
                                                        >
                                                            {!_.isEmpty(images) && images.map((item, index) => {
                                                                return <div class="item product-images" key={index}>
                                                                    {viewListingInfo.primary && <div className="prmy-icn">{ICN_PRIMARY_LG}</div>}
                                                                    <div className="prod-image-div" style={{ backgroundImage: `url(${item.fileName || item.key})` }}></div>
                                                                </div>
                                                            })}
                                                        </OwlCarousel>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    {viewListingInfo.primary && <ListingItemsView {...{bundleItems: JSON.parse(viewListingInfo.secondaryListings), listingInfo: JSON.parse(viewListingInfo.secondaryListings)[0] }}/>}
                                                    {!viewListingInfo.primary &&
                                                        <div className="row bc-white px20 pt10 mb10">
                                                            <div className="col-lg-8 col-8">
                                                                <div className="f18 theme-color fw600">{viewListingInfo.title}</div>
                                                                <div className="aic pt10">
                                                                    {
                                                                        viewListingInfo.sell
                                                                        && <div className="pr20">
                                                                            <p className="price-tag f11 c999">Buy Now Price</p>
                                                                            <p className="pro-price vl-price">${viewListingInfo?.sell ? viewListingInfo.sellPrice : "0"}</p>
                                                                            </div>
                                                                    }
                                                                    {
                                                                        viewListingInfo.auction
                                                                        && <div className="">
                                                                            <p className="price-tag f11 c999">Reserve Price</p>
                                                                            <p className="pro-price vl-price">{viewListingInfo?.auctionReservePrice ? `${viewListingInfo.auctionReservePrice}` : "No Reserve Price"}</p>
                                                                        </div>
                                                                    }
                                                                    {
                                                                        viewListingInfo.trade
                                                                        && <div className="">
                                                                            <p className="price-tag f11 c999">Trade Value</p>
                                                                            <p className="pro-price vl-price">${viewListingInfo?.tradeReservePrice ? viewListingInfo.tradeReservePrice : "0"}</p>
                                                                        </div>
                                                                    }
                                                                    
                                                                </div>
                                                            </div>
                                                            <div className="col-lg-4 col-4 proDetails-right">
                                                                <p className="mod-used-cls"><span className="item-cond-badge">{viewListingInfo?.tcondition?.name || "-"}</span></p>
                                                            </div>
                                                            <div className="col-lg-12 mt-3">
                                                                <div className="pro-dtle-box">
                                                                    <p className="pro-description">{viewListingInfo?.description || ""}</p>
                                                                    <h4 className="pro-spc-head">Specifications</h4>
                                                                    <table className="table table-borderless pro-dtails-table">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>Manufacturer :</td>
                                                                                <td><div className="spec-label">{viewListingInfo?.manufacturer?.name || "-"}</div></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Model :</td>
                                                                                <td><div className="spec-label">{viewListingInfo?.model?.name || "-"}</div></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Caliber :</td>
                                                                                <td><div className="spec-label">{viewListingInfo?.caliber?.name || "-"}</div></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Barrel Length :</td>
                                                                                <td><div className="spec-label">{viewListingInfo?.barrelLength?.name || "-"}</div></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Capacity :</td>
                                                                                <td><div className="spec-label">{viewListingInfo?.capacity?.name || "-"}</div></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Frame Finish :</td>
                                                                                <td><div className="spec-label">{viewListingInfo?.frameFinish?.name || "-"}</div></td>
                                                                            </tr>
                                                                            
                                                                            {
                                                                                viewListingInfo.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL 
                                                                                && (viewListingInfo.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.FIRE_ARM || viewListingInfo.itemType === GLOBAL_CONSTANTS.ITEM_TYPE.PRE_1968)
                                                                                && !_.isEmpty(viewListingInfo?.serialNumber) && <tr>
                                                                                    <td>Serial Number :</td>
                                                                                    <td><div className="spec-label">{viewListingInfo.serialNumber ? JSON.parse(viewListingInfo.serialNumber).serialNumber : ""}</div></td>
                                                                                </tr>
                                                                            }
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    <div class="row bg-white mb10">
                                                        <div class="col-lg-12">
                                                            <div class="ind-seller-box">
                                                                <h6>Available At</h6>
                                                                <div className="mt-2 d-flex">
                                                                    {viewListingInfo.fflStoreEnabled && <div className="speciality-btn">FFL Stores</div>}
                                                                    {viewListingInfo.sheriffOfficeEnabled && <div className="speciality-btn">Sherriff's Office</div>}
                                                                    {viewListingInfo.availableOtherLocation && <div className="speciality-btn">Other</div>}
                                                                </div>
                                                                {
                                                                    viewListingInfo?.shipBeyondPreferredDistance 
                                                                    ? <div className="ready-to-ship f12 pl5 py10"><span><i class="fa fa-info-circle" aria-hidden="true"></i></span> This seller is ready to ship the item</div>
                                                                    : <div className="shipment-charges-notification f12 pl5 py10"><span><i class="fa fa-info-circle" aria-hidden="true"></i></span> This seller does not ship the item</div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {
                                                        listingInfo &&
                                                        listingInfo.returnable &&
                                                        listingInfo.platformVariables && <div className="row bc-white my10 px20 py10">
                                                            <div className="col-lg-12 pb10">
                                                                <div className="pro-dtle-box">
                                                                    <h4 className="f12 text-semi-bold">Return Policy</h4>
                                                                    <div className="fdc mt-2 f12">
                                                                        <span>This item is eligible for return, within <span className="text-semi-bold">{listingInfo.platformVariables.returnPeriod} days</span> of the delivery.</span>
                                                                        <span>Restocking fees of <span className="text-semi-bold">{`${listingInfo?.platformVariables?.restockingFees?.percentage || "-"}% or $${listingInfo?.platformVariables?.restockingFees?.amount || "-"}`}</span> whichever is higher.
                                                                         {/* will be charged on the item's cost. */}
                                                                         </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <a class="cd-signin-modal__close js-close" onClick={() => setViewListing(false)} >Close</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ViewListInfo;