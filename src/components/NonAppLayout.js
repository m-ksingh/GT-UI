import React from 'react';
import NonAppHeader from './Shared/NonAppHeader';
import Footer from './Shared/footer';

import { Helmet } from 'react-helmet-async';

const NonAppLayout = ({title, description, children}) => {
    return ( 
        <>
            <Helmet>
                <title>{ title ? title + " - Gun Traderz" : "Gun Traderz" }</title>
                <meta name="description" content={ description || "Gun Traderz" } />
            </Helmet>
            <NonAppHeader />
            <main className="main_app">
                {children}
            </main>
        </>
     );
}
 
export default NonAppLayout;