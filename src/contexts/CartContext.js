import React, { createContext, useReducer } from 'react';
import { CartReducer, sumItems } from './CartReducer';
import {useAuthState} from './AuthContext/context';

export const CartContext = createContext()

const storage = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
const initialState = { cartItems: storage, ...sumItems(storage), checkout: false, cartSid: '', cartSummary: {} };

const CartContextProvider = ({children}) => {

    const userDetails = useAuthState();

    const [state, dispatch] = useReducer(CartReducer, initialState)

    const initCart = () => {
        const initData = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
        dispatch({type: 'INIT_CART', initData, userDetails})
    }

    const increase = payload => {
        dispatch({type: 'INCREASE', payload, userDetails})
    }

    const decrease = payload => {
        dispatch({type: 'DECREASE', payload, userDetails})
    }

    const addProduct = payload => {
        dispatch({type: 'ADD_ITEM', payload, userDetails})
    }

    const removeProduct = payload => {
        dispatch({type: 'REMOVE_ITEM', payload, userDetails})
    }

    const clearCart = () => {
        dispatch({type: 'CLEAR'})
    }

    const handleCheckout = () => {
        dispatch({type: 'CHECKOUT'})
    }

    const addCartSid = (sid) => {
        dispatch({type: 'ADD_CART_SID', sid, userDetails})
    }

    const removeCartSid = (sid) => {
        dispatch({type: 'REMOVE_CART_SID', sid, userDetails})
    }

    const contextValues = {
        initCart,
        removeProduct,
        addProduct,
        increase,
        decrease,
        clearCart,
        handleCheckout,
        addCartSid,
        removeCartSid,
        ...state
    } 

    return ( 
        <CartContext.Provider value={contextValues} >
            { children }
        </CartContext.Provider>
     );
}
 
export default CartContextProvider;
