import React, { useEffect, useState, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import { ICN_STAR_Y } from '../icons';
import ApiService from '../../services/api.service';
import { useAuthState } from  '../../contexts/AuthContext/context';
import _ from 'lodash';
import useToast from '../../commons/ToastHook';

const MyBids = () => {
    const [myBidsList, setMyBidsList] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    useEffect(() => {
        spinner.show("Please wait...");
        ApiService.myBids(userDetails.user.sid).then(
            response => {
                setMyBidsList(response.data);
            },
            err => {
                console.error(err); // Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });               
      }, []);
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listing_details_content)) {
            const imagesByItem = JSON.parse(item.listing_details_content)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }
    return <div className="myAc-TabContent">
        <div className="tab-pane">
            <div className="carousel-head myac-head mobile-off">
                <h2>My Bids</h2>
            </div>
            <div className="card-mob-head desktop-off">
                <span>My Bids</span>
            </div>
            <div className="row">
                <div className="col">
                    {
                        myBidsList.map((order, index) => {
                            return <div className="myWishlistbox" key={index}>
                                <span className="WishlistDate">Saved: Dec 24, 2020</span>
                                <span className="float-right"></span>
                                <div className="row">
                                    <div className="col-lg-8 col-8">
                                        <div className="WishlistItem">
                                            <div className="media">
                                                <img src="images/gun-pic.png" className="mr-3" alt="..." />
                                                <div className="media-body">
                                                    <h5 className="mt-0">Skorpion</h5>
                                                    <p>Sold by: AB Dealers</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="col-lg-4 col-4">
                                        <div className="WishlistItem-rating">
                                            <p>Item ratings</p>
                                            <div className="rating">
                                                <span>{ICN_STAR_Y}</span>
                                                <span>{ICN_STAR_Y}</span>
                                                <span>{ICN_STAR_Y}</span>
                                                <span>{ICN_STAR_Y}</span>
                                                <span>{ICN_STAR_Y}</span>
                                            </div>


                                        </div>
                                    </div>

                                    <div className="col-lg-2 col-3">
                                        <div className="WishlistItem-price">
                                            <p className="wprice-label">Price</p>
                                            <p className="wishlist-price">$120</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        })
                    }
                    {
                        isDataLoaded && !myBidsList.length && <div class="gunt-error">No Data Found</div>
                    }
                </div>
            </div>
        </div>
    </div>;
}

export default MyBids;