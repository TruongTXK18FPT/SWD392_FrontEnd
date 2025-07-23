import axios from "axios";
import { setToken, removeToken, getToken } from "./localStorageService";
import { useNavigate } from 'react-router-dom';

// Login
export const login = async (email: string, password: string): Promise<void> => {
  const response = await axios.post(
    "http://localhost:8072/swd391/user/authentication/login",
    {
      email,
      password,
    }
  );

  const token  = response.data.result.token;
  setToken(token);
};

// Logout – xóa token ở localStorage
export const logOut = async () => {
  const currentToken = getToken();

  try {
    await axios.post(
        "http://localhost:8072/swd391/user/authentication/logout",
        { token: currentToken },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
    );
  } catch (error) {
    console.error("Logout failed:", error);
  }

  removeToken();
};


// (Tùy chọn) Gọi API test token đang dùng
export const getProfile = async (userId: number) => {
  const token = getToken();
  try {
    const response = await axios.get(
        `http://localhost:8072/swd391/user/api/profiles/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        code: 404,
        message: "Profile not found",
        result: {
          userId: userId,
          fullName: "New User",
        }
      };
    }
    throw error;
  }
};

export interface RegisterRequestDto {
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
}

export const registerUser = async (user: RegisterRequestDto): Promise<any> => {
  const response = await axios.post(
    "http://localhost:8072/swd391/user/authentication/register",
    {
      email: user.email,
      password: user.password,
      confirmPassword: user.confirmPassword,
      roleId: user.roleId
    }
  );
  return response.data;
};

// 🎯 Gửi OTP chỉ với email
export const sendResetOtpNew = async (email: string) => {
  const params = new URLSearchParams();
  params.append("email", email);

  return axios.post("http://localhost:8072/swd391/user/otp/send", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

// 🎯 Xác minh OTP
export const verifyResetOtpNew = async (email: string, otp: string) => {
  return axios.post(
    `http://localhost:8072/swd391/user/otp/verify?email=${email}&otp=${otp}`
  );
};

// 🎯 Reset mật khẩu mới
export const resetPasswordNewApi = async (
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  return axios.post(`http://localhost:8072/swd391/user/otp/reset-password?email=${encodeURIComponent(email)}`, {
    newPassword,
    confirmPassword,
  });
};

// 🎯 Refresh access token
export const refreshAccessToken = async (): Promise<string> => {
  const currentToken = getToken();
  
  if (!currentToken) {
    throw new Error('No token available for refresh');
  }

  try {
    const response = await axios.post(
      "http://localhost:8072/swd391/user/authentication/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );

    const newToken = response.data.result.token;
    setToken(newToken);
    return newToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    removeToken(); // Remove invalid token
    throw error;
  }
};
