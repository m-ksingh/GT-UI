
import { useContext } from 'react';
import ApiService from "../services/api.service";
import { AppContext } from './AppContext';

const Storage = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems.length > 0 ? cartItems: []));
}


export const sumItems = cartItems => {
    Storage(cartItems);
    let itemCount = cartItems.reduce((total, product) => total + product.quantity, 0);
    let total = cartItems.reduce((total, product) => total + product.price * product.quantity, 0).toFixed(2);
    return { itemCount, total }
}

const updateCartSummary = (setValueBy, data) => {
    setValueBy('CART_SUMMARY', data);
}

const initPostCarts = (cartsList, action, state, setValueBy) => {
    const mappingType = {
        ADD_ITEM: 'ADDED',
        REMOVE_ITEM: 'REMOVED',
        INCREASE: 'UPDATED',
        DECREASE: 'UPDATED'
    }
    const payload = {
        "belongsTo": {
            "sid": action.userDetails.user.sid
        },
        "cartHasListingDetailsTOList": cartsList.map(item => {
            return {
                "cartItemAction": mappingType[action.type],
                "quantity": item.quantity,
                "listingDetails": {
                    "sid": item.sid
                }
            };
        }),
        updatedOn: new Date().toISOString()
    };

    if (state.cartSid) {
        payload.sid = state.cartSid;
    }

    ApiService.postCarts(payload).then(
        response => {
            updateCartSummary(setValueBy, response.data);
        },
        err => {
            //
        }
    );
};

export const CartReducer = (state, action) => {
    const {setValueBy} = useContext(AppContext);
    switch (action.type) {
        case "INIT_CART":
            return {
                ...state,
                ...sumItems(action.initData),
                cartItems: [...action.initData]
            }
        case "ADD_ITEM":
            if (!state.cartItems.find(item => item.sid === action.payload.sid)) {
                state.cartItems = [{
                    ...action.payload,
                    quantity: 1,
                    cartItemAction: 'ADDED'
                }];
            } 
            initPostCarts(state.cartItems, action, state, setValueBy);
            return {
                ...state,
                ...sumItems(state.cartItems),
                cartItems: [...state.cartItems]
            }
        case "REMOVE_ITEM":
            initPostCarts([action.payload], action, state, setValueBy);
            return {
                ...state,
                ...sumItems(state.cartItems.filter(item => item.sid !== action.payload.sid)),
                cartItems: [...state.cartItems.filter(item => item.sid !== action.payload.sid)]
            }
        case "INCREASE":
            state.cartItems[state.cartItems.findIndex(item => item.sid === action.payload.sid)].quantity++;
            state.cartItems[state.cartItems.findIndex(item => item.sid === action.payload.sid)].cartItemAction = 'UPDATED';
            initPostCarts([state.cartItems[state.cartItems.findIndex(item => item.sid === action.payload.sid)]], action, state, setValueBy);
            return {
                ...state,
                ...sumItems(state.cartItems),
                cartItems: [...state.cartItems]
            }
        case "DECREASE":
            state.cartItems[state.cartItems.findIndex(item => item.sid === action.payload.sid)].quantity--;
            state.cartItems[state.cartItems.findIndex(item => item.sid === action.payload.sid)].cartItemAction = 'UPDATED';
            initPostCarts([state.cartItems[state.cartItems.findIndex(item => item.sid === action.payload.sid)]], action, state, setValueBy);
            return {
                ...state,
                ...sumItems(state.cartItems),
                cartItems: [...state.cartItems]
            }
        case "ADD_CART_SID":
            return {
                ...state,
                cartSid: action.sid
            }
        case "REMOVE_CART_SID":
            return {
                ...state,
                cartSid: ''
            }
        case "CHECKOUT":
            return {
                cartItems: [],
                checkout: true,
                ...sumItems([]),
            }
        case "CLEAR":
                return {
                    cartItems: [],
                    ...sumItems([]),
                }
        default:
            return state

    }
}