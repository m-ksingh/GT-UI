import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import { Formik, Field, ErrorMessage } from "formik";
import { Form, InputGroup } from 'react-bootstrap';
import ApiService from "../../services/api.service";
import { useAuthState, useAuthDispatch } from '../../contexts/AuthContext/context';
import useToast from '../../commons/ToastHook';

/**
 * This is a initialvalues for Default Settings module.
 */
const defaultValues = {
    "restockingFees": {
        "percentage": 0,
        "amount": 0
    },
    "returnPeriod": 0
}

const DefaultSettings = () => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const dispatch = useAuthDispatch();
    let userDetails = useAuthState();
    const history = useHistory();
    const [initialValues, setInitialValues] = useState(defaultValues);

    /**
     * This is used for Default Setings yup validation.
     */
    const schema = Yup.object().shape({
          restockingFees: Yup.object().shape({
            percentage: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
            amount: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
          }),
          returnPeriod:  Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!")
         
      });

      /**
       * This methed is used for set the Default Settings.
       * @param {Number} values - This is value of Re-Stocking Amount & percentage, Return period. 
       */
      const onDefaultSettingsSubmitted = (values, {setSubmitting}) => {
        try {
            if (!_.isEmpty(values)) {
                spinner.show("Please wait...");
                let payload = {...userDetails.user, "defaultPlatformVariables": JSON.stringify(values) }
                ApiService.saveMyProfile(payload).then(
                    response =>{
                        dispatch({ type: 'LOGIN_SUCCESS', payload: {...response.data, "defaultPlatformVariables": response.data?.defaultPlatformVariables ? JSON.parse(response.data.defaultPlatformVariables) : null} });
                        Toast.success({ message: 'Default settings saved successfully', time: 2000});
                    }, err =>{
                        Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
                    }
                ).finally(() =>{
                    setSubmitting(false);
                    spinner.hide();
                });
            }
        } catch (err) {
            setSubmitting(false);
            console.error("Exception occurred in onDefaultSettingsSubmitted --- " + err);
            spinner.hide();
        }
    }

    /**
     * This is used for get the default settings values & set the default value.
     */
    useEffect(() =>{
        if(userDetails?.user?.sid)
        setInitialValues(userDetails?.user?.defaultPlatformVariables ? userDetails.user.defaultPlatformVariables : defaultValues);
    }, [userDetails])

    return <>
        <h2 className="card-title-header">Default Settings</h2>
        <div className="myac-piBox">
            <Formik
            enableReinitialize={true}
            validationSchema={schema}
            initialValues={initialValues}
            onSubmit={onDefaultSettingsSubmitted}>
                {({ handleSubmit, isSubmitting, handleChange, resetForm, errors, values, isValid, dirty }) => (
                    <Form noValidate>
                        <div className="col-12 col-sm-8 col-lg-12 pb20 mb20">
                            <Form.Label><span>Return - Restocking Fees</span><span className="mandatory">*</span></Form.Label>
                            <div className="aic">
                                    <InputGroup className='wrap-text-ds'>
                                        <Field className="form-control" min="0" type="number" name="restockingFees.percentage" value={values?.restockingFees?.percentage} onChange={handleChange} />
                                        <InputGroup.Append className="form-control-append">
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                        <ErrorMessage component="span" name="restockingFees.percentage" className="text-danger mb-2 small-text position-absolute-error" />
                                    </InputGroup>
                                    
                                
                                <div className="px-3"> OR </div>
                                    <InputGroup className='wrap-text-ds'>
                                        <Field className="form-control" min="0" type="number" name="restockingFees.amount" value={values?.restockingFees?.amount} onChange={handleChange} />
                                        <InputGroup.Append className="form-control-append" >
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                        <ErrorMessage component="span" name="restockingFees.amount" className="text-danger mb-2 small-text position-absolute-error" />
                                    </InputGroup>
                                   
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>

                        <div className="col-sm-8">
                        <Form.Label><span>Item Return Period</span><span className="mandatory">*</span></Form.Label>
                            <div className="aic">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="returnPeriod" value={values?.returnPeriod} onChange={handleChange} />
                                        <ErrorMessage component="span" name="returnPeriod" className="text-danger mb-2 small-text position-absolute-error" />
                                    </InputGroup>
                                   
                                <div className="ml-2">Day(s) from the date of delivery</div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 text-right mobile-off">
                                <ul className="profile-btnList">
                                <li onClick={() => {history.replace("/")}} ><a class="submt-btn submt-btn-lignt mr10 pointer">Cancel</a></li>
                                    <li><button type="submit" className="submt-btn submt-btn-dark" disabled={!isValid || isSubmitting || !dirty} onClick={handleSubmit}>Save</button></li>
                                </ul>
                            </div>
                            <section class="mobile-btn-section desktop-off">
                                <div class="container">
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="proPg-btnArea">
                                                <ul>
                                                <li onClick={() => {history.replace("/")}} ><a class="submt-btn submt-btn-lignt mr10 pointer">Cancel</a></li>
                                                    <li><button type="submit" className="submt-btn submt-btn-dark probtn-pading" disabled={!isValid || isSubmitting || !dirty} onClick={handleSubmit}>Save</button></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Form>)}
            </Formik>
        </div>

    </>;
}
export default DefaultSettings