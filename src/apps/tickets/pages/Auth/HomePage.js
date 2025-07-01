
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Nav, Button, Container } from "react-bootstrap";
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { setCurrentLanguage } from "../../store/translationSlice";
import { 
  FaTicketAlt,
  FaGlobe,
  FaRegCopyright,
  FaBars,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUsers,
  FaCog,
  FaUserCircle,
  FaChevronDown,
  FaTimes,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
// import { loginSuccess } from '../../../../redux/slices/authSlice';
import { useTranslation } from 'react-i18next';
import Footer from "../../../../SharedComponent/Footer/Footer";
const HomePage = () => {
  const { i18n, t } = useTranslation();
   const location = useLocation();
   const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  // const [navbarExpanded, setNavbarExpanded] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [userRole, setUserRole] = useState(null); // Store user role
  const [dashboardName, setDashboardName] = useState(''); 
  const userDropdownRef = useRef(null); 
  const userName = localStorage.getItem('name') || 'User';
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const fullName = localStorage.getItem('name') || 'User';
  const firstName = fullName.split(' ')[0]; 
  const navigate = useNavigate();
  const dispatch = useDispatch();
 
  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access');
    const role = localStorage.getItem('userRole');
    if (accessToken) {
      setIsLoggedIn(true);
      setUserRole(role);
      // setDashboardName(getDashboardName(role));
    }
  }, []);
 
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
  const handleLogout = () => {
    // Handle logout logic here
    localStorage.removeItem('access');
    localStorage.removeItem('userRole');
    localStorage.removeItem('name');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };
  const getDashboardName = (role) => {
    switch (role) {
      case 'admin':
        return t('dashboard.adminTitle');
      case 'ticket_manager':
        return t('dashboard.ticket_managerTitle');
      case 'customer_manager':
        return t('dashboard.customer_managerTitle');
      case 'sales_manager':
        return t('dashboard.sales_managerTitle');
      case 'user':
        return t('dashboard.userTitle');
      default:
        return t('dashboard.title');
    }
  };
  const handleLoginClick = () => {
    navigate('/login');
  };
  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleNavToggle = () => {
    // setNavbarExpanded(!navbarExpanded);
  };
 
  // const handleNavLinkClick = (path) => {
  //   navigate(path);
  //   setNavbarExpanded(false); 
  // };
  const handleToggleUserDropdown = () => {
    setShowUserDropdown((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false); // Close dropdown if clicked outside
      }
    };

  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
     
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

  const handleTicketSystemClick = () => {
    if (!isLoggedIn) {
      toast.warn(t("toast.loginMessage"));
      return;
    }
  
    
    let targetRoute = '/dashboard'; // Default route
    switch (userRole) {
      case 'admin':
        targetRoute = '/admin/dashboard';
        break;
      case 'customer_manager':
        targetRoute = '/dashboard';
        break;
      case 'asset_manager':
        targetRoute = '/dashboard';
        break;
      case 'warehouse_manager':
        targetRoute = '/dashboard';
        break;
      case 'finance_manager':
        targetRoute = '/dashboard';
        break;
      default:
        break;
    }
    navigate(targetRoute);
  };

  const navbarTitle = (() => {
    switch(userRole) {
      case 'admin':
        // return t('dashboard.adminTitle');
        return t("createAsset.buttons.M-Desk");
      case 'ticket_manager':
        // return t('dashboard.ticket_managerTitle');
        return t("createAsset.buttons.M-Desk");
      case 'customer_manager':
        // return t('dashboard.customer_managerTitle');
        return t("createAsset.buttons.M-Desk");
      case 'sales_manager':
        // return t('dashboard.sales_managerTitle');
        return t("createAsset.buttons.M-Desk");
      case 'user':
        // return t('dashboard.userTitle');
        return t("createAsset.buttons.M-Desk");
      default:
        // return t('dashboard.title');
        return t("createAsset.buttons.M-Desk");
    }
  })();
 
  const menuItems = [
    { label: t('createAsset.buttons.TicketSystem'), onClick: handleTicketSystemClick },
    { label: t('createAsset.buttons.HelpCenter') },
    { label: t('createAsset.buttons.Knowledge') },
    { label: t('createAsset.buttons.Marketing') },
    { label: t('createAsset.buttons.Trucks') },
  ];

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
        dispatch(setCurrentLanguage(lang));
        setIsLanguageDropdownOpen(false);

      }
    } catch (error) {
      console.error('Language change failed:', error);
      alert('Failed to change language');
    }
  };
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
  
    
      
  
  return (
    <>
    <header className="dashboard-header bg-dark shadow-sm" >
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
                  <div key={index} onClick={item.onClick}>
                    <span className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}>
                      {item.label}
                    </span>
                  </div>
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
            {isLoggedIn ? (
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
                      <button className="dropdown-item" onClick={handleLogout}>
                        <FaSignOutAlt className="dropdown-icon" />
                        {t('navbar.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.buttonGroup}>
                  <Button style={styles.loginButton} onClick={() => navigate('/login')}>{t("createAsset.buttons.Login")}</Button>
                  <Button style={styles.signUpButton} onClick={() => navigate('/register')}>{t("createAsset.buttons.Signup")}</Button>
                </div>
              )}
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
                  <div key={index} onClick={item.onClick}>
                    <span className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}>
                      {item.label}
                    </span>
                  </div>
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
            {isLoggedIn ? (
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
                      <button className="dropdown-item" onClick={handleLogout}>
                        <FaSignOutAlt className="dropdown-icon" />
                        {t('navbar.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.buttonGroup1}>
                  <Button style={styles.loginButton1} onClick={() => navigate('/login')}>{t("createAsset.buttons.Login")}</Button>
                  <Button style={styles.signUpButton1} onClick={() => navigate('/register')}>{t("createAsset.buttons.Signup")}</Button>
                </div>
              )}
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
      
      <div className="flex flex-col justify-between min-h-screen bg-dark text-white">
  {/* Main content section */}
  <div className="flex flex-col items-center text-center px-4 pt-16 md:pt-24 lg:pt-32">
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
      {t("createAsset.buttons.M-Desk")}
    </h1>
    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8">
      A high quality Bootstrap 4 template for your digital products with help center
    </p>
    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 transition duration-300">
      VIEW PRODUCTS
    </button>
  </div>
  
  {/* Footer will stay at the bottom */}
  <Footer />
</div>
     
    </>
    
  );
};
const styles = {
 
  buttonGroup: {
    display: 'flex',
    gap: '0.1px',
    alignItems: 'center',
    position: 'relative',
    left: "1000px",
  },
  buttonGroup1: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '0.3rem 0.8rem',
    transition: 'color 0.3s ease',
    fontSize: '0.8rem',
    position: 'fixed',
    right: '120px', /* Adjusted */
    top: '20px' /* Ensuring alignment */
  },
  
  signUpButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '0.3rem 0.8rem',
    transition: 'color 0.3s ease',
    fontSize: '0.8rem',
    position: 'fixed',
    right: '20px', /* Positioned left of login */
    top: '20px' /* Same top alignment */
  },
  loginButton1: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '0.3rem 0.8rem',
    transition: 'color 0.3s ease',
    fontSize: '0.8rem',
  },
  
  signUpButton1: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '0.3rem 0.8rem',
    transition: 'color 0.3s ease',
    fontSize: '0.8rem',
  },
  
 
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '2rem',
    maxWidth: '600px',
  },
  viewProductsButton: {
    backgroundColor: 'rgb(56, 73, 228)',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '1px',
    color: 'white',
    fontSize: '1rem',
    width: 'fit-content',
  },
};


export default HomePage;