import React, { useState, useEffect, useContext, memo } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Spinner from "rct-tpt-spnr";

const BidStatusView = ({ product, bidCountInfo, setIsBidExpired = () => { } }) => {
    const [timer, setTimer] = useState("");
    const spinner = useContext(Spinner);
    
    if (_.isEmpty(bidCountInfo)) {
        bidCountInfo = {
            auctionExpiresOn: null,
            bidCount: null,
            highestBidAmount: null
        };
    }

    // listening for bid expire on timer
    useEffect(() => {
        if (!_.isEmpty(bidCountInfo.auctionExpiresOn)
            || !_.isEmpty(product.auctionExpireOn)) {
                spinner.show("Please wait...");
            let bidExpire = bidCountInfo.auctionExpiresOn || product.auctionExpireOn;
            const interval = setInterval(() => {
                let todayDate = moment(new Date());
                let bidExpireDate = moment(bidExpire);
                let diff = bidExpireDate.diff(todayDate);
                let diffDuration = moment.duration(diff);

                let expireTimes = ((diffDuration?.days() > 0 ? `${diffDuration.days() + "d "}` : 0) +
                    (diffDuration?.hours() > 0 ? `${diffDuration.hours() + "h "}` : 0) +
                    (diffDuration?.minutes() > 0 ? `${diffDuration.minutes() + "m "}` : 0) +
                    (diffDuration?.seconds() > 0 ? `${diffDuration.seconds()}` + "s" : 0)
                );

                setTimer(expireTimes);
                spinner.hide();
            }, 1000);
            return () => {
                clearInterval(interval);
            }
        }
    }, [product.auctionExpireOn, bidCountInfo.auctionExpiresOn]);

    useEffect(() => {
        timer === 0 ? setIsBidExpired(true) : setIsBidExpired(false);
    }, [timer])

    return (
        <div class="bid-stats mb20 pt20">
            <div className="jcb my20">
                {timer === 0 && <h2 class="bid-exp-countdown">Bid expired</h2>}
                {
                    timer !== 0
                    && <div>
                        <span className="mr10 f12 c777">{"Time left : "}</span>
                        <span className="bid-exp-countdown fw600">{timer}</span>
                    </div>
                }
            </div>
            <div className="b-ddd p10 jcb b-rad-4">
                <div class="flx1 bid-status">
                    <h2 class="bid-reserve-price-val">{product?.auctionReservePrice ? `$${product.auctionReservePrice}` : "No Reserve Price"}</h2>
                    <p className="c777">Reserve Price</p>
                </div>
                <div class="flx1 bid-status">
                    <h2 class="text-dark">{bidCountInfo.bidCount || '-'}</h2>
                    <p className="c777">Current Bids</p>
                </div>
                <div class="flx1 bid-status no-border">
                    <h2 className="highest-bid">${bidCountInfo.highestBidAmount || '-'}</h2>
                    <p className="c777">Highest Bid</p>
                </div>
            </div>
        </div>
    )
}

export default memo(BidStatusView);