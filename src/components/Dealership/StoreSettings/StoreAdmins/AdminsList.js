import React, {useContext, useState, useEffect} from 'react'
import { Dropdown } from 'react-bootstrap';
import { useConfirmationModal } from '../../../../commons/ConfirmationModal/ConfirmationModalHook';
import _ from 'lodash';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../../services/api.service';
import useToast from '../../../../commons/ToastHook';
const ICN_MORE = <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 18 18"><path d="M9 5.5c.83 0 1.5-.67 1.5-1.5S9.83 2.5 9 2.5 7.5 3.17 7.5 4 8.17 5.5 9 5.5zm0 2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S9.83 7.5 9 7.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>

const AdminsList = ({ lists, isDataLoaded }) => {
    const [adminList, setAdminList] = useState([lists]);
    const Toast = useToast();
    const spinner = useContext(Spinner);


    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <div className="flx pointer"
            href=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {children}
        </div>
    ));

     // show delete confirmation modal when user click on delete
     const [showConfirmModal, ConfirmationComponent] = useConfirmationModal({
        title: "Delete",
        body: "Are you sure, you want to delete?",
        onConfirm: (list) => {
            deleteAdmin(list.adminInfo, list.list);
        },
        onCancel: () => { }
    })

    const deleteAdmin = (adminInfo, list) => {
        try {
            spinner.show("Deleting... Please wait...");
            ApiService.deleteAdminList(adminInfo.admin.sid).then(
                response => {
                    let tmpArr = list.filter(l => l.admin.sid != adminInfo.admin.sid);
                    setAdminList(tmpArr);
                    Toast.success({ message: `${adminInfo?.admin?.firstName || ""} deleted successfully`, time: 3000 });
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data?.error || err.response?.data?.message || err.response?.data.status) : '', time: 3000 });
                    console.error("Error occurred in deleteListing--", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error("Error occurred in deleteListing--", err);
        }
    }

    useEffect(() => {
            setAdminList(lists);
    }, [lists]);

    return (<>
            {
                isDataLoaded && adminList.map((ad, index) => {
                    return <div className="myWishlistbox" key={index}>
                    <div className="row">
                        <div className="col-lg-12 col-6">
                            <div className="WishlistItem admins-list">
                                    <span className="float-right">
                                        <Dropdown>
                                            <Dropdown.Toggle as={CustomToggle} id="create-update-listing">
                                                {ICN_MORE}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => showConfirmModal({ "adminInfo": ad, "list": adminList })}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </span>
                                <div className="media">
                                    {!_.isEmpty(ad?.admin?.profileImageLocation) && <img src={ad.admin.profileImageLocation} className="img-fluid mr-4" alt="..." />}
                                    {_.isEmpty(ad?.admin?.profileImageLocation) && <img src="images/default-user-icon.jpeg" className="img-fluid mr-4" alt="..." />}
                                    <div className="media-body">
                                        <h5 className="mt-0">{ad?.admin?.firstName}</h5>
                                        <p>{ad?.admin?.email}</p>
                                        <p>{ad?.admin?.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                })
            }
            {
                isDataLoaded && !lists.length && <div class="gunt-error py-3 mt-2 bg-white">No Data Found</div>
            }
            {ConfirmationComponent}
        </>
    )
}
export default AdminsList