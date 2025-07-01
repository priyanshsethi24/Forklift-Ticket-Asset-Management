import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCog, FaExclamationCircle, FaClock, FaCheckCircle, FaTimes, FaUserPlus, FaFile, FaDownload } from 'react-icons/fa';
import './CustomerManagerDashboard.css';
import { DashboardLoader } from '../../../../components/Loader';
import { API_END_POINTS } from '../../../../network/apiEndPoint';
import HeroSection from "../../../../components/HeroSection/HeroSection.js";

const CustomerManagerDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [assetManagers, setAssetManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [showCreateAssetModal, setShowCreateAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
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
  const [currentManager, setCurrentManager] = useState(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isAssignLoading, setIsAssignLoading] = useState(false);

  const fetchManagerDetails = async () => {
    const token = localStorage.getItem('access');
    try {
      const response = await axios.get(`${baseURL}/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentManager(response.data);
    } catch (error) {
      console.error('Error fetching manager details:', error);
    }
  };

  useEffect(() => {
    fetchManagerDetails();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access');
    
    if (!token) {
      console.error('No access token found');
      setError('Authentication required');
      setLoading(false);
      return;
    }
  
    axios.get(API_END_POINTS.assets, {   
       headers: { Authorization: `Bearer ${token}` }  
     })
    .then(response => { 
      setAssets(response.data); 
      setLoading(false);  
    })
    .catch(err => { 
      if(err.error === 'No assets found'){
        console.error('Error fetching assets:', err.response ? err.response.data : err.message); 
        setError('Failed to fetch assets'); 
      }
      setLoading(false);  //if error msg 404 , asset not found => show pop up
    });  
  },[]);

  
  const handleViewAsset = async (asset) => {
    setShowViewModal(true);
    setIsViewLoading(true);
    
    const token = localStorage.getItem('access');
    try {
      const response = await axios.get(`${baseNew}/assets/${asset.asset_id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAsset(response.data);
    } catch (error) {
      console.error('Error fetching asset details:', error);
      alert('Failed to load asset details. Please try again.');
    } finally {
      setIsViewLoading(false);
    }
  };
  const handleAssignAsset = async (asset) => {
    setSelectedAsset(asset);
    setShowAssignModal(true);
    setIsAssignLoading(true);
    
    const token = localStorage.getItem('access');
    try {
      const response = await axios.get(`${baseNew}/asset-managers/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssetManagers(response.data);
    } catch (error) {
      console.error('Error fetching asset managers:', error);
      alert('Failed to fetch asset managers');
    } finally {
      setIsAssignLoading(false);
    }
  };
  const handleAssignToManager = async (managerId) => {
    const token = localStorage.getItem('access');
    try {
      const response = await axios.put(
        `${baseNew}/aasets/${selectedAsset.asset_id}/`,
        { assigned_to: managerId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Update the assets list with the newly assigned asset
      setAssets(prevAssets => prevAssets.map(asset => 
        asset.asset_id === selectedAsset.asset_id 
          ? { ...asset, assigned_to: managerId }
          : asset
      ));
      
      setShowAssignModal(false);
      alert('Asset assigned successfully!');
    } catch (error) {
      console.error('Error assigning asset:', error);
      alert('Failed to assign asset. Please try again.');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      asset.asset_id.toString().toLowerCase().includes(query) ||
      asset.title.toLowerCase().includes(query);
      
    const matchesStatus = 
      filters.status === '' || asset.status === filters.status;
      
    const matchesPriority = 
      filters.priority === '' || asset.priority === filters.priority;
      
    const matchesCategory = 
      filters.category === '' || asset.category === filters.category;
      
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Add stats calculation
  const stats = {
    total: assets.length,
    new: assets.filter(t => t.status.toLowerCase() === 'new').length,
    inProgress: assets.filter(t => t.status.toLowerCase() === 'in_progress').length,
    completed: assets.filter(t => t.status.toLowerCase() === 'completed').length
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    
    try {
      const response = await axios.post(
        `${baseNew}/user-management/`,
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: 'user'
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.message === "User created successfully!") {
        setShowCreateUserModal(false);
        alert('User created successfully!');
        // Reset form
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'user'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    
    try {
      const response = await axios.post(
        `${baseNew}/assets/`,
        {
          ...newAsset,
          status: 'new'
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setAssets(prevAssets => [...prevAssets, response.data]);
      setShowCreateAssetModal(false);
      setNewAsset({
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
      alert('Asset created successfully!');
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to create asset. Please check all required fields.');
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|io)$/i;
    return emailRegex.test(email);
  };

  if (loading) {
    return <DashboardLoader message="Loading Customer Manager Dashboard..." />;
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
      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
           
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Assetsm</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon new">
            <FaExclamationCircle />
          </div>
          <div className="stat-details">
            <span className="stat-value">{stats.new}</span>
            <span className="stat-label">New Assets</span>
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
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by Asset ID or Title..." 
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
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
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
            <option value="middle">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-create btn-create-user"
            onClick={() => setShowCreateUserModal(true)}
          >
            <FaUserPlus /> Create User
          </button>
          <button 
            className="btn-create"
            onClick={() => setShowCreateAssetModal(true)}
          >
            
             Create Asset
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="assets-table-container">
        <table className="assets-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Customer</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.asset_id}>
                <td>{asset.asset_id}</td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{asset.customer_name}</div>
                    <div className="customer-company">{asset.customer_company}</div>
                  </div>
                </td>
                <td>{asset.title}</td>
                <td>
                  <span className={`status-badge ${asset.status.toLowerCase()}`}>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${asset.priority.toLowerCase()}`}>
                    {asset.priority}
                  </span>
                </td>
                <td>{asset.category}</td>
                <td>{asset.assigned_to || 'Unassigned'}</td>
                <td>{asset.creation_date}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewAsset(asset)}
                    >
                      View
                    </button>
                    <button 
                      className="btn-assign"
                      onClick={() => handleAssignAsset(asset)}
                    >
                      Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Asset Modal */}
      {showViewModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {isViewLoading ? (
              <div className="modal-loader">
                <div className="loader-spinner"></div>
                <p>Loading asset details...</p>
              </div>
            ) : (
              <div>
                <div className="modal-header">
                  <h2>Asset Details</h2>
                  <button 
                    className="close-button"
                    onClick={() => setShowViewModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="asset-detail">
                    <label>Asset ID:</label>
                    <span>{selectedAsset.Asset_id}</span>
                  </div>
                  <div className="asset-detail">
                    <label>Title:</label>
                    <span>{selectedAsset.title}</span>
                  </div>
                  <div className="asset-detail">
                    <label>Description:</label>
                    <p>{selectedAsset.description}</p>
                  </div>
                  <div className="asset-detail">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedAsset.status.toLowerCase()}`}>
                      {selectedAsset.status}
                    </span>
                  </div>
                  <div className="asset-detail">
                    <label>Priority:</label>
                    <span className={`priority-badge ${selectedAsset.priority.toLowerCase()}`}>
                      {selectedAsset.priority}
                    </span>
                  </div>
                  <div className="asset-detail">
                    <label>Customer:</label>
                    <span>{selectedAsset.customer_name} ({selectedAsset.customer_company})</span>
                  </div>
                  <div className="asset-detail">
                    <label>Assigned To:</label>
                    <span>{selectedAsset.assigned_to || 'Unassigned'}</span>
                  </div>
                  <div className="asset-detail">
                    <label>Created:</label>
                    <span>{selectedAsset.creation_date}</span>
                  </div>

                  {/* Activity Log Section */}
                  <div className="activity-log-section">
                    <h3>Activity Log</h3>
                    <div className="activity-log">
                      {selectedAsset.activity_log && selectedAsset.activity_log.length > 0 ? (
                        selectedAsset.activity_log.map((activity, index) => (
                          <div key={index} className="activity-item">
                            <div className="activity-header">
                              <span className="activity-user">{activity.changed_by}</span>
                              <span className="activity-date">{new Date(activity.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="activity-content">
                              <p><strong>Action:</strong> {activity.action}</p>
                              <p><strong>Updated Value:</strong> {activity.updated_value}</p>
                              {activity.previous_value && (
                                <p><strong>Previous Value:</strong> {activity.previous_value}</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-activity">No activity recorded yet</p>
                      )}
                    </div>
                  </div>

                  {/* Add Attachments Section */}
                  <div className="attachments-section">
                    <h3>Attachments</h3>
                    <div className="attachments-list">
                      {selectedAsset.attachments && selectedAsset.attachments.length > 0 ? (
                        selectedAsset.attachments.map((attachment, index) => (
                          <div key={index} className="attachment-item">
                            <div className="attachment-info">
                              <FaFile className="file-icon" />
                              <span className="file-name">{attachment.filename}</span>
                              <span className="file-size">
                                {(attachment.size / 1024).toFixed(2)} KB
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
                                <FaDownload /> Download
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-attachments">No attachments available for this Asset</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {showAssignModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {isAssignLoading ? (
              <div className="modal-loader">
                <div className="loader-spinner"></div>
                <p>Loading asset managers...</p>
              </div>
            ) : (
              <div>
                <div className="modal-header">
                  <h2>Assign Asset</h2>
                  <button 
                    className="close-button"
                    onClick={() => setShowAssignModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <h3>Select Asset Manager</h3>
                  <div className="managers-list">
                    {assetManagers.length > 0 ? (
                      assetManagers.map((manager) => (
                        <div key={manager.id} className="manager-item">
                          <div className="manager-info">
                            <FaUserCog className="manager-icon" />
                            <div className="manager-details">
                              <span className="manager-name">{manager.name}</span>
                              <span className="manager-email">{manager.email}</span>
                            </div>
                          </div>
                          <button
                            className="btn-assign"
                            onClick={() => handleAssignToManager(manager.id)}
                          >
                            Assign
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-managers">No asset managers available</p>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New User</h2>
              <button 
                className="close-button"
                onClick={() => setShowCreateUserModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    placeholder="Enter password"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateUserModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Asset Modal */}
      {showCreateAssetModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Asset</h2>
              <button onClick={() => setShowCreateAssetModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateAsset}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={newAsset.title}
                    onChange={(e) => setNewAsset({...newAsset, title: e.target.value})}
                    required
                    placeholder="Enter Asset title"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={newAsset.description}
                    onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                    required
                    placeholder="Enter Asset description"
                  />
                </div>

                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={newAsset.customer_name}
                    onChange={(e) => setNewAsset({...newAsset, customer_name: e.target.value})}
                    required
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="form-group">
                  <label>Customer Company *</label>
                  <input
                    type="text"
                    value={newAsset.customer_company}
                    onChange={(e) => setNewAsset({...newAsset, customer_company: e.target.value})}
                    required
                    placeholder="Enter customer company"
                  />
                </div>

                <div className="form-group">
                  <label>Customer Phone * (10 digits)</label>
                  <input
                    type="tel"
                    value={newAsset.customer_phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewAsset({...newAsset, customer_phone: value});
                    }}
                    required
                    placeholder="Enter 10-digit phone number"
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                  />
                  {newAsset.customer_phone && !validatePhone(newAsset.customer_phone) && (
                    <small className="error-text">Please enter exactly 10 digits</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Customer Email * (.com, .in, or .io)</label>
                  <input
                    type="email"
                    value={newAsset.customer_email}
                    onChange={(e) => setNewAsset({...newAsset, customer_email: e.target.value})}
                    required
                    placeholder="Enter email address"
                    onBlur={(e) => {
                      if (!validateEmail(e.target.value) && e.target.value) {
                        alert('Please enter a valid email address ending with .com, .in, or .io');
                      }
                    }}
                  />
                  {newAsset.customer_email && !validateEmail(newAsset.customer_email) && (
                    <small className="error-text">Please enter a valid email ending with .com, .in, or .io</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={newAsset.department}
                    onChange={(e) => setNewAsset({...newAsset, department: e.target.value})}
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
                    value={newAsset.priority}
                    onChange={(e) => setNewAsset({...newAsset, priority: e.target.value})}
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
                <button type="button" onClick={() => setShowCreateAssetModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={
                    !validatePhone(newAsset.customer_phone) || 
                    !validateEmail(newAsset.customer_email) ||
                    !newAsset.customer_name ||
                    !newAsset.title ||
                    !newAsset.description ||
                    !newAsset.customer_company ||
                    !newAsset.department ||
                    !newAsset.priority
                  }
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagerDashboard;
