import React from 'react'
import { useParams } from 'react-router-dom';
import BidPlaced from './BidPlaced';
import OfferPlaced from './OfferPlaced';
import OrderPlaced from './OrderPlaced';

const PlacedView = ({ product, DefferPrice, valueToMatch, tabWiseData }) => {
    const { type } = useParams();
    return (
        <div className="order-placed-view">
            {type === "buy" && <OrderPlaced {...{tabWiseData}} />}
            {type === "trade" && <OfferPlaced  {...{ valueToMatch, tabWiseData }} />}
            {type === "bid" && <BidPlaced {...{product, tabWiseData}} />}
        </div>
    )
}

export default PlacedView;