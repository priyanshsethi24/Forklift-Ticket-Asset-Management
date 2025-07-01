import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Your custom styles
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./translations/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./translations/i18n";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./redux/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <App />
        {/* <ToastContainer /> */}
      </Provider>
    </I18nextProvider>
  </React.StrictMode>
);
