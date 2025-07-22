import { Seminar } from '../types/Seminar';
import { getToken } from '../services/localStorageService';

const BASE_URL = 'http://localhost:8082/seminar/api';

// Interface for place order response
export interface PlaceOrderResponse {
  sagaId: number;
  orderCode: string;
  checkoutUrl: string;
  status: string;
  message: string;
}

// Interface for user ticket
export interface UserTicket {
  id: number;
  seminarId: number;
  userId: number;
  description: string;
  startingTime: string;
  endingTime: string;
  bookingTime: string;
  status: boolean;
}

// Interface for creating seminar
export interface CreateSeminarRequest {
  title: string;
  description: string;
  duration: number;
  price: number;
  meetingUrl: string;
  formUrl: string;
  slot: number;
  imageUrl: string;
  startingTime: string; // Format: "yyyy-MM-dd HH:mm"
  endingTime: string; // Format: "yyyy-MM-dd HH:mm"
}

export const fetchApprovedSeminars = async (): Promise<Seminar[]> => {
  const res = await fetch(`${BASE_URL}/seminars/approved-list`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch approved seminars');
  }

  return res.json();
};

export const fetchSeminarDetails = async (seminarId: string): Promise<Seminar> => {
  const res = await fetch(`${BASE_URL}/seminars/${seminarId}/seminar-details`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error(`Failed to fetch seminar details for ID ${seminarId}`);

  const data = await res.json();

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    duration: data.duration,
    price: data.price,
    slot: data.slot,
    imageUrl: data.imageUrl,
    meetingUrl: data.meetingUrl,
    formUrl: data.formUrl,
    status: data.status,
    statusApprove: data.statusApprove,
    createBy: data.createBy,
    startingTime: data.startingTime,
    endingTime: data.endingTime
  };
};

export const placeOrder = async (
  seminarId: number,
  price: number,
  userId: number,
  description: string,
  returnUrl?: string,
  cancelUrl?: string
): Promise<PlaceOrderResponse> => {
  const requestBody: any = {
    seminarId,
    description,
    price,
    userId,
  };

  // Add return URLs if provided
  if (returnUrl) {
    requestBody.returnUrl = returnUrl;
  }
  if (cancelUrl) {
    requestBody.cancelUrl = cancelUrl;
  }

  const res = await fetch(`${BASE_URL}/place-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId.toString(),
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ API Error:', errorText);
    throw new Error('API lỗi khi đặt vé');
  }

  const data = await res.json();
  return data;
};

export const fetchMyTickets = async (userId: number): Promise<UserTicket[]> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-User-Id': userId.toString(),
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/tickets/my-tickets`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ API Error:', errorText);
    console.error('❌ Response status:', res.status);
    console.error('❌ Response headers:', res.headers);
    throw new Error('API lỗi khi tải danh sách vé');
  }

  const data = await res.json();
  return data;
};

export const createSeminar = async (seminarData: CreateSeminarRequest): Promise<Seminar> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('🚀 Sending create seminar request:', seminarData);
  console.log('📅 StartingTime:', seminarData.startingTime);
  console.log('📅 EndingTime:', seminarData.endingTime);
  console.log('🔑 Authorization token present:', !!token);
  console.log('📋 All request fields:');
  Object.entries(seminarData).forEach(([key, value]) => {
    console.log(`  ${key}: "${value}" (${typeof value})`);
  });

  const res = await fetch(`${BASE_URL}/seminars/create-seminar`, {
    method: 'POST',
    headers,
    body: JSON.stringify(seminarData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Create Seminar API Error:', errorText);
    console.error('❌ Response status:', res.status);
    console.error('❌ Request body that was sent:', JSON.stringify(seminarData, null, 2));
    
    // Try to parse error response for more details
    try {
      const errorData = JSON.parse(errorText);
      console.error('❌ Parsed error details:', errorData);
    } catch (e) {
      console.error('❌ Could not parse error response as JSON');
    }
    
    throw new Error('API lỗi khi tạo hội thảo');
  }

  const data = await res.json();
  return data;
};

export const fetchAllSeminars = async (): Promise<Seminar[]> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/seminars/all`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Fetch All Seminars API Error:', errorText);
    throw new Error('API lỗi khi tải danh sách hội thảo');
  }

  const data = await res.json();
  return data;
};

export const updateSeminarStatus = async (seminarId: number, status: string): Promise<Seminar> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/seminars/${seminarId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Update Seminar Status API Error:', errorText);
    throw new Error('API lỗi khi cập nhật trạng thái hội thảo');
  }

  const data = await res.json();
  return data;
};
