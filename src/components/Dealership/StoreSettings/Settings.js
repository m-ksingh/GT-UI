import React, { useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import StoreBasicInfo from './StoreBasicInfo';
import StoreBusinessInfo from './StoreBusinessInfo';
import StoreAdmins from './StoreAdmins/StoreAdmins';
import AddAdmin from './StoreAdmins/AddAdmin';
import { PlusCircleIcon } from "../../icons";

const StoreSettings = ({storeId, storeViewBy, setStoreViewBy}) => {
    const [isReload, setIsReload] = useState(null);
    const setStoreView = (type) => {
        let viewInfo;
        if (type === 'basic') {
            viewInfo = {
                view: 'basic',
                title: 'Basic Info'
            }
        } else if(type === 'business') {
            viewInfo = {
                view: 'business',
                title: 'Business Info'
            }
        } else if(type === 'admin') {
            viewInfo = {
                view: 'admin',
                title: 'Store Admin(s)'
            }
        }
        setStoreViewBy(viewInfo);
    }

    const [isAddAdminModel, setIsAddAdminModel] = useState(false);

    const adminModelAction = (action, isReload) => {
        setIsAddAdminModel(action);
        if (isReload) {
            setIsReload(new Date().getTime())
        }
    }

    return (<>
        <div class="container">
            <div className="flx flx-center">
                <div className="flx1 mr-4">
                    { storeViewBy.view !== 'admin' &&  <h4 className="card-title-header store-titles">Store Settings</h4> }
                    { storeViewBy.view === 'admin' && <h4 className="card-title-header store-titles">Store Admin(s)</h4> }
                </div>
                {
                    storeViewBy.view === 'admin' &&
                    <div className="flx1 text-right">
                        <span className="action-link mt5" onClick={setIsAddAdminModel}>
                            <PlusCircleIcon width={"20px"} /> New Admin
                        </span>
                    </div>
                }
            </div>
            {
                _.isEmpty(storeViewBy.view) && <div calss="row justify-content-start">
                    <ul class="mb-side-menu store-settings-menu">
                        <li onClick={() => setStoreView('basic')}><i class="store-setting-icons basic-info-icon"></i><span>Basic Info</span></li>
                        <li onClick={() => setStoreView('business')}><i class="store-setting-icons business-info-icon"></i><span>Business Info</span></li>
                        <li onClick={() => setStoreView('admin')}><i class="store-setting-icons store-admin-icon"></i><span>Store Admin(s)</span></li>
                    </ul>
                </div>
            }
            {
                storeViewBy.view === 'basic' && <StoreBasicInfo {...{ setStoreViewBy, storeId }}/>
            }
            {
                storeViewBy.view === 'business' && <StoreBusinessInfo {...{ storeId, setStoreViewBy }} />
            }
            {
                storeViewBy.view === 'admin' && <StoreAdmins {...{ storeId, setStoreViewBy, isReload }} />
            }
            { isAddAdminModel && 
                <div className="cd-signin-modal js-signin-modal add-admin">
                    <div className="cd-signin-modal__container add-admin">
                        <AddAdmin {...{adminModelAction, storeId}} />
                    </div>
                </div>
            }
        </div>
    </>)

}

export default StoreSettings;


