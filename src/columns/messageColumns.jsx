  // Create columns configuration for messages
export const createMessageColumns = (handleViewMessage) => [
    { 
      key: "user_name", 
      label: "Customer", 
      flex: 2,
      minWidth: "150px"
    },
      { 
      key: "user_email", 
      label: "Customer Email", 
      flex: 2,
      minWidth: "150px"
    },
    { 
      key: "status", 
      label: "Status", 
      flex: 1,
      minWidth: "120px",
      type: "status",
      statusConfig: {
        classMap: {
          'pending': 'status-pending',
          'unread': 'status-pending',
          'new': 'status-pending',
          'completed': 'status-completed',
          'read': 'status-completed',
          'replied': 'status-completed',
          'active': 'status-active',
          'processing': 'status-processing',
          'cancelled': 'status-cancelled',
          'inactive': 'status-inactive',
          'suspended': 'status-suspended',
          'archived': 'status-suspended'
        },
        textMap: {
          'unread': 'Unread',
          'read': 'Read', 
          'replied': 'Replied',
          'archived': 'Archived',
          'pending': 'Pending',
          'new': 'New',
          'completed': 'Completed',
          'active': 'Active',
          'processing': 'Processing',
          'cancelled': 'Cancelled',
          'inactive': 'Inactive',
          'suspended': 'Suspended'
        },
        showIcon: true,
        iconMap: {
          'unread': '📩',
          'read': '📖',
          'replied': '↩️',
          'archived': '📁',
          'pending': '⏳',
          'new': '🆕',
          'completed': '✅',
          'active': '🟢',
          'processing': '🔄',
          'cancelled': '❌',
          'inactive': '⭕',
          'suspended': '🚫'
        }
      }
    },
    { 
      key: "content", 
      label: "Preview", 
      flex: 3,
      minWidth: "200px",
      format: (value) => {
        // Truncate preview text if too long
        return value && value.length > 50 ? `${value.substring(0, 50)}...` : value;
      }
    },
    {
      key: "action",
      label: "Action",
      flex: 1,
      minWidth: "100px",
      type: "button",
      buttonConfig: {
        text: "View",
        className: "view-button",
        icon: "👁️",
        onClick: (data) => {
          handleViewMessage(data);
        }
      }
    }
  ];
