import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Seminar } from '../types/Seminar';
import { fetchSeminarDetails } from '../api/SeminarApi';
import '../styles/SeminarDetailPage.css'; // nếu có

const SeminarDetailPage: React.FC = () => {
  const { seminarId } = useParams<{ seminarId: string }>();
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!seminarId) {
    console.warn('seminarId is undefined');
    return;
  }

  setLoading(true);
  fetchSeminarDetails(seminarId)
    .then((data) => {
      console.log('Seminar data:', data); // 👈 thêm dòng này
      setSeminar(data);
    })
    .catch((err) => {
      console.error(err);
      alert('Không thể tải chi tiết hội thảo');
    })
    .finally(() => setLoading(false));
}, [seminarId]);


  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!seminar) return <p>Không tìm thấy hội thảo</p>;

  return (
    <div className="seminar-detail-page">
      <h1>{seminar.title}</h1>
      <img src={seminar.imageUrl} alt={seminar.title} className="seminar-detail-img" />
      <p><strong>Mô tả:</strong> {seminar.description}</p>
      <p><strong>Thời lượng:</strong> {seminar.duration} phút</p>
      <p><strong>Giá:</strong> {seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}</p>
      <p><strong>Slot:</strong> {seminar.slot}</p>
      <p><strong>Meeting URL:</strong> <a href={seminar.meetingUrl} target="_blank" rel="noreferrer">{seminar.meetingUrl}</a></p>
      <p><strong>Form đăng ký:</strong> <a href={seminar.formUrl} target="_blank" rel="noreferrer">{seminar.formUrl}</a></p>
      <p><strong>Trạng thái:</strong> {seminar.status}</p>
    </div>
  );
};

export default SeminarDetailPage;
