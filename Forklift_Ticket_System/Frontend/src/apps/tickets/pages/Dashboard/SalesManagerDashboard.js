import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DateTime } from "luxon";
import {
  FaSearch,
  FaUserCog,
  FaExclamationCircle,
  FaClock,
  FaTicketAlt,
  FaCheckCircle,
  FaTimes,
  FaEdit,
  FaTrash,
  FaRegCopyright,
  FaArchive,
  FaSpinner,
  FaPlus,
  FaEye,
  FaPaperclip,
} from "react-icons/fa";
// import './SalesManagerDashboard.css';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import API_BASE_URL from "../../../../config/api.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HeroSection from "../../../../components/HeroSection/HeroSection.js";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import Footer from "../../../../components/Footer/Footer.jsx";
import { DashboardLoader } from "../../../../components/Loader.js";
import { useNavigate } from "react-router-dom";

const SalesManagerDashboard = () => {
  const { t, i18n } = useTranslation();
  const replyContainer = useRef();

  const { currentLanguage } = useSelector((state) => state.translation);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [ticketReplies, setTicketReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [itemsPerPage] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const navigate = useNavigate();

  const [refreshTickets, setRefreshTickets] = useState(false);

  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    console.log("reply text = ", replyText);
  }, [replyText]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
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
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
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
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countryCodes[0].code
  );

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

  const handleEditTicket = (ticketId) => {
    const ticketToEdit = tickets.find(
      (ticket) => ticket.ticket_id === ticketId
    );
    if (ticketToEdit) {
      setSelectedTicket(ticketToEdit);
      setShowEditModal(true);
    }
  };

  const [dropdownOpen, setDropdownOpen] = useState({
    priority: false,
    category: false,
    countryCode: false,
    countryCode2: false,
    department: false,
  });

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

  const capitalizeWords = (str) => {
    if (!str) return str;
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const [file, setFile] = useState(null);
  const [increaseZindex, setIncreaseZindex] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const departmentDropdownRef = useRef(null);

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [priorityyDropdownOpen, setPriorityyDropdownOpen] = useState(false);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (filterName, value) => {
    console.log("filtername = ", filterName, " value = ", value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
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
      // setDropdownOpen((prev) => ({
      //   ...prev,
      //   countryCode: false,
      //   status: false,
      //   category: false,
      //   department: false,
      //   priority: false,
      // }));
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Fetch tickets
  const fetchTickets = async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      console.error("No access token found");
      setError("Authentication required");
      setLoading(false);
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
      console.log("response = ", response);
      console.log("response = ", response);
      console.log("status = ", response?.status);
      console.log("tickets sales manager = ", response?.data);
      const commentsMap = {};
      const ticketsWithComments = response?.data;
      ticketsWithComments.forEach((ticket) => {
        console.log("ticket comment ", ticket.comment);
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
      setTickets(response?.data || []);
    } catch (err) {
      if (err?.response?.status === 401) {
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
          toast.info("Session expired. Please login again.");
        }
      } else {
        setError("Failed to fetch dashboard data");
      }
      console.error(
        "Error fetching tickets:",
        err.response ? err.response.data : err.message
      );
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchTickets();
  }, [currentLanguage, refreshTickets]);

  useEffect(() => {
    const newStats = {
      total: tickets.length,
      new: tickets.filter((t) => t.status.toLowerCase() === "new").length,
      inProgress: tickets.filter(
        (t) => t.status.toLowerCase() === "in_progress"
      ).length,
      resolved: tickets.filter((t) => t.status.toLowerCase() === "resolved")
        .length,
    };
    if (JSON.stringify(stats) !== JSON.stringify(newStats)) {
      setStats(newStats);
    }
  }, [tickets]);

  const handleUpdateTicket = async (ticketId, updatedData) => {
    const token = localStorage.getItem("access");
    console.log("updated data = ", updatedData);
    if (updatedData?.internal_notes.trim() === "") {
      toast.info("Please add some comment");
      return;
    }
    const trimmedText = updatedData?.internal_notes.trim();
    const userName = localStorage.getItem("name");
    const comments = [
      {
        name: userName || "Anonymous",
        comment: trimmedText,
        timestamp: new Date().toISOString(),
      },
    ];
    const updatedCurrentTicket = { ...updatedData, comments };
    setIsSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${ticketId}/?target_language=${currentLanguage}`,
        updatedCurrentTicket,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.ticket_id === ticketId ? response.data : ticket
        )
      );
      if (file) {
          await uploadFile(response?.data?.ticket_id);
          
        }

      setShowEditModal(false);

      toast.success("Ticket updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setRefreshTickets((prev) => !prev);
      setIsSaving(false);
    } catch (error) {
      setIsSaving(false);
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
        position: "top-right",
        autoClose: 3000,
      });
      setFile(null); 
      setIsSaving(false);
    }
  };
  const handleTicketClick = (ticketId) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null); // Collapse if already expanded
    } else {
      setExpandedTicketId(ticketId); // Expand clicked ticket
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
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
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

        toast.success("Comment added successfully!");
        setRefreshTickets((prev) => !prev);
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      toast.error("Failed to save comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
      setReplyText("");
      setExpandedTicketId(null);
      setIncreaseZindex(false);
      setFile(null);
    }
  };
  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Reset pagination when searching
    setCurrentPage(1);
  };

  const handleDeleteTicket = async (ticketId) => {
    // if (!window.confirm('Are you sure you want to delete this ticket?')) {
    //   return;
    // }

    const token = localStorage.getItem("access");
    try {
      await axios.delete(
        `${API_BASE_URL}/tickets/${ticketId}/?target_language=${currentLanguage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTickets((prevTickets) =>
        prevTickets.filter((ticket) => ticket.ticket_id !== ticketId)
      );
      toast.success("Ticket deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      //   catch (error) {
      //     console.error('Error deleting ticket:', error);
      //     alert('Failed to delete ticket. Please try again.');
      //   }
      // };
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const filteredData = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      ticket.ticket_id.toString().toLowerCase().includes(query) ||
      ticket.title.toLowerCase().includes(query);

    const matchesStatus =
      filters.status === "" || ticket.status === filters.status;

    const matchesPriority =
      filters.priority === "" || ticket.priority === filters.priority;

    const matchesCategory =
      filters.category === "" || ticket.category === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const validatePhone = (phone) => {
    // const phoneRegex = /^\d{10}$/;
    const phoneRegex = /^\+\d{1,3} \d{1,12}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|io)$/i;
    return emailRegex.test(email);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.department || !newTicket.priority || !newTicket.category) {
      toast.error("Please fill out all the fields");
      return;
    }
    const token = localStorage.getItem("access");
    const managerName = localStorage.getItem("userName");
    const fullPhoneNumber = `${selectedCountryCode} ${newTicket.customer_phone}`;
    if (newTicket.customer_email && !validateEmail(newTicket.customer_email)) {
      toast.info(
        "Please enter a valid email address ending with .com, .uk, .eu,.de,.fr,.it,.es,.nl,.be,.se,.pl,.in, or .io"
      );
      return;
    }
    setIsCreatingTicket(true); // Start loading
    setCreatingTicket(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/?target_language=${currentLanguage}`,
        {
          ...newTicket,
          customer_name: managerName || newTicket.customer_name,
          customer_phone: fullPhoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("ticket response = ", response);

      if (response.status === 201 || response.status === 200) {
        // Store the toast message in localStorage
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

        setShowViewModal(false);
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

        // setTickets(response.data)

        // // Refresh the page
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
          setError("Session expired. Please login again.");
          navigate("/login");
          toast.info("Session expired. Please login again.");
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
      setCreatingTicket(false);
      setShowCreateTicketModal(false);
    }
  };

  const getPaginatedTickets = () => {
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    return filteredData.slice(indexOfFirstTicket, indexOfLastTicket);
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
    setCurrentPage(1);
  }, [searchQuery, filters]);

  if (creatingTicket) {
    return <DashboardLoader message={t("loadingMessage.creatingTicket")} />;
  }

  if (loading) {
    return (
      <DashboardLoader message={t("loadingMessage.salesManager")} />
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

  return (
    <div className="dashboard-container  w-full max-w-full  flex flex-col min-h-screen  bg-gray-50">
      {/* Statistics Cards */}
      <>
        <HeroSection {...{ t, handleSearch, setSearchQuery, searchQuery }} />
      </>
      {/* Filters and Search */}
      <div className="bg-white py-3 px-4 shadow-md w-  ">
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
                      {/* <li
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
                        onClick={() => {
                          handleFilterChange("status", "resolved");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {t("dashboard.tickets.status.resolved")}
                      </li> */}
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
              className="create-manager-btn2 flex items-center justify-center gap-2 bg-[#007bff] text-white px-4 py-2 w-full sm:w-auto shadow-md hover:bg-blue-700 transition duration-200 mt-2 sm:mt-0"
              onClick={() => setShowCreateTicketModal(true)}
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

      <div className="w-full bg-[#f9f9f9] p-4 md:p-6">
        <div className="tickets-list-container max-w-full mx-auto">
          {getPaginatedData().length === 0 ? (
            <div className="flex justify-center items-center p-8  bg-gray-50 border border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                No Tickets Available
              </h2>
            </div>
          ) : (
            getPaginatedData().map((ticket) => {
              if (
                ticket?.status !== "resolved" &&
                ticket.status !== "gelöst" &&
                (!expandedTicketId || expandedTicketId === ticket.ticket_id)
              ) {
                return (
                  <div
                    key={ticket.ticket_id}
                    className={`ticket-list-item border border-gray-200 mb-3 shadow-sm transition-all duration-200 ${
                      expandedTicketId === ticket.ticket_id
                        ? "bg-gray-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => handleTicketClick(ticket.ticket_id)}
                  >
                    {/* Collapsed View */}
                    <div className="ticket-content  p-2  ">
                      <div className="flex flex-col gap-3 md:flex-row justify-between">
                        <div className="name-section mb-2 md:mb-0">
                          <div className="name-company mb-1">
                            <span className="customer-name font-semibold text-base sm:text-lg">
                              {ticket.title.toUpperCase()}
                            </span>
                          </div>
                          <div className="department-created flex flex-col gap-2 md:gap-0  sm:flex-row sm:space-x-2  text-xs sm:text-sm text-gray-600 ">
                            <span className="inline-block bg-gray-100 px-2 py-1 ">
                              {t("dashboard.form.customerCompany")} : {ticket.customer_company}
                            </span>
                            <span className="department-tag bg-gray-100 px-2 py-1">
                               {t("dashboard.form.department")}:{t(`dashboard.tickets.department.${ticket.department}`)} 
                            </span>
                            <span className="creation-tag  bg-gray-100 px-2 py-1">
                              {t('timestamps.created')}:{" "} {formatTimestamp(ticket.creation_date)}
                            </span>
                            {ticket.last_updated && (
                              <span className="creation-tag1  bg-gray-100 px-2 py-1 ">
                                 {t('timestamps.updated')}:{" "} {formatTimestamp(ticket.last_updated)}
                                <span className="md:mx-2">
                                  By ( {ticket.activity_log[0]?.changed_by} ){" "}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className=" flex justify-between items-center gap-2 ">
                          <span
                            className={`status-badge px-2 py-1 sm:px-3 sm:py-1  text-xs font-medium ${
                              ticket.status === "Open"
                                ? "bg-green-100 text-green-800"
                                : ticket.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : ticket.status === "Resolved"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {t(`dashboard.tickets.status.${ticket.status}`)}
                          </span>
                          {expandedTicketId === ticket.ticket_id ? (
                            <button
                              className="btn-icon close text-gray-500 hover:text-gray-700 p-1 sm:p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTicketId(null);
                              }}
                            >
                              <FaTimes />
                            </button>
                          ) : (
                            <div className="action-buttons flex space-x-1 sm:space-x-2">
                              <button
                                className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTicket(ticket);
                                  setShowEditModal(true);
                                }}
                              >
                                <FaEdit className="w-5 h-5" />
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
                                    {t("dashboard.tickets.filters.status")} :
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
                                    {t(`dashboard.tickets.status.${ticket.status}`)}
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
                                    Edit Status
                                  </button>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                  <span className="text-sm font-medium text-gray-500">
                                    {t("dashboard.form.priority")}
                                  </span>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium  ${
                                      ticket.priority.toLowerCase() === "high"
                                        ? "bg-red-100 text-red-800"
                                        : ticket.priority.toLowerCase() ===
                                          "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {t(`dashboard.tickets.priority.${ticket.priority}`)}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                  <span className="text-sm font-medium text-gray-500">
                                    {t("dashboard.form.department")}
                                  </span>
                                  <span className="text-sm text-gray-900">
                                    {t(`dashboard.tickets.department.${ticket.department}`)}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                  <span className="text-sm font-medium text-gray-500">
                                    {t("dashboard.form.category")}
                                  </span>
                                  <span className="text-sm text-gray-900">
                                    {t(`dashboard.tickets.category.${ticket.category}`)}
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
                                    {t("dashboard.form.customerEmail")} :{" "}
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
                                     {t('timestamps.created')}:{" "}
                                    {formatTimestamp(ticket.creation_date)}
                                  </span>
                                  {ticket.last_updated && (
                                    <span className="bg-gray-100 px-2 py-1 ">
                                       {t('timestamps.updated')}:{" "}
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
                                                  {t("detail_view.changed_by")}:
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

                            {ticketReplies[ticket.ticket_id]?.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {t("detail_view.comments")} :
                                  <span>
                                    ({ticketReplies[ticket.ticket_id]?.length})
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
                                          {renderFormattedComment(reply.text)}
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
                                    onClick={() => handleFormatCommand("bold")}
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
                                      handleFormatCommand("insertUnorderedList")
                                    }
                                  >
                                    •
                                  </button>
                                  <button
                                    type="button"
                                    className="p-2 hover:bg-gray-200 rounded text-sm"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() =>
                                      handleFormatCommand("insertOrderedList")
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
                                  {getPlainTextFromHtml(replyText || "").length}
                                  /255 characters
                                </div>
                                {getPlainTextFromHtml(replyText || "").length >
                                  240 && (
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
                                          replyContainer.current.innerHTML = "";
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
            })
          )}

          {!expandedTicketId && <Pagination />}
        </div>
      </div>
      {<Footer />}

      {/* Edit Modal */}
      {showEditModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[3000]">
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
                  setShowEditModal(false);
                  setFile(null); 
                }}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTicket(selectedTicket.ticket_id, selectedTicket);
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
                  value={selectedTicket.title}
                  onChange={(e) =>
                    setSelectedTicket({
                      ...selectedTicket,
                      title: e.target.value,
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
                      value={selectedTicket.customer_company}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          customer_company: e.target.value,
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
                      value={selectedTicket.street}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          street: e.target.value,
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
                      value={selectedTicket.city}
                      onChange={(e) =>
                        setSelectedTicket({
                          ...selectedTicket,
                          city: e.target.value,
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
                        value={selectedTicket.customer_name}
                        onChange={(e) =>
                          setSelectedTicket({
                            ...selectedTicket,
                            customer_name: e.target.value,
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
                            <div className="absolute w-full sm:w-64 mt-1 bg-white border border-gray-300 shadow-lg max-h-48 overflow-y-auto z-[50]">
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
                          value={selectedTicket.customer_phone}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/[^0-9]/g, "")
                              .slice(0, 15);
                            setSelectedTicket({
                              ...selectedTicket,
                              customer_phone: value,
                            });
                          }}
                          required
                          placeholder={t(
                            "dashboard.form.customerPhonePlaceholder"
                          )}
                          title={t("empty_validations.validation")}
                          // pattern="^\d{1,15}$"

                          className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {/* {selectedTicket.customer_phone &&
                        !validatePhone(
                          `${selectedCountryCode} ${selectedTicket.customer_phone}`
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
                        value={selectedTicket.customer_email}
                        onChange={(e) =>
                          setSelectedTicket({
                            ...selectedTicket,
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

              {/* Description */}
              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dashboard.form.description")}{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={selectedTicket.description}
                    onChange={(e) =>
                      setSelectedTicket({
                        ...selectedTicket,
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

              {/* Category, Department, Priority and Status */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Category Dropdown */}
                  <div className="relative w-full md:w-1/4">
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
                          {selectedTicket.category
                            ? selectedTicket.category === "technical"
                              ? t("dashboard.tickets.category.technical")
                              : selectedTicket.category === "billing"
                              ? t("dashboard.tickets.category.billing")
                              : selectedTicket.category === "feature_request"
                              ? t("dashboard.tickets.category.feature_request")
                              : selectedTicket.category === "bug_report"
                              ? t("dashboard.tickets.category.bug_report")
                              : selectedTicket.category === "support"
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                      value={selectedTicket.category}
                      required
                    />
                  </div>

                  {/* Department Dropdown */}
                  <div className="relative w-full md:w-1/4">
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
                          {selectedTicket.department
                            ? selectedTicket.department === "sales"
                              ? t("dashboard.tickets.department.sales")
                              : selectedTicket.department === "sales_ue"
                              ? t("dashboard.tickets.department.sales_ue")
                              : selectedTicket.department === "sales_sth"
                              ? t("dashboard.tickets.department.sales_sth")
                              : selectedTicket.department === "service"
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                      value={selectedTicket.department}
                      required
                    />
                  </div>

                  {/* Priority Dropdown */}
                  <div className="relative w-full md:w-1/4">
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
                          {selectedTicket.priority
                            ? selectedTicket.priority === "high"
                              ? t("dashboard.tickets.priority.high")
                              : selectedTicket.priority === "middle"
                              ? t("dashboard.tickets.priority.middle")
                              : selectedTicket.priority === "low"
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                      value={selectedTicket.priority}
                      required
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative w-full md:w-1/4">
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
                          <span>
                            {selectedTicket.status === "new"
                              ? t("dashboard.tickets.status.new")
                              : selectedTicket.status === "in_progress"
                              ? t("dashboard.tickets.status.in_progress")
                              : selectedTicket.status === "resolved"
                              ? t("dashboard.tickets.status.resolved")
                              : selectedTicket.status === "waiting_customer"
                              ? t("dashboard.tickets.status.waiting_customer")
                              : selectedTicket.status === "rejected"
                              ? t("dashboard.tickets.status.rejected")
                              : selectedTicket.status === "reopened"
                              ? t("dashboard.tickets.status.reopened")
                              : selectedTicket.status === "escalated"
                              ? t("dashboard.tickets.status.escalated")
                              : t("dashboard.tickets.filters.status")}
                          </span>
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                                setSelectedTicket({
                                  ...selectedTicket,
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
                      value={selectedTicket.status}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-1 sm:space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {t("detail_view.attachments")}
                </label>

                <div className="space-y-2">
                  {selectedTicket.attachments.map((attachments, index) => (
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

              {/* Internal Notes/Comments */}
              <div className="mb-6">
                <div className="space-y-1">
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
                          e.target.innerHTML =
                            selectedTicket?.internal_notes || "";
                          // Move cursor to end
                          const range = document.createRange();
                          const sel = window.getSelection();
                          range.selectNodeContents(e.target);
                          range.collapse(false);
                          sel.removeAllRanges();
                          sel.addRange(range);
                          return;
                        }

                        setSelectedTicket({
                          ...selectedTicket,
                          internal_notes: currentHtml,
                        });
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
                        getPlainTextFromHtml(
                          selectedTicket?.internal_notes || ""
                        ).length
                      }
                      /255 characters
                    </div>
                    {getPlainTextFromHtml(selectedTicket?.internal_notes || "")
                      .length > 240 && (
                      <div className="text-sm text-amber-600">
                        {255 -
                          getPlainTextFromHtml(
                            selectedTicket?.internal_notes || ""
                          ).length}{" "}
                        characters remaining
                      </div>
                    )}
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
                    setShowEditModal(false);
                     setFile(null); 
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {t("dashboard.buttons.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={Boolean(
                    isContentEmpty(selectedTicket?.internal_notes || "") ||
                      isSaving ||
                      getPlainTextFromHtml(selectedTicket?.internal_notes || "")
                        .length > 255
                  )}
                  className={`px-4 py-2 bg-[#007bff] text-white hover:bg-blue-700 transition-colors disabled:bg-blue-600 disabled:cursor-not-allowed disabled:hover:bg-blue-600 ${
                    Boolean(
                      isContentEmpty(selectedTicket?.internal_notes || "") ||
                        isSaving ||
                        getPlainTextFromHtml(
                          selectedTicket?.internal_notes || ""
                        ).length > 255
                    )
                      ? "disabled opacity-75 "
                      : ""
                  }`}
                >
                  {t("dashboard.buttons.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedTicket && (
        <div className="modal-backdrop">
          <div className="modal-content">
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
                  <label>{t("dashboard.modal.ticketDetails.ticketId")}:</label>
                  <span>{selectedTicket.ticket_id}</span>
                </div>
                <div className="detail-row">
                  <label>{t("dashboard.modal.ticketDetails.title")}:</label>
                  <span>{selectedTicket.title}</span>
                </div>
                <div className="detail-row">
                  <label>
                    {t("dashboard.modal.ticketDetails.description")}:
                  </label>
                  <p>{selectedTicket.description}</p>
                </div>
                <div className="detail-row">
                  <label>{t("dashboard.modal.ticketDetails.status")}:</label>
                  <span
                    className={`status-badge ${selectedTicket.status.toLowerCase()}`}
                  >
                    {t(
                      `dashboard.tickets.status.${selectedTicket.status.toLowerCase()}`
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t("dashboard.modal.ticketDetails.priority")}:</label>
                  <span
                    className={`priority-badge ${selectedTicket.priority.toLowerCase()}`}
                  >
                    {t(
                      `dashboard.tickets.priority.${selectedTicket.priority.toLowerCase()}`
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <label>{t("dashboard.modal.ticketDetails.customer")}:</label>
                  <span>
                    {selectedTicket.customer_name} (
                    {selectedTicket.customer_company})
                  </span>
                </div>
                <div className="detail-row">
                  <label>
                    {t("dashboard.modal.ticketDetails.department")}:
                  </label>
                  <span>
                    {t(
                      `dashboard.tickets.department.${selectedTicket.department}`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
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
                  setShowCreateTicketModal(false);
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
                            {t("dashboard.form.customerNumberValidationError")}
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
                    <input type="hidden" value={newTicket.priority} required />
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
                    setShowCreateTicketModal(false);
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
      <>{/* Your app content */}</>
    </div>
  );
};

export default SalesManagerDashboard;
