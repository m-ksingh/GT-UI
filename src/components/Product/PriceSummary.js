import { useState,useContext } from 'react'
import { useHistory } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import './product.css'

const PriceSummary = ({price, product, tabWiseData}) => {
    const history = useHistory();
    const [viewAll,setViewAll] = useState(true)
    const {platformVariables} = useContext(AppContext);
    let itemPrice = Number(price) * (history?.location?.state?.itemQuantity ? Number(history.location.state.itemQuantity) : 1)
    
    const totalAmount = () =>  {
        let totalAmounts = ''
        try {
            let tax = platformVariables.tax ?  (itemPrice * platformVariables.tax)/100 : 0;
            let shipCharge = product.shipBeyondPreferredDistance && !product.shippingFeesLocationBased && product.fixedShippingFees ? product.fixedShippingFees : 0;
            totalAmounts = parseInt(itemPrice) + platFormFeeCalculate() + tax + shipCharge;
            tabWiseData.totalTaxes = tax
            tabWiseData.totalPrice = totalAmounts
        }
        catch(err){
            console.error("error occur on")
        }
        return totalAmounts = totalAmounts ? Number(totalAmounts).toFixed(2) : ""
    }

    const platFormFeeCalculate =()=>{
        let platformFee = ''
        try {
            let fee = platformVariables.platFormBuyerFee.percentage ? (itemPrice * platformVariables.platFormBuyerFee.percentage)/100 : 0;
            platformFee = fee > platformVariables.platFormBuyerFee.amount ? fee : platformVariables.platFormBuyerFee.amount
            tabWiseData.platformFee = platformFee
        }catch(err){
            console.error("error occur on platFormFeeCalculate()",err)
        }
        return platformFee
    }

    return(<>
               { platformVariables && <div className="paymentInfo">
                    <div className="jcb aic">
                    <div>
                        <div className="price-tag text-left">Total Price</div>
                        <div className="title1 my-0">${totalAmount()}</div>
                    </div>
                    <div>
                        <div className="link f12 pointer" onClick={()=>setViewAll(!viewAll)}>{viewAll ? 'Hide' : "View"} Price Details</div>
                    </div>
                    </div>
                   {viewAll && <div className="mt-3 text-muted">
                            <div className="jcb mb5"><div>Subtotal</div><div>${itemPrice}</div></div>
                            {
                                product?.shippingFree
                                ? <div className="jcb mb10"><div>Free Shipping</div><div>$0</div></div>
                                : <>
                                    {
                                        product?.shippingFeesLocationBased
                                        ? <>
                                            <div className="jcb">
                                                <div>Shipping Charges - Actuals</div>
                                                <div>${0}</div>
                                            </div>
                                            <div className="f12 jcb mb5">Note : Seller will update the charges later</div>
                                        </>
                                        : <div className="jcb mb5"><div>Shipping Charges - Fixed</div><div>${product.shipBeyondPreferredDistance && !product.shippingFeesLocationBased && product?.fixedShippingFees ? product.fixedShippingFees : "0"}</div></div>
                                    }
                                </>
                            }
                            <div className="jcb mb5"><div>Tax({platformVariables?.tax ?? 0}%)</div><div>${platformVariables  && platformVariables.tax ? (itemPrice * platformVariables.tax)/100 : 0}</div></div>
                            <div className="jcb mb10"><div>Platform Fee</div><div>${platFormFeeCalculate()}</div></div>
                            <div className="pro-price jcb my-1 pr-0"><div>Total</div><div>${totalAmount()}</div></div>
                    </div>
                    }
                </div>}
    </>)
}
export default PriceSummary