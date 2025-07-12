import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import '../styles/SeminarDetailPage.css';

interface SeminarDetail {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  slot: number;
  imageUrl: string;
  meetingUrl: string;
  formUrl: string;
  startTime: string;
  endTime: string;
  status: string;
}

const SeminarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [seminar, setSeminar] = useState<SeminarDetail | null>(null);

  useEffect(() => {
    // Replace with your API
    fetch(`/api/seminars/${id}`)
      .then(res => res.json())
      .then(data => setSeminar(data));
  }, [id]);

  if (!seminar) return <p>Loading...</p>;

  return (
    <div className="seminar-detail-page">
      <h1>{seminar.title}</h1>
      <img src={seminar.imageUrl} alt={seminar.title} className="seminar-detail-img" />
      <p><strong>Mô tả:</strong> {seminar.description}</p>
      <p><strong>Thời gian:</strong> {new Date(seminar.startTime).toLocaleString()} - {new Date(seminar.endTime).toLocaleString()}</p>
      <p><strong>Thời lượng:</strong> {seminar.duration} phút</p>
      <p><strong>Giá vé:</strong> {seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}</p>
      <p><strong>Slots:</strong> {seminar.slot}</p>
      <p><strong>Trạng thái:</strong> {seminar.status}</p>
      <a href={seminar.formUrl} target="_blank" rel="noreferrer">Đăng ký</a>
      {seminar.status !== 'UPCOMING' && (
        <a href={seminar.meetingUrl} target="_blank" rel="noreferrer">Vào phòng</a>
      )}
    </div>
  );
};

export default SeminarDetailPage;
