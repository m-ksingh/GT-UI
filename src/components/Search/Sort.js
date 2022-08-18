import React, { useState, useEffect } from "react";
import { Formik } from "formik"
import $ from 'jquery';
import _ from 'lodash';
import { Form, Row, Col } from 'react-bootstrap';
import FormikCotext from '../Shared/FormikContext';

let defaultValues = {
    sort: 'REL'
};

function Sort({
    handleClose,
    onSort,
    sortValues,
    resetSortValues = () => { }
}) {

    const [initialValues, setInitialValues] = useState((!_.isEmpty(sortValues) && sortValues) || defaultValues);

    useEffect(() => {
        setInitialValues((!_.isEmpty(sortValues) && sortValues) || defaultValues);
    }, [sortValues])

    const handleChangeByChange = (values) => {
        if (!$('.add-filter-footer:visible').length) {
            if (values.sort !== initialValues.sort) {
                handleClose();
            }
            onSort(values);
        }
    }

    const updateSortBy = (e) => {
        setInitialValues(e.target.value);
    }

    const onSortAndExitPopup = (values) => {
        handleClose();
        onSort(values);
    }

    return (
        <>
            <div class="row">
                <div class="col-lg-12 filter-popup-box">
                    <div class="left-sidebar" data-type="filterBox">
                        <Formik
                            initialValues={initialValues}
                            onSubmit={onSortAndExitPopup}>
                            {({ handleSubmit, isSubmitting, handleChange, touched, errors, values, isValid, dirty }) => (
                                <Form noValidate>
                                    <FormikCotext {...{ callback: (val) => handleChangeByChange(val) }} />
                                    <h3>Sort</h3>
                                    <div class="add-short-body filter-box-ctn">
                                        <Form.Group as={Row}>
                                            <Col sm={10}>
                                                <div class="form-check">
                                                    <input class="form-check-input"
                                                        type="radio"
                                                        value="REL"
                                                        name="sort"
                                                        onClick={updateSortBy}
                                                        checked={values.sort === "REL"}
                                                        onChange={handleChange}
                                                        id="flexRadioDefault1" />
                                                    <label class="form-check-label" for="flexRadioDefault1">
                                                        Most Relevant
                                                    </label>
                                                </div>

                                                <div class="form-check">
                                                    <input class="form-check-input"
                                                        type="radio"
                                                        value="CREATED"
                                                        id="NewlyListed"
                                                        name="sort"
                                                        onClick={updateSortBy}
                                                        checked={values.sort === "CREATED"}
                                                        onChange={handleChange} />
                                                    <label class="form-check-label" for="NewlyListed">
                                                        Newly Listed
                                                    </label>
                                                </div>

                                                <div class="form-check">
                                                    <input class="form-check-input"
                                                        type="radio"
                                                        id="LowestPrice"
                                                        value="PRICE_ASC"
                                                        name="sort"
                                                        onClick={updateSortBy}
                                                        checked={values.sort === "PRICE_ASC"}
                                                        onChange={handleChange} />
                                                    <label class="form-check-label" for="LowestPrice">
                                                    Buy Now: Low to High
                                                    </label>
                                                </div>

                                                <div class="form-check">
                                                    <input class="form-check-input"
                                                        type="radio"
                                                        id="HighestPrice"
                                                        value="PRICE_DESC"
                                                        name="sort"
                                                        onClick={updateSortBy}
                                                        checked={values.sort === "PRICE_DESC"}
                                                        onChange={handleChange} />
                                                    <label class="form-check-label" for="HighestPrice">
                                                    Buy Now: High to Low
                                                    </label>
                                                </div>

                                                {/* <Form.Check
                                                    type="radio"
                                                    value="RATING"
                                                    label="Highest Rated"
                                                    name="sort"
                                                    onClick={updateSortBy}
                                                    checked={values.sort === "RATING"}
                                                    onChange={handleChange}
                                                /> */}
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div class="add-filter-footer desktop-off">
                                        <input type="submit" value="Save" class="submt-btn submt-btn-dark" onClick={handleSubmit} />
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
            <a class="cd-signin-modal__close js-close" onClick={handleClose} >Close</a>
        </>
    );
}

export default Sort;