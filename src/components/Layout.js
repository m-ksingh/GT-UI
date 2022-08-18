import React from 'react';
import Header from './Shared/header';
import Footer from './Shared/footer';

import { Helmet } from 'react-helmet-async';

const Layout = ({title, description, children}) => {
    return ( 
        <>
            <Helmet>
                <title>{ title ? title + " - Gun Traderz" : "Gun Traderz" }</title>
                <meta name = "description" content={ description || "Gun Traderz" } />
            </Helmet>
            <Header/>
            <main className="main_app">
                {children}
            </main>
            <Footer/>
        </>
     );
}
 
export default Layout;