import React from 'react';
import CartProducts from '../Cart/CartProducts';

const CartModel = ({ setCartModel }) => {
    return (
        <div className="cd-signin-modal js-signin-modal">
            <div className="cd-signin-modal__container">
                <CartProducts />
                <a class="cd-signin-modal__close js-close desktop-off" onClick={() => setCartModel(false)} >Close</a>
            </div>
        </div>
    );
}

export default CartModel;