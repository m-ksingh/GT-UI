import _ from "lodash";
import React, {createContext, useReducer,useState} from "react";

export const AppContext = createContext();
const LocationInitialValue = {
    address: {},
    position: {}
}
const initialState = {
    searchKeyword: '',
    filterCategory: {},
    carts: {},
    location: (() => {
        let temp = { ...LocationInitialValue }
        try {
            temp = JSON.parse(localStorage.getItem("location"));
            if (_.isEmpty(temp)) 
                temp = { ...LocationInitialValue }
        } catch (e) {
            temp =  { ...LocationInitialValue }
        }
        return temp;
    })(),
    isLogin: false,
    fflStore: ''
}

export const CartReducer = (state, action) => {
    switch (action.type) {
        case "SET_CATEGORY":
            return {
                ...state,
                filterCategory: {...action.value},
                searchKeyword: ''
            };
        case "SET_KEYWOARD":
            return {
                ...state,
                searchKeyword: action.value,
                filterCategory: {}
            }
        case "CART_SUMMARY":
            return {
                ...state,
                carts: action.value
            }
        case "SET_LOCATION":
            window.localStorage.location = JSON.stringify(action.value);
            return {
                ...state,
                location: action.value
            }
        case "SET_FFLSTORE":
            return {
                ...state,
                fflStore: action.value
            }
        case "SET_LOGIN":
            return {
                ...state,
                isLogin: action.value
            }
        default:
            return state

    }
}

const AppContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(CartReducer, initialState);
    const [wishList, setWishList] = useState([]);
    const [myListings, setMyListings] = useState(null);
    const [manufacturer, setManufacturer] = useState([]);
    const [gunModel, setGunModel] = useState([]);
    const [platformVariables, setPlatformVariables] = useState(null);
    const [hasUpdateScheduleList, setHasUpdateScheduleList] = useState(null);
    const [updateMyTransactionAt, setUpdateMyTransactionAt] = useState(null);
    const [updateNotificationAt, setUpdateNotificationAt] = useState(null);

    const setValueBy = (type, value) => {
        dispatch({type, value});
    }

    const contextValues = {
        ...state,
        myListings,
        setMyListings,
        wishList,
        setWishList,
        setValueBy,
        manufacturer,
        setManufacturer,
        gunModel,
        setGunModel,
        platformVariables, 
        setPlatformVariables,
        hasUpdateScheduleList, 
        setHasUpdateScheduleList,
        updateMyTransactionAt, 
        setUpdateMyTransactionAt,
        updateNotificationAt, 
        setUpdateNotificationAt
    }


    return ( 
        <AppContext.Provider value={contextValues} >
            { children }
        </AppContext.Provider>
     );
}
 
export default AppContextProvider;