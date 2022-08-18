import React, { useContext, useState, useEffect } from 'react';
import { useAuthState } from '../../contexts/AuthContext/context';
import ApiService from "../../services/api.service";
import { Form } from 'react-bootstrap';
import { Formik } from "formik";
import { Link, useHistory } from 'react-router-dom';
import Spinner from "rct-tpt-spnr";
import FormikCotext from '../Shared/FormikContext';
import Layout from '../Layout';
import _ from "lodash";
import useToast from '../../commons/ToastHook';

const defaultStatus = {
    store: 'All_Shops',
    duration: 'Today'
};
const cardList = [
    {
        icon: 'listing',
        title: 'Listing'
    },
    {
        icon: 'order',
        title: 'Orders'
    },
    {
        icon: 'storesetting',
        title: 'Store Settings'
    }
];
const durationList = [
    {
        name: "Today",
        sid: "1"
    },
    {
        name: "Last 7 Days",
        sid: "7"
    },
    {
        name: "Last 15 Days",
        sid: "15"
    },
    {
        name: "Last 30 Days",
        sid: "30"
    }
];

const Reports = props => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState(defaultStatus);
    const history = useHistory();

    const listMyStores = () => {
        setIsLoading(true);
        spinner.show("Please wait...");
        ApiService.getMyStores(userDetails.user.sid).then(
            response => {
                const listOfShops = response.data;
                listOfShops.unshift({
                    name: 'All Shops',
                    sid: 'All_Shops'
                });
                setStores(listOfShops);
            },
            err => {
                Toast.error({ message: err.response.data ? err.response.data.error : 'Data loading error', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsLoading(false);
        });
    }
    const handleChangeByChange = (values) => {
        console.log(values);
    }

    // init component
    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
        if (userDetails?.user?.sid) {
            listMyStores();
        }
    }, []);

    return (
        <Layout title="Dashboard" description="This is the dashboard page">
            <section id="breadcrumb-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <ul className="breadcrumb pb-0">
                                <li><Link to="/">Home</Link></li>
                                <li>Reports</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section id="delearship-dashboard-section">
                <div class="bg-white container">
                    <div class="row justify-content-start">
                        <div class="col-12 pt-3">
                            <h2>Reports</h2>
                        </div>
                    </div>
                    <hr />
                    <div class="row">
                        <div class="col-lg-12 mb-4">
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}>
                                {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty }) => (
                                    <Form noValidate>
                                        <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                        <Form.Group>
                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Select Store</h5></Form.Label>
                                            <Form.Control class="p-2 text-center" as="select"
                                                name="store"
                                                value={values.store}
                                                onChange={handleChange}
                                                isInvalid={!!errors.store}
                                            >
                                                {stores.map((list, index) => {
                                                    return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                })}
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.store}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Report Period</h5></Form.Label>
                                            <Form.Control class="p-2 text-center" as="select"
                                                name="duration"
                                                value={values.duration}
                                                onChange={handleChange}
                                                isInvalid={!!errors.duration}
                                            >
                                                {durationList.map((list, index) => {
                                                    return <option key={list.sid} value={list.sid}>{list.name}</option>
                                                })}
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.duration}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Form>
                                )}
                            </Formik>
                            <div className="jce">
                                <div>
                                    <input type="button" name="next" disabled="disabled" className="next action-button nextBtn full-w mx-0 px-4" value="Generate" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default Reports;