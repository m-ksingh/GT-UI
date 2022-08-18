import { useState, useEffect, useRef } from 'react'
import Modal from '../Modal'
import ReCAPTCHA from "react-google-recaptcha";
import { SubmitField } from '../InputType';
import { useAuthState } from '../../../contexts/AuthContext';
import useToast from '../../../commons/ToastHook';
import './term.css'

let defaultModalBody = <>
    <p>I am <span className="fw-bold">21 years</span> of age or older.</p>
    <p>I understand that  <span className="fw-bold">Guntraderz DOES NOT </span> become involved in transactions between parties and does not certify,
        investigate, or in any way guarantee the legal capacity of any party to transact.</p>
    <p> I am responsible for obeying all applicable enforcement mechanisms, including, but not limited to federal,
        state, municipal, and tribal statutes, rules, regulations, ordinances, and judicial decisions,
        any applicable Presidential Executive Orders, including compliance with all applicable licensing requirements.

    </p>
    <p>I will not use  <span className="fw-bold">Guntraderz</span> for any illegal purpose. </p>

    <p>If I am at all unsure about firearm sales or transfers, I will contact the Bureau of Alcohol, Tobacco,
        Firearms, and Explosive at <span className="fw-bold">1-800-ATF-GUNS </span> and visit the  <span className="fw-bold">ATF</span> website at <a target="_blank" href="http://www.atf.gov"> http://www.atf.gov.</a> </p>

    <p>I will help to ensure the overall openness and accessibility of the site to all users through a
        peer-review process. I understand that failure to adhere to proper internet protocol and etiquette may
        result in removal of my listings or more severe corrective action.
    </p>
    <p>
        <span className="fw-bold">Guntraderz</span> may edit or remove information, including my listings, from the site without notice.
    </p>
    <p>
    </p>
    <p>If I violate these terms,  <span className="fw-bold">Guntraderz</span> may permanently remove me from the site or, depending on the nature and severity of the violation, avail itself of such remedies as are prescribed by law.
        Whilst  <span className="fw-bold">Guntraderz</span> ABSOLUTELY BELIEVES AND CHAMPIONS “the right of the people to keep and bear Arms,”  <span className="fw-bold">Guntraderz</span> will comply with federal,
        state, municipal, and tribal law enforcement entities pursuant to the Constitution of the United States and Due Process of Law. </p>
    <p>
        I agree to abide by the spam and listing policies. I may only have one account and may only list an item once, in the correct category, and in my physical location.
    </p>
    <p>
        I understand that the sale or trade of animals on  <span className="fw-bold">Guntraderz</span> is prohibited.
    </p>
    <p>
        I indemnify and hold harmless  <span className="fw-bold">Guntraderz</span> and all of its owners, directors, officers, employees, and agents for any and all loss, harm, damage, costs,
        liability, and expense caused to them, whether intentionally or unintentionally, by my use of Guntraderz, including but not
        limited to direct or indirect results of violations of any and all applicable laws.
    </p>
    <p>
        <span className="fw-bold">Guntraderz</span> may make changes to these terms at any time without notifying me. As a user, I am solely responsible for reading the most current version of the terms and conditions.
    </p>
    <p>
        By clicking “I agree,” I electronically represent (“sign”) that I agree to the above terms and further certify that I have read, and completely agree, to be legally bound by the  <span className="fw-bold">Guntraderz</span> Terms of Use
    </p>
</>

