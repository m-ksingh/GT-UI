import React, { useState } from 'react';
import { ConfirmationModal } from "react-bootstrap-dynamic-modal";
let refData = null;
export const useConfirmationModal = ({
    title,
    body,
    primaryLabel = "Confirm",
    secondaryLabel = "Cancel",
    onConfirm = (dataRef) => { },
    onCancel = (dataRef) => { },
    onClose = (dataRef) => { },
    hideHeader = false
}) => {
    const [modalProps, updateModalProps] = useState({
        size: 'xs',
        buttons: [
            {
                variant: "secondary",
                handler: () => {
                    onCancel(refData);
                    updateVisibility(false)
                },
                label: secondaryLabel
            },
            {
                variant: "primary",
                handler: () => {
                    onConfirm(refData);
                    updateVisibility(false)
                },
                label: primaryLabel
            }
        ],
        onHide: () => {
            onClose(refData);
            updateVisibility(false)
        },
        visibility: false
    });

    /*
        * Updates visibility of confirmation modal.
        * @parameter {Boolean} visibility - Default: false
    */
    const updateVisibility = (visibility = false) => updateModalProps({
        ...modalProps,
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

    return [show, <ConfirmationModal {
        ...{
            ...modalProps,
            body: (body ? body : "Are you sure you want to delete?"),
            title: (title ? title : "Delete Confirmation"),
            modalClass: "esc-modal"
        }
    } />, modalProps]
}