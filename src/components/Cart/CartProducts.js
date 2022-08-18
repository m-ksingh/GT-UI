import React, { useContext } from 'react';
import { CartContext } from '../../contexts/CartContext';
import { AppContext } from '../../contexts/AppContext';
import { Link, useHistory } from 'react-router-dom';
import CartItem from './CartItem';

const CartSummary = () => {
    const {carts} = useContext(AppContext);
    return <>
        <div class="shopping-cart-header">
            <span class="cardhd-cap">Total</span>
        </div>
        <div class="t-price-table">
            <table class="table table-borderless">
                <tbody>
                    <tr>
                        <td>Subtotal</td>
                        <td class="text-right">${carts.subTotal}</td>
                    </tr>
                    <tr>
                        <td>Shipping</td>
                        <td class="text-right">${carts.shipping}</td>
                    </tr>
                    <tr>
                        <td>Taxes</td>
                        <td class="text-right">${carts.taxes}</td>
                    </tr>
                    <tr>
                        <td><b>Total</b></td>
                        <td class="text-right"><b>${carts.total}</b></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </>
}

const CartProducts = () => {

    const { cartItems } = useContext(CartContext);

    return ( 
        <>
            {/* <div class="shopping-cart-header">
                <span class="cardhd-cap">Your Cart</span>
                <span class="wishlist-box"><Link to="/profile/mywishlist">My Wishlist</Link></span>
            </div>
            <ul class="shopping-cart-items">
                {
                    cartItems.map(product =>  <CartItem key={product.sid} item={product}/>)
                }
                {
                    !cartItems.length && <div class="gunt-error">Your cart is empty!</div>
                }
            </ul> */}
            {/* {
                cartItems.length ? <CartSummary /> : ''
            } */}
            
        </>
     );
}
 
export default CartProducts;