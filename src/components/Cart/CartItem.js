import React, { useContext } from 'react';
import { PlusCircleIcon, MinusCircleIcon, TrashIcon } from '../icons'
import { CartContext } from '../../contexts/CartContext';
import _ from 'lodash';

import { formatNumber } from '../../commons/utils';

const CartItem = ({item}) => {

    const { increase, decrease, removeProduct } = useContext(CartContext);
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listing_details_content)) {
            const imagesByItem = JSON.parse(item.listing_details_content)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    return ( 
        <li class="clearfix">
            <div class="mediabox">
                <div class="cart-img">
                    <img src={getMyImage(item)} class="img-fluid mr-3" alt="item1" />
                </div>
                <div class="cart-dtl ml-4 mt-2">
                    <div>
                        <h5 class="mt-0">{item.title}</h5>
                    </div>
                    <div class="rating">
                        
                    </div>
                    <div class="item-price">
                        <span class="cart-price">${item.sellPrice}</span>
                        <span class="m-2">
                            <label>Qty {item.quantity}</label>
                        </span>
                    </div>
                </div>
                <div class="cart-remove">
                    <button 
                    onClick={() => increase(item)}
                    className="btn btn-primary btn-sm mr-2 mb-1">
                        <PlusCircleIcon width={"20px"}/>
                    </button>
                    {
                        item.quantity > 1 &&
                        <button
                        onClick={() => decrease(item)}
                        className="btn btn-danger btn-sm mb-1">
                            <MinusCircleIcon width={"20px"}/>
                        </button>
                    }

                    {
                        item.quantity === 1 &&
                        <button
                        onClick={() => removeProduct(item)}
                        className="btn btn-danger btn-sm mb-1">
                            <TrashIcon width={"20px"}/>
                        </button>
                    }
                </div>
            </div>
        </li>
     );
}
 
export default CartItem;