import React, { useState, useEffect, useContext } from 'react'
import _ from 'lodash';
import $ from 'jquery';
import { AppContext } from '../../contexts/AppContext';
import { useHistory } from 'react-router-dom';
import { MAP_API_KEY } from "../../commons/utils";
import { services } from '@tomtom-international/web-sdk-services';
import GMap from '../GMap/GMap';

const ListingLocation = ({
    setTab,
    listInfoByView,
    setListInfoByView,
    onCancelStep = () => {}
}) => {
    const history = useHistory();
    const { location } = useContext(AppContext);
    const [showModal, setShowModal] = useState(false);
    const [myLocation, setMyLocation] = useState({
        address: (!_.isEmpty(listInfoByView?.address) && listInfoByView?.address)
            || (!_.isEmpty(location?.address) && { ...location.address }),
        location: (!_.isEmpty(listInfoByView?.location) && listInfoByView?.location)
            || (!_.isEmpty(location?.position) && { ...location.position, lng: location?.position?.lng || location?.position?.lon })
    });
    const [address, setAddress] = useState(null);

    const setLocationInfo = () => {
        setListInfoByView({ ...listInfoByView, ...myLocation });
        $('#info').addClass('active pointer');
        setTab('info')
    }

    // this method trigger to get location
    const getMyLocation = (latlng) => {
        try {
            function callbackFn(resp) {
                setAddress(resp.addresses[0]);
             }
             services.reverseGeocode({
                 key: MAP_API_KEY,
                 position: latlng
             }).then(callbackFn);
        } catch (err) {
            console.error("Error occured while getMyLocation--", err);
        }
    }

    // listening for address changes
    useEffect(() => {
        if(!_.isEmpty(address)) {
            setMyLocation({"location": address.position, "address": address.address});
        }
    }, [address])

    // update location if location is updated in top
    useEffect(() => {
        if(listInfoByView && listInfoByView.location && listInfoByView.location.lat && listInfoByView?.info?.sid) {
            getMyLocation(listInfoByView.location);
        } else if(listInfoByView && listInfoByView.location && listInfoByView.location.lat) {
            setMyLocation({
                address:  listInfoByView.address,
                location: listInfoByView.location
            })
        } else if(location && location?.position) {
            setMyLocation(
                {
                    ...myLocation,
                    address: location.address,
                    location: { 
                        ...location.position, 
                        lng: location?.position?.lng || location?.position?.lon 
                    }
                }
            )
        }
    }, [location?.position?.lat, listInfoByView])

    useEffect(() => window.scrollTo(0, 0), [])

    return (<fieldset>
        <div className="form-card">
            <div className="location-box">
                <p className="js-signin-modal-trigger pl-5 pb-4"><span>{myLocation.address && myLocation.address.freeformAddress}</span></p>
            </div>
            <div className="border-btm">
                <GMap
                    {...{
                        setMyLocation,
                        currLatLng: myLocation.location,
                        formCreateListing: true
                    }} />
            </div>
        </div>
        
        <div class="aic py15 jcc mobile-off">
            {/* <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => {history.replace(_.isArray(history.location.state.breadcrumb) && history.location.state.breadcrumb.length === 3 ? '/profile/mylisting' : (listInfoByView.isFromTrade ? `/order/trade/${history.location?.state?.product?.sid}` : "/"))}}></input> */}
            <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => onCancelStep()}></input>
            <input type="button" name="next" className="next action-button nextBtn nextBtnfst" value="Next" onClick={setLocationInfo} />
        </div>
        <section class="mobile-btn-section desktop-off">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="proPg-btnArea">
                                <ul>
                                    <li onClick={() => onCancelStep()}><a class="submt-btn submt-btn-lignt mr10">Cancel</a></li>
                                    <li onClick={setLocationInfo}><a class="submt-btn submt-btn-dark">Next</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
        </section>
        
    </fieldset>)
}

export default ListingLocation