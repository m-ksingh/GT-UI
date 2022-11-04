import React, { useEffect, useState, useContext, memo, Fragment } from 'react';
import Spinner from "rct-tpt-spnr";
import ApiService from '../../../services/api.service';
import { useAuthState } from '../../../contexts/AuthContext/context';
import { Button, InputGroup } from 'react-bootstrap';
import useToast from '../../../commons/ToastHook';
import _ from 'lodash';
import CustomDropdown from '../../Shared/CustomDropdown/CustomDropdown';
import { ICN_CLOSE_RED, ICN_SEARCH } from '../../icons';
import moment from 'moment';
import { NOTIFICATION_CONSTANTS } from '../Notification/Constants/NotificationConstants';
import TrancationLineItem from './TrancationLineItem';
import Pagination from '../../Shared/Pagination';
import { AppContext } from '../../../contexts/AppContext';
import './MyTransactions.css';

const MyTransactions = () => {
    const userDetails = useAuthState();
    const Toast = useToast();
    const spinner = useContext(Spinner);
    let { updateMyTransactionAt, setUpdateNotificationAt } = useContext(AppContext);
    const [transactions, setTransactions] = useState([]);
    const [filterBy, setFilterBy] = useState(NOTIFICATION_CONSTANTS.FILTER_BY.ALL);
    const [searchBy, setSearchBy] = useState("");
    const [selectedListingType, setSelectedListingType] = useState(NOTIFICATION_CONSTANTS.LISTING_TYPE_LIST);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Fetching transactions... Please wait...");
    const [pageNo, setPageNo] = useState(1);
    const [totalCount, setTotalCount] = useState(null);
    const pageSize = selectedListingType.length > 1 ? 2 : 5;
    
    // populating transactions    
    const getMyTransactions = (fetchType="get") => {
        if(fetchType === "search" && _.isEmpty(searchBy.replace(/\s+/g, ' ').trim())) {
            return; 
        }
        setLoadingMessage(`${fetchType === "search" ? "Searching " : "Fetching "} transactions... Please wait...`);
        setIsLoading(true);
        try {
            let listOrdersByMonthly = [];
            let payload = fetchType === "search" ? {
                "appUsersSid": userDetails.user.sid,
                "searchText": searchBy.replace(/\s+/g, ' ').trim()
            } : {
                "appUsersSid": userDetails.user.sid,
                "filterBy": filterBy === NOTIFICATION_CONSTANTS.FILTER_BY.ALL ? [NOTIFICATION_CONSTANTS.FILTER_BY.PURCHASE, NOTIFICATION_CONSTANTS.FILTER_BY.SALE, NOTIFICATION_CONSTANTS.FILTER_BY.EXPIRED] : [filterBy],
                "listingType": selectedListingType.map(r => r.value),
                "pageNo": pageNo,
                "pageSize": pageSize
            };
            let method = fetchType === "search" ? ApiService.searchTransaction : ApiService.getMyTransactions;
            method(payload).then(response => {
                let consolidateList = [];
                if(response.data.paginationTo.totalCount) setTotalCount(response.data.paginationTo.totalCount);
                response.data.myTransactions.map(list => consolidateList.push(...list));
                consolidateList = consolidateList.map(r => ({...r, "notificationJson": r.notificationJson ? JSON.parse(r.notificationJson) : null}));
                // grouping orders by month 
                listOrdersByMonthly = _.chain(consolidateList).orderBy(da => {
                    return (da.placedOn || da.postedOn);
                }, 'desc').groupBy(r => {
                    return moment(r.placedOn || r.postedOn).format("MMMM YYYY");
                }).map((orders, month) => {
                    return {
                        orders,
                        month
                    }
                }).value();
                // console.log(listOrdersByMonthly);
                setTransactions(listOrdersByMonthly);
                setIsLoading(false);
            }).catch((err) => {
                setIsLoading(false);
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'Please try after sometime', time: 2000});
            })
        } catch (err) {
            setIsLoading(false);
            console.error('error occur on getMyTransactions--', err)
        }
    }

    useEffect(() => {
        if(searchBy === "")
        getMyTransactions();
    }, [searchBy])

    useEffect(() => {
        if(searchBy) {
            setSearchBy("");
            return;
        }
        getMyTransactions();
    }, [filterBy, selectedListingType, pageNo, updateMyTransactionAt])
    // console.log(transactions)

    return <div className="trn-main bc-white py20">
            <div className="trn-main-title">
                <div className="jcb aic mx20 bb-ddd pb20 row gp20">
                    <div className="f16 fw600">My Transactions</div>
                    <div className="trn-search-inp">
                        <InputGroup className="p-rel">
                            <input
                                size="40"
                                type="text"
                                className="form-control form-control-sm trn-main-search-inp"
                                placeholder="Search Orders..."
                                value={searchBy}
                                onChange={(e) => {setSearchBy(e.target.value)}}
                                onKeyDown={(e) => {(e.which || e.keyCode) === 13 && e.target.value.replace(/\s+/g, ' ').trim() && getMyTransactions("search")}}
                            />
                            <InputGroup.Append className="top-search-icon">
                                <Button
                                    id="trn-main-search-btn"
                                    variant="outlined"
                                    onClick={() => {
                                        if (searchBy) {
                                            getMyTransactions("search");
                                        }
                                    }}
                                    className="btn-sm theme-bg"
                                >
                                    <ICN_SEARCH />
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                        {
                            searchBy && <div className="trn-search-icn-close" onClick={() => setSearchBy("")}>{<ICN_CLOSE_RED />}</div>
                        }
                    </div>
                </div>
            </div>
            <div className="trn-action p20 mt20 pt20">
                <div className="row pl15 gp10 mt20">
                    <div className="aic mr20">
                        <div className="trn-action-lbl flx1">Filter By </div>
                        <select
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="form-control form-control-sm flx2 trn-action-filter-by"
                            value={filterBy}
                        >
                            {
                                NOTIFICATION_CONSTANTS.FILTER_LIST.map((r, i) => <option key={i} value={r.value} id={r.value}>{r.label}</option>)
                            }
                        </select>
                    </div>
                    <div className="aic">
                        <div className="trn-action-lbl flx1 mr10">Listing Type </div>
                        <CustomDropdown {...{
                            data: NOTIFICATION_CONSTANTS.LISTING_TYPE_LIST,
                            bindKey: "label",
                            searchKeywords: "",
                            onSelect: (data) => {
                                pageNo > 1 && setPageNo(1);
                                setSelectedListingType(data);
                            },
                            title: `${(selectedListingType.length === NOTIFICATION_CONSTANTS.LISTING_TYPE_LIST.length && "All") || selectedListingType.map(r => r.label).join(", ") || 'Select listing type'}`,
                            selectedValues: selectedListingType,
                            selectedValueKey: "value",
                            multiSelect: true
                        }} />
                    </div>
                </div>
            </div>

            <div className="p20">
                {isLoading ? spinner.show(loadingMessage) : spinner.hide()}
                {
                    _.isEmpty(transactions) && <div className="py20 text-center c777">No Transactions Found</div>
                }
                {
                    !_.isEmpty(transactions)
                    && transactions.map((trnsList, i) => <Fragment key={i}>
                        {
                            !_.isEmpty(trnsList.orders)
                            && trnsList.orders.map((trnsItem, idx) => <Fragment key={idx}>
                                <TrancationLineItem {...{
                                    trnsItem, 
                                    onSuccess: () => {
                                        setUpdateNotificationAt(new Date());
                                        getMyTransactions();
                                    }
                                }}/>
                            </Fragment>)
                        }
                    </Fragment>)
                }
                {
                    transactions.length > 0 
                    && totalCount
                    && <div class="text-center jcc">
                        <Pagination {...{
                            pageCount: 10,
                            totalCount,
                            onNavigate: (pn) => {
                                window.scrollTo(0, 0);
                                setPageNo(pn)
                            }
                        }} />
                    </div>
                }
               
            </div>
    </div>;
}
 
export default memo(MyTransactions);