import React, { useEffect, useState } from 'react';
import {
  FaClock,
  FaUsers,
  FaLink
} from 'react-icons/fa';
import Button from '../components/Button';
import '../styles/SeminarListPage.css';
import { useNavigate } from 'react-router-dom';
import { Seminar } from '../types/Seminar';
import { fetchApprovedSeminars } from '../api/SeminarApi';

const SeminarListPage: React.FC = () => {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedSeminars()
      .then((data) => setSeminars(data))
      .catch((err) => {
        console.error(err);
        alert('Không thể tải danh sách hội thảo');
      });
  }, []);

  const filteredSeminars = seminars.filter(
    (s) => filter === 'ALL' || s.status === filter
  );

  const getStatusBadge = (status: Seminar['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge pending">Chờ diễn ra</span>;
      case 'ONGOING':
        return <span className="badge ongoing">Đang diễn ra</span>;
      case 'COMPLETED':
        return <span className="badge ended">Đã kết thúc</span>;
      case 'CANCELLED':
        return <span className="badge cancelled">Đã hủy</span>;
    }
  };

  return (
    <div className="seminar-page">
      <h1>Danh sách hội thảo</h1>

      <div className="filter-tabs">
        {['ALL', 'PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((key) => (
          <button
            key={key}
            className={`tab-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key as Seminar['status'] | 'ALL')}
          >
            {{
              ALL: 'Tất cả',
              PENDING: 'Chờ duyệt',
              ONGOING: 'Đang diễn ra',
              COMPLETED: 'Đã kết thúc',
              CANCELLED: 'Đã hủy'
            }[key as keyof typeof SeminarStatusText]}
          </button>
        ))}
      </div>

      <div className="seminar-grid">
        {filteredSeminars.map((seminar) => (
          <div
            className="seminar-card"
            key={seminar.id}
            onClick={() => navigate(`/seminars/${seminar.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <img src={seminar.imageUrl} alt={seminar.title} className="seminar-img" />
            <div className="seminar-content">
              <h3>{seminar.title}</h3>
              <p>{seminar.description}</p>
              <div className="seminar-meta">
                <span><FaClock /> {seminar.duration} phút</span>
                <span><FaUsers /> {seminar.slot} slot</span>
                <span><strong>{seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}</strong></span>
              </div>
              {getStatusBadge(seminar.status)}
              <div className="seminar-actions">
                <a href={seminar.formUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" icon={<FaLink />}>
                    Đăng ký
                  </Button>
                </a>
                {seminar.status !== 'PENDING' && seminar.meetingUrl && (
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

// Optional
const SeminarStatusText = {
  ALL: 'Tất cả',
  PENDING: 'Chờ duyệt',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

export default SeminarListPage;