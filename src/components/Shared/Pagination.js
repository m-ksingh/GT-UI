/*********
    * 
    * CallComm Technologies, Inc. Confidential
    * ____
    * 
    *  Copyright CallComm Technologies, Inc. 2021. All rights reserved
    * 
    * NOTICE:  All information contained herein is, and remains
    * the property of CallComm Technologies, Inc. and its suppliers,
    * if any.  The intellectual and technical concepts contained
    * herein are proprietary to CallComm Technologies, Inc.
    * and its suppliers and may be covered by U.S. and Foreign Patents,
    * patents in process, and are protected by trade secret or copyright law.
    * Dissemination of this information or reproduction of this material
    * is strictly forbidden unless prior written permission is obtained
    * from CallComm Technologies, Inc.
*/

import React, { useState, useEffect } from 'react';
import Pagination from 'react-bootstrap/Pagination';

function PaginationOne(props) {
    const [paginateInfo, setPaginateInfo] = useState({});

    // This method used to construct pagination array
    const Paginate = (totalItems, currentPage = 1, pageSize = props.pageCount ? props.pageCount : 10, maxPages = 5) => {
        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage, endPage;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    };

    // Fires when user clicked on page navigation
    const onNavigate = (pageNumber = 1) => {
        initPagination(pageNumber);
        props.onNavigate(pageNumber);
    };

    // This method is for Initialize pagination component
    const initPagination = (currentPageNumber = 1) => {
        try {
            setPaginateInfo({ ...Paginate(props.totalCount, currentPageNumber) });
        } catch (err) {
            console.error("Error occurred while initPagination" + err);
        }
    };

    useEffect(() => {
        if (props.totalCount) initPagination(1); // Initialize pagination layout, Default page number: 1
    }, [props.totalCount]);


    return (
        <>
            {paginateInfo && paginateInfo.totalPages > 1 && <div className="flx pagination-bar scrolly-x">
                {/* <div className="text-muted mr10">Showing {paginateInfo.currentPage} of {paginateInfo.totalPages}</div> */}
                <div className="jcc">
                    <Pagination size="sm" className="jcc">
                        <Pagination.First className="bg-none" disabled={paginateInfo.currentPage === 1} onClick={() => onNavigate(1)} />
                        <Pagination.Prev className="bg-none" disabled={paginateInfo.currentPage === 1} onClick={() => onNavigate(paginateInfo.currentPage - 1)} />
                        {paginateInfo && paginateInfo.pages.map((page, i) => {
                            return (
                                <Pagination.Item key={i} active={page === paginateInfo.currentPage} onClick={() => onNavigate(page)}>{page}</Pagination.Item>
                            )
                        })}
                        <Pagination.Next className="bg-none" disabled={paginateInfo.currentPage === paginateInfo.totalPages} onClick={() => onNavigate(paginateInfo.currentPage + 1)} />
                        <Pagination.Last className="bg-none" disabled={paginateInfo.currentPage === paginateInfo.totalPages} onClick={() => onNavigate(paginateInfo.totalPages)} />
                    </Pagination>
                </div>
            </div>
            }
        </>
    );
}

export default PaginationOne;
