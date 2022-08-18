import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage } from "formik"
import { Form, Button } from "react-bootstrap"
import Modal from "../../Shared/Modal"
import ApiService from '../../../services/api.service';
import { ICN_TRADE_MX } from '../../icons';
import { getMyImage } from './Service/NotificationService';
import { CounterSchema } from './ValidationSchema/ValidationSchema';
import _ from 'lodash';
import useToast from '../../../commons/ToastHook';
import { useAuthState } from '../../../contexts/AuthContext';
import './notification.css'

const CounterTrade = ({ 
    show, 
    setShow, 
    nl = {}, 
    callBack = () => {},
    fromMyTransaction = false
}) => {
    const Toast = useToast();
    const [tradeInfo, setTradeInfo] = useState({});
    const userDetails = useAuthState();
    const [counter, setCounter] = useState({
        "counterPrice": nl 
            // && Number((nl?.notificationJson?.sellerPrevoiusCounterAmonunt || nl?.notificationJson?.tradeCounterAmount || nl?.notificationJson?.tradeOfferBalance)) 
            && (
            (Number(nl?.notificationJson?.price || nl?.tradeReservePrice || 0) - (Number(nl?.notificationJson?.tradeOfferBalance || nl?.tradeOfferBalance || 0) + Number(nl?.notificationJson?.tradeWithPrice || nl?.tradeOfferValue || 0) ))
            || 0
        )
            
    })

    // as requested removed validation for counter offer // again added validation
    const validateCounterValue = (value) => {
        let error = "";
        if (value 
            && Number(value) > Number(counter.counterPrice)) {
            error = `Value must be less than or equal to $${counter.counterPrice}`;
        } else if(Number(value) === 0 || Number(value) < 0) {
            error = 'Counter value must be greater than zero'
        }
        return error;
    }

    useEffect(() => {
        try {
            if(!_.isEmpty(nl)) {
                if(nl.notificationJson) {
                    setTradeInfo(nl.notificationJson);
                } else {
                    let tmpTradeInfo = {...nl}
                    tmpTradeInfo.placedBy = tmpTradeInfo.placedBySid;
                    tmpTradeInfo.ohl = tmpTradeInfo.orderHasListingTableSid;
                    tmpTradeInfo.pic = tmpTradeInfo.yourProductListingContent;
                    tmpTradeInfo.tradeWithPic = tmpTradeInfo.tradeOfferListingContent;
                    tmpTradeInfo.title = tmpTradeInfo.yourProductTitle;
                    tmpTradeInfo.manufacturer = tmpTradeInfo.yourProductManufacturerName;
                    tmpTradeInfo.price = tmpTradeInfo.tradeReservePrice;
                    tmpTradeInfo.tradeWithPrice = tmpTradeInfo.tradeOfferValue;
                    tmpTradeInfo.tradeWithTitle = tmpTradeInfo.tradeOfferTitle;
                    tmpTradeInfo.tradeWithManufacturer = tmpTradeInfo.tradeOfferManufacturerName;
                    // tmpTradeInfo.placedBy = tmpTradeInfo.placedBySid;
                    // tmpTradeInfo.ohl = tmpTradeInfo.orderHasListingTableSid;
                    tmpTradeInfo.sid = tmpTradeInfo.orderSid;
                    setTradeInfo(tmpTradeInfo);
                }
            }
        } catch (err) {
            console.error("Error in mapping trade with key ")
        }
    }, [nl])

    /**  counter trade offer
     * @param {Object} values = counter trade value
    */
    const counterOffer = (values) => {
        try {
            let payload = {
                "amount": values.counterPrice, 
                "sid": tradeInfo?.type === "BUYER" ? userDetails.user.sid : (tradeInfo.placedBy || tradeInfo.placedBySid),
                "orderHasListingSid": tradeInfo.ohl,
                "type": tradeInfo.type
            };
            ApiService.counterTrade(payload).then(
                response => {
                    setShow(false);
                    Toast.success({ message: 'Counter offer notified to the buyer', time: 3000});
                    callBack(nl && nl.notificationJson ? (fromMyTransaction ? nl.notificationSid : nl.sid) : tradeInfo.sid);
                    // updateNotification(nl && nl.notificationJson ? nl.sid : tradeInfo.sid);
                },
                err => {
                    setShow(false);
                    if(err.response && err.response.status === 403) {
                        Toast.success({ message: 'Amount can not be more than the balance.', time: 2000});
                    }
                    if(err.response && err.response.status === 406) {
                        callBack(nl && nl.notificationJson ? (fromMyTransaction ? nl.notificationSid : nl.sid) : tradeInfo.sid);
                        Toast.error({ message: err.response?.data.error || "Test-RKS-IS-144-1 is sold or not active.", time: 2000});
                    }
                }
            );
        } catch (err) {
            setShow(false);
            console.error('error occur on counterOffer()', err);
        }
    }
    return (<div>
        {
            !_.isEmpty(nl)
            && <Modal {...{ show, setShow, className: "pickup-container" }}>
            <div className="pickup-box counter-trade">
                <div className="">Counter Offer</div>
                <div className="border-top my10"></div>
                <Formik
                    initialValues={counter}
                    onSubmit={counterOffer}
                    validationSchema={CounterSchema}
                >
                    {({ handleSubmit, isSubmitting, validate, handleChange, touched, errors, values, setFieldValue, isValid, dirty }) => (<form onSubmit={handleSubmit}>
                        <div className="jcb">
                            <div className="text-center">
                                <img src={getMyImage(tradeInfo.pic)} className="mr-3 wh50" alt="..." />
                            </div>
                            <div className="nl-counter-circle">
                                <ICN_TRADE_MX />
                            </div>
                            <div className="text-center">
                                <img src={getMyImage(tradeInfo.tradeWithPic)} className="mr-3 wh50" alt="..." />
                            </div>
                        </div>
                        <div className="border-top my10"></div>

                        <div className="jcb">
                            <div className="fdc w100">
                                <div className="jcb">
                                    <div className="">
                                        <div className="f14">{tradeInfo.title}</div>
                                    </div>
                                    <p className="text-muted f10">Price</p>
                                </div>
                                <div className="WishlistItem-price jcb">
                                    <div>
                                        <div className="text-muted f10 m0">{tradeInfo.manufacturer}</div>
                                    </div>
                                    <div>
                                        <p className="nl-price">${tradeInfo.price}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hrDivider"></div>
                            <div className="fdc w100">
                                <div className="jcb">
                                    <div className="">
                                        <h5 className="f14">{tradeInfo.tradeWithTitle}</h5>
                                    </div>
                                    <p className="text-muted f10">Price</p>
                                </div>
                                <div className="WishlistItem-price jcb">
                                    <div>
                                        <div className="text-muted f10 m0">{tradeInfo.tradeWithManufacturer}</div>
                                    </div>
                                    <div>
                                        <p className="nl-price">${tradeInfo.tradeWithPrice}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-top my10"></div>
                        {/* {
                            tradeInfo
                            && tradeInfo.price
                            && tradeInfo.tradeWithPrice
                            && <div className="text-muted f12">
                                {"Counter price should be less than "}
                                <span className="semi-text-bold">
                                    ${tradeInfo.price - tradeInfo.tradeWithPrice}
                                </span>
                            </div>
                        } */}
                        <div className="jcb my20">
                            <div>
                                <div>Item value offered : <span class="fw600">${tradeInfo?.tradeWithPrice || "-"}</span></div>
                                <div>Additional cash offered :  <span class="fw600">${tradeInfo?.tradeOfferBalance || "-"}</span></div>
                            </div>
                            <div>
                                <div className="counter-value-label">
                                    <div>
                                        <span>Counter Value</span>
                                        <span className="mandatory">*</span>
                                    </div>
                                    <div class="f12 c999">Counter value can not exceed item's total value</div>
                                </div>
                                <Form.Group>
                                    <div className="aic">
                                        <div className="bid-inp-dl f24">$</div>
                                        <Field 
                                            name="counterPrice" 
                                            validate={validateCounterValue}
                                            id="counterPrice" 
                                            className="form-control bid-inp counter-price" 
                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                        />
                                    </div>
                                    <ErrorMessage component="span" name="counterPrice" className="text-danger mb-2 f12 pl15" />
                                </Form.Group>
                            </div>
                        </div>
                        
                        <div className="text-right mt-4">
                            <Button type="submit" variant="success" disabled={isSubmitting || !isValid} className="btn-block f14">Submit</Button>
                        </div>
                    </form>)}
                </Formik>
            </div>
        </Modal>
        }
    </div>)
}
export default CounterTrade