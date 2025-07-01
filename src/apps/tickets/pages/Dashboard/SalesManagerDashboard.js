import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaUserCog, FaExclamationCircle, FaClock, FaCheckCircle, FaTimes, FaEdit, FaTrash, FaArchive, FaSpinner, FaPlus } from 'react-icons/fa';
import './SalesManagerDashboard.css';
import { baseNew } from '../../../../network/baseUrl';

const SalesManagerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0
  });
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    department: '',
    description: '',
    status: 'new',
    priority: '',
    customer_name: '',
    customer_company: '',
    customer_phone: '',
    customer_email: ''
  });

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('access');
      
      if (!token) {
        console.error('No access token found');
        setError('Authentication required');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${baseNew}/tickets/`, { 
          headers: { Authorization: `Bearer ${token}` }  
        });
        setTickets(response.data);
      } catch (err) {
        console.error('Error fetching tickets:', err.response ? err.response.data : err.message); 
        setError('Failed to fetch tickets'); 
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    const newStats = {
      total: tickets.length,
      new: tickets.filter(t => t.status.toLowerCase() === 'new').length,
      inProgress: tickets.filter(t => t.status.toLowerCase() === 'in_progress').length,
      resolved: tickets.filter(t => t.status.toLowerCase() === 'resolved').length
    };
    if (JSON.stringify(stats) !== JSON.stringify(newStats)) {
      setStats(newStats);
    }
  }, [tickets]);

  const handleUpdateTicket = async (ticketId, updatedData) => {
    const token = localStorage.getItem('access');
    try {
      const response = await axios.put(
        `${baseNew}/tickets/${ticketId}/`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setTickets(prevTickets => prevTickets.map(ticket => 
        ticket.ticket_id === ticketId ? response.data : ticket
      ));
      
      setShowEditModal(false);
      alert('Ticket updated successfully!');
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket. Please try again.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    const token = localStorage.getItem('access');
    try {
      await axios.delete(`${baseNew}/tickets/${ticketId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.ticket_id !== ticketId));
      alert('Ticket deleted successfully!');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Failed to delete ticket. Please try again.');
    }
  };

  const filteredData = tickets.filter(ticket => {
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      ticket.ticket_id.toString().toLowerCase().includes(query) ||
      ticket.title.toLowerCase().includes(query);
      
    const matchesStatus = 
      filters.status === '' || ticket.status === filters.status;
      
    const matchesPriority = 
      filters.priority === '' || ticket.priority === filters.priority;
      
    const matchesCategory = 
      filters.category === '' || ticket.category === filters.category;
      
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|io)$/i;
    return emailRegex.test(email);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');

    try {
      const response = await axios.post(
        `${baseNew}/tickets/`,
        {
          ...newTicket,
          status: 'new'
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTickets(prevTickets => [...prevTickets, response.data]);
      setShowCreateTicketModal(false);
      setNewTicket({
        title: '',
        department: '',
        description: '',
        status: 'new',
        priority: '',
        customer_name: '',
        customer_company: '',
        customer_phone: '',
        customer_email: ''
      });
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please check all required fields.');
    }
  };

  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="modern-loader"></div>
          <div className="loader-text">Loading Tickets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUserCog />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon new">
            <FaExclamationCircle />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.new}</span>
            <span className="stat-label">New Tickets</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
            <FaClock />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheckCircle />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by Ticket ID or Title..." 
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
            <option value="">Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_customer">Waiting on Customer</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
            <option value="reopened">Reopened</option>
            <option value="escalated">Escalated</option>
          </select>
          <select 
            className="filter-select"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="">Priority</option>
            <option value="high">High</option>
            <option value="middle">Middle</option>
            <option value="low">Low</option>
          </select>
          <select 
            className="filter-select"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">Category</option>
            <option value="Sales">Sales</option>
            <option value="Support">Support</option>
            <option value="Information">Information</option>
          </select>
        </div>
        <button onClick={() => setShowCreateTicketModal(true)} className="create-ticket-button">
          <FaPlus /> Create Ticket
        </button>
      </div>

      {/* Tickets Table */}
      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th> ID</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((ticket) => (
              <tr key={ticket.ticket_id}>
                <td>{ticket.ticket_id}</td>
                <td>{ticket.title}</td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{ticket.customer_name}</div>
                    <div className="customer-company">{ticket.customer_company}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{ticket.category}</td>
                <td>{ticket.creation_date}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view" 
                      onClick={() => handleViewTicket(ticket)}
                    >
                      View
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteTicket(ticket.ticket_id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedTicket && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Ticket</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTicket(selectedTicket.ticket_id, selectedTicket);
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={selectedTicket.status.toLowerCase()}
                    onChange={(e) => {
                      setSelectedTicket(prev => ({
                        ...prev,
                        status: e.target.value
                      }));
                    }}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_customer">Waiting on Customer</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="rejected">Rejected</option>
                    <option value="resolved">Resolved</option>
                    <option value="reopened">Reopened</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={selectedTicket.internal_notes || ''}
                    onChange={(e) => setSelectedTicket({
                      ...selectedTicket,
                      internal_notes: e.target.value
                    })}
                    rows="4"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
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
              <h2>Ticket Details</h2>
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
                  <label>Ticket ID:</label>
                  <span>{selectedTicket.ticket_id}</span>
                </div>
                <div className="detail-row">
                  <label>Title:</label>
                  <span>{selectedTicket.title}</span>
                </div>
                <div className="detail-row">
                  <label>Description:</label>
                  <p>{selectedTicket.description}</p>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedTicket.status.toLowerCase()}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Priority:</label>
                  <span className={`priority-badge ${selectedTicket.priority.toLowerCase()}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Customer:</label>
                  <span>{selectedTicket.customer_name} ({selectedTicket.customer_company})</span>
                </div>
                <div className="detail-row">
                  <label>Category:</label>
                  <span>{selectedTicket.category}</span>
                </div>
                <div className="detail-row">
                  <label>Created:</label>
                  <span>{selectedTicket.creation_date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Ticket</h2>
              <button onClick={() => setShowCreateTicketModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    required
                    placeholder="Enter ticket title"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    required
                    placeholder="Enter ticket description"
                  />
                </div>

                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={newTicket.customer_name}
                    onChange={(e) => setNewTicket({...newTicket, customer_name: e.target.value})}
                    required
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="form-group">
                  <label>Customer Company *</label>
                  <input
                    type="text"
                    value={newTicket.customer_company}
                    onChange={(e) => setNewTicket({...newTicket, customer_company: e.target.value})}
                    required
                    placeholder="Enter customer company"
                  />
                </div>

                <div className="form-group">
                  <label>Customer Phone * (10 digits)</label>
                  <input
                    type="tel"
                    value={newTicket.customer_phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewTicket({...newTicket, customer_phone: value});
                    }}
                    required
                    placeholder="Enter 10-digit phone number"
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                  />
                  {newTicket.customer_phone && !validatePhone(newTicket.customer_phone) && (
                    <small className="error-text">Please enter exactly 10 digits</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Customer Email * (.com, .in, or .io)</label>
                  <input
                    type="email"
                    value={newTicket.customer_email}
                    onChange={(e) => setNewTicket({...newTicket, customer_email: e.target.value})}
                    required
                    placeholder="Enter email address"
                    onBlur={(e) => {
                      if (!validateEmail(e.target.value) && e.target.value) {
                        alert('Please enter a valid email address ending with .com, .in, or .io');
                      }
                    }}
                  />
                  {newTicket.customer_email && !validateEmail(newTicket.customer_email) && (
                    <small className="error-text">Please enter a valid email ending with .com, .in, or .io</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={newTicket.department}
                    onChange={(e) => setNewTicket({...newTicket, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="sales">Sales</option>
                    <option value="sales_ue">Sales UE</option>
                    <option value="sales_sth">Sales STH</option>
                    <option value="service">Service</option>
                    <option value="it">IT</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority *</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="high">High</option>
                    <option value="middle">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateTicketModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={
                    !validatePhone(newTicket.customer_phone) || 
                    !validateEmail(newTicket.customer_email) ||
                    !newTicket.customer_name ||
                    !newTicket.title ||
                    !newTicket.description ||
                    !newTicket.customer_company ||
                    !newTicket.department ||
                    !newTicket.priority
                  }
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagerDashboard; 