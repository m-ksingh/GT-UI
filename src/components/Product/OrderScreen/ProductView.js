import React from 'react'
import _ from 'lodash';
import TradeTag from './TradeTag';
import { useHistory } from 'react-router-dom'
import GLOBAL_CONSTANTS from '../../../Constants/GlobalConstants';

const ProductView = ({ product, isTrade, tabWiseData, type }) => {
    const history = useHistory();
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listingDetailsContent)) {
            const imagesByItem = JSON.parse(item.listingDetailsContent)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }
    return (
        <div class="card border noRadious">
            <div class="">
                {isTrade && <TradeTag />}
                <div className="distance-badge f10 text-center aic">{`${Number(product.distance).toFixed(2)} mi`}</div>
                <img src={getMyImage(product)} class="img-fluid w100" alt={product.title} />
            </div>
            <div class="card product-view-top-border noRadious p-3 proDetails-left">
                <div class="row justify-content-between">
                    <div class="col-lg-7 col-6">
                        <h2>{product.title}</h2>
                        <p class="price-tag">{(product.sell && type === GLOBAL_CONSTANTS.ORDER_TYPE.BUY && "Buy Now Price") || (type === GLOBAL_CONSTANTS.ORDER_TYPE.BID && product.auction && "Reserve Price") || (type === GLOBAL_CONSTANTS.ORDER_TYPE.TRADE && product.trade && "Trade Value") || "Price"}</p>
                        <p class="pro-price">{
                            (product.sell && type === GLOBAL_CONSTANTS.ORDER_TYPE.BUY && `$${product.sellPrice}`) 
                            || (type === GLOBAL_CONSTANTS.ORDER_TYPE.TRADE && product.trade && `$${product.tradeReservePrice}`) 
                            || (type === GLOBAL_CONSTANTS.ORDER_TYPE.BID && product.auction && Number(product?.auctionReservePrice) ? `$${product.auctionReservePrice}` : "No Reserve Price") 
                            || 0}</p>
                        {/* <span className="px10 c777 f12">x</span><span className="f12 c777">{history?.location?.state?.itemQuantity ? Number(history.location.state.itemQuantity) : 1}</span> */}
                        <p class="price-tag c777">Qty.<span className="px5">:</span><span>{history?.location?.state?.itemQuantity ? Number(history.location.state.itemQuantity) : ((type === GLOBAL_CONSTANTS.ORDER_TYPE.BID || type === GLOBAL_CONSTANTS.ORDER_TYPE.TRADE) ? 1 : 0)}</span></p>
                    </div>
                    <div class="col-lg-5 col-6 proDetails-right">
                        <p class="mod-used-cls">{product && product.tcondition && product.tcondition.name}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductView;