import instance from "./axiosInstance";
import { getToken } from "./localStorageService";

export interface PaymentInitiationResponse {
  orderCode: string;
  checkoutUrl: string;
  message: string;
}

export const upgradeToPremium = async (userId: number): Promise<PaymentInitiationResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Calling upgrade endpoint for user:', userId);
    
    const response = await instance.post(
      `/swd391/user/api/package/upgrade/${userId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    
    console.log('Upgrade response status:', response.status);
    console.log('Upgrade response data:', response.data);
    
    // Backend returns ResponseDTO structure, so we need to access response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error: any) {
    console.error('Error upgrading to premium:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response.status === 403) {
        throw new Error('Bạn không có quyền thực hiện thao tác này.');
      } else if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
    }
    
    throw error;
  }
};