const TermAndCondition = ({
    show,
    setShow,
    setValidCaptcha,
    validCaptcha = false,
    setAgreeTermCondition,
    onAgreeCallback = () => {},
    onCancel = () => {},
    onClickCloseIcon = () => {},
    headerLabel = "Terms of Use",
    cancelButtonLabel = "Cancel",
    submitButtonLabel = "Agree & Continue",
    modalBody = defaultModalBody,
    showCaptcha = false,
    showCloseButton,
    closeLabel
}) => {
    const termConditionRef = useRef();
    const userDetails = useAuthState();
    const [bottom, setBottom] = useState(false);
    const Toast = useToast();

    /**
     * this method trigger when scroll 
     * @param {Object} e = event element
     */
    const handleScroll = (e) => {
        if ((e.target.scrollHeight - e.target.scrollTop) - 1 <= e.target.clientHeight) {
            setBottom(true);
        }
    };

    // component init
    useEffect(() => {
        window.scrollTo(0, 0);
        if(showCaptcha) {
            setValidCaptcha(false);
            setAgreeTermCondition(false);
        } 
        setBottom(termConditionRef.current.scrollHeight === termConditionRef.current.clientHeight);

    }, [])

    return (<>
        <Modal {...{ show, setShow, onClickCloseIcon }} className="termCondition-modal">
            <div className="termCondition-header text-left">
                <span className="fw600">{headerLabel}</span>
            </div>
            <div ref={termConditionRef} className="termCondition-body" onScroll={handleScroll}>
                {modalBody}
            </div>
            <div className="termCondition-footer">
                {/* {
                    userDetails
                    && userDetails.user
                    && userDetails.user.sid
                    ? <div class="row">
                        <div class="col-12 col-lg-6 g-recaptcha-padding">
                            <ReCAPTCHA
                                className="g-recaptcha"
                                sitekey="6LcvRsQaAAAAAOombSCiE2uU2WP884J6YZvblYr2"
                                onChange={(value) => { setValidCaptcha(true) }}
                                theme="white"
                                //size="normal" //normal // compact // invisible
                                badge="inline" // inline // bottomright // bottomleft
                            />
                        </div>
                        <div class="col-12 col-lg-6 rcap-btn-pad">
                            <SubmitField
                                id="closeBtn"
                                // disabled={!validCaptcha || !bottom}
                                disabled={!bottom} // for dev testing captcha is not working on http://52.90.255.76:3000/
                                label="Agree & Continue"
                                className="mx-3 btn-recaptcha"
                                onClick={() => { 
                                    setAgreeTermCondition(true); 
                                    setShow(false);
                                    onAgreeCallback();
                                }}
                            ></SubmitField>
                        </div>
                    </div>
                    : null
                } */}
                    <div class={`row w100 ${showCaptcha ? "" : "flx-no-wrap"}`}>
                        <div class={`${showCaptcha ? "col-12 ml-4" : "col-6 col-xm-6 sol-sm-6 col-md-6"} col-lg-6 ml-md-0`}>
                            {
                                showCaptcha
                                && <ReCAPTCHA
                                    className="g-recaptcha"
                                    // This .ORG siteKey:- 6Lcf_S0gAAAAAER-z-HRC2qskTzoh5YhhKiY9vm-
                                    // sitekey="6Lcf_S0gAAAAAER-z-HRC2qskTzoh5YhhKiY9vm-"
                                    // This .NET siteKey:- 6LcvRsQaAAAAAOombSCiE2uU2WP884J6YZvblYr2
                                    sitekey="6LcvRsQaAAAAAOombSCiE2uU2WP884J6YZvblYr2"
                                    onChange={(value) => { 
                                        setValidCaptcha(true);
                                    }}
                                    onExpired={() => {
                                        setValidCaptcha(false);
                                        // setAgreeTermCondition(false);
                                    }}
                                    badge="inline" // inline // bottomright // bottomleft
                                />
                            }
                            {
                                !showCaptcha
                                && <input
                                    type="button"
                                    name="cancel"
                                    value={cancelButtonLabel}
                                    onClick={() => {
                                        setShow(false);
                                        onCancel();
                                    }}
                                    class="submt-btn mr10 text-center cancel-button w100"
                                />
                            }
                        </div>
                        <div class={`${showCaptcha ? "col-12" : "col-6 col-xm-6 sol-sm-6 col-md-6"} col-lg-6 px-0`}>
                            <SubmitField
                                id="closeBtn"
                                disabled={showCaptcha ? (!validCaptcha || !bottom || !setAgreeTermCondition) : !bottom}
                                // disabled={!bottom} // for dev testing captcha is not working on http://52.90.255.76:3000/
                                label={submitButtonLabel}
                                className="mx-3 btn-recaptcha"
                                onClick={() => { 
                                        setShow(false);
                                        onAgreeCallback();
                                }}
                            ></SubmitField>
                        </div>
                    </div>
            </div>
        </Modal>
    </>)
}

export default TermAndCondition