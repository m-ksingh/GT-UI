import React, { useState, useContext, useEffect } from 'react';
import Layout from '../components/Layout';
import ProductBanner from '../components/Product/ProductBanner';
import BuySellNav from '../components/Product/BuySellNav';
import ProductsList from '../components/Product/ProductsList';
import { AppContext } from '../contexts/AppContext';
import ApiService from '../services/api.service';
import Spinner from "rct-tpt-spnr";
import { useAuthState, useAuthDispatch } from '../contexts/AuthContext/context';
import _ from 'lodash';
import useToast from '../commons/ToastHook';
import HomeAddressSettings from '../components/Profile/HomeAddressSettings';
import { useConfirmationModal } from '../commons/ConfirmationModal/ConfirmationModalHook';
import { useHistory } from 'react-router-dom';

const Home = () => {
    const { setGunModel, setManufacturer } = useContext(AppContext);
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const { location } = useContext(AppContext);
    const [isDisplay, setIsDisplay] = useState(false);
    const [expireFFLStoreList, setExpireFFLStoreList] = useState([]);
    const dispatch = useAuthDispatch();
    const Toast = useToast();
    const history = useHistory();

    // populate gun model
    const getModel = async () => {
        try {
            ApiService.getModel().then(
                response => {
                    setGunModel(response.data);
                },
                err => {
                    console.error("error occur on getModel()", err)
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur on getModel()", err)
        }
    }

    // populate gun manufacturer
    const getManufacturer = async () => {
        try {
            ApiService.getManufacturer().then(
                response => {
                    setManufacturer(response.data);
                },
                err => {
                    console.error("error occur on getManufacturer--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occur on getManufacturer--", err);
        }
    }

    // show confirmation modal when user click on navigation
    const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Store license expired!",
        body: <>
            <h6 className='text-danger'>Your following store(s) are expired! Please renew by uploading the valid license in order to continue using our services.</h6>
            {expireFFLStoreList.map(item => <li>{item.name}</li>)}
        </>,
        onConfirm: () => {
            history.push('/store/mystores')
        },
        onCancel: () => {
            Toast.success({ message: "I'll do it later.", time: 3000 });
        }

    })


    useEffect(() => {
        if (userDetails?.user?.addressProvided === false) {
            setIsDisplay(true)
        }
    }, [userDetails]);

    // listening user details changes
    useEffect(() => {
        if (userDetails?.user?.expiredFflStores && !userDetails.isStoreExpireAlertShown) {
            dispatch({ type: 'STORE_EXP_ALERT' });
            setExpireFFLStoreList(userDetails?.user?.expiredFflStores);
            showConfirmModal()
        }
    }, [userDetails]);

    // init component
    useEffect(() => {
        getModel()
        getManufacturer()
    }, [])

    return (
        <Layout title="Home" description="This is the Home page" >
            <div>
                <ProductBanner />
            </div>
            <div>
                <BuySellNav />
            </div>
            <div>
                <ProductsList view="New Arrivals" />
            </div>
            <div>
                <ProductsList view="Most Popular" />
            </div>
            {
                !userDetails?.user?.sid
                && !_.isEmpty(location?.position)
                && <div>
                    <ProductsList view="Mostly Viewed" />
                </div>
            }
            {
                userDetails?.user?.sid
                && <div>
                    <ProductsList view="Recently Viewed" />
                </div>
            }

            {
                isDisplay
                && <HomeAddressSettings
                    {...{
                        show: isDisplay,
                        setShow: setIsDisplay
                    }}
                />
            }
            {ConfirmationComponent}
        </Layout>
    );
}

export default Home;