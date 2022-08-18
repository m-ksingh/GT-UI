import React, { } from 'react';
const NonAppHeader = () => {
    return ( <>
        <header id="main-header" className="section-header sticky">
            <div id="top-head" className="py-3">
                <div className="container">
                    <div className="row justify-content-between">
                        <div className="col-12 pb-4 border-bottom">
                            <div className="logo">
                                <div className="btn btn-link btn-sm mr-2">
                                    <img src="images/logo.png" className="img-fluid" alt="Gun Traderz"/>
                                </div>
                            </div>
                        </div>
                    </div> 
                </div>
            </div>
        </header>
     </>);
}
 
export default NonAppHeader;