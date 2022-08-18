import React from 'react';
import _ from 'lodash';
import { Modal, Button, Form } from 'react-bootstrap'
import { Formik, Field } from "formik";
import '../platform.css';

const RejectModal = ({ show, setShow, onConfirm = () => {}}) => {

    // this method trigger when click on confirm
    const onConfirmReject = (values) => {
        try {
            setShow(false);
            onConfirm(values);
        } catch (err) {
            console.error("Error occur when onConfirmReject--", err);
        }
    }
    return <Modal className="store-details-model" show={show} size="md" onHide={() => setShow(false)} animation={false}>
        <Formik
            initialValues={{}}
            onSubmit={onConfirmReject}>
            {({ handleSubmit, isSubmitting, isValid, dirty }) => (
                <Form noValidate className="w100" onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title className="f16">Reject Request</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bgWhite">
                        <Form.Group>
                            <Form.Label className="f12">Reason</Form.Label>
                            <Field name="reason" as="textarea" className="form-control" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline" className="f12 rejectCancelBtn" onClick={() => setShow(false)}>Cancel</Button>
                        <Button type="submit" variant="outline" className="f12 rejectConfirmBtn" disabled={isSubmitting || !isValid || !dirty}>Confirm</Button>
                    </Modal.Footer>
                </Form>
            )}
        </Formik>
    </Modal>;
}

export default RejectModal;