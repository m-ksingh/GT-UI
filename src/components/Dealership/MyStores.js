import React, { useContext, useState, useEffect } from 'react';
import { useAuthState } from '../../contexts/AuthContext/context';
import ApiService from "../../services/api.service";
import { Form, Card } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { Formik } from "formik";
import Spinner from "rct-tpt-spnr";
import FormikCotext from '../Shared/FormikContext';
import Layout from '../Layout';
import _ from "lodash";
import { PlusCircleIcon } from "../icons";
import useToast from '../../commons/ToastHook';
import classNames from 'classnames';
import StoreRenewalModal from '../Profile/Notification/StoreRenewalModal';


const cardList = [
    {
        icon: 'listings_icon',
        title: 'Listings',
        type: 'listing',
    },
    {
        icon: 'orders-icon',
        title: 'Orders',
        type: 'orders',
    },
    {
        icon: 'store-setting-icon',
        title: 'Store Settings',
        type: 'setting',
    }
];

const MyStores = props => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const [isExpired, setIsExpired] = useState(false);
    const [isRenewalStore, setIsRenewalStore] = useState(false);
    const [storeValue, setStoreValue] = useState("false");
    const [initialValues, setInitialValues] = useState({
        store: ''
    });

    // get my store list
    const listMyStores = () => {
        setIsLoading(true);
        spinner.show("Please wait...");
        ApiService.getMyStores(userDetails.user.sid).then(
            response => {
                setStores(response.data);
                if (response.data.length) {
                    setSelectedStore(response.data[0].sid);
                }
            },
            err => {
                Toast.error({ message: err.response.data ? err.response.data.error : 'Data loading error', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsLoading(false);
        });
    }

    // listening for form value change
    const handleChangeByChange = (values) => {
        setSelectedStore(values.store);
        setStoreValue(values.store);
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
                                <li>My Stores</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section id="delearship-mystores-section">
                <div class="bg-white container">
                    <div class="row justify-content-start aic">
                        <div class="col-6">
                            <h2 className="card-title-header mb-0">My Stores</h2>
                        </div>
                        <div class="col-6 text-right">
                            <Link
                                className="action-link text-dark aic jce"
                                to={{
                                    pathname: "/store/onboard/new",
                                    state: {
                                        breadcrumb: [
                                            {
                                                name: "Home",
                                                path: "/"
                                            },
                                            {
                                                name: "My Store",
                                                path: "/store/mystores"
                                            },
                                            {
                                                name: "New Store"
                                            }
                                        ]
                                    }
                                }}
                            >
                                <PlusCircleIcon width={"20px"} />
                                <div className="pt5 pl5"> New Store</div>
                            </Link>
                        </div>
                    </div>
                    <hr />
                    <div class="row">
                        <div class="col-lg-12 mb-4">
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}>
                                {({ handleSubmit, isSubmitting, handleChange, setFieldValue, touched, errors, values, isValid, dirty }) => (
                                    <Form noValidate>
                                        <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                        <Form.Group>
                                            <Form.Label class="p-0"><h5 class="label-head mb-0">Select Store</h5></Form.Label>
                                            <Form.Control class="p-2 text-center" as="select"
                                                name="store"
                                                value={values.store}
                                                onChange={(e) => {
                                                    let storeSid = e?.target?.value;
                                                    setFieldValue("store", storeSid);
                                                    if (stores.find(e => e?.sid === storeSid)?.licenseExpired) {
                                                        setIsExpired(stores.find(e => e.sid === storeSid).licenseExpired);
                                                        setFieldValue("isExpired", stores.find(e => e.sid === storeSid).licenseExpired);
                                                    } else {
                                                        setIsExpired(false);
                                                        setFieldValue("isExpired", false);
                                                    }
                                                }}

                                                isInvalid={!!errors.store}
                                            >
                                                <option value="false">--Select FFL Store--</option>
                                                {!_.isEmpty(stores) && stores.map((list, index) => {
                                                    return <option key={list.sid} value={list.sid} >{list.name}</option>

                                                })}
                                            </Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.store}
                                            </Form.Control.Feedback>
                                            {isExpired && <div className="text-danger f12 slider-labels">This store has expired. You will not be able to list any item. Please request for renewal. <span class="btn btn-danger btn-sm" onClick={() => setIsRenewalStore(true)}>Renew License</span></div>}
                                        </Form.Group>
                                    </Form>
                                )}
                            </Formik>
                            <div class="container">
                                <div class="row">
                                    {(storeValue != "false" && storeValue != '') &&
                                        !_.isEmpty(cardList) && cardList.map((list, index) => {
                                            return <div class="col p-0 store-menu" key={index}>
                                                <Link to={(isExpired && list.type == "setting") ? '#' : `/mystore/${list.type}/${selectedStore}`}>
                                                    <Card className={classNames("card-deck border m-1", { "disabled": isExpired && list.type == "setting" })}>
                                                        <Card.Body className="text-center">
                                                            <Card.Title>
                                                                <div class={list.icon}>
                                                                    <a href="" />
                                                                </div>
                                                            </Card.Title>
                                                            <Card.Text className="text-dark">{list.title}</Card.Text>
                                                        </Card.Body>
                                                    </Card>
                                                </Link>
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    isRenewalStore
                    && <StoreRenewalModal {...{
                        show: isRenewalStore,
                        setShow: setIsRenewalStore,
                        selectedStore
                    }} />
                }
            </section>
        </Layout>
    );
}

export default MyStores;