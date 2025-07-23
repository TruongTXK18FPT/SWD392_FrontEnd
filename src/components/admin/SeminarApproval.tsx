import React, { useState, useEffect } from 'react';
import { 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUsers, 
  FaDollarSign,
  FaCalendarAlt,
  FaSpinner
} from 'react-icons/fa';
import Button from '../Button';
import { Seminar } from '../../types/Seminar';
import { fetchPendingSeminars, updateSeminarApprovalStatus } from '../../api/SeminarApi';
import { getCurrentUser } from '../../services/userService';
import '../../styles/SeminarApproval.css';

interface SeminarApprovalProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const SeminarApproval: React.FC<SeminarApprovalProps> = ({ onAlert }) => {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Prevent rapid successive calls
    const now = Date.now();
    if (now - lastFetchTime < 2000) { // 2 second debounce
      console.log('⚠️ Skipping fetch - too soon after last call');
      return;
    }
    setLastFetchTime(now);

    try {
      setLoading(true);
      
      console.log('🔄 Fetching pending seminars and current user...');
      
      // Fetch current user and pending seminars in parallel
      const [userData, seminarsData] = await Promise.all([
        getCurrentUser(),
        fetchPendingSeminars()
      ]);
      
      console.log('✅ Data fetched successfully:', {
        user: userData,
        seminarsCount: seminarsData.length
      });
      
      setCurrentUser(userData);
      setSeminars(seminarsData);
      onAlert('info', `Tìm thấy ${seminarsData.length} hội thảo chờ duyệt`);
      
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      onAlert('error', 'Không thể tải danh sách hội thảo chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (seminarId: number, status: 'APPROVED' | 'REJECTED') => {
    if (!currentUser?.id) {
      onAlert('error', 'Không thể xác định thông tin admin');
      return;
    }

    // Verify admin role
    if (!['ADMIN', 'SYSTEM_ADMIN'].includes(currentUser.role)) {
      onAlert('error', 'Bạn không có quyền duyệt hội thảo');
      console.error('❌ Invalid admin role:', currentUser.role);
      return;
    }

    // Prevent multiple simultaneous calls for the same seminar
    if (processingIds.has(seminarId)) {
      console.log('⚠️ Already processing seminar:', seminarId);
      return;
    }

    setProcessingIds(prev => new Set(prev.add(seminarId)));
    
    try {
      console.log('🚀 Updating seminar approval:', {
        seminarId,
        status,
        adminId: currentUser.id,
        adminRole: currentUser.role,
        adminEmail: currentUser.email
      });
      
      await updateSeminarApprovalStatus(seminarId, status, currentUser.id);
      
      // Remove the seminar from the list after successful approval/rejection
      setSeminars(prev => prev.filter(seminar => seminar.id !== seminarId));
      
      const statusText = status === 'APPROVED' ? 'phê duyệt' : 'từ chối';
      onAlert('success', `Đã ${statusText} hội thảo thành công`);
      
    } catch (error) {
      console.error('❌ Failed to update seminar approval:', error);
      onAlert('error', `Không thể ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} hội thảo`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(seminarId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="seminar-approval-loading">
        <FaSpinner className="spin" />
        <p>Đang tải danh sách hội thảo chờ duyệt...</p>
      </div>
    );
  }

  return (
    <div className="seminar-approval">
      <div className="approval-header">
        <h2>Duyệt Hội Thảo</h2>
        <p>Quản lý và duyệt các hội thảo chờ phê duyệt</p>
        <Button 
          onClick={fetchData}
          variant="outline"
          size="sm"
        >
          Làm mới
        </Button>
      </div>

      {seminars.length === 0 ? (
        <div className="no-seminars">
          <FaCheck className="check-icon" />
          <h3>Không có hội thảo nào chờ duyệt</h3>
          <p>Tất cả hội thảo đã được xử lý</p>
        </div>
      ) : (
        <div className="seminars-grid">
          {seminars.map((seminar) => (
            <div key={seminar.id} className="seminar-approval-card">
              <div className="seminar-image">
                <img 
                  src={seminar.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+U2VtaW5hcjwvdGV4dD4KPHN2Zz4='} 
                  alt={seminar.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+U2VtaW5hcjwvdGV4dD4KPHN2Zz4=';
                  }}
                />
              </div>
              
              <div className="seminar-content">
                <h3>{seminar.title}</h3>
                <p className="seminar-description">{seminar.description}</p>
                
                <div className="seminar-details">
                  <div className="detail-item">
                    <FaClock />
                    <span>Thời lượng: {seminar.duration} giờ</span>
                  </div>
                  <div className="detail-item">
                    <FaUsers />
                    <span>Số chỗ: {seminar.slot}</span>
                  </div>
                  <div className="detail-item">
                    <FaDollarSign />
                    <span>{formatPrice(seminar.price)}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>Bắt đầu: {formatDate(seminar.startingTime)}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt />
                    <span>Kết thúc: {formatDate(seminar.endingTime)}</span>
                  </div>
                </div>

                <div className="status-badges">
                  <span className="status-badge pending">
                    Trạng thái: {seminar.status}
                  </span>
                  <span className="approval-badge pending">
                    Duyệt: {seminar.statusApprove}
                  </span>
                </div>

                <div className="approval-actions">
                  <Button
                    onClick={() => handleApproval(seminar.id, 'APPROVED')}
                    variant="success"
                    disabled={processingIds.has(seminar.id)}
                    size="sm"
                  >
                    {processingIds.has(seminar.id) ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <FaCheck />
                    )}
                    Duyệt
                  </Button>
                  
                  <Button
                    onClick={() => handleApproval(seminar.id, 'REJECTED')}
                    variant="danger"
                    disabled={processingIds.has(seminar.id)}
                    size="sm"
                  >
                    {processingIds.has(seminar.id) ? (
                      <FaSpinner className="spin" />
                    ) : (
                      <FaTimes />
                    )}
                    Từ chối
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeminarApproval;
