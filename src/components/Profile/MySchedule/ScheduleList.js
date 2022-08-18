import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import _ from 'lodash';
import moment from 'moment';
import { NOTIFICATION_CONSTANTS } from '../Notification/Constants/NotificationConstants';
import ArrivedSteps from '../Notification/ArrivedSteps';
import { IcnLocation } from '../../icons';
import { IcnCircleInfo } from '../../icons';
import { isTodayCurrentHour } from '../../../services/CommonServices';

const ScheduleList = ({ 
    myLists, 
    getAllAlarmNotificationsList = () => { }, 
    isDataLoaded, 
    type = "seller", 
    setIsReloadList
}) => {
    const [arrived, setArrived] = useState(false);
    const [selectedScheduleInfo, setSelectedScheduleInfo] = useState(null);

    // get image
    const getMyImage = (item) => {
        let imageUrl = '../images/no-image-available.png';
        try {
            if (!_.isEmpty(item)) {
                const imagesByItem = JSON.parse(item)[0];
                imageUrl = imagesByItem && imagesByItem.fileName ? imagesByItem.fileName : '../images/no-image-available.png';
            }
        } catch (e) {
            imageUrl = '../images/no-image-available.png';
        }
        return imageUrl;
    }

    return (<div className="">
        <div className="tab-pane">
            <div className="row">
                <div className="col">
                    {
                        isDataLoaded && myLists.map((nl, index) => {
                            return <div className="myBidbox myWishlistbox py-3" key={index}>
                                <div className="myBidbox-title jcb">
                                    {/* <span><IcnCircleInfo /></span> */}
                                    {nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SCHEDULE_ALARM && <span class="mr5"><IcnCircleInfo /> {moment(nl.notificationJson.fromTime).format('LL') + " at " + moment(nl.notificationJson.fromTime).format('LT') + " - " + moment(nl.notificationJson.toTime).format('LT')}</span>}
                                    <div className="small-size text-muted">
                                        {moment(nl.createdOn).startOf('minute').fromNow()}
                                    </div>
                                </div>
                                <div className="border-top border-bottom pt-2">
                                    {
                                        nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER
                                            ? <span>
                                                {`Please meet the buyer at the below mentioned location and click on the below button to indicate that you have arrived in order to ${(nl?.notificationJson?.orderType === "TRADE" && "trade") || "hand over"} the below mentioned item.`}
                                            </span>
                                            : <span>
                                                {`Please meet the seller at the below mentioned location and click on the below button to indicate that you have arrived in order to ${(nl?.notificationJson?.orderType === "TRADE" && "trade") || "receive your"} the below mentioned item.`}
                                            </span>
                                    }
                                    <span className="float-right"></span>
                                    <div className="row jcb py-3">
                                        <div className="col-lg-5 col-6">
                                            <div className="WishlistItem">
                                                <div className="media">
                                                    <img src={getMyImage(nl.notificationJson.pic)} className="mr-3" alt="..." />
                                                    <div className="media-body">
                                                        <h5 className="mt-0">{nl.notificationJson.title}</h5>
                                                        <p>{nl.notificationJson.manufacturer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-2 col-3 text-right">
                                            <div className="WishlistItem-price">
                                                <p className="wprice-label">Price</p>
                                                <p className="wishlist-price">${nl.notificationJson.price ? Number(nl.notificationJson.price).toFixed(2) : 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className=" ">
                                        {
                                            nl.notificationJson.deliveryLocation
                                            && <>
                                                <div className="elps pt2">
                                                    <span className="mr5"><IcnLocation /></span>
                                                    <span className="text-semi-bold">
                                                        {
                                                            (JSON.parse(nl.notificationJson.deliveryLocation).type === "SHERIFF_OFFICE" && "Sherriff's Office")
                                                            || (JSON.parse(nl.notificationJson.deliveryLocation).type === "OTHER" && "Other")
                                                            || JSON.parse(nl.notificationJson.deliveryLocation).type
                                                        }
                                                    </span>
                                                    <span className="px5">:</span>
                                                    {
                                                        JSON.parse(nl.notificationJson.deliveryLocation)
                                                        && JSON.parse(nl.notificationJson.deliveryLocation).location
                                                        && JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                        && <>
                                                            {
                                                                !_.isEmpty(JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address)
                                                                && <span>
                                                                    {/* {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.postalName && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.postalName}, </span>} */}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.countrySubdivision && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.countrySubdivision}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.countrySubdivisionName && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.countrySubdivisionName}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.countryCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.countryCode}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.postalCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).address.postalCode}</span>}
                                                                </span>
                                                            }
                                                            {
                                                                JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                                && <span>
                                                                    {(JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).storeName || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).licHolderName) && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).storeName || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).licHolderName}, </span>}
                                                                    {/* {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premStreet && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premStreet}, </span>} */}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).mailCity && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).mailCity}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premState && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premState}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premZipCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premZipCode}</span>}
                                                                </span>
                                                            }
                                                            {
                                                                JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                                && <span>
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflStoreName && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflStoreName}, </span>}
                                                                    {/* {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseStreet && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseStreet}, </span>} */}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseCity && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseCity}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseState && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseState}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseZipCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).fflPremiseZipCode}</span>}
                                                                </span>
                                                            }
                                                            {
                                                                JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                                && <span>
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseStreet && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseStreet}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseCity && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseCity}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseState && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseState}, </span>}
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseZipCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).premiseZipCode}</span>}
                                                                </span>
                                                            }
                                                            {
                                                                JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                                && <span>
                                                                    {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location) && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)?.formatted_address 
                                                                    || JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)?.name || "" } </span>}
                                                                </span>
                                                            }
                                                            {
                                                                JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location)
                                                                && <span>
                                                                    {
                                                                        JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).freeformAddress
                                                                            ? <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).freeformAddress}</span>
                                                                            : <span>
                                                                                {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).streetName && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).streetName}, </span>}
                                                                                {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).municipality && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).municipality}, </span>}
                                                                                {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).countrySubdivision && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).countrySubdivision}, </span>}
                                                                                {JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).extendedPostalCode && <span>{JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location).extendedPostalCode}</span>}
                                                                            </span>
                                                                    }
                                                                </span>
                                                            }
                                                            {
                                                                _.isEmpty(JSON.parse(nl.notificationJson.deliveryLocation))
                                                                && _.isEmpty(JSON.parse(JSON.parse(nl.notificationJson.deliveryLocation).location))
                                                                && <span className="text-muted">Not available</span>
                                                            }
                                                        </>
                                                    }
                                                </div>
                                            </>
                                        }
                                    </div>
                                </div>
                                <div className="jcb pt-2 aic">
                                    <div>
                                        {/* <div>Expires</div>
                                        <div className="small-size text-danger">{moment(nl.expireOn).endOf('day').fromNow()}</div> */}
                                    </div>
                                    <div>
                                        {
                                            nl.notificationType === NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SCHEDULE_ALARM
                                            && <Button
                                                variant="warning"
                                                className="btn btn-sm btn-warning border-round"
                                                onClick={() => {setSelectedScheduleInfo(nl); setArrived(true)}}
                                                disabled={!isTodayCurrentHour({ from: nl.notificationJson.fromTime, to: nl.notificationJson.expiresOn || nl.notificationJson.toTime })}
                                            >
                                                <div className="aic">
                                                    <div className="pr-2"></div>
                                                    <div>
                                                        {
                                                            (nl.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.BUYER && "Meet the seller")
                                                            || "Meet the buyer"
                                                        }
                                                    </div>
                                                </div>
                                            </Button>
                                        }
                                    </div>
                                </div>
                            </div>
                        })
                    }
                    {
                        isDataLoaded && !myLists.length && <div class="gunt-error py-3 mt-2 bg-white">No Data Found</div>
                    }
                </div>
            </div>
        </div>
        {
            !_.isEmpty(selectedScheduleInfo)
            && arrived
            && <ArrivedSteps {...{
                show: arrived,
                setShow: setArrived,
                nl: selectedScheduleInfo,
                getAllNotificationsList: () => getAllAlarmNotificationsList(),
                type: selectedScheduleInfo.notificationJson.type === NOTIFICATION_CONSTANTS.USER_TYPE.SELLER ? NOTIFICATION_CONSTANTS.USER_TYPE.SELLER : NOTIFICATION_CONSTANTS.USER_TYPE.BUYER
            }}/>
        }
    </div>)
}
export default ScheduleList