import React, { useState, useMemo } from 'react';
import '../styles/ManageAccounts.css';
import { Users, Shield, UserPlus, Edit3, Trash2, Eye, MoreVertical, Ban, CheckCircle, Mail, Calendar, Phone, MapPin, Truck, Package, Star, Clock, Replace } from 'lucide-react';
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
import { useRoles } from '../hooks/useRoles'; // Add this import
import ManageAccountsSkeleton from '../components/ManageAccountSkeleton';
import Pagination from '../components/Pagination';
import { useDeleteUser } from '../hooks/useDeleteUser';

const itemsPerPage = 10;

const ManageAccounts = () => {
  const [searchBarState, setSearchBarState] = useState({
    search: "",
    status: "All Status", 
    startDate: "",
    endDate: ""
  });
  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    start_date: "",
    end_date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { data: usersResponse, isLoading, error, refetch } = useGetAllUsers(filters, currentPage, itemsPerPage);
  const { data: rolesData } = useRoles(); // Add this hook
  
  // Extract users array from API response
  const apiUsers = usersResponse?.users;
  
  // Set up roleOptions from rolesData
  const roleOptions = useMemo(() => {
    return rolesData && Array.isArray(rolesData) ? rolesData : [];
  }, [rolesData]);

  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { mutateAsync: updateUser, isPending } = useUpdateUsers();
  const { mutateAsync: switchRole } = useSwitchRole();
  const { mutateAsync: suspendUser } = useSuspendUser();
  const { mutateAsync: unSuspendUser } = useUnsuspendUser();
  const {mutateAsync: deleteUser} = useDeleteUser()
  const meta = {
    current_page: currentPage,
    total_pages: Math.ceil(apiUsers?.length / itemsPerPage),
    total_count: apiUsers?.length,
    per_page: itemsPerPage
  };

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
    role: activeTab === 'users' ? 'user' : activeTab === 'riders' ? 'rider' : 'admin',
    phone_number: '',
    whatsapp_number: '',
    address: '',
    outlets: [],
    subroles: [], // Add subroles here
    // Rider-specific fields
    license_number: '',
    vehicle_type: '',
    vehicle_plate: '',
    emergency_contact: '',
    emergency_phone: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Transform API users to match component expectations
  const transformedUsers = useMemo(() => {
    if (!Array.isArray(apiUsers)) return [];
    
    return apiUsers
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email || '',
        role: user.role || '',
        subroles: user.subroles || [],
        status: user.suspended ? 'suspended' : 'unsuspended',
        phone_number: user.phone_number || '',
        whatsapp_number: user.whatsapp_number || '',
        address: user.address || '',
        payment_ref: user.payment_ref || '',
        outlets: user.outlets || [],
        joinDate: user.created_at,
        lastLogin: user.last_login_at || new Date().toISOString(),
        orders: user.total_orders,
        shippings: user.total_shippings
      }))
      // Sort by creation date - newest first
      .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
  }, [apiUsers]);

  // For users array
  const users = transformedUsers
    .filter(user => user.role === 'user')
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

  // For admins array  
  const admins = transformedUsers
    .filter(user => user.role === 'admin')
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

  // For riders array
  const riders = transformedUsers
    .filter(user => user.role === 'rider')
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus && filterStatus !== 'All Status') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Sort by newest first (this ensures sorting is maintained even after filtering)
    return filtered.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
  }, [users, searchTerm, filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Updated to handle the new sort parameters from SearchBar
  const handleApplyFilters = ({ 
    status, 
    search_terms, 
    start_date, 
    end_date, 
    sort_by_likes, // Accept but ignore sort parameters for shipping
    sort_by_stock  // Accept but ignore sort parameters for shipping
  }) => {
    // Only use the parameters that shipping needs
    setFilters({ status, search_terms, start_date, end_date });
    setCurrentPage(1);
    
    // Update search bar state to maintain UI state
    setSearchBarState({
      search: search_terms || "",
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Status",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };

  // Manual search handler - triggered when user types and presses Enter
  const handleManualSearch = (searchTerm) => {
    handleApplyFilters({
      status: "",
      search_terms: searchTerm,
      start_date: "",
      end_date: "",
      sort_by_likes: "", // Clear sort filters
      sort_by_stock: ""  // Clear sort filters
    });
  };

  const filteredAdmins = useMemo(() => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus && filterStatus !== 'All Status') {
      filtered = filtered.filter(admin => admin.status === filterStatus);
    }

    return filtered;
  }, [admins, searchTerm, filterStatus]);

  const filteredRiders = useMemo(() => {
    let filtered = riders;

    if (searchTerm) {
      filtered = filtered.filter(rider =>
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rider.vehicle_type && rider.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rider.vehicle_plate && rider.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus && filterStatus !== 'All Status') {
      if (filterStatus === 'available' || filterStatus === 'busy' || filterStatus === 'offline') {
        filtered = filtered.filter(rider => rider.current_status === filterStatus);
      } else {
        filtered = filtered.filter(rider => rider.status === filterStatus);
      }
    }

    return filtered;
  }, [riders, searchTerm, filterStatus]);

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
          'unsuspended': 'status-active',
          'inactive': 'status-inactive',
          'suspended': 'status-suspended'
        },
        textMap: {
          'unsuspended': 'Unsuspended',
          'inactive': 'Inactive',
          'suspended': 'Suspended'
        },
        showIcon: true,
        iconMap: {
          'unsuspended': '🟢',
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
      key: 'subroles',
      label: 'Subroles',
      flex: 1.5,
      minWidth: '150px',
      format: (value, data) => {
        if (!data.subroles || data.subroles.length === 0) {
          return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No subroles</span>;
        }
        
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {data.subroles.map((subrole, index) => (
              <span 
                key={index}
                className="badge subrole-badge"
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {subrole}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      flex: 1,
      minWidth: '120px',
      type: 'status',
      statusConfig: {
        classMap: {
          'unsuspended': 'status-active',
          'inactive': 'status-inactive',
          'suspended': 'status-suspended'
        },
        textMap: {
          'unsuspended': 'Unsuspended',
          'inactive': 'Inactive',
          'suspended': 'Suspended'
        },
        showIcon: true,
        iconMap: {
          'unsuspended': '🟢',
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

  // Column definitions for riders table
  const riderColumns = [
    {
      key: 'rider',
      label: 'Rider',
      flex: 2,
      minWidth: '200px',
      format: (value, data) => (
        <div className="avatar-cell">
          <div className="avatar-placeholder">
            <Truck size={16} />
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
      key: 'total_orders',
      label: 'Total Orders',
      flex: 1,
      minWidth: '120px',
      format: (value, data) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontWeight: '600' }}>{data.orders}</div>
        </div>
      )
    },
    {
      key: 'total_shippings',
      label: 'Total Deliveries',
      flex: 1,
      minWidth: '120px',
      format: (value, data) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontWeight: '600' }}>{data.shippings}</div>
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
          'unsuspended': 'status-active',
          'inactive': 'status-inactive',
          'suspended': 'status-suspended'
        },
        textMap: {
          'unsuspended': 'Unsuspended',
          'inactive': 'Inactive',
          'suspended': 'Suspended'
        },
        showIcon: true,
        iconMap: {
          'unsuspended': '🟢',
          'inactive': '⭕',
          'suspended': '🚫'
        }
      }
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
      icon: <Replace size={14} />,
      className: 'activate'
    },
        {
      key: 'delete',
      label: 'Delete User',
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

  // Handle view user/admin/rider
  const handleViewAccount = (account) => {
    setSelectedAccount(account);
    setShowViewModal(true);
  };
  
  // Handle edit account (FIXED)
  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    console.log('Editing account:', account);
    
    // Map subroles from names to IDs for the form
    const subroleIds = [];
    if (account.subroles && Array.isArray(account.subroles)) {
      account.subroles.forEach(subroleName => {
        const matchingRole = roleOptions.find(role => role.name === subroleName);
        if (matchingRole) {
          subroleIds.push(matchingRole.id);
        }
      });
    }
    
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
      subroles: subroleIds, // Use mapped IDs instead of names
    });
    setShowEditModal(true);
  };

  // Handle form submit for edit (FIXED)
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
      await updateUser({
        userId: selectedAccount.id,
        payload: userDetailsPayload
      });

      // Handle outlets update
      if (submissionData.outlets && submissionData.outlets.length > 0) {
        const outletsPayload = {
          user: {
            outlets: submissionData.outlets
          }
        };

        console.log('Updating user outlets:', outletsPayload);
        await updateUser({
          userId: selectedAccount.id,
          payload: outletsPayload
        });
      }

      // Handle subroles update - FIXED VERSION
      if (submissionData.subroles && submissionData.subroles.length > 0) {
        // Convert role IDs back to role names for the API
        const subroleNames = submissionData.subroles.map(roleId => {
          const role = roleOptions.find(r => r.id === roleId);
          return role ? role.name : roleId;
        });

        const subrolesPayload = {
          user: {
            subroles: subroleNames // Send names instead of IDs
          }
        };
        
        console.log('Updating user subroles:', subrolesPayload);
        await updateUser({
          userId: selectedAccount.id,
          payload: subrolesPayload
        });
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
const handleDeleteUser = async () => {
    console.log('Unsuspending user:', selectedAccount);
    
    try {
      if (!selectedAccount?.id) {
        console.error('No selected account ID');
        return;
      }

      console.log('Deleteing user with ID:', selectedAccount.id);
      await deleteUser({userId: selectedAccount.id});
      console.log('User Deleted successfully');

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

      let newRole;
      if (selectedAccount.role === 'user') {
        newRole = 'admin';
      } else if (selectedAccount.role === 'admin') {
        newRole = 'rider';
      } else {
        newRole = 'user';
      }

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
    const role = activeTab === 'users' ? 'user' : activeTab === 'riders' ? 'rider' : 'admin';
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: role,
      phone_number: '',
      whatsapp_number: '',
      address: '',
      outlets: [],
      subroles: [], // Initialize subroles as empty array
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
           case 'delete':
        // Show confirmation modal for suspend
        setShowDeleteModal(true);
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
    const role = activeTab === 'users' ? 'user' : activeTab === 'riders' ? 'rider' : 'admin';
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      role: role,
      phone_number: '',
      whatsapp_number: '',
      address: '',
      outlets: [],
      subroles: [], // Reset subroles
    });
    setFormErrors({});
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'users') return filteredUsers;
    if (activeTab === 'riders') return filteredRiders;
    return filteredAdmins;
  };

  // Get current columns based on active tab
  const getCurrentColumns = () => {
    if (activeTab === 'users') return userColumns;
    if (activeTab === 'riders') return riderColumns;
    return adminColumns;
  };

  // Get stats using API response summary and calculated data for riders
  const getStats = () => {
    if (!usersResponse && activeTab !== 'riders') {
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }

    if (activeTab === 'users') {
      return {
        total: users.length,
        active: users.filter(u => u.status === 'unsuspended').length,
        inactive: users.filter(u => u.status === 'suspended').length,
      };
    } else if (activeTab === 'riders') {
      // Calculate stats from actual riders data
      const totalRiders = riders.length;
      const availableRiders = riders.filter(r => r.current_status === 'available').length;
      const busyRiders = riders.filter(r => r.current_status === 'busy').length;
      const offlineRiders = riders.filter(r => r.current_status === 'offline').length;
      const totalDeliveries = riders.reduce((sum, r) => sum + (r.total_deliveries || 0), 0);
      
      return {
        total: totalRiders,
        active: availableRiders,
        inactive: offlineRiders,
        busy: busyRiders,
        totalDeliveries: totalDeliveries,
      };
    } else {
      // For admins tab
      return {
        total: admins.length,
        active: admins.filter(a => a.status === 'unsuspended').length,
        inactive: admins.filter(a => a.status === 'suspended').length,
      };
    }
  };

  const stats = getStats();

  // Handle loading state
  if (isLoading) {
    return (
      <ManageAccountsSkeleton/>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="manage-accounts">
        <div className="error-container">
          <h3>Error loading accounts</h3>
          <p>{error.message || 'Something went wrong'}</p>
          <button onClick={() => refetch()}>Retry</button>
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
          onConfirm: handleSuspendUser
        };
      case 'unsuspend':
        return {
          title: 'Unsuspend Account',
          message: `Are you sure you want to unsuspend ${selectedAccount.name}'s account? They will regain access to the system.`,
          confirmButtonText: 'Unsuspend Account',
          type: 'activate',
          onConfirm: handleUnsuspendUser
        };
          case 'delete':
        return {
          title: 'Delete Account',
          message: `Are you sure you want to delete ${selectedAccount.name}'s account? They will regain access to the system.`,
          confirmButtonText: 'Delete Account',
          type: 'activate',
          onConfirm: handleDeleteUser
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

  // Get filter options based on active tab
  const getFilterOptions = () => {
    return ['All Status', 'unsuspended', 'suspended'];
  };

  return (
    <div className="manage-accounts">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            {activeTab === 'riders' ? <Truck size={20} /> : activeTab === 'users' ? <Users size={20} /> : <Shield size={20} />}
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total {activeTab === 'users' ? 'Users' : activeTab === 'riders' ? 'Riders' : 'Admins'}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.active}</span>
            <span className="stat-label">{activeTab === 'riders' ? 'Available' : 'Active'}</span>
          </div>
        </div>
        
        {activeTab === 'riders' && (
          <div className="stat-card">
            <div className="stat-icon warning">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.busy}</span>
              <span className="stat-label">Busy</span>
            </div>
          </div>
        )}
        
        <div className="stat-card">
          <div className="stat-icon inactive">
            <Ban size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.inactive}</span>
            <span className="stat-label">{activeTab === 'riders' ? 'Offline' : 'Inactive'}</span>
          </div>
        </div>
        
        {activeTab === 'riders' && (
          <div className="stat-card">
            <div className="stat-icon delivery">
              <Package size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.totalDeliveries}</span>
              <span className="stat-label">Total Deliveries</span>
            </div>
          </div>
        )}
      </div>

      <div className="manage-accounts-header">
        <button className="add-account-btn" onClick={handleAddAccount}>
          <UserPlus size={16} />
          <span>Add {activeTab === 'users' ? 'User' : activeTab === 'riders' ? 'Rider' : 'Admin'}</span>
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
            className={`tab-button ${activeTab === 'riders' ? 'active' : ''}`}
            onClick={() => setActiveTab('riders')}
          >
            <Truck size={16} />
            <span>Riders</span>
            <span className="tab-count">{riders.length}</span>
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
          filterOptions={getFilterOptions()}
          onApply={handleApplyFilters}
          onManualSearch={handleManualSearch} // Add manual search handler
          categoryOptions={[]} // Explicitly disable category filtering
          sortOptions={[]} // Explicitly disable sort options
          placeholder={`Search ${activeTab}...`}
          filterLabel="Filter by Status"
          showDate={true} // Enable date filtering for shipping
          initialValues={searchBarState} // Pass persistent state
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
     
              <p>
                {searchTerm || filterStatus 
                  ? `No ${activeTab} match your current search and filter criteria.`
                  : `No ${activeTab} have been added yet.`
                }
              </p>
            
            </div>
          }
          className="accounts-table"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={meta.total_pages}
          onPageChange={handlePageChange}
          totalItems={meta.total_count}
          itemsPerPage={itemsPerPage}
          showInfo={true}
          name="Shipping"
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
          isLoading={isPending}
          refetch={refetch}
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
          message={`Are you sure you want to switch ${selectedAccount.name}'s role from ${selectedAccount.role} to ${selectedAccount.role === 'user' ? 'admin' : selectedAccount.role === 'admin' ? 'rider' : 'user'}? This will change their access permissions.`}
          type="switch"
        />
      )}
    </div>
  );
};

export default ManageAccounts;