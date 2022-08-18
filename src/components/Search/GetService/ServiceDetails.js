import { useEffect, useState } from 'react';
import _ from 'lodash';
import Breadcrumb from "../../Shared/breadcrumb";
import Layout from "../../Layout";
import Collapse from 'react-bootstrap/Collapse';
import classNames from 'classnames';
import './getService.css'

const ServiceDetails = (props) => {
    const [selectedStore, setSelectedStore] = useState({})
    const [appraisal, setAppraisal] = useState(true);
    const [layaway, setLayaway] = useState(true);
    const [inspection, setInspection] = useState(true);
    const [classesCol, setClassesCol] = useState(true);
    const [ffiSale, setFfiSale] = useState(true);

    // init component
    useEffect(() => {
        setSelectedStore(JSON.parse(localStorage.getItem("selectedItem")));
    }, [])

    return (
        <>
            <Layout title="Buy Products" description="filter view" >
                <Breadcrumb {...{ data: (props?.location?.state?.breadcrumb && [...props?.location?.state?.breadcrumb]) || [] }} />
                {/* ...sec1... */}
                <div className=" service-details-con">
                    <div className="container">
                        <div className="row ">
                            <div className="col-12 col-lg-8 ">
                                <div className="store-details-sec">
                                    <div className="title1">{selectedStore.name}</div>
                                    {/* <div>{selectedStore.licenseNumber} <span className="link pointer" onClick={() => {selectedStore.license && window.open(selectedStore.license, "_blank")}}>View Certificate</span></div> */}
                                    <div className="jcb row">
                                        <div className="col-8 col-lg-8">
                                            <div>{`${selectedStore?.premiseStreet ? selectedStore.premiseStreet : ""}${selectedStore.premiseCity ? ", " + selectedStore.premiseCity : ""} ${selectedStore?.premiseState ? ", " + selectedStore.premiseState : ""} ${selectedStore?.premiseZipCode ? ", " + selectedStore.premiseZipCode : ""}`}</div>
                                            <div>{`${selectedStore.openingHour} to ${selectedStore.closingHour} `}</div>
                                        </div>
                                        <div className="col-4 col-lg-3">
                                            {`Experience : ${selectedStore.yearsOfExperience} Years`}
                                        </div>
                                    </div>
                                    <div className="bt-ddd pt10 mt10">
                                        <p>{selectedStore?.description ? selectedStore.description : ""}</p>
                                    </div>
                                    <div className="title">Specialties</div>
                                    <div>
                                        {
                                            !_.isEmpty(selectedStore?.fflStoreHasSpecialities)
                                            && selectedStore.fflStoreHasSpecialities.map((data, i) => <div key={i} className="flx my-3">
                                                <div className="st-bgg">{data.name}</div>
                                            </div>
                                            )}
                                    </div>
                                </div>
                                {/* ...end sec1... */}

                                {/* ...sec2... */}
                                <div className="store-details-sec">
                                    <div className="title">Contact Info</div>
                                    <div className="row">
                                        <div className="col-7 col-lg-3 my-2">Contact Name :</div>
                                        <div className="col-5 col-lg-9 my-2 title-bold">{`${selectedStore.firstName} ${selectedStore.lastName}`}</div>
                                        <div className="col-7 col-lg-3 my-2">Email :</div>
                                        <div className="col-5 col-lg-9  my-2 title-bold">{selectedStore?.email ? selectedStore.email : "_"}</div>
                                        <div className="col-7 col-lg-3 my-2">Phone Number :</div>
                                        <div className="col-5 col-lg-9 my-2 title-bold">{selectedStore?.phoneNumber ? selectedStore.phoneNumber : "_"}</div>
                                        <div className="col-7 col-lg-3 my-2">Fax Number :</div>
                                        <div className="col-5 col-lg-9 my-2 title-bold">{selectedStore?.fax ? selectedStore.fax : "_"}</div>
                                    </div>
                                </div>
                                {/* ...end sec2... */}
                                {/* ...end sec4... */}
                                <div className="store-details-sec">
                                    <div className="title">Service  Offered</div>
                                    <div>
                                        <div className="title-bold"
                                            onClick={() => setAppraisal(!appraisal)}
                                            aria-controls="AppraisalCollapse"
                                            aria-expanded={appraisal}
                                        > <i className={classNames("fa ibvm mr5", {
                                            "fa-chevron-down": appraisal,
                                            "fa-chevron-right": !appraisal
                                        })}></i> Appraisal</div>
                                        <Collapse in={appraisal}>
                                            <div id="AppraisalCollapse" className="service-Offered-CSS">
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">0 to 500 :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.appraisalFeePercentageTill500 ? `${selectedStore.appraisalFeePercentageTill500}%` : "_"}</div>
                                                </div>
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">500 to 1000 :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.appraisalFeePercentageTill1000 ? `${selectedStore.appraisalFeePercentageTill1000}%` : "_"}</div>
                                                </div>
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">1000+ :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.appraisalFeePercentageAbove1000 ? `${selectedStore.appraisalFeePercentageAbove1000}%` : "_"}</div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                    <div>
                                        <div className="title-bold"
                                            onClick={() => setLayaway(!layaway)}
                                            aria-controls="LayawayCollapse"
                                            aria-expanded={layaway}
                                        ><i className={classNames("fa ibvm mr5", {
                                            "fa-chevron-down": layaway,
                                            "fa-chevron-right": !layaway
                                        })}></i> Layaway</div>
                                        <Collapse in={layaway}>
                                            <div id="LayawayCollapse" className="service-Offered-CSS">
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">Layaway Period :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{`${selectedStore?.layawayPeriod ? selectedStore.layawayPeriod : "0"} Days`}</div>
                                                </div>
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">Layaway Fees :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.layawayFee ? `$${selectedStore.layawayFee}` : "_"}</div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                    <div>
                                        <div className="title-bold"
                                            onClick={() => setInspection(!inspection)}
                                            aria-controls="InspectionCollapse"
                                            aria-expanded={inspection}
                                        ><i className={classNames("fa ibvm mr5", {
                                            "fa-chevron-down": inspection,
                                            "fa-chevron-right": !inspection
                                        })}></i> Inspection</div>
                                        <Collapse in={inspection}>
                                            <div id="InspectionCollapse" className="service-Offered-CSS">
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">Appraisal Level :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.appraisalFeePercentageTill500 ? selectedStore.appraisalFeePercentageTill500 : "_"}</div>
                                                </div>
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">Appraisal Fees :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.appraisalFeeFixedPriceTill500 ? `$${selectedStore.appraisalFeeFixedPriceTill500}` : "_"}</div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                    <div>
                                        <div className="title-bold"
                                            onClick={() => setClassesCol(!classesCol)}
                                            aria-controls="ClassesCollapse"
                                            aria-expanded={classesCol}
                                        ><i className={classNames("fa ibvm mr5", {
                                            "fa-chevron-down": classesCol,
                                            "fa-chevron-right": !classesCol
                                        })}></i> Classes</div>
                                        <Collapse in={classesCol}>
                                            <div id="ClassesCollapse" className="service-Offered-CSS">
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">Permit Classes Fees :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.permitClassFee ? `$${selectedStore.permitClassFee}` : "_"}</div>
                                                </div>
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">Training Classes Fees :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.trainingClassFee ? `$${selectedStore.trainingClassFee}` : "_"}</div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                    <div>
                                        <div className="title-bold"
                                            onClick={() => setFfiSale(!ffiSale)}
                                            aria-controls="FFlCollapse"
                                            aria-expanded={ffiSale}
                                        ><i className={classNames("fa ibvm mr5", {
                                            "fa-chevron-down": ffiSale,
                                            "fa-chevron-right": !ffiSale
                                        })}></i> FFl Sale</div>
                                        <Collapse in={ffiSale}>
                                            <div id="FFlCollapse" className="service-Offered-CSS">
                                                <div className="row my-3">
                                                    <div className="col-7 col-lg-3">FFl Sale Fees :</div>
                                                    <div className="col-5 col-lg-9 title-bold">{selectedStore?.fflSaleFee ? `$${selectedStore.fflSaleFee}` : "_"}</div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row dialer-contact-store">
                    <div class="col-12 col-lg-8 ">
                        <div className="dialer-footer">
                            <a href={`tel:${selectedStore?.phoneNumber}`} class="submt-btn submt-btn-dark submt-btn-dialer"> Contact Store</a>
                        </div>
                    </div>
                </div>
            </Layout>
        </>)
}
export default ServiceDetails;