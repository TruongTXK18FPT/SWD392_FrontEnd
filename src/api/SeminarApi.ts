const BASE_URL = 'http://localhost:8082/seminar/api';

export const fetchApprovedSeminars = async () => {
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