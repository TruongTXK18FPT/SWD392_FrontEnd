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
  id: string;
  email: string;
  role: string;
  status: boolean;
  createdAt: string;
}

export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    // Debug: Log the request data
    console.log('Creating user with data:', userData);
    console.log('Auth token:', localStorage.getItem('token'));
    
    // Use the correct API endpoint for creating users
    const response = await axiosInstance.post('http://localhost:8080/user/api/users', userData);
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

export const getRoles = async (): Promise<RoleDto[]> => {
  try {
    // Try to get roles from API first
    try {
      const response = await axiosInstance.get('/swd391/user/api/roles');
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
