import React from "react";
import ReactDOM from "react-dom";
import Routes from "./routes";
import * as serviceWorker from "./serviceWorker";
import AxiosService from "./services/axios.service";
import { TransparentSpinner } from "rct-tpt-spnr";
import { HelmetProvider } from "react-helmet-async";
import AppContextProvider from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext/context";
import ProductsContextProvider from "./contexts/ProductsContext";
import CartContextProvider from "./contexts/CartContext";
import { ReactNotifications } from "react-notifications-component";
import { NetworkStatus } from "./commons/NetworkStatus/NetworkStatus";
import { ReactBootstrapAlert } from "rct-bs-alert";
import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAP_API_KEY } from "./commons/utils";
import GLOBAL_CONSTANTS from "./Constants/GlobalConstants";
// CSS Import
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/style.css";
import "./assets/css/magic-check.css";
import "./assets/css/responsive.css";
import "react-notifications-component/dist/theme.css";
window.$ = window.jQuery = require("jquery");

AxiosService.init(GLOBAL_CONSTANTS.HOSTNAME);

ReactDOM.render(
  <HelmetProvider>
    <TransparentSpinner>
      <NetworkStatus>
        <ReactBootstrapAlert>
          <AuthProvider>
            <AppContextProvider>
              <ProductsContextProvider>
                <CartContextProvider>
                  <ReactNotifications />
                  <LoadScript
                    googleMapsApiKey={GOOGLE_MAP_API_KEY}
                    libraries={["drawing", "places"]}>
                    <Routes />
                  </LoadScript>
                </CartContextProvider>
              </ProductsContextProvider>
            </AppContextProvider>
          </AuthProvider>
        </ReactBootstrapAlert>
      </NetworkStatus>
    </TransparentSpinner>
  </HelmetProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
