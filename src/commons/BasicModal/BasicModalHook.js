import React, { useState } from 'react';
import { BasicModal } from "react-bootstrap-dynamic-modal";
let refData = null;
export const useBasicModal = ({
    title,
    body,
    onClose = (dataRef) => { },
    hideFooter = false,
    hideHeader = false,
    btnLabel
}) => {
    const [modalProps, updateModalProps] = useState({
        size: 'xs',
        buttons: [
            {
                variant: "primary",
                handler: () => {
                    onClose(refData);
                    updateVisibility(false)
                },
                label: btnLabel || "Okay"
            }
        ],
        onHide: () => {
            onClose(refData);
            updateVisibility(false)
        },
        visibility: false,
        hideHeader: false
    });

    /*
        * Updates visibility of confirmation modal.
        * @parameter {Boolean} visibility - Default: false
    */
    const updateVisibility = (visibility = false) => updateModalProps({
        ...modalProps,
        buttons: hideFooter ? [] : modalProps.buttons,
        hideHeader,
        visibility
    });

    /*
        * To display confirmation modal.
        * @parameter {Anything} dataRef - It'll be used to identify in the callback method
    */
    const show = (refValue = null) => {
        refData = refValue;
        updateVisibility(true);
    }

    return [show, <BasicModal {
        ...{
            ...modalProps,
            body: body,
            title: title,
            modalClass: "esc-modal"
        }
    } />]
}