import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  FaEyeSlash,
  FaSearch,
} from "react-icons/fa";
// import './Navbar.css';
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCurrentLanguage } from "../store/translationSlice";
import API_BASE_URL from "../config/api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeroSection from "./HeroSection/HeroSection.js";

const Navbar = () => {
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation();
  const fullName = localStorage.getItem("name") || "User";
  const firstName = fullName.split(" ")[0];
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    customer_company: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    internal_notes: "",
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userName = localStorage.getItem("name") || "User";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const userDropdownRef = useRef(null);
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("access") !== null;

  // Check if current path is login or register page
  const isAuthPage = ["/login"].includes(location.pathname);

  // Get user role from localStorage
  // const userRole = localStorage.getItem('userRole');

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);
  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  const handleToggleUserDropdown = () => {
    setShowUserDropdown((prev) => !prev);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close the dropdown if clicking outside and not on the toggle button itself
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        !event.target.closest(
          'button[class*="flex items-center text-gray-300"]'
        )
      ) {
        setShowUserDropdown(false);
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
      if (isMobileMenuOpen && !event.target.closest(".mobilenav")) {
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
    switch (userRole) {
      case "admin":
        // return t('dashboard.adminTitle');
        return t("dashboard.buttons.M-Desk");
      case "ticket_manager":
        // return t('dashboard.ticket_managerTitle');
        return t("dashboard.buttons.M-Desk");
      case "customer_manager":
        // return t('dashboard.customer_managerTitle');
        return t("dashboard.buttons.M-Desk");
      case "sales_manager":
        // return t('dashboard.sales_managerTitle');
        return t("dashboard.buttons.M-Desk");
      case "user":
        // return t('dashboard.userTitle');
        return t("dashboard.buttons.M-Desk");
      default:
        // return t('dashboard.title');
        return t("dashboard.buttons.M-Desk");
    }
  })();
  const menuItems = (() => {
    switch (userRole) {
      case "ticket_manager":
        return [
          {
            path: "/dashboard/ticket-manager",
            label: t("sidebar.ticketManager.dashboard"),
            // icon: <FaClipboardList />
          },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.helpcenter"),
          },
          // {
          //   //  path: '/admin/dashboard',
          //     label: t('sidebar.admin.Knowledge'),
          //   },
          // {
          //   //  path: '/admin/dashboard',
          //     // label: t('sidebar.admin.Marketing'),
          //   },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.Trucks"),
          },
        ];
      case "customer_manager":
        return [
          {
            path: "/dashboard/customer-manager",
            label: t("sidebar.customerManager.dashboard"),
            // icon: <FaClipboardList />
          },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.helpcenter"),
          },
          // {
          //   //  path: '/admin/dashboard',
          //     label: t('sidebar.admin.Knowledge'),
          //   },
          // {
          //   //  path: '/admin/dashboard',
          //     label: t('sidebar.admin.Marketing'),
          //   },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.Trucks"),
          },
        ];
      case "sales_manager":
        return [
          {
            path: "/dashboard/sales-manager",
            label: t("sidebar.salesManager.dashboard"),
            // icon: <FaChartLine />
          },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.helpcenter"),
          },
          // {
          //   //  path: '/admin/dashboard',
          //     label: t('sidebar.admin.Knowledge'),
          //   },
          // {
          //   //  path: '/admin/dashboard',
          //     label: t('sidebar.admin.Marketing'),
          //   },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.Trucks"),
          },
        ];
      case "admin":
        return [
          {
            path: "/admin/dashboard",
            label: t("sidebar.admin.dashboard"),
            // icon: <FaClipboardList />
          },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.helpcenter"),
          },
          // {
          //   //  path: '/admin/dashboard',
          //     // label: t('sidebar.admin.Knowledge'),
          //   },
          // {
          //   //  path: '/admin/dashboard',
          //     // label: t('sidebar.admin.Marketing'),
          //   },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.Trucks"),
          },
        ];
      case "user":
        return [
          {
            path: "/dashboard/user",
            label: t("sidebar.user.dashboard"),
            // icon: <FaClipboardList />
          },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.helpcenter"),
          },
          // {
          //   //  path: '/admin/dashboard',
          //     // label: t('sidebar.admin.Knowledge'),
          //   },
          // {
          //   //  path: '/admin/dashboard',
          //     // label: t('sidebar.admin.Marketing'),
          //   },
          {
            //  path: '/admin/dashboard',
            label: t("sidebar.admin.Trucks"),
          },
        ];
      default:
        return [];
    }
  })();

  const getCreateButtonText = () => {
    switch (userRole) {
      case "admin":
        return "Create Manager";
      case "ticket_manager":
        return "Create Ticket";
      case "customer_manager":
        return "Add Customer";
      case "sales_manager":
        return "Create Sales Ticket";
      case "user":
        return "Create Ticket";
      default:
        return "Create";
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

  // Function to handle logout
  const handleLogout = async () => {
    // Get all dashboard components
    const dashboards = document.querySelectorAll(".dashboard-container");
    dashboards.forEach((dashboard) => {
      const component = dashboard.__reactFiber$;
      if (component && component.setShowLogoutLoader) {
        component.setShowLogoutLoader(true);
      }
    });

    setIsLoggingOut(true);
    setShowLogoutLoader(true);

    try {
      const refreshToken = localStorage.getItem("refresh");
      const accessToken = localStorage.getItem("access");

      if (!refreshToken || !accessToken) {
        console.error("Token not found");
        alert("You are already logged out");
        navigate("/");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.ok) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("userRole");
        localStorage.removeItem("name");
        localStorage.removeItem("userEmail");
        navigate("/");
      } else {
        if (response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("userRole");
          localStorage.removeItem("name");
          localStorage.removeItem("userEmail");
          navigate("/login");
          return;
        }
        const errorData = await response.json();
        console.error("Logout failed:", errorData);
        // alert(`Logout failed: ${errorData.error || 'Unexpected error occurred'}`);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("userRole");
        localStorage.removeItem("name");
        localStorage.removeItem("userEmail");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);

      // alert('An error occurred while logging out. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutLoader(false);
      // Reset loader state in all dashboard components
      const dashboards = document.querySelectorAll(".dashboard-container");
      dashboards.forEach((dashboard) => {
        const component = dashboard.__reactFiber$;
        if (component && component.setShowLogoutLoader) {
          component.setShowLogoutLoader(false);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    // Add your API call here to submit the ticket
    console.log("New Ticket:", newTicket);
    setShowTicketModal(false);
    // Reset form
    setNewTicket({
      title: "",
      description: "",
      priority: "",
      category: "",
      customer_company: "",
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      internal_notes: "",
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

  // Update userProfile to use the name from localStorage
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

  // Add these language options
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside the dropdown container and not on the toggle button
      if (
        isLanguageDropdownOpen &&
        !event.target.closest(".language-dropdown-container") &&
        !event.target.closest('button[class*="FaGlobe"]')
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLanguageDropdownOpen]);

  // Add useEffect to handle the custom event for ticket refresh
  useEffect(() => {
    const handleRefreshTickets = (event) => {
      // This event will be caught by your tickets component to refresh the list
      console.log("Refreshing tickets for language:", event.detail.language);
    };

    window.addEventListener("refreshTickets", handleRefreshTickets);

    return () => {
      window.removeEventListener("refreshTickets", handleRefreshTickets);
    };
  }, []);

  // Post-login dashboard navbar
  // if (showLogoutLoader) {
  //   return (
  //     <div className="loader-overlay">
  //       <div className="loader-content">
  //         <div className="modern-loader"></div>
  //         <div className="loader-text">Logging out...</div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#1b1b1b] shadow-md w-full">
        {/* Desktop & Tablet Navigation */}
        <div className=" mx-auto px-4 ">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center">
              <span className="font-bold text-gray-200 text-lg">
                {navbarTitle}
              </span>
            </Link>

            {/* <HeroSection /> */}

            {/* Desktop Menu Items */}
            <nav className="hidden  lg:flex items-center space-x-[1.25rem]">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`no-underline  text-gray-300 hover:text-white px-3 py-2  text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-gray-800 text-white"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className=" mx-4 px-1 sm:px-2 md:px-4 bg-[#1b1b1b]">
      <div className="max-w-[200px]  sm:max-w-[40rem] md:max-w-[44rem] lg:max-w-lg  ">
      <form className="flex w-full " onSubmit={(e) => {
        e.preventDefault();
        // handleSearch();
      }}>
        <input
          type="text"
          className="w-[100%] px-1 sm:px-3 md:px-4 py-1 sm:py-2 text-sm  -l-md focus:outline-none focus:ring-2  focus:border-transparent bg-transparent outline-none "
          // placeholder={isUsersView ? t("Search users...") : t("dashboard.tickets.search")}
          // value={searchQuery}
          // onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="  px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-sm sm:text-base -r-md transition duration-200 bg-[#1b1b1b] text-#1b1b1b"
        >
          <span className="hidden sm:inline">{t("dashboard.buttons.Search")}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
    </div>
  </div>

              {/* Language Dropdown */}
              <div className="relative z-[100] language-dropdown-container">
                {/* <FaSearch className='text-white h-4 w-4 '/> */}
                <button
                  className="text-gray-300 hover:text-white p-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                  }}
                >
                  <FaGlobe className="h-5 w-5" />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800  shadow-lg py-1 z-[60]">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`w-full text-left px-4 py-2 text-sm z-[60] ${
                          i18n.language === lang.code
                            ? "bg-gray-700 text-white"
                            : "text-gray-300 hover:bg-gray-700"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          changeLanguage(lang.code);
                        }}
                      >
                        <span className="mr-2 z-[60]">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {i18n.language === lang.code && (
                          <span className="ml-2">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  className="flex items-center text-gray-300 hover:text-white px-2 py-2  text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling
                    handleToggleUserDropdown();
                  }}
                >
                  <FaUserCircle className="h-5 w-5 mr-2" />
                  <span className="mr-1 text-[1rem]">{firstName}</span>
                  <FaChevronDown className="h-3 w-3" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800  shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-start">
                        <FaUserCircle className="h-10 w-10 text-gray-400 mr-3" />
                        <div>
                          <div className="text-white font-medium">
                            {userProfile.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {userProfile.role}
                          </div>
                          {userProfile.email && (
                            <div className="text-xs text-gray-400 mt-1">
                              {userProfile.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
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
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <div className="flex items-center">
                            <div className="mr-3 h-4 w-4 border-2 border-t-transparent border-red-400 rounded-full animate-spin"></div>
                            <span>{t("navbar.logout")}</span>
                          </div>
                        ) : (
                          <>
                            <FaSignOutAlt className="h-4 w-4 mr-3 text-red-400" />
                            {t("navbar.logout")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-300 hover:text-white p-2"
              onClick={handleToggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 mobilenav z-[100]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`block px-3 py-2  text-base font-medium ${
                    location.pathname === item.path
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-gray-700 my-2"></div>

              {/* Language Options */}
              <div className="px-3 py-2">
                <div className="text-gray-400 text-sm mb-2">Language</div>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`flex items-center px-3 py-2  text-sm ${
                        i18n.language === lang.code
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation
                        changeLanguage(lang.code);
                        setIsMobileMenuOpen(false); // Close mobile menu after selection
                      }}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700 my-2"></div>

              {/* User Options */}
              <div className="px-3 py-2">
                <div className="flex items-center mb-4">
                  <FaUserCircle className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">
                      {userProfile.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {userProfile.role}
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
            </div>
          </div>
        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white  shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4">
              <h5 className="text-lg font-semibold">{t("ticketForm.title")}</h5>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowTicketModal(false)}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket}>
              <div className="p-4 space-y-4">
                {/* Basic Ticket Info */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("ticketForm.fields.title")}{" "}
                    <span className="text-red-500">{t("common.required")}</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter ticket title"
                    value={newTicket.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed description"
                    rows="3"
                    value={newTicket.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-[100]">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_company"
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                      value={newTicket.customer_company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contact name"
                      value={newTicket.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                      value={newTicket.customer_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                      value={newTicket.customer_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Internal Notes
                  </label>
                  <textarea
                    name="internal_notes"
                    className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any internal notes or comments"
                    rows="2"
                    value={newTicket.internal_notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="border-t p-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300  text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowTicketModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 transition-colors"
                >
                  {t("ticketForm.buttons.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
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

export default Navbar;
