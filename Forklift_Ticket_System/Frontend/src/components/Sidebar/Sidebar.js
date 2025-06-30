// import React, { useEffect, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { 
//   FaClipboardList, 
//   FaUserPlus, 
//   FaUsers, 
//   FaChartLine,
//   FaTicketAlt 
// } from 'react-icons/fa';
// import { useTranslation } from 'react-i18next';
// import './Sidebar.css';

// const Sidebar = () => {
//   const location = useLocation();
//   const [userRole, setUserRole] = useState('');
//   const { t } = useTranslation();

//   useEffect(() => {
//     const role = localStorage.getItem('userRole');
//     setUserRole(role);
//   }, []);

//   const menuItems = (() => {
//     switch(userRole) {
//       case 'ticket_manager':
//         return [
//           { 
//             path: '/dashboard/ticket-manager', 
//             label: t('sidebar.ticketManager.dashboard'), 
//             icon: <FaClipboardList /> 
//           }
//         ];
//       case 'customer_manager':
//         return [
//           { 
//             path: '/dashboard/customer-manager', 
//             label: t('sidebar.customerManager.dashboard'), 
//             icon: <FaClipboardList /> 
//           }
//         ];
//       case 'sales_manager':
//         return [
//           { 
//             path: '/dashboard/sales-manager', 
//             label: t('sidebar.salesManager.dashboard'), 
//             icon: <FaChartLine /> 
//           }
//         ];
//       case 'admin':
//         return [
//           { 
//             path: '/admin/dashboard', 
//             label: t('sidebar.admin.dashboard'), 
//             icon: <FaClipboardList /> 
//           },
//           { 
//             path: '/admin/users', 
//             label: t('sidebar.admin.users'), 
//             icon: <FaUsers /> 
//           }
//         ];
//       case 'user':
//         return [
//           { 
//             path: '/dashboard/user', 
//             label: t('sidebar.user.dashboard'), 
//             icon: <FaClipboardList /> 
//           }
//         ];
//       default:
//         return [];
//     }
//   })();

//   return (
//     <div className="sidebar">
//       <div className="sidebar-logo">
//         <div className="logo-wrapper">
//           <FaTicketAlt className="sidebar-logo-icon" />
//           <div className="logo-text-container">
//             <span className="logo-text-main">TMS</span>
//             <span className="logo-text-sub">{t('sidebar.title')}</span>
//           </div>
//         </div>
//       </div>

//       <nav className="sidebar-nav">
//         {menuItems.map((item, index) => (
//           <Link
//             key={index}
//             to={item.path}
//             className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
//           >
//             <span className="sidebar-icon">{item.icon}</span>
//             <span className="sidebar-text">{item.label}</span>
//           </Link>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar; 