import React, { useEffect, useState, useContext } from 'react';
import Spinner from "rct-tpt-spnr";
import _ from 'lodash';
import ApiService from '../../../../services/api.service';
import AdminsList from './AdminsList';
import useToast from '../../../../commons/ToastHook';


const StoreAdmins = ({storeId, isReload}) => {
    const [lists, setLists] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const initAdminsList = () => {
        try {
            spinner.show("Please wait...");
            ApiService.getAdminsByStore(storeId).then(
                response => {
                    setLists(_.orderBy(response.data, 'createdOn', 'desc'));
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000});
                }
            ).finally(() => {
                spinner.hide();
                setIsDataLoaded(true);
            });
        } catch (err) {
            console.error('error occur on getAllReceived()', err)
        }
    }

    useEffect(() => {
        initAdminsList();
    }, [isReload]);

    return (<>
        <div class="container">
            <div class="row justify-content-start  border-top pt-4">
                <div class="col-lg-12">
                    <AdminsList {...{ lists, isDataLoaded }} />
                </div>
            </div>
        </div>
    </>)

}

export default StoreAdmins;


