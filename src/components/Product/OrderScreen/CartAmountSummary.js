import React, { useContext } from 'react'
import _ from 'lodash';
import $ from 'jquery';
import { CartContext } from '../../../contexts/CartContext';
import CartProducts from '../../Cart/CartProducts';
import { goToTopOfWindow } from '../../../commons/utils';
import { AppContext } from '../../../contexts/AppContext';

const CartAmountSummary = ({ setTab, tabWiseData }) => {
    const { carts } = useContext(AppContext);
    const { cartItems } = useContext(CartContext);
    const onNextStep = (values) => {
        tabWiseData.carts = _.cloneDeep(carts);
        goToTopOfWindow();
        $('#payment').addClass('active');
        setTab('payment');
    }
    return (
        <>
            <CartProducts  />
            <div class="trade-row justify-content-end p-3 desktop-off">
                <input onClick={onNextStep} disabled={!cartItems.length} type="button" name="next" class="next action-button nextBtn w-100" value="Checkout" />
            </div>
        </>
    );
}

export default CartAmountSummary;