import React, { useState, useEffect, useContext } from 'react'
import _ from "lodash";
import Layout from '../Layout';
import ApiService from "../../services/api.service";
import { Link, useParams, useHistory } from 'react-router-dom'
import StoreOrders from "./StoreOrders/StoreOrders";
import StoreListings from "./StoreListings";
import Spinner from "rct-tpt-spnr";
import StoreSettings from "./StoreSettings/Settings";
import useToast from '../../commons/ToastHook';
import { goToTopOfWindow } from '../../commons/utils';
import { useAuthState } from '../../contexts/AuthContext';

const viewMappingById = {
    listing: 'Listings',
    orders: 'Orders',
    setting: 'Store Settings'
}
function MyStoreScreen() {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const history = useHistory();
    const { type, storeId } = useParams();
    const userDetails = useAuthState();
    const [store, setStore] = useState({
        fflStore: {
            name: ''
        }
    });
    const [appUser, setAppUser] = useState([])

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [storeViewBy, setStoreViewBy] = useState({
        view: '',
        title: ''
    });

    const isValidRoute = _.find(['listing', 'orders', 'setting'], (item) => item === type);

    if (!isValidRoute) {
        history.replace('/')
    }

    // get store details
    const initStore = () => {
        spinner.show("Please wait...");
        ApiService.storeDetails(storeId).then(
            response => {
                setStore(response.data[0]);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : '', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    }

    // populate all users
    const getAllUsers = () => {
        spinner.show("Please wait...");
        ApiService.getAllUser().then(
            response => {
                setAppUser(response.data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : '', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    // init component
    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
        getAllUsers()
        initStore();
    }, []);

    return (
        <Layout view="My Store" title={type} description="My store detail page" >
            <section id="breadcrumb-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <ul className="breadcrumb pb-0">
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/store/mystores">My Stores</Link></li>
                                {type !== 'setting' && <li>{viewMappingById[type]}</li>}
                                {type === 'setting' && _.isEmpty(storeViewBy.view) && <li>Store Settings</li>}
                                {
                                    type === 'setting'
                                    && !_.isEmpty(storeViewBy.view)
                                    && <li className='pointer'><a onClick={() => {
                                        setStoreViewBy({
                                            view: '',
                                            title: ''
                                        });
                                        goToTopOfWindow();
                                    }}>Store Settings</a></li>
                                }
                                {!_.isEmpty(storeViewBy.view) && <li>{storeViewBy.title}</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            <section id="my-store-individual-section" class="pt-0">
                <div class="container p-0">
                    <div class="row">
                        <div className="col-12 flx store-name-page">
                            <div className="mr5">
                                <svg className="dis-block" xmlns="http://www.w3.org/2000/svg" width="16" height="12.801" viewBox="0 0 16 12.801"><path id="store-icon" d="M8,9.6H3.2v-4H1.6V12a.8.8,0,0,0,.8.8H8.8a.8.8,0,0,0,.8-.8V5.6H8Zm7.866-6.046L13.736.355A.8.8,0,0,0,13.069,0H2.938a.8.8,0,0,0-.665.355L.14,3.555A.8.8,0,0,0,.8,4.8H15.2A.8.8,0,0,0,15.869,3.555ZM12.8,12.4a.4.4,0,0,0,.4.4H14a.4.4,0,0,0,.4-.4V5.6H12.8Z" transform="translate(-0.004)" fill="#5ca017" /></svg>
                            </div>
                            <div className="flx1">{store?.fflStore?.name || ""}</div>
                        </div>
                        <div class="col-lg-12 m-3 p-0 pb-3 bg-white">
                            {type === 'listing' && <StoreListings {...{ storeId, appUser }} />}
                            {type === 'orders' && <StoreOrders {...{ storeId }} />}
                            {type === 'setting' && <StoreSettings {...{ storeId, storeViewBy, setStoreViewBy }} />}
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default MyStoreScreen;