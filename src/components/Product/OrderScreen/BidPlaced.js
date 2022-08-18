import React, { useEffect, memo } from 'react';
import _ from 'lodash';
import $ from "jquery";
import { useHistory } from 'react-router-dom'
import { goToTopOfWindow } from '../../../commons/utils';
import bgCheckmarkIcon from '../../../assets/images/icon/bg_checkmark.png'
import useToast from '../../../commons/ToastHook';

const BidPlaced = ({ product = {}, tabWiseData }) => {
    const Toast = useToast();
    const history = useHistory();
    const goToHome = () => {
        tabWiseData = {
            details: {}
        }
        Toast.success({ message: 'Bid Placed Successfully!', time: 2000 });
        goToTopOfWindow();
        history.replace('/')
    }
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listingDetailsContent)) {
            const imagesByItem = JSON.parse(item.listingDetailsContent)[0];
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
            <p className="fw600 f16">You have submitted your bid</p>

            <div class="col-lg-4">
                <img class="img-fluid" src={getMyImage(product)} />
            </div>
            <div class="col-lg-7">
                <div class="row bg-white bg-none justify-content-between">
                    <div class="col-lg-12">
                        <div class="pro-dtle-box">
                            <h2> {product.title}</h2>
                            <div className="pb20 mb20"><span className="f12 mr10 c777">Bid Value : </span><span className="theme-color f18 fw600">${tabWiseData?.postData?.bidValue || tabWiseData.totalPrice ? Number(tabWiseData.totalPrice).toFixed(2) : "-"}</span></div>
                            <p>Once the seller accepts your bid, you will be notified and The amount <span className="fw600">${tabWiseData.totalPrice ? Number(tabWiseData.totalPrice).toFixed(2) : "-"}</span> (inclusive of tax and platform fees) will be deducted from  your selected Payment card</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mobile-off col-lg-7">
                <input type="button" name="make_payment" class="next nextBtn dark-button" value="Go to Home" onClick={goToHome} />
            </div>
            <section class="mobile-btn-section desktop-off">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="proPg-btnArea">
                                <div className="proPg-btnArea-div-outer">
                                    <div className="proPg-btnArea-div-inner">
                                        <input type="button" value="Go to Home" onClick={goToHome} class="next nextBtn dark-button" />
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

export default memo(BidPlaced);