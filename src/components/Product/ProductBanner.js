import React, { useState, useEffect, useContext, memo } from 'react'
import Spinner from "rct-tpt-spnr";
import Carousel from 'react-bootstrap/Carousel';
import ApiService from "../../services/api.service";
import _ from 'lodash';
import { useHistory, Link } from 'react-router-dom';
import { useAuthState } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import useToast from '../../commons/ToastHook';

const ProductBanner = () => {
    const userDetails = useAuthState();
    const { location } = useContext(AppContext);
    const history = useHistory();
    const [index, setIndex] = useState(0);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const payload = {
                sort: 'CREATED',
                "exclAppuserId": userDetails.user.sid,
                "latitude": location?.position?.lat,
                "longitude": location?.position?.lng || location?.position?.lon,
                "distance": 1000,
                "distanceUnit": "ml"
            };
            spinner.show("Please wait...");
            ApiService.searchProducts(payload).then(
                response => {
                    setData(response.data.splice(0, 3));
                },
                err => {
                    if(err?.response?.status === 406 && err?.response?.data?.error === "Services are only available for United States locations.") {
                        history.replace("/page-not-found");
                    } else {
                        Toast.error({ message: err.response?.data ? err.response?.data?.error : 'Data loading error', time: 2000 });
                    }
                }
            ).finally(() => {
                spinner.hide();
                setIsLoading(false);
            });
        };
        fetchData();
    }, [location?.position?.lat]);

    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        if (!_.isEmpty(item.listingDetailsContent)) {
            const imagesByItem = JSON.parse(item.listingDetailsContent)[0];
            imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
        }
        return imageUrl;
    }

    return (
        <Carousel className="banner-carousel" activeIndex={index} onSelect={handleSelect}>
            {
                data.map((item, i) => {
                    return <Carousel.Item key={i}>
                        <div className="prod-banner-transp"></div>
                        <div className="prod-banner-container" style={{backgroundImage: `url(${getMyImage(item)})`}}></div>
                        <Carousel.Caption>
                            <h1>{item.title}</h1>
                            <Link to={{
                                        pathname: "/product/" + item.sid,
                                        state:  {
                                            breadcrumb: [{
                                                name: "Home",
                                                path: "/"
                                            },
                                            {
                                                name: item.title,
                                                path: `/product/${item.sid}`
                                            }
                                           ],
                                           itemInfo: item
                                        }
                                      }} class="banner-btn" onClick={()=>{}}>Shop Now</Link>
                        </Carousel.Caption>
                    </Carousel.Item>
                })
            }
        </Carousel>
    );
}
 
export default memo(ProductBanner);