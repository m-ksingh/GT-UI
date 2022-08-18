import React, { useContext, useState, useEffect } from 'react';
import Layout from '../Layout';
import Spinner from "rct-tpt-spnr";
import Breadcrumb from '../Shared/breadcrumb';
import { Link, useHistory } from 'react-router-dom';
import { StoreSubmit } from './SetupStore';
import { useAuthState } from '../../contexts/AuthContext';
import ApiService from '../../services/api.service';

const BecameDealer = () => {
    const userDetails = useAuthState();
    const spinner = useContext(Spinner);
    const [inReviewStatus, setInReviewStatus] = useState(false);
    const history = useHistory();

    const populateStoreInfo = () => {
        try {
            spinner.show("Please wait...");
            ApiService.populateUnSavedStore(userDetails.user.sid).then(
                response => {
                    setInReviewStatus(response?.data[0]?.approvalStatus === "UNDER_REVIEW" ? true : false);
                },
                err => {
                    spinner.hide();
                    console.error("Error occur when populateStoreInfo", err);
                }
            ).finally(() => {
                spinner.hide();
            });
        } catch (err) {
            spinner.hide();
            console.error("Error occur when populateStoreInfo", err);
        }
    }

    // init component
    useEffect(() => {
        if (!userDetails?.user?.sid) {
            history.push('/');
        }
        if (userDetails?.user?.sid) {
            populateStoreInfo()
        }
    }, [])

    return (
        <Layout title="Search Result" description="This is the search result page">
            <Breadcrumb
                {...{
                    data: [{
                        name: "Home",
                        path: "/"
                    },
                    {
                        name: "Become Dealer",
                        path: "/store/welcome"
                    }]
                }} />
            <section>
                <div class="container mb-5">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        {
                            !inReviewStatus
                            && <>
                                <div class="store-icon mt-5 mb-3">
                                    <a href="" />
                                </div>
                                <h2>Became a Dealer</h2>
                                <div class="mt-2 d-flex flex-column align-items-center justify-content-center">
                                    <p class="pro-description">Term and condition "Coming soon.."</p>
                                </div>
                                <div class="mt-3 d-flex flex-column align-items-center justify-content-center">
                                    <Link
                                        className="mt-3 btn btn-success store-continue"
                                        to="/store/onboard/new"
                                        to={{
                                            pathname: `/store/onboard/new`,
                                            state: {
                                                breadcrumb: [
                                                    {
                                                        name: "Home",
                                                        path: "/"
                                                    },
                                                    {
                                                        name: "Become Dealer",
                                                        path: "/store/welcome"
                                                    },
                                                    {
                                                        name: "New Store",
                                                        path: `/store/onboard/new`
                                                    }
                                                ]
                                            }
                                        }}
                                    >Continue</Link>
                                </div>
                            </>
                        }
                        {inReviewStatus && <StoreSubmit {...{ ...{ tab: "preview", message: "You have already submitted Store Request" } }} />}
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default BecameDealer;