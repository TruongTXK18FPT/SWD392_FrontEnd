import { Seminar } from '../types/Seminar';

const BASE_URL = 'http://localhost:8082/seminar/api';

export const fetchApprovedSeminars = async (): Promise<Seminar[]> => {
  const res = await fetch(`${BASE_URL}/seminars/approved-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Authorization nếu cần:
      // 'Authorization': `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch approved seminars');
  }

  return res.json();
};

/**
 * Lấy chi tiết seminar theo ID
 * @param seminarId ID seminar
 */
export const fetchSeminarDetails = async (seminarId: string): Promise<Seminar> => {
  const res = await fetch(`${BASE_URL}/seminars/${seminarId}/seminar-details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch seminar details for ID ${seminarId}`);
  }

  const data = await res.json();

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    duration: data.duration,
    price: data.price,
    slot: data.slot,
    imageUrl: data.image_url,
    meetingUrl: data.meeting_url,
    formUrl: data.form_url,
    status: data.status,
    statusApprove: data.status_approve,
    createBy: data.create_by,
  };
};
