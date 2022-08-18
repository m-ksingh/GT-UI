import React, { useState, useEffect } from "react";
import _ from 'lodash';

const ViewSpecificaTradeInfo = ({setViewSpecificTrade, product}) => {
    const [specificInfo, setSpecificInfo] = useState({});
    useEffect(() => {
        if(product && !_.isEmpty(product.trade_with_listing_type)) {
            setSpecificInfo(_.isString(product.trade_with_listing_type) ? JSON.parse(product.trade_with_listing_type) : product.trade_with_listing_type)
        }
    }, [product])

    return (
        <>
            <div className="cd-signin-modal js-signin-modal specific-trade-filter">
                <div className="cd-signin-modal__container creating-listing-modal">
                    <div class="col-12 win-header m-0">
                        <p class="text-left mt-2 mb-0 text-semi-bold">{"Specific Trade"}</p>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="js-signin-modal-block border-radius" data-type="specificFilter">
                                <section id="specific-filter-section">
                                    <div class="container">
                                        <div className="py5">
                                            <div className="f12"><span className="mr5">Note: </span><span> This item can be traded only with the items having the following specifications</span></div>
                                            <div className="px10 py10">
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Category:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedCategoryName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Condition:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedConditionName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Manufacture:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedManufacturerName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Model:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedModelName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Caliber:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedCaliberName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Barrel Length:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedBarrelName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Capacity:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedCapacityName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Frame Finish:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedFrameName}</div>
                                                </div>
                                                <div className="flx form-group">
                                                    <div className="flx1 text-left text-muted">Grip:</div>
                                                    <div className="flx3 text-left">{specificInfo.selectedGripsName}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flx specific-add-filter-footer p-3">
                                            <div className="flx1 mx-2"><input type="submit" value="Continue" class="submt-btn full-w submt-btn-dark display-inline" onClick={() => setViewSpecificTrade(false)}/></div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <a class="cd-signin-modal__close js-close" onClick={() => setViewSpecificTrade(false)} >Close</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ViewSpecificaTradeInfo;