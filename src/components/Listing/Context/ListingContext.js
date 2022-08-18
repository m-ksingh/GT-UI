import React, { createContext, useState } from 'react';
export const ListingContext = createContext()

const ListingContextProvider = ({children}) => {

    const [bundleItems,setBundleItems] = useState([]);

    return ( 
        <ListingContext.Provider 
        value={{
            bundleItems,
            setBundleItems
             }}
             >
            { children }
        </ListingContext.Provider>
     );
}
 
export default ListingContextProvider;