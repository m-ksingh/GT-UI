import React, { useState, useEffect, useRef, memo } from 'react'
import { Formik } from "formik"
import * as Yup from 'yup';
import _ from 'lodash';
import $ from 'jquery';
import { Form } from 'react-bootstrap';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import TermAndCondition from '../Shared/TermAndCondition/TermAndCondition.';

const ListingTerm = ({ setTab, listInfoByView, setListInfoByView, onCancelStep = () => {} }) => {
    let termRef = useRef(false);
    const [validCaptcha, setValidCaptcha] = useState(false)
    const [agreeTermCondition, setAgreeTermCondition] = useState(false);
    const [showTerm, setShowTerm] = useState(false);

    let defaultTermsValues = {
        
        terms: false
    };
    const listDetail = _.cloneDeep(listInfoByView);
    if (listDetail && !_.isEmpty(listDetail.condition)) {
        defaultTermsValues.terms = listDetail.condition.terms;
    }
    const [initialValues, setInitialValues] = useState(defaultTermsValues)
    const schema = Yup.object().shape({
        terms: Yup.bool().required().oneOf([true], 'Terms must be accepted'),
    });

    const onPrevNav = (values) => {
        $('#terms').removeClass('active');
        setTab('image')
    }

    const onNextNav = (values) => {
        $('#post').addClass('active');
        setTab('post');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    return (<fieldset>
        <div className="row justify-content-center">
            <div className="col-lg-6">
                <Formik
                    enableReinitialize={true}
                    validationSchema={schema}
                    initialValues={initialValues}
                >
                    {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, setFieldValue, isValid, dirty }) => (
                        <div className="form-card">
                            {/* <div className="ts-ctn">
                                <p className="text-left pb-4">Term & Conditions Coming soon..</p>
                            </div> */}
                            <div className="form-group magic-box mb-3 text-center">
                                <Form noValidate>
                                    <Form.Group>
                                        <Form.Check
                                            required
                                            name="terms"
                                            checked={termRef.current}
                                            // checked={values.terms}
                                            id="listing-create-terms-aggree"
                                            label="I agree to the Terms"
                                            
                                            onChange={(e) => {
                                                handleChange(e);
                                                termRef.current = e.target.checked;
                                                if(!e.target.checked) $('#post').removeClass('active');
                                                if (e.target.checked) {
                                                    setShowTerm(e.target.checked);
                                                    setFieldValue("terms", e.target.checked); 
                                                    setListInfoByView({ 
                                                    ...listInfoByView, 
                                                    'condition': { 
                                                        'terms' : e.target.checked
                                                    } 
                                                })
                                                   
                                                } else {
                                                    setValidCaptcha(false);
                                                    setAgreeTermCondition(false);
                                                }
                                                // if(!e.target.checked) $('#post').removeClass('active');
                                                // setListInfoByView({ 
                                                //     ...listInfoByView, 
                                                //     'condition': { 
                                                //         'terms' : e.target.checked
                                                //     } 
                                                // })
                                            }}
                                            
                                            isInvalid={!!errors.terms}
                                            // feedback={errors.terms}
                                        />
                                        <Form.Control.Feedback type="invalid" className='pl'>
                                            {errors.terms}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <div class="aic py15 jcc mobile-off">
                                        <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => onCancelStep()}></input>
                                        <input type="button" value="Previous" class="submt-btn submt-btn-lignt mr10" onClick={() => onPrevNav(values)}></input>
                                        <input type="button" name="next" disabled={isSubmitting || !isValid || (_.isEmpty(listDetail.condition) && !dirty) || !values.terms || !termRef.current} className="next action-button nextBtn nextBtnfst" value="Next" onClick={onNextNav} />
                                    </div>
                                    <section class="mobile-btn-section desktop-off">
                                            <div class="container">
                                                <div class="row">
                                                    <div class="col-lg-12">
                                                        <div class="proPg-btnArea">
                                                            <ul>
                                                                <li onClick={() => onCancelStep()}><a class="submt-btn submt-btn-lignt mr10 text-center">Cancel</a></li>
                                                                <li onClick={() => onPrevNav(values)}><a class="submt-btn submt-btn-lignt mr10 text-center">Previous</a></li>
                                                                <li onClick={onNextNav}><a class="submt-btn submt-btn-dark text-center" disabled={isSubmitting || !isValid || (_.isEmpty(listDetail.condition) && !dirty) || !values.terms || !termRef.current} >Next</a></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    </section>

                                </Form>
                            </div>
                        </div>
                    )}
                </Formik>
                {
            showTerm
            && <TermAndCondition
                {...{
                    show: showTerm,
                    setShow: setShowTerm,
                    showCaptcha: true,
                    validCaptcha,
                    setValidCaptcha,
                    setAgreeTermCondition,
                    onAgreeCallback: () => {
                        setAgreeTermCondition(true);
                    },
                    onClickCloseIcon: () => {
                        termRef.current = false;
                        setValidCaptcha(false);
                        setAgreeTermCondition(false);
                        // setInitialValues({
                        //     terms: false
                        // })
                    }
                }}
            />
        }
            </div>
        </div>
    </fieldset>)
}

export default memo(ListingTerm)