import React, { useContext, useEffect, useState } from 'react';
import ApiService from '../../services/api.service';
import { Link, useHistory } from 'react-router-dom';
import Spinner from "rct-tpt-spnr";
import $ from 'jquery';
import { AppContext } from '../../contexts/AppContext';

import useToast from '../../commons/ToastHook';

const Footer = () => {
    const [categories, setCategories] = useState([]);
    const { setValueBy } = useContext(AppContext);

    const mobileSidebarNavClose = () => {
        $(".screen-overlay").removeClass("show");
        $(".mobile-offcanvas").removeClass("show");
        $("body").removeClass("offcanvas-active");
    }
    const Toast = useToast();
    const spinner = useContext(Spinner);

    const initCategoriesHeader = () => {
        spinner.show("Please wait...");
        ApiService.getCategories().then(
            response => {
                setCategories(response.data.splice(0, 7));
            },
            err => {
                Toast.error({ message: err.response && err.response.data ? (err.response.data.error || err.response.data.status) : 'Please try after sometime.', time: 2000});
            }
        ).finally(() => {
            spinner.hide();
        });
    }

    useEffect(() => { initCategoriesHeader() }, [])

    return (
        <footer id="main_footer">
            <div id="footer-area">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12 top-footer">
                            <img src="images/footer-logo.png" class="img-fluid" />
                        </div>
                    </div>
                    <div class="row mobile-off">
                        <div class="col-lg-2 col-sm-12 fst-footer">
                            <h4>CATEGORY</h4>
                            <ul class="footer-menu">
                                {
                                    categories.map((category, i) => {
                                        return <li class="nav-item" key={i}>
                                            <Link 
                                            class="nav-link" 
                                            to={{
                                                pathname: "/search",
                                                state: {
                                                    breadcrumb: [{
                                                        name: "Home",
                                                        path: "/"
                                                    },
                                                    {
                                                        name: category.name,
                                                        path: "/search",
                                                        data: category
                                                    }]
                                                }
                                            }}
                                            onClick={() => { 
                                                setValueBy('SET_KEYWOARD', ''); 
                                                setValueBy('SET_CATEGORY', category); 
                                                mobileSidebarNavClose() 
                                            }}>{category.name}</Link>
                                        </li>
                                    })
                                }
                            </ul>
                        </div>
                        <div class="col-lg-2 col-sm-12 snd-footer">
                            <h4>COMPANY</h4>
                            <ul class="footer-menu">
                                <li><a>About us</a></li>
                                <li><a>Contact us</a></li>
                                <li><a>Privacy policy</a></li>
                                <li><a>Terms & conditions</a></li>
                                <li><a>Return policy</a></li>
                                <li><a>Shipping policy</a></li>
                            </ul>
                        </div>
                        <div class="col-lg-2 col-sm-12 trd-footer">
                            <h4>HELP & SUPPORT</h4>
                            <ul class="footer-menu">
                                <li><a>Customer Care</a></li>
                                <li><a>FAQ’s</a></li>
                                <li><a>Resources</a></li>
                                <li><a>Terms & Conditions</a></li>
                                <li><a>Security Policy</a></li>
                            </ul>
                        </div>
                        <div class="col-lg-2 col-sm-12 offset-lg-4 fou-footer">
                            <h4>CONTACT US</h4>
                            <p>support@guntraderz.com</p>
                            {/* <p>+1 1234567890</p> */}
                        </div>
                    </div>

                    <div class="row flex-wrap-footer desktop-off">
                        <div class="col-sm-6 fst-footer footer-fst">
                            <h4>CATEGORY</h4>
                            <ul class="footer-menu">
                                {
                                    categories.map((category, i) => {
                                        return <li class="nav-item" key={i}>
                                            <Link 
                                            class="nav-link" 
                                            to={{
                                                pathname: "/search",
                                                state: {
                                                    breadcrumb: [{
                                                        name: "Home",
                                                        path: "/"
                                                    },
                                                    {
                                                        name: category.name,
                                                        path: "/search",
                                                        data: category
                                                    }]
                                                }
                                            }}
                                            onClick={() => { 
                                                setValueBy('SET_KEYWOARD', ''); 
                                                setValueBy('SET_CATEGORY', category); 
                                                mobileSidebarNavClose() 
                                            }}>{category.name}</Link>
                                        </li>
                                    })
                                }
                            </ul>
                        </div>
                        <div class="col-sm-6 snd-footer footer-snd">
                            <h4>COMPANY</h4>
                            <ul class="footer-menu">
                                <li><a>About us</a></li>
                                <li><a>Contact us</a></li>
                                <li><a>Privacy policy</a></li>
                                <li><a>Terms & conditions</a></li>
                                <li><a>Return policy</a></li>
                                <li><a>Shipping policy</a></li>
                            </ul>
                        </div>

                    </div>

                    <div class="row flex-wrap-footer desktop-off">
                        <div class="col-sm-6 trd-footer footer-trd">
                            <h4>HELP & SUPPORT</h4>
                            <ul class="footer-menu">
                                <li><a>Customer Care</a></li>
                                <li><a>FAQ’s</a></li>
                                <li><a>Resources</a></li>
                                <li><a>Terms & Conditions</a></li>
                                <li><a>Security Policy</a></li>
                            </ul>
                        </div>
                        <div class="col-sm-6 fou-footer footer-fou">
                            <h4>CONTACT US</h4>
                            <p>support@guntraderz.com</p>
                            {/* <p>+1 1234567890</p> */}
                        </div>
                    </div>

                    

                </div>
                <div id="footer-copyright">
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="social-footer">
                                    <ul>
                                        <li class="social-g"><a></a></li>
                                        <li class="social-t"><a></a></li>
                                        <li class="social-f"><a></a></li>
                                        <li class="social-i"><a></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="col-lg-6 copyright-area">
                                <p>&copy; 2021 Guntraderz. All Rights Reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;