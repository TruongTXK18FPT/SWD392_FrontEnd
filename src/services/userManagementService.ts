import axios from 'axios';
import axiosInstance from '../services/axiosInstance';

export interface RoleDto {
  roleId: number;
  roleName: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  roleDto: RoleDto;
  status: boolean;
}

export interface CreateUserResponse {
  id: number; // Changed from string to number to match your API
  email: string;
  role: string;
  status: boolean;
  createdAt: string;
}

export interface User {
  id: number; // Changed from string to number to match your API
  email: string;
  password?: string;
  roleDto: RoleDto;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  roleDto?: RoleDto;
  status?: boolean;
}

export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    // Debug: Log the request data
    console.log('Creating user with data:', userData);
    console.log('Auth token:', localStorage.getItem('token'));
    
    // Use the correct API endpoint for creating users
    const response = await axiosInstance.post('http://localhost:8072/swd391/user/api/users', userData);
    console.log('Create user response:', response.data);
    return response.data.result || response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log the full error for debugging
      console.error('Create user error:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      console.error('Request URL:', error.config?.url);
      
      // Provide more specific error messages
      if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to create users.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint not found. Please check the server configuration.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid user data provided.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to create user');
      }
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log('Fetching all users...');
    const response = await axiosInstance.get('http://localhost:8072/swd391/user/api/users');
    console.log('Get all users response:', response.data);
    
    const users = response.data.result || response.data;
    console.log('Extracted users:', users);
    
    // Log user details to verify ID and structure
    if (Array.isArray(users)) {
      users.forEach((user, index) => {
        console.log(`User ${index}:`, {
          id: user.id,
          email: user.email,
          roleDto: user.roleDto,
          roleName: user.roleDto?.roleName,
          status: user.status
        });
        if (!user.id) {
          console.warn(`User ${index} is missing ID field:`, user);
        }
        if (!user.roleDto || !user.roleDto.roleName) {
          console.warn(`User ${index} is missing roleDto:`, user);
        }
      });
    }
    
    return users;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Get all users error:', error.response?.data);
      if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to view users.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Update user
export const updateUser = async (id: number, userData: UpdateUserRequest): Promise<User> => {
  try {
    console.log('Updating user with id:', id, 'data:', userData);
    console.log('Auth token:', localStorage.getItem('token'));
    
    const response = await axiosInstance.put(`http://localhost:8072/swd391/user/api/users/${id}`, userData);
    console.log('Update user response:', response.data);
    return response.data.result || response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Update user error:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request URL:', error.config?.url);
      
      if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to update users.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid user data provided.');
      }
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  try {
    console.log('Deleting user with id:', id);
    console.log('Auth token:', localStorage.getItem('token'));
    
    const response = await axiosInstance.delete(`http://localhost:8072/swd391/user/api/users/${id}`);
    console.log('Delete user response:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Delete user error:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request URL:', error.config?.url);
      
      if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to delete users.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid request to delete user.');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getRoles = async (): Promise<RoleDto[]> => {
  try {
    // Try to get roles from API first
    try {
      const response = await axiosInstance.get('http://localhost:8072/swd391/user/api/roles');
      return response.data.result || response.data;
    } catch (apiError) {
      console.warn('Failed to fetch roles from API, using mock data:', apiError);
      // Fall back to mock data if API call fails
      return [
        { roleId: 1, roleName: 'STUDENT' },
        { roleId: 2, roleName: 'PARENT' },
        { roleId: 3, roleName: 'ADMIN' },
        { roleId: 4, roleName: 'EVENT_MANAGER' }
      ];
    }
  } catch (error) {
    throw new Error('Failed to fetch roles');
  }
};
