import React, { useState, useMemo } from 'react';

import '../styles/ManageAccounts.css';
import { Users, Shield, UserPlus, Edit3, Trash2, Eye, MoreVertical, Ban, CheckCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import OrderTable from '../components/OrderTable';
import UserAdminFormModal from '../components/UserAdminFormModal';
import UserViewModal from '../components/UserViewModal';
import ConfirmActionModal from '../components/ConfirmActionModal';
import { mockAdmins, mockUsers } from '../constants/data';

const ManageAccounts = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: activeTab === 'users' ? 'Customer' : 'Manager',
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter data based on search and status
  const filteredUsers = useMemo(() => {
    let filtered = mockUsers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus && filterStatus !== 'All Status') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    return filtered;
  }, [searchTerm, filterStatus]);

  const filteredAdmins = useMemo(() => {
    let filtered = mockAdmins;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus && filterStatus !== 'All Status') {
      filtered = filtered.filter(admin => admin.status === filterStatus);
    }

    return filtered;
  }, [searchTerm, filterStatus]);

  // Column definitions for users table
  const userColumns = [
    { id: 'user', label: 'User', className: 'user-info' },
    { id: 'email', label: 'Email', className: 'email' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'orders', label: 'Orders', className: 'orders' },
    { id: 'joinDate', label: 'Join Date', className: 'date' },
    { id: 'lastLogin', label: 'Last Login', className: 'date' },
    { id: 'actions', label: 'Actions', className: 'actions' }
  ];

  // Column definitions for admins table
  const adminColumns = [
    { id: 'admin', label: 'Admin', className: 'user-info' },
    { id: 'email', label: 'Email', className: 'email' },
    { id: 'role', label: 'Role', className: 'role' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'permissions', label: 'Permissions', className: 'permissions' },
    { id: 'lastLogin', label: 'Last Login', className: 'date' },
    { id: 'actions', label: 'Actions', className: 'actions' }
  ];

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter
  const handleFilter = (status) => {
    setFilterStatus(status);
  };

  // Handle view user/admin
  const handleViewAccount = (account) => {
    setSelectedAccount(account);
    setShowViewModal(true);
  };

  // Handle edit account
  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    const [firstName, ...lastNameParts] = (account.name || '').split(' ');
    setFormData({
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      email: account.email || '',
      role: account.role || '',
    });
    setShowEditModal(true);
  };

  // Handle delete account
  const handleDeleteAccount = (account) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  };

  // Handle add account
  const handleAddAccount = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: activeTab === 'users' ? 'Customer' : 'Manager'
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Handle form input changes
  const handleFormChange = (updatedFormData) => {
    setFormData(updatedFormData);
    // Clear errors for changed fields
    const newErrors = { ...formErrors };
    Object.keys(updatedFormData).forEach(key => {
      if (formErrors[key]) {
        delete newErrors[key];
      }
    });
    setFormErrors(newErrors);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.role) errors.role = 'Role is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleFormSubmit = (submissionData) => {
    if (validateForm()) {
      console.log('Form submitted:', submissionData);
      // Add your API call here
      closeAllModals();
    }
  };

  // Handle account actions
  const handleAccountAction = (action, account) => {
    switch (action) {
      case 'view':
        handleViewAccount(account);
        break;
      case 'edit':
        handleEditAccount(account);
        break;
      case 'delete':
        handleDeleteAccount(account);
        break;
      case 'suspend':
        console.log('Suspend account:', account.id);
        break;
      case 'activate':
        console.log('Activate account:', account.id);
        break;
      default:
        break;
    }
  };

  // Close all modals
  const closeAllModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowAddModal(false);
    setShowDeleteModal(false);
    setSelectedAccount(null);
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      role: activeTab === 'users' ? 'Customer' : 'Manager' 
    });
    setFormErrors({});
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    return activeTab === 'users' ? filteredUsers : filteredAdmins;
  };

  // Get current columns based on active tab
  const getCurrentColumns = () => {
    return activeTab === 'users' ? userColumns : adminColumns;
  };

  // Get stats for the current tab
  const getStats = () => {
    const data = activeTab === 'users' ? mockUsers : mockAdmins;
    const activeCount = data.filter(item => item.status === 'active').length;
    const inactiveCount = data.filter(item => item.status === 'inactive').length;
    const suspendedCount = data.filter(item => item.status === 'suspended').length;

    return {
      total: data.length,
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount
    };
  };

  const stats = getStats();

  return (
    <div className="manage-accounts">
     

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total {activeTab === 'users' ? 'Users' : 'Admins'}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.active}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon inactive">
            <Ban size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.inactive}</span>
            <span className="stat-label">Inactive</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon suspended">
            <Ban size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.suspended}</span>
            <span className="stat-label">Suspended</span>
          </div>
        </div>
      </div>
 <div className="manage-accounts-header">
 
        
        <button className="add-account-btn" onClick={handleAddAccount}>
          <UserPlus size={16} />
          <span>Add {activeTab === 'users' ? 'User' : 'Admin'}</span>
        </button>
      </div>
      {/* Tabs */}
      <div className="accounts-tabs">
        <div className="tab-list">
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            <span>Users</span>
            <span className="tab-count">{mockUsers.length}</span>
          </button>
          
          <button
            className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            <Shield size={16} />
            <span>Admins</span>
            <span className="tab-count">{mockAdmins.length}</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="accounts-controls">
        <SearchBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchTerm={searchTerm}
          placeholder={`Search ${activeTab}...`}
          filterOptions={['All Status', 'active', 'inactive', 'suspended']}
          filterLabel="Filter by status"
        />
      </div>

      {/* Accounts Table */}
      <div className="accounts-table-container">
        <OrderTable
          orders={getCurrentData()}
          columns={getCurrentColumns()}
          keyField="id"
          onViewOrder={handleViewAccount}
          onAccountAction={handleAccountAction}
          activeTab={activeTab}
        />
        
        {getCurrentData().length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'users' ? <Users size={48} /> : <Shield size={48} />}
            </div>
            <h3>No {activeTab} found</h3>
            <p>
              {searchTerm || filterStatus 
                ? `No ${activeTab} match your current search and filter criteria.`
                : `No ${activeTab} have been added yet.`
              }
            </p>
            <button className="add-first-btn" onClick={handleAddAccount}>
              <UserPlus size={16} />
              Add First {activeTab === 'users' ? 'User' : 'Admin'}
            </button>
          </div>
        )}
      </div>

      {/* View Account Modal */}
      {showViewModal && selectedAccount && (
        <UserViewModal
          isOpen={showViewModal}
          onClose={closeAllModals}
          account={selectedAccount}
        />
      )}

      {/* Add/Edit Account Modal */}
      {(showAddModal || showEditModal) && (
        <UserAdminFormModal
          isEdit={showEditModal}
          activeTab={activeTab}
          onSubmit={handleFormSubmit}
          formValues={formData}
          formErrors={formErrors}
          onChange={handleFormChange}
          closeAllModals={closeAllModals}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAccount && (
        <ConfirmActionModal
          isOpen={showDeleteModal}
          confirmButtonText='Delete Account'
          onClose={closeAllModals}
          onConfirm={() => {
            console.log('Delete account:', selectedAccount.id);
            closeAllModals();
          }}
          title="Delete Account"
          message={`Are you sure you want to delete ${selectedAccount.name}'s account? This action cannot be undone.`}
          type="delete"
        />
      )}
    </div>
  );
};

export default ManageAccounts;