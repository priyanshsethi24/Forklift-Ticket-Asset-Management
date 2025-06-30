
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './translations/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './translations/i18n';
import { MyProvider } from './context/MyContext';
import { ToastContainer } from 'react-toastify';
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
     <MyProvider>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        
        theme="colored"
        style={{
          zIndex: 9999,
          top: "80px",
          right: "20px",
          width: "fit-content",
        }}
      />
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
    </MyProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
