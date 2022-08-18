import Breadcrumb from "../../Shared/breadcrumb";
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
import Layout from "../../Layout";
import { ICN_FILTER } from "../../icons";
import FilterAction from './FilterAction'
import Modal from "../../Shared/Modal";
import './getService.css'

const ServiceList = (props) => {
    const [serviceList, setServiceList] = useState([]);
    const history = useHistory();
    const [show, setShow] = useState(false)

    // init component
    useEffect(() => {
        setServiceList(JSON.parse(localStorage.getItem('servicelist')))
    }, [])

    const onSelect = (value) => {
        localStorage.setItem('selectedItem', JSON.stringify(value));
        history.push({
            pathname: "/servicedetails",
            state: {
                breadcrumb: [
                    { name: "Home", path: `/` },
                    { name: "Store", path: '/servicelist' },
                    { name: value.name }

                ]
            }
        });
    }
    return (<>
        <Layout title="Buy Products" description="filter view" >
            <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
            <div className="service-details-con">
                <div className="container ">
                    <div className="row ">
                        <div className="col-12 col-lg-6">
                            <div className="aic jcb"><div>{serviceList.length} matching results</div><div className="pointer" onClick={() => setShow(true)}>{ICN_FILTER} Filter</div></div>

                            {serviceList.length === 0 && <div className="py-5 ">Data not found</div>}
                            {serviceList.map(res => <div className="serviceList">
                                <div onClick={() => onSelect(res)} className="product-title pointer">{res.name}</div>
                                <div>{res.premiseStreet}</div>
                                <div className="jcb"><div>{res.openingHour} to {res.closingHour}</div><div>Experience: {res.yearsOfExperience ? res.yearsOfExperience + " year" : "-"}</div></div>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
        {
            <Modal {...{ show, setShow }} className="wishList-modal">
                <FilterAction {...{ isModal: true, setShow, show, setList: setServiceList }} />
            </Modal>
        }
    </>)
}

export default ServiceList