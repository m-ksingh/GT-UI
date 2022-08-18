import React, { useEffect, useState } from 'react';
import { IcnLocation } from '../icons';
import _ from 'lodash';

const ViewLocation = ({
    deliveryLocation: dl,
    showIcon = true
}) => {
    const [deliveryLocation, setDeliveryLocation] = useState({});

    useEffect(() => {
        try {
            let temp = {}
            if (_.isString(dl)) {
                temp = JSON.parse(dl);
                if (_.isString(temp?.location)) 
                    temp.location = JSON.parse(temp.location);
            } else if (_.isObject(dl) && _.isObject(dl?.location)) {
                temp = dl;
            }
            setDeliveryLocation(temp);
        } catch (err) {
            setDeliveryLocation({});
            console.error("Exception occurred in useEffect[] -- ViewLocstion.js -- ", err);
        }
    }, [])

    return <>
        {
            !_.isEmpty(deliveryLocation)
            && <div className={showIcon ? "flx w100" : ""}>
                <div className="mr5">{showIcon && <IcnLocation />}</div>
                <div className="elps pt2">
                    <span className="text-semi-bold">
                        {
                            (deliveryLocation?.type === "SHERIFF_OFFICE" && "Sherriff's Office")
                            || (deliveryLocation?.type === "OTHER_LOCATION" && "Other")
                            || deliveryLocation?.type
                        }
                    </span>
                    <span className="px5">:</span>
                    {
                        !_.isEmpty(deliveryLocation?.location)
                        && _.isObject(deliveryLocation.location)
                        && <>
                            {
                                !_.isEmpty(deliveryLocation.location?.address)
                                && <span>
                                    {deliveryLocation.location.address?.countrySubdivision && <span>{deliveryLocation.location.address.countrySubdivision}, </span>}
                                    {deliveryLocation.location.address?.countrySubdivisionName && <span>{deliveryLocation.location.address.countrySubdivisionName}, </span>}
                                    {deliveryLocation.location.address?.countryCode && <span>{deliveryLocation.location.address.countryCode}, </span>}
                                    {deliveryLocation.location.address?.postalCode && <span>{deliveryLocation.location.address.postalCode}</span>}
                                </span>
                            }
                            <span>
                                {(deliveryLocation.location.storeName || deliveryLocation.location?.licHolderName) && <span>{deliveryLocation.location?.storeName || deliveryLocation.location.licHolderName}, </span>}
                                {deliveryLocation.location.mailCity && <span>{deliveryLocation.location.mailCity}, </span>}
                                {deliveryLocation.location.premState && <span>{deliveryLocation.location.premState}, </span>}
                                {deliveryLocation.location.premZipCode && <span>{deliveryLocation.location.premZipCode}</span>}
                            </span>
                            <span>
                                {deliveryLocation.location.fflStoreName && <span>{deliveryLocation.location.fflStoreName}, </span>}
                                {deliveryLocation.location.fflPremiseCity && <span>{deliveryLocation.location.fflPremiseCity}, </span>}
                                {deliveryLocation.location.fflPremiseState && <span>{deliveryLocation.location.fflPremiseState}, </span>}
                                {deliveryLocation.location.fflPremiseZipCode && <span>{deliveryLocation.location.fflPremiseZipCode}</span>}
                            </span>
                            <span>
                                {deliveryLocation.location.premiseStreet && <span>{deliveryLocation.location.premiseStreet}, </span>}
                                {deliveryLocation.location.premiseCity && <span>{deliveryLocation.location.premiseCity}, </span>}
                                {deliveryLocation.location.premiseState && <span>{deliveryLocation.location.premiseState}, </span>}
                                {deliveryLocation.location.premiseZipCode && <span>{deliveryLocation.location.premiseZipCode}</span>}
                            </span>
                            <span>
                                <span>{deliveryLocation.location?.formatted_address || deliveryLocation.location?.name || ""} </span>
                            </span>
                            <span>
                                {
                                    deliveryLocation.location?.freeformAddress
                                        ? <span>{deliveryLocation.location.freeformAddress}</span>
                                        : <span>
                                            {deliveryLocation.location.streetName && <span>{deliveryLocation.location.streetName}, </span>}
                                            {deliveryLocation.location.municipality && <span>{deliveryLocation.location.municipality}, </span>}
                                            {deliveryLocation.location.countrySubdivision && <span>{deliveryLocation.location.countrySubdivision}, </span>}
                                            {deliveryLocation.location.extendedPostalCode && <span>{deliveryLocation.location.extendedPostalCode}</span>}
                                        </span>
                                }
                            </span>
                        </>
                    }
                    {
                        (_.isEmpty(deliveryLocation) || _.isEmpty(deliveryLocation.location))
                        && <span className="text-muted">Not available</span>
                    }
                </div>
            </div>
        }
    </>
}

export default ViewLocation;