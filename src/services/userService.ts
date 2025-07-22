import axios from "axios";
import { getToken } from "./localStorageService";

export const getCurrentUser = async () => {
  const token = getToken();
  const response = await axios.get("http://localhost:8072/swd391/user/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.result;
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