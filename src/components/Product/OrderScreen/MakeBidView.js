import React, { useContext, useState, useEffect, memo } from 'react'
import { Formik, Field, ErrorMessage } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import $ from 'jquery';
import Spinner from "rct-tpt-spnr";
import { Form, Col } from 'react-bootstrap';
import ApiService from "../../../services/api.service";
import { useAuthState } from '../../../contexts/AuthContext/context';
import { useHistory } from 'react-router-dom'
import { goToTopOfWindow } from '../../../commons/utils';
import BidStatusView from './BidStatusView';

const MakeBidView = ({ setTab, product, bidCountInfo = {}, tabWiseData }) => {
    const history = useHistory();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [bidInfo, setBidInfo] = useState({});
    const [isBidExpired, setIsBidExpired] = useState(false);
    const [initialValues, setInitialValues] = useState({
        bidValue: tabWiseData?.bidInfo?.bidValue ? tabWiseData.bidInfo.bidValue : ""
    });
    const schema = Yup.object().shape({
        bidValue: Yup.string()
            .matches(
                /^[-+.0-9]+$/,
                "Please enter a valid price"
            ),
    });
    const onNextStep = (values) => {
        tabWiseData.bidInfo = values;
        goToTopOfWindow();
        $('#payment').addClass('active');
        setTab('payment');
    }

    const initIsOfferedForTrade = (list = [], disable = true) => {
        spinner.show("Please wait...");
        let payload = {
            "listingSids": list.map(r => r.sid),
            "toggle": disable
        };
        ApiService.isOfferedForTrade(payload).then(
            response => { },
            err => { }
        ).finally(() => {
            spinner.hide();
        });
    }

    const getBidPrevBidAmount = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getBidAmount(product.sid, userDetails.user.sid).then(
                response => {
                    setBidInfo(response.data);
                },
                err => {
                    console.error('Error occurred in getBidPrevBidAmount--', err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error('Error occurred in getBidPrevBidAmount--', err);
        }
    }

    const cancelAction = () => {
        initIsOfferedForTrade(tabWiseData.tradeListItems, false);
        history.replace('/');
        goToTopOfWindow();
    }

    // validate bid value
    const validateBidValue = (value) => {
        let error = "";
        if (!value) {
            error = "Bid value required";
        } else {
            if (Number(value) < 0) {
                error = "Please enter positive value"
            } else if (value == 0) {
                error = "Bid value should not be 0"
            } else if (value.includes(".")) {
                error = "Please enter whole dollars, cents not allowed"
            } else if (!_.isEmpty(bidCountInfo) && bidCountInfo.bidCount > 0 && bidCountInfo.highestBidAmount && value <= bidCountInfo.highestBidAmount) {
                // error = `Enter $${Number(bidCountInfo.highestBidAmount) + (bidCountInfo.highestBidAmount < 100 ? 5 : 10)} or more`;
                error = `Please enter more than $${bidCountInfo.highestBidAmount}. Cents not allowed`;
            } 
            // else if (bidCountInfo.highestBidAmount < 100 && value % 5 !== 0) {
            //     error = `Bid amount allowed only multiples of 5`;
            // } else if (bidCountInfo.highestBidAmount >= 100 && value % 10 !== 0) {
            //     error = `Bid amount allowed only multiples of 10`;
            // }
        } 
        return error;
    }

    useEffect(() => {
        if(product && product.sid) getBidPrevBidAmount();
    }, [product])

    return (
        <div className="">
            <h2 className="card-title-header">Submit Bid</h2>
            <BidStatusView {...{ product, bidCountInfo, setIsBidExpired }} />
            <div class="mt-4 mb-2 bid-form">
                <Formik
                    validationSchema={schema}
                    initialValues={initialValues}
                    onSubmit={onNextStep}>
                    {({ handleSubmit, isSubmitting, validate, handleChange, touched, errors, values, isValid, dirty }) => (
                        <Form noValidate className="w100">
                            <div class="pb20 mb20">
                                {
                                    bidInfo 
                                    && bidInfo?.highestBidAmount > 0
                                    && (bidCountInfo?.bidCount >= 1 || bidCountInfo.highestBidAmount > 0)
                                    && <div className="t-center">
                                        <div className="aic mb20">Your previous bid<span className="pl20 text-semi-bold prev-highest-bid">${bidInfo.highestBidAmount}</span></div>
                                    </div>
                                }
                                <div className="aic">
                                    <div className="mr20 f14 min-width75 pr20">Bid Amount<sup className="mandatory">*</sup> </div>
                                    <div className="">
                                        <Col className="px-0">
                                            <div className="aic p-rel">
                                                <div className="f24 mr10 bid-inp-dl pt5">$</div>
                                                <Field name="bidValue" validate={validateBidValue} className="form-control bid-inp" disabled={isBidExpired} 
                                                onKeyDown={(e) => { ((e.keyCode !== 8) && (e.keyCode < 48 || e.keyCode >= 58) && (e.keyCode < 96 || e.keyCode > 105)) && e.preventDefault()}}
                                                />
                                            </div>
                                        </Col>
                                    </div>
                                </div>
                                <div className="bid-inp-err">
                                    <ErrorMessage component="span" name="bidValue" className="text-danger mb-2 small-text float-left pl15 pr15" />
                                </div>
                            </div>
                            <div class="text-right mobile-off">
                                <input type="button" name="cancel" class="cancel-btn mt-2" value="Cancel" onClick={cancelAction} />
                                <input onClick={handleSubmit} disabled={!values.bidValue || !dirty || !isValid || isBidExpired} type="button" name="next" class="next action-button nextBtn" value="Next" />
                            </div>
                            <section class="mobile-btn-section desktop-off">
                                <div class="container">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="proPg-btnArea">
                                                <div className="proPg-btnArea-div-outer">
                                                    <div className="proPg-btnArea-div-inner">
                                                        <input type="button" name="cancel" value="Cancel" onClick={cancelAction} class="submt-btn submt-btn-lignt mr10 text-center full-w" />
                                                    </div>
                                                    <div className="proPg-btnArea-div-inner">
                                                        <input type="button" value="Next" disabled={!values.bidValue || !dirty || !isValid || isBidExpired} onClick={() => {handleSubmit()}} class="submt-btn submt-btn-dark text-center full-w" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default memo(MakeBidView);