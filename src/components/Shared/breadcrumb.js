import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import ApiService from "../../services/api.service";
import useToast from '../../commons/ToastHook';
import Spinner from "rct-tpt-spnr";
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';

const Breadcrumb = ({
    data = [],
}) => {
    const { viewId, productId, storeId} = useParams();
    const location = useLocation();
    const [breadcrumb, setBreadcrumb] = useState(data);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [productName, setProductName] = useState("")

    useEffect(() => {
        try {
            if (data.length != 0)
                setBreadcrumb(data);
            else {
                switch (viewId || (productId && productName && location.pathname) || location.pathname || storeId) {
                    case "/buyfilter":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "Buy",
                            path: "/buyfilter"
                        }])
                        break;
                    case "/create-listing":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "Create Listing",
                            path: "/create-listing"
                        }])
                        break;
                    case "edit-listing":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Listing",
                            path: "/profile/mylisting"
                        },
                        {
                            name: "Edit Listing",
                            path: "/edit-listing"
                        }
                        ])
                        break;
                    case "/getservice":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "Get Service",
                            path: "/getservice"
                        }])
                        break;
                    case `/product/${productId}`:
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: `${productName?.title ?? ""}`,
                            path: `/product/${productId}`
                        }])
                        break;
                        case `${storeId}`:
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Stores",
                            path: "/store/mystores"
                        },
                        {
                            name: "New Store",
                            path: `/store/onboard/${storeId}`
                        }
                        ])
                        break;
                    case "myaccount":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Account",
                            path: "/profile/myaccount"
                        }])
                        break;
                    case "mywishlist":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Wishlist",
                            path: "/profile/mywishlist"
                        }])
                        break;
                    case "mytransactions":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Transactions",
                            path: "/profile/mytransactions"
                        }])
                        break;
                    case "myorders":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Orders",
                            path: "/profile/myorders"
                        }])
                        break;
                    case "MySales":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Sales",
                            path: "/profile/MySales"
                        }])
                        break;
                    case "mylisting":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Listings",
                            path: "/profile/mylisting"
                        }])
                        break;
                    case "mybid":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Bids",
                            path: "/profile/mybid"
                        }])
                        break;
                    case "mytrade":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "Trade Offers",
                            path: "/profile/mytrade"
                        }])
                        break;
                    case "myschedules":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Schedules",
                            path: "/profile/myschedules"
                        }])
                        break;
                    case "dashboard":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "Dashboard",
                            path: "/store/dashboard"
                        }])
                        break;
                    case "mystores":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Stores",
                            path: "/store/mystores"
                        }])
                        break;
                    case "reports":
                        setBreadcrumb([{
                            name: "Home",
                            path: "/"
                        },
                        {
                            name: "My Stores",
                            path: "store/reports"
                        }])
                        break;
                }
            }
        } catch (err) {
        }
    }, [data, productName])

    useEffect(() => {
        try {
            let payload = {
                "listingSid": productId,
                "latitude": location?.position?.lat,
                "longitude": location?.position?.lng || location?.position?.lon,
                "distance": GLOBAL_CONSTANTS.US_NATION_RADIUS,
                "distanceUnit": "ml"
            }
            productId && ApiService.productDetail(payload).then(
                response => {
                    setProductName(response.data);
                },
                err => {
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            console.error("Error occurred in getProductDetails--", err);
        }
    }, [productId])
    return (
        <section id="breadcrumb-section">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <ul class="breadcrumb">
                            {
                                (breadcrumb?.length
                                    && breadcrumb.map((item, idx) => ((breadcrumb.length === (idx + 1) && <li key={idx}>{item.name}</li>)
                                        || <li key={idx}>
                                            <Link to={{
                                                pathname: `${item.path}`,
                                                state: {
                                                    breadcrumb: (() => {
                                                        let temp = [...breadcrumb]
                                                        temp.splice(idx + 1)
                                                        return temp;
                                                    })()
                                                }
                                            }}>
                                                {item.name}</Link>
                                        </li>)))
                                || ""
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Breadcrumb;