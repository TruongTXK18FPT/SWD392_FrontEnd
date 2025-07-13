import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/SeminarDetailPage.css';


interface Seminar {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  slot: number;
  meetingUrl: string;
  formUrl: string;
  imageUrl: string;
  startTime: string;
  endTime: string;
  status: string;
}

const SeminarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [seminar, setSeminar] = useState<Seminar | null>(null);

  useEffect(() => {
    // TODO: Replace with real API call
    const mock = [
      {
        id: 1,
        title: 'Khám Phá Nghề Lập Trình',
        description: 'Giới thiệu về ngành IT, backend, frontend...',
        duration: 90,
        price: 0,
        slot: 100,
        meetingUrl: 'https://meet.google.com/example1',
        formUrl: 'https://forms.gle/example1',
        imageUrl: '/assets/Blue-Yellow-Online-webinar-Poster-2.jpg',
        startTime: '2025-07-10T09:00:00',
        endTime: '2025-07-10T10:30:00',
        status: 'UPCOMING',
      }
    ];
    const found = mock.find((s) => s.id === Number(id));
    setSeminar(found || null);
  }, [id]);

  if (!seminar) return <p style={{ padding: '2rem' }}>Không tìm thấy hội thảo.</p>;

  return (
    <div className="seminar-detail">
      <h1>{seminar.title}</h1>

      <img
        src={seminar.imageUrl}
        alt={seminar.title}
        className="seminar-img"
      />

      <div className="seminar-meta">
        <span><strong>Thời gian:</strong> {new Date(seminar.startTime).toLocaleString()} - {new Date(seminar.endTime).toLocaleString()}</span>
        <span><strong>Thời lượng:</strong> {seminar.duration} phút</span>
        <span><strong>Giá vé:</strong> {seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}</span>
        <span><strong>Số lượng:</strong> {seminar.slot} slot</span>
      </div>

      <div className="seminar-links">
        <a href={seminar.formUrl} target="_blank" rel="noreferrer">Đăng ký</a>
        <a href={seminar.meetingUrl} target="_blank" rel="noreferrer">Vào phòng họp</a>
      </div>

      <div className="seminar-description">
        <strong>Mô tả:</strong>
        <p>{seminar.description}</p>
      </div>
    </div>
  );
};

export default SeminarDetailPage;
