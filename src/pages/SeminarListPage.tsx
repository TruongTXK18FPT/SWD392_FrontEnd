import React, { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaLink
} from 'react-icons/fa';
import '../styles/SeminarListPage.css';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      // Tạm thời dùng mock data
      setSeminars([
        {
          id: 1,
          title: 'Khám Phá Nghề Lập Trình',
          description: 'Giới thiệu về ngành IT, backend, frontend, DevOps và thị trường việc làm. Tìm hiểu về các công nghệ mới nhất và cơ hội nghề nghiệp trong lĩnh vực công nghệ thông tin.',
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
          description: 'Hội thảo chia sẻ kinh nghiệm săn học bổng, chuẩn bị hồ sơ du học Mỹ - Úc. Các chuyên gia tư vấn du học sẽ chia sẻ những bí quyết thành công.',
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
          description: 'Giao lưu cùng startup trẻ thành công trong ngành sáng tạo và công nghệ. Học hỏi kinh nghiệm từ những founder đã thành công trong việc xây dựng doanh nghiệp.',
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
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredSeminars = seminars.filter(
    (s) => filter === 'ALL' || s.status === filter
  );

  const getStatusBadge = (status: Seminar['status']) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="seminar-status-badge upcoming">Sắp diễn ra</span>;
      case 'ONGOING':
        return <span className="seminar-status-badge ongoing">Đang diễn ra</span>;
      case 'ENDED':
        return <span className="seminar-status-badge ended">Đã kết thúc</span>;
    }
  };

  const getTabLabel = (key: string) => {
    switch (key) {
      case 'ALL': return 'Tất cả';
      case 'UPCOMING': return 'Sắp diễn ra';
      case 'ONGOING': return 'Đang diễn ra';
      case 'ENDED': return 'Đã kết thúc';
      default: return key;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="seminar-list-page">
        <div className="seminar-list-container">
          <div className="seminar-loading">
            <div>Đang tải danh sách hội thảo...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seminar-list-page">
      <div className="seminar-list-container">
        <header className="seminar-list-header">
          <h1 className="seminar-list-title">Hội Thảo Công Nghệ</h1>
          <p className="seminar-list-subtitle">
            Khám phá những xu hướng mới nhất trong công nghệ và phát triển kỹ năng chuyên môn cùng các chuyên gia hàng đầu
          </p>
        </header>

        <div className="seminar-filter-tabs">
          {['ALL', 'UPCOMING', 'ONGOING', 'ENDED'].map((key) => (
            <button
              key={key}
              className={`seminar-tab-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key as any)}
            >
              {getTabLabel(key)}
            </button>
          ))}
        </div>

        {filteredSeminars.length === 0 ? (
          <div className="seminar-empty">
            <h3 className="seminar-empty-title">Không có hội thảo nào</h3>
            <p className="seminar-empty-message">
              Hiện tại không có hội thảo nào phù hợp với bộ lọc đã chọn. Hãy thử chọn bộ lọc khác hoặc quay lại sau.
            </p>
          </div>
        ) : (
          <div className="seminar-cards-grid">
            {filteredSeminars.map((seminar, index) => {
              const dateTime = formatDateTime(seminar.startTime);
              return (
                <div className="seminar-card seminar-card-animated" key={seminar.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="seminar-card-image-wrapper">
                    <img src={seminar.imageUrl} alt={seminar.title} className="seminar-card-image" />
                    <div className="seminar-card-image-overlay">
                      <button className="seminar-card-preview-btn">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  
                  <div className="seminar-card-content">
                    <h3 className="seminar-card-title">{seminar.title}</h3>
                    <p className="seminar-card-description">{seminar.description}</p>
                    
                    <div className="seminar-card-meta">
                      <div className="seminar-meta-item">
                        <FaClock />
                        <span>{seminar.duration} phút</span>
                      </div>
                      <div className="seminar-meta-item">
                        <FaUsers />
                        <span>{seminar.slot} slots</span>
                      </div>
                      <div className="seminar-meta-item">
                        <FaCalendarAlt />
                        <span>{dateTime.date}</span>
                      </div>
                      <div className="seminar-meta-item">
                        <span>{dateTime.time}</span>
                      </div>
                      <div className="seminar-card-price">
                        {seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}
                      </div>
                    </div>
                    
                    {getStatusBadge(seminar.status)}
                    
                    <div className="seminar-card-actions">
                      <a href={seminar.formUrl} target="_blank" rel="noreferrer" className="seminar-action-link">
                        <button className="seminar-action-btn outline">
                          <FaLink /> Đăng ký
                        </button>
                      </a>
                      {seminar.status !== 'UPCOMING' && (
                        <a href={seminar.meetingUrl} target="_blank" rel="noreferrer" className="seminar-action-link">
                          <button className="seminar-action-btn primary">
                            Vào phòng
                          </button>
                        </a>
                      )}
                      {seminar.status === 'UPCOMING' && (
                        <button className="seminar-action-btn disabled" disabled>
                          Chưa mở
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeminarListPage;
