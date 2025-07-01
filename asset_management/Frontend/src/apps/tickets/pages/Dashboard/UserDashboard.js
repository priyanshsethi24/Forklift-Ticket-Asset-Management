import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCog, FaExclamationCircle, FaClock, FaCheckCircle, FaTimes, FaPlus, FaTicketAlt, FaUpload, FaFile, FaDownload } from 'react-icons/fa';
import './UserDashboard.css';
import { useTranslation } from 'react-i18next';
import { baseNew } from '../../../../network/baseUrl';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }
    localStorage.setItem('userRole', 'user');
    fetchUserTickets();
  }, [navigate]);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: '',
    customer_company: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    category: '',
    department: '',
    internal_notes: '',
    status: 'new',
    related_ticket: [],
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: ''
  });
  const [relatedTickets, setRelatedTickets] = useState([]);
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch user's tickets
  useEffect(() => {
    fetchUserTickets();
    fetchRelatedTickets();
  }, []);

  const fetchUserTickets = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      setError(t('errors.authRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${baseNew}/tickets/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(t('errors.fetchTickets'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTickets = async (department) => {
    const token = localStorage.getItem('access');
    if (!token) {
      setError('Authentication required');
      return;
    }
    
    // Don't make the API call if department is empty
    if (!department) {
      setRelatedTickets([]);
      return;
    }
    
    try {
      const response = await axios.post(
        `${baseNew}/tickets/by-department/`,
        { department: department },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        // Filter out the current ticket if it exists
        const filteredTickets = response.data.filter(ticket => 
          ticket.ticket_id !== (newTicket.ticket_id || null)
        );
        setRelatedTickets(filteredTickets);
        setError(null); // Clear any previous errors
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Failed to load related tickets');
      }
    } catch (err) {
      console.error('Error fetching related tickets:', err);
      setError(err.response?.data?.error || 'Failed to fetch related tickets');
      setRelatedTickets([]); // Clear related tickets on error
    }
  };

  // Add these validation functions near the top of your component
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|io)$/;
    return emailRegex.test(email);
  };

  // Add this helper function near your other validation functions
  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Add this helper function at the top of your component
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // This will show date as DD/MM/YYYY
  };

  // Update the handleCreateTicket function
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    
    try {
      const formData = new FormData();

      // Append basic ticket data
      formData.append('title', newTicket.title);
      formData.append('description', newTicket.description);
      formData.append('priority', newTicket.priority);
      formData.append('customer_company', newTicket.customer_company);
      formData.append('customer_name', newTicket.customer_name);
      formData.append('customer_phone', newTicket.customer_phone);
      formData.append('customer_email', newTicket.customer_email);
      formData.append('category', newTicket.category);
      formData.append('department', newTicket.department);
      formData.append('internal_notes', newTicket.internal_notes);
      formData.append('status', newTicket.status);

      // Handle related tickets
      if (newTicket.related_ticket && newTicket.related_ticket.length > 0) {
        newTicket.related_ticket.forEach((ticketId) => {
          formData.append('related_tickets', Number(ticketId));
        });
      }

      // Handle attachments
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('new_attachments', file);
        });
      }

      // Debug log
      console.log('Form Data Contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        `${baseNew}/tickets/`,
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (response.data) {
        // Reset form and states
        setNewTicket({
          title: '',
          description: '',
          priority: '',
          customer_company: '',
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          category: '',
          department: '',
          internal_notes: '',
          status: 'new',
          related_ticket: [],
        });
        setSelectedFiles([]);
        setUploadProgress(0);
        setShowCreateModal(false);
        alert('Ticket created successfully!');
        fetchUserTickets();
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    }
  };

  // Update file handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    
    // Debug log
    console.log('Files selected:', files);
  };

  // Add file removal function if not already present
  const handleFileRemove = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const filteredTickets = tickets.filter(ticket => {
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      ticket.ticket_id.toString().toLowerCase().includes(query) ||
      ticket.title.toLowerCase().includes(query);
      
    const matchesStatus = 
      filters.status === '' || ticket.status === filters.status;
      
    const matchesPriority = 
      filters.priority === '' || ticket.priority === filters.priority;
      
    const matchesDepartment = 
      filters.department === '' || ticket.department === filters.department;
      
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  // Update the handleViewTicket function
  const handleViewTicket = async (ticket) => {
    setShowViewModal(true);
    setIsViewLoading(true); // Set loading to true before fetching
    
    const token = localStorage.getItem('access');
    try {
      const response = await axios.get(`${baseNew}/tickets/${ticket.ticket_id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      alert('Failed to load ticket details. Please try again.');
    } finally {
      setIsViewLoading(false); // Set loading to false after fetching (success or error)
    }
  };

  // Add file upload handler
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    
    if (!selectedFiles.length) {
      alert('Please select files to upload');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('ticket_id', selectedTicket.ticket_id);

    try {
      await axios.post(
        `${baseNew}/tickets`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );
      
      // Refresh ticket details to show new attachments
      handleViewTicket(selectedTicket);
      setSelectedFiles([]);
      setUploadProgress(0);
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    }
  };

  // Add this function near your other state management functions
  const handleRelatedTicketChange = (e) => {
    const ticketId = parseInt(e.target.value);
    setNewTicket(prev => {
      const currentRelated = prev.related_ticket || [];
      if (e.target.checked) {
        return {
          ...prev,
          related_ticket: [...currentRelated, ticketId]
        };
      } else {
        return {
          ...prev,
          related_ticket: currentRelated.filter(id => id !== ticketId)
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
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
    <div className="dashboard-container">
      {/* Stats Section - Updated Layout */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaTicketAlt />
          </div>
          <div className="stat-details">
            <span className="stat-value">{tickets.length}</span>
            <span className="stat-label">{t('dashboard.stats.totalTickets')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon new">
            <FaExclamationCircle />
          </div>
          <div className="stat-details">
            <span className="stat-value">
              {tickets.filter(ticket => ticket.status.toLowerCase() === 'new').length}
            </span>
            <span className="stat-label">{t('dashboard.stats.newTickets')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
            <FaClock />
          </div>
          <div className="stat-details">
            <span className="stat-value">
              {tickets.filter(ticket => ticket.status.toLowerCase() === 'in_progress').length}
            </span>
            <span className="stat-label">{t('dashboard.stats.inProgress')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheckCircle />
          </div>
          <div className="stat-details">
            <span className="stat-value">
              {tickets.filter(ticket => ticket.status.toLowerCase() === 'completed').length}
            </span>
            <span className="stat-label">{t('dashboard.stats.completed')}</span>
          </div>
        </div>
      </div>


      {/* Controls Section - Updated Layout */}
      <div className="controls-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder={t('dashboard.tickets.search')}
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">{t('dashboard.tickets.filters.status')}</option>
            <option value="new">{t('dashboard.tickets.status.new')}</option>
            <option value="in_progress">{t('dashboard.tickets.status.in_progress')}</option>
            <option value="completed">{t('dashboard.tickets.status.completed')}</option>
          </select>
          
          <select 
            className="filter-select"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="">{t('dashboard.tickets.filters.priority')}</option>
            <option value="high">{t('dashboard.tickets.priority.high')}</option>
            <option value="medium">{t('dashboard.tickets.priority.medium')}</option>
            <option value="low">{t('dashboard.tickets.priority.low')}</option>
          </select>
          
          <select 
            className="filter-select"
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
          >
            <option value="">{t('dashboard.tickets.filters.department')}</option>
            <option value="sales">{t('dashboard.tickets.department.sales')}</option>
            <option value="sales_ue">{t('dashboard.tickets.department.sales_ue')}</option>
            <option value="sales_sth">{t('dashboard.tickets.department.sales_sth')}</option>
            <option value="service">{t('dashboard.tickets.department.service')}</option>
          </select>
        </div>

        <button 
          className="btn-create"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> {t('dashboard.buttons.create')}
        </button>
      </div>

      {/* Updated Table Layout */}
      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>{t('dashboard.tickets.table.id')}</th>
              <th>{t('dashboard.tickets.table.title')}</th>
              <th>{t('dashboard.tickets.table.status')}</th>
              <th>{t('dashboard.tickets.table.priority')}</th>
              <th>{t('dashboard.tickets.table.department')}</th>
              <th>{t('dashboard.tickets.table.created')}</th>
              <th>{t('dashboard.tickets.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.ticket_id}>
                <td>{ticket.ticket_id}</td>
                <td>{ticket.title}</td>
                <td>
                  <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{ticket.department}</td>
                <td>{formatDate(ticket.creation_date)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view" 
                      onClick={() => handleViewTicket(ticket)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t('dashboard.modal.createTicket')}</h2>
              <button className="close-button" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="create-ticket-form">
              <div className="modal-body">
                {/* Basic Information */}
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('dashboard.form.title')} *</label>
                      <input
                        type="text"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({...newTicket, title: capitalizeWords(e.target.value)})}
                        required
                        placeholder={t('dashboard.form.titlePlaceholder')}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('dashboard.form.description')} *</label>
                      <textarea
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        required
                        placeholder={t('dashboard.form.descriptionPlaceholder')}
                        className="form-control"
                        rows="4"
                      />
                    </div>
                  </div>

                  <div className="form-row two-columns">
                    <div className="form-group">
                      <label>{t('dashboard.form.priority')} *</label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                        required
                        className="form-control"
                      >
                        <option value="">{t('dashboard.form.priorityPlaceholder')}</option>
                        <option value="high">{t('dashboard.tickets.priority.high')}</option>
                        <option value="medium">{t('dashboard.tickets.priority.medium')}</option>
                        <option value="low">{t('dashboard.tickets.priority.low')}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{t('dashboard.form.category')} *</label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                        required
                        className="form-control"
                      >
                        <option value="">{t('dashboard.form.categoryPlaceholder')}</option>
                        <option value="technical">{t('dashboard.tickets.category.technical')}</option>
                        <option value="billing">{t('dashboard.tickets.category.billing')}</option>
                        <option value="feature_request">{t('dashboard.tickets.category.feature_request')}</option>
                        <option value="bug_report">{t('dashboard.tickets.category.bug_report')}</option>
                        <option value="support">{t('dashboard.tickets.category.support')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="form-section">
                  <div className="form-row two-columns">
                    <div className="form-group">
                      <label>{t('dashboard.form.customerCompany')} *</label>
                      <input
                        type="text"
                        value={newTicket.customer_company}
                        onChange={(e) => setNewTicket({...newTicket, customer_company: capitalizeWords(e.target.value)})}
                        required
                        placeholder={t('dashboard.form.customerCompanyPlaceholder')}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('dashboard.form.customerName')} *</label>
                      <input
                        type="text"
                        value={newTicket.customer_name}
                        onChange={(e) => setNewTicket({...newTicket, customer_name: capitalizeWords(e.target.value)})}
                        required
                        placeholder={t('dashboard.form.customerNamePlaceholder')}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row two-columns">
                    <div className="form-group">
                      <label>{t('dashboard.form.customerPhone')} *</label>
                      <input
                        type="tel"
                        value={newTicket.customer_phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 10) {
                            setNewTicket({...newTicket, customer_phone: value});
                          }
                        }}
                        required
                        placeholder={t('dashboard.form.customerPhonePlaceholder')}
                        pattern="\d{10}"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('dashboard.form.customerEmail')} *</label>
                      <input
                        type="email"
                        value={newTicket.customer_email}
                        onChange={(e) => setNewTicket({...newTicket, customer_email: e.target.value})}
                        required
                        placeholder={t('dashboard.form.customerEmailPlaceholder')}
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|io)$"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                {/* Department and Related Tickets */}
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('dashboard.form.department')} *</label>
                      <select
                        value={newTicket.department}
                        onChange={(e) => {
                          const selectedDepartment = e.target.value;
                          setNewTicket({...newTicket, department: selectedDepartment, related_ticket: []});
                          if (selectedDepartment) {
                            fetchRelatedTickets(selectedDepartment);
                          }
                        }}
                        required
                        className="form-control"
                      >
                        <option value="">{t('dashboard.form.departmentPlaceholder')}</option>
                        <option value="sales">{t('dashboard.tickets.department.sales')}</option>
                        <option value="sales_ue">{t('dashboard.tickets.department.sales_ue')}</option>
                        <option value="sales_sth">{t('dashboard.tickets.department.sales_sth')}</option>
                        <option value="service">{t('dashboard.tickets.department.service')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Related Tickets</label>
                      <div className="related-tickets-select">
                        {relatedTickets.length > 0 ? (
                          <div className="tickets-list">
                            {relatedTickets.map(ticket => (
                              <label key={ticket.ticket_id} className="ticket-checkbox">
                                <input
                                  type="checkbox"
                                  value={ticket.ticket_id}
                                  checked={newTicket.related_ticket?.includes(ticket.ticket_id)}
                                  onChange={handleRelatedTicketChange}
                                />
                                <span>#{ticket.ticket_id} - {ticket.title}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="no-tickets">No related tickets found</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('dashboard.form.internalNotes')}</label>
                      <textarea
                        value={newTicket.internal_notes}
                        onChange={(e) => setNewTicket({...newTicket, internal_notes: e.target.value})}
                        placeholder={t('dashboard.form.internalNotesPlaceholder')}
                        className="form-control"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('dashboard.form.attachments')}</label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="file-input"
                          id="file-input"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        <label htmlFor="file-input" className="file-label">
                          <FaUpload className="upload-icon" />
                          {t('dashboard.form.chooseFiles')}
                        </label>
                        
                        {selectedFiles.length > 0 && (
                          <div className="selected-files">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="file-item">
                                <FaFile className="file-icon" />
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                                <button
                                  type="button"
                                  onClick={() => handleFileRemove(index)}
                                  className="remove-file"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  {t('dashboard.buttons.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {t('dashboard.buttons.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {isViewLoading ? (
              <div className="modal-loader">
                <div className="loader-spinner"></div>
                <p>{t('dashboard.loading')}</p>
              </div>
            ) : (
              <div>
                <div className="modal-header">
                  <h2>{t('dashboard.modal.ticketDetails.title')}</h2>
                  <button className="close-button" onClick={() => setShowViewModal(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="ticket-details">
                    <div className="ticket-detail">
                      <label>{t('dashboard.modal.ticketDetails.ticketId')}:</label>
                      <span>{selectedTicket.ticket_id}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Title:</label>
                      <span>{selectedTicket.title}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Description:</label>
                      <p>{selectedTicket.description}</p>
                    </div>
                    <div className="ticket-detail">
                      <label>Status:</label>
                      <span className={`status-badge ${selectedTicket.status.toLowerCase()}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <div className="ticket-detail">
                      <label>Priority:</label>
                      <span className={`priority-badge ${selectedTicket.priority.toLowerCase()}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div className="ticket-detail">
                      <label>Category:</label>
                      <span>{selectedTicket.category}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Department:</label>
                      <span>{selectedTicket.department}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Assigned To:</label>
                      <span>{selectedTicket.assigned_to || 'Unassigned'}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Created:</label>
                      <span>{formatDate(selectedTicket.creation_date)}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Solution:</label>
                      <span>{selectedTicket.solution || 'No solution provided'}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Feedback:</label>
                      <span>{selectedTicket.feedback || 'No feedback provided'}</span>
                    </div>
                    <div className="ticket-detail">
                      <label>Related Tickets:</label>
                      <span>{selectedTicket.related_tickets.length > 0 ? selectedTicket.related_tickets.join(', ') : 'None'}</span>
                    </div>

                    {/* Activity Log Section */}
                    <div className="activity-log-section">
                      <h3>{t('dashboard.tickets.activityLog.title')}</h3>
                      <div className="activity-log">
                        {selectedTicket.activity_log && selectedTicket.activity_log.length > 0 ? (
                          selectedTicket.activity_log.map((activity, index) => (
                            <div key={index} className="activity-item">
                              <div className="activity-header">
                                <span className="activity-user">{activity.changed_by}</span>
                                <span className="activity-date">{formatDate(activity.timestamp)}</span>
                              </div>
                              <div className="activity-content">
                                <p><strong>{t('dashboard.tickets.activityLog.action')}:</strong> {activity.action}</p>
                                <p><strong>{t('dashboard.tickets.activityLog.updatedValue')}:</strong> {activity.updated_value}</p>
                                {activity.previous_value && (
                                  <p><strong>{t('dashboard.tickets.activityLog.previousValue')}:</strong> {activity.previous_value}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-activity">{t('dashboard.tickets.activityLog.noActivity')}</p>
                        )}
                      </div>
                    </div>

                    {/* Add this after the internal notes section in your view modal */}
                    <div className="attachments-section">
                      <h3>{t('dashboard.tickets.attachments.title')}</h3>
                      <div className="attachments-list">
                        {selectedTicket.attachments && selectedTicket.attachments.length > 0 ? (
                          selectedTicket.attachments.map((attachment, index) => (
                            <div key={index} className="attachment-item">
                              <div className="attachment-info">
                                <FaFile className="file-icon" />
                                <span className="file-name">{attachment.filename}</span>
                                <span className="file-size">
                                  {(attachment.size / 1024).toFixed(2)} {t('dashboard.tickets.attachments.size')}
                                </span>
                              </div>
                              <div className="attachment-actions">
                                <a
                                  href={attachment.url} 
                                  download
                                  className="btn-download"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FaDownload /> {t('dashboard.buttons.download')}
                                </a>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-attachments">{t('dashboard.tickets.attachments.noAttachments')}</p>
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
    </div>
  );
};

export default UserDashboard;
