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

export const createSeminar = async (seminarData: CreateSeminarRequest, userId: number): Promise<Seminar> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-User-Id': userId.toString(),
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('🚀 Sending create seminar request:', seminarData);
  console.log('📅 StartingTime:', seminarData.startingTime);
  console.log('📅 EndingTime:', seminarData.endingTime);
  console.log('🔑 Authorization token present:', !!token);
  console.log('👤 User ID:', userId);
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

// Fetch seminars created by a specific event manager
export const fetchEventManagerSeminars = async (eventManagerId: number): Promise<Seminar[]> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-User-Id': eventManagerId.toString(),
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('🔄 Fetching seminars for event manager:', {
    eventManagerId,
    url: `${BASE_URL}/seminars/event-manager-seminars-list`,
    headers
  });

  const res = await fetch(`${BASE_URL}/seminars/event-manager-seminars-list`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Fetch Event Manager Seminars API Error:', errorText);
    console.error('❌ Response status:', res.status);
    console.error('❌ Request URL:', `${BASE_URL}/seminars/event-manager-seminars-list`);
    throw new Error('API lỗi khi tải danh sách hội thảo của event manager');
  }

  const data = await res.json();
  console.log('✅ Event manager seminars fetched:', {
    count: data.length,
    seminars: data
  });
  return data;
};

export const updateSeminarStatus = async (seminarId: number, status: string, eventManagerId: number): Promise<Seminar> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-User-Id': eventManagerId.toString(),
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('🚀 Updating seminar status:', {
    seminarId,
    status,
    eventManagerId,
    url: `${BASE_URL}/seminars/${seminarId}/status`,
    headers,
    requestBody: { status }
  });

  // Try both request formats to see which one the backend expects
  console.log('🔄 Attempting status update with request body...');
  
  const res = await fetch(`${BASE_URL}/seminars/${seminarId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });

  console.log('📡 Update Status API Response:', {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    url: `${BASE_URL}/seminars/${seminarId}/status`
  });

  // If the first approach fails, let's try with query parameter approach
  if (!res.ok) {
    console.log('⚠️ Request body approach failed, trying query parameter approach...');
    
    const queryParamRes = await fetch(`${BASE_URL}/seminars/${seminarId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': eventManagerId.toString(),
        ...(getToken() && { Authorization: `Bearer ${getToken()}` })
      },
    });

    console.log('📡 Query Param API Response:', {
      status: queryParamRes.status,
      statusText: queryParamRes.statusText,
      ok: queryParamRes.ok,
      url: `${BASE_URL}/seminars/${seminarId}/status?status=${status}`
    });

    if (queryParamRes.ok) {
      console.log('✅ Query parameter approach worked!');
      const data = await queryParamRes.json();
      console.log('✅ Status update successful:', data);
      return data;
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Update Seminar Status API Error:', errorText);
    console.error('❌ Request details:', {
      url: `${BASE_URL}/seminars/${seminarId}/status`,
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
      seminarId,
      status,
      eventManagerId
    });
    
    // Try to parse error response for more details
    try {
      const errorData = JSON.parse(errorText);
      console.error('❌ Parsed error details:', errorData);
    } catch (e) {
      console.error('❌ Could not parse error response as JSON');
    }
    
    throw new Error('API lỗi khi cập nhật trạng thái hội thảo');
  }

  const data = await res.json();
  return data;
};

// Fetch pending seminars for admin approval
export const fetchPendingSeminars = async (): Promise<Seminar[]> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/seminars/pending-list`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Fetch Pending Seminars API Error:', errorText);
    throw new Error('API lỗi khi tải danh sách hội thảo chờ duyệt');
  }

  const data = await res.json();
  return data;
};

// Approve or reject seminar
export const updateSeminarApprovalStatus = async (
  seminarId: number, 
  status: 'APPROVED' | 'REJECTED', 
  adminId: number
): Promise<Seminar> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-User-Id': adminId.toString(),
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('🚀 Sending approval request:', {
    seminarId,
    status,
    adminId,
    url: `${BASE_URL}/seminars/${seminarId}/status-approve?status=${status}`,
    headers
  });

  const res = await fetch(`${BASE_URL}/seminars/${seminarId}/status-approve?status=${status}`, {
    method: 'PUT',
    headers,
  });

  console.log('📡 API Response:', {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Update Seminar Approval Status API Error:', errorText);
    console.error('❌ Response status:', res.status);
    console.error('❌ Request URL:', `${BASE_URL}/seminars/${seminarId}/status-approve?status=${status}`);
    
    // Try to parse error response for more details
    try {
      const errorData = JSON.parse(errorText);
      console.error('❌ Parsed error details:', errorData);
    } catch (e) {
      console.error('❌ Could not parse error response as JSON');
    }
    
    throw new Error('API lỗi khi duyệt hội thảo');
  }

  const data = await res.json();
  console.log('✅ Approval successful:', data);
  return data;
};

// Update seminar for pending seminars
export const updateSeminar = async (
  seminarId: number, 
  seminarData: CreateSeminarRequest, 
  eventManagerId: number
): Promise<Seminar> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-User-Id': eventManagerId.toString(),
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('🚀 Updating seminar:', {
    seminarId,
    seminarData,
    eventManagerId,
    url: `${BASE_URL}/seminars/${seminarId}/update-seminar`,
    headers
  });

  const res = await fetch(`${BASE_URL}/seminars/${seminarId}/update-seminar`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(seminarData),
  });

  console.log('📡 Update Seminar API Response:', {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    url: `${BASE_URL}/seminars/${seminarId}/update-seminar`
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Update Seminar API Error:', errorText);
    console.error('❌ Request details:', {
      url: `${BASE_URL}/seminars/${seminarId}/update-seminar`,
      method: 'PUT',
      headers,
      body: JSON.stringify(seminarData),
      seminarId,
      eventManagerId
    });
    
    // Try to parse error response for more details
    try {
      const errorData = JSON.parse(errorText);
      console.error('❌ Parsed error:', errorData);
      throw new Error(errorData.message || 'API lỗi khi cập nhật hội thảo');
    } catch (e) {
      console.error('❌ Could not parse error response');
      throw new Error('API lỗi khi cập nhật hội thảo');
    }
  }

  const data = await res.json();
  console.log('✅ Seminar updated successfully:', data);
  return data;
};

// Delete seminar (only for non-approved seminars)
export const deleteSeminar = async (
  seminarId: number, 
  eventManagerId: number
): Promise<void> => {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-User-Id': eventManagerId.toString(),
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log('🚀 Deleting seminar:', {
    seminarId,
    eventManagerId,
    url: `${BASE_URL}/seminars/${seminarId}/delete`,
    headers
  });

  const res = await fetch(`${BASE_URL}/seminars/${seminarId}/delete`, {
    method: 'DELETE',
    headers,
  });

  console.log('📡 Delete Seminar API Response:', {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    url: `${BASE_URL}/seminars/${seminarId}/delete`
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Delete Seminar API Error:', errorText);
    console.error('❌ Request details:', {
      url: `${BASE_URL}/seminars/${seminarId}/delete`,
      method: 'DELETE',
      headers,
      seminarId,
      eventManagerId
    });
    
    // Try to parse error response for more details
    try {
      const errorData = JSON.parse(errorText);
      console.error('❌ Parsed error:', errorData);
      throw new Error(errorData.message || 'API lỗi khi xóa hội thảo');
    } catch (e) {
      console.error('❌ Could not parse error response');
      throw new Error('API lỗi khi xóa hội thảo');
    }
  }

  console.log('✅ Seminar deleted successfully');
};
