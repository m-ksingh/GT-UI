import React, {useEffect, useContext} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Home from '../pages/Home';
import About from '../pages/About';
import NotFound from '../pages/NotFound';
import Cart from "../pages/Cart";
import ProductDetails from "../components/Product/ProductDetails";
import OrderScreen from "../components/Product/OrderScreen";
import Main from "../components/Profile/Main";
import CreateListing from "../components/Listing/CreateListing";
import BuyFilter from "../components/Shared/BuyFilter";
import SearchMain from '../components/Search/SearchMain';
import SetupStore from "../components/Dealership/SetupStore";
import WelcomeDealership from "../components/Dealership/WelcomeDealership";
import DealershipDashboard from "../components/Dealership/Dashboard";
import MyStores from "../components/Dealership/MyStores";
import Reports from "../components/Dealership/Reports";
import MyStoreScreens from "../components/Dealership/MyStoreScreen";
import ResetPasswordScreen from "../pages/ResetPassword";
import ScrollToTop from "./ScrollToTop";
import PlatFormAuth from "../components/PlatformAdmin/PlatFormAuth/PlatFormAuth";
import PlatFormDashboard from "../components/PlatformAdmin/PlatFormDashboard";
import GetService from "../components/Search/GetService/GetService";
import ServiceList from "../components/Search/GetService/ServiceList";
import ServiceDetails from "../components/Search/GetService/ServiceDetails";
import VerifyEmail from "../components/VerifyEmail/VerifyEmail";
import IdealLogout from "../commons/IdealLogout/IdealLogout";
import { useAuthState } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import ForbiddenLocation from "../commons/ForbiddenLocation/ForbiddenLocation";

const Routes = () => {
  const userDetails = useAuthState();
  let user = localStorage.getItem('currentUser')
	? JSON.parse(localStorage.getItem('currentUser'))
	: '';

  const { location } = useContext(AppContext);
  const history = useHistory();

  // Prevent - Forward and Backward  
  useEffect(() =>{
    window.history.pushState(null, null, location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  })

  return (
    <Router>
      <ScrollToTop/>
        <Switch>
          <Route path="/profile/:viewId" component={Main} />
          <Route path="/about" component={About} />
          <Route path="/platform" component={PlatFormAuth} />
          <Route path="/platform-dashboard" component={PlatFormDashboard} />
          <Route exact path="/" component={Home}/>
          <Route path="/cart" component={Cart} />
          <Route path="/buyfilter" component={BuyFilter} />
          <Route path="/getservice" component={GetService} />
          <Route path="/servicelist" component={ServiceList} />
          <Route path="/servicedetails" component={ServiceDetails} />
          <Route path="/search" component={SearchMain} />
          <Route path="/create-listing" component={CreateListing} />
          <Route path="/edit-listing" component={CreateListing} />
          <Route path="/product/:productId" component={ProductDetails}></Route>
          <Route path="/order/:type/:productId" component={OrderScreen}></Route>
          <Route path="/store/welcome" component={WelcomeDealership}></Route>
          <Route path="/store/dashboard" component={DealershipDashboard}></Route>
          <Route path="/store/mystores" component={MyStores}></Route>
          <Route path="/mystore/:type/:storeId" component={MyStoreScreens}></Route>
          <Route path="/mystore/setting/:storeId/:viewId" component={MyStoreScreens}></Route>
          <Route path="/store/reports" component={Reports}></Route>
          <Route path="/store/onboard/:storeId" component={SetupStore}></Route>
          <Route path="/forgot/:token" component={ResetPasswordScreen}></Route>
          <Route path="/verify/email/:sid" component={VerifyEmail} />
          <Route path="/page-not-found" component={ForbiddenLocation} />
          <Route path="*" component={NotFound} />
        </Switch>
        <IdealLogout />
    </Router>
  );
}

export default Routes;