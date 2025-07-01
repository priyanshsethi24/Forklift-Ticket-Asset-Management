import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaUsers, FaUserTie, FaUserCog, FaUser, FaEdit, FaTrash, FaTicketAlt, FaTimes, FaPlus } from 'react-icons/fa';
import './AdminDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLoader } from '../../../../components/Loader';
import { useTranslation } from 'react-i18next';
import { baseURL } from '../../../../network/baseUrl';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isUsersView = location.pathname.includes('/users');
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: ''
  });
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [userFilters, setUserFilters] = useState({
    role: '',
    status: ''
  });
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    status: 'new',
    priority: '',
    department: '',
    description: '',
    customer_name: '',
    customer_company: '',
    customer_phone: '',
    customer_email: ''
  });

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh');
    
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: refresh
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('access', newAccessToken);
      return newAccessToken;
    } catch (error) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      throw new Error('Failed to refresh token');
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('access');
    
    try {
      const [ticketsResponse, usersResponse] = await Promise.all([
        axios.get(`${baseURL}/tickets/`, {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        }),
        axios.get(`${baseURL}/user-management/`, {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        })
      ]);

      setTickets(ticketsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleEditTicket = (ticketId) => {
    const ticketToEdit = tickets.find(ticket => ticket.ticket_id === ticketId);
    if (ticketToEdit) {
      setCurrentTicket(ticketToEdit);
      setShowEditModal(true);
    }
  };

  const handleDeleteTicket = (ticketId) => {
    const updatedTickets = tickets.filter(ticket => ticket.ticket_id !== ticketId);
    setTickets(updatedTickets);
    alert('Ticket deleted successfully!');
  };

  const handleSaveEdit = () => {
    setTickets(prevTickets => prevTickets.map(ticket => 
      ticket.ticket_id === currentTicket.ticket_id ? currentTicket : ticket
    ));
    setShowEditModal(false);
    alert('Ticket updated successfully!');
  };

  const filteredData = () => {
    const query = searchQuery.toLowerCase();
    
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.ticket_id.toString().toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query);
        
      const matchesStatus = 
        filters.status === '' || ticket.status.toLowerCase() === filters.status.toLowerCase();
        
      const matchesPriority = 
        filters.priority === '' || ticket.priority.toLowerCase() === filters.priority.toLowerCase();
        
      const matchesDepartment = 
        filters.department === '' || ticket.department === filters.department;
        
      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    
    try {
      let token = localStorage.getItem('access');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const managerData = {
        name: newManager.name,
        email: newManager.email,
        password: newManager.password,
        role: newManager.role
      };

      try {
        const response = await axios.post(
          `${baseURL}/user-management/`,
          managerData,
          config
        );
        
        if (response.data.message === "User created successfully!") {
          setShowCreateModal(false);
          setNewManager({
            name: '',
            email: '',
            password: '',
            role: ''
          });
          alert(`Manager created successfully!\nName: ${response.data.user.name}\nRole: ${response.data.user.role}`);
          
          setUsers(prevUsers => [...prevUsers, response.data.user]);
        }
      } catch (error) {
        if (error.response?.data?.code === 'token_not_valid') {
          try {
            token = await refreshToken();
            config.headers.Authorization = `Bearer ${token}`;
            const retryResponse = await axios.post(
              `${baseURL}/user-management/`,
              managerData,
              config
            );
            
            if (retryResponse.data.message === "User created successfully!") {
              setShowCreateModal(false);
              setNewManager({
                name: '',
                email: '',
                password: '',
                role: ''
              });
              alert(`Manager created successfully!\nName: ${retryResponse.data.user.name}\nRole: ${retryResponse.data.user.role}`);
              
              setUsers(prevUsers => [...prevUsers, retryResponse.data.user]);
            }
          } catch (refreshError) {
            alert('Session expired. Please login again.');
            navigate('/login');
          }
        } else {
          alert(error.response?.data?.message || 'Failed to create manager. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const getTicketStats = () => {
    if (!tickets || tickets.length === 0) {
      return {
        total: 0,
        new: 0,
        inProgress: 0,
        completed: 0
      };
    }

    return {
      total: tickets.length,
      new: tickets.filter(ticket => ticket.status === 'new').length,
      inProgress: tickets.filter(ticket => ticket.status === 'in_progress').length,
      completed: tickets.filter(ticket => ticket.status === 'completed').length
    };
  };

  const handleEditUser = async (userId) => {
    const userToEdit = users.find(user => user.id === userId);
    if (userToEdit) {
      setCurrentUser(userToEdit);
      setShowEditModal(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('access');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.delete(`${baseURL}/users/${userId}/`, config);
      
      // Update the users list by removing the deleted user
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const filteredUsers = () => {
    const query = searchQuery.toLowerCase();
    
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().replace('_', ' ').includes(query);
        
      const matchesRole = 
        userFilters.role === '' || user.role === userFilters.role;
        
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
        salesManagers: 0
      };
    }

    return {
      total: users.length,
      users: users.filter(user => user.role === 'user').length,
      ticketManagers: users.filter(user => user.role === 'ticket_manager').length,
      customerManagers: users.filter(user => user.role === 'customer_manager').length,
      salesManagers: users.filter(user => user.role === 'sales_manager').length
    };
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
    
    // Validate phone number
    if (!validatePhone(newTicket.customer_phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate email
    if (!validateEmail(newTicket.customer_email)) {
      alert('Please enter a valid email address ending with .com, .in, or .io');
      return;
    }

    const token = localStorage.getItem('access');
    const adminName = localStorage.getItem('userName');

    try {
      const response = await axios.post(
        `${baseURL}/tickets/`,
        {
          ...newTicket,
          customer_name: adminName || newTicket.customer_name,
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
      setShowCreateModal(false);
      
      // Reset form
      setNewTicket({
        title: '',
        status: 'new',
        priority: '',
        department: '',
        description: '',
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

  if (loading) {
    return <DashboardLoader message="Loading Admin Dashboard..." />;
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

  return (
    <div className="admin-dashboard">
      {/* Stats Section with wrapper */}
      <div className="stats-wrapper">
        <div className="stats-grid">
          {isUsersView ? (
            <>
              <div className="stat-card">
                <div className="stat-icon total">
                  <FaUsers />
                </div>
                <div className="stat-details">
                  <span className="stat-value">{users.length}</span>
                  <span className="stat-label">Total Users</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon regular-user">
                  <FaUser />
                </div>
                <div className="stat-details">
                  <span className="stat-value">
                    {users.filter(user => user.role === 'user').length}
                  </span>
                  <span className="stat-label">Regular Users</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon ticket-manager">
                  <FaUserTie />
                </div>
                <div className="stat-details">
                  <span className="stat-value">
                    {users.filter(user => user.role === 'ticket_manager').length}
                  </span>
                  <span className="stat-label">Ticket Managers</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon sales-manager">
                  <FaUserCog />
                </div>
                <div className="stat-details">
                  <span className="stat-value">
                    {users.filter(user => user.role === 'sales_manager').length}
                  </span>
                  <span className="stat-label">Sales Managers</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon customer-manager">
                  <FaUserCog />
                </div>
                <div className="stat-details">
                  <span className="stat-value">
                    {users.filter(user => user.role === 'customer_manager').length}
                  </span>
                  <span className="stat-label">Customer Managers</span>
                </div>
              </div>
            </>
          ) : (
            <>
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
                  <FaTicketAlt />
                </div>
                <div className="stat-details">
                  <span className="stat-value">
                    {tickets.filter(ticket => ticket.status === 'new').length}
                  </span>
                  <span className="stat-label">{t('dashboard.tickets.status.new')}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon pending">
                  <FaTicketAlt />
                </div>
                <div className="stat-details">
                  <span className="stat-value">
                    {tickets.filter(ticket => ticket.status === 'in_progress').length}
                  </span>
                  <span className="stat-label">{t('dashboard.tickets.status.in_progress')}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon completed">
                  <FaTicketAlt />
                </div>
                <div className="stat-details">
                  <span className="stat-value">
                    {tickets.filter(ticket => ticket.status === 'completed').length}
                  </span>
                  <span className="stat-label">{t('dashboard.tickets.status.completed')}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls Section */}
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

        {!isUsersView && (
          <div className="filters">
            <select 
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">{t('dashboard.tickets.filters.status')}</option>
              <option value="new">{t('dashboard.tickets.status.new')}</option>
              <option value="in_progress">{t('dashboard.tickets.status.in_progress')}</option>
              <option value="waiting_customer">{t('dashboard.tickets.status.waiting_customer')}</option>
              <option value="completed">{t('dashboard.tickets.status.completed')}</option>
              <option value="on_hold">{t('dashboard.tickets.status.on_hold')}</option>
              <option value="resolved">{t('dashboard.tickets.status.resolved')}</option>
              <option value="rejected">{t('dashboard.tickets.status.rejected')}</option>
              <option value="reopened">{t('dashboard.tickets.status.reopened')}</option>
              <option value="escalated">{t('dashboard.tickets.status.escalated')}</option>
            </select>

            <select 
              className="filter-select"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="middle">Medium</option>
              <option value="low">Low</option>
            </select>

            <select 
              className="filter-select"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">All Departments</option>
              <option value="sales">Sales</option>
              <option value="sales_ue">Sales UE</option>
              <option value="sales_sth">Sales STH</option>
              <option value="service">Service</option>
            </select>
          </div>
        )}

        <button 
          className="btn btn-primary create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> {isUsersView ? t('dashboard.buttons.createManager') : t('dashboard.buttons.create')}
        </button>
      </div>

      {/* Content Table */}
      {isUsersView ? (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers().map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon edit" onClick={() => handleEditUser(user.id)}>
                        <FaEdit />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDeleteUser(user.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tickets-table-container table-container">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData().map((ticket) => (
                <tr key={ticket.ticket_id}>
                  <td>{ticket.ticket_id}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.customer_name} ({ticket.customer_company})</td>
                  <td>
                    <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{ticket.assigned_to || 'Unassigned'}</td>
                  <td>{ticket.creation_date}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon edit" onClick={() => handleEditTicket(ticket.ticket_id)}>
                        <FaEdit />
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDeleteTicket(ticket.ticket_id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && currentTicket && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Edit Ticket</h5>
              <button 
                className="btn-close" 
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={currentTicket.title}
                    onChange={(e) => setCurrentTicket({...currentTicket, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={currentTicket.status}
                    onChange={(e) => setCurrentTicket({...currentTicket, status: e.target.value})}
                    required
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="waiting_customer">Waiting on Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                    <option value="reopened">Reopened</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={currentTicket.priority}
                    onChange={(e) => setCurrentTicket({...currentTicket, priority: e.target.value})}
                    required
                  >
                    <option value="high">High</option>
                    <option value="middle">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                {/* Add more fields as necessary */}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Manager Modal */}
      {isUsersView && showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create  Manager</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateManager}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newManager.name}
                    onChange={(e) => setNewManager({...newManager, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newManager.email}
                    onChange={(e) => setNewManager({...newManager, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newManager.password}
                    onChange={(e) => setNewManager({...newManager, password: e.target.value})}
                    required
                    minLength="8"
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={newManager.role}
                    onChange={(e) => setNewManager({...newManager, role: e.target.value})}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="ticket_manager">Ticket Manager</option>
                    <option value="customer_manager">Customer Manager</option>
                    <option value="sales_manager">Sales Manager</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create Manager</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {!isUsersView && showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Ticket</h2>
              <button onClick={() => setShowCreateModal(false)}>
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
                    rows="4"
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
                <button type="button" onClick={() => setShowCreateModal(false)}>
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

export default AdminDashboard;