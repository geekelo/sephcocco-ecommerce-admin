import React, { useState, useMemo } from 'react';
import '../styles/ManageAccounts.css';
import { Users, Shield, UserPlus, Edit3, Trash2, Eye, MoreVertical, Ban, CheckCircle, Mail, Calendar, Phone, MapPin } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FlexibleTable from '../components/FlexibleTable';
import UserAdminFormModal from '../components/UserAdminFormModal';
import UserViewModal from '../components/UserViewModal';
import ConfirmActionModal from '../components/ConfirmActionModal';
import { useGetAllUsers } from '../hooks/useGetAllUser';
import { useUpdateUsers } from '../hooks/useUpdateUsers';
import { useSwitchRole } from '../hooks/useSwitchUser';
import { useSuspendUser } from '../hooks/useSuspendUser';
import { useUnsuspendUser } from '../hooks/useUnsuspendUser';

const itemsPerPage = 10;

const ManageAccounts = () => {
  const { data: usersResponse, isLoading, error, refetch } = useGetAllUsers();
  
  // Extract users array from API response
  const apiUsers = usersResponse?.users;
  console.log('API Users:', usersResponse);
  
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { mutateAsync: updateUser } = useUpdateUsers();
  const { mutateAsync: switchRole } = useSwitchRole();
  const { mutateAsync: suspendUser } = useSuspendUser();
  const { mutateAsync: unSuspendUser } = useUnsuspendUser();

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSwitchRoleModal, setShowSwitchRoleModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionType, setActionType] = useState(''); // 'suspend', 'unsuspend', 'switch-role'
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: activeTab === 'users' ? 'user' : 'admin',
    phone_number: '',
    whatsapp_number: '',
    address: '',
    outlets: [],
  });

  const [formErrors, setFormErrors] = useState({});

  // Transform API users to match component expectations
  const transformedUsers = useMemo(() => {
    if (!Array.isArray(apiUsers)) return [];
    
    return apiUsers.map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email || '',
      role: user.role || 'user',
      status: user.suspended ? 'suspended' : (user.last_login_at ? 'active' : 'inactive'),
      phone_number: user.phone_number || '',
      whatsapp_number: user.whatsapp_number || '',
      address: user.address || '',
      payment_ref: user.payment_ref || '',
      outlets: user.outlets || [],
      joinDate: user.created_at,
      lastLogin: user.last_login_at || new Date().toISOString(),
      orders: user.total_orders,
    }));
  }, [apiUsers]);

  // Separate users and admins
  const users = transformedUsers.filter(user => user.role === 'user');
  const admins = transformedUsers.filter(user => user.role === 'admin');

  // Filter data based on search and status
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus && filterStatus !== 'All Status') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    return filtered;
  }, [users, searchTerm, filterStatus]);

  const filteredAdmins = useMemo(() => {
    let filtered = admins;

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
  }, [admins, searchTerm, filterStatus]);

  // Column definitions for users table
  const userColumns = [
    {
      key: 'user',
      label: 'User',
      flex: 2,
      minWidth: '200px',
      format: (value, data) => (
        <div className="avatar-cell">
          <div className="avatar-placeholder">
            <Users size={16} />
          </div>
          <div className="avatar-details">
            <span className="avatar-name">{data.name}</span>
            <span className="avatar-sub">{data.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'phone_number',
      label: 'Phone',
      flex: 1.5,
      minWidth: '150px',
      format: (value, data) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
          <span>{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      flex: 2,
      minWidth: '150px',
      format: (value, data) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
          <span>{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      flex: 1,
      minWidth: '120px',
      type: 'status',
      statusConfig: {
        classMap: {
          'active': 'status-active',
          'inactive': 'status-inactive',
          'suspended': 'status-suspended'
        },
        textMap: {
          'active': 'Active',
          'inactive': 'Inactive',
          'suspended': 'Suspended'
        },
        showIcon: true,
        iconMap: {
          'active': '🟢',
          'inactive': '⭕',
          'suspended': '🚫'
        }
      }
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      flex: 1,
      minWidth: '120px',
      format: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280' }}>
          <Calendar size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      flex: 1,
      minWidth: '120px',
      format: (value) => (
        <div style={{ color: '#6b7280' }}>
          <span>{value ? new Date(value).toLocaleDateString() : 'Never'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      flex: 0,
      minWidth: '60px',
      type: 'actions',
      className: 'actions-column'
    }
  ];

  // Column definitions for admins table
  const adminColumns = [
    {
      key: 'admin',
      label: 'Admin',
      flex: 2,
      minWidth: '200px',
      format: (value, data) => (
        <div className="avatar-cell">
          <div className="avatar-placeholder">
            <Shield size={16} />
          </div>
          <div className="avatar-details">
            <span className="avatar-name">{data.name}</span>
            <span className="avatar-sub">{data.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'phone_number',
      label: 'Phone',
      flex: 1.5,
      minWidth: '150px',
      format: (value, data) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
          <span>{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      flex: 1,
      minWidth: '120px',
      format: (value) => (
        <span className={`badge role-${value.toLowerCase().replace(' ', '-')}`}>
          <Shield size={12} style={{ marginRight: '4px' }} />
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      flex: 1,
      minWidth: '120px',
      type: 'status',
      statusConfig: {
        classMap: {
          'active': 'status-active',
          'inactive': 'status-inactive',
          'suspended': 'status-suspended'
        },
        textMap: {
          'active': 'Active',
          'inactive': 'Inactive',
          'suspended': 'Suspended'
        },
        showIcon: true,
        iconMap: {
          'active': '🟢',
          'inactive': '⭕',
          'suspended': '🚫'
        }
      }
    },
    {
      key: 'payment_ref',
      label: 'Payment Ref',
      flex: 1,
      minWidth: '120px',
      format: (value) => value || 'N/A'
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      flex: 1,
      minWidth: '120px',
      format: (value) => (
        <div style={{ color: '#6b7280' }}>
          <span>{value ? new Date(value).toLocaleDateString() : 'Never'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      flex: 0,
      minWidth: '60px',
      type: 'actions',
      className: 'actions-column'
    }
  ];

  // Actions configuration
  const accountActions = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye size={14} />,
      className: 'view'
    },
    {
      key: 'edit',
      label: 'Edit Account',
      icon: <Edit3 size={14} />,
      className: 'edit'
    },
    {
      key: 'suspend',
      label: 'Suspend Account',
      icon: <Ban size={14} />,
      className: 'suspend',
      disabled: (data) => data.status === 'suspended'
    },
    {
      key: 'unsuspend',
      label: 'Unsuspend Account',
      icon: <CheckCircle size={14} />,
      className: 'activate',
      disabled: (data) => data.status !== 'suspended'
    },
    {
      key: 'switch-role',
      label: 'Switch Role',
      icon: <Trash2 size={14} />,
      className: 'delete'
    }
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
    console.log('Editing account:', account);
    
    const [firstName, ...lastNameParts] = (account.name || '').split(' ');
    setFormData({
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      email: account.email || '',
      role: account.role || '',
      phone_number: account.phone_number || '',
      whatsapp_number: account.whatsapp_number || '',
      address: account.address || '',
      outlets: account.outlets || [],
    });
    setShowEditModal(true);
  };

  // Handle form submit for edit
  const handleFormSubmit = async (submissionData) => {
    try {
      if (!selectedAccount?.id) {
        console.error('No selected account ID');
        return;
      }

      const fullName = `${submissionData.firstName || ''} ${submissionData.lastName || ''}`.trim();
      
      // Update user details payload
      const userDetailsPayload = {
        user: {
          email: submissionData.email,
          name: fullName,
          address: submissionData.address,
          phone_number: submissionData.phone_number,
          whatsapp_number: submissionData.whatsapp_number
        }
      };

      // Add password fields if they exist (for new users or password changes)
      if (submissionData.password) {
        userDetailsPayload.user.password = submissionData.password;
        userDetailsPayload.user.password_confirmation = submissionData.password_confirmation;
      }

      console.log('Updating user details:', userDetailsPayload);
      
      // Update user details
      await updateUser({userId: selectedAccount.id, payload: userDetailsPayload});

      // If outlets are provided and different, update outlets separately
      if (submissionData.outlets && submissionData.outlets.length > 0) {
        const outletsPayload = {
          user: {
            outlets: submissionData.outlets
          }
        };
        
        console.log('Updating user outlets:', outletsPayload);
        await updateUser(selectedAccount.id, outletsPayload);
      }

      // Refetch data to update the UI
      refetch();
      closeAllModals();
      
    } catch (error) {
      console.error('Update failed:', error);
      // Handle error appropriately - you might want to show an error message to the user
    }
  };

  // Handle suspend user - STANDALONE FUNCTION
  const handleSuspendUser = async () => {
    console.log('Suspending user:', selectedAccount);
    
    try {
      if (!selectedAccount?.id) {
        console.error('No selected account ID');
        return;
      }

      console.log('Suspending user with ID:', selectedAccount.id);
      await suspendUser({userId: selectedAccount.id});
      console.log('User suspended successfully');

      // Refetch data to update the UI
      refetch();
      closeAllModals();
      
    } catch (error) {
      console.error('Suspend failed:', error);
      // Handle error appropriately - you might want to show an error message to the user
    }
  };

  // Handle unsuspend user - STANDALONE FUNCTION
  const handleUnsuspendUser = async () => {
    console.log('Unsuspending user:', selectedAccount);
    
    try {
      if (!selectedAccount?.id) {
        console.error('No selected account ID');
        return;
      }

      console.log('Unsuspending user with ID:', selectedAccount.id);
      await unSuspendUser({userId: selectedAccount.id});
      console.log('User unsuspended successfully');

      // Refetch data to update the UI
      refetch();
      closeAllModals();
      
    } catch (error) {
      console.error('Unsuspend failed:', error);
      // Handle error appropriately - you might want to show an error message to the user
    }
  };

  // Handle switch role
  const handleSwitchRole = async () => {
    try {
      if (!selectedAccount?.id) {
        console.error('No selected account ID');
        return;
      }

      const newRole = selectedAccount.role === 'user' ? 'admin' : 'user';
      const switchRolePayload = {
        user: {
          role: newRole
        }
      };

      console.log('Switching role:', switchRolePayload);
      await switchRole({userId: selectedAccount.id, payload: switchRolePayload});

      // Refetch data to update the UI
      refetch();
      closeAllModals();
      
    } catch (error) {
      console.error('Role switch failed:', error);
      // Handle error appropriately
    }
  };

  // Handle add account
  const handleAddAccount = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: activeTab === 'users' ? 'user' : 'admin',
      phone_number: '',
      whatsapp_number: '',
      address: '',
      outlets: [],
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

  // Handle account actions from dropdown
  const handleAccountAction = (actionKey, account) => {
    console.log('Action clicked:', actionKey, account);
    setSelectedAccount(account);
    setActionType(actionKey);

    switch (actionKey) {
      case 'view':
        handleViewAccount(account);
        break;
      case 'edit':
        handleEditAccount(account);
        break;
      case 'suspend':
        // Show confirmation modal for suspend
        setShowDeleteModal(true);
        break;
      case 'unsuspend':
        // Show confirmation modal for unsuspend
        setShowDeleteModal(true);
        break;
      case 'switch-role':
        setShowSwitchRoleModal(true);
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
    setShowSwitchRoleModal(false);
    setSelectedAccount(null);
    setActionType('');
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      role: activeTab === 'users' ? 'user' : 'admin',
      phone_number: '',
      whatsapp_number: '',
      address: '',
      outlets: [],
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

  // Get stats using API response summary
  const getStats = () => {
    if (!usersResponse) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0
      };
    }

    if (activeTab === 'users') {
      return {
        total: usersResponse.summary.total_users || 0,
        active: usersResponse.summary.total_active_accounts || 0,
        inactive: usersResponse.summary.total_inactive_accounts || 0,
        suspended: usersResponse.summary.total_suspended || 0
      };
    } else {
      // For admins tab
      return {
        total: usersResponse.summary.total_admins || 0,
        active: usersResponse.summary.total_active_accounts || 0,
        inactive: usersResponse.summary.total_inactive_accounts || 0,
        suspended: usersResponse.summary.total_suspended || 0
      };
    }
  };

  const stats = getStats();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="manage-accounts">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading accounts...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="manage-accounts">
        <div className="error-container">
          <h3>Error loading accounts</h3>
          <p>{error.message || 'Something went wrong'}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Get confirmation modal content based on action type
  const getConfirmationModalContent = () => {
    if (!selectedAccount) return {};

    switch (actionType) {
      case 'suspend':
        return {
          title: 'Suspend Account',
          message: `Are you sure you want to suspend ${selectedAccount.name}'s account? They will no longer be able to access the system.`,
          confirmButtonText: 'Suspend Account',
          type: 'suspend',
          onConfirm: handleSuspendUser // Now uses the standalone function
        };
      case 'unsuspend':
        return {
          title: 'Unsuspend Account',
          message: `Are you sure you want to unsuspend ${selectedAccount.name}'s account? They will regain access to the system.`,
          confirmButtonText: 'Unsuspend Account',
          type: 'activate',
          onConfirm: handleUnsuspendUser // Now uses the standalone function
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to perform this action?',
          confirmButtonText: 'Confirm',
          type: 'delete',
          onConfirm: () => closeAllModals()
        };
    }
  };

  const confirmationContent = getConfirmationModalContent();

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
            <span className="tab-count">{users.length}</span>
          </button>
          
          <button
            className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            <Shield size={16} />
            <span>Admins</span>
            <span className="tab-count">{admins.length}</span>
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
        <FlexibleTable
          data={getCurrentData()}
          columns={getCurrentColumns()}
          keyField="id"
          onRowClick={handleViewAccount}
          onActionClick={handleAccountAction}
          actions={accountActions}
          clickableRows={true}
          isLoading={isLoading}
          emptyState={
            <div className="empty-state">
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
          }
          className="accounts-table"
        />
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

      {/* Suspend/Unsuspend Confirmation Modal */}
      {showDeleteModal && selectedAccount && (
        <ConfirmActionModal
          isOpen={showDeleteModal}
          confirmButtonText={confirmationContent.confirmButtonText}
          onClose={closeAllModals}
          onConfirm={confirmationContent.onConfirm}
          title={confirmationContent.title}
          message={confirmationContent.message}
          type={confirmationContent.type}
        />
      )}

      {/* Switch Role Confirmation Modal */}
      {showSwitchRoleModal && selectedAccount && (
        <ConfirmActionModal
          isOpen={showSwitchRoleModal}
          confirmButtonText="Switch Role"
          onClose={closeAllModals}
          onConfirm={handleSwitchRole}
          title="Switch User Role"
          message={`Are you sure you want to switch ${selectedAccount.name}'s role from ${selectedAccount.role} to ${selectedAccount.role === 'user' ? 'admin' : 'user'}? This will change their access permissions.`}
          type="switch"
        />
      )}
    </div>
  );
};

export default ManageAccounts;