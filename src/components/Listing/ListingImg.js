
import React, { useState, useEffect, useContext, useRef, memo } from 'react'
import _ from 'lodash';
import $ from 'jquery';
import axios from 'axios';
import ApiService from "../../services/api.service";
import {  IcnTrashRed } from '../icons';
import Spinner from "rct-tpt-spnr";
import useToast from "../../commons/ToastHook"
// owl-carousel
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const ListingImg = ({ setTab, listInfoByView, setListInfoByView, listInfoByViewRef, onCancelStep = () => {} }) => {
    let imgInfoRef = useRef();
    const listDetails = listInfoByView;
    const Toast = useToast();
    const spinner = useContext(Spinner);
    const [fileError, setFileError] = useState(false);
    const [isReachedMaxLimit, setIsReachedMaxLimit] = useState(false);
    const [files, setFiles] = useState(listDetails.images);
    const [, forceRender] = useState();

    const initImageUpload = () => {
        $('.camera-input:visible').trigger('click');
    }

    const initOpenCamera = () => {
        $('.upload-input:visible').trigger('click');
    }

    const setMultiFilesToDisplay = (awsFiles) => {
        const uploadedFiles = _.map(awsFiles, file => {
            return file.data;
        });
        const filesList = _.concat(files, uploadedFiles);
        setFiles(filesList);
    }

    const onPrevNav = () => {
        setListInfoByView({ ...listInfoByView, 'images': files });
        $('#image').removeClass('active');
        setTab('info')
    }



    function onNextNav() {
        if (files.length) {
            setListInfoByView({ ...listInfoByView, 'images': files });
            $('#terms').addClass('active');
            setTab('terms');
        } else {
            Toast.error({ message: 'Please upload product images', time: 2000 });
        }
    }

    function uploadFiles(e) {
        // Create an object of formData
        let formData;
        const fileValue = e.target.files[0]?.size / (1024 * 1024)
        const listOfFiles = [];
        if ([...e.target.files, ...files].length > 10) {
            setIsReachedMaxLimit(true);
            return;
        } else {
            setIsReachedMaxLimit(false);
        }
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
                setFileError(false)
            },
            err => {
                console.error(err);
                setFileError(false)
            }
        ).finally(() => {
            spinner.hide();
            e.target.value = null;
        });
        // Send formData object
    }

    // this method call to delete image
    const deleteImage = (index) => {
        try {
            let tmpImg = [...files];
            tmpImg.splice(index, 1);
            setFiles(tmpImg);
            setListInfoByView({ ...listInfoByView, 'images': tmpImg });
            if(tmpImg.length === 0) {
                $('#terms').removeClass('active');
                $('#post').removeClass('active');
            }
            if (tmpImg.length <= 10 ) {
                setIsReachedMaxLimit(false);
            }
        } catch (err) {
            console.error("Error occur when deleteImage--", err);
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);

        // cleanup funtion - trigger when listing images component destroy or unmount
        return () => {
            listInfoByViewRef.current = { ...listInfoByView, "images": imgInfoRef.current}
        };
    }, [])

    // Listens files changes and makes component to forcefully re-render due to file carousel inside formik but it does not react for outside state changes
    useEffect(() => {
        forceRender(Date.now());
        imgInfoRef.current = files;
    }, [files])

    return (
        <fieldset>
            <div className="form-card">
                <div className="row justify-content-center">
                    <div className="col-lg-12 mb-5">
                        <div className="row">
                            <div className="col-lg-12 d-flex justify-content-center">
                                <div className="col-lg-6">
                                    <div id="demo-pranab">
                                        {
                                            !_.isEmpty(files)
                                            && <OwlCarousel id="owl-item-details" className='owl-theme carousel-container' loop nav autoplay autoplayHoverPause margin={20} items={1} autoplayTimeout={2000} responsive={{
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
                                                {
                                                    files.length && files.map((item, index) => {
                                                        return <div className="item product-images-min" key={index}>
                                                            <div className="upload-delete-icn" onClick={() => deleteImage(index)}><IcnTrashRed /></div>
                                                            <div className="prod-image-div size2" style={{ backgroundImage: `url(${item})` }} accept="image/*"></div>
                                                        </div>
                                                    })
                                                }
                                            </OwlCarousel>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form className="col-lg-12" encType="multipart/form-data">
                        {fileError && <p className="fild-caption text-center pb-2 label-head text-danger">!Error please upload file size less then 40MB</p>}

                        <ul className="image-upload-btn">
                            <li className="imgU-btn iuFstbtn cursor-pointer" disabled={files.length > 10} onClick={() => { initImageUpload(); setFileError(false) }}>Upload Picture</li>
                            {/* <li className="imgU-btn iuSndbtn cursor-pointer" disabled onClick={initOpenCamera}>Open Camera</li> */}
                        </ul>
                        <p className={`fild-caption text-center pt-3 label-head ${isReachedMaxLimit ? "text-danger" : ""}`}>(Minimum 1 photo & Maximum 10 photos allowed)<sup>*</sup></p>
                        <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" className="form-control upload-input" onChange={uploadFiles} />
                        <input type="file" multiple accept="image/*" capture="camera" className="form-control camera-input" onChange={uploadFiles} />
                    </form>
                </div>
            </div>
            {/* <input onClick={onPrevNav} type="button" name="previous" className="previous action-button-previous" value="Previous" />
            <input onClick={onNextNav} disabled={!files.length} type="button" name="next" className="next action-button nextBtn" value="Next" /> */}

            <div class="aic py15 jcc mobile-off">
                <input type="button" value="Cancel" class="submt-btn submt-btn-lignt mr10" onClick={() => onCancelStep()}></input>
                <input type="button" value="Previous" class="submt-btn submt-btn-lignt mr10" onClick={onPrevNav}></input>
                <input type="button" disabled={!files.length} name="next" className="next action-button nextBtn nextBtnfst" value="Next" onClick={onNextNav} />
            </div>
            <section class="mobile-btn-section desktop-off">
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="proPg-btnArea">
                                    <ul>
                                        <li onClick={() => onCancelStep()}><a class="submt-btn submt-btn-lignt mr10 text-center">Cancel</a></li>
                                        <li onClick={onPrevNav}><a class="submt-btn submt-btn-lignt mr10">Previous</a></li>
                                        <li onClick={onNextNav}><a class="submt-btn submt-btn-dark" disabled={!files.length}>Next</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
            </section>
        </fieldset>
    )
}

export default memo(ListingImg)