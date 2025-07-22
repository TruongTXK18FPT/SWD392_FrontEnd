import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User, Shield, Mail, CheckCircle, XCircle, Eye, EyeOff, Save, X } from 'lucide-react';
import '../../styles/UserManagement.css';

// TypeScript Interfaces
interface RoleDto {
  roleId: number;
  roleName: string;
}

interface User {
  id?: string;
  email: string;
  password: string;
  roleDto: RoleDto;
  status: boolean;
}

interface UserFormData {
  email: string;
  password: string;
  roleId: number;
  status: boolean;
}

const UserManagement: React.FC = () => {
  // Mock data based on your provided structure
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      email: "admin@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 2, roleName: "ADMIN" },
      status: true
    },
    {
      id: "2",
      email: "student1@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 1, roleName: "STUDENT" },
      status: true
    },
    {
      id: "3",
      email: "parent@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 3, roleName: "PARENT" },
      status: true
    },
    {
      id: "4",
      email: "sysadmin@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 4, roleName: "SYSTEM_ADMIN" },
      status: true
    },
    {
      id: "5",
      email: "eventmgr@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 5, roleName: "EVENT_MANAGER" },
      status: true
    },
    {
      id: "6",
      email: "student2@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 1, roleName: "STUDENT" },
      status: true
    },
    {
      id: "7",
      email: "student3@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 1, roleName: "STUDENT" },
      status: false
    },
    {
      id: "8",
      email: "parent2@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 3, roleName: "PARENT" },
      status: false
    },
    {
      id: "9",
      email: "admin2@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 2, roleName: "ADMIN" },
      status: true
    },
    {
      id: "10",
      email: "eventmgr2@example.com",
      password: "$2a$12$Sqd5lHHmpeuThlWd3xyL2eYsT1WjR72cJKRGv9u27HlEWeyk6idj2",
      roleDto: { roleId: 5, roleName: "EVENT_MANAGER" },
      status: true
    }
  ]);

  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
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

  const roles = [
    { id: 1, name: 'STUDENT' },
    { id: 2, name: 'ADMIN' },
    { id: 3, name: 'PARENT' },
    { id: 4, name: 'SYSTEM_ADMIN' },
    { id: 5, name: 'EVENT_MANAGER' }
  ];

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

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user: ${user.email}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create') {
      const newUser: User = {
        id: (users.length + 1).toString(),
        email: formData.email,
        password: formData.password || '$2a$12$defaultHashedPassword',
        roleDto: {
          roleId: formData.roleId,
          roleName: roles.find(r => r.id === formData.roleId)?.name || 'STUDENT'
        },
        status: formData.status
      };
      setUsers(prev => [...prev, newUser]);
    } else if (selectedUser) {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? {
              ...user,
              email: formData.email,
              ...(formData.password && { password: formData.password }),
              roleDto: {
                roleId: formData.roleId,
                roleName: roles.find(r => r.id === formData.roleId)?.name || 'STUDENT'
              },
              status: formData.status
            }
          : user
      ));
    }

    setShowModal(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = (user: User) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: !u.status } : u
    ));
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

      <div className="user-management-filters">
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
          {roles.map(role => (
            <option key={role.id} value={role.name}>{role.name}</option>
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
            {filteredUsers.map((user) => (
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
            ))}
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
                  Password {modalMode === 'edit' && '(leave blank to keep current)'}
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={modalMode === 'create' ? 'Enter password' : 'Leave blank to keep current'}
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
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
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
