import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaLink
} from 'react-icons/fa';
import Button from '../components/Button';
import '../styles/SeminarListPage.css';
import { useNavigate } from 'react-router-dom';

// Ảnh local nên import như này nếu dùng Vite/Webpack
import img1 from '../assets/Blue-Yellow-Online-webinar-Poster-2.jpg';
import img2 from '../assets/flyer-entreperneur.jpg';
import img3 from '../assets/online-seminar-publication-poster-free-vector.jpg';

interface Seminar {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
  meetingUrl: string;
  formUrl: string;
  slot: number;
  imageUrl: string;
  startTime: string;
  endTime: string;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED';
}

const SeminarListPage: React.FC = () => {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'ONGOING' | 'ENDED'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    // Tạm thời dùng mock data
    setSeminars([
      {
        id: 1,
        title: 'Khám Phá Nghề Lập Trình',
        description: 'Giới thiệu về ngành IT, backend, frontend, DevOps và thị trường việc làm.',
        duration: 90,
        price: 0,
        slot: 100,
        imageUrl: img1,
        meetingUrl: 'https://meet.google.com/example1',
        formUrl: 'https://forms.gle/example1',
        startTime: '2025-07-10T09:00:00',
        endTime: '2025-07-10T10:30:00',
        status: 'UPCOMING'
      },
      {
        id: 2,
        title: 'Hành Trình Du Học Tự Tin',
        description: 'Hội thảo chia sẻ kinh nghiệm săn học bổng, chuẩn bị hồ sơ du học Mỹ - Úc.',
        duration: 75,
        price: 50000,
        slot: 80,
        imageUrl: img2,
        meetingUrl: 'https://meet.google.com/example2',
        formUrl: 'https://forms.gle/example2',
        startTime: '2025-07-05T19:00:00',
        endTime: '2025-07-05T20:15:00',
        status: 'ONGOING'
      },
      {
        id: 3,
        title: 'Khởi Nghiệp Từ Đam Mê',
        description: 'Giao lưu cùng startup trẻ thành công trong ngành sáng tạo và công nghệ.',
        duration: 60,
        price: 0,
        slot: 50,
        imageUrl: img3,
        meetingUrl: 'https://meet.google.com/example3',
        formUrl: 'https://forms.gle/example3',
        startTime: '2025-06-20T14:00:00',
        endTime: '2025-06-20T15:00:00',
        status: 'ENDED'
      }
    ]);
  }, []);

  const filteredSeminars = seminars.filter(
    (s) => filter === 'ALL' || s.status === filter
  );

  const getStatusBadge = (status: Seminar['status']) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="badge upcoming">Sắp diễn ra</span>;
      case 'ONGOING':
        return <span className="badge ongoing">Đang diễn ra</span>;
      case 'ENDED':
        return <span className="badge ended">Đã kết thúc</span>;
    }
  };

  return (
    <div className="seminar-page">
      <h1>Danh sách hội thảo</h1>

      <div className="filter-tabs">
        {['ALL', 'UPCOMING', 'ONGOING', 'ENDED'].map((key) => (
          <button
            key={key}
            className={`tab-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key as any)}
          >
            {key === 'ALL' ? 'Tất cả' : key === 'UPCOMING' ? 'Sắp diễn ra' : key === 'ONGOING' ? 'Đang diễn ra' : 'Đã kết thúc'}
          </button>
        ))}
      </div>

      <div className="seminar-grid">
        {filteredSeminars.map((seminar) => (
          <div className="seminar-card" key={seminar.id}>
            <img src={seminar.imageUrl} alt={seminar.title} className="seminar-img" />
            <div className="seminar-content">
              <h3>{seminar.title}</h3>
              <p>{seminar.description}</p>
              <div className="seminar-meta">
                <span><FaClock /> {seminar.duration} phút</span>
                <span><FaUsers /> {seminar.slot} slot</span>
                <span><FaCalendarAlt /> {new Date(seminar.startTime).toLocaleString()}</span>
                <span><strong>{seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}</strong></span>
              </div>
              {getStatusBadge(seminar.status)}
              <div className="seminar-actions">
                <a href={seminar.formUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" icon={<FaLink />}>
                    Đăng ký
                  </Button>
                </a>
                {seminar.status !== 'UPCOMING' && (
                  <a href={seminar.meetingUrl} target="_blank" rel="noreferrer">
                    <Button variant="primary" size="sm">
                      Vào phòng
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeminarListPage;
