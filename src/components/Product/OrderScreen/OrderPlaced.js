import React, { useEffect } from 'react'
import _ from 'lodash';
import $ from "jquery";
import { useHistory } from 'react-router-dom'
import { goToTopOfWindow } from '../../../commons/utils';
//assets
import bgCheckmarkIcon from '../../../assets/images/icon/bg_checkmark.png'

const OrderPlaced = ({tabWiseData}) => {
    const history = useHistory()
    const placedOrderSuccess = () => {
        tabWiseData = {
            details: {}
        }
        goToTopOfWindow();
        history.replace('/')
    }
    const postInfo = _.cloneDeep(tabWiseData.postData.data);
    if (postInfo.deliveryLocationType === "SHERIFF_OFFICE") {
        postInfo.sheriffOfficeLocation = JSON.parse(postInfo.sheriffOfficeLocation);
    } else if (postInfo.deliveryLocationType === "FFL") {
        postInfo.fflStoreLocation = JSON.parse(postInfo.fflStoreLocation);
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
                <img src={bgCheckmarkIcon} alt="ordered" />
            </div>
            <h2 class="congrats">Congratulations</h2>
            <div class="col-lg-7">
                <div class="row bg-white bg-none justify-content-between">
                    <div class="col-lg-12">
                        <div class="pro-dtle-box">
                            <p class="pro-description">
                                You have successfully placed your order.<br /><br />
                                You can pick up your product from your chosen location.<br />
                               <u> {!_.isEmpty(postInfo) && postInfo.deliveryLocationType === "SHERIFF_OFFICE" && <span>&nbsp;Sheriff Office : {postInfo.sheriffOfficeLocation.freeformAddress}.&nbsp;</span>}
                               {!_.isEmpty(postInfo) &&  postInfo.deliveryLocationType === "OTHER_LOCATION" || postInfo.anyOtherLocations === "OTHER_LOCATION" && <span>&nbsp;Other : {postInfo?.anyOtherLocations?.formatted_address || postInfo?.anyOtherLocations?.name || ""}.&nbsp;</span>}
                                {!_.isEmpty(postInfo) && postInfo.deliveryLocationType === "FFL" && <span>&nbsp;FFL Store : {postInfo.fflStoreLocation.storeName || postInfo.fflStoreLocation.licHolderName || postInfo.fflStoreLocation.fflStoreName || postInfo.fflStoreLocation.name}, {postInfo.fflStoreLocation.premCity || postInfo.fflStoreLocation.fflPremiseCity || postInfo.fflStoreLocation.premiseCity}, {postInfo.fflStoreLocation.premState || postInfo.fflStoreLocation.fflPremiseState || postInfo.fflStoreLocation.premiseState}, {postInfo.fflStoreLocation.premZipCode || postInfo.fflStoreLocation.fflPremiseZipCode || postInfo.fflStoreLocation.premiseZipCode }.&nbsp;</span>} </u>
                                
                                <br /> <br />You will be notified once the seller provides the pickup date.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-lg-7">
                <input type="button" name="make_payment" class="next dark-button" value="Go to Home" onClick={placedOrderSuccess} />
            </div>
            
        </div>
    )
}

export default OrderPlaced;