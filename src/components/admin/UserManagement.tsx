import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User, Shield, Mail, CheckCircle, XCircle, Eye, EyeOff, Save, X } from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser, getRoles, type RoleDto as ApiRoleDto, type CreateUserRequest, type UpdateUserRequest } from '../../services/userManagementService';
import '../../styles/UserManagement.css';

// TypeScript Interfaces - Updated to match API
interface User {
  id?: number; // Changed from string to number
  email: string;
  password?: string;
  roleDto: ApiRoleDto;
  status: boolean;
}

interface UserFormData {
  email: string;
  password: string;
  roleId: number;
  status: boolean;
}

const UserManagement: React.FC = () => {
  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<ApiRoleDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    loadRolesAndUsers();
  }, []);

  const loadRolesAndUsers = async () => {
    await loadRoles();
    await loadUsers();
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await getAllUsers();
      console.log('Fetched users from API:', fetchedUsers);
      
      const mappedUsers = fetchedUsers.map((user, index) => {
        console.log(`Processing user ${index}:`, user);
        console.log(`User ID: "${user.id}" (should now be present)`);
        
        // User already has roleDto from API - no need to map
        const mappedUser = {
          id: user.id,
          email: user.email,
          roleDto: user.roleDto, // Use roleDto directly from API
          status: user.status
        };
        
        console.log(`Mapped user ${index}:`, mappedUser);
        console.log(`Final user ID: "${mappedUser.id}" (type: ${typeof mappedUser.id})`);
        
        return mappedUser;
      });
      
      console.log('Final mapped users:', mappedUsers);
      setUsers(mappedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error loading users:', err);
      // Fall back to mock data if API fails
      setUsers([
        {
          id: 1,
          email: "admin@example.com",
          roleDto: { roleId: 2, roleName: "ADMIN" },
          status: true
        },
        {
          id: 2,
          email: "student1@example.com",
          roleDto: { roleId: 1, roleName: "STUDENT" },
          status: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const roles = await getRoles();
      setAvailableRoles(roles);
    } catch (err) {
      console.error('Error loading roles:', err);
      // Use fallback roles if API fails
      setAvailableRoles([
        { roleId: 1, roleName: 'STUDENT' },
        { roleId: 2, roleName: 'PARENT' },
        { roleId: 3, roleName: 'ADMIN' },
        { roleId: 4, roleName: 'EVENT_MANAGER' }
      ]);
    }
  };

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    roleId: 1,
    status: true
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      roleId: 1,
      status: true
    });
    setSelectedUser(null);
  };

  // Filter users based on search term, role, and status
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleDto.roleName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.roleDto.roleName === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      filtered = filtered.filter(user => user.status === isActive);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleCreate = () => {
    setFormData({
      email: '',
      password: '',
      roleId: 1,
      status: true
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setFormData({
      email: user.email,
      password: '', // Don't pre-fill password for security
      roleId: user.roleDto.roleId,
      status: user.status
    });
    setSelectedUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (user: User) => {
    console.log('handleDelete called with user:', user);
    console.log('User ID details:', {
      id: user.id,
      hasId: !!user.id,
      idType: typeof user.id
    });
    
    if (!user.id) {
      console.error('User ID validation failed:', user);
      alert(`Cannot delete user: No valid user ID found.\nUser data: ${JSON.stringify(user, null, 2)}`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user: ${user.email}?`)) {
      try {
        console.log('Deleting user with ID:', user.id);
        await deleteUser(user.id); // Pass numeric ID directly
        console.log('User deleted successfully');
        
        // Reload the users list to ensure consistency
        await loadUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        const selectedRole = availableRoles.find(r => r.roleId === formData.roleId);
        if (!selectedRole) {
          alert('Please select a valid role');
          return;
        }

        const createRequest: CreateUserRequest = {
          email: formData.email,
          password: formData.password || 'defaultPassword123',
          roleDto: selectedRole,
          status: formData.status
        };

        const newUser = await createUser(createRequest);
        
        // Add the new user to the local state
        const userToAdd: User = {
          id: newUser.id,
          email: newUser.email,
          roleDto: selectedRole,
          status: newUser.status
        };
        setUsers(prev => [...prev, userToAdd]);
        
      } else if (selectedUser && selectedUser.id) {
        const selectedRole = availableRoles.find(r => r.roleId === formData.roleId);
        if (!selectedRole) {
          alert('Please select a valid role');
          return;
        }

        const updateRequest: UpdateUserRequest = {
          email: formData.email,
          ...(formData.password && { password: formData.password }),
          roleDto: selectedRole,
          status: formData.status
        };

        await updateUser(selectedUser.id, updateRequest);
        
        // Update the local state
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? {
                ...user,
                email: formData.email,
                roleDto: selectedRole,
                status: formData.status
              }
            : user
        ));
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err instanceof Error ? err.message : 'Failed to save user');
    }
  };

  const toggleUserStatus = async (user: User) => {
    if (!user.id) return;
    
    try {
      const newStatus = !user.status;
      console.log('Toggling user status for:', user.email, 'from', user.status, 'to', newStatus);
      
      // Call API to update user status
      const updateRequest: UpdateUserRequest = {
        email: user.email,
        roleDto: user.roleDto,
        status: newStatus
      };
      
      await updateUser(user.id, updateRequest);
      console.log('User status updated successfully');
      
      // Reload the users list to ensure consistency
      await loadUsers();
      
    } catch (err) {
      console.error('Error updating user status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
      case 'SYSTEM_ADMIN':
        return 'role-admin';
      case 'EVENT_MANAGER':
        return 'role-manager';
      case 'PARENT':
        return 'role-parent';
      case 'STUDENT':
        return 'role-student';
      default:
        return 'role-default';
    }
  };

  return (
    <div className="user-management">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="user-management-header">
        <div className="header-content">
          <h1>
            <User className="header-icon" />
            User Management
          </h1>
          <p>Manage system users, roles, and permissions</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Add New User
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          <div className="user-management-filters">{/* ...existing filter code... */}
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Roles</option>
          {availableRoles.map(role => (
            <option key={role.roleId} value={role.roleName}>{role.roleName}</option>
          ))}
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              return (
              <tr key={user.id}>
                <td>
                  <div className="user-email">
                    <Mail size={16} className="email-icon" />
                    {user.email}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.roleDto.roleName)}`}>
                    <Shield size={14} />
                    {user.roleDto.roleName}
                  </span>
                </td>
                <td>
                  <button 
                    className={`status-toggle ${user.status ? 'active' : 'inactive'}`}
                    onClick={() => toggleUserStatus(user)}
                  >
                    {user.status ? (
                      <>
                        <CheckCircle size={16} />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(user)}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-data">
            <User size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or add a new user.</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? 'Create New User' : 'Edit User'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password {modalMode === 'edit' && '(can not be null)'}
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={modalMode === 'create' ? 'Enter password' : 'can not be null'}
                    required={modalMode === 'create'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={formData.roleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roleId: parseInt(e.target.value) }))}
                  required
                >
                  {availableRoles.map(role => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                  />
                  <span className="checkbox-custom"></span>
                  Active User
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {modalMode === 'create' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
