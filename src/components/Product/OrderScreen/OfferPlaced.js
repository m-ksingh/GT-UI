import React, { useEffect } from 'react'
import _ from 'lodash';
import $ from "jquery";
import { useHistory } from 'react-router-dom'
import { goToTopOfWindow } from '../../../commons/utils';
//assets
import bgCheckmarkIcon from '../../../assets/images/icon/bg_checkmark.png'
import useToast from '../../../commons/ToastHook';

const OfferPlaced = ({ valueToMatch, tabWiseData }) => {
    const Toast = useToast();
    const history = useHistory()
    const goToHome = () => {
        tabWiseData = {
            details: {},
            tradeListItems: [],
            bidInfo: {},
            isViewedSpecificTradeModal: false 
        }
        goToTopOfWindow();
        Toast.success({ message: 'Offer Placed Successfully!', time: 2000 });
        history.replace('/')
    }
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listingDetailsContent || item.listing_details_content)) {
            const imagesByItem = JSON.parse(item.listingDetailsContent || item.listing_details_content)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }
    useEffect(() => {
        $("#info").removeClass("active");
        $("#payment").removeClass("active");
        $("#location").removeClass("active");
        $("#info").removeClass("active");
    }, [])
    return (

        <div class="d-flex flex-column align-items-center justify-content-center">
            <div class="col-lg-4 p-4 col-4">
                <img src={bgCheckmarkIcon} />
            </div>
            <p>You have submitted your offer</p>

            <div class="col-lg-4">
                <img class="img-fluid" src={getMyImage(tabWiseData.details)} />
            </div>
            <div class="col-lg-7">
                <div class="row bg-white bg-none justify-content-between">
                    <div class="col-lg-12">
                        <div class="pro-dtle-box">
                            <h2> {tabWiseData.details.title}{Array.isArray(tabWiseData.tradeListItems) && tabWiseData.tradeListItems.length > 1 && ` & ${tabWiseData.tradeListItems.length - 1}item(s)`}</h2>
                            <div className="mto-offered-value f12 jcc aic"><span className="pb5 mr5">Offered Items Value : </span><h2>${(tabWiseData.totalTradePriceWith && tabWiseData.totalTradePriceWith) || 0}</h2></div>
                            {(valueToMatch.isPayBalance && valueToMatch.amount > 0) && <div className="mto-offered-value f12 jcc aic"><span className="pb5 mr5">Offered Amount : </span><h2>${(valueToMatch.isPayBalance && valueToMatch.amount) || 0}</h2></div>}
                            {(valueToMatch.isPayBalance && valueToMatch.amount > 0) && <p className="pro-description">Once the seller accepts your offer, you will be notified and The amount ${(valueToMatch.isPayBalance && tabWiseData.totalPrice) || 0} (inclusive of tax and platform fees) will be deducted from your selected Payment card</p>}
                            {(valueToMatch.amount <= 0) && <p className="pro-description">Once the seller accepts your offer, you will be notified and the amount ${(tabWiseData.totalPrice) || 0} (inclusive of tax and platform fees) will be deducted from your selected Payment card.</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mobile-off col-lg-7">
                <input type="button" name="make_payment" className="next mto-go-to-home dark-button px20" value="Go to Home" onClick={goToHome} />
            </div>
            
            <section class="mobile-btn-section desktop-off">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="proPg-btnArea">
                                <div className="proPg-btnArea-div-outer">
                                    <div className="proPg-btnArea-div-inner">
                                        <input type="button" name="make_payment" value="Go to Home" onClick={goToHome} class="submt-btn submt-btn-black text-center full-w mto-go-to-home dark-button" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default OfferPlaced;