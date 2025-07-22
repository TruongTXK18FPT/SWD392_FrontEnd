import React, { useEffect, useState } from 'react';
import {
  FaClock,
  FaUsers,
  FaLink,
  FaTicketAlt
} from 'react-icons/fa';
import Button from '../components/Button';
import Alert from '../components/Alert';
import '../styles/SeminarListPage.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Seminar } from '../types/Seminar';
import { fetchApprovedSeminars, fetchMyTickets, UserTicket } from '../api/SeminarApi';
import { getCurrentUser } from '../services/userService';

const SeminarListPage: React.FC = () => {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ONGOING' | 'COMPLETED'>('ALL');
  const [showTickets, setShowTickets] = useState(false);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    message: string;
    description?: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  useEffect(() => {
    // Check for payment status in URL parameters
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      setAlert({
        show: true,
        type: 'success',
        message: 'Thanh toán thành công!',
        description: 'Vé hội thảo của bạn đã được đặt thành công. Bạn sẽ nhận được email xác nhận sớm.',
      });
      
      // Clear the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment');
      window.history.replaceState({}, '', newUrl.toString());
      
    } else if (paymentStatus === 'cancelled') {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Thanh toán đã bị hủy',
        description: 'Bạn có thể thử đặt vé lại cho hội thảo khác.',
      });
      
      // Clear the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch current user
    getCurrentUser()
      .then((userData) => {
        setCurrentUser(userData);
      })
      .catch((err) => {
        console.error('Failed to get current user:', err);
      });
  }, []);

  useEffect(() => {
    // Fetch seminars from the API
    fetchApprovedSeminars()
      .then((data) => {
        setSeminars(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setAlert({
          show: true,
          type: 'error',
          message: 'Không thể tải danh sách hội thảo',
          description: 'Vui lòng thử lại sau',
        });
        setLoading(false);
      });
  }, []);

  const filteredSeminars = seminars.filter(
    (seminar) => filter === 'ALL' || seminar.status === filter
  );

  const handleFetchTickets = async () => {
    if (!currentUser) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Vui lòng đăng nhập',
        description: 'Bạn cần đăng nhập để xem danh sách vé đã mua.',
      });
      return;
    }

    setTicketsLoading(true);
    setShowTickets(true);
    
    try {
      const userTickets = await fetchMyTickets(currentUser.id);
      setTickets(userTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể tải danh sách vé',
        description: 'Vui lòng thử lại sau.',
      });
    } finally {
      setTicketsLoading(false);
    }
  };

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
      case 'ONGOING': return 'Đang diễn ra';
      case 'COMPLETED': return 'Đã kết thúc';
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
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
        />
      )}
      
      <h1>Danh sách hội thảo</h1>

      <div className="seminar-header">
        <div className="filter-tabs">
          {['ALL', 'ONGOING', 'COMPLETED'].map((key) => (
            <button
              key={key}
              className={`tab-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key as 'ALL' | 'ONGOING' | 'COMPLETED')}
            >
              {getTabLabel(key)}
            </button>
          ))}
        </div>
        
        <div className="tickets-section">
          <Button 
            variant="primary" 
            size="sm" 
            icon={<FaTicketAlt />}
            onClick={handleFetchTickets}
            disabled={ticketsLoading}
          >
            {ticketsLoading ? 'Đang tải...' : 'Your Tickets'}
          </Button>
        </div>
      </div>

      {showTickets && (
        <div className="tickets-display">
          <h2>Vé đã mua</h2>
          {tickets.length === 0 ? (
            <p>Bạn chưa mua vé nào.</p>
          ) : (
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-info">
                    <p><strong>Mã vé:</strong> #{ticket.id}</p>
                    <p><strong>Mô tả:</strong> {ticket.description}</p>
                    <p><strong>Thời gian bắt đầu:</strong> {new Date(ticket.startingTime).toLocaleString('vi-VN')}</p>
                    <p><strong>Thời gian kết thúc:</strong> {new Date(ticket.endingTime).toLocaleString('vi-VN')}</p>
                    <p><strong>Ngày đặt:</strong> {new Date(ticket.bookingTime).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span className={`status ${ticket.status ? 'active' : 'inactive'}`}>
                        {ticket.status ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/seminars/${ticket.seminarId}`)}
                  >
                    Xem chi tiết hội thảo
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowTickets(false)}
          >
            Đóng
          </Button>
        </div>
      )}

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
