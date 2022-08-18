import React, { useContext, useState, useEffect } from 'react';
import { useAuthState } from '../../contexts/AuthContext/context';
import ApiService from "../../services/api.service";
import { Form, Card } from 'react-bootstrap';
import Spinner from "rct-tpt-spnr";
import { Formik } from "formik";
import { Link, useHistory } from 'react-router-dom';
import FormikCotext from '../Shared/FormikContext';
import Layout from '../Layout';
import _ from "lodash";
import moment from 'moment';
import DatePicker from "react-datepicker";
import useToast from '../../commons/ToastHook';

const defaultStatus = {
    store: 'All_Shops',
    duration: '1',
    fromdaterange: '',
    todaterange: ''
};

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
    },
    {
        name: "Custom Date Range",
        sid: "custom_date_range"
    }
];
const cardMappingTitle = {
    totalSale: 'TOTAL SALES',
    instantBuy: 'INSTANT BUY',
    openTrade: 'OPEN TRADE',
    specificTrade: 'SPECIFIC TRADE',
    auctions: 'AUCTIONS'
};
const Dashboard = props => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState(defaultStatus);
    const history = useHistory();
    const [salesValues, setSalesValues] = useState({
        "totalSale": 0,
        "instantBuy": 0,
        "openTrade": 0,
        "specificTrade": 0,
        "auctions": 0
    });

    const dashboardSalesInfo = (values) => {
        const payload = {};
        if (values.duration == "custom_date_range") {
            payload.fromDate = values.fromdaterange;
            payload.toDate = values.todaterange;
        } else if (values.duration > 1) {
            payload.fromDate = moment().subtract(values.duration, 'd').valueOf();
            payload.toDate = moment().valueOf();
        } else {
            payload.fromDate = moment().startOf('day').valueOf();
            payload.toDate = moment().valueOf();
        }
        if (values.store === 'All_Shops') {
            payload.appUserSid = userDetails.user.sid;
            payload.fflStoreSid = "";
        } else {
            payload.fflStoreSid = values.store;
            payload.appUserSid = "";
        }
        spinner.show("Please wait...");
        ApiService.dashboardSalesInfo(payload).then(
            response => {
                setSalesValues(response.data);
            },
            err => {
                Toast.error({ message: err.response.data ? err.response.data.error : 'Data loading error', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsLoading(false);
        });
    }

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
        dashboardSalesInfo(values);
    }

    // component init
    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
        if (userDetails?.user?.sid) {
            listMyStores();
            dashboardSalesInfo(defaultStatus);
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
                                <li>Dashboard</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section id="delearship-dashboard-section">
                <div class="bg-white container">
                    <div class="row justify-content-start">
                        <div class="col-lg-12">
                            <h2 className="page-title-h">Dashboard</h2>
                            <hr />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-12 mb-4">
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}>
                                {({ handleSubmit, isSubmitting, handleChange, setFieldValue, touched, errors, values, isValid, dirty }) => (
                                    <Form noValidate>
                                        <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                        <div class="form-group text-left">
                                            <div className="row">
                                                <div className="col-6 col-lg-3">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Select Shop</h5></Form.Label>
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
                                                </div>
                                                <div className="col-6 col-lg-3">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">Period</h5></Form.Label>
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
                                                </div>
                                                {values.duration == "custom_date_range" && <div className="col-6 col-lg-3">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">From Date</h5></Form.Label>
                                                        <DatePicker
                                                            className="form-control"
                                                            name="fromdaterange"
                                                            selected={values?.fromdaterange}
                                                            maxDate={new Date(values?.todaterange || new Date())}
                                                            dateFormat="MM/dd/yyyy"
                                                            placeholderText="MM/DD/YYYY"
                                                            dropdownMode="select"
                                                            disabled={values.duration != "custom_date_range"}
                                                            onChange={(e) => {
                                                                if (e) setFieldValue("fromdaterange", e.getTime())
                                                            }}
                                                            isInvalid={!!errors.fromdaterange && !!touched.fromdaterange}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.fromdaterange}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>}
                                                {values.duration == "custom_date_range" && <div className="col-6 col-lg-3">
                                                    <Form.Group>
                                                        <Form.Label class="p-0"><h5 class="label-head mb-0">To Date</h5></Form.Label>
                                                        <DatePicker
                                                            className="form-control"
                                                            name="todaterange"
                                                            selected={values?.todaterange}
                                                            minDate={new Date(values?.fromdaterange)}
                                                            maxDate={new Date()}
                                                            dateFormat="MM/dd/yyyy"
                                                            placeholderText="MM/DD/YYYY"
                                                            disabled={values.duration != "custom_date_range"}
                                                            dropdownMode="select"
                                                            onChange={(e) => {
                                                                if (e) setFieldValue("todaterange", e.getTime())
                                                            }}
                                                            isInvalid={!!errors.todaterange && !!touched.todaterange}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.todaterange}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>}
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                            <div class="container">
                                <div class="row dashboard-cards">
                                    {
                                        _.map(salesValues, (value, key) => {
                                            return <div class="col-lg col-sm-12 col-xs-12 p-0" key={key}>
                                                <Card className="card-deck border m-1">
                                                    <Card.Body className="text-center">
                                                        <Card.Title>{value}</Card.Title>
                                                        <Card.Text>{cardMappingTitle[key]}</Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default Dashboard;