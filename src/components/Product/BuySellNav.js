import React, {useContext} from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { useAuthState } from  '../../contexts/AuthContext/context';
import { ICN_GET_SERVICE } from '../icons';

function BuySellNav() {
    const userDetails = useAuthState();
    const {setValueBy} = useContext(AppContext);
    const history = useHistory();
    const initBuySell = (path) => {
        if (userDetails && userDetails.user && userDetails.user.sid) {
            history.push({
                pathname: path,
                state: {
                    breadcrumb: [
                        { name: "Home",path: `/` },
                        {  name: (path === "/getservice" && "Get Service") || (path === "/buyfilter" && "Buy") || (path === "/create-listing" && "Create Listing")}
                    ]
                }
            });
        } else {
            setValueBy('SET_LOGIN', true);
        }
    }
    return (
        // map all information of that specific product
        <section id="button-section">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-12 col-sm-12 col-lg-6">
                        <ul class="buy-sell-buttons f12">
                        <li class="h-buy-btn" onClick={() => initBuySell('/buyfilter')}><a><span class="h-icon-buy"></span><span className="">Buy</span></a></li>
                        <li class="h-sell-btn" onClick={() => initBuySell('/create-listing')}><a><span class="h-icon-sell"></span><span className="">Sell</span></a></li>
                        <li class="h-service-btn" onClick={() => initBuySell('/getservice')}><a><span class="h-icon-service"></span><span className="">{ICN_GET_SERVICE}</span><span className="get-service-label">Get Service</span> </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default BuySellNav
