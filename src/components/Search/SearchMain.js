import React, { useState, useEffect, useContext, useRef } from 'react';
import Spinner from "rct-tpt-spnr";
import _ from 'lodash';
import Layout from '../Layout';
import SearchItem from './SearchItem';
import Filter from './Filter';
import Sort from './Sort';
import ApiService from "../../services/api.service";
import Location from '../Shared/Location';
import { Link } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { useAuthState } from '../../contexts/AuthContext';
import Pagination from "../Shared/Pagination";
import Breadcrumb from '../Shared/breadcrumb';
import useToast from '../../commons/ToastHook';
import { ICN_SEARCH_NOT_FOUND } from '../icons';
import GLOBAL_CONSTANTS from '../../Constants/GlobalConstants';

const SearchMain = (props) => {
    let defaultFilterValues = GLOBAL_CONSTANTS.DATA.DEFAULT_FILTER_VALUE;
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [isModel, setIsModel] = useState(false);
    const { filterCategory, searchKeyword, location, setValueBy } = useContext(AppContext);
    const [filterValues, setFilterValues] = useState(defaultFilterValues);
    const [locationBy, setLocationBy] = useState(location);
    const [locationModel, setLocationModel] = useState(false)
    const [sortValues, setSortValues] = useState({ "sort": "REL" });
    const [modelViewBy, setModelViewBy] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [searchList, setSearchList] = useState([]);
    const [conditionList, setConditionList] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [viewAllList, setViewAllList] = useState(false);
    let componentRef = useRef({ isMount: false });

    // to close modal
    const handleClose = () => {
        setIsModel(false);
        setModelViewBy('');
    }

    // to open modal
    const handleShow = (view) => {
        setIsModel(true);
        setModelViewBy(view);
    }

    // construct payload
    const getMyPayload = (fValues, sValues) => {
        setSortValues(sValues);
        let payload = {
            "pageIndex": pageNo,
            "distance": GLOBAL_CONSTANTS.DEFAULT_DISTANCE,
            "latitude": _.toString(locationBy.position.lat),
            "longitude": _.toString(locationBy?.position?.lng || locationBy?.position?.lon),
            "distanceUnit": GLOBAL_CONSTANTS.DEFAULT_DISTANCE_UNIT,
            "resultCount": 10,
            "exclAppuserId": userDetails.user.sid,
            "priceRangeMin": fValues.priceRangeMin ? fValues.priceRangeMin : 0,
            "priceRangeMax": fValues.priceRangeMax ? fValues.priceRangeMax : 100000
        };
        payload = _.merge({}, payload, sValues);
        if (!_.isEmpty(filterCategory)) {
            payload.category = [filterCategory.sid];
        }
        if (!_.isEmpty(searchKeyword)) {
            payload.title = searchKeyword;
        }
        if (fValues) {
            if (fValues.category) {
                payload.category = [fValues.category];
            }
            if (!_.isEmpty(fValues.tcondition)) {
                payload.condition = fValues.tcondition;
            }
            if (fValues.manufacturer) {
                payload.manufacturer = [fValues.manufacturer];
            }
            if (fValues.model) {
                payload.model = [fValues.model];
            }
            if (fValues.barrelLength) {
                payload.barrelLength = [fValues.barrelLength];
            }
            if (fValues.caliber) {
                payload.caliber = [fValues.caliber];
            }
            if (fValues.capacity) {
                payload.capacity = [fValues.capacity];
            }
            if (fValues.frameFinish) {
                payload.frameFinish = [fValues.frameFinish];
            }
            if (fValues.grips) {
                payload.grips = [fValues.grips];
            }
            if (fValues.distance && !filterValues.nationwide) {
                payload.distance = fValues.distance;
            }
        }
        if (fValues.nationwide || viewAllList) {
            // delete payload.exclAppuserId;
            if (fValues.nationwide) payload.distance = GLOBAL_CONSTANTS.US_NATION_RADIUS
        }
        return payload;
    }

    /*
    * Get Condition List
    */
    const getConditionList = (args) => {
        ApiService.getListByArg(args).then(
            response => {
                setConditionList(response.data || []);
            },
            err => { }
        );
    }

    const initPagination = (payload) => {
        try {
            spinner.show("Please wait...");
            ApiService.filterListingCount(payload).then(
                response => {
                    setTotalCount(payload?.title && Array.isArray(response.data) ? response.data.length : response.data.count);
                    spinner.hide();
                },
                err => {
                    spinner.hide();
                    Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
                }
            );
        } catch (err) {
            console.error("Error occurred in initPagination--", err);
        }
    }

    const initFilterApi = (payload) => {
        if (_.isEmpty(locationBy.position)) {
            return;
        }
        localStorage.removeItem('buyfilter');
        spinner.show("Please wait...");
        ApiService.searchProducts(payload).then(
            response => {
                let data = response.data.map(r => ({
                    ...r,
                    "listingLocation": r.listingLocation ? JSON.parse(r.listingLocation) : null,
                    "fflStoreLocation": r.fflStoreLocation ? JSON.parse(r?.fflStoreLocation) : null
                }))
                setSearchList(data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            initPagination(payload);
            setIsDataLoaded(true);
            spinner.hide();
        });
    }

    const onSearch = (values) => {
        let payload;
        payload = getMyPayload(values, sortValues);
        initFilterApi(payload);
    }

    const onSort = (values) => {
        let payload;
        if (_.isArray(conditionList) && conditionList.length > 0) {
            payload = getMyPayload(filterValues, values);
            initFilterApi(payload);
        }
    }

    useEffect(() => {
        if (!componentRef.current.isMount && !filterValues) {
            componentRef.current.isMount = true;
            return;
        }
        if (searchKeyword) {
            setViewAllList(false);
        }
        onSearch(filterValues);
        window.scrollTo(0, 0);

    }, [filterCategory, filterValues, searchKeyword, viewAllList, locationBy, pageNo])

    useEffect(() => {
        if (!_.isEmpty(props?.location?.state?.filterVal))
            setFilterValues(props?.location?.state?.filterVal)
        else if (!_.isEmpty(localStorage.getItem('buyfilter'))) {
            setFilterValues(JSON.parse(localStorage.getItem('buyfilter')));
        }
    }, [props.location]);

    // init component
    useEffect(() => {
        if (_.isArray(conditionList) && conditionList.length <= 0) {
            getConditionList("t_condition");
        }
    }, []);

    return (
        <Layout title="Search Result" description="This is the search result page">
            <section id="search-pg-section">
                <div class="container">
                    <div class="row justify-content-start">
                        <div class="col-lg-3 mobile-off ">
                            <div class="left-sidebar">
                                {isDataLoaded && searchList.length === 0 ?
                                    <div className="filter-box-ctn">
                                        <h5>Location</h5>
                                        <p className="location-txt">{location && <span>{location.address.freeformAddress} </span>} <span className="des-location cp" onClick={() => setLocationModel(true)}>Change</span></p>
                                    </div> :
                                    <Filter {...{
                                        handleClose,
                                        filterValues,
                                        setFilterValues,
                                        setLocationBy,
                                        setPageNo,
                                        resetFilterValues: () => { setFilterValues(defaultFilterValues); setSortValues({}); }
                                    }} />
                                }
                            </div>
                        </div>
                        <div class="col-lg-9">

                            <Breadcrumb {...{
                                data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb])
                                    || [
                                        {
                                            name: "Home",
                                            path: "/"
                                        },
                                        {
                                            name: "Guns & Firearms",
                                        }
                                    ]
                            }} />
                            <div className="container">
                                <div class="row justify-content-between aic mb15">
                                    <div class="col-md-6 col-6">
                                        <div class="searchresult-txt elps">
                                            <span>{totalCount}</span> results
                                            {searchKeyword && <span>&nbsp; for "{searchKeyword}"</span>}
                                        </div>
                                    </div>
                                    {isDataLoaded && searchList.length === 0 ||
                                        <div class="col-md-4 col-6">
                                            <div class="short-box-mobile desktop-off cd-main-nav__list js-signin-modal-trigger">
                                                <a class="pro-filterIcon" data-signin="filterBox" onClick={() => handleShow('filter')}>Filter</a>
                                                <a class="pro-shortIcon" data-signin="shortBox" onClick={() => handleShow('sort')}>Sort</a>
                                            </div>

                                            <div class="short-box-mobile mobile-off cd-main-nav__list js-signin-modal-trigger text-right aic float-right">
                                                <div className="mr20 sort-label mobile-off">Sort</div>
                                                <select
                                                    onChange={(e) => { onSort({ "sort": e.target.value }) }}
                                                    className="form-control form-control-sm sort-select mobile-off"
                                                    value={sortValues.sort}
                                                >
                                                    <option value="REL" defaultValue={sortValues.sort} id="Relevance">Most Relevant</option>
                                                    <option value="CREATED" defaultValue={sortValues.sort} id="Newly Listed">Newly Listed</option>
                                                    <option value="PRICE_ASC" defaultValue={sortValues.sort} id="Lowest Price">Buy Now: Low to High</option>
                                                    <option value="PRICE_DESC" defaultValue={sortValues.sort} id="Highest Price">Buy Now: High to Low</option>
                                                </select>
                                            </div>


                                        </div>
                                    }
                                </div>
                                {isDataLoaded && searchList.length > 0 &&
                                    <div class="row no-gutters">
                                        {
                                            isDataLoaded && searchList.map((list, index) => {
                                                return <div class="col-lg-12 col-6" key={index}>
                                                    <Link
                                                        to={{
                                                            pathname: `/product/${list.sid}`,
                                                            state: {
                                                                breadcrumb: props?.location?.state?.breadcrumb?.[0].name === "Home"
                                                                    ? [
                                                                        ...(props?.location?.state?.breadcrumb ? props?.location?.state?.breadcrumb : []),
                                                                        {
                                                                            name: list.title,
                                                                            path: `/product/${list.sid}`,
                                                                            data: list
                                                                        }]
                                                                    : [{
                                                                        name: "Home",
                                                                        path: "/"
                                                                    },
                                                                    {
                                                                        name: list.title,
                                                                        path: `/product/${list.sid}`,
                                                                        data: list
                                                                    }]
                                                            }
                                                        }}><SearchItem product={list} /></Link>
                                                </div>
                                            })
                                        }

                                    </div>
                                }
                                {
                                    isDataLoaded && !searchList.length &&
                                    <div className="searchNotFound">
                                        <div><ICN_SEARCH_NOT_FOUND /></div>
                                        <div className="text-center flx">
                                            <div className="search-fd">Sorry, no result found!</div>
                                        </div>
                                        <div className="gunt-error p-0">Please Check your spelling or
                                            <span className="link pointer text-decoration-underline">
                                                <div onClick={() => {
                                                    setPageNo(0);
                                                    setValueBy('SET_KEYWOARD', '');
                                                    setViewAllList(true);
                                                    setFilterValues({
                                                        ...defaultFilterValues,
                                                        "distance": GLOBAL_CONSTANTS.US_NATION_RADIUS,
                                                        "nationwide": true
                                                    })
                                                }}>View all listings</div>
                                            </span>
                                        </div>
                                    </div>
                                }
                                {
                                    isDataLoaded
                                    && searchList.length > 0 && <div class="text-center jcc">
                                        <Pagination {...{
                                            pageCount: 10,
                                            totalCount,
                                            onNavigate: (pn) => {
                                                setPageNo(pn)
                                            }
                                        }} />
                                    </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
                {isModel &&
                    <div className={`cd-signin-modal js-signin-modal ${modelViewBy}`}>
                        <div className={`cd-signin-modal__container ${modelViewBy}`}>
                            {modelViewBy === "filter" && <Filter {...{
                                handleClose,
                                setPageNo,
                                filterValues,
                                setFilterValues,
                                setLocationBy,
                                resetFilterValues: () => { setFilterValues(defaultFilterValues); setSortValues({}); }
                            }} />}
                            {modelViewBy === "sort" && <Sort {...{
                                handleClose,
                                onSort,
                                sortValues,
                                resetSortValues: () => setSortValues({})
                            }} />}
                        </div>
                    </div>
                }
            </section>
            {
                locationModel
                && <Location {...{ locationModel, setLocationModel, setLocationBy }} />
            }
        </Layout>
    );
}

export default SearchMain;