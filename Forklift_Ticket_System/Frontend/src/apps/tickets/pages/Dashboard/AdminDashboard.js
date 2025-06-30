import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaTicketAlt,
  FaTimes,
  FaPaperclip,
} from "react-icons/fa";
import { DateTime } from "luxon";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLoader } from "../../../../components/Loader";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import API_BASE_URL from "../../../../config/api.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeroSection from "../../../../components/HeroSection/HeroSection.js";
import Footer from "../../../../components/Footer/Footer.jsx";
// import { ticketsResponses } from "../../../../constant.js";
// import { Card } from '@/components/ui/card';
const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const replyContainer = useRef();
  const location = useLocation();
  const isUsersView = location.pathname.includes("/users");
  const [showEditTicketComponent, setShowEditTicketComponent] = useState(false);
  const { currentLanguage } = useSelector((state) => state.translation);
  console.log("currentLanguage", currentLanguage);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [ticketAttachments, setTicketAttachments] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showTicketEditModal, setShowTicketEditModal] = useState(false); // New state for ticket edit
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const departmentDropdownRef = useRef(null);
  const [refreshTickets, setRefreshTickets] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState({
    countryCode: false,
    status: false,
    countryCode2: false,
    category: false,
    department: false,
    priority: false,
  });

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [priorityyDropdownOpen, setPriorityyDropdownOpen] = useState(false);

  const [viewSerchComponent, setViewSearchComponent] = useState(false);
  const capitalizeWords = (str) => {
    if (!str) return str;
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdownOpen(false);
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target)
      ) {
        setPriorityDropdownOpen(false);
      }
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target)
      ) {
        setDepartmentDropdownOpen(false);
      }
      // setDropdownOpen((prev) => ({
      //   ...prev,

      //   status: false,
      //   category: false,
      //   department: false,
      //   priority: false,
      // }));
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    department: "",
  });
  const [newManager, setNewManager] = useState({
    first_name: "",
    last_name: "",
    email: "",
    // password: "",
    role: "",
    assigned_roles: "",
  });
  const [assignedManagers, setAssignedManagers] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const AVAILABLE_ROLES = [
    { value: "ticket_manager", label: "Ticket Manager" },
    { value: "customer_manager", label: "Customer Manager" },
    { value: "sales_manager", label: "Sales Manager" },
  ];

  // useEffect(() => {
  //   console.log("CURRENT TICKET = " , currentTicket);
  // } , [currentTicket])

  const handleRoleCheckboxChange = (roleValue) => {
    setNewManager((prev) => {
      let updatedRoles = Array.isArray(prev.assigned_roles)
        ? [...prev.assigned_roles]
        : [];

      if (updatedRoles.includes(roleValue)) {
        // Remove the role if it's already selected
        updatedRoles = updatedRoles.filter((role) => role !== roleValue);
        console.log("check", updatedRoles);
      } else {
        // Add the role if it's not already selected
        updatedRoles.push(roleValue);
      }

      // Set the primary role (first selected role) as the main role
      const primaryRole = updatedRoles.length > 0 ? updatedRoles[0] : "";
      console.log("check1", primaryRole, updatedRoles);
      return {
        ...prev,
        role: primaryRole, // Update the primary role
        assigned_roles: updatedRoles, // Update the assigned roles array
      };
    });
  };
  const [currentUser, setCurrentUser] = useState(null);
  const [userFilters, setUserFilters] = useState({
    role: "",
    status: "",
  });
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    status: "new",
    priority: "high",
    department: "sales",
    description: "",
    category: "technical",
    customer_name: "",
    customer_company: "",
    customer_phone: "",
    customer_number: "",
    customer_email: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketComments, setTicketComments] = useState({});
  // const [ticketsPerPage] = useState(15);
  const [itemsPerPage] = useState(10);
  const [usersPerPage] = useState(10);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [ticketReplies, setTicketReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setCurrentUserPage(pageNumber);
  };
  const [creatingTicket, setCreatingTicket] = useState(false);

  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Reset pagination when searching
    setCurrentPage(1);
    setCurrentUserPage(1);
  };

  const [increaseZindex, setIncreaseZindex] = useState(false);

  const countryCodes = [
    { code: "+49", name: "Germany", flag: "🇩🇪" },
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
  const formatTimestamp = (timestamp) => {
    const berlinTime = DateTime.fromISO(timestamp);
    const formatted = berlinTime
      .setZone("Europe/Berlin")
      .toFormat("dd-MM-yyyy HH:mm:ss");
    console.log(formatted);
    return formatted;
  };

  function isOneMinuteOld(commentTime) {
    const now = new Date();
    const commentDate = new Date(commentTime);
    const diffInMs = now - commentDate;
    const diffInMinutes = diffInMs / 1000 / 60;

    return diffInMinutes <= 1;
  }

  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countryCodes[0].code
  );
  const handleSaveComment = async (ticketId, commentText) => {
    if (isSubmittingComment || commentText.trim() === "") return;
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
      console.log("uplading file ....... -> ", file);
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
        if (file) {
          await uploadFile(response?.data?.ticket_id);
        }
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
              role: localStorage.getItem("userRole"),
            },
          ],
        }));
        toast.success("Comment added successfully!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        setRefreshTickets((prev) => !prev);
      }
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
          toast.info("Session expired. Please login again.");
          setError("Session expired. Please login again.");
          navigate("/login");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
      console.error("Error saving comment:", error);
      toast.error("Failed to save comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
      setFile(null);
      setExpandedTicketId(null);
      setIncreaseZindex(false);
    }
  };

  const handleTicketClick = (ticketId) => {
    setShowEditTicketComponent(true);
    setIncreaseZindex(true);
    console.log("ticket clicked ......");
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null); // Collapse if already expanded
    } else {
      setExpandedTicketId(ticketId); // Expand clicked ticket
    }
  };

  useEffect(() => {
    const handleDashboardUpdate = (event) => {
      const { data } = event.detail;
      // Update admin-specific data
      if (data.adminData) {
        setDashboardData(data.adminData);
      }
    };

    window.addEventListener("updateDashboardData", handleDashboardUpdate);
    return () =>
      window.removeEventListener("updateDashboardData", handleDashboardUpdate);
  }, []);

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

  const fetchTickets = async (token, language) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/?target_language=${currentLanguage}&include_comments=true`,
        { headers }
      );

      // Process comments for each ticket
      const ticketsWithComments = response.data;
      const commentsMap = {};

      ticketsWithComments.forEach((ticket) => {
        if (ticket.comments) {
          commentsMap[ticket.ticket_id] = ticket.comments.map((comment) => ({
            text: comment.comment,
            timestamp: comment.timestamp,
            name: comment.name,
            role: comment["user_role"].replace(/[\[\]']+/g, ""),
          }));
        }
      });

      // Update ticketReplies state
      setTicketReplies(commentsMap);

      return { data: ticketsWithComments };
    } catch (error) {
      throw error;
    }
  };

  const fetchUsers = async (token) => {
    return axios.get(
      `${API_BASE_URL}/user-management/?target_language=${currentLanguage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const uploadFile = async (ticketId) => {
    if (file) {
      const formData = new FormData();
      if (Array.isArray(file)) {
        file.forEach((f, index) => {
          formData.append(`attachments[${index}]`, f);
        });
      } else {
        formData.append("attachments", file);
      }
      try {
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
        }
      } catch (err) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file. Please try again.");
        return null;
      } finally {
        setIsUploading(false);
        setFile(null);
      }
    }
  };
  const handleFileUpload = async (file) => {
    setIsUploading(true);

    setIsUploading(false);
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("access");

    try {
      if (!users.length) {
        const usersResponse = await fetchUsers(token);
        setUsers(usersResponse.data);
      }

      // Default fetch without language header (English)
      const ticketsResponse = await fetchTickets(token, i18n[currentLanguage]);
      // const ticketsResponse = ticketsResponses
      setTickets(ticketsResponse.data);
      const commentsMap = {};
      ticketsResponse.data.forEach((ticket) => {
        console.log("comments  = ", ticket.comments);
        if (ticket.comments) {
          commentsMap[ticket.ticket_id] = ticket.comments.map((comment) => ({
            text: comment.comment,
            timestamp: comment.timestamp,
            name: comment.name,
            role: comment["user_role"].replace(/[\[\]']+/g, ""),
          }));
        }
      });
      setTicketReplies(commentsMap);
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
          toast.info("Session expired. Please login again.");
          setError("Session expired. Please login again.");
          navigate("/login");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
    } finally {
      setLoading(false);
    }
  }, [i18n[currentLanguage], navigate, users.length, currentLanguage]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, currentLanguage, refreshTickets]);

  const handleEditTicket = (ticketId) => {
    const ticketToEdit = tickets.find(
      (ticket) => ticket.ticket_id === ticketId
    );
    if (ticketToEdit) {
      setCurrentTicket(ticketToEdit);
      setShowTicketEditModal(true);
    }
  };
  const handleDeleteTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem("access");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.delete(
        `${API_BASE_URL}/tickets/${ticketId}/?target_language=${currentLanguage}`,
        config
      );
      setTickets((prevTickets) =>
        prevTickets.filter((ticket) => ticket.ticket_id !== ticketId)
      );
      if (expandedTicketId === ticketId) {
        setExpandedTicketId(null);
      }
      toast.success("Ticket deleted successfully!", {
        position: "top-center",
        autoClose: 5000,
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
          toast.info("Session expired. Please login again.");
          setError("Session expired. Please login again.");
          navigate("/login");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket. Please try again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const handleSaveEdit = async () => {
    const trimmedText = replyText.trim();
    const userName = localStorage.getItem("name");
    const comments = [
      {
        name: userName || "Anonymous",
        comment: trimmedText,
        timestamp: new Date().toISOString(),
      },
    ];
    const updatedCurrentTicket = { ...currentTicket, comments };
    setIsSaving(true);

    try {
      const token = localStorage.getItem("access");
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${currentTicket.ticket_id}/?target_language=${currentLanguage}`,
        updatedCurrentTicket,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        if (file) {
          await uploadFile(response?.data?.ticket_id);
        }
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.ticket_id === currentTicket.ticket_id
              ? response.data
              : ticket
          )
        );

        if (trimmedText && !isSubmittingComment) {
          setReplyText("");
        }
        toast.success("Ticket updated successfully!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setRefreshTickets((prev) => !prev);
      }
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
          toast.info("Session expired. Please login again.");
          setError("Session expired. Please login again.");
          navigate("/login");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket. Please try again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setShowTicketEditModal(false);
      setIsSubmittingComment(false);
      setFile(null);
      setExpandedTicketId(null);
      setIsSaving(false);
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
      console.log("matches searchhhhh = ", matchesSearch);

      console.log("ticket status = ", ticket.status);
      console.log("fitlers.statu = ", filters.status);
      console.log(
        "translated = ",
        t(`dashboard.tickets.status.${filters.status}`)
      );

      const matchesStatus =
        !filters.status ||
        ticket.status.toLowerCase() ===
          t(`dashboard.tickets.status.${filters.status}`).toLowerCase() ||
        ticket.status.toLowerCase() === filters.status.toLowerCase();

      console.log("match statuss = ", matchesStatus);

      const matchesPriority =
        !filters.priority ||
        ticket.priority.toLowerCase() ===
          t(`dashboard.tickets.priority.${filters.priority}`).toLowerCase() ||
        ticket.priority.toLowerCase() === filters.priority.toLowerCase();

      const matchesDepartment =
        !filters.department ||
        ticket.department.toLowerCase() ===
          t(
            `dashboard.tickets.department.${filters.department}`
          ).toLowerCase() ||
        ticket.department === filters.department;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesDepartment
      );
    });
  };

  const getPaginatedData = () => {
    if (!users) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return getFilteredTickets().slice(startIndex, endIndex);
  };
  const renderFormattedComment = (comment) => {
    // Add inline styles directly to the HTML string
    const styledComment = comment
      .replace(
        /<ul>/g,
        '<ul style="list-style-type: disc; margin-left: 20px; padding-left: 0; margin-bottom: 1em;">'
      )
      .replace(
        /<ol>/g,
        '<ol style="list-style-type: decimal; margin-left: 20px; padding-left: 0; margin-bottom: 1em;">'
      )
      .replace(
        /<li>/g,
        '<li style="display: list-item; margin-bottom: 0.5em; padding-left: 0.25em;">'
      );

    return <div dangerouslySetInnerHTML={{ __html: styledComment }} />;
  };

  const validateManagerEmail = (email) => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.(com|uk|eu|de|fr|it|es|nl|be|se|pl|in|io)$/;
    return emailRegex.test(email);
  };

  const resetManagerForm = () => {
    setNewManager({
      first_name: "",
      last_name: "",
      email: "",
      // password: "",
      role: "",
      assigned_roles: "",
    });
  };

  const handleCloseCreateModal = () => {
    setNewManager({
      first_name: "",
      last_name: "",
      email: "",
      // password: "",
      role: "",
      assigned_roles: "",
    });
    setShowCreateModal(false);
    setShowUserEditModal(false);

    // Reset current user when closing edit modal
    setCurrentUser(null);
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateManagerEmail(newManager.email)) {
      // alert(
      //   "Please enter a valid email address ending with .com, .uk,.eu,.de,.fr,.it,.es,.nl,.be,.se,.pl, .in, or .io"
      // );
      return;
    }

    // Validate password
    // if (!validateManagerPassword(newManager.password)) {
    //   alert("Password must be at least 8 characters long");
    //   return;
    // }

    setIsCreatingManager(true);
    const token = localStorage.getItem("access");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user-management/?target_language=${currentLanguage}`,
        {
          first_name: newManager.first_name,
          last_name: newManager.last_name,
          email: newManager.email,
          // password: newManager.password,
          role: newManager.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        // Add the new manager to the users list
        const newManagerData = response.data;
        setUsers((prevUsers) => [newManagerData, ...prevUsers]);

        toast.success("Manager created successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // Reset form and close modal
        resetManagerForm();
        setShowCreateModal(false);
        const updatedUsersResponse = await fetchUsers(token);
        setUsers(updatedUsersResponse.data);
      }
    } catch (error) {
      console.error("Error creating manager:", error);
      if (error.status === 400 && error?.response?.data?.errors?.email?.[0]) {
        toast.error(
          error?.response?.data?.errors?.email?.[0] ||
            "Manager with this email already exists",
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
      } else {
        toast.error(
          error?.message || "Failed to create manager. Please try again.",
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
      }
    } finally {
      setIsCreatingManager(false);
    }
  };

  const getTicketStats = () => {
    if (!tickets || tickets.length === 0) {
      return {
        total: 0,
        new: 0,
        inProgress: 0,
        resolved: 0,
      };
    }

    return {
      total: tickets.length,
      new: tickets.filter((ticket) => ticket.status === "new").length,
      inProgress: tickets.filter((ticket) => ticket.status === "in_progress")
        .length,
      resolved: tickets.filter((ticket) => ticket.status === "resolved").length,
    };
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("access");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.delete(`${API_BASE_URL}/users/${userId}/`, config);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("User deleted successfully!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };
  // Update the handleEditUser function
  const handleEditUser = async (userId) => {
    try {
      // const token = localStorage.getItem("access");
      const userToEdit = users.find((user) => user.id === userId);

      if (userToEdit) {
        console.log("user to edit = ", userToEdit);
        setCurrentUser(userToEdit);

        // You'll need to add a new state for editing users
        setNewManager({
          first_name: userToEdit.first_name || "",
          last_name: userToEdit.last_name || "",
          email: userToEdit.email || "",
          role: userToEdit.role || "",
          // assigned_roles: Array.isArray(userToEdit.assigned_roles)
          //   ? userToEdit.assigned_roles
          //   : userToEdit.role
          assigned_roles: Array.isArray(userToEdit.assigned_roles)
            ? userToEdit.assigned_roles
            : [userToEdit.role],
          // password: '' // Usually don't pre-fill password
        });
        setShowUserEditModal(true);
      }
    } catch (error) {
      console.error("Error editing user:", error);
      toast.error("Failed to edit user. Please try again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    setIsUpdatingUser(true);

    try {
      const token = localStorage.getItem("access");

      // Filter out the primary role from assigned_roles
      const secondaryRoles = newManager.assigned_roles.filter(
        (role) => role !== currentUser.role
      );

      // Create payload with the required format
      const payload = {
        first_name: newManager.first_name,
        last_name: newManager.last_name,
        email: newManager.email,
        role: newManager.assigned_roles[0], // Keep the original primary role
        assigned_roles: newManager?.assigned_roles, // Only include secondary roles
      };
      const response = await axios.patch(
        `${API_BASE_URL}/assign-roles/${currentUser.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User roles updated successfully!");
        setShowUserEditModal(false);

        // Reset form
        setNewManager({
          first_name: "",
          last_name: "",
          email: "",
          // password: "",
          role: "",
          assigned_roles: [],
        });
        setCurrentUser(null);

        // Refresh users list
        const updatedUsersResponse = await fetchUsers(token);
        if (updatedUsersResponse.data) {
          setUsers(updatedUsersResponse.data);
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user roles. Please try again.");
    } finally {
      setIsUpdatingUser(false);
    }
  };
  const renderUserRole = (user) => {
    // If primary role exists, show it, otherwise check assigned_roles
    if (user.role) {
      return user.role.replace(/_/g, " ");
    } else if (user.assigned_roles && user.assigned_roles.length > 0) {
      // If no primary role but has assigned roles, show the first assigned role
      return user.assigned_roles[0].replace(/_/g, " ");
    }
    return "N/A";
  };

  const filteredUsers = () => {
    if (!users) return [];
    const query = searchQuery.toLowerCase();

    return users.filter((user) => {
      // Add null checks for each property
      const fullName = `${user.first_name || ""} ${
        user.last_name || ""
      }`.trim();
      const matchesSearch =
        fullName.toLowerCase().includes(query) ||
        (user.email?.toLowerCase() || "").includes(query) ||
        (user.role?.toLowerCase() || "").replace("_", " ").includes(query);

      const matchesRole =
        userFilters.role === "" || user.role === userFilters.role;

      return matchesSearch && matchesRole;
    });
  };

  const getUserStats = () => {
    if (!users || users.length === 0) {
      return {
        total: 0,
        users: 0,
        ticketManagers: 0,
        customerManagers: 0,
        salesManagers: 0,
      };
    }

    return {
      total: users.length,
      users: users.filter((user) => user.role === "user").length,
      ticketManagers: users.filter((user) => user.role === "ticket_manager")
        .length,
      customerManagers: users.filter((user) => user.role === "customer_manager")
        .length,
      salesManagers: users.filter((user) => user.role === "sales_manager")
        .length,
    };
  };

  const validatePhone = (phone) => {
    // const phoneRegex = /^\d{10}$/;
    const phoneRegex = /^\+\d{1,3} \d{1,12}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.(com|uk|eu|de|fr|it|es|nl|be|se|pl|in|io)$/i;
    return emailRegex.test(email);
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setCurrentPage(1);
    setCurrentUserPage(1);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    console.log("priority = ", newTicket.priority);
    console.log("depart = ", newTicket.department);
    if (!newTicket.department || !newTicket.priority || !newTicket.category) {
      toast.error("Please fill out all the fields");
      return;
    }

    const fullPhoneNumber = `${selectedCountryCode} ${newTicket.customer_phone}`;
    if (!validatePhone(fullPhoneNumber)) {
      toast.info("Please enter a valid phone number (up to 15 digits).");
      return;
    }

    // Validate email
    if (newTicket.customer_email && !validateEmail(newTicket.customer_email)) {
      toast.info(
        "Please enter a valid email address ending with .com, .uk, .eu,.de,.fr,.it,.es,.nl,.be,.se,.pl,.in, or .io"
      );
      return;
    }

    setIsCreatingTicket(true);
    setCreatingTicket(true);

    const token = localStorage.getItem("access");
    const adminName = localStorage.getItem("userName");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/?target_language=${currentLanguage}`,
        {
          ...newTicket,
          customer_name: adminName || newTicket.customer_name,
          customer_phone: fullPhoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // some changes

      if (response.status === 201 || response.status === 200) {
        console.log("ticket created response = ", response.data);
        console.log("uploading file .......... -> -> ", file);
        setTickets((prevTickets) => [response.data, ...prevTickets]);
        if (file) {
          await uploadFile(response?.data?.ticket_id);
        }
        toast.success("Ticket created successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // Reset form and close modal only after successful creation
        setNewTicket({
          title: "",
          status: "new",
          priority: "high",
          department: "sales",
          description: "",
          category: "technical",
          customer_name: "",
          customer_company: "",
          customer_phone: "",
          customer_number: "",
          customer_email: "",
        });
        setShowCreateModal(false);
      }
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
          toast.info("Session expired. Please login again.");
          setError("Session expired. Please login again.");
          navigate("/login");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
      console.error("Error creating ticket:", error);
      toast.error(
        error.response?.data?.message ||
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
      setIsCreatingTicket(false);
      setFile(null);
      setCreatingTicket(false);
    }
  };

  const Pagination = () => {
    const filteredTickets = getFilteredTickets();
    // const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex  sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || filteredTickets.length === 0}
            className="px-3 py-1 border border-gray-300  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("pagination.previous")}
          </button>

          <div className="hidden sm:flex gap-1">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              const pageNum = i + 1;
              const showPage =
                pageNum <= 2 ||
                pageNum > totalPages - 2 ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

              if (!showPage && pageNum === 3) {
                return (
                  <span key="ellipsis1" className="px-3 py-1">
                    ...
                  </span>
                );
              }

              if (!showPage && pageNum === totalPages - 2) {
                return (
                  <span key="ellipsis2" className="px-3 py-1">
                    ...
                  </span>
                );
              }

              if (showPage) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border text-sm font-medium  ${
                      currentPage === pageNum
                        ? "bg-[#007bff] text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={
              currentPage === totalPages || filteredTickets.length === 0
            }
            className="px-3 py-1 border border-gray-300  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("pagination.next")}
          </button>
        </div>

        <span className="text-sm text-gray-500">
          {t("pagination.page")} {totalPages === 0 ? 0 : currentPage}{" "}
          {t("pagination.of")} {totalPages}
        </span>
      </div>
    );
  };
  useEffect(() => {
    const handleRefreshTickets = async (event) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access");
        const language = localStorage.getItem("selectedLanguage") || "en";
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const url = `${API_BASE_URL}/tickets/?target_language=${currentLanguage}`;
        const response = await axios.get(url, { headers });
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
  }, [currentLanguage]);

  const handleViewTicket = async (ticket) => {
    setShowViewModal(true);
    setIsViewLoading(true);

    const token = localStorage.getItem("access");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tickets/${ticket.ticket_id}/?target_language=${currentLanguage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": i18n.language,
          },
        }
      );
      setCurrentTicket(response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      toast.error("Failed to load ticket details. Please try again.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setIsViewLoading(false);
    }
  };

  const UserPagination = () => {
    const filteredUsersList = filteredUsers();
    const totalPages = Math.ceil(filteredUsersList.length / usersPerPage);
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 ">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentUserPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentUserPage === 1}
            className="px-3 py-1 text-sm  bg-[#007bff] text-white disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {t("pagination.previous")}
          </button>

          <div className="hidden sm:flex items-center space-x-1">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              const pageNum = i + 1;
              const showPage =
                pageNum <= 2 ||
                pageNum > totalPages - 2 ||
                (pageNum >= currentUserPage - 1 &&
                  pageNum <= currentUserPage + 1);

              if (!showPage && pageNum === 3) {
                return (
                  <span key="ellipsis1" className="px-1">
                    ...
                  </span>
                );
              }

              if (!showPage && pageNum === totalPages - 2) {
                return (
                  <span key="ellipsis2" className="px-1">
                    ...
                  </span>
                );
              }

              if (showPage) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 text-sm  ${
                      currentUserPage === pageNum
                        ? "bg-[#007bff] text-white"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() =>
              setCurrentUserPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentUserPage === totalPages}
            className="px-3 py-1 text-sm  bg-[#007bff] text-white disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {t("pagination.next")}
          </button>
        </div>

        <span className="text-sm text-gray-600">
          {t("pagination.page")} {totalPages === 0 ? 0 : currentUserPage}{" "}
          {t("pagination.of")} {totalPages}
        </span>
      </div>
    );
  };

  const getPaginatedUsers = () => {
    if (!users) return []; // Add check for users array

    const filtered = filteredUsers();
    const startIndex = (currentUserPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  useEffect(() => {
    setCurrentUserPage(1);
  }, [searchQuery, userFilters]);

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

  if (creatingTicket) {
    return <DashboardLoader message={t("loadingMessage.creatingTicket")} />;
  }

  if (loading) {
    return <DashboardLoader message={t("dashboard.buttons.LoadingAdmin")} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 md:p-10 lg:p-12  shadow-md bg-red-100 border border-red-400 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-red-700 font-medium">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 mt-4 text-white bg-red-500  hover:bg-red-600 transition-all duration-200 text-sm sm:text-base md:text-lg lg:text-xl"
        >
          Retry
        </button>
      </div>
    );
  }
  const handleFormatCommand = (command) => {
    if (replyContainer.current) {
      replyContainer.current.focus();
      setTimeout(() => {
        document.execCommand(command, false, null);
      }, 10);
    }
  };

  const getPlainTextFromHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const isContentEmpty = (html) => {
    const plainText = getPlainTextFromHtml(html).trim();
    return plainText.length === 0;
  };

  const handleRoleRadioChange = (selectedRole) => {
    setNewManager((prev) => ({
      ...prev,
      assigned_roles: [selectedRole],
    }));
  };

  return (
    <div className="admin-dashboard  w-full max-w-full  flex flex-col min-h-screen  bg-gray-50 ">
      {isUsersView ? (
        <>
          <HeroSection
            {...{ t, handleSearch, setSearchQuery, searchQuery, isUsersView }}
          />
        </>
      ) : (
        <>
          <HeroSection {...{ t, handleSearch, setSearchQuery, searchQuery }} />
        </>
      )}

      {/* Controls Section */}
      {/* Dashboard component with responsive design using Tailwind CSS */}
      <div
        className={`w-full  bg-white px-4 sm:px-2 ${
          increaseZindex ? "z-[60]" : ""
        }`}
      >
        {/* Users View Section */}
        {isUsersView && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-4 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {t("dashboard.buttons.AllUsers")}
              </h1>
            </div>
            <button
              className="bg-[#007bff] hover:bg-blue-700 text-white py-2 px-4  flex items-center space-x-2 text-sm md:text-base w-full md:w-auto justify-center"
              onClick={() => setShowCreateModal(true)}
            >
              <FaTicketAlt />
              <span>{t("dashboard.buttons.createManager")}</span>
            </button>
          </div>
        )}

        {/* Tickets View Section */}
        {!isUsersView && (
          <>
            <div className="bg-white py-4  shadow-md w-full ">
              <div className=" flex flex-col gap-4 md:flex-row md:justify-between md:items-center  bg-white">
                {/* Title */}
                <div className=" w-full md:w-auto  flex items-center justify-center ">
                  <h1 className="text-xl font-semibold text-gray-800  mt-2">
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
                        onClick={() =>
                          setStatusDropdownOpen(!statusDropdownOpen)
                        }
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
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
                              onClick={() => {
                                handleFilterChange("status", "");
                                setStatusDropdownOpen(false);
                              }}
                            >
                              {t("dashboard.tickets.filters.status")}
                            </li>
                            <li
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
                              onClick={() => {
                                handleFilterChange("status", "new");
                                setStatusDropdownOpen(false);
                              }}
                            >
                              {t("dashboard.tickets.status.new")}
                            </li>
                            <li
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
                              onClick={() => {
                                handleFilterChange("status", "in_progress");
                                setStatusDropdownOpen(false);
                              }}
                            >
                              {t("dashboard.tickets.status.in_progress")}
                            </li>
                            <li
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
                              onClick={() => {
                                handleFilterChange("status", "resolved");
                                setStatusDropdownOpen(false);
                              }}
                            >
                              {t("dashboard.tickets.status.resolved")}
                            </li>
                            <li
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
                              onClick={() => {
                                handleFilterChange(
                                  "status",
                                  "waiting_customer"
                                );
                                setStatusDropdownOpen(false);
                              }}
                            >
                              {t("dashboard.tickets.status.waiting_customer")}
                            </li>
                            <li
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
                              onClick={() => {
                                handleFilterChange("status", "rejected");
                                setStatusDropdownOpen(false);
                              }}
                            >
                              {t("dashboard.tickets.status.rejected")}
                            </li>
                            <li
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
                              onClick={() => {
                                handleFilterChange("status", "reopened");
                                setStatusDropdownOpen(false);
                              }}
                            >
                              {t("dashboard.tickets.status.reopened")}
                            </li>
                            <li
                              className="px-1 py-2 hover:bg-gray-100 cursor-pointer truncate"
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
                        onClick={() =>
                          setPriorityDropdownOpen(!priorityDropdownOpen)
                        }
                      >
                        <span className="truncate">
                          {filters.priority
                            ? t(
                                `dashboard.tickets.priority.${filters.priority}`
                              )
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
                              {/* middle */}
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
                            ? t(
                                `dashboard.tickets.department.${filters.department}`
                              )
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
                    className="create-manager-btn2 flex items-center justify-center gap-2 bg-[#007bff] text-white px-4 py-2 w-full sm:w-auto shadow-md hover:bg-blue-700 transition duration-200 md:mt-0  sm:mt-0"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FaTicketAlt /> {t("dashboard.buttons.createTicket")}
                  </button>
                </div>
              </div>
            </div>

            <style>{`
            .custom-dropdown .absolute {
              position: absolute;
              top: 100%;
              left: 0;
              z-index: 40;
            }
          `}</style>
          </>
        )}

        {/* Content Table */}
        {isUsersView ? (
          <div className={`bg-[#f9f9f9] z-[60]`}>
            {getPaginatedUsers().length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  No Users Available
                </h2>
              </div>
            ) : (
              getPaginatedUsers().map((user) => {
                if (!expandedTicketId || expandedTicketId === user.id) {
                  return (
                    <div
                      key={user.id}
                      className={`border border-gray-200  mb-3 shadow-sm hover:shadow-md transition-all cursor-pointer z-[60] ${
                        expandedTicketId === user.id ? "bg-gray-50" : "bg-white"
                      }`}
                      onClick={() => handleTicketClick(user.id)}
                    >
                      {/* Collapsed View */}
                      <div className="p-2 z-[60] ">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div className="w-full sm:w-3/4">
                            <div className="text-lg font-medium text-gray-900">
                              {`${user.first_name || ""} ${
                                user.last_name || ""
                              }`.trim() || "NO NAME"}
                            </div>
                            <div className="flex flex-col sm:flex-row mt-1 text-sm text-gray-600">
                              <span className="mr-4">
                                {t("navbar.profile.role")}:{" "}
                                {renderUserRole(user)}
                              </span>
                              <span>
                                {" "}
                                {t("dashboard.modal.userEmailAddress")} :{" "}
                                {user.email || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            {expandedTicketId === user.id ? (
                              <button
                                className="p-2 text-gray-600  hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTicketId(null);
                                }}
                              >
                                <FaTimes />
                              </button>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  className="p-2 bg-[#007bff] text-white  hover:bg-[#007bff] transition"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditUser(user.id);
                                  }}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="p-2 bg-[#007bff] text-white  hover:bg-[#007bff] transition"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user.id);
                                  }}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {expandedTicketId === user.id && (
                        <div
                          className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center  p-4 z-[60] "
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-white  shadow-lg w-full max-w-lg overflow-hidden">
                            <div className="flex justify-end p-4 border-b">
                              <button
                                className="p-2 text-gray-600  hover:bg-gray-100"
                                onClick={() => {
                                  setExpandedTicketId(null);
                                  setIncreaseZindex(false);
                                }}
                              >
                                <FaTimes />
                              </button>
                            </div>
                            <div className="p-6">
                              <div className="mb-4">
                                <label className="font-medium text-gray-700">
                                  Name:
                                </label>
                                <div className="mt-1">
                                  {`${user.first_name || ""} ${
                                    user.last_name || ""
                                  }`.trim() || "N/A"}
                                </div>
                              </div>
                              <div className="mb-4">
                                <label className="font-medium text-gray-700">
                                  {t("navbar.profile.role")}
                                </label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {/* Show primary role */}
                                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800  text-sm">
                                    {user.role?.replace(/_/g, " ")}
                                  </span>
                                  {/* Show assigned roles */}
                                  {user.assigned_roles &&
                                    Array.isArray(user.assigned_roles) &&
                                    user.assigned_roles.map(
                                      (role, index) =>
                                        role !== user.role && (
                                          <span
                                            key={index}
                                            className="inline-block px-3 py-1 bg-blue-100 text-blue-800  text-sm"
                                          >
                                            {role.replace(/_/g, " ")}
                                          </span>
                                        )
                                    )}
                                </div>
                              </div>
                              <div className="mb-4">
                                <label className="font-medium text-gray-700">
                                  {t("dashboard.modal.userEmailAddress")}
                                </label>
                                <div className="mt-1">{user.email}</div>
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

            {!expandedTicketId && (
              <div className="mt-3">
                <UserPagination />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#f9f9f9] w-full mx-auto  py-6">
            {getPaginatedData().length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-gray-200  shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">
                  No Tickets Available
                </h2>
                <p></p>
              </div>
            ) : (
              <div className="space-y-4">
                {getPaginatedData().map((ticket) => {
                  if (
                    !expandedTicketId ||
                    expandedTicketId === ticket.ticket_id
                  ) {
                    return (
                      <div
                        key={ticket.ticket_id}
                        className={`bg-white border border-gray-200  shadow-sm transition-all ${
                          expandedTicketId === ticket.ticket_id
                            ? "relative z-10"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => handleTicketClick(ticket.ticket_id)}
                      >
                        {/* Collapsed View */}
                        <div className="p-2">
                          {/* Primary Info Section */}
                          <div className="flex flex-col sm:flex-row justify-between">
                            <div className="">
                              <div className="mb-2 ">
                                <span className=" font-medium text-gray-900">
                                  {ticket.title.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                <span className="inline-block bg-gray-100 px-2 py-1">
                                  {t("dashboard.form.customerCompany")} :{" "}
                                  {ticket.customer_company}
                                </span>
                                <span className="inline-block bg-gray-100  px-2 py-1">
                                  {t("dashboard.form.department")}:{" "}
                                  {t(
                                    `dashboard.tickets.department.${ticket.department}`
                                  )}
                                  {/* {t(`dashboard.tickets.department.${ticket.department}`)} */}
                                </span>
                                <span className="inline-block bg-gray-100 px-2 py-1">
                                  {/* Created: {new Date(ticket.creation_date).toLocaleDateString("en-GB")} */}
                                  {t("timestamps.created")}:{" "}
                                  {formatTimestamp(ticket.creation_date)}
                                </span>
                                {ticket.last_updated && (
                                  <span className="inline-block bg-gray-100 px-2 py-1">
                                    {t("timestamps.updated")}:{" "}
                                    {formatTimestamp(ticket.last_updated)}{" "}
                                    <span>
                                      By ( {ticket.activity_log[0]?.changed_by}{" "}
                                      ){" "}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Secondary Info Section */}
                            <div className="flex items-center justify-between sm:justify-end sm:space-x-4 ">
                              <div
                                className={` text-sm font-medium bg-gray-100 px-2 py-1
                            ${
                              ticket.status.toLowerCase() === "open"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              ticket.status.toLowerCase() === "closed"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                            ${
                              ticket.status.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                            ${
                              ticket.status.toLowerCase() === "in progress"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }
                          `}
                              >
                                {t(`dashboard.tickets.status.${ticket.status}`)}
                              </div>

                              {expandedTicketId === ticket.ticket_id ? (
                                <button
                                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTicketId(null);
                                  }}
                                >
                                  <FaTimes className="w-5 h-5" />
                                </button>
                              ) : (
                                <div className="flex space-x-2">
                                  <button
                                    className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTicket(ticket.ticket_id);
                                    }}
                                  >
                                    <FaEdit className="w-5 h-5" />
                                  </button>
                                  <button
                                    className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTicket(ticket.ticket_id);
                                    }}
                                  >
                                    <FaTrash className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded View */}
                        {expandedTicketId === ticket.ticket_id && (
                          <div
                            className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex justify-center items-center p-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="bg-white  shadow-xl w-full max-w-3xl max-h-[90vh]  overflow-y-auto">
                              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {t("detail_view.ticket_details")}
                                </h3>
                                <button
                                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                  onClick={() => {
                                    setExpandedTicketId(null);
                                    setIncreaseZindex(false);
                                    setFile(null);
                                  }}
                                >
                                  <FaTimes />
                                </button>
                              </div>

                              <div className="p-4 space-y-4 ">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                      <span className="text-sm font-medium text-gray-500">
                                        Ticket ID:
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {ticket.ticket_id}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                      <span className="text-sm font-medium text-gray-500">
                                        {t("dashboard.form.title")} :
                                      </span>
                                      <span className="text-sm text-gray-900 font-medium">
                                        {ticket.title}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                      <span className="text-sm font-medium text-gray-500">
                                        {t("dashboard.tickets.filters.status")}{" "}
                                        :
                                      </span>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium  ${
                                          ticket.status.toLowerCase() === "open"
                                            ? "bg-green-100 text-green-800"
                                            : ticket.status.toLowerCase() ===
                                              "closed"
                                            ? "bg-red-100 text-red-800"
                                            : ticket.status.toLowerCase() ===
                                                "in-progress" ||
                                              ticket.status.toLowerCase() ===
                                                "in progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : ticket.status.toLowerCase() ===
                                              "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {t(
                                          `dashboard.tickets.status.${ticket.status}`
                                        )}
                                      </span>
                                      <button
                                        onClick={() => {
                                          handleEditTicket(ticket?.ticket_id);
                                        }}
                                        className="bg-[#007bff] text-white px-2 py-1 mx-2 flex items-center gap-2"
                                      >
                                        {" "}
                                        <span>
                                          <FaEdit />
                                        </span>
                                        {/* {t("detail_view.edit_status")} */}
                                        Edit Status
                                      </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                      <span className="text-sm font-medium text-gray-500">
                                        {t("dashboard.form.priority")}
                                      </span>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium  ${
                                          ticket.priority.toLowerCase() ===
                                          "high"
                                            ? "bg-red-100 text-red-800"
                                            : ticket.priority.toLowerCase() ===
                                              "medium"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {t(
                                          `dashboard.tickets.priority.${ticket.priority}`
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                      <span className="text-sm font-medium text-gray-500">
                                        {t("dashboard.form.department")}
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {t(
                                          `dashboard.tickets.department.${ticket.department}`
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                      <span className="text-sm font-medium text-gray-500">
                                        {t("dashboard.form.category")}
                                      </span>
                                      <span className="text-sm text-gray-900">
                                        {t(
                                          `dashboard.tickets.category.${ticket.category}`
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-900">
                                      {ticket.customer_name.toUpperCase()}
                                    </div>

                                    <div className="text-sm text-gray-600">
                                      ({ticket.customer_company})
                                    </div>
                                    <div className=" text-gray-900 flex items-center gap-1 ">
                                      <span className="font-medium">
                                        {t("dashboard.form.customerEmail")} :
                                      </span>
                                      <span className="text-sm">
                                        {ticket.customer_email}
                                      </span>
                                    </div>
                                    <div className=" text-gray-900 flex items-center gap-1 ">
                                      <span className="font-medium">
                                        {t("dashboard.form.Phone")} :
                                      </span>
                                      <span className="text-sm">
                                        {ticket.customer_phone}
                                      </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500 mt-2">
                                      <span className="bg-gray-100 px-2 py-1 ">
                                        {t("timestamps.created")}:{" "}
                                        {formatTimestamp(ticket.creation_date)}
                                      </span>
                                      {ticket.last_updated && (
                                        <span className="bg-gray-100 px-2 py-1 ">
                                          {t("timestamps.updated")}:{" "}
                                          {/* {new Date(ticket.last_updated).toLocaleDateString("en-GB")} {" , "}
                                                      {new Date(ticket.last_updated).toLocaleTimeString("en-GB")} */}
                                          {formatTimestamp(ticket.last_updated)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 p-4 bg-gray-50 ">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    {t("dashboard.form.description")}{" "}
                                  </h4>
                                  <p className="text-gray-700 whitespace-pre-line">
                                    {ticket.description}
                                  </p>
                                </div>

                                <div className="w-full flex-col my-3">
                                  <h5 classname="font-medium text-gray-700 mb-2 text-md">
                                    {t("detail_view.activity_logs")}
                                  </h5>

                                  {ticket?.activity_log && (
                                    <div className="w-full">
                                      <div className="flex flex-col gap-3 md:gap-4">
                                        {ticket?.activity_log?.map(
                                          (activity, index) => (
                                            <div
                                              key={index}
                                              className="bg-gray-50  p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                {activity?.action && (
                                                  <div className="flex flex-col">
                                                    <p className="text-xs md:text-sm font-medium text-gray-600">
                                                      {t("detail_view.action")}:
                                                    </p>
                                                    <p className="text-sm md:text-base truncate">
                                                      {activity?.action}
                                                    </p>
                                                  </div>
                                                )}

                                                {activity?.changed_by && (
                                                  <div className="flex flex-col">
                                                    <p className="text-xs md:text-sm font-medium text-gray-600">
                                                      {t(
                                                        "detail_view.changed_by"
                                                      )}
                                                      :
                                                    </p>
                                                    <p className="text-sm md:text-base truncate">
                                                      {activity?.changed_by}
                                                    </p>
                                                  </div>
                                                )}

                                                {activity?.updated_value && (
                                                  <div className="flex flex-col">
                                                    <p className="text-xs md:text-sm font-medium text-gray-600">
                                                      {t(
                                                        "detail_view.updated_value"
                                                      )}
                                                      :
                                                    </p>
                                                    <p className="text-sm md:text-base truncate">
                                                      {activity?.updated_value}
                                                    </p>
                                                  </div>
                                                )}

                                                {activity?.timestamp && (
                                                  <div className="flex flex-col">
                                                    <p className="text-xs md:text-sm font-medium text-gray-600">
                                                      {t("detail_view.time")}:
                                                    </p>
                                                    <p className="text-sm md:text-base truncate">
                                                      {formatTimestamp(
                                                        activity?.timestamp
                                                      )}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {ticket.attachments?.length > 0 && (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      {t("detail_view.attachments")}
                                    </h4>
                                    <div className="space-y-2">
                                      {ticket.attachments.map(
                                        (attachments, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 bg-gray-50"
                                          >
                                            <FaPaperclip className="text-blue-500" />

                                            {attachments.uploaded_at && (
                                              <div className="text-xs text-gray-500 space-y-1">
                                                {attachments.document && (
                                                  <a
                                                    href={attachments.document}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                  >
                                                    {attachments.document
                                                      .split("/")
                                                      .pop()}
                                                  </a>
                                                )}
                                                {attachments.image && (
                                                  <a
                                                    href={attachments.image}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                  >
                                                    {attachments.image
                                                      .split("/")
                                                      .pop()}
                                                  </a>
                                                )}
                                                <p>
                                                  {formatTimestamp(
                                                    attachments.uploaded_at
                                                  )}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {ticketReplies[ticket.ticket_id]?.length >
                                  0 && (
                                  <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      {t("detail_view.comments")}
                                      <span>
                                        (
                                        {
                                          ticketReplies[ticket.ticket_id]
                                            ?.length
                                        }
                                        )
                                      </span>
                                    </h4>
                                    <div className="space-y-4">
                                      {ticketReplies[ticket.ticket_id].map(
                                        (reply, index) => (
                                          <div
                                            key={index}
                                            className="p-3 bg-gray-50 "
                                          >
                                            <div className="flex justify-between items-center mb-2">
                                              <span className="font-medium text-gray-900">
                                                {reply.name}{" "}
                                                <span>({reply.role})</span>
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {isOneMinuteOld(reply.timestamp)
                                                  ? `${formatTimestamp(
                                                      reply.timestamp
                                                    )} new comment`
                                                  : formatTimestamp(
                                                      reply.timestamp
                                                    )}
                                              </span>
                                            </div>
                                            <p className="text-gray-700">
                                              {renderFormattedComment(
                                                reply.text
                                              )}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* {ticket.comments?.length > 0 && (
                                                    <div className="mb-6">
                                                      <h4 className="font-medium text-gray-700 mb-2">Comments:</h4>
                                                      <div className="space-y-4">
                                                        {ticket.comments.map((reply, index) => (
                                                          <div key={index} className="bg-gray-50 p-4 ">
                                                            <div className="flex justify-between mb-2">
                                                              <span className="font-medium text-gray-900">{reply.name}</span>
                                                              <span className="text-sm text-gray-600">{formatTimestamp(reply.timestamp)}</span>
                                                            </div>
                                                            <div className="text-gray-800">
                                                              {renderFormattedComment(reply.text)}
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )} */}

                                <style jsx>{`
                                  .editor-content ul {
                                    list-style-type: disc;
                                    margin-left: 20px;
                                    margin-bottom: 1em;
                                  }
                                  .editor-content ol {
                                    list-style-type: decimal;
                                    margin-left: 20px;
                                    margin-bottom: 1em;
                                  }
                                  .editor-content li {
                                    margin-bottom: 0.5em;
                                    padding-left: 0.25em;
                                  }
                                  .editor-content ul ul {
                                    margin-top: 0.5em;
                                    margin-bottom: 0.5em;
                                  }
                                  .editor-content ol ol {
                                    margin-top: 0.5em;
                                    margin-bottom: 0.5em;
                                  }
                                `}</style>

                                <div className="mt-6">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    {t("detail_view.write_a_comment")}
                                  </h4>
                                  <div className="border border-gray-300 overflow-hidden rounded-lg">
                                    <div className="flex flex-wrap gap-1 bg-gray-50 p-2 border-b border-gray-200">
                                      <button
                                        type="button"
                                        className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleFormatCommand("bold")
                                        }
                                      >
                                        B
                                      </button>
                                      <button
                                        type="button"
                                        className="p-2 hover:bg-gray-200 rounded text-sm italic"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleFormatCommand("italic")
                                        }
                                      >
                                        I
                                      </button>
                                      <button
                                        type="button"
                                        className="p-2 hover:bg-gray-200 rounded text-sm underline"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleFormatCommand("underline")
                                        }
                                      >
                                        U
                                      </button>
                                      <button
                                        type="button"
                                        className="p-2 hover:bg-gray-200 rounded text-sm line-through"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleFormatCommand("strikeThrough")
                                        }
                                      >
                                        S
                                      </button>
                                      <button
                                        type="button"
                                        className="p-2 hover:bg-gray-200 rounded text-sm"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleFormatCommand(
                                            "insertUnorderedList"
                                          )
                                        }
                                      >
                                        •
                                      </button>
                                      <button
                                        type="button"
                                        className="p-2 hover:bg-gray-200 rounded text-sm"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                          handleFormatCommand(
                                            "insertOrderedList"
                                          )
                                        }
                                      >
                                        1.
                                      </button>
                                    </div>
                                    <div
                                      ref={replyContainer}
                                      className="editor-content p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                                      contentEditable
                                      onInput={(e) => {
                                        const currentHtml = e.target.innerHTML;
                                        const plainText =
                                          getPlainTextFromHtml(currentHtml);

                                        // Check character limit
                                        if (plainText.length > 255) {
                                          // Prevent further input by restoring previous content
                                          e.target.innerHTML = replyText;
                                          // Move cursor to end
                                          const range = document.createRange();
                                          const sel = window.getSelection();
                                          range.selectNodeContents(e.target);
                                          range.collapse(false);
                                          sel.removeAllRanges();
                                          sel.addRange(range);
                                          return;
                                        }

                                        setReplyText(currentHtml);
                                      }}
                                      onKeyDown={(e) => {
                                        // Additional check to prevent typing when at limit
                                        const plainText = getPlainTextFromHtml(
                                          e.target.innerHTML
                                        );
                                        if (
                                          plainText.length >= 255 &&
                                          ![
                                            "Backspace",
                                            "Delete",
                                            "ArrowLeft",
                                            "ArrowRight",
                                            "ArrowUp",
                                            "ArrowDown",
                                          ].includes(e.key)
                                        ) {
                                          e.preventDefault();
                                        }
                                      }}
                                      suppressContentEditableWarning={true}
                                      style={{
                                        minHeight: "128px",
                                      }}
                                      data-placeholder="Write your reply here..."
                                    />
                                  </div>

                                  {/* Character counter */}
                                  <div className="flex justify-between items-center mt-2">
                                    <div className="text-sm text-gray-500">
                                      {
                                        getPlainTextFromHtml(replyText || "")
                                          .length
                                      }
                                      /255 characters
                                    </div>
                                    {getPlainTextFromHtml(replyText || "")
                                      .length > 240 && (
                                      <div className="text-sm text-amber-600">
                                        {255 -
                                          getPlainTextFromHtml(replyText || "")
                                            .length}{" "}
                                        characters remaining
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mt-4">
                                  <div className="flex-1 overflow-hidden">
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="file-upload"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        setFile(e.target.files[0]);
                                      }
                                    }}
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      className="inline-flex items-center px-3 py-2 border-0 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded cursor-pointer"
                                      onClick={() => document.getElementById('file-upload').click()}
                                    >
                                      📎 {t('attachment.attachFile')}
                                    </button>
                                    {file && (
                                      <span className="ml-3 text-sm text-gray-600">
                                        {file.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="ml-2 text-sm my-2">
                                  (.docx, .pdf, .doc, image)
                                </div>
                              </div>

                                    <button
                                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-[#007bff] hover:bg-[#0056b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const plainText = getPlainTextFromHtml(
                                          replyText || ""
                                        ).trim();
                                        if (plainText && !isSubmittingComment) {
                                          handleSaveComment(
                                            ticket.ticket_id,
                                            replyText.trim()
                                          ).then(() => {
                                            setReplyText("");
                                            if (replyContainer.current) {
                                              replyContainer.current.innerHTML =
                                                "";
                                            }
                                          });
                                        }
                                      }}
                                      disabled={Boolean(
                                        isContentEmpty(replyText || "") ||
                                          isSubmittingComment ||
                                          getPlainTextFromHtml(replyText || "")
                                            .length > 255
                                      )}
                                    >
                                      {isSubmittingComment
                                        ? t("detail_view.saving")
                                        : t("detail_view.save")}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {!expandedTicketId && (
              <div className="mt-3">
                <Pagination />
              </div>
            )}
          </div>
        )}
        {/* {<Footer />} */}

        {/* Edit Ticket Modal */}
        {showTicketEditModal && currentTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[50]">
            <div className="bg-white shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("dashboard.modal.editTicket")}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => {
                    setDropdownOpen((prev) => ({
                      ...prev,
                      status: false,
                      category: false,
                      countryCode: false,
                      countryCode2: false,
                      department: false,
                      priority: false,
                    }));
                    setShowTicketEditModal(false);
                    setFile(null); 
                  }}
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit();
                }}
                className="p-6 overflow-y-auto max-h-[70vh]"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dashboard.form.title")}{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentTicket.title}
                    onChange={(e) =>
                      setCurrentTicket({
                        ...currentTicket,
                        title: capitalizeWords(e.target.value),
                      })
                    }
                    maxLength={254}
                    title={t("empty_validations.validation")}
                    required
                    placeholder={t("dashboard.form.titlePlaceholder")}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Second Row - Company, Street, City, Zip Code */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="w-full md:w-1/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.customerCompany")}{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentTicket.customer_company}
                        onChange={(e) =>
                          setCurrentTicket({
                            ...currentTicket,
                            customer_company: capitalizeWords(e.target.value),
                          })
                        }
                        title={t("empty_validations.validation")}
                        maxLength={254}
                        required
                        placeholder={t(
                          "dashboard.form.customerCompanyPlaceholder"
                        )}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-2/5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.street")}{" "}
                      </label>
                      <input
                        type="text"
                        value={currentTicket.street}
                        onChange={(e) =>
                          setCurrentTicket({
                            ...currentTicket,
                            street: capitalizeWords(e.target.value),
                          })
                        }
                        maxLength={254}
                        placeholder={t("dashboard.form.streetPlaceholder")}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-1/6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.zip_code")}{" "}
                      </label>
                      <input
                        type="text"
                        value={newTicket.zip_code}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            zip_code: e.target.value,
                          })
                        }
                        maxLength={7}
                        placeholder={t("dashboard.form.zipPlaceholder")}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-1/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.city")}{" "}
                      </label>
                      <input
                        type="text"
                        value={currentTicket.city}
                        onChange={(e) =>
                          setCurrentTicket({
                            ...currentTicket,
                            city: capitalizeWords(e.target.value),
                          })
                        }
                        maxLength={99}
                        placeholder={t("dashboard.form.cityPlaceholder")}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-col gap-4 mb-4">
                    {/* First Row: Customer Name and Phone */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboard.form.customerName")}{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentTicket.customer_name}
                          onChange={(e) =>
                            setCurrentTicket({
                              ...currentTicket,
                              customer_name: capitalizeWords(e.target.value),
                            })
                          }
                          title={t("empty_validations.validation")}
                          maxLength={254}
                          required
                          placeholder={t(
                            "dashboard.form.customerNamePlaceholder"
                          )}
                          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboard.form.Phone")}{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        {/* Custom Country Code Dropdown */}
                        <div className="flex flex-col sm:flex-row border border-gray-300">
                          <div className="relative w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() =>
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  countryCode: !prev.countryCode,
                                }))
                              }
                              className="w-full sm:w-auto md:w-24 mr-[.20rem] px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-300 bg-gray-50 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <span>
                                {countryCodes.find(
                                  (country) =>
                                    country.code === selectedCountryCode
                                )?.flag || ""}{" "}
                                {selectedCountryCode}
                              </span>
                              <svg
                                className={`w-2 h-2 transition-transform ${
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
                                <ul className="py-1">
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
                                      <span className="mr-2">
                                        {country.flag}
                                      </span>
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
                            value={currentTicket.customer_phone}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/[^0-9]/g, "")
                                .slice(0, 15);
                              setCurrentTicket({
                                ...currentTicket,
                                customer_phone: value,
                              });
                            }}
                            required
                            placeholder={t(
                              "dashboard.form.customerPhonePlaceholder"
                            )}
                            // pattern="^\d{1,15}$"
                            title={t("empty_validations.validation")}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {/* {currentTicket.customer_phone &&
                          !validatePhone(
                            `${selectedCountryCode} ${currentTicket.customer_phone}`
                          ) && (
                            <small className="text-red-500 text-xs mt-1">
                              Please enter a valid phone number.
                            </small>
                          )} */}
                      </div>
                    </div>

                    {/* Second Row: Customer Email and Customer Number */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboard.form.customerEmail")}{" "}
                        </label>
                        <input
                          type="email"
                          value={currentTicket.customer_email}
                          onChange={(e) =>
                            setCurrentTicket({
                              ...currentTicket,
                              customer_email: e.target.value,
                            })
                          }
                          maxLength={254}
                          placeholder={t(
                            "dashboard.form.customerEmailPlaceholder"
                          )}
                          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|io)$"
                          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {/* {currentTicket.customer_email &&
                          !validateEmail(currentTicket.customer_email) && (
                            <p className="text-xs text-red-600 mt-1">
                              Enter Email ending with .com, .uk, .eu, .de, .fr,
                              .it, .es, .nl, .be, .se, .pl, .in, or .io
                            </p>
                          )} */}
                      </div>

                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboard.form.customer_number")}
                        </label>

                        <div className="flex flex-col sm:flex-row border border-gray-300">
                          <input
                            type="text"
                            value={newTicket.customer_number}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNewTicket({
                                ...newTicket,
                                customer_number: value,
                              });
                            }}
                            maxLength={18}
                            placeholder={t(
                              "dashboard.form.customerNumberPlaceHolder"
                            )}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fourth Row - Description (Full Width) */}
                <div className="mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.description")}{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={currentTicket.description}
                      onChange={(e) =>
                        setCurrentTicket({
                          ...currentTicket,
                          description: e.target.value,
                        })
                      }
                      title={t("empty_validations.validation")}
                      maxLength={255}
                      required
                      placeholder={t("dashboard.form.descriptionPlaceholder")}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>
                </div>

                {/* Category, Department, and Priority - Third Section */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4 ">
                    {/* Category Dropdown */}
                    <div className="relative w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.category")}
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
                            {currentTicket.category
                              ? currentTicket.category === "technical"
                                ? t("dashboard.tickets.category.technical")
                                : currentTicket.category === "billing"
                                ? t("dashboard.tickets.category.billing")
                                : currentTicket.category === "feature_request"
                                ? t(
                                    "dashboard.tickets.category.feature_request"
                                  )
                                : currentTicket.category === "bug_report"
                                ? t("dashboard.tickets.category.bug_report")
                                : currentTicket.category === "support"
                                ? t("dashboard.tickets.category.support")
                                : t("dashboard.form.category")
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                                  setCurrentTicket({
                                    ...currentTicket,
                                    category: "feature_request",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    category: false,
                                  }));
                                }}
                              >
                                {t(
                                  "dashboard.tickets.category.feature_request"
                                )}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                      <input
                        type="hidden"
                        value={currentTicket.category}
                        required
                      />
                    </div>

                    {/* Department Dropdown */}
                    <div className="relative w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.department")}
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
                            {currentTicket.department
                              ? currentTicket.department === "sales"
                                ? t("dashboard.tickets.department.sales")
                                : currentTicket.department === "sales_ue"
                                ? t("dashboard.tickets.department.sales_ue")
                                : currentTicket.department === "sales_sth"
                                ? t("dashboard.tickets.department.sales_sth")
                                : currentTicket.department === "service"
                                ? t("dashboard.tickets.department.service")
                                : t("dashboard.form.department")
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                        value={currentTicket.department}
                        required
                      />
                    </div>

                    {/* Priority Dropdown */}
                    <div className="relative w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.priority")}
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
                            {currentTicket.priority
                              ? currentTicket.priority === "high"
                                ? t("dashboard.tickets.priority.high")
                                : currentTicket.priority === "middle"
                                ? "Middle"
                                : currentTicket.priority === "low"
                                ? t("dashboard.tickets.priority.low")
                                : t("dashboard.form.priority")
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
                                  setCurrentTicket({
                                    ...currentTicket,
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
                                  setCurrentTicket({
                                    ...currentTicket,
                                    priority: "middle",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    priority: false,
                                  }));
                                }}
                              >
                                Middle
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    priority: "low",
                                  });
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
                      <input
                        type="hidden"
                        value={currentTicket.priority}
                        required
                      />
                    </div>
                    <div className="relative w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.tickets.filters.status")}
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setDropdownOpen((prev) => ({
                              ...prev,
                              status: !prev.status,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span>
                            {currentTicket.status === "new"
                              ? t("dashboard.tickets.status.new")
                              : currentTicket.status === "in_progress"
                              ? t("dashboard.tickets.status.in_progress")
                              : currentTicket.status === "resolved"
                              ? t("dashboard.tickets.status.resolved")
                              : currentTicket.status === "waiting_customer"
                              ? t("dashboard.tickets.status.waiting_customer")
                              : currentTicket.status === "rejected"
                              ? t("dashboard.tickets.status.rejected")
                              : currentTicket.status === "reopened"
                              ? t("dashboard.tickets.status.reopened")
                              : currentTicket.status === "escalated"
                              ? t("dashboard.tickets.status.escalated")
                              : t("dashboard.tickets.filters.status")}
                          </span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              dropdownOpen.status ? "rotate-180" : ""
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
                        {dropdownOpen.status && (
                          <div className="absolute w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto z-10">
                            <ul className="py-1">
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "new",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.new")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "in_progress",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.in_progress")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "waiting_customer",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.waiting_customer")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "resolved",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.resolved")}
                              </li>
                              {/* <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "closed",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.closed")}
                              </li> */}
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "rejected",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.rejected")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "reopened",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.reopened")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setCurrentTicket({
                                    ...currentTicket,
                                    status: "escalated",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.escalated")}
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <input
                        type="hidden"
                        value={currentTicket.status}
                        required
                      />
                    </div>
                  </div>

                  {/* Status Dropdown */}

                  {/* File Attachment */}
                  <div className="space-y-1 sm:space-y-2 mb-6">
                    <label className="block text-sm  text-gray-700 font-medium capitalize">
                      {t("detail_view.attachments")}
                    </label>
                    <div className="space-y-2">
                      {currentTicket.attachments.map((attachments, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50"
                        >
                          <FaPaperclip className="text-blue-500" />

                          {attachments.uploaded_at && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {attachments.document && (
                                <a
                                  href={attachments.document}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  {attachments.document.split("/").pop()}
                                </a>
                              )}
                              {attachments.image && (
                                <a
                                  href={attachments.image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  {attachments.image.split("/").pop()}
                                </a>
                              )}
                              <p>{formatTimestamp(attachments.uploaded_at)}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                     <div className="flex-1 overflow-hidden">
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="file-upload"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        setFile(e.target.files[0]);
                                      }
                                    }}
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      className="inline-flex items-center px-3 py-2 border-0 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded cursor-pointer"
                                      onClick={() => document.getElementById('file-upload').click()}
                                    >
                                      📎 {t('attachment.attachFile')}
                                    </button>
                                    {file && (
                                      <span className="ml-3 text-sm text-gray-600">
                                        {file.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="ml-2 text-sm my-2">
                                  (.docx, .pdf, .doc, image)
                                </div>
                              </div>
                  </div>
                </div>

                {/* Comment Editor */}
                <style jsx>{`
                  .editor-content ul {
                    list-style-type: disc;
                    margin-left: 20px;
                    margin-bottom: 1em;
                  }
                  .editor-content ol {
                    list-style-type: decimal;
                    margin-left: 20px;
                    margin-bottom: 1em;
                  }
                  .editor-content li {
                    margin-bottom: 0.5em;
                    padding-left: 0.25em;
                  }
                  .editor-content ul ul {
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                  }
                  .editor-content ol ol {
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                  }
                `}</style>
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t("detail_view.write_a_comment")}
                  </h4>
                  <div className="border border-gray-300 overflow-hidden rounded-lg">
                    <div className="flex flex-wrap gap-1 bg-gray-50 p-2 border-b border-gray-200">
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleFormatCommand("bold")}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded text-sm italic"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleFormatCommand("italic")}
                      >
                        I
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded text-sm underline"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleFormatCommand("underline")}
                      >
                        U
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded text-sm line-through"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleFormatCommand("strikeThrough")}
                      >
                        S
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded text-sm"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          handleFormatCommand("insertUnorderedList")
                        }
                      >
                        •
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-200 rounded text-sm"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleFormatCommand("insertOrderedList")}
                      >
                        1.
                      </button>
                    </div>
                    <div
                      ref={replyContainer}
                      className="editor-content p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      contentEditable
                      onInput={(e) => {
                        const currentHtml = e.target.innerHTML;
                        const plainText = getPlainTextFromHtml(currentHtml);

                        // Check character limit
                        if (plainText.length > 255) {
                          // Prevent further input by restoring previous content
                          e.target.innerHTML = replyText;
                          // Move cursor to end
                          const range = document.createRange();
                          const sel = window.getSelection();
                          range.selectNodeContents(e.target);
                          range.collapse(false);
                          sel.removeAllRanges();
                          sel.addRange(range);
                          return;
                        }

                        setReplyText(currentHtml);
                      }}
                      onKeyDown={(e) => {
                        // Additional check to prevent typing when at limit
                        const plainText = getPlainTextFromHtml(
                          e.target.innerHTML
                        );
                        if (
                          plainText.length >= 255 &&
                          ![
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      suppressContentEditableWarning={true}
                      style={{
                        minHeight: "128px",
                      }}
                      data-placeholder="Write your reply here..."
                    />
                  </div>

                  {/* Character counter */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">
                      {getPlainTextFromHtml(replyText || "").length}/255
                      characters
                    </div>
                    {getPlainTextFromHtml(replyText || "").length > 240 && (
                      <div className="text-sm text-amber-600">
                        {255 - getPlainTextFromHtml(replyText || "").length}{" "}
                        characters remaining
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 border-t pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen((prev) => ({
                        ...prev,
                        status: false,
                        category: false,
                        countryCode: false,
                        countryCode2: false,
                        department: false,
                        priority: false,
                      }));
                      setShowTicketEditModal(false);
                      setFile(null); 
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {t("dashboard.buttons.cancel")}
                  </button>
                  <button
                    disabled={Boolean(
                      isContentEmpty(replyText || "") ||
                        isSaving ||
                        isSubmittingComment ||
                        getPlainTextFromHtml(replyText || "").length > 255
                    )}
                    type="submit"
                    className={`px-4 py-2 text-white transition-colors ${
                      Boolean(
                        isContentEmpty(replyText || "") ||
                          isSaving ||
                          isSubmittingComment ||
                          getPlainTextFromHtml(replyText || "").length > 255
                      )
                        ? "bg-blue-600 cursor-not-allowed opacity-75"
                        : "bg-[#007bff] hover:bg-blue-700"
                    }`}
                  >
                    {t("dashboard.buttons.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showUserEditModal && currentUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white  shadow-lg w-full max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("dashboard.modal.editUser")}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  onClick={() => {
                    setShowUserEditModal(false);
                    setCurrentUser(null);
                    setNewManager({
                      first_name: "",
                      last_name: "",
                      email: "",
                      role: "",
                      assigned_roles: [],
                    });
                  }}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveUserEdit}>
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.modal.userFirstName")} *
                    </label>
                    <input
                      type="text"
                      value={newManager.first_name}
                      onChange={(e) =>
                        setNewManager({
                          ...newManager,
                          first_name: e.target.value,
                        })
                      }
                      required
                      placeholder={t(
                        "dashboard.modal.userFirstNamePlaceholder"
                      )}
                      className="w-full px-4 py-2 border border-gray-300  focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.modal.userLastName")} *
                    </label>
                    <input
                      type="text"
                      value={newManager.last_name}
                      onChange={(e) =>
                        setNewManager({
                          ...newManager,
                          last_name: e.target.value,
                        })
                      }
                      required
                      placeholder={t("dashboard.modal.userLastNamePlaceholder")}
                      className="w-full px-4 py-2 border border-gray-300  focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.modal.userEmailAddress")} *
                    </label>
                    <input
                      type="email"
                      value={newManager.email}
                      onChange={(e) =>
                        setNewManager((prev) => {
                          return { ...prev, email: e.target.value };
                        })
                      }
                      required
                      placeholder={t(
                        "dashboard.modal.userEmailAddressPlaceholder"
                      )}
                      className="w-full px-4 py-2 border border-gray-300  focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.users.roles.selectRole")} *
                    </label>
                    <div className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                      {AVAILABLE_ROLES.map((role) => (
                        <label
                          key={role.value}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            type="radio"
                            name="userRole"
                            value={role.value}
                            checked={newManager.assigned_roles.includes(
                              role.value
                            )}
                            onChange={() => handleRoleRadioChange(role.value)}
                            // disabled={currentUser.role === role.value}
                          />
                          <span className="text-sm text-gray-700">
                            {role.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-200 px-6 py-4">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300  hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    type="button"
                    onClick={handleCloseCreateModal}
                  >
                    {t("dashboard.buttons.cancel")}
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-[#007bff]  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={
                      
                      isUpdatingUser ||
                      !newManager.first_name ||
                      !newManager.last_name ||
                      !newManager.email ||
                      newManager.assigned_roles.length === 0
                    }
                  >
                    {isUpdatingUser ? (
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
                        {t("Updating...")}
                      </div>
                    ) : (
                      t("dashboard.buttons.save")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Manager Modal */}
        {isUsersView && showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white  shadow-xl w-full max-w-md md:max-w-lg overflow-hidden">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  {t("dashboard.modal.createManager")}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={handleCloseCreateModal}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleCreateManager}>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("dashboard.modal.userFirstName")} *
                    </label>
                    <input
                      type="text"
                      value={newManager.first_name}
                      onChange={(e) =>
                        setNewManager({
                          ...newManager,
                          first_name: e.target.value,
                        })
                      }
                      required
                      placeholder={t(
                        "dashboard.modal.userFirstNamePlaceholder"
                      )}
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("dashboard.modal.userLastName")} *
                    </label>
                    <input
                      type="text"
                      value={newManager.last_name}
                      onChange={(e) =>
                        setNewManager({
                          ...newManager,
                          last_name: e.target.value,
                        })
                      }
                      required
                      placeholder={t("dashboard.modal.userLastNamePlaceholder")}
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("dashboard.modal.userEmailAddress")} *
                    </label>
                    <input
                      type="email"
                      value={newManager.email}
                      onChange={(e) =>
                        setNewManager({ ...newManager, email: e.target.value })
                      }
                      required
                      placeholder={t(
                        "dashboard.modal.userEmailAddressPlaceholder"
                      )}
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|io)$"
                      onBlur={(e) => {
                        if (
                          !validateManagerEmail(e.target.value) &&
                          e.target.value
                        ) {
                          alert(
                            "Enter Email ending with .com, .uk, .eu, .de, .fr, .it, .es, .nl, .be, .se, .pl, .in, or .io"
                          );
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("dashboard.users.roles.selectRole")} *
                    </label>
                    <select
                      value={newManager.role}
                      onChange={(e) =>
                        setNewManager({ ...newManager, role: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">
                        {t("dashboard.users.roles.selectRole")}
                      </option>
                      <option value="ticket_manager">
                        {t("dashboard.users.roles.ticket_manager")}
                      </option>
                      <option value="customer_manager">
                        {t("dashboard.users.roles.customer_manager")}
                      </option>
                      <option value="sales_manager">
                        {t("dashboard.users.roles.sales_manager")}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100  hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {t("dashboard.buttons.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isCreatingManager ||
                      !newManager.first_name ||
                      !newManager.last_name ||
                      !validateManagerEmail(newManager.email) ||
                      !newManager.role
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-[#007bff]  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingManager ? (
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
                        {t("Creating")}
                      </div>
                    ) : (
                      t("dashboard.buttons.createManager")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Ticket Modal */}
        {!isUsersView && showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[50]">
            <div className="bg-white shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("dashboard.modal.createNewTicket")}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => {
                    setDropdownOpen((prev) => ({
                      ...prev,

                      status: false,
                      category: false,
                      countryCode: false,
                      countryCode2: false,
                      department: false,
                      priority: false,
                    }));
                    setShowCreateModal(false);
                  }}
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <form
                onSubmit={handleCreateTicket}
                className="p-6 overflow-y-auto max-h-[70vh]"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dashboard.form.title")}{" "}
                    <span className="text-red-600">*</span>
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
                    maxLength={254}
                    required
                    title={t("empty_validations.validation")}
                    placeholder={t("dashboard.form.titlePlaceholder")}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Second Row - Company, Street, City, Zip Code */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="w-full md:w-1/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.customerCompany")}{" "}
                        <span className="text-red-600">*</span>
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
                        title={t("empty_validations.validation")}
                        maxLength={254}
                        required
                        placeholder={t(
                          "dashboard.form.customerCompanyPlaceholder"
                        )}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-2/5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.street")}{" "}
                      </label>
                      <input
                        type="text"
                        value={newTicket.street}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            street: capitalizeWords(e.target.value),
                          })
                        }
                        maxLength={254}
                        placeholder={t("dashboard.form.streetPlaceholder")}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-1/6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.zip_code")}{" "}
                      </label>
                      <input
                        type="text"
                        value={newTicket.zip_code}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            zip_code: e.target.value,
                          })
                        }
                        maxLength={7}
                        placeholder={t("dashboard.form.zipPlaceholder")}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full md:w-1/4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.city")}{" "}
                      </label>
                      <input
                        type="text"
                        value={newTicket.city}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            city: capitalizeWords(e.target.value),
                          })
                        }
                        maxLength={99}
                        placeholder={t("dashboard.form.cityPlaceholder")}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex flex-col gap-4 mb-4">
                    {/* First Row: Customer Name and Phone */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboard.form.customerName")}{" "}
                          <span className="text-red-600">*</span>
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
                          title={t("empty_validations.validation")}
                          maxLength={254}
                          required
                          placeholder={t(
                            "dashboard.form.customerNamePlaceholder"
                          )}
                          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {/* {t("dashboard.form.Phone")} * */}
                          {t("dashboard.form.Phone")}{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        {/* Custom Country Code Dropdown */}
                        <div className="flex flex-col sm:flex-row border border-gray-300">
                          <div className="relative w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() =>
                                setDropdownOpen((prev) => ({
                                  ...prev,
                                  countryCode: !prev.countryCode,
                                }))
                              }
                              className="w-full sm:w-auto md:w-24 mr-[.20rem] px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-300 bg-gray-50 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <span>
                                {countryCodes.find(
                                  (country) =>
                                    country.code === selectedCountryCode
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
                                <ul className="py-1">
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
                                      <span className="mr-2">
                                        {country.flag}
                                      </span>
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
                              setNewTicket({
                                ...newTicket,
                                customer_phone: value,
                              });
                            }}
                            required
                            placeholder={t(
                              "dashboard.form.customerPhonePlaceholder"
                            )}
                            pattern="^\d{1,15}$"
                            title={t("empty_validations.validation")}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {newTicket.customer_phone &&
                          !validatePhone(
                            `${selectedCountryCode} ${newTicket.customer_phone}`
                          ) && (
                            <small className="text-red-500 text-xs mt-1">
                              {t(
                                "dashboard.form.customerNumberValidationError"
                              )}
                            </small>
                          )}
                      </div>
                    </div>

                    {/* Second Row: Customer Email and Customer Number */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboard.form.customerEmail")}{" "}
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
                          maxLength={254}
                          placeholder={t(
                            "dashboard.form.customerEmailPlaceholder"
                          )}
                          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|io)$"
                          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("dashboard.form.customer_number")}
                        </label>
                        {/* Custom Country Code Dropdown */}
                        <div className="flex flex-col sm:flex-row border border-gray-300">
                          <input
                            type="text"
                            value={newTicket.customer_number}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNewTicket({
                                ...newTicket,
                                customer_number: value,
                              });
                            }}
                            maxLength={18}
                            placeholder={t(
                              "dashboard.form.customerNumberPlaceHolder"
                            )}
                            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fourth Row - Description (Full Width) */}
                <div className="mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("dashboard.form.description")}{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          description: e.target.value,
                        })
                      }
                      title={t("empty_validations.validation")}
                      maxLength={255}
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
                        {t("dashboard.form.category")}
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
                                ? t(
                                    "dashboard.tickets.category.feature_request"
                                  )
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
                                {t(
                                  "dashboard.tickets.category.feature_request"
                                )}
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
                      <input
                        type="hidden"
                        value={newTicket.category}
                        required
                      />
                    </div>

                    {/* Department Dropdown */}
                    <div className="relative w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.form.department")}
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
                        {t("dashboard.form.priority")}
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
                                ? "middle"
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
                                  setNewTicket({
                                    ...newTicket,
                                    priority: "low",
                                  });
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
                      <input
                        type="hidden"
                        value={newTicket.priority}
                        required
                      />
                    </div>

                    <div className="relative w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.tickets.filters.status")}
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setDropdownOpen((prev) => ({
                              ...prev,
                              status: !prev.status,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <span>
                            {newTicket.status === "new"
                              ? t("dashboard.tickets.status.new")
                              : newTicket.status === "in_progress"
                              ? t("dashboard.tickets.status.in_progress")
                              : newTicket.status === "resolved"
                              ? t("dashboard.tickets.status.resolved")
                              : newTicket.status === "waiting_customer"
                              ? t("dashboard.tickets.status.waiting_customer")
                              : newTicket.status === "rejected"
                              ? t("dashboard.tickets.status.rejected")
                              : newTicket.status === "reopened"
                              ? t("dashboard.tickets.status.reopened")
                              : newTicket.status === "escalated"
                              ? t("dashboard.tickets.status.escalated")
                              : t("dashboard.tickets.filters.status")}
                          </span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              dropdownOpen.status ? "rotate-180" : ""
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
                        {dropdownOpen.status && (
                          <div className="absolute w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto z-10">
                            <ul className="py-1">
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({ ...newTicket, status: "new" });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.new")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({
                                    ...newTicket,
                                    status: "in_progress",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.in_progress")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({
                                    ...newTicket,
                                    status: "waiting_customer",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.waiting_customer")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({
                                    ...newTicket,
                                    status: "resolved",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.resolved")}
                              </li>
                              {/* <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({
                                    ...newTicket,
                                    status: "closed",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                Closed
                              </li> */}
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({
                                    ...newTicket,
                                    status: "rejected",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.rejected")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({
                                    ...newTicket,
                                    status: "reopened",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.reopened")}
                              </li>
                              <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setNewTicket({
                                    ...newTicket,
                                    status: "escalated",
                                  });
                                  setDropdownOpen((prev) => ({
                                    ...prev,
                                    status: false,
                                  }));
                                }}
                              >
                                {t("dashboard.tickets.status.escalated")}
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <input type="hidden" value={newTicket.status} required />
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2 mb-6">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {t("detail_view.attachments")}
                    </label>

                    <div className="overflow-hidden">
                      <input
                        type="file"
                        id="file-upload"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                        accept="image/*,.pdf,.doc,.docx"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file: file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <div className=" ml-2 text-sm my-2 ">
                        (.docx, .pdf, .doc, image)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 border-t pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen((prev) => ({
                        ...prev,

                        status: false,
                        category: false,
                        countryCode: false,
                        countryCode2: false,
                        department: false,
                        priority: false,
                      }));
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {t("dashboard.buttons.cancel")}
                  </button>
                  <button
                    disabled={isCreatingTicket}
                    type="submit"
                    className="px-4 py-2 bg-[#007bff] text-white hover:bg-blue-700 transition-colors"
                  >
                    {t("dashboard.buttons.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showViewModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              {isViewLoading ? (
                <div className="modal-loading">
                  <div className="loader-small"></div>
                </div>
              ) : currentTicket ? (
                <>
                  <div className="modal-header">
                    <h2>{t("dashboard.modal.ticketDetails.title")}</h2>
                    <button
                      className="close-button"
                      onClick={() => setShowViewModal(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="ticket-details">
                      <div className="detail-row">
                        <label>
                          {t("dashboard.modal.ticketDetails.ticketId")}:
                        </label>
                        <span>{currentTicket.ticket_id}</span>
                      </div>
                      <div className="detail-row">
                        <label>
                          {t("dashboard.modal.ticketDetails.title")}:
                        </label>
                        <span>{currentTicket.title}</span>
                      </div>
                      <div className="detail-row">
                        <label>
                          {t("dashboard.modal.ticketDetails.description")}:
                        </label>
                        <p>{currentTicket.description}</p>
                      </div>
                      <div className="detail-row">
                        <label>
                          {t("dashboard.modal.ticketDetails.status")}:
                        </label>
                        <span
                          className={`status-badge ${currentTicket.status.toLowerCase()}`}
                        >
                          {t(
                            `dashboard.tickets.status.${currentTicket.status.toLowerCase()}`
                          )}
                        </span>
                      </div>
                      <div className="detail-row">
                        <label>
                          {t("dashboard.modal.ticketDetails.priority")}:
                        </label>
                        <span
                          className={`priority-badge ${currentTicket.priority.toLowerCase()}`}
                        >
                          {t(
                            `dashboard.tickets.priority.${currentTicket.priority.toLowerCase()}`
                          )}
                        </span>
                      </div>
                      <div className="detail-row">
                        <label>
                          {t("dashboard.modal.ticketDetails.customer")}:
                        </label>
                        <span>
                          {currentTicket.customer_name} (
                          {currentTicket.customer_company})
                        </span>
                      </div>
                      <div className="detail-row">
                        <label>
                          {t("dashboard.modal.ticketDetails.department")}:
                        </label>
                        <span>
                          {t(
                            `dashboard.tickets.department.${currentTicket.department}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

// // Add this helper function to check if content is truly empty
// const isContentEmpty = (htmlContent) => {
//   if (!htmlContent) return true;

//   // Create a temporary element to parse the HTML
//   const tempDiv = document.createElement('div');
//   tempDiv.innerHTML = htmlContent;

//   // Get the text content without HTML tags
//   const textContent = tempDiv.textContent || tempDiv.innerText || '';

//   // Check if the text content is empty after trimming
//   return textContent.trim() === '';
// };

// // Updated onInput handler
// <div
//   ref={replyContainer}
//   className="editor-content p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
//   contentEditable
//   onInput={(e) => {
//     const htmlContent = e.target.innerHTML;
//     setReplyText(htmlContent);

//     // Optional: Clean up empty HTML tags
//     if (isContentEmpty(htmlContent)) {
//       setReplyText('');
//       e.target.innerHTML = '';
//     }
//   }}
//   suppressContentEditableWarning={true}
//   style={{
//     minHeight: "128px",
//   }}
//   data-placeholder="Write your reply here..."
// />

// // Updated button disabled condition
// <button
//   className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-[#007bff] hover:bg-[#0056b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
//   onClick={(e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     // Use the helper function to check if content is truly empty
//     if (!isContentEmpty(replyText) && !isSubmittingComment) {
//       handleSaveComment(ticket.ticket_id, replyText).then(() => {
//         setReplyText("");
//         replyContainer.current.innerHTML = "";
//       });
//     }
//   }}
//   disabled={Boolean(isContentEmpty(replyText) || isSubmittingComment)}
// >
//   {isSubmittingComment ? "Saving..." : "Save"}
// </button>
