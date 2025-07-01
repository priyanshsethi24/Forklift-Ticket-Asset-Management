
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaTicketAlt,
  FaGlobe,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUsers,
  FaBars,
  FaCog,
  FaUserCircle,
  FaChevronDown,
  FaTimes,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import './Navbar.css';
import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentLanguage } from '../apps/tickets/store/translationSlice.js';
import { API_END_POINTS } from '../network/apiEndPoint';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation();
  const fullName = localStorage.getItem('name') || 'User';
  const firstName = fullName.split(' ')[0]; 
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: '',
    category: '',
    customer_company: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    internal_notes: ''
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userName = localStorage.getItem('name') || 'User';
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const userDropdownRef = useRef(null); 
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('access') !== null;
  
  // Check if current path is login or register page
  const isAuthPage = ['/login'].includes(location.pathname);

  // Get user role from localStorage
  // const userRole = localStorage.getItem('userRole');
  
    const [userRole, setUserRole] = useState('');
  
    useEffect(() => {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    }, []);
    const handleToggleMobileMenu = () => {
      setIsMobileMenuOpen(prev => !prev);
    };
    const handleToggleUserDropdown = () => {
      setShowUserDropdown((prev) => !prev);
    };
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
          setShowUserDropdown(false); // Close dropdown if clicked outside
        }
      };
  
      // Attach event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Cleanup the event listener
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
    useEffect(() => {
      const handleClickOutsideMenu = (event) => {
        if (isMobileMenuOpen && !event.target.closest('.mobilenav')) {
          setIsMobileMenuOpen(false); // Close mobile menu
        }
      };
  
      document.addEventListener("mousedown", handleClickOutsideMenu);
      return () => {
        document.removeEventListener("mousedown", handleClickOutsideMenu);
      };
    }, [isMobileMenuOpen]);
  
  // Simplified navbar title based on role
  const navbarTitle = (() => {
    switch(userRole) {
      case 'admin':
        // return t('dashboard.adminTitle');
        return t("createAsset.buttons.M-Desk");
      case 'asset_manager':
        // return t('dashboard.ticket_managerTitle');
        return t("createAsset.buttons.M-Desk");
      case 'customer_manager':
        // return t('dashboard.customer_managerTitle');
        return t("createAsset.buttons.M-Desk");
      case 'warehouse_manager':
        // return t('dashboard.sales_managerTitle');
        return t("createAsset.buttons.M-Desk");
      case 'finance_manager':
        // return t('dashboard.userTitle');
        return t("createAsset.buttons.M-Desk");
        case 'user':
          return t("createAsset.buttons.M-Desk");
      default:
        // return t('dashboard.title');
        return t("createAsset.buttons.M-Desk");
    }
  })();
  const menuItems = (() => {
      switch(userRole) {
        case 'asset_manager':
          return [
            { 
              // path: '/dashboard/asset-manager', 
              label: t('createAsset.buttons.TicketSystem'), 
              // icon: <FaClipboardList /> 
            },
            {
              //  path: '/admin/dashboard', 
                label: t('createAsset.buttons.HelpCenter'), 
              },
              {
                //  path: '/admin/dashboard', 
                  label: t('createAsset.buttons.Knowledge'), 
                },
                {
                  //  path: '/admin/dashboard', 
                    label: t('createAsset.buttons.Marketing'), 
                  },
                  {
                    //  path: '/admin/dashboard', 
                      label: t('createAsset.buttons.Trucks'), 
                    },
          ];
          case 'user':
            return [
              { 
                // path: '/dashboard/asset-manager', 
                label: t('createAsset.buttons.TicketSystem'), 
                // icon: <FaClipboardList /> 
              },
              {
                //  path: '/admin/dashboard', 
                  label: t('createAsset.buttons.HelpCenter'), 
                },
                {
                  //  path: '/admin/dashboard', 
                    label: t('createAsset.buttons.Knowledge'), 
                  },
                  {
                    //  path: '/admin/dashboard', 
                      label: t('createAsset.buttons.Marketing'), 
                    },
                    {
                      //  path: '/admin/dashboard', 
                        label: t('createAsset.buttons.Trucks'), 
                      },
            ];
        case 'customer_manager':
          return [
            { 
              // path: '/dashboard/asset-manager', 
              label: t('createAsset.buttons.TicketSystem'), 
              // icon: <FaClipboardList /> 
            },
            {
              //  path: '/admin/dashboard', 
                label: t('createAsset.buttons.HelpCenter'), 
              },
              {
                //  path: '/admin/dashboard', 
                  label: t('createAsset.buttons.Knowledge'), 
                },
                {
                  //  path: '/admin/dashboard', 
                    label: t('createAsset.buttons.Marketing'), 
                  },
                  {
                    //  path: '/admin/dashboard', 
                      label: t('createAsset.buttons.Trucks'), 
                    },
          ];
        case 'warehouse_manager':
          return [
            { 
              // path: '/dashboard/asset-manager', 
              label: t('createAsset.buttons.TicketSystem'), 
              // icon: <FaClipboardList /> 
            },
            {
              //  path: '/admin/dashboard', 
                label: t('createAsset.buttons.HelpCenter'), 
              },
              {
                //  path: '/admin/dashboard', 
                  label: t('createAsset.buttons.Knowledge'), 
                },
                {
                  //  path: '/admin/dashboard', 
                    label: t('createAsset.buttons.Marketing'), 
                  },
                  {
                    //  path: '/admin/dashboard', 
                      label: t('createAsset.buttons.Trucks'), 
                    },
          ];
        case 'admin':
          return [
            { 
              path: '/admin/dashboard', 
              label: t('sidebar.admin.dashboard'), 
              // icon: <FaClipboardList /> 
            },
            {
            //  path: '/admin/dashboard', 
              label: t('sidebar.admin.helpcenter'), 
            },
            {
              //  path: '/admin/dashboard', 
                label: t('sidebar.admin.Knowledge'), 
              },
              {
                //  path: '/admin/dashboard', 
                  label: t('sidebar.admin.Marketing'), 
                },
                {
                  //  path: '/admin/dashboard', 
                    label: t('sidebar.admin.Trucks'), 
                  },
         
          ];
        case 'finance_manager':
          return [
            { 
              // path: '/dashboard/user', 
              label: t('createAsset.buttons.TicketSystem'),
              // icon: <FaClipboardList /> 
            },
            {
              //  path: '/admin/dashboard', 
              label: t('createAsset.buttons.HelpCenter'), 
              },
              {
                //  path: '/admin/dashboard', 
                  label: t('createAsset.buttons.Knowledge'), 
                },
                {
                  //  path: '/admin/dashboard', 
                    label: t('createAsset.buttons.Marketing'), 
                  },
                  {
                    //  path: '/admin/dashboard', 
                      label: t('createAsset.buttons.Trucks'), 
                    },
          ];
        default:
          return [];
      }
    })();

  const getCreateButtonText = () => {
    switch(userRole) {
      case 'admin':
        return 'Create Manager';
      case 'ticket_manager':
        return 'Create Ticket';
      case 'customer_manager':
        return 'Add Customer';
      case 'sales_manager':
        return 'Create Sales Ticket';
      case 'user':
        return 'Create Ticket';
      default:
        return 'Create';
    }
  };

  // Modify the changeLanguage function
  const changeLanguage = async (lang) => {
    try {
      // Temporarily store current language
      const prevLang = i18n.language;
      
      // Only proceed if the selected language is different
      if (prevLang !== lang) {
        // Change the i18n language
        await i18n.changeLanguage(lang);
        localStorage.setItem('selectedLanguage', lang);
        dispatch(setCurrentLanguage(lang));
        // Close the dropdown
        setIsLanguageDropdownOpen(false);

      }
    } catch (error) {
      console.error('Language change failed:', error);
      alert('Failed to change language');
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    // Get all dashboard components
    const dashboards = document.querySelectorAll('.dashboard-container');
    dashboards.forEach(dashboard => {
      const component = dashboard.__reactFiber$;
      if (component && component.setShowLogoutLoader) {
        component.setShowLogoutLoader(true);
      }
    });

    setIsLoggingOut(true);
    setShowLogoutLoader(true);
    
    try {
      const refreshToken = localStorage.getItem('refresh');
      const accessToken = localStorage.getItem('access');
      
      if (!refreshToken || !accessToken) {
        console.error('Token not found');
        alert("You are already logged out");
        navigate('/');
        return;
      }

      const response = await fetch(API_END_POINTS.logout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.ok) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userRole');
        localStorage.removeItem('name');
        localStorage.removeItem('userEmail');
        navigate('/');
      } else {
        const errorData = await response.json();
        console.error('Logout failed:', errorData);
        alert(`Logout failed: ${errorData.error || 'Unexpected error occurred'}`);
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred while logging out. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutLoader(false);
      // Reset loader state in all dashboard components
      const dashboards = document.querySelectorAll('.dashboard-container');
      dashboards.forEach(dashboard => {
        const component = dashboard.__reactFiber$;
        if (component && component.setShowLogoutLoader) {
          component.setShowLogoutLoader(false);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    // Add your API call here to submit the ticket
    console.log('New Ticket:', newTicket);
    setShowTicketModal(false);
    // Reset form
    setNewTicket({
      title: '',
      description: '',
      priority: '',
      category: '',
      customer_company: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      internal_notes: ''
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    
    // First check if new passwords match
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error('New passwords do not match!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    // Check if new password is same as current password
    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error('New password cannot be the same as current password!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    setIsChangingPassword(true);
    const token = localStorage.getItem('access');

    try {
      const response = await axios.post(
        `${API_END_POINTS}/update-password/`,
        {
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        if (!toast.isActive('password-success')) {
        toast.success('Password changed successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: 'password-success'
        });
      }
        setShowChangePasswordModal(false);
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          newPasswordConfirm: ''
        });
      }
    } catch (error) {
      if (error.response) {
        // Check for incorrect current password error
        if (error.response.status === 400 && 
            error.response.data?.message?.toLowerCase().includes('current password')) {
          toast.error('Current password is incorrect!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        } else if (error.response.status === 401) {
          toast.error('Session expired. Please login again.', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          navigate('/login');
        } 
        else {
          // For any other error
          const errorMessage = error.response.data?.message || error.response.data?.detail || 'Current password is incorrect';
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
      } else {
        toast.error('Network error. Please check your connection.', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
      console.error('Error changing password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };
  const validatePassword = (password) => {
    const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordCriteria.test(password)) {
      return {
        isValid: false,
        message: 'New password must be at least 8 characters long, include uppercase, lowercase, digits, and special characters.'
      };
    }
    return { isValid: true };
  };

  // Update userProfile to use the name from localStorage
  const userProfile = {
    name: fullName,
    email: localStorage.getItem('userEmail'),
    role: (() => {
      const role = localStorage.getItem('userRole');
      switch(role) {
        case 'admin':
          return 'Administrator';
        case 'asset_manager':
          return 'Asset Manager';
        case 'customer_manager':
          return 'Customer Manager';
        case 'warehouse_manager':
          return 'Warehouse Manager';
        case 'finance_manager':
          return 'Finance Manager';
        default:
          return 'User';
      }
    })()
  };
  

  // Add these language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageDropdownOpen && !event.target.closest('.language-dropdown-container')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageDropdownOpen]);

  // Add useEffect to handle the custom event for ticket refresh
  useEffect(() => {
    const handleRefreshTickets = (event) => {
      // This event will be caught by your tickets component to refresh the list
      console.log('Refreshing tickets for language:', event.detail.language);
    };

    window.addEventListener('refreshTickets', handleRefreshTickets);

    return () => {
      window.removeEventListener('refreshTickets', handleRefreshTickets);
    };
  }, []);

  // Post-login dashboard navbar
  if (showLogoutLoader) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="modern-loader"></div>
          <div className="loader-text">Logging out...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header bg-dark shadow-sm " >
        <div className='webnav'>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center h-100">
            {/* Left side - Logo and Title */}
            <Link  to="/" className="navbar-brand d-flex align-items-center">
              {/* <FaTicketAlt className="text-secondary me-2 dashboard-link" /> */}
              <span className="fw-bold text-secondary dashboard-link">
                {navbarTitle}
              </span>
            </Link>
            <nav className="sidebar-nav">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {/* <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text">{item.label}</span> */}
                  {item.label}
                </Link>
              ))}
               <div className="language-dropdown-container">
                <button 
                  className="action-icon-btn"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                >
                  <FaGlobe className="action-icon" />
                </button>
                
                {isLanguageDropdownOpen && (
                  <div className="language-dropdown">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default behavior
                          e.stopPropagation(); // Stop event propagation
                          changeLanguage(lang.code);
                        }}
                      >
                        <span className="language-flag">{lang.flag}</span>
                        <span className="language-name">{lang.name}</span>
                        {i18n.language === lang.code && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="user-dropdown" ref={userDropdownRef} onClick={handleToggleUserDropdown}>
                <button className="user-dropdown-btn">
                  <FaUserCircle className="user-icon" />
                  <span className="user-name">{firstName}</span>
                  <FaChevronDown className="dropdown-arrow" />
                </button>
                
                {showUserDropdown && (
                  <div className="dropdown-menu show">
                    <div className="dropdown-header">
                      <div className="header-profile">
                        <FaUserCircle className="header-profile-icon" />
                        <div className="header-info">
                          <span className="user-full-name">{userProfile.name}</span>
                          <span className="user-designation">{userProfile.role}</span>
                          {userProfile.email && <span className="user-email">{userProfile.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    
              {userRole === 'admin' && (
                      <Link to="/admin/users" className="dropdown-item">
                        <FaUsers className="dropdown-icon" />
                        Users
                      </Link>
                    )}
                    <button
                      onClick={() => setShowChangePasswordModal(true)}
                      className="dropdown-item"
                    >
                      <FaCog className="dropdown-icon" />
                      {t('navbar.changePassword')}
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item text-danger"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <div className="logout-loader-container">
                          <div className="modern-loader"></div>
                          <span>{t('navbar.logout')}</span>
                        </div>
                      ) : (
                        <>
                          <FaSignOutAlt className="dropdown-icon" />
                          {t('navbar.logout')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        
        </div>
        </div>
        <div className='mobilenav'>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center h-100">
            {/* Left side - Logo and Title */}
           <div className='check'> <Link  to="/" className="navbar-brand d-flex align-items-center">
              {/* <FaTicketAlt className="text-secondary me-2 dashboard-link" /> */}
              <span className="fw-bold text-secondary dashboard-link">
                {navbarTitle}
              </span>
            </Link></div>
            <button className="hamburger" onClick={handleToggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          {isMobileMenuOpen && (
                <nav className={`sidebar-nav open`}>
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {/* <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text">{item.label}</span> */}
                  {item.label}
                </Link>
              ))}
               <div className="language-dropdown-container">
                <button 
                  className="action-icon-btn"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                >
                  <FaGlobe className="action-icon" />
                </button>
                
                {isLanguageDropdownOpen && (
                  <div className="language-dropdown">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default behavior
                          e.stopPropagation(); // Stop event propagation
                          changeLanguage(lang.code);
                        }}
                      >
                        <span className="language-flag">{lang.flag}</span>
                        <span className="language-name">{lang.name}</span>
                        {i18n.language === lang.code && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="user-dropdown" ref={userDropdownRef} onClick={handleToggleUserDropdown}>
                <button className="user-dropdown-btn">
                  <FaUserCircle className="user-icon" />
                  <span className="user-name">{firstName}</span>
                  <FaChevronDown className="dropdown-arrow" />
                </button>
                
                {showUserDropdown && (
                  <div className="dropdown-menu show">
                    <div className="dropdown-header">
                      <div className="header-profile">
                        <FaUserCircle className="header-profile-icon" />
                        <div className="header-info">
                          <span className="user-full-name">{userProfile.name}</span>
                          <span className="user-designation">{userProfile.role}</span>
                          {userProfile.email && <span className="user-email">{userProfile.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    
              {userRole === 'admin' && (
                      <Link to="/admin/users" className="dropdown-item">
                        <FaUsers className="dropdown-icon" />
                        Users
                      </Link>
                    )}
                    <button
                      onClick={() => setShowChangePasswordModal(true)}
                      className="dropdown-item"
                    >
                      <FaCog className="dropdown-icon" />
                      {t('navbar.changePassword')}
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item text-danger"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <div className="logout-loader-container">
                          <div className="modern-loader"></div>
                          <span>{t('navbar.logout')}</span>
                        </div>
                      ) : (
                        <>
                          <FaSignOutAlt className="dropdown-icon" />
                          {t('navbar.logout')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </nav>
          )}
          </div>
        
        </div>
        </div>
      
     
      </header>
      
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />

      {/* New Ticket Modal */}
      {showTicketModal && (
        <div className="modal-backdrop">
          <div className="simple-modal">
            <div className="modal-header">
              <h5>{t('ticketForm.title')}</h5>
              <button 
                type="button" 
                className="close-btn" 
                onClick={() => setShowTicketModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTicket}>
              <div className="modal-content">
                {/* Basic Ticket Info */}
                <div className="form-group">
                  <label>{t('ticketForm.fields.title')} <span className="required">{t('common.required')}</span></label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="Enter ticket title"
                    value={newTicket.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    className="form-input"
                    placeholder="Enter detailed description"
                    rows="3"
                    value={newTicket.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority <span className="required">*</span></label>
                    <select
                      name="priority"
                      className="form-input"
                      value={newTicket.priority}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <select
                      name="category"
                      className="form-input"
                      value={newTicket.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Hardware Issue">Hardware Issue</option>
                      <option value="Software Issue">Software Issue</option>
                      <option value="Network Issue">Network Issue</option>
                      <option value="Access Issue">Access Issue</option>
                    </select>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="customer_company"
                      className="form-input"
                      placeholder="Enter company name"
                      value={newTicket.customer_company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Person <span className="required">*</span></label>
                    <input
                      type="text"
                      name="customer_name"
                      className="form-input"
                      placeholder="Enter contact name"
                      value={newTicket.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="customer_phone"
                      className="form-input"
                      placeholder="Enter phone number"
                      value={newTicket.customer_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="customer_email"
                      className="form-input"
                      placeholder="Enter email address"
                      value={newTicket.customer_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Internal Notes</label>
                  <textarea
                    name="internal_notes"
                    className="form-input"
                    placeholder="Add any internal notes or comments"
                    rows="2"
                    value={newTicket.internal_notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowTicketModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-create"
                >
                  {t('ticketForm.buttons.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal-backdrop">
          <div className="modal-content password-modal">
            <div className="modal-header">
              <h2>{t('passwordModal.title')}</h2>
              <button 
                className="close-button"
                onClick={() => setShowChangePasswordModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitPasswordChange}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t('passwordModal.currentPassword')} </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter current password"
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{t('passwordModal.newPassword')} </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter new password"
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{t('passwordModal.confirmPassword')} </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="newPasswordConfirm"
                      value={passwordData.newPasswordConfirm}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Confirm new password"
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className= "cancelbutton"
                  type="button" 
                  // className="btn btn-secondary"
                  onClick={() => setShowChangePasswordModal(false)}
                  disabled={isChangingPassword}
                >
                   {t("createAsset.buttons.cancel")}
                </button>
                <button 
                  type="submit" className="submitbutton"
                  // className="btn btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {t('passwordModal.buttons.change')}
                    </>
                  ) : (
                    t('passwordModal.buttons.change')
                  )}
                </button>
              </div>
            </form>
          </div>
        
        </div>
      )}
         
    </>
  );
};

export default Navbar;

