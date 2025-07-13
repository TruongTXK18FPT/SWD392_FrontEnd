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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch seminars from the API
    fetchApprovedSeminars()
      .then((data) => {
        setSeminars(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert('Không thể tải danh sách hội thảo');
        setLoading(false);
      });
  }, []);

  const filteredSeminars = seminars.filter(
    (seminar) => filter === 'ALL' || seminar.status === filter
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
      default:
        return null;
    }
  };

  const getTabLabel = (key: string) => {
    switch (key) {
      case 'ALL': return 'Tất cả';
      case 'PENDING': return 'Chờ duyệt';
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
      case 'CANCELLED': return 'Đã hủy';
      default: return key;
    }
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
    <div className="seminar-page">
      <h1>Danh sách hội thảo</h1>

      <div className="filter-tabs">
        {['ALL', 'PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((key) => (
          <button
            key={key}
            className={`tab-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key as Seminar['status'] | 'ALL')}
          >
            {getTabLabel(key)}
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

export default SeminarListPage;
