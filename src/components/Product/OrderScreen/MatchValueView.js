import React, { useState, useEffect, useRef, memo } from 'react'
import { Formik, Field, ErrorMessage } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import { Form } from 'react-bootstrap';
import matchValueIcon from '../../../assets/images/icon/matchValue.png'

const MatchValueView = ({ product, tradePriceWith, tradeOfferAmount, valueToMatch = { isPayBalance: true, amount: 0, offerStatus: true }, setValueToMatch = () => { }, tab, tabWiseData }) => {
    const [initialValues, setInitialValues] = useState({
        isPayBalance: true,
        tradeDiff: 0,
        offerStatus: true,
    });
    let componentRef = useRef({ isMount: false });

    const schema = Yup.object().shape({
        isPayBalance: Yup.bool(),
        tradeDiff: Yup.string()
            .matches(
                /^[0-9]+$/,
                "Please enter a valid price"
            ),
    });

    const getBoxColor = () => {
        let color = '';
        let totalTradeVal = _.toNumber(tradePriceWith);
        if (valueToMatch.isPayBalance) {
            totalTradeVal += _.toNumber(valueToMatch.amount);
            if (totalTradeVal >= _.toNumber(product.tradeReservePrice)) {
                color = 'green';
            } else if (totalTradeVal < _.toNumber(product.tradeReservePrice)) {
                color = 'red';
            }
        } else {
            if (totalTradeVal >= _.toNumber(product.tradeReservePrice)) {
                color = 'green';
            } else if (totalTradeVal && totalTradeVal < _.toNumber(product.tradeReservePrice)) {
                color = 'red';
            }
        }
        return color;
    }

    const getTotalTradeValue = () => {
        let totalTradeVal = _.toNumber(tradePriceWith);
        if (valueToMatch.isPayBalance) {
            totalTradeVal += _.toNumber(valueToMatch.amount);
        }
        return totalTradeVal;
    }

    const isOfferValueMsg = () => {
        let msg = 'equal';
        let totalTradeVal = _.toNumber(tradePriceWith);
        if (valueToMatch.isPayBalance) {
            totalTradeVal += _.toNumber(valueToMatch.amount);
            if (totalTradeVal > _.toNumber(product.tradeReservePrice)) {
                msg = 'greater';
            } else if (totalTradeVal < _.toNumber(product.tradeReservePrice)) {
                msg = 'less';
            }
        } else {
            if (totalTradeVal > _.toNumber(product.tradeReservePrice)) {
                msg = 'greater';
            } else if (totalTradeVal < _.toNumber(product.tradeReservePrice)) {
                msg = 'less';
            }
        }
        return msg;
    }

    const validateBidValue = (value) => {
        let error = "";
        if (!value) {
            error = "Trade offer required";
        } else {
            if (Number(value) < 0) {
                error = "Please enter positive value";
            }
        }
        return error;
    }

    useEffect(() => {
        if (!componentRef.current.isMount) {
            componentRef.current.isMount = true;
            return;
        }

        if (product) {
            let diff = _.toNumber(tradePriceWith || tabWiseData.totalTradePriceWith) > 0 ? _.toNumber(product.tradeReservePrice) - _.toNumber(tradePriceWith || tabWiseData.totalTradePriceWith) : 0;
            diff = diff >= 0 ? diff : 0
            setInitialValues({
                tradeDiff: diff
            });
            setValueToMatch({ ...{ ...valueToMatch, amount: diff, offerStatus: diff >= 0 ? true : false } })
        }

    }, [tradePriceWith, tabWiseData.totalTradePriceWith, product])

    return (
        <div class={`card border noRadious border-none proDetails-left`}>
            <div class={`flx offer-card-detail ${getBoxColor()}`}>
                <div class="flx1 text-left plr15">
                    <p class="price-tag">Value to match</p>
                    <h2 className="mb0">${product.tradeReservePrice}</h2>
                </div>
                <div>
                    <img class="img-fluid" src={matchValueIcon} />
                </div>
                <div class="flx1 text-right plr15">
                    <p class="price-tag">Your trade value</p>
                    <h2 class="mb0 text-dark">${getTotalTradeValue()}</h2>
                </div>
            </div>
            <Formik
                enableReinitialize={true}
                validationSchema={schema}
                initialValues={initialValues}>
                {({ handleSubmit, isSubmitting, setFieldValue, handleChange, touched, errors, values, isValid, dirty }) => (
                    <Form noValidate>
                        <div class="row p-3 justify-content-center">
                            <div class="col-lg-12 col-12">
                                {isOfferValueMsg() !== 'equal' && (getTotalTradeValue() !== 0) && <p class={`trade-value-offer-bal ${getBoxColor()}`}>Your trade offer value is {isOfferValueMsg()} than the product’s value</p>}
                                {isOfferValueMsg() === 'equal' && (getTotalTradeValue() !== 0) && <p class={`trade-value-offer-bal ${getBoxColor()}`}>Your trade offer value matches with the product’s value</p>}
                            </div>
                            <div className="col-lg-12 col-12 tradeBalanceBlock">
                                <Form.Group className="inline-input-form">
                                    Pay additional amount of $
                                    <span className="image-upload-btn">
                                        <Field
                                            name="tradeDiff"
                                            validate={validateBidValue}
                                            className="form-control"
                                            onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault() }}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setValueToMatch({
                                                    ...{
                                                        ...valueToMatch,
                                                        amount: _.toNumber(e.target.value),
                                                        offerStatus: ((e.target.value) >= 0) && (e.target.value !== '') ? true : false
                                                    }
                                                });
                                            }}
                                            disabled={
                                                (tab == 'location' || tab == 'post')
                                            }
                                        />
                                        <ErrorMessage component="span" name="tradeDiff" className="text-danger mb-2 small-text float-left " />

                                    </span>
                                    {/* to match the value */}
                                </Form.Group>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>

        </div>
    )
}

export default memo(MatchValueView);