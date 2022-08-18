import React, { useState } from "react";
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import Modal from "../../Shared/Modal";
import _ from 'lodash';

const AttachedReportFile = ({ show, setShow, selectedDispute }) => {
    const [images, setImages] = useState([]);
    
    return (<>
        <Modal {...{ show, setShow }}>
            <div className="container p-3">
                <div className="row border-bottom pb-2">
                    <div class="col">
                        <h4>Attached images</h4>
                    </div>
                </div>
                <div className="row justify-content-center mt-3">
                    <div class="col">
                        <div className="col-lg-12 mb-12">
                            <div id="demo-pranab" className="pos-rel">
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
                                    {!_.isEmpty(JSON.parse(selectedDispute.deliveryIssueContent)) && JSON.parse(selectedDispute.deliveryIssueContent).map((item, index) => {

                                        return <div className="item product-images" key={index}>
                                           { (item?.fileName || item?.key) && <div className="prod-image-div" style={{ backgroundImage: `url(${item?.fileName || item?.key})` }}></div>}
                                        </div>
                                    })}
                                    {/* {!selectedDispute.deliveryIssueContent && <span className="pagination">No more attached image</span>} */}
                                </OwlCarousel>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

    </>);
}
export default AttachedReportFile