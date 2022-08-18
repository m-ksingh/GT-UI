import { useState, useEffect } from 'react';
import Modal from '../Modal';
import {NOTIFICATION_CONSTANTS} from '../../Profile/Notification/Constants/NotificationConstants';
import './term.css'
const TermsAndPrivacy = ({ show, setShow, type }) => {
    
    return (<>
        <Modal {...{ show, setShow }} className="termCondition-modal">

            <div className="termCondition-header">
                {
                   type === NOTIFICATION_CONSTANTS.TERMS_TYPE.TERMS && <span>Terms of Use</span> || 
                   type === NOTIFICATION_CONSTANTS.TERMS_TYPE.POLICY && <span>Privacy Policy</span>
                }
                
            </div>
            <div className="termCondition-body">
                {
                    type === NOTIFICATION_CONSTANTS.TERMS_TYPE.TERMS && <p>This is Terms & Conditions</p> ||
                    type === NOTIFICATION_CONSTANTS.TERMS_TYPE.POLICY && <p>This is Privacy Policy</p>
                }
                
            </div>
            <div className="termCondition-footer">
            
            </div>
        </Modal>
    </>)
}

export default TermsAndPrivacy