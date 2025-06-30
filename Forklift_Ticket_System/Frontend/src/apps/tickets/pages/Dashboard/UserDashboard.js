import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {DateTime} from 'luxon' ; 
import {
  FaTimes,
  FaTicketAlt,
  FaRegCopyright,
  FaUpload,
  FaFile,
  FaDownload,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import API_BASE_URL from "../../../../config/api.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeroSection from "../../../../components/HeroSection/HeroSection.js";
import { DashboardLoader } from "../../../../components/Loader";
import Footer from "../../../../components/Footer/Footer.jsx";
const UserDashboard = () => {
  const navigate = useNavigate();
  const { t  ,i18n} = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }
    localStorage.setItem("userRole", "user");
    fetchUserTickets();
  }, [navigate]);

  const formatTimestamp = (timestamp) => {
     
      const berlinTime = DateTime.fromISO(timestamp);
      const formatted = berlinTime.setZone('Europe/Berlin').toFormat('dd-MM-yyyy HH:mm:ss');
      console.log(formatted);
      return formatted; 
    };

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { currentLanguage } = useSelector((state) => state.translation);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    priority: false,
    department: false,
    countryCode: false,
    category: false,
  });
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "",
    customer_company: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    category: "",
    department: "",
    internal_notes: "",
    status: "new",
    related_ticket: [],
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    department: "",
  });
  const [relatedTickets, setRelatedTickets] = useState([]);
  const [itemsPerPage] = useState(10);
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRelatedTickets, setSelectedRelatedTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [ticketsPerPage] = useState(10);
  const [loadingTicketId, setLoadingTicketId] = useState(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketReplies, setTicketReplies] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const handleSubmit = () => {
    console.log("Submit");
  };
  const countryCodes = [
    { code: "+1", name: "United States", flag: "🇺🇸" },
    { code: "+91", name: "India", flag: "🇮🇳" },
    { code: "+43", name: "Austria", flag: "🇦🇹" },
    { code: "+32", name: "Belgium", flag: "🇧🇪" },
    { code: "+359", name: "Bulgaria", flag: "🇧🇬" },
    { code: "+385", name: "Croatia", flag: "🇭🇷" },
    { code: "+357", name: "Cyprus", flag: "🇨🇾" },
    { code: "+420", name: "Czech Republic", flag: "🇨🇿" },
    { code: "+45", name: "Denmark", flag: "🇩🇰" },
    { code: "+372", name: "Estonia", flag: "🇪🇪" },
    { code: "+358", name: "Finland", flag: "🇫🇮" },
    { code: "+33", name: "France", flag: "🇫🇷" },
    { code: "+49", name: "Germany", flag: "🇩🇪" },
    { code: "+30", name: "Greece", flag: "🇬🇷" },
    { code: "+353", name: "Ireland", flag: "🇮🇪" },
    { code: "+36", name: "Hungary", flag: "🇭🇺" },
    { code: "+354", name: "Iceland", flag: "🇮🇸" },
    { code: "+39", name: "Italy", flag: "🇮🇹" },
    { code: "+371", name: "Latvia", flag: "🇱🇻" },
    { code: "+423", name: "Liechtenstein", flag: "🇱🇮" },
    { code: "+370", name: "Lithuania", flag: "🇱🇹" },
    { code: "+352", name: "Luxembourg", flag: "🇱🇺" },
    { code: "+356", name: "Malta", flag: "🇲🇹" },
    { code: "+31", name: "Netherlands", flag: "🇳🇱" },
    { code: "+47", name: "Norway", flag: "🇳🇴" },
    { code: "+48", name: "Poland", flag: "🇵🇱" },
    { code: "+351", name: "Portugal", flag: "🇵🇹" },
    { code: "+40", name: "Romania", flag: "🇷🇴" },
    { code: "+7", name: "Russia", flag: "🇷🇺" },
    { code: "+421", name: "Slovakia", flag: "🇸🇰" },
    { code: "+386", name: "Slovenia", flag: "🇸🇮" },
    { code: "+41", name: "Switzerland", flag: "🇨🇭" },
    { code: "+46", name: "Sweden", flag: "🇸🇪" },
    { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
    { code: "+380", name: "Ukraine", flag: "🇺🇦" },
    // Add more countries as needed
  ];
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countryCodes[0].code
  );

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const departmentDropdownRef = useRef(null);

  const validatePhone = (phone) => {
    // const phoneRegex = /^\d{10}$/;
    const phoneRegex = /^\+\d{1,3} \d{1,12}$/;
    return phoneRegex.test(phone);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle status dropdown
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdownOpen(false);
      }

      // Handle priority dropdown
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target)
      ) {
        setPriorityDropdownOpen(false);
      }

      // Handle department dropdown
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target)
      ) {
        setDepartmentDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add the fetchTickets function
  const fetchTickets = async (token, language) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return axios.get(
      `${API_BASE_URL}/tickets/?target_language=${currentLanguage}`,
      { headers }
    );
  };
  const refreshToken = async () => {
      const refresh = localStorage.getItem("refresh");
  
      if (!refresh) {
        throw new Error("No refresh token available");
      }
  
      try {
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refresh,
        });
  
        const newAccessToken = response.data.access;
        localStorage.setItem("access", newAccessToken);
        return newAccessToken;
      } catch (error) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        throw new Error("Failed to refresh token");
      }
    };
  // Update the useEffect that fetches initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("access");

      try {
        const ticketsResponse = await fetchTickets(token, currentLanguage);
        setTickets(ticketsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentLanguage]); // Add selectedLanguage as dependency

  // Update the handleRefreshTickets event listener
  useEffect(() => {
    const handleRefreshTickets = async (event) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access");
        const newLanguage = event.detail.language;

        const response = await fetchTickets(token, newLanguage);
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("refreshTickets", handleRefreshTickets);
    return () =>
      window.removeEventListener("refreshTickets", handleRefreshTickets);
  }, []);

  // Fetch user's tickets
  useEffect(() => {
    fetchUserTickets();
    fetchRelatedTickets();
  }, []);

  const fetchUserTickets = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setError(t("errors.authRequired"));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/?target_language=${currentLanguage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTickets(response.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(t("errors.fetchTickets"));
    } finally {
      setLoading(false);
    }
  };
  const handleSaveComment = async (ticketId, commentText) => {
    if (isSubmittingComment || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const token = localStorage.getItem("access");
      const userName = localStorage.getItem("name");

      const payload = {
        comments: [
          {
            name: userName || "Anonymous",
            comment: commentText.trim(),
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const response = await axios.put(
        `${API_BASE_URL}/tickets/${ticketId}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setReplyText("");
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.ticket_id === ticketId
              ? { ...ticket, last_updated: new Date().toISOString() } // Update last_updated
              : ticket
          )
        );
        setTicketReplies((prev) => ({
          ...prev,
          [ticketId]: [
            ...(prev[ticketId] || []),
            {
              text: commentText,
              timestamp: new Date().toISOString(),
              name: userName || "Anonymous",
            },
          ],
        }));

        toast.success("Comment added successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      toast.error("Failed to save comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  const handleTicketClick = (ticketId) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null); // Collapse if already expanded
    } else {
      setExpandedTicketId(ticketId); // Expand clicked ticket
    }
  };
  const getFilteredTickets = () => {
    const query = searchQuery.toLowerCase().trim();
    console.log("Filtering with query:", query);

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query || // If no search query, show all tickets
        ticket.ticket_id?.toString().toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query) ||
        ticket.customer_name?.toLowerCase().includes(query) ||
        ticket.customer_company?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query);

      const matchesStatus =
        !filters.status ||
        ticket.status.toLowerCase() === filters.status.toLowerCase();

      const matchesPriority =
        !filters.priority ||
        ticket.priority.toLowerCase() === filters.priority.toLowerCase();

      const matchesDepartment =
        !filters.department || ticket.department === filters.department;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesDepartment
      );
    });
  };
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return getFilteredTickets().slice(startIndex, endIndex);
  };

  const fetchRelatedTickets = async (department) => {
    const token = localStorage.getItem("access");
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!department) {
      setRelatedTickets([]);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/by-department/?target_language=${currentLanguage}`,
        { department: department },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const filteredTickets = response.data.filter(
          (ticket) => ticket.ticket_id !== (newTicket.ticket_id || null)
        );
        setRelatedTickets(filteredTickets);
        setError(null);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Failed to load related tickets");
      }
    } catch (err) {
      console.error("Error fetching related tickets:", err);
      setError(err.response?.data?.error || "Failed to fetch related tickets");
      setRelatedTickets([]);
    }
  };

  // Add these validation functions near the top of your component
  const validatePhoneNumber = (phone) => {
    // const phoneRegex = /^\d{10}$/;
    const phoneRegex = /^\+\d{1,3} \d{1,12}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|io)$/;
    return emailRegex.test(email);
  };

  // Add this helper function near your other validation functions
  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Add this helper function at the top of your component
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // This will show date as DD/MM/YYYY
  };

  // Update the handleCreateTicket function
  const handleCreateTicket = async (e) => {
    e.preventDefault();
     if(!newTicket.department || !newTicket.priority ) 
        {
          toast.error("Please fill out all the fields") 
          return ; 
        }
    const fullPhoneNumber = `${selectedCountryCode} ${newTicket.customer_phone}`;
    if (!validatePhoneNumber(fullPhoneNumber)) {
      alert("Please enter a valid phone number (up to 15 digits).");
      return;
    }
    const token = localStorage.getItem("access");

    setIsCreatingTicket(true); // Start loading

    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/?target_language=${currentLanguage}`,
        {
          ...newTicket,
          customer_phone: fullPhoneNumber,
          status: "new",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTickets((prevTickets) => [response.data, ...prevTickets]);
      setShowCreateModal(false);
      setNewTicket({
        title: "",
        description: "",
        priority: "",
        category: "",
        customer_name: "",
        customer_company: "",
        customer_phone: "",
        customer_email: "",
        department: "",
        status: "new",
      });

      toast.success("Ticket created successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const newToken = await refreshToken();
          const ticketsResponse = await fetchTickets(
            newToken,
            i18n[currentLanguage]
          );
          // const ticketsResponse = ticketsResponses
          setTickets(ticketsResponse.data);
        } catch (refreshError) {
          setError("Session expired. Please login again.");
          navigate("/login");
          toast.info("Session expired. Please login again.")
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
      console.error("Error creating ticket:", error);
      toast.error(
        "Failed to create ticket. Please check all required fields.",
        {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    } finally {
      setIsCreatingTicket(false); // End loading
    }
  };

  // Update file handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    // Debug log
    console.log("Files selected:", files);
  };

  // Add file removal function if not already present
  const handleFileRemove = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      ticket.ticket_id.toString().toLowerCase().includes(query) ||
      ticket.title.toLowerCase().includes(query);

    const matchesStatus =
      filters.status === "" || ticket.status === filters.status;

    const matchesPriority =
      filters.priority === "" || ticket.priority === filters.priority;

    const matchesDepartment =
      filters.department === "" || ticket.department === filters.department;

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesDepartment
    );
  });

  // Update the handleViewTicket function
  const handleViewTicket = async (ticket) => {
    setLoadingTicketId(ticket.ticket_id);
    const token = localStorage.getItem("access");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/${ticket.ticket_id}/?target_language=${currentLanguage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": currentLanguage,
          },
        }
      );

      setSelectedTicket(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      alert("Failed to load ticket details. Please try again.");
    } finally {
      setLoadingTicketId(null);
    }
  };
  const handleFileUpload = async (ticketId, file) => {
    setIsUploading(true);

    try {
      // Create FormData and append the file with the correct field name
      const formData = new FormData();

      // Check if file is an array
      if (Array.isArray(file)) {
        file.forEach((f, index) => {
          formData.append(`attachments[${index}]`, f);
        });
      } else {
        formData.append("attachments", file);
      }

      const token = localStorage.getItem("access");
      const response = await axios({
        method: "put",
        url: `${API_BASE_URL}/tickets/${ticketId}/?target_language=${currentLanguage}`,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        transformRequest: [(data) => data], // Prevent axios from transforming the FormData
      });

      if (response.status === 200) {
        // Update tickets state with the new attachment
        setTickets((prevTickets) =>
          prevTickets.map((ticket) => {
            if (ticket.ticket_id === ticketId) {
              return {
                ...ticket,
                attachments: [
                  ...(ticket.attachments || []),
                  ...response.data.attachments,
                ], // Assuming response.data.attachments contains the updated attachments
              };
            }
            return ticket;
          })
        );

        toast.success("File uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Update the handleRelatedTicketChange function
  const handleRelatedTicketChange = (e, ticket) => {
    const isChecked = e.target.checked;

    setNewTicket((prev) => ({
      ...prev,
      related_ticket: isChecked
        ? [...(prev.related_ticket || []), ticket.ticket_id]
        : (prev.related_ticket || []).filter((id) => id !== ticket.ticket_id),
    }));

    setSelectedRelatedTickets((prev) => {
      if (isChecked) {
        return [...prev, ticket];
      } else {
        return prev.filter((t) => t.ticket_id !== ticket.ticket_id);
      }
    });
  };

  // Pagination calculations
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  const renderFormattedComment = (comment) => {
    return <div dangerouslySetInnerHTML={{ __html: comment }} />;
  };
  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Reset pagination when searching
    setCurrentPage(1);
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <DashboardLoader message="Loading Tickets..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

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
    <div className="dashboard-container w-full max-w-full  flex flex-col min-h-screen  bg-gray-50 ">
      <>
        <HeroSection {...{ t, handleSearch, setSearchQuery, searchQuery }} />
      </>

      <div className="bg-white py-3 px-4 shadow-md w-full">
        <div className="filters flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          {/* Title */}
          <div className="title1 w-full md:w-auto">
            <h1 className="text-xl font-semibold text-gray-800">
              {t("dashboard.buttons.YourTickets")}
            </h1>
          </div>

          {/* Filters */}
          <div className="filter-container flex flex-col sm:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
            {/* Status Custom Dropdown */}
            <div
              className="w-full sm:w-auto min-w-[160px] static"
              ref={statusDropdownRef}
            >
              <div className="custom-dropdown relative">
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  className="flex justify-between items-center w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  <span className="truncate">
                    {filters.status
                      ? t(`dashboard.tickets.status.${filters.status}`)
                      : t("dashboard.tickets.filters.status")}
                  </span>
                  <svg
                    className="flex-shrink-0 fill-current h-4 w-4 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {statusDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full sm:w-[160px] bg-white border rounded shadow-lg max-h-60 overflow-auto left-0">
                    <ul className="py-1">
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.filters.status")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "new");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.new")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "in_progress");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.in_progress")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "resolved");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.resolved")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "waiting_customer");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.waiting_customer")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "rejected");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.rejected")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "reopened");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.reopened")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "escalated");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.escalated")}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Priority Custom Dropdown */}
            <div
              className="w-full sm:w-auto min-w-[160px] static"
              ref={priorityDropdownRef}
            >
              <div className="custom-dropdown relative">
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  className="flex justify-between items-center w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                >
                  <span className="truncate">
                    {filters.priority
                      ? t(`dashboard.tickets.priority.${filters.priority}`)
                      : t("dashboard.tickets.filters.priority")}
                  </span>
                  <svg
                    className="flex-shrink-0 fill-current h-4 w-4 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {priorityDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full sm:w-[160px] bg-white border rounded shadow-lg max-h-60 overflow-auto left-0">
                    <ul className="py-1">
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("priority", "");
                          setPriorityDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.filters.priority")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("priority", "high");
                          setPriorityDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.priority.high")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("priority", "middle");
                          setPriorityDropdownOpen(false);
                        }}
                      >
                        {t("Middle")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("priority", "low");
                          setPriorityDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.priority.low")}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Department Custom Dropdown */}
            <div
              className="w-full sm:w-auto min-w-[160px] static"
              ref={departmentDropdownRef}
            >
              <div className="custom-dropdown relative">
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  className="flex justify-between items-center w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() =>
                    setDepartmentDropdownOpen(!departmentDropdownOpen)
                  }
                >
                  <span className="truncate">
                    {filters.department
                      ? t(`dashboard.tickets.department.${filters.department}`)
                      : t("dashboard.tickets.filters.department")}
                  </span>
                  <svg
                    className="flex-shrink-0 fill-current h-4 w-4 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {departmentDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full sm:w-[160px] bg-white border rounded shadow-lg max-h-60 overflow-auto left-0">
                    <ul className="py-1">
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("department", "");
                          setDepartmentDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.filters.department")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("department", "sales");
                          setDepartmentDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.department.sales")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("department", "sales_ue");
                          setDepartmentDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.department.sales_ue")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("department", "sales_sth");
                          setDepartmentDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.department.sales_sth")}
                      </li>
                      <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("department", "service");
                          setDepartmentDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.department.service")}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Create Ticket Button */}
          <div className="w-full sm:w-auto">
            <button
              className="create-manager-btn2 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 w-full sm:w-auto shadow-md hover:bg-blue-700 transition duration-200 mt-0 "
              onClick={() => setShowCreateModal(true)}
            >
              <FaTicketAlt /> {t("dashboard.buttons.createTicket")}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-dropdown .absolute {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 40;
        }
      `}</style>

      <div className="tickets-list-container bg-[#f9f9f9] w-full max-w-full px-4">
        {getPaginatedData().length === 0 ? (
          <div className="flex justify-center items-center p-8  bg-gray-50 border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-700">
              No Tickets Available
            </h2>
            <p></p>
          </div>
        ) : (
          getPaginatedData().map((ticket) => {
            if (!expandedTicketId || expandedTicketId === ticket.ticket_id) {
              return (
                <div
                  key={ticket.ticket_id}
                  className={`ticket-list-item border   my-3 shadow-sm hover:shadow-md transition-shadow  bg-white
              ${expandedTicketId === ticket.ticket_id ? "expanded" : ""}`}
                  onClick={() => handleTicketClick(ticket.ticket_id)}
                >
                  {/* Collapsed View */}
                  <div className="ticket-content px-3 py-2">
                    <div className="ticket-primary-info flex flex-col sm:flex-row justify-between">
                      <div className="name-section w-full sm:w-4/5">
                        <div className="name-company mb-1">
                          <span className="customer-name font-semibold block sm:inline ">
                            {ticket.title.toUpperCase()}
                          </span>
                          {/* <span className="customer-company text-gray-600 text-sm ml-0 sm:ml-2">({ticket.customer_company})</span> */}
                        </div>
                        <div className="department-created text-sm text-gray-600 flex flex-col sm:flex-row sm:space-x-4">
                          <span className="department-tag bg-gray-100 px-2 py-1 ">
                            Department: {ticket.department}
                          </span>
                          <span className="creation-tag bg-gray-100 px-2 py-1 ">
                            Created:{" "}
                            {/* {new Date(ticket.creation_date).toLocaleDateString(
                              "en-GB"
                            )} */}
                            {formatTimestamp(ticket.creation_date)}
                          </span>
                        </div>
                      </div>
                      <div className="ticket-secondary-info flex items-center justify-between sm:justify-end mt-2 sm:mt-0 w-full sm:w-1/5">
                        <span
                          className={`status-badge text-xs px-2 py-1 -full 
                    ${
                      ticket.status.toLowerCase().replace(" ", "-") === "open"
                        ? "bg-green-100 text-green-800"
                        : ticket.status.toLowerCase().replace(" ", "-") ===
                          "closed"
                        ? "bg-red-100 text-red-800"
                        : ticket.status.toLowerCase().replace(" ", "-") ===
                          "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                        >
                          {ticket.status}
                        </span>
                        {expandedTicketId === ticket.ticket_id ? (
                          <button
                            className="btn-icon close ml-2 text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTicketId(null);
                            }}
                          >
                            <FaTimes />
                          </button>
                        ) : (
                          <div className="action-buttons"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expandedTicketId === ticket.ticket_id && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto  bg-white shadow-xl sm:w-10/12 md:w-3/4 lg:w-2/3 xl:w-1/2">
                        <div className="p-4 sm:p-6">
                          <div className="mb-6 flex justify-end">
                            <button
                              className=" p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                              onClick={() => setExpandedTicketId(null)}
                            >
                              <FaTimes className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mb-6 space-y-4">
                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0">
                              <label className="w-full text-sm font-medium text-gray-500 sm:w-1/4">
                                Ticket ID:
                              </label>
                              <span className="w-full text-gray-800 sm:w-3/4">
                                {ticket.ticket_id}
                              </span>
                            </div>

                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0">
                              <label className="w-full text-sm font-medium text-gray-500 sm:w-1/4">
                                Title:
                              </label>
                              <span className="w-full font-medium text-gray-800 sm:w-3/4">
                                {ticket.title}
                              </span>
                            </div>

                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0">
                              <label className="w-full text-sm font-medium text-gray-500 sm:w-1/4">
                                Status:
                              </label>
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium
            ${
              ticket.status.toLowerCase().replace(" ", "-") === "open" &&
              "bg-green-100 text-green-800"
            }
            ${
              ticket.status.toLowerCase().replace(" ", "-") === "closed" &&
              "bg-red-100 text-red-800"
            }
            ${
              ticket.status.toLowerCase().replace(" ", "-") === "in-progress" &&
              "bg-blue-100 text-blue-800"
            }
            ${
              ticket.status.toLowerCase().replace(" ", "-") !== "open" &&
              ticket.status.toLowerCase().replace(" ", "-") !== "closed" &&
              ticket.status.toLowerCase().replace(" ", "-") !== "in-progress" &&
              "bg-gray-100 text-gray-800"
            }
          `}
                              >
                                {ticket.status}
                              </span>
                            </div>

                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0">
                              <label className="w-full text-sm font-medium text-gray-500 sm:w-1/4">
                                Priority:
                              </label>
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium
            ${
              ticket.priority.toLowerCase() === "high" &&
              "bg-red-100 text-red-800"
            }
            ${
              ticket.priority.toLowerCase() === "medium" &&
              "bg-yellow-100 text-yellow-800"
            }
            ${
              ticket.priority.toLowerCase() === "low" &&
              "bg-green-100 text-green-800"
            }
          `}
                              >
                                {ticket.priority}
                              </span>
                            </div>

                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0">
                              <label className="w-full text-sm font-medium text-gray-500 sm:w-1/4">
                                Department:
                              </label>
                              <span className="w-full text-gray-800 sm:w-3/4">
                                {ticket.department}
                              </span>
                            </div>
                          </div>

                          <div className="mb-6 border-t border-gray-200 pt-4">
                            <div className="flex flex-col">
                              <span className="text-base font-medium text-gray-800">
                                {ticket.customer_name.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({ticket.customer_company})
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1">
                                Created:{" "}
                               {formatTimestamp(ticket.creation_date)}
                              </span>
                            </div>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-4">
                            <h3 className="mb-2 text-sm font-medium text-gray-500">
                              Description
                            </h3>
                            <p className="whitespace-pre-wrap text-gray-800">
                              {ticket.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })
        )}

        {/* Pagination Controls */}
        {!expandedTicketId && (
          <div className="pagination-controls flex flex-wrap px-4 items-center gap-2 py-4 ">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button px-2 sm:px-3 py-1 text-xs sm:text-sm  bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {t("pagination.previous")}
            </button>

            <div className="page-numbers hidden sm:flex space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`pagination-button w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center 
             ${
               currentPage === pageNum
                 ? "bg-blue-600 text-white"
                 : "bg-gray-100 text-gray-800 hover:bg-gray-200"
             }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="pagination-ellipsis px-1 flex items-center">
                    ...
                  </span>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`pagination-button w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center 
             ${
               currentPage === totalPages
                 ? "bg-blue-600 text-white"
                 : "bg-gray-100 text-gray-800 hover:bg-gray-200"
             }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button px-2 sm:px-3 py-1 text-xs sm:text-sm  bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {t("pagination.next")}
            </button>

            <span className="pagination-info text-xs sm:text-sm text-gray-600 ml-2 hidden md:inline-block">
              {t("pagination.page")} {totalPages === 0 ? 0 : currentPage}{" "}
              {t("pagination.of")} {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[50]">
          <div className="bg-white shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("dashboard.modal.createNewTicket")}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowCreateModal(false)}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form
              onSubmit={handleCreateTicket}
              className="p-6 overflow-y-auto max-h-[70vh]"
            >
              {/* Customer Information - First Section */}
              <div className="mb-6">
                {/* Company and Name - Side by Side on Desktop */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.customerCompany")} *
                    </label>
                    <input
                      type="text"
                      value={newTicket.customer_company}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          customer_company: capitalizeWords(e.target.value),
                        })
                      }
                      required
                      placeholder={t(
                        "dashboard.form.customerCompanyPlaceholder"
                      )}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.customerName")} *
                    </label>
                    <input
                      type="text"
                      value={newTicket.customer_name}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          customer_name: capitalizeWords(e.target.value),
                        })
                      }
                      required
                      placeholder={t("dashboard.form.customerNamePlaceholder")}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Phone and Email - Side by Side on Desktop */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.customerPhone")} *
                    </label>
                    {/* Custom Country Code Dropdown */}
                    <div className="flex flex-col sm:flex-row gap-3 border border-gray-300">
                      <div className="relative w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setDropdownOpen((prev) => ({
                              ...prev,
                              countryCode: !prev.countryCode,
                            }))
                          }
                          className="w-full sm:w-auto md:w-24 px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-300 bg-gray-50 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span>
                            {countryCodes.find(
                              (country) => country.code === selectedCountryCode
                            )?.flag || ""}{" "}
                            {selectedCountryCode}
                          </span>
                          <svg
                            className={`w-2 h-2  transition-transform ${
                              dropdownOpen.countryCode ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </button>
                        {dropdownOpen.countryCode && (
                          <div className="absolute w-full sm:w-64 mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto z-[50] ">
                            <ul className="py-1 ">
                              {countryCodes.map((country) => (
                                <li
                                  key={country.code}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                  onClick={() => {
                                    setSelectedCountryCode(country.code);
                                    setDropdownOpen((prev) => ({
                                      ...prev,
                                      countryCode: false,
                                    }));
                                  }}
                                >
                                  <span className="mr-2">{country.flag}</span>
                                  <span>
                                    {country.name} ({country.code})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={newTicket.customer_phone}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/[^0-9]/g, "")
                            .slice(0, 15);
                          setNewTicket({ ...newTicket, customer_phone: value });
                        }}
                        required
                        placeholder={t(
                          "dashboard.form.customerPhonePlaceholder"
                        )}
                        pattern="^\d{1,15}$"
                        title="Enter phone number without country code"
                        className="flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {newTicket.customer_phone &&
                      !validatePhone(
                        `${selectedCountryCode} ${newTicket.customer_phone}`
                      ) && (
                        <small className="text-red-500 text-xs mt-1">
                          Please enter a valid phone number.
                        </small>
                      )}
                  </div>

                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.customerEmail")} *
                    </label>
                    <input
                      type="email"
                      value={newTicket.customer_email}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          customer_email: e.target.value,
                        })
                      }
                      required
                      placeholder={t("dashboard.form.customerEmailPlaceholder")}
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|io)$"
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Title and Description - Second Section */}
              <div className="mb-6">
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dashboard.form.title")} *
                  </label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        title: capitalizeWords(e.target.value),
                      })
                    }
                    required
                    placeholder={t("dashboard.form.titlePlaceholder")}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description - Full Width */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dashboard.form.description")} *
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        description: e.target.value,
                      })
                    }
                    required
                    placeholder={t("dashboard.form.descriptionPlaceholder")}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>
              </div>

              {/* Category, Department, and Priority - Third Section */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Category Dropdown */}
                  <div className="relative w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.category")} *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setDropdownOpen((prev) => ({
                            ...prev,
                            category: !prev.category,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span>
                          {newTicket.category
                            ? newTicket.category === "technical"
                              ? t("dashboard.tickets.category.technical")
                              : newTicket.category === "billing"
                              ? t("dashboard.tickets.category.billing")
                              : newTicket.category === "feature_request"
                              ? t("dashboard.tickets.category.feature_request")
                              : newTicket.category === "bug_report"
                              ? t("dashboard.tickets.category.bug_report")
                              : newTicket.category === "support"
                              ? t("dashboard.tickets.category.support")
                              : ""
                            : t("dashboard.form.categoryPlaceholder")}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            dropdownOpen.category ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                      {dropdownOpen.category && (
                        <div className="absolute w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto z-10">
                          <ul className="py-1">
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  category: "technical",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  category: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.category.technical")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  category: "billing",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  category: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.category.billing")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  category: "feature_request",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  category: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.category.feature_request")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  category: "bug_report",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  category: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.category.bug_report")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  category: "support",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  category: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.category.support")}
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <input type="hidden" value={newTicket.category} required />
                  </div>

                  {/* Department Dropdown */}
                  <div className="relative w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.department")} *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setDropdownOpen((prev) => ({
                            ...prev,
                            department: !prev.department,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span>
                          {newTicket.department
                            ? newTicket.department === "sales"
                              ? t("dashboard.tickets.department.sales")
                              : newTicket.department === "sales_ue"
                              ? t("dashboard.tickets.department.sales_ue")
                              : newTicket.department === "sales_sth"
                              ? t("dashboard.tickets.department.sales_sth")
                              : newTicket.department === "service"
                              ? t("dashboard.tickets.department.service")
                              : ""
                            : t("dashboard.form.departmentPlaceholder")}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            dropdownOpen.department ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                      {dropdownOpen.department && (
                        <div className="absolute w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto z-10">
                          <ul className="py-1">
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  department: "sales",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  department: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.department.sales")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  department: "sales_ue",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  department: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.department.sales_ue")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  department: "sales_sth",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  department: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.department.sales_sth")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  department: "service",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  department: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.department.service")}
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <input
                      type="hidden"
                      value={newTicket.department}
                      required
                    />
                  </div>

                  {/* Priority Dropdown */}
                  <div className="relative w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.priority")} *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setDropdownOpen((prev) => ({
                            ...prev,
                            priority: !prev.priority,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span>
                          {newTicket.priority
                            ? newTicket.priority === "high"
                              ? t("dashboard.tickets.priority.high")
                              : newTicket.priority === "middle"
                              ? t("Middle")
                              : newTicket.priority === "low"
                              ? t("dashboard.tickets.priority.low")
                              : ""
                            : t("dashboard.form.priorityPlaceholder")}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            dropdownOpen.priority ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                      {dropdownOpen.priority && (
                        <div className="absolute w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto z-10">
                          <ul className="py-1">
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  priority: "high",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  priority: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.priority.high")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({
                                  ...newTicket,
                                  priority: "middle",
                                });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  priority: false,
                                }));
                              }}
                            >
                              {t("Middle")}
                            </li>
                            <li
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setNewTicket({ ...newTicket, priority: "low" });
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  priority: false,
                                }));
                              }}
                            >
                              {t("dashboard.tickets.priority.low")}
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <input type="hidden" value={newTicket.priority} required />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {t("dashboard.buttons.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007bff] text-white hover:bg-blue-700 transition-colors"
                >
                  {t("dashboard.buttons.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] ">
        //   <div className="bg-white  shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden ">
        //     <div className="flex justify-between items-center p-4 border-b">
        //       <h2 className="text-lg md:text-xl font-semibold">
        //         {t("dashboard.modal.createTicket")}
        //       </h2>
        //       <button
        //         className="text-gray-500 hover:text-gray-700 transition-colors"
        //         onClick={() => setShowCreateModal(false)}
        //       >
        //         <FaTimes />
        //       </button>
        //     </div>

        //     <form
        //       onSubmit={handleCreateTicket}
        //       className="p-4 overflow-y-auto max-h-[70vh] "
        //     >
        //       <div className="space-y-6">
        //         {/* Basic Information */}
        //         <div className="space-y-4">
        //           <div className="w-full">
        //             <div className="mb-4">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.title")} *
        //               </label>
        //               <input
        //                 type="text"
        //                 value={newTicket.title}
        //                 onChange={(e) =>
        //                   setNewTicket({
        //                     ...newTicket,
        //                     title: capitalizeWords(e.target.value),
        //                   })
        //                 }
        //                 required
        //                 placeholder={t("dashboard.form.titlePlaceholder")}
        //                 className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
        //               />
        //             </div>
        //           </div>

        //           <div className="w-full">
        //             <div className="mb-4">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.description")} *
        //               </label>
        //               <textarea
        //                 value={newTicket.description}
        //                 onChange={(e) =>
        //                   setNewTicket({
        //                     ...newTicket,
        //                     description: e.target.value,
        //                   })
        //                 }
        //                 required
        //                 placeholder={t("dashboard.form.descriptionPlaceholder")}
        //                 className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
        //                 rows="4"
        //               />
        //             </div>
        //           </div>

        //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        //             <div className="w-full">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.priority")} *
        //               </label>
        //               <div className="relative">
        //                 <button
        //                   type="button"
        //                   onClick={() =>
        //                     setDropdownOpen((prev) => ({
        //                       ...prev,
        //                       priority: !prev.priority,
        //                     }))
        //                   }
        //                   className="w-full px-3 py-2 border border-gray-300 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
        //                 >
        //                   <span>
        //                     {newTicket.priority
        //                       ? newTicket.priority === "high"
        //                         ? t("dashboard.tickets.priority.high")
        //                         : newTicket.priority === "middle"
        //                         ? t("Middle")
        //                         : newTicket.priority === "low"
        //                         ? t("dashboard.tickets.priority.low")
        //                         : ""
        //                       : t("dashboard.form.priorityPlaceholder")}
        //                   </span>
        //                   <svg
        //                     className={`w-4 h-4 transition-transform ${
        //                       dropdownOpen.priority ? "rotate-180" : ""
        //                     }`}
        //                     fill="none"
        //                     stroke="currentColor"
        //                     viewBox="0 0 24 24"
        //                   >
        //                     <path
        //                       strokeLinecap="round"
        //                       strokeLinejoin="round"
        //                       strokeWidth="2"
        //                       d="M19 9l-7 7-7-7"
        //                     ></path>
        //                   </svg>
        //                 </button>
        //                 {dropdownOpen.priority && (
        //                   <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto">
        //                     <ul className="py-1">
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             priority: "high",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             priority: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t("dashboard.tickets.priority.high")}
        //                       </li>
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             priority: "middle",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             priority: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t("Middle")}
        //                       </li>
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             priority: "low",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             priority: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t("dashboard.tickets.priority.low")}
        //                       </li>
        //                     </ul>
        //                   </div>
        //                 )}
        //               </div>
        //               {/* Hidden input for form validation */}
        //               <input
        //                 type="hidden"
        //                 value={newTicket.priority}
        //                 required
        //               />
        //             </div>

        //             <div className="w-full">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.category")} *
        //               </label>
        //               <div className="relative">
        //                 <button
        //                   type="button"
        //                   onClick={() =>
        //                     setDropdownOpen((prev) => ({
        //                       ...prev,
        //                       category: !prev.category,
        //                     }))
        //                   }
        //                   className="w-full px-3 py-2 border border-gray-300 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
        //                 >
        //                   <span>
        //                     {newTicket.category
        //                       ? newTicket.category === "technical"
        //                         ? t("dashboard.tickets.category.technical")
        //                         : newTicket.category === "billing"
        //                         ? t("dashboard.tickets.category.billing")
        //                         : newTicket.category === "feature_request"
        //                         ? t(
        //                             "dashboard.tickets.category.feature_request"
        //                           )
        //                         : newTicket.category === "bug_report"
        //                         ? t("dashboard.tickets.category.bug_report")
        //                         : newTicket.category === "support"
        //                         ? t("dashboard.tickets.category.support")
        //                         : ""
        //                       : t("dashboard.form.categoryPlaceholder")}
        //                   </span>
        //                   <svg
        //                     className={`w-4 h-4 transition-transform ${
        //                       dropdownOpen.category ? "rotate-180" : ""
        //                     }`}
        //                     fill="none"
        //                     stroke="currentColor"
        //                     viewBox="0 0 24 24"
        //                   >
        //                     <path
        //                       strokeLinecap="round"
        //                       strokeLinejoin="round"
        //                       strokeWidth="2"
        //                       d="M19 9l-7 7-7-7"
        //                     ></path>
        //                   </svg>
        //                 </button>
        //                 {dropdownOpen.category && (
        //                   <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto">
        //                     <ul className="py-1">
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             category: "technical",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             category: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t("dashboard.tickets.category.technical")}
        //                       </li>
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             category: "billing",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             category: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t("dashboard.tickets.category.billing")}
        //                       </li>
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             category: "feature_request",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             category: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t(
        //                           "dashboard.tickets.category.feature_request"
        //                         )}
        //                       </li>
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             category: "bug_report",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             category: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t("dashboard.tickets.category.bug_report")}
        //                       </li>
        //                       <li
        //                         className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                         onClick={() => {
        //                           setNewTicket({
        //                             ...newTicket,
        //                             category: "support",
        //                           });
        //                           setDropdownOpen((prev) => ({
        //                             ...prev,
        //                             category: false,
        //                           }));
        //                         }}
        //                       >
        //                         {t("dashboard.tickets.category.support")}
        //                       </li>
        //                     </ul>
        //                   </div>
        //                 )}
        //               </div>
        //               {/* Hidden input for form validation */}
        //               <input
        //                 type="hidden"
        //                 value={newTicket.category}
        //                 required
        //               />
        //             </div>
        //           </div>
        //         </div>

        //         {/* Customer Information */}
        //         <div className="space-y-4">
        //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        //             <div className="w-full">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.customerCompany")} *
        //               </label>
        //               <input
        //                 type="text"
        //                 value={newTicket.customer_company}
        //                 onChange={(e) =>
        //                   setNewTicket({
        //                     ...newTicket,
        //                     customer_company: capitalizeWords(e.target.value),
        //                   })
        //                 }
        //                 required
        //                 placeholder={t(
        //                   "dashboard.form.customerCompanyPlaceholder"
        //                 )}
        //                 className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
        //               />
        //             </div>

        //             <div className="w-full">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.customerName")} *
        //               </label>
        //               <input
        //                 type="text"
        //                 value={newTicket.customer_name}
        //                 onChange={(e) =>
        //                   setNewTicket({
        //                     ...newTicket,
        //                     customer_name: capitalizeWords(e.target.value),
        //                   })
        //                 }
        //                 required
        //                 placeholder={t(
        //                   "dashboard.form.customerNamePlaceholder"
        //                 )}
        //                 className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
        //               />
        //             </div>
        //           </div>

        //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        //             <div className="w-full">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.customerPhone")} *
        //               </label>
        //               <div className="flex flex-wrap md:flex-nowrap gap-2">
        //                 {/* Custom Country Code Dropdown */}
        //                 <div className="relative w-full md:w-40">
        //                   <button
        //                     type="button"
        //                     onClick={() =>
        //                       setDropdownOpen((prev) => ({
        //                         ...prev,
        //                         countryCode: !prev.countryCode,
        //                       }))
        //                     }
        //                     className="w-full border border-gray-300 px-3 py-2 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
        //                   >
        //                     <span className="truncate">
        //                       {countryCodes.find(
        //                         (country) =>
        //                           country.code === selectedCountryCode
        //                       )?.flag || ""}{" "}
        //                       {selectedCountryCode}
        //                     </span>
        //                     <svg
        //                       className={`w-4 h-4 transition-transform ${
        //                         dropdownOpen.countryCode ? "rotate-180" : ""
        //                       }`}
        //                       fill="none"
        //                       stroke="currentColor"
        //                       viewBox="0 0 24 24"
        //                     >
        //                       <path
        //                         strokeLinecap="round"
        //                         strokeLinejoin="round"
        //                         strokeWidth="2"
        //                         d="M19 9l-7 7-7-7"
        //                       ></path>
        //                     </svg>
        //                   </button>
        //                   {dropdownOpen.countryCode && (
        //                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto">
        //                       <ul className="py-1">
        //                         {countryCodes.map((country) => (
        //                           <li
        //                             key={country.code}
        //                             className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
        //                             onClick={() => {
        //                               setSelectedCountryCode(country.code);
        //                               setDropdownOpen((prev) => ({
        //                                 ...prev,
        //                                 countryCode: false,
        //                               }));
        //                             }}
        //                           >
        //                             <span className="mr-2">{country.flag}</span>
        //                             <span className="truncate">
        //                               {country.name} ({country.code})
        //                             </span>
        //                           </li>
        //                         ))}
        //                       </ul>
        //                     </div>
        //                   )}
        //                 </div>
        //                 <input
        //                   type="text"
        //                   value={newTicket.customer_phone}
        //                   onChange={(e) => {
        //                     const value = e.target.value
        //                       .replace(/[^0-9]/g, "")
        //                       .slice(0, 15);
        //                     setNewTicket({
        //                       ...newTicket,
        //                       customer_phone: value,
        //                     });
        //                   }}
        //                   required
        //                   placeholder={t(
        //                     "dashboard.form.customerPhonePlaceholder"
        //                   )}
        //                   pattern="^\d{1,15}$"
        //                   title="Enter phone number without country code"
        //                   className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        //                 />
        //               </div>
        //               {newTicket.customer_phone &&
        //                 !validatePhoneNumber(
        //                   `${selectedCountryCode} ${newTicket.customer_phone}`
        //                 ) && (
        //                   <small className="text-red-500 text-xs mt-1">
        //                     Please enter a valid phone number.
        //                   </small>
        //                 )}
        //             </div>

        //             <div className="w-full">
        //               <label className="block text-sm font-medium text-gray-700 mb-1">
        //                 {t("dashboard.form.customerEmail")} *
        //               </label>
        //               <input
        //                 type="email"
        //                 value={newTicket.customer_email}
        //                 onChange={(e) =>
        //                   setNewTicket({
        //                     ...newTicket,
        //                     customer_email: e.target.value,
        //                   })
        //                 }
        //                 required
        //                 placeholder={t(
        //                   "dashboard.form.customerEmailPlaceholder"
        //                 )}
        //                 pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|io)$"
        //                 className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
        //               />
        //             </div>
        //           </div>
        //         </div>

        //         {/* Department and Related Tickets */}
        //         <div className="space-y-4">
        //           <div className="w-full">
        //             <label className="block text-sm font-medium text-gray-700 mb-1">
        //               {t("dashboard.form.department")} *
        //             </label>
        //             <div className="relative">
        //               <button
        //                 type="button"
        //                 onClick={() =>
        //                   setDropdownOpen((prev) => ({
        //                     ...prev,
        //                     department: !prev.department,
        //                   }))
        //                 }
        //                 className="w-full border border-gray-300 px-3 py-2 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
        //               >
        //                 <span>
        //                   {newTicket.department
        //                     ? newTicket.department === "sales"
        //                       ? t("dashboard.tickets.department.sales")
        //                       : newTicket.department === "sales_ue"
        //                       ? t("dashboard.tickets.department.sales_ue")
        //                       : newTicket.department === "sales_sth"
        //                       ? t("dashboard.tickets.department.sales_sth")
        //                       : newTicket.department === "service"
        //                       ? t("dashboard.tickets.department.service")
        //                       : ""
        //                     : t("dashboard.form.departmentPlaceholder")}
        //                 </span>
        //                 <svg
        //                   className={`w-4 h-4 transition-transform ${
        //                     dropdownOpen.department ? "rotate-180" : ""
        //                   }`}
        //                   fill="none"
        //                   stroke="currentColor"
        //                   viewBox="0 0 24 24"
        //                 >
        //                   <path
        //                     strokeLinecap="round"
        //                     strokeLinejoin="round"
        //                     strokeWidth="2"
        //                     d="M19 9l-7 7-7-7"
        //                   ></path>
        //                 </svg>
        //               </button>
        //               {dropdownOpen.department && (
        //                 <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto">
        //                   <ul className="py-1">
        //                     <li
        //                       className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                       onClick={() => {
        //                         setNewTicket({
        //                           ...newTicket,
        //                           department: "sales",
        //                         });
        //                         setDropdownOpen((prev) => ({
        //                           ...prev,
        //                           department: false,
        //                         }));
        //                         fetchRelatedTickets("sales");
        //                       }}
        //                     >
        //                       {t("dashboard.tickets.department.sales")}
        //                     </li>
        //                     <li
        //                       className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                       onClick={() => {
        //                         setNewTicket({
        //                           ...newTicket,
        //                           department: "sales_ue",
        //                         });
        //                         setDropdownOpen((prev) => ({
        //                           ...prev,
        //                           department: false,
        //                         }));
        //                         fetchRelatedTickets("sales_ue");
        //                       }}
        //                     >
        //                       {t("dashboard.tickets.department.sales_ue")}
        //                     </li>
        //                     <li
        //                       className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                       onClick={() => {
        //                         setNewTicket({
        //                           ...newTicket,
        //                           department: "sales_sth",
        //                         });
        //                         setDropdownOpen((prev) => ({
        //                           ...prev,
        //                           department: false,
        //                         }));
        //                         fetchRelatedTickets("sales_sth");
        //                       }}
        //                     >
        //                       {t("dashboard.tickets.department.sales_sth")}
        //                     </li>
        //                     <li
        //                       className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        //                       onClick={() => {
        //                         setNewTicket({
        //                           ...newTicket,
        //                           department: "service",
        //                         });
        //                         setDropdownOpen((prev) => ({
        //                           ...prev,
        //                           department: false,
        //                         }));
        //                         fetchRelatedTickets("service");
        //                       }}
        //                     >
        //                       {t("dashboard.tickets.department.service")}
        //                     </li>
        //                   </ul>
        //                 </div>
        //               )}
        //             </div>
        //             {/* Hidden input for form validation */}
        //             <input
        //               type="hidden"
        //               value={newTicket.department}
        //               required
        //             />
        //           </div>

        //           <div className="w-full">
        //             <label className="block text-sm font-medium text-gray-700 mb-1">
        //               {t("dashboard.form.relatedTickets")}
        //             </label>
        //             <div className="border border-gray-300  p-3 max-h-48 overflow-y-auto">
        //               {/* Selected Tickets Display */}
        //               {selectedRelatedTickets.length > 0 && (
        //                 <div className="mb-3">
        //                   <label className="block text-sm font-medium text-gray-700 mb-2">
        //                     Selected Tickets:
        //                   </label>
        //                   <div className="space-y-2">
        //                     {selectedRelatedTickets.map((ticket) => (
        //                       <div
        //                         key={ticket.ticket_id}
        //                         className="flex justify-between items-center bg-gray-50 p-2 "
        //                       >
        //                         <span className="text-sm">
        //                           #{ticket.ticket_id} - {ticket.title}
        //                         </span>
        //                         <button
        //                           type="button"
        //                           className="text-gray-500 hover:text-red-500 transition-colors"
        //                           onClick={() =>
        //                             handleRelatedTicketChange(
        //                               { target: { checked: false } },
        //                               ticket
        //                             )
        //                           }
        //                         >
        //                           <FaTimes />
        //                         </button>
        //                       </div>
        //                     ))}
        //                   </div>
        //                 </div>
        //               )}

        //               {/* Available Tickets Selection */}
        //               <div>
        //                 {relatedTickets.length > 0 ? (
        //                   <div className="space-y-2">
        //                     {relatedTickets.map((ticket) => (
        //                       <div
        //                         key={ticket.ticket_id}
        //                         className="flex items-center"
        //                       >
        //                         <label className="flex items-center space-x-2 cursor-pointer">
        //                           <input
        //                             type="checkbox"
        //                             checked={newTicket.related_ticket?.includes(
        //                               ticket.ticket_id
        //                             )}
        //                             onChange={(e) =>
        //                               handleRelatedTicketChange(e, ticket)
        //                             }
        //                             className=" text-blue-600 focus:ring-blue-500"
        //                           />
        //                           <span className="text-sm">
        //                             #{ticket.ticket_id} - {ticket.title}
        //                           </span>
        //                         </label>
        //                       </div>
        //                     ))}
        //                   </div>
        //                 ) : (
        //                   <p className="text-sm text-gray-500">
        //                     {t("dashboard.form.noTickets")}
        //                   </p>
        //                 )}
        //               </div>
        //             </div>
        //           </div>

        //           <div className="w-full">
        //             <label className="block text-sm font-medium text-gray-700 mb-1">
        //               {t("dashboard.form.internalNotes")}
        //             </label>
        //             <textarea
        //               value={newTicket.internal_notes}
        //               onChange={(e) =>
        //                 setNewTicket({
        //                   ...newTicket,
        //                   internal_notes: e.target.value,
        //                 })
        //               }
        //               placeholder={t("dashboard.form.internalNotesPlaceholder")}
        //               className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
        //               rows="3"
        //             />
        //           </div>

        //           <div className="w-full">
        //             <label className="block text-sm font-medium text-gray-700 mb-1">
        //               {t("dashboard.form.attachments")}
        //             </label>
        //             <div className="space-y-3">
        //               <div className="flex items-center justify-center w-full">
        //                 <label
        //                   htmlFor="file-input"
        //                   className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed  cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        //                 >
        //                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
        //                     <FaUpload className="text-gray-400 mb-2" />
        //                     <p className="text-sm text-gray-500">
        //                       {t("dashboard.form.chooseFiles")}
        //                     </p>
        //                   </div>
        //                   <input
        //                     id="file-input"
        //                     type="file"
        //                     multiple
        //                     onChange={handleFileChange}
        //                     className="hidden"
        //                     accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        //                   />
        //                 </label>
        //               </div>

        //               {selectedFiles.length > 0 && (
        //                 <div className="space-y-2">
        //                   {selectedFiles.map((file, index) => (
        //                     <div
        //                       key={index}
        //                       className="flex items-center justify-between bg-gray-50 p-2 "
        //                     >
        //                       <div className="flex items-center">
        //                         <FaFile className="text-gray-400 mr-2" />
        //                         <span className="text-sm">{file.name}</span>
        //                         <span className="text-xs text-gray-500 ml-2">
        //                           ({(file.size / 1024).toFixed(2)} KB)
        //                         </span>
        //                       </div>
        //                       <button
        //                         type="button"
        //                         onClick={() => handleFileRemove(index)}
        //                         className="text-gray-500 hover:text-red-500 transition-colors"
        //                       >
        //                         <FaTimes />
        //                       </button>
        //                     </div>
        //                   ))}
        //                 </div>
        //               )}
        //             </div>
        //           </div>
        //         </div>
        //       </div>

        //       <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        //         <button
        //           type="button"
        //           className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100  hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        //           onClick={() => setShowCreateModal(false)}
        //           disabled={isCreatingTicket}
        //         >
        //           {t("dashboard.buttons.cancel")}
        //         </button>
        //         <button
        //           type="submit"
        //           className="px-4 py-2 text-sm font-medium text-white bg-blue-600  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
        //           disabled={isCreatingTicket}
        //         >
        //           {isCreatingTicket ? (
        //             <div className="flex items-center">
        //               <svg
        //                 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
        //                 xmlns="http://www.w3.org/2000/svg"
        //                 fill="none"
        //                 viewBox="0 0 24 24"
        //               >
        //                 <circle
        //                   className="opacity-25"
        //                   cx="12"
        //                   cy="12"
        //                   r="10"
        //                   stroke="currentColor"
        //                   strokeWidth="4"
        //                 ></circle>
        //                 <path
        //                   className="opacity-75"
        //                   fill="currentColor"
        //                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        //                 ></path>
        //               </svg>
        //               {t("dashboard.buttons.create")}
        //             </div>
        //           ) : (
        //             t("dashboard.buttons.create")
        //           )}
        //         </button>
        //       </div>
        //     </form>
        //   </div>
        // </div>
      )}

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-xl">
            {isViewLoading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4 p-6">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600">{t("dashboard.loading")}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 p-4 md:p-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {t("dashboard.modal.ticketDetails.title")}
                  </h2>
                  <button
                    className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowViewModal(false)}
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 md:p-6">
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          {t("dashboard.modal.ticketDetails.ticketId")}:
                        </label>
                        <span className="block text-gray-800">
                          {selectedTicket.ticket_id}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          Title:
                        </label>
                        <span className="block text-gray-800">
                          {selectedTicket.title}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">
                        Description:
                      </label>
                      <p className="whitespace-pre-wrap text-gray-800">
                        {selectedTicket.description}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          Status:
                        </label>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium
                  ${
                    selectedTicket.status.toLowerCase() === "open" &&
                    "bg-green-100 text-green-800"
                  }
                  ${
                    selectedTicket.status.toLowerCase() === "pending" &&
                    "bg-yellow-100 text-yellow-800"
                  }
                  ${
                    selectedTicket.status.toLowerCase() === "closed" &&
                    "bg-gray-100 text-gray-800"
                  }
                  ${
                    selectedTicket.status.toLowerCase() === "urgent" &&
                    "bg-red-100 text-red-800"
                  }
                `}
                        >
                          {selectedTicket.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          Priority:
                        </label>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium
                  ${
                    selectedTicket.priority.toLowerCase() === "low" &&
                    "bg-blue-100 text-blue-800"
                  }
                  ${
                    selectedTicket.priority.toLowerCase() === "medium" &&
                    "bg-yellow-100 text-yellow-800"
                  }
                  ${
                    selectedTicket.priority.toLowerCase() === "high" &&
                    "bg-orange-100 text-orange-800"
                  }
                  ${
                    selectedTicket.priority.toLowerCase() === "critical" &&
                    "bg-red-100 text-red-800"
                  }
                `}
                        >
                          {selectedTicket.priority}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          Category:
                        </label>
                        <span className="block text-gray-800">
                          {selectedTicket.category}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          Department:
                        </label>
                        <span className="block text-gray-800">
                          {selectedTicket.department}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          Assigned To:
                        </label>
                        <span className="block text-gray-800">
                          {selectedTicket.assigned_to || "Unassigned"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">
                          Created:
                        </label>
                        <span className="block text-gray-800">
                          {formatDate(selectedTicket.creation_date)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">
                        Solution:
                      </label>
                      <span className="block text-gray-800">
                        {selectedTicket.solution || "No solution provided"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">
                        Feedback:
                      </label>
                      <span className="block text-gray-800">
                        {selectedTicket.feedback || "No feedback provided"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">
                        Related Tickets:
                      </label>
                      <span className="block text-gray-800">
                        {selectedTicket.related_tickets.length > 0
                          ? selectedTicket.related_tickets.join(", ")
                          : "None"}
                      </span>
                    </div>

                    {/* Activity Log Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="mb-4 text-lg font-medium text-gray-800">
                        {t("dashboard.tickets.activityLog.title")}
                      </h3>
                      <div className="space-y-4">
                        {selectedTicket.activity_log &&
                        selectedTicket.activity_log.length > 0 ? (
                          selectedTicket.activity_log.map((activity, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-gray-200 p-4"
                            >
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <span className="font-medium text-gray-700">
                                  {activity.changed_by}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatDate(activity.timestamp)}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="font-medium text-gray-600">
                                    {t("dashboard.tickets.activityLog.action")}:
                                  </span>{" "}
                                  <span className="text-gray-800">
                                    {activity.action}
                                  </span>
                                </p>
                                <p>
                                  <span className="font-medium text-gray-600">
                                    {t(
                                      "dashboard.tickets.activityLog.updatedValue"
                                    )}
                                    :
                                  </span>{" "}
                                  <span className="text-gray-800">
                                    {activity.updated_value}
                                  </span>
                                </p>
                                {activity.previous_value && (
                                  <p>
                                    <span className="font-medium text-gray-600">
                                      {t(
                                        "dashboard.tickets.activityLog.previousValue"
                                      )}
                                      :
                                    </span>{" "}
                                    <span className="text-gray-800">
                                      {activity.previous_value}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500">
                            {t("dashboard.tickets.activityLog.noActivity")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="mb-4 text-lg font-medium text-gray-800">
                        {t("dashboard.tickets.attachments.title")}
                      </h3>
                      <div>
                        {selectedTicket.attachments &&
                        selectedTicket.attachments.length > 0 ? (
                          <div className="space-y-3">
                            {selectedTicket.attachments.map(
                              (attachment, index) => (
                                <div
                                  key={index}
                                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-3"
                                >
                                  <div className="flex items-center space-x-3">
                                    <FaFile className="h-5 w-5 text-blue-500" />
                                    <div>
                                      <span className="block font-medium text-gray-800">
                                        {attachment.filename}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {(attachment.size / 1024).toFixed(2)}{" "}
                                        {t(
                                          "dashboard.tickets.attachments.size"
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <a
                                    href={attachment.url}
                                    download
                                    className="flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <FaDownload className="mr-1 h-4 w-4" />{" "}
                                    {t("dashboard.buttons.download")}
                                  </a>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500">
                            {t("dashboard.tickets.attachments.noAttachments")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserDashboard;
