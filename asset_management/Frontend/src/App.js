import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './apps/tickets/pages/Auth/Login';
import Register from './apps/tickets/pages/Auth/Register';
import ResetPassword from './apps/tickets/pages/Auth/ResetPassword';
import NewPassword from './apps/tickets/pages/Auth/NewPassword';
import AdminDashboard from './apps/tickets/pages/Dashboard/AdminDashboard';
import AssetManagerDashboard from './apps/tickets/pages/Dashboard/AssetManagerDashboard';

import ProtectedRoute from './apps/tickets/routes/ProtectedRoute';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Layout wrapper component
import { DashboardCommon } from './apps/tickets/pages/Dashboard/DashboardCommon';
import "react-toastify/dist/ReactToastify.css";
import Customers from './apps/tickets/pages/Dashboard/Customer_Manager/Customers';
import Offers from './apps/tickets/pages/Dashboard/Customer_Manager/Offers';
import CreateAssetPage from './components/common/CreateAssetPage';
import EditAssetPage from './components/common/EditAssetPage';
import CreateCustomerPage from './components/common/CreateCustomerPage';
import UpdateCustomerPage from './components/common/UpdateCustomerPage';
import CreateFinanceAssetPage from './components/common/CreateFinanceAssetPage';
import EditFinanceAssetPage from './components/common/EditFinanceAssetPage';
import UpdateOfferPage from './components/common/UpdateOfferPage';
import CreateOfferPage from './components/common/CreateOfferPage';
import CreateWarehousePage from './components/common/CreateWarehousePage';
import UpdateWarehousePage from './components/common/UpdateWarehousePage';
import HomePage from './apps/tickets/pages/Auth/HomePage';
import EditAssetPageNew from './components/common/EditAssetPageNew';
import ViewWarehouse from './components/common/ViewWarehouse';
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('access') !== null;
  const isAuthPage = ['/login', '/register', '/reset-password', '/'].includes(location.pathname);

  return (
    <div className="app">
      {/* {isLoggedIn && !isAuthPage && <Sidebar />}
      <div className={`main-wrapper ${isLoggedIn && !isAuthPage ? 'with-sidebar' : ''}`}> */}
        {isLoggedIn && !isAuthPage && <Navbar />}
        <main className={`main-content ${!isLoggedIn || isAuthPage ? 'auth-page' : ''}`}>
          {children}
        </main>
      </div>
    // </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:uidb64/:token" element={<NewPassword />} />
          
          <Route path ='/dashboard' element={<ProtectedRoute><DashboardCommon/></ProtectedRoute>}/>
          {/* <Route path ='/dashboard/customer' element={<Customers />}/> */}
          <Route path ='/dashboard/offers' element={<ProtectedRoute><Offers /></ProtectedRoute>}/>
          
          {/* Admin Routes */}
          {/* <Route path="/admin/*" element={
            <ProtectedRoute requiredPermission="canAccessAdmin">
              <AdminDashboard />
            </ProtectedRoute>
          } /> */}

          {/* Role-Based Routes */}
          {/* <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="asset-manager" element={<AssetManagerDashboard />} />
                <Route path="customer-manager" element={<CustomerManagerDashboard />} />
                <Route path="user" element={<UserDashboard />} />
                <Route path="sales-manager" element={<SalesManagerDashboard />} />
              </Routes>
            </ProtectedRoute>
          } />*/}
          <Route path="/create-asset" element={<ProtectedRoute><CreateAssetPage /></ProtectedRoute>} />
          <Route path="/edit-asset/:id" element={<ProtectedRoute><EditAssetPage /></ProtectedRoute>} />
          <Route path="/edit-asset-new/:id" element={<ProtectedRoute><EditAssetPageNew /></ProtectedRoute>} />
          <Route path="/create-customer" element={<ProtectedRoute><CreateCustomerPage /></ProtectedRoute>} />
          <Route path="/update-customer/:id" element={<ProtectedRoute><UpdateCustomerPage /></ProtectedRoute>} />
          <Route path="/create-finance-asset" element={<ProtectedRoute><CreateFinanceAssetPage /></ProtectedRoute>} />
          <Route path="/update-finance-asset/:id" element={<ProtectedRoute><EditFinanceAssetPage /></ProtectedRoute>} />
          <Route path="/update-offer/:id" element={<ProtectedRoute><UpdateOfferPage /></ProtectedRoute>} />
          <Route path="/create-offer" element={<ProtectedRoute><CreateOfferPage /></ProtectedRoute>} />
          {/* warehouse */}
          <Route path="/create-warehouse" element={<ProtectedRoute><CreateWarehousePage /></ProtectedRoute>} />
          <Route path="/update-warehouse/:id" element={<ProtectedRoute><UpdateWarehousePage /></ProtectedRoute>} />
          <Route path="/warehouse/:id" element={<ProtectedRoute><ViewWarehouse /></ProtectedRoute>} />

        </Routes> 
      </Layout>
    </Router>
  );
};

export default App;
