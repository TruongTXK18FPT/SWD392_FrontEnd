import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaClock, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import '../styles/PaymentCancelPage.css';

interface PaymentCancelData {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: string;
  transactions: any[];
  cancellationReason: string | null;
  canceledAt: string | null;
}

const PaymentCancelPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentCancelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get('id');
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    // Check if we're accessing the page directly from payment gateway URL
    const currentUrl = window.location.href;
    
    // If we're on the payment gateway URL, extract parameters and redirect
    if (currentUrl.includes('localhost:8086/payment/api/payments/cancel')) {
      // Extract parameters from current URL
      const url = new URL(currentUrl);
      const params = new URLSearchParams(url.search);
      
      // Redirect to our React app with the parameters
      const frontendUrl = new URL('http://localhost:3000/payment-cancel');
      params.forEach((value, key) => {
        frontendUrl.searchParams.set(key, value);
      });
      
      window.location.href = frontendUrl.toString();
      return;
    }

    if (paymentId) {
      fetchPaymentStatus(paymentId);
    } else if (orderCode) {
      // If we have orderCode but no id, we can still show basic info
      setPaymentData({
        id: '',
        orderCode: parseInt(orderCode),
        amount: 0,
        amountPaid: 0,
        amountRemaining: 0,
        status: 'CANCELLED',
        createdAt: new Date().toISOString(),
        transactions: [],
        cancellationReason: null,
        canceledAt: null
      });
      setLoading(false);
      startCountdown();
    } else {
      setError('Không tìm thấy thông tin thanh toán');
      setLoading(false);
      startCountdown();
    }
  }, [paymentId, orderCode]);

  const fetchPaymentStatus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8086/payment/api/payments/cancel?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }

      const data = await response.json();
      setPaymentData(data);
      startCountdown();
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setError('Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigateToSeminars();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const navigateToSeminars = () => {
    // Clear any pending payment data
    localStorage.removeItem('pendingPayment');
    navigate('/seminars');
  };

  const handleBackToSeminars = () => {
    navigateToSeminars();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="payment-cancel-page">
        <div className="payment-cancel-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-cancel-page">
        <div className="payment-cancel-container">
          <div className="error-content">
            <FaExclamationTriangle className="error-icon" />
            <h1>Có lỗi xảy ra</h1>
            <p>{error}</p>
            <button onClick={handleBackToSeminars} className="back-button">
              <FaArrowLeft /> Quay lại danh sách hội thảo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-cancel-page">
      <div className="payment-cancel-container">
        <div className="cancel-content">
          <div className="cancel-header">
            <FaExclamationTriangle className="cancel-icon" />
            <h1>Thanh toán đã bị hủy</h1>
            <p>Đơn hàng của bạn đã được hủy thành công</p>
          </div>

          {paymentData && (
            <div className="payment-details">
              <div className="detail-card">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-row">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">{paymentData.orderCode}</span>
                </div>
                {paymentData.id && (
                  <div className="detail-row">
                    <span className="label">ID Thanh toán:</span>
                    <span className="value">{paymentData.id}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`value status ${paymentData.status.toLowerCase()}`}>
                    {paymentData.status}
                  </span>
                </div>
                {paymentData.amount > 0 && (
                  <>
                    <div className="detail-row">
                      <span className="label">Số tiền:</span>
                      <span className="value">{formatCurrency(paymentData.amount)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Đã thanh toán:</span>
                      <span className="value">{formatCurrency(paymentData.amountPaid)}</span>
                    </div>
                  </>
                )}
                <div className="detail-row">
                  <span className="label">
                    <FaCalendarAlt /> Thời gian tạo:
                  </span>
                  <span className="value">{formatDate(paymentData.createdAt)}</span>
                </div>
                {paymentData.canceledAt && (
                  <div className="detail-row">
                    <span className="label">
                      <FaClock /> Thời gian hủy:
                    </span>
                    <span className="value">{formatDate(paymentData.canceledAt)}</span>
                  </div>
                )}
                {paymentData.cancellationReason && (
                  <div className="detail-row">
                    <span className="label">Lý do hủy:</span>
                    <span className="value">{paymentData.cancellationReason}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="cancel-message">
            <h3>Tại sao đơn hàng bị hủy?</h3>
            <p>
              Đơn hàng có thể bị hủy do nhiều lý do như: bạn đã chọn hủy thanh toán, 
              hết thời gian thanh toán, hoặc có lỗi trong quá trình xử lý.
            </p>
            <p>
              Đừng lo lắng! Bạn có thể thử đặt vé lại hoặc chọn hội thảo khác.
            </p>
          </div>

          <div className="navigation-section">
            <p className="countdown-text">
              <FaClock /> Tự động chuyển về danh sách hội thảo sau {countdown} giây
            </p>
            <div className="button-group">
              <button onClick={handleBackToSeminars} className="primary-button">
                <FaArrowLeft /> Xem danh sách hội thảo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
