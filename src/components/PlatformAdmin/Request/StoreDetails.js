import classNames from 'classnames';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Modal, Collapse } from 'react-bootstrap';
import moment from 'moment';

function ExpandCollapse({ name, data, selectedStore }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="p-1 pointer aic" onClick={() => setOpen(!open)}>
        <i className={classNames("fa ibvm mr5", {
          "fa-chevron-down": open,
          "fa-chevron-right": !open
        })}></i>
        <span className="text-semi-bold c111">{name}</span>
      </div>
      <Collapse in={open}>
        <div className="col-lg-12">
          {
            <table className="table table-borderless offer-order-table">
              <tbody>
                {
                  _.isArray(data)
                  && data.map((e, idx) => <tr key={idx} className="row my10 pl15">
                    <td className="col-sm-3">{e.name} :</td>
                    <td className="col-sm-9 text-semi-bold">
                      {
                        e.name === "Appraisal Level"
                          ? <div>
                            <div>{selectedStore?.inspectionLevel ? `Level ${selectedStore.inspectionLevel}` : "-"}</div>
                            <div>
                              {
                                selectedStore.inspectionLevel === 1 && <div className="inception-level-block b-none">
                                  <p className="m-0">Preliminary Inspection</p>
                                  <p className="m-0">Function Test</p>
                                  <p className="m-0">Wear & Tear Inspection</p>
                                </div>
                              }
                              {
                                selectedStore.inspectionLevel === 2 && <div className="inception-level-block b-none">
                                  <p className="m-0">Complete Inspection</p>
                                  <p className="m-0">Dis-assembly</p>
                                </div>
                              }
                              {
                                selectedStore.inspectionLevel === 3 && <div className="inception-level-block b-none">
                                  <p className="m-0">Test Firing, etc.,</p>
                                </div>
                              }
                            </div>

                          </div>
                          : e.value
                      }
                    </td>
                  </tr>)
                }
              </tbody>
            </table>
          }

        </div>
      </Collapse>
    </>
  );
}

