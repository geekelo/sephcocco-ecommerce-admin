// UserManagement.jsx
import React from 'react';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const users = [
    { name: 'John Doe', role: 'Support', status: 'Active', statusClass: 'active' },
    { name: 'John Doe', role: 'Admin', status: 'Active', statusClass: 'active' },
    { name: 'John Doe', role: 'Pending', status: 'Invite Sent', statusClass: 'pending' }
  ];

  const handleEdit = (index) => {
    console.log(`Edit user at index: ${index}`);
    // Add your edit logic here
  };

  const handleDelete = (index) => {
    console.log(`Delete user at index: ${index}`);
    // Add your delete logic here
  };

  const handleAddUser = () => {
    console.log('Add new user');
    // Add your add user logic here
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <button className="add-user" onClick={handleAddUser}>
          Add New User
        </button>
      </div>
      
      <div className="user-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status ${user.statusClass}`}>
                    <div className="status-dot"></div>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(index)}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(index)}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;