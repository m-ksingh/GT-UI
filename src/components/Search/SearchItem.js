import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { ICN_PRIMARY, IcnLocation } from '../icons';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';

const SearchItem = ({product}) => {

    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listingDetailsContent)) {
            const imagesByItem = JSON.parse(item.listingDetailsContent)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    return ( 
        <div class="pro-box pro-box-search">
            <div class="pro-left-part">
                <div class="media">
                    {    
                        product.primary 
                        && <div className="prmy-icn search-bundle-icn">{ICN_PRIMARY}</div>
                    }
                    <span className="search-badge">
                        <span className="distance-badge-search f8 text-center aic">{`${Number(product.distance).toFixed(2)} mi`}</span>
                        <div className="search-img">
                            <img src={getMyImage(product)} class="" alt="..." />
                        </div>
                    </span>
                    <div class="media-body pro-box-body">
                        <h5 class="mt-0">{product.title}</h5>
                        <div class="row">
                        {
                            product.sell &&
                            <div class="col-6">
                                <p class="price-label desktop-off">Buy Now Price</p>
                                <p class="price-amt desktop-off">${product.sellPrice}</p>
                            </div>
                        }
                        {
                            (product.auction || product.trade) &&
                        <div class="col-6">
                            {product.auction && <p class="price-label desktop-off">Reserve Price</p> ||
                            product.trade && <p class="price-label desktop-off">Trade Value</p>}
                            {/* <p class="price-amt desktop-off">${product.auctionReservePrice || product.tradeReservePrice}</p> */}
                            { product.auction && <p class="price-amt desktop-off">{product?.auctionReservePrice ? `${product.auctionReservePrice}` : "No Reserve Price"}</p> }
                            { product.trade && <p class="price-amt desktop-off">${product.tradeReservePrice}</p>}
                        </div>
                        }
                        </div>
                        <div className="c777 text-left f10">Qty. : {product.quantity || 1}</div>
                        {(product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.INDIVIDUAL) &&
                            <p className="c777 text-left f13">
                                {<IcnLocation />}
                                {product?.listingLocation ? <> {product?.listingLocation?.localName} , {product?.listingLocation?.countrySubdivisionName} </> : " --"}
                            </p>
                        }
                        {(product.listingType === GLOBAL_CONSTANTS.APP_USER_TYPE.DEALER || product.adminToFFlStore) && product?.fflStoreLocation &&
                            <p className="c777 text-left f13">
                                {<IcnLocation />}
                                {product?.fflStoreLocation ? <> {product?.fflStoreLocation.premiseCity} , {product?.fflStoreLocation.premiseState}</> : " --"}
                            </p>
                        }
                        {/* <p className="c777 text-left f12">{<IcnLocation />} {product?.listingLocation ? <>{product?.listingLocation?.localName} , {product?.listingLocation?.countrySubdivisionName} </> : "--"} </p> */}
                    </div>
                </div>
            </div>
            <div class="pro-right-part mobile-off">
                <div className=" pt15">
                    <a href="" class=""><span className="item-cond-badge">{product.tconditionName}</span></a>
                </div>
                    <div class="row d-flex justify-content-end">
                        {
                            (product.auction || product.trade) &&
                            <div class="col-lg-6">
                                {
                                    product.auction && <p class="text-price c777 f10">Reserve Price</p> ||
                                    product.trade && <p class="text-price c777 f10">Trade Price</p>
                                }
                            {/* <p class="pro-price text-price">${product.auctionReservePrice || product.tradeReservePrice}</p> */}
                            {product.auction && <p class="pro-price text-price">{product?.auctionReservePrice ? `${'$'+ product.auctionReservePrice}` : "No Reserve Price"} </p>}
                            {product.trade && <p class="pro-price text-price">${product.tradeReservePrice}</p> }
                        </div>
                        }
                        {
                            product.sell &&
                            <div class="col-lg-4">
                            <p class="text-price c777 f10">Buy Now Price</p>
                            <p class="pro-price text-price">${product.sellPrice}</p>
                        </div>
                        }
                    </div>
            </div>
        </div>
     );
}
 
export default SearchItem;