const StoreDetails = ({
  show,
  setShow,
  sellerStoreInfo,
  selectedStore = {}
}) => {
  const handleClose = () => setShow(false);
  return (
    <>
      <Modal className="store-details-model" show={show} size="lg" onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>{sellerStoreInfo ? "Seller Info" : "Store Details"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* ...sec1... */}
          <div className="store-details-sec">
            <div className="title1">{selectedStore.name}</div>
            <div>{selectedStore.licenseNumber} {!sellerStoreInfo && <span className="link pointer" onClick={() => { selectedStore.license && window.open(JSON.parse(selectedStore.license), "_blank") }}>View Certificate</span>}</div>
            <div>Store license valid till... <span className="fw600">{selectedStore.licenseExpireOn ? moment(selectedStore.licenseExpireOn).format('L') : " - "}</span></div>
            <div className="jcb">
              <div>
                <div>{`${selectedStore?.premiseStreet ? selectedStore.premiseStreet : ""}${selectedStore.premiseCity ? ", " + selectedStore.premiseCity : ""} ${selectedStore?.premiseState ? ", " + selectedStore.premiseState : ""} ${selectedStore?.premiseZipCode ? ", " + selectedStore.premiseZipCode : ""}`}</div>
                <div>{`${selectedStore.openingHour} to ${selectedStore.closingHour} `}</div>
              </div>
              <div>
                {`Experience : ${selectedStore.yearsOfExperience} Years`}
              </div>
            </div>
            <div className="bt-ddd pt10 mt10">
              <p>{selectedStore?.description ? selectedStore.description : ""}</p>
            </div>
          </div>
          {/* ...end sec1... */}

          {/* ...sec2... */}
          <div className="store-details-sec">
            <div className="title">Contact Info</div>
            <div className="row">
              <div className="col-sm-3 my-2">Contact Name :</div>
              <div className="col-sm-9 my-2 text-semi-bold c111">{`${selectedStore.firstName} ${selectedStore.lastName}`}</div>
              <div className="col-sm-3 my-2">Email :</div>
              <div className="col-sm-9  my-2 text-semi-bold c111">{selectedStore?.email ? selectedStore.email : "_"}</div>
              <div className="col-sm-3 my-2">Phone Number :</div>
              <div className="col-sm-9 my-2 text-semi-bold c111">{selectedStore?.phoneNumber ? selectedStore.phoneNumber : "_"}</div>
              <div className="col-sm-3 my-2">Fax Number :</div>
              <div className="col-sm-9 my-2 text-semi-bold c111">{selectedStore?.fax ? selectedStore.fax : "_"}</div>
            </div>
          </div>

          {/* ...end sec2... */}

          {/* ...end sec3... */}
          <div className="store-details-sec">
            <div className="title">Specialties</div>
            <div>
              {
                !_.isEmpty(selectedStore?.fflStoreHasSpecialities)
                && selectedStore.fflStoreHasSpecialities.map((data, i) => <div key={i} className="flx my-3">
                  <div className="st-bgg">{data.name}</div>
                  { !sellerStoreInfo &&
                    data.certificateDetails
                    && JSON.parse(data.certificateDetails).map((certificate, idx) => <div
                      key={idx}
                      className="link pointer elps spl-certificate"
                      onClick={() => { certificate.fileName && window.open(certificate.fileName, "_blank") }}
                    >{certificate.fileName ? `${certificate.fileName.split("/")[certificate.fileName.split("/").length - 1]}` : ""}</div>
                    )}
                </div>
                )}
            </div>
          </div>
          {/* ...end sec3... */}

          {/* ...end sec4... */}

          <div className="store-details-sec">
            <div className="title">Service  Offered</div>
            {
              selectedStore.appraisalEnabled
              && <ExpandCollapse
                name="Appraisals"
                data={
                  [
                    {
                      name: "0 to 500",
                      value: (_.isEqual("PERCENTAGE", selectedStore.appraisalFeeType) && `${selectedStore.appraisalFeePercentageTill500}%`) || `${selectedStore.appraisalFeeFixedPriceTill500}`
                    },
                    {
                      name: "501 to 1000",
                      value: (_.isEqual("PERCENTAGE", selectedStore.appraisalFeeType) && `${selectedStore.appraisalFeePercentageTill1000}%`) || `${selectedStore.appraisalFeeFixedPriceTill1000}`
                    },
                    {
                      name: "1000+",
                      value: (_.isEqual("PERCENTAGE", selectedStore.appraisalFeeType) && `${selectedStore.appraisalFeePercentageAbove1000}%`) || `${selectedStore.appraisalFeeFixedPriceAbove1000}`
                    }
                  ]
                } />
            }
            {
              selectedStore.layawayEnabled
              && <ExpandCollapse
                name="Layaway"
                data={[
                  {
                    name: "Layaway Period",
                    value: `${selectedStore.layawayPeriod} Day(s)`
                  },
                  {
                    name: "Layaway Fees",
                    value: `${selectedStore.layawayFee}%`
                  }
                ]} />
            }
            {
              selectedStore.inspectionEnabled &&
              <ExpandCollapse
                name="Inspections"
                data={[
                  {
                    name: "Appraisal Level",
                    value: `Level ${selectedStore.inspectionLevel}`
                  },
                  {
                    name: "Appraisal Fees",
                    value: `$${selectedStore.inspectionFee}`
                  }
                ]}
                selectedStore={selectedStore} />
            }
            {
              selectedStore.classesEnabled
              && <ExpandCollapse
                name="Classes"
                data={[
                  {
                    name: "Permit Classes Fees",
                    value: `$${selectedStore.permitClassFee}`
                  },
                  {
                    name: "Training Classes Fees",
                    value: `$${selectedStore.trainingClassFee}`
                  }
                ]} />
            }
            {
              selectedStore.fflSaleEnabled
              && <ExpandCollapse
                name="FFL Sales"
                data={[
                  {
                    name: "FFL Sale Fees",
                    value: `$${selectedStore.fflSaleFee}`
                  }
                ]} />
            }
          </div>
        </Modal.Body>
      </Modal>
    </>)
}
export default StoreDetails;