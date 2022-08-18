import React, { useContext, useState, useEffect, memo } from 'react'
import * as Yup from 'yup';
import _, { isNumber } from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import Spinner from "rct-tpt-spnr";
import ApiService from "../../../services/api.service";
import { useAuthState } from '../../../contexts/AuthContext/context';
import { goToTopOfWindow } from '../../../commons/utils';
import { AppContext } from '../../../contexts/AppContext';
import ChooseListing from '../../Shared/ChooseListing';
import { extractCategoryList, getSelectedCategoryTitleBySid, getSelectedOptionBySid } from "../../../services/CommonServices";
import NoImg from '../../../assets/images/no-image-available.png'
import { IcnTrashRed, PlusCircleIcon, ICN_MORE, ICN_PRIMARY_LG } from '../../icons';
import useToast from '../../../commons/ToastHook';
import MatchValueView from './MatchValueView';
import { Link, useHistory } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useConfirmationModal } from '../../../commons/ConfirmationModal/ConfirmationModalHook';
import ViewListInfo from './ViewListInfo';
import ViewSpecificaTradeInfo from './ViewSpecificaTradeInfo';
// owl-carousel
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

let selectedListing = {};
let selectedListingDetails = {};
let selectedListingImages = [];

const DetailsFormView = ({ 
    orderBy, 
    setTab, 
    product, 
    tradePriceWith, 
    setTradePriceWith, 
    valueToMatch, 
    setValueToMatch, 
    tab, 
    tabWiseData,
    defaultDetailsValues,
}) => {
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const userDetails = useAuthState();
    const history = useHistory();
    const { location } = useContext(AppContext);
    const [imgData, setImgData] = useState(null)
    const [initialValues, setInitialValues] = useState((!_.isEmpty(selectedListing) && selectedListing) || defaultDetailsValues);
    const [viewListing, setViewListing] = useState(false);
    const [viewListingInfo, setViewListingInfo] = useState({});
    const [viewSpecificTrade, setViewSpecificTrade] = useState(false);
    const [listing, setListing] = useState([]);
    const [, forceRender] = useState();
    const [myLists, setMyList] = useState([]);
    const {setMyListings} = useContext(AppContext);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

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
        title: "Remove",
        body: "Are you sure, you want to remove from list?",
        onConfirm: (sid) => {
            removeListing(sid);
        },
        onCancel: () => { }
    })
    const removeListing = (sid) => {
        try{
            let tmpArr = [...tabWiseData.tradeListItems];
            tmpArr = tmpArr.filter(r => r.sid !== sid);
            if(_.isEmpty(tmpArr)) {
                setFiles([]);
            }
            tabWiseData.tradeListItems = tmpArr;

            // making available this deleted listing for others
            toggleListing([{"sid": sid}], false);
        } catch (err) {
            console.error("Error occurred in removeListing--", err);
        }
    }

    const schema = Yup.object().shape({
        title: Yup.string()
            .matches(("^(?!.*<[0-9a-zA-Z_]+>)"), "HTML tag is not allow")
            .max(100, "100 Characters Maximum")
            .required("Required!"),
        tcondition: Yup.string()
            .required("Required!"),
        manufacturer: Yup.string()
            .required("Required!"),
        model: Yup.string()
            .required("Required!"),
        caliber: Yup.string().required("Required!"),
        barrelLength: Yup.string().required("Required!"),
        capacity: Yup.string().required("Required!"),
        frameFinish: Yup.string().required("Required!"),
        grips: Yup.string().required("Required!"),
        price: Yup.number().required("Required!")
    });

    const [listOfCategory, setListOfCategory] = useState([]);
    const [listOfCategoryByFlatten, setListOfCategoryByFlatten] = useState([]);
    const [listOfCondition, setListOfCondition] = useState([]);
    const [listOfManufacturer, setListOfManufacturer] = useState([]);
    const [listOfModel, setListOfModel] = useState([]);
    const [listOfCaliber, setListOfCaliber] = useState([]);
    const [listOfBarrelLength, setListOfBarrelLength] = useState([]);
    const [listOfCapacity, setListOfCapacity] = useState([]);
    const [listOfFrameFinish, setListOfFrameFinish] = useState([]);
    const [listOfGrips, setListOfGrips] = useState([]);
    const [listingModel, setListingModel] = useState(false);
    const [fileError, setFileError] = useState(false)


    const setListByArgs = (args, dataset) => {
        switch (args) {
            case 'category':
                setListOfCategory(dataset);
                break;
            case 't_condition':
                setListOfCondition(dataset);
                break;
            case 'manufacturer':
                setListOfManufacturer(dataset);
                break;
            case 'model':
                setListOfModel(dataset);
                break;
            case 'caliber':
                setListOfCaliber(dataset);
                break;
            case 'barrel_length':
                setListOfBarrelLength(dataset);
                break;
            case 'capacity':
                setListOfCapacity(dataset);
                break;
            case 'frame_finish':
                setListOfFrameFinish(dataset);
                break;
            case 'grips':
                setListOfGrips(dataset);
                break;
            default:
                console.log('Nothing Matched!');
        }
    }
    const getDataByArgs = (args) => {
        ApiService.getListByArg(args).then(
            response => {
                setListByArgs(args, response.data || []);
            },
            err => { }
        );
    }
    const getCategoriesByFlatten = (list) => {
        const results = [];
        function rec(list) {
            _.each(list, (d, index) => {
                results.push(d);
                if (d.childCategory && d.childCategory.length) {
                    rec(d.childCategory);
                }
            });
        }
        rec(list);
        return results;
    }
    const getCategoryData = (args) => {
        ApiService.getCategories(args).then(
            response => {
                setListOfCategory(extractCategoryList(response.data || []));
                setListOfCategoryByFlatten(getCategoriesByFlatten((_.cloneDeep(response.data) || [])));
            },
            err => { }
        );
    }
    // useEffect(() => {
    //     getCategoryData('category');
    //     getDataByArgs('t_condition');
    //     getDataByArgs('manufacturer');
    //     getDataByArgs('model');
    //     getDataByArgs('caliber');
    //     getDataByArgs('barrel_length');
    //     getDataByArgs('capacity');
    //     getDataByArgs('frame_finish');
    //     getDataByArgs('grips');
    // }, []);
    const [files, setFiles] = useState((!_.isEmpty(selectedListingImages) && selectedListingImages) || []);

    const initImageUpload = () => {
        $('.upload-input:visible').trigger('click');
    }

    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, (file, index) => {
            return {
                fileName: file.data,
                mediaType: "images",
                order: index
            };
        });
        const filesList = _.concat(files, uploadedFiles);
        setFiles(filesList);
    }

    // this method call to delete image
    const deleteImage = (index) => {
        try {
            setFiles(files.filter((r, i) => i !== index));
        } catch (err) {
            console.error("Error occur when deleteImage--", err);
        }
    }

    function uploadFiles(e) {
        // Create an object of formData
        let formData;
        const fileValue = e.target.files[0]?.size / (1024 * 1024)
        const listOfFiles = [];
        if (fileValue > 40) {
            setFileError(true)
            return;
        }
        _.each(e.target.files, file => {
            formData = new FormData();
            formData.append('file', file);
            listOfFiles.push(ApiService.uploadMultiPart(formData))
        })
        spinner.show("Please wait...");
        axios.all(listOfFiles).then(
            response => {
                setMultiFilesToDisplay(response);
                setImgData(e.target.files[0])
                setFileError(false)

            },
            err => {
                console.log(err);
                setFileError(false)
            }
        ).finally(() => {
            spinner.hide();
            e.target.value = null;
        });
        // Send formData object
    }

    function getMyPayload(values, images) {
        // const imagesList = images.map((img, index) => {
        //     return {
        //         fileName: img,
        //         mediaType: "images",
        //         order: index
        //     };
        // })
        return {
            "appUser": {
                "sid": userDetails.user.sid
            },
            "auction": true,
            "auctionReservePrice": 0,
            "availableOtherLocation": true,
            "barrelLength": {
                "sid": values.barrelLength
            },
            "caliber": {
                "sid": values.caliber
            },
            "capacity": {
                "sid": values.capacity
            },
            "tcondition": {
                "sid": values.tcondition
            },
            "category": {
                "sid": values.category
            },
            "consentProvided": true,
            "description": '',
            "estimatedPrice": '',
            "frameFinish": {
                "sid": values.frameFinish
            },
            "grips": {
                "sid": values.grips
            },
            "deliveryType": "BOTH",
            "latitude": location.position.lat,
            "listingDetailsStatus": "ACTIVE",
            "listingType": "INDIVIDUAL",
            "listing_details_content": JSON.stringify(images),
            "longitude": location?.position?.lng || location?.position?.lon,
            "manufacturer": {
                "sid": values.manufacturer
            },
            "model": {
                "sid": values.model
            },
            "sell": true,
            "sellPrice": values.price,
            "title": values.title,
            "trade": true,
            "tradeReservePrice": 0,
            "trade_with_listing_type": "{\"key\": \"value-1\"}",
            "auctionExpireOn": new Date().getTime(),
            "tradeExpiresOn": new Date().getTime(),
            "sellExpiresOn": new Date().getTime(),
            "postedOn": new Date().getTime(),
            "currency": {
                "sid": "D1D8095EA2E1A99939F0B6E2CF29F49800000000000000000000000000000000"
            },
            "offeredATrade": false
        };
    }

    const handleSetListingValues = (values, images, selectedListingInfo) => {
        selectedListing = values;
        selectedListingDetails = selectedListingInfo;
        setInitialValues(values);
        if (_.isArray(images) && images.length) {
            setFiles(images);
        } else {
            setFiles([]);
        }
    }

    const postItem = (values) => {
        if (selectedListingDetails && selectedListingDetails.sid) {
            onNextStep(selectedListingDetails);
            return;
        }
        const payload = getMyPayload(values, files);
        spinner.show("Please wait...");
        ApiService.createListing(payload).then(
            response => {
                onNextStep(response.data);
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.message || err.response.data.error || err.response.data.status) : 'Internal server error! Please try after sometime.', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    const handleSelectQuantity = (selectedCountVal, index) => {
        try {
            let tmpArr = [...tabWiseData.tradeListItems]
            tmpArr[index].selectedQuantity = Number(selectedCountVal);
            tabWiseData.tradeListItems = tmpArr;
            forceRender(Date.now());
        } catch (err) {
            console.error("Error occurred while handleSelectQuantity--", err);
        }
    }

    // const handleChangeByChange = (values) => {
    //     setTradePriceWith(values.price);
    // }

    const initSpecificTrade = () => {
        if (product && product.trade_with_listing_type) {
            if (_.isString(product.trade_with_listing_type)) {
                product.trade_with_listing_type = JSON.parse(product.trade_with_listing_type);
            }
            const values = {
                // title: "product.trade_with_listing_type.title",
                // category: product.trade_with_listing_type.category ? product.trade_with_listing_type.category.sid : '',
                // tcondition: product.trade_with_listing_type.tcondition ? product.trade_with_listing_type.tcondition.sid : '',
                // manufacturer: product.trade_with_listing_type.manufacturer ? product.trade_with_listing_type.manufacturer.sid : '',
                // model: product.trade_with_listing_type.model ? product.trade_with_listing_type.model.sid : '',
                // caliber: product.trade_with_listing_type.caliber ? product.trade_with_listing_type.caliber.sid : '',
                // barrelLength: product.trade_with_listing_type.barrelLength ? product.trade_with_listing_type.barrelLength.sid : '',
                // capacity: product.trade_with_listing_type.capacity ? product.trade_with_listing_type.capacity.sid : '',
                // frameFinish: product.trade_with_listing_type.frameFinish ? product.trade_with_listing_type.frameFinish.sid : '',
                // price: product.trade_with_listing_type.sellPrice,
                // grips: product.trade_with_listing_type.grips ? product.trade_with_listing_type.grips.sid : ''

                ...defaultDetailsValues,
                ...product.trade_with_listing_type
            };
            // const images = JSON.parse(product.trade_with_listing_type.listing_details_content);
            handleSetListingValues(values, [], product.trade_with_listing_type);
        }
    }

    useEffect(() => {
        initSpecificTrade();
    }, [product.trade_with_listing_type]);

    useEffect(() => {
        return () => {
            selectedListing = {};
            selectedListingDetails = {};
            selectedListingImages = [];
        };
    }, []);

    const onNextStep = () => {
        tabWiseData.details = tabWiseData.tradeListItems[0];
        tabWiseData.isTradePlaced = false;
        $('#payment').addClass('active');
        setTab('payment');
        goToTopOfWindow();
    }
    
    // toggle listing
    const toggleListing = (list = [], disable = true) => {
        spinner.show("Please wait...");
        let payload = {
            "listingSids": list.map(r => r.sid),
            "toggle": disable
        };
        ApiService.isOfferedForTrade(payload).then(
            response => { },
            err => { }
        ).finally(() => {
            spinner.hide();
        });
    }

    const cancelAction = () => {
        if(tabWiseData.tradeListItems && tabWiseData.tradeListItems.length > 0) toggleListing(tabWiseData.tradeListItems, false);
        tabWiseData.tradeListItems = [];
        history.replace('/');
        goToTopOfWindow();
    }

    const getLevelOption = (list, level) => {
        return <>
            {level === 0 && <option class={`level_${level}`} key={list.sid} value={list.sid} disabled>{list.name}</option>}
            {level === 1 && <option class={`level_${level}`} key={list.sid} value={list.sid} disabled={list.childCategory.length}>&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {level === 2 && <option class={`level_${level}`} key={list.sid} value={list.sid}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{list.name}</option>}
            {list.childCategory && list.childCategory.length && categoryOptionList(list.childCategory, ++level)}
        </>
    }

    const categoryOptionList = (categorylist, level) => <>
        {categorylist.map((list, index) => {
            return getLevelOption(list, level)
        })}
    </>;

const [showConfirmModalDelete, ConfirmationComponentDelete] = useConfirmationModal({
    title: "Delete",
    body: "Are you sure, you want to delete?",
    
    onConfirm: (res) => {
        deleteListing(res.sid, res.title, res.list);
    },
    onCancel: () => { }
})

const deleteListing = (sid, title, list) => {
    
    try {
        spinner.show("Deleting... Please wait...");
        ApiService.deleteListing(sid).then(
            response => {
                let tmpArr = list.filter(l => l.sid != sid);
                removeListing(sid);
                setMyList(tmpArr);
               setMyListings(tmpArr);
               //setListing(tmpArr);
                Toast.success({ message: `${title} deleted successfully`, time: 2000 });
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data?.message || err.response?.data?.error || err.response?.data.status) : '' , time: 3000});
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

const handleEditNavigation = (res) => {
    try {
        history.push({
            pathname: '/edit-listing',
            state: {
                breadcrumb: [
                ...(history?.location?.state?.breadcrumb ? history?.location?.state?.breadcrumb : []),
                {
                    name: "Edit Listing",
                    path: "/edit-listing"
                }],
                isFromTrade: true,
                currentListing: res,
                product: product,
                isEditFromTrade: true,
                tradeListItems: tabWiseData.tradeListItems ? tabWiseData.tradeListItems : []
            }
        });
    } catch (err) {
        console.error("Error occurred whilw navigate", err);
    }
}

const validateEditListing = (res) => {
    try {
        spinner.show("Please wait...");
        ApiService.validateEditListing(res.sid).then(
            response => {
                handleEditNavigation(res);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data?.message || err.response?.data?.error || err.response?.data.status) : '' , time: 3000});
                console.error("Error occurred in validateEditListing--", err);
            }
        ).finally(() => {
            spinner.hide();
        });
    } catch (err) {
        spinner.hide();
        console.error("Error occurred in validateEditListing--", err);
    }
}

const getListing = () => {
    try {
        spinner.show("Please wait...");
        ApiService.getMyLists(userDetails.user.sid).then(
            response => {
                setMyList(response.data);
                setMyListings(response.data);
            },
            err => {
                Toast.error({ message: err.response?.data ? (err.response?.data.error || err.response?.data.status) : 'API Failed', time: 2000 });
            }
        ).finally(() => {
            spinner.hide();
            setIsDataLoaded(true);
        });
    } catch (err) {
        spinner.hide();
        console.error("Error occurred in getListing--", err);
    }
}

useEffect(() => getListing(), []);


    //Listens files changes and makes component to forcefully re-render due to file carousel inside formik but it does not react for outside state changes
    useEffect(() => {
        forceRender(Date.now());
    }, [files])

    useEffect(() => {
        if(tabWiseData.tradeListItems.length > 0) {
            let totalEstimateTradePrice = tabWiseData.tradeListItems.reduce((a, res) => (
                a + (
                    res.selectedQuantity *
                    ((res.sell && res.trade && res.sellPrice > res.tradeReservePrice ? res.sellPrice : res.tradeReservePrice) 
                        || (res.sell && res.sellPrice) 
                        || (res.trade && res.tradeReservePrice))
                )
            ), 0);
            if (tabWiseData.tradeListItems[0].listing_details_content) {
                if (!_.includes(JSON.parse(tabWiseData.tradeListItems[0].listing_details_content), 'listingContent')) {
                    setFiles(JSON.parse(tabWiseData.tradeListItems[0].listing_details_content));
                } else {
                    setFiles([{
                        "fileName": "../../../assets/images/no-image-available.png"
                    }]);
                }
            } else {
                setFiles([{
                    "fileName": "../../../assets/images/no-image-available.png"
                }]);
            }

            setTradePriceWith(totalEstimateTradePrice);
            tabWiseData.totalTradePriceWith = totalEstimateTradePrice;
        } else {
            setTradePriceWith(0);
            tabWiseData.totalTradePriceWith = 0;
        }
    }, [tabWiseData.tradeListItems, listing])

    useEffect(() => {
        if(history.location.state && history.location.state.newListingInfo) {
            setViewSpecificTrade(false);
            let tmpArr = [];
            if(history.location.state.newListingInfo
                && !_.isEmpty(history.location.state.newListingInfo)
                && !history.location.state.tradeListItems.some(r => r.sid === history.location.state.newListingInfo.sid)) {
                    tmpArr = [...history.location.state.tradeListItems, {...history.location.state.newListingInfo, "selectedQuantity": 1}]
            } else {
                let tmpIndex = history.location.state.tradeListItems.findIndex(r => r.sid === history.location.state.newListingInfo.sid);
                history.location.state.tradeListItems[tmpIndex] = {...history.location.state.newListingInfo, "selectedQuantity": 1};
                tmpArr = history.location.state.tradeListItems;
                // tmpArr = [...history.location.state.tradeListItems, {...tmpObj, ...history.location.state.newListingInfo}];
            }
            // setting trade price
            let totalEstimateTradePrice = tmpArr.length > 0 && tmpArr.reduce((a, res) => (
                a + (
                    res.selectedQuantity *
                    (res.sell && res.trade && res.sellPrice > res.tradeReservePrice ? res.sellPrice : res.tradeReservePrice) 
                        || (res.sell && res.sellPrice) 
                        || (res.trade && res.tradeReservePrice)
                )
            ), 0);
            setTradePriceWith(totalEstimateTradePrice);
            tabWiseData.totalTradePriceWith = totalEstimateTradePrice;

            tabWiseData.tradeListItems = tmpArr;
            setListing(tmpArr);
        } else if(product && product.trade_with_listing_type && !tabWiseData.isViewedSpecificTradeModal) {
            tabWiseData.isViewedSpecificTradeModal = true;
            setViewSpecificTrade(!_.isEmpty(product.trade_with_listing_type));
        }
    }, [history.location, product])

    return (
        <>
            <fieldset>
                <div class="justify-content-between">
                    <div className="flx mt-2 mb-4">
                        <div><h2 className="card-title-header mb0">{!_.isEmpty(product.trade_with_listing_type) ? "Offer Specific Trade" : "Offer Trade"}</h2></div>
                        <div className="flx1 text-right">
                        </div>
                    </div>
                </div>
                <div class="justify-content-center mt-3 desktop-off mb-5">
                    {orderBy === 'trade' && !_.isEmpty(product) && <MatchValueView {...{product, tradePriceWith, valueToMatch, setValueToMatch, tab, tabWiseData }} />}
                </div>
                <div class="justify-content-center">
                    <div class="col-lg-12 mb-5 d-flex justify-content-center">
                        <div class="col-lg-6">
                            <div id="demo-pranab">
                                {
                                    !_.isEmpty(files) &&
                                    <OwlCarousel id="owl-item-details" className='owl-theme carousel-container' loop nav autoplay autoplayHoverPause margin={20} items={1} autoplayTimeout={2000} responsive={{
                                        0: {
                                            items: 1
                                        },
                                        600: {
                                            items: 1
                                        },
                                        1000: {
                                            items: 1
                                        }
                                    }}>
                                        {files.length && files.map((item, index) => {
                                            return <div class="item product-images-min" key={index}>
                                                {/* <div className="upload-delete-icn" onClick={() => deleteImage(index)}><IcnTrashRed /></div> */}
                                                <div className="prod-image-div size2" style={{ backgroundImage: `url(${item.fileName || item.key})` }}></div>
                                            </div>
                                        })}
                                    </OwlCarousel>
                                }
                                {
                                    _.isEmpty(files) &&
                                    <div class="item product-images-show p-0">
                                        <div className="prod-image-div size2" style={{ backgroundImage: `url(${NoImg})` }}></div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="fdc">
                        {
                            tabWiseData.tradeListItems.length > 0 
                            && tabWiseData.tradeListItems.map((res, i) => <div className="p-rel">
                            
                            <div key={i} className="mt-list-item text-left">
                            
                            <div className="aic">
                                <div className="mr20 dfv-pri-icn">
                                    {res.primary && <div className="">{ICN_PRIMARY_LG}</div>}
                                </div>
                                <div>
                                    <div className="title1 pointer my-0" onClick={() => { }}>{res.title}</div>
                                    <div className="f12">{res?.model?.name ? res.model.name : ""}</div>
                                    <div className="aic f12">
                                        <div className="mr10">Qty : </div>
                                        <div>
                                            {
                                                res.quantity > 1
                                                ? <select 
                                                    className="form-control form-control-sm" 
                                                    defaultValue={res.selectedQuantity} 
                                                    onChange={(e) => {handleSelectQuantity(e.target.value, i)}}
                                                >
                                                    {[...Array(res.quantity >= 1 ? res.quantity : 1).keys()].map(res => <option className="form-control form-control-sm" value={res+1} name={res+1}>{res+1}</option>)}
                                                </select>
                                                : res.quantity
                                            }
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                            <div className="aic">
                                <div className="text-right">
                                    <div>Price</div>
                                    <div className="title1 my-0">${res.selectedQuantity * ((res.trade && res.sell && res.tradeReservePrice > res.sellPrice ? res.tradeReservePrice : res.sellPrice) || (res.trade && res.tradeReservePrice) || (res.sell && res.sellPrice)) || 0}</div>
                                </div>
                                <div className="px5"><i className="fas fa-minus-circle-o"></i></div>
                                <div className="px-2 pl-4 pointer" onClick={() => {}}>
                                    <Dropdown>
                                        <Dropdown.Toggle as={CustomToggle} id="create-update-listing">
                                            {ICN_MORE}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu alignRight>
                                            <Dropdown.Item onClick={() => {setViewListingInfo({...res, "platformVariables": res.platformVariables ? JSON.parse(res.platformVariables) : null}); setViewListing(true);}}>View Listing</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { validateEditListing(res) }}> Edit Listing</Dropdown.Item>
                                            <Dropdown.Item onClick={() => showConfirmModalDelete({ "sid": res.sid, "list": myLists, "title": res.title })}>Delete Listing</Dropdown.Item>
                                            <Dropdown.Item onClick={() => {showConfirmModal(res.sid)}}>Remove Listing</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                        </div>)
                        }
                    </div>
                      
                    <div>
                        <div className="aic jcc full-w">
                            <div className="addListingItem aic jcc" onClick={() => { setListingModel(true) }}>
                                <PlusCircleIcon width={'20px'} /><span className="ml5">{"Choose From Existing"}</span>
                            </div>
                        </div>
                        <div className="text-muted">OR</div>
                        <div className="aic jcc full-w">
                            <Link class="create-listing-block"
                                to={{
                                    pathname: "/create-listing",
                                    state: {
                                        breadcrumb: [
                                        ...(history?.location?.state?.breadcrumb ? history?.location?.state?.breadcrumb : []),
                                        {
                                            name: "Create Listing",
                                            path: "/create-listing"
                                        }],
                                        isFromTrade: true,
                                        product: product,
                                        tradeListItems: tabWiseData.tradeListItems ? tabWiseData.tradeListItems : []
                                    }
                                }}>
                                <div className="addListingItem">
                                <PlusCircleIcon width={'20px'} /> Create New Listing
                                </div>
                            </Link>
                        </div>
                        <div className="aic jcc full-w">
                            <div className="text-muted">{"Incase this offer is not accepted by the seller, the newly listed items will be still made available for others."}</div>
                        </div>
                    </div>

                    <div class="aic py15 jcc mobile-off">
                        <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => {cancelAction()}}></input>
                        <input type="button" value="Next" class="submt-btn submt-btn-dark" 
                        disabled={
                            (tabWiseData.tradeListItems && tabWiseData.tradeListItems.length === 0) || 
                            (!valueToMatch.offerStatus)
                            } onClick={() => {onNextStep()}}></input>
                    </div>
                    <section class="mobile-btn-section desktop-off">
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="proPg-btnArea">
                                        <div className="proPg-btnArea-div-outer">
                                            <div className="proPg-btnArea-div-inner">
                                                <input type="button" value="Cancel" onClick={() => {cancelAction()}} class="submt-btn submt-btn-lignt mr10 text-center full-w" />
                                            </div>
                                            <div className="proPg-btnArea-div-inner">
                                                <input type="button" value="Next" onClick={() => {onNextStep()}}
                                                disabled={tabWiseData.tradeListItems && tabWiseData.tradeListItems.length === 0 ||
                                                    (!valueToMatch.offerStatus)
                                                } 
                                                class="submt-btn submt-btn-dark text-center full-w" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </fieldset>
            {listingModel && <ChooseListing {...{ listingModel, setListingModel, handleSetListingValues, tabWiseData, specificTrade: product.trade_with_listing_type }} />}
            {viewListing && !_.isEmpty(viewListingInfo) && <ViewListInfo {...{viewListing, setViewListing, viewListingInfo}} />}
            {viewSpecificTrade && <ViewSpecificaTradeInfo {...{setViewSpecificTrade, product }}/>}
            {ConfirmationComponent}
            {ConfirmationComponentDelete}
        </>
    )
}

export default memo(DetailsFormView);