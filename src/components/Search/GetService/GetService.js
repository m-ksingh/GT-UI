import React from "react";
import Layout from "../../Layout";
import Breadcrumb from "../../Shared/breadcrumb";
import _ from 'lodash';
import FilterAction from './FilterAction'
import './getService.css'

function GetService(props) {
    return (
        <Layout title="Buy Products" description="filter view" >
            <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
            <section id="buy-filter-section">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-lg-6 filter-popup-box">
                            <div className="left-sidebar" data-type="filterBox">
                                <FilterAction />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default GetService;