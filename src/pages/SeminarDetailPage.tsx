import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Seminar } from '../types/Seminar';
import { fetchSeminarDetails, placeOrder, PlaceOrderResponse } from '../api/SeminarApi';
import { getCurrentUser } from '../services/userService';
import { getToken } from '../services/localStorageService';
import Button from '../components/Button';
import Alert from '../components/Alert';
import '../styles/SeminarDetailPage.css'; // nếu có

const SeminarDetailPage: React.FC = () => {
  const { seminarId } = useParams<{ seminarId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    // Check if user is authenticated
    const token = getToken();
    if (token) {
      getCurrentUser()
        .then((userData) => {
          setCurrentUser(userData);
        })
        .catch((error) => {
          console.error('Failed to get current user:', error);
        });
    }
  }, []);

  // Reset booking state when component mounts or when user returns from payment
  useEffect(() => {
    setBookingLoading(false);
    
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
        description: 'Bạn có thể thử đặt vé lại nếu muốn.',
      });
      
      // Clear the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Add event listener for when user returns to the page
    const handleFocus = () => {
      console.log('Page focused - resetting booking state');
      setBookingLoading(false);
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [searchParams]);

  useEffect(() => {
  if (!seminarId) {
    console.warn('seminarId is undefined');
    return;
  }

  setLoading(true);
  fetchSeminarDetails(seminarId)
    .then((data) => {
      console.log('Seminar data:', data); 
      setSeminar(data);
    })
    .catch((err) => {
      console.error(err);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể tải chi tiết hội thảo',
        description: 'Vui lòng thử lại sau',
      });
    })
    .finally(() => setLoading(false));
}, [seminarId]);

  const handleBookTicket = async () => {
    if (!currentUser) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Vui lòng đăng nhập',
        description: 'Bạn cần đăng nhập để đặt vé hội thảo',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    if (!seminar) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể đặt vé',
        description: 'Thông tin hội thảo không khả dụng',
      });
      return;
    }

    if (!description.trim()) {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Vui lòng nhập mô tả',
        description: 'Mô tả không được để trống',
      });
      return;
    }

    setBookingLoading(true);

    try {
      // Create return URLs for payment success and cancel
      const successUrl = `${window.location.origin}/payment-redirect?status=success`;
      const cancelUrl = `${window.location.origin}/payment-redirect?status=cancel`;
      
      const response = await placeOrder(
        seminar.id,
        seminar.price,
        currentUser.id,
        description.trim(),
        successUrl,
        cancelUrl
      );

      console.log('Place order response:', response);

      // Store pending payment data for later reference
      localStorage.setItem('pendingPayment', JSON.stringify({
        seminarId: seminar.id,
        seminarTitle: seminar.title,
        price: seminar.price,
        description: description.trim(),
        timestamp: new Date().toISOString(),
        sagaId: response.sagaId,
        orderCode: response.orderCode
      }));

      // Show success message briefly before redirect
      setAlert({
        show: true,
        type: 'success',
        message: 'Đặt vé thành công!',
        description: 'Đang chuyển hướng đến trang thanh toán...',
      });

      // Reset booking loading state before redirect
      setBookingLoading(false);

      // Redirect to payment gateway after a short delay
      setTimeout(() => {
        window.location.href = response.checkoutUrl;
      }, 1500);
      
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // More specific error messages based on error type
      let errorMessage = 'Đặt vé thất bại';
      let errorDescription = 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại sau.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Lỗi kết nối';
        errorDescription = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.';
      } else if (error.message) {
        errorDescription = error.message;
      }
      
      setAlert({
        show: true,
        type: 'error',
        message: errorMessage,
        description: errorDescription,
      });
      setBookingLoading(false);
    }
  };

  const isAuthenticated = !!getToken();
  const canBook = seminar && seminar.status === 'ONGOING' && seminar.statusApprove === 'APPROVED';

  // Function to reset booking state
  const resetBookingState = () => {
    setBookingLoading(false);
    setAlert({
      show: false,
      type: 'success',
      message: '',
    });
  };


  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!seminar) return <p>Không tìm thấy hội thảo</p>;

  return (
    <div className="seminar-detail-page">
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
        />
      )}
      
      <div className="seminar-header">
        <h1>{seminar.title}</h1>
        <img src={seminar.imageUrl} alt={seminar.title} className="seminar-detail-img" />
      </div>
      
      <div className="seminar-info">
        <p><strong>Mô tả:</strong> {seminar.description}</p>
        <p><strong>Thời lượng:</strong> {seminar.duration} phút</p>
        <p><strong>Giá:</strong> {seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}</p>
        <p><strong>Slot:</strong> {seminar.slot}</p>
        <p><strong>Thời gian bắt đầu:</strong> {new Date(seminar.startingTime).toLocaleString('vi-VN')}</p>
        <p><strong>Thời gian kết thúc:</strong> {new Date(seminar.endingTime).toLocaleString('vi-VN')}</p>
        <p><strong>Meeting URL:</strong> <a href={seminar.meetingUrl} target="_blank" rel="noreferrer">{seminar.meetingUrl}</a></p>
        <p><strong>Form đăng ký:</strong> <a href={seminar.formUrl} target="_blank" rel="noreferrer">{seminar.formUrl}</a></p>
        <p><strong>Trạng thái:</strong> {seminar.status}</p>
        <p><strong>Trạng thái duyệt:</strong> {seminar.statusApprove}</p>
      </div>

      {/* Booking Form */}
      <div className="booking-section">
        <h3>Đặt vé hội thảo</h3>
        
        {!isAuthenticated && (
          <div className="auth-warning">
            <p>Bạn cần đăng nhập để đặt vé hội thảo.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          </div>
        )}

        {isAuthenticated && canBook && (
          <div className="booking-form">
            <div className="form-group">
              <label htmlFor="description">Mô tả (bắt buộc) - {description.length}/25 ký tự:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 25) {
                    setDescription(e.target.value);
                  }
                }}
                placeholder="Nhập lý do tham gia hội thảo..."
                rows={4}
                className="description-input"
                required
                maxLength={25}
              />
              {description.length === 25 && (
                <small style={{ color: '#ff6b6b', fontSize: '12px' }}>
                  Đã đạt giới hạn tối đa 25 ký tự
                </small>
              )}
            </div>
            
            <div className="booking-summary">
              <h4>Thông tin đặt vé:</h4>
              <p><strong>Hội thảo:</strong> {seminar.title}</p>
              <p><strong>Giá:</strong> {seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}</p>
              <p><strong>Người đặt:</strong> {currentUser?.fullName || currentUser?.email}</p>
            </div>
            
            <Button 
              variant="primary" 
              onClick={handleBookTicket}
              disabled={bookingLoading || !description.trim()}
              className="book-button"
            >
              {bookingLoading ? 'Đang xử lý...' : 'Đặt vé ngay'}
            </Button>
            
            {alert.show && alert.type === 'error' && (
              <Button 
                variant="outline" 
                onClick={resetBookingState}
                className="retry-button"
                style={{ marginTop: '12px', width: '100%' }}
              >
                Thử lại
              </Button>
            )}
          </div>
        )}

        {isAuthenticated && !canBook && (
          <div className="booking-disabled">
            <p>
              {seminar.statusApprove !== 'APPROVED' 
                ? 'Hội thảo chưa được duyệt' 
                : seminar.status !== 'ONGOING' 
                ? 'Hội thảo hiện không mở đăng ký'
                : 'Không thể đặt vé lúc này'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeminarDetailPage;
