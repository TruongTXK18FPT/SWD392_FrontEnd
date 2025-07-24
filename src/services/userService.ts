import axios from "axios";
import { getToken } from "./localStorageService";

export const getCurrentUser = async () => {
  const token = getToken();
  const response = await axios.get("http://localhost:8072/swd391/user/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  const user = response.data.result;
  console.log('getCurrentUser API response:', user);
  
  // Extract role from roleDto.roleName and normalize it
  const role = user?.roleDto?.roleName || user?.role;
  console.log('Extracted role:', role);
  
  // Ensure ID is a number
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  console.log('User ID:', userId, 'type:', typeof userId);
  
  // Return user with normalized role field and numeric ID
  return {
    ...user,
    id: userId,
    role: role
  };
};

// Define interface for profile data, excluding provinceCode and districtCode
export interface UserProfileUpdateData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  birthDay?: string | null;
  gender?: string | null;
  school?: string | null;
}

// Update profile function, using the correct endpoint
export const updateProfile = async (userId: number, data: UserProfileUpdateData): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found.");
  }

  const response = await axios.put(
      `http://localhost:8072/swd391/user/api/profiles/${userId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
  );

  // Return updated profile data from the "result" field
  return response.data.result;
};