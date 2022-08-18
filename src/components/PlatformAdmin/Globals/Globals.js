import { useState, useContext, useEffect } from 'react'
import { InputGroup } from "react-bootstrap";
import { SubmitField } from "../../Shared/InputType";
import ApiService from '../../../services/api.service';
import Spinner from "rct-tpt-spnr";
import useToast from '../../../commons/ToastHook';
import _ from 'lodash';
import { Formik, Field, ErrorMessage } from "formik";
import { AppContext } from '../../../contexts/AppContext';
import { useAuthState } from '../../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';

const InitialValues = {
    "ibMarkup": {
        "percentage": 0,
        "amount": 0
    },
    "subscription": 0,
    "dealerListingFees": {
        "percentage": 0,
        "amount": 0
    },
    "userListingFees": {
        "percentage": 0,
        "amount": 0
    },
    "restockingFees": {
        "percentage": 0,
        "amount": 0
    },
    "returnPeriod": 0,

    "noShowPenalty": {
        "percentage": 0,
        "amount": 0
    },
    "platFormBuyerFee": {
        "percentage": 0,
        "amount": 0
    },
    "platFormSellerFee": {
        "percentage": 0,
        "amount": 0
    },
    "tax": 0,
}

const Globals = () => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const { setPlatformVariables } = useContext(AppContext)
    const [globalVariables, setGlobalVariables] = useState(InitialValues);
    const userDetails = useAuthState();
    const history = useHistory();

    const schema = Yup.object().shape({
        ibMarkup: Yup.object().shape({
            percentage: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
            amount: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        }),
        subscription: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        dealerListingFees: Yup.object().shape({
            percentage: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
            amount: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        }),
        restockingFees: Yup.object().shape({
            percentage: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
            amount: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        }),
        returnPeriod: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        noShowPenalty: Yup.object().shape({
            percentage: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
            amount: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        }),
        platFormBuyerFee: Yup.object().shape({
            percentage: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
            amount: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        }),
        platFormSellerFee: Yup.object().shape({
            percentage: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
            amount: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),
        }),
        tax: Yup.number().positive().min(0, 'Must be greater than or equal to 0').required("Required!"),

    });

    /**
     * This method used to fetch platform admin variables 
     */
    const fetchVariables = async () => {
        try {
            spinner.show("Please wait... Fetching...");
            let { data } = await ApiService.fetchPlatformVariables();
            if (!_.isEmpty(data))
                setGlobalVariables({ ...data });
            spinner.hide();
        } catch (err) {
            spinner.hide();
            console.error("Exception occurred in fetchVariables -- ", err);
        }
    }

    /**
     * This method used to save platform variables
     * @param {Object} val 
     */
    const saveVariables = async (val = {}) => {
        try {
            spinner.show("Please wait...");
            await ApiService.savePlatformVariables(val);
            setGlobalVariables({ ...val })
            setPlatformVariables(val)
            Toast.success({ message: "Successfully saved global variables!", time: 2000 });
            spinner.hide();
        } catch (err) {
            Toast.error({ message: "Failed tp save global variables", time: 2000 });
            spinner.hide();
        }
    }

    // Works as constructor
    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
        if (userDetails?.user?.sid) {
            fetchVariables()
        }
    }, []);

    return <Formik
        initialValues={globalVariables}
        onSubmit={saveVariables}
        enableReinitialize={true}
        validationSchema={schema}>
        {
            ({
                handleSubmit,
                handleChange,
                values
            }) => <form onSubmit={handleSubmit} className="platform-globals">
                    <div className="platForm-border">Global</div>
                    <div className="row aic">
                        <div className="col-12 col-sm-2">Instant Buy Markup</div>
                        <div className="col-12 col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="ibMarkup.percentage" value={values?.ibMarkup?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="ibMarkup.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="ibMarkup.amount" value={values?.ibMarkup?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="ibMarkup.amount" className="text-danger mb-2 small-text position-absolute" />

                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Dealer Subscription Fees per month</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="subscription" value={values?.subscription} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="subscription" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Dealer Listing Fees</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="dealerListingFees.percentage" value={values?.dealerListingFees?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="dealerListingFees.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="dealerListingFees.amount" value={values?.dealerListingFees?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="dealerListingFees.amount" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">User Listing Fees</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="userListingFees.percentage" value={values?.userListingFees?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="userListingFees.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="userListingFees.amount" value={values?.userListingFees?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="userListingFees.amount" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Preferred FFL discount</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="preferredFFLDiscount.percentage" value={values?.preferredFFLDiscount?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="preferredFFLDiscount.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="preferredFFLDiscount.amount" value={values?.preferredFFLDiscount?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="preferredFFLDiscount.amount" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Return - Restocking Fees</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="restockingFees.percentage" value={values?.restockingFees?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="restockingFees.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="restockingFees.amount" value={values?.restockingFees?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="restockingFees.amount" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Item Return Period</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="returnPeriod" value={values?.returnPeriod} onChange={handleChange} />
                                    </InputGroup>
                                    <ErrorMessage component="span" name="returnPeriod" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Day(s) from the date of delivery</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">No Show Penalty</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="noShowPenalty.percentage" value={values?.noShowPenalty?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="noShowPenalty.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" min="0" type="number" name="noShowPenalty.amount" value={values?.noShowPenalty?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="noShowPenalty.amount" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Platform Fee for Buyer</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" type="number" name="platFormBuyerFee.percentage" value={values?.platFormBuyerFee?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="platFormBuyerFee.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" type="number" name="platFormBuyerFee.amount" value={values?.platFormBuyerFee?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="platFormBuyerFee.amount" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Platform Fee for Seller</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" type="number" name="platFormSellerFee.percentage" value={values?.platFormSellerFee?.percentage} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="platFormSellerFee.percentage" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="px-3"> or </div>
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" type="number" name="platFormSellerFee.amount" value={values?.platFormSellerFee?.amount} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">$</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="platFormSellerFee.amount" className="text-danger mb-2 small-text position-absolute" />
                                </div>
                                <div className="ml-2">Whichever is Higher</div>
                            </div>
                        </div>
                    </div>
                    <div className="row aic my-4">
                        <div className="col-sm-2">Tax</div>
                        <div className="col-sm-8">
                            <div className="aic">
                                <div className="gl-form">
                                    <InputGroup>
                                        <Field className="form-control" type="number" name="tax" value={values?.tax} onChange={handleChange} />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage component="span" name="tax" className="text-danger mb-2 small-text position-absolute" />
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="flx">
                        <SubmitField type="submit" label="Submit" className="px-4" />
                    </div>
                </form>
        }
    </Formik>
}

export default Globals;