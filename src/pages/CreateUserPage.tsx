import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserCheck, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { createUser, getRoles, CreateUserRequest, RoleDto } from '../services/userManagementService';
import '../styles/CreateUserPage.css';

type AlertType = 'success' | 'info' | 'warning' | 'error';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  status: boolean;
}

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    roleId: 1,
    status: true
  });
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [alerts, setAlerts] = useState<Array<{ id: number; type: AlertType; message: string }>>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        showAlert('error', 'Failed to load roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const showAlert = (type: AlertType, message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.roleId) {
      newErrors.roleId = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'roleId' ? parseInt(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      const selectedRole = roles.find(role => role.roleId === formData.roleId);
      if (!selectedRole) {
        throw new Error('Invalid role selected');
      }

      const userData: CreateUserRequest = {
        email: formData.email,
        password: formData.password,
        roleDto: selectedRole,
        status: formData.status
      };

      await createUser(userData);
      showAlert('success', 'User created successfully!');
      
      // Navigate back to user management after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      showAlert('error', error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  if (loadingRoles) {
    return <LoadingSpinner size="medium" message="Loading roles..." />;
  }

  return (
    <div className="create-user-page">
      <div className="create-user-container">
        <div className="create-user-header">
          <Button
            variant="outline"
            size="sm"
            icon={<FaArrowLeft />}
            onClick={handleCancel}
            className="back-button"
          >
            Back
          </Button>
          <h1>Create New User</h1>
          <p>Add a new user to the system</p>
        </div>

        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaUser className="field-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter user's email address"
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="field-icon" />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FaLock className="field-icon" />
              Confirm Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="roleId">
              <FaUserCheck className="field-icon" />
              Role
            </label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleInputChange}
              className={errors.roleId ? 'error' : ''}
              required
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
            </select>
            {errors.roleId && <span className="error-message">{errors.roleId}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="status" className="checkbox-label">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Active User</span>
            </label>
            <p className="checkbox-help">
              Active users can log in and use the system. Inactive users are disabled.
            </p>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>

      {/* Alerts */}
      <div className="alerts-container">
        {alerts.map(({ id, type, message }) => (
          <Alert
            key={id}
            type={type}
            message={message}
            onClose={() => setAlerts(prev => prev.filter(alert => alert.id !== id))}
          />
        ))}
      </div>
    </div>
  );
};

export default CreateUserPage;
