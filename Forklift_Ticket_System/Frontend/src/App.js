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
import TicketManagerDashboard from './apps/tickets/pages/Dashboard/TicketManagerDashboard';
import CustomerManagerDashboard from './apps/tickets/pages/Dashboard/CustomerManager/CustomerManagerDashboard';
import './App.css';
import ProtectedRoute from './apps/tickets/routes/ProtectedRoute';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useState, useEffect } from 'react';
import UserDashboard from './apps/tickets/pages/Dashboard/UserDashboard';
import SalesManagerDashboard from './apps/tickets/pages/Dashboard/SalesManagerDashboard';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './apps/tickets/pages/Auth/HomePage';
import Footer from './components/Footer/Footer.jsx';
import DemoPage from './pages/DemoPage.jsx';
// Layout wrapper component
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('access') !== null;
  const isAuthPage = ['/login', '/register', '/reset-password', '/'].includes(location.pathname);

  return (
    <div className="app">
        {isLoggedIn && !isAuthPage && <Navbar />}
        <main className={`main-content ${!isLoggedIn || isAuthPage ? 'auth-page' : ''}`}>
          {children}
        </main>
     </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userRole = localStorage.getItem('role');
  const { i18n } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('access');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<NewPassword
             />} />
            <Route path="/demo/page" element={
             <DemoPage />
            } />
            {/* Protected routes with role-based access */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredPermission="canAccessAdmin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredPermission="canAccessAdmin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard/tickets" element={
              <ProtectedRoute requiredPermission="canAccessAdmin">
                <> <AdminDashboard /></>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ticket-manager" element={
              <ProtectedRoute requiredPermission="canManageTickets">
                <TicketManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/customer-manager" element={
              <ProtectedRoute requiredPermission="canManageCustomers">
                <><CustomerManagerDashboard /> </>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ticket-manager" element={
              <ProtectedRoute requiredPermission="canManageTickets">
                <TicketManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/user" element={
              <ProtectedRoute requiredPermission="canAccessUser">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/sales-manager" element={
              <ProtectedRoute requiredPermission="canManageSales">
                <SalesManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/sales/tickets" element={
              <ProtectedRoute requiredPermission="canManageSales">
                <SalesManagerDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
