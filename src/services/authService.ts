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

// Refresh token – dùng trong interceptor khi 401
export const refreshAccessToken = async (): Promise<string> => {
  const currentToken = getToken();

  const response = await axios.post(
    "http://localhost:8080/swd391/user/authentication/refresh",
    {
      token: currentToken,
    }
  );

  const { token } = response.data;
  return token;
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

export const resendOtp = async (email: string, purpose: string) => {
  const params = new URLSearchParams();
  params.append("email", email);
  params.append("purpose", purpose);

  return axios.post("http://localhost:8080/api/v1/authenticate/users/resend", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
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
