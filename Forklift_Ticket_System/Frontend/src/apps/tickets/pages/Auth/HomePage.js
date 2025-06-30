import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Nav, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { setCurrentLanguage } from "../../../../store/translationSlice";
import axios from "axios";
import API_BASE_URL from "../../../../config/api.js";
// updated
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
  FaEyeSlash,
} from "react-icons/fa";
import { loginSuccess } from "../../../../redux/slices/authSlice";
import { useTranslation } from "react-i18next";
import Footer from "../../../../components/Footer/Footer";
const HomePage = () => {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [userRole, setUserRole] = useState(null); // Store user role
  const [dashboardName, setDashboardName] = useState("");
  const userDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null); // Add ref for language dropdown
  const userName = localStorage.getItem("name") || "User";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const fullName = localStorage.getItem("name") || "User";
  const firstName = fullName.split(" ")[0];
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [allRoles , setAllRoles] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    dispatch(setCurrentLanguage(localStorage.getItem('selectedLanguage')));
                  i18n.changeLanguage(localStorage.getItem('selectedLanguage'));
    // Check if user is logged in
    const accessToken = localStorage.getItem("access");
    const role = localStorage.getItem("userRole");
    const all_roles = JSON.parse(localStorage.getItem("allRoles"));
    console.log("all assigned roles = " , all_roles )
    if (accessToken) {
      setIsLoggedIn(true);
      setUserRole(role);
      setAllRoles(all_roles); 
    }
  }, []);

  const userProfile = {
    name: fullName,
    email: localStorage.getItem("userEmail"),
    role: (() => {
      const role = localStorage.getItem("userRole");
      switch (role) {
        case "admin":
          return "Administrator";
        case "ticket_manager":
          return "Ticket Manager";
        case "customer_manager":
          return "Customer Manager";
        case "sales_manager":
          return "Sales Manager";
        case "user":
          return "User";
        default:
          return "User";
      }
    })(),
  };

  const handleLogout = () => {
    // Handle logout logic here
    localStorage.removeItem("access");
    localStorage.removeItem("userRole");
    localStorage.removeItem("name");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const getDashboardName = (role) => {
    switch (role) {
      case "admin":
        return t("dashboard.adminTitle");
      case "ticket_manager":
        return t("dashboard.ticket_managerTitle");
      case "customer_manager":
        return t("dashboard.customer_managerTitle");
      case "sales_manager":
        return t("dashboard.sales_managerTitle");
      case "user":
        return t("dashboard.userTitle");
      default:
        return t("dashboard.title");
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    // Close any open dropdowns when mobile menu is toggled
    setIsLanguageDropdownOpen(false);
    setShowUserDropdown(false);
  };

  const handleToggleUserDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setShowUserDropdown((prev) => !prev);
    // Close language dropdown when user dropdown is opened
    setIsLanguageDropdownOpen(false);
  };

  const handleToggleLanguageDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setIsLanguageDropdownOpen((prev) => !prev);
    // Close user dropdown when language dropdown is opened
    setShowUserDropdown(false);
  };

  // Handle clicks outside the user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }

      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    // Attach event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle clicks outside mobile menu
  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (isMobileMenuOpen && !event.target.closest(".mobilenav")) {
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
      toast.warn("Please log in to access the Ticket System.");
      return;
    }
    // Navigate to the appropriate dashboard based on user role

    if(userRole === "user") 
    {
      toast.error("You dont have permission to access the dashboard")
      return ; 
    }

    let targetRoute = "/dashboard"; // Default route
    switch (userRole) {
      case "admin":
        targetRoute = "/admin/dashboard";
        break;
      case "customer_manager":
        targetRoute = "/dashboard/customer-manager";
        break;
      case "ticket_manager":
        targetRoute = "/dashboard/ticket-manager";
        break;
      case "sales_manager":
        targetRoute = "/dashboard/sales-manager";
        break;
      case "user":
        targetRoute = "/dashboard/user";
        break;
      default:
        break;
    }

    navigate(targetRoute);
  };

  const navbarTitle = (() => {
    switch (userRole) {
      case "admin":
        return t("dashboard.buttons.M-Desk");
      case "ticket_manager":
        return t("dashboard.buttons.M-Desk");
      case "customer_manager":
        return t("dashboard.buttons.M-Desk");
      case "sales_manager":
        return t("dashboard.buttons.M-Desk");
      case "user":
        return t("dashboard.buttons.M-Desk");
      default:
        return t("dashboard.buttons.M-Desk");
    }
  })();

  const menuItems = [
    {
      label: t("sidebar.ticketManager.dashboard"),
      onClick: handleTicketSystemClick,
    },
    { label: t("sidebar.admin.helpcenter") },
    // { label: t('sidebar.admin.Knowledge') },
    // { label: t('sidebar.admin.Marketing') },
    { label: t("sidebar.admin.Trucks") },
  ];

  const changeLanguage = async (lang) => {
    try {
      // Temporarily store current language
      const prevLang = i18n.language;

      // Only proceed if the selected language is different
      if (prevLang !== lang) {
        // Change the i18n language
        await i18n.changeLanguage(lang);
        localStorage.setItem("selectedLanguage", lang);
        dispatch(setCurrentLanguage(lang));
        // Close the dropdown
        setIsLanguageDropdownOpen(false);
      }
    } catch (error) {
      console.error("Language change failed:", error);
      alert("Failed to change language");
    }
  };

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();

    // First check if new passwords match
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error("New passwords do not match!", {
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
      toast.error("New password cannot be the same as current password!", {
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
    const token = localStorage.getItem("access");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/update-password/`,
        {
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        if (!toast.isActive("password-success")) {
          toast.success("Password changed successfully!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            toastId: "password-success",
          });
        }
        setShowChangePasswordModal(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          newPasswordConfirm: "",
        });
      }
    } catch (error) {
      if (error.response) {
        // Check for incorrect current password error
        if (
          error.response.status === 400 &&
          error.response.data?.message
            ?.toLowerCase()
            .includes("current password")
        ) {
          toast.error("Current password is incorrect!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        } else if (error.response.status === 401) {
          toast.error("Session expired. Please login again.", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          navigate("/login");
        } else {
          // For any other error
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.detail ||
            "Current password is incorrect";
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
        toast.error("Network error. Please check your connection.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
      console.error("Error changing password:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };
  const validatePassword = (password) => {
    const passwordCriteria =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordCriteria.test(password)) {
      return {
        isValid: false,
        message:
          "New password must be at least 8 characters long, include uppercase, lowercase, digits, and special characters.",
      };
    }
    return { isValid: true };
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900 ">
        <header className="w-full bg-[#1b1b1b] shadow-md">
          {/* Desktop Navigation */}
          <div className="hidden md:block w-full">
            <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-8">
              <div className="flex justify-between items-center h-16 z-[60]">
                {/* Logo and Title */}
                <Link to="/" className="flex items-center">
                  <span className="font-bold text-gray-300 text-lg hover:text-white transition-colors">
                    {navbarTitle}
                  </span>
                </Link>

                {/* Nav Items */}
                <nav className="flex items-center space-x-4 z-[60]">
                  {menuItems.map((item, index) => (
                    <div
                      key={index}
                      onClick={item.onClick}
                      className="cursor-pointer"
                    >
                      <span
                        className={`text-gray-300 hover:text-white px-3 py-2 transition-colors ${
                          location.pathname === item.path
                            ? "text-white border-b-2 border-blue-500"
                            : ""
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}

                  {/* Language Dropdown */}
                  <div className="relative z-[60]" ref={languageDropdownRef}>
                    <button
                      className="p-2 text-gray-300 hover:text-white transition-colors"
                      onClick={handleToggleLanguageDropdown}
                    >
                      <FaGlobe className="w-5 h-5" />
                    </button>

                    {isLanguageDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800  shadow-lg z-[60]">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            className={`w-full text-left px-4 py-2 flex items-center justify-between text-sm text-gray-300 hover:bg-gray-700 ${
                              i18n.language === lang.code ? "bg-gray-700" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              changeLanguage(lang.code);
                            }}
                          >
                            <div className="flex items-center">
                              <span className="mr-2">{lang.flag}</span>
                              <span>{lang.name}</span>
                            </div>
                            {i18n.language === lang.code && (
                              <span className="text-green-500">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User Menu / Login Buttons */}
                  {isLoggedIn ? (
                    <div className="relative" ref={userDropdownRef}>
                      <button
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                        onClick={handleToggleUserDropdown}
                      >
                        <FaUserCircle className="w-5 h-5" />
                        <span className="text-[1rem]">{firstName}</span>
                        <FaChevronDown className="w-3 h-3" />
                      </button>

                      {showUserDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-gray-800  shadow-lg z-10">
                          <div className="p-4 border-b border-gray-700">
                            <div className="flex items-start space-x-3">
                              <FaUserCircle className="w-10 h-10 text-gray-400 " />
                              <div className="flex flex-col">
                                <span className="font-medium text-white">
                                  {userProfile.name}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {userProfile.role}
                                </span>
                                {userProfile.email && (
                                  <span className="text-xs text-gray-400">
                                    {userProfile.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {userRole === "admin" && (
                            <Link
                              to="/admin/users"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                            >
                              <FaUsers className="h-4 w-4 mr-3 text-gray-400" />
                              {t('users.users')}
                            </Link>
                          )}
                          <button
                            onClick={() => setShowChangePasswordModal(true)}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                          >
                            <FaCog className="h-4 w-4 mr-3 text-gray-400" />
                            {t("navbar.changePassword")}
                          </button>

                          <div className="border-t border-gray-700 my-1"></div>

                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleLogout();
                                              setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full block px-3 py-2  text-base font-medium text-red-400 hover:bg-gray-700 text-left mt-2"
                                            disabled={isLoggingOut}
                                          >
                                            <div className="flex items-center">
                                              {isLoggingOut ? (
                                                <div className="mr-3 h-5 w-5 border-2 border-t-transparent border-red-400 rounded-full animate-spin"></div>
                                              ) : (
                                                <FaSignOutAlt className="h-5 w-5 mr-3 text-red-400" />
                                              )}
                                              {t("navbar.logout")}
                                            </div>
                                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-transparent border border-blue-500  hover:bg-blue-500 text-white transition-colors"
                        onClick={() => navigate("/login")}
                      >
                        {t("dashboard.buttons.Login")}
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white  hover:bg-blue-600 transition-colors"
                        onClick={() => navigate("/register")}
                      >
                        {t("dashboard.buttons.Signup")}
                      </button>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden w-full">
            <div className="px-4 w-full">
              <div className="flex justify-between items-center h-16">
                <Link to="/" className="flex items-center">
                  <span className="font-bold text-gray-300 text-lg">
                    {navbarTitle}
                  </span>
                </Link>

                <button
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  onClick={handleToggleMobileMenu}
                >
                  {isMobileMenuOpen ? (
                    <FaTimes className="w-6 h-6" />
                  ) : (
                    <FaBars className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <nav className="w-full bg-gray-800 px-4 pt-2 pb-4 shadow-md mobilenav">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2 cursor-pointer"
                  >
                    <span
                      className={`block text-gray-300 hover:text-white transition-colors ${
                        location.pathname === item.path
                          ? "text-white font-medium"
                          : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}

                {/* Mobile Language Dropdown */}
                <div className="py-2" ref={languageDropdownRef}>
                  <button
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                    onClick={handleToggleLanguageDropdown}
                  >
                    <FaGlobe className="w-5 h-5 mr-2" />
                    <span>Language</span>
                  </button>

                  {isLanguageDropdownOpen && (
                    <div className="mt-2 bg-gray-700  w-full">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between text-sm text-gray-300 hover:bg-gray-600 ${
                            i18n.language === lang.code ? "bg-gray-600" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            changeLanguage(lang.code);
                          }}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                          {i18n.language === lang.code && (
                            <span className="text-green-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile User Menu / Login Buttons */}
                {isLoggedIn ? (
                  <div className="py-2" ref={userDropdownRef}>
                    <button
                      className="flex items-center w-full text-gray-300 hover:text-white transition-colors"
                      onClick={handleToggleUserDropdown}
                    >
                      <FaUserCircle className="w-5 h-5 mr-2" />
                      <span>{firstName}</span>
                      <FaChevronDown className="w-3 h-3 ml-1" />
                    </button>

                    {showUserDropdown && (
                      <div className="mt-2 bg-gray-700  w-full">
                        <div className="p-3 border-b border-gray-600">
                          <div className="flex items-start space-x-3">
                            <FaUserCircle className="w-8 h-8 text-gray-400" />
                            <div>
                              <span className="font-medium text-white">
                                {userProfile.name}
                              </span>
                              <div className="text-sm text-gray-400">
                                {userProfile.role}
                              </div>
                              {userProfile.email && (
                                <div className="text-xs text-gray-400">
                                  {userProfile.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {userRole === "admin" && (
                          <Link
                            to="/admin/users"
                            className="block px-3 py-2  text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <FaUsers className="h-5 w-5 mr-3 text-gray-400" />
                              {t('users.users')}
                            </div>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setShowChangePasswordModal(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full block px-3 py-2  text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white text-left"
                        >
                          <div className="flex items-center">
                            <FaCog className="h-5 w-5 mr-3 text-gray-400" />
                            {t("navbar.changePassword")}
                          </div>
                        </button>

                        <button
                          className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>{t("navbar.logout")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 py-2">
                    <button
                      className="w-full px-4 py-2 bg-transparent border border-blue-500 text-white  hover:bg-blue-500 text-white transition-colors text-center"
                      onClick={() => navigate("/login")}
                    >
                      {t("dashboard.buttons.Login")}
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-blue-500 text-white  hover:bg-blue-600 transition-colors text-center"
                      onClick={() => navigate("/register")}
                    >
                      {t("dashboard.buttons.Signup")}
                    </button>
                  </div>
                )}
              </nav>
            )}
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
          className="z-50"
        />

        {/* Hero Section - Full Height & Width */}
        <div className="flex-grow flex items-center justify-center w-full bg-[#262626] px-4">
          <div className="max-w-screen-2xl mx-auto py-16 md:py-20 w-full text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t("dashboard.buttons.M-Desk")}
            </h1>

          <div className="flex flex-col gap-3 my-2 ">
             {userRole === "user" && <div className="text-gray-200">
              {
                allRoles.length > 0 && allRoles.includes("customer_manager") && <button onClick={() => {navigate("/dashboard/customer-manager")}} className="px-3 py-2 bg-slate-900 text-gray-200 ">Customer Manager Dashboard</button>
                
              }
            </div>}

            {userRole === "user" && <div className="text-gray-200">
              {
                allRoles.length > 0 && allRoles.includes("ticket_manager") && <button onClick={() => {navigate("/dashboard/ticket-manager")}} className="px-3 py-2 bg-slate-900 text-gray-200 ">Ticket Manager Dashboard</button>
                
              }
            </div>}
             {userRole === "user" && <div className="text-gray-200">
              {
                allRoles.length > 0 && allRoles.includes("sales_manager") && <button onClick={() => {navigate("/dashboard/sales-manager")}} className="px-3 py-2 bg-slate-900 text-gray-200 ">Sales Manager Dashboard</button>
                
              }
            </div>}
          </div>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              {t('HomePage.centerHeader')}
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white font-medium  hover:bg-blue-600 transition-colors uppercase tracking-wide text-lg">
              {t('HomePage.viewProductsBtn')}
            </button>
          </div>
        </div>

        {/* Footer at the bottom of the screen */}
        <Footer />
      </div>

      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white  shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">
                {t("passwordModal.title")}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowChangePasswordModal(false)}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPasswordChange}>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("passwordModal.currentPassword")} *
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder={t("passwordModal.currentPasswordPlaceholder")}
                      minLength="8"
                      className="w-full px-4 py-2 border  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("passwordModal.newPassword")} *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                     placeholder={t("passwordModal.newPasswordPlaceholder")}
                      minLength="8"
                      className="w-full px-4 py-2 border  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("passwordModal.confirmPassword")} *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="newPasswordConfirm"
                      value={passwordData.newPasswordConfirm}
                      onChange={handlePasswordChange}
                      required
                      placeholder={t("passwordModal.confirmPasswordPlaceholder")}
                      minLength="8"
                      className="w-full px-4 py-2 border  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t p-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100  hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => setShowChangePasswordModal(false)}
                  disabled={isChangingPassword}
                >
                  {t("dashboard.buttons.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("passwordModal.buttons.change")}
                    </div>
                  ) : (
                    t("passwordModal.buttons.change")
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

export default HomePage;
