import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/PaymentStatusPage.css';

interface PaymentStatus {
  completed: boolean;
  failed: boolean;
  cancelled: boolean;
  seminarId?: number;
  orderId?: string;
  message?: string;
}

const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'fail' | 'cancel'>('loading');
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  
  const sagaId = searchParams.get('sagaId');
  const orderId = searchParams.get('orderId');
  const paymentStatus = searchParams.get('status'); // Some payment gateways return status directly

  useEffect(() => {
    // Check if user came from a cancelled payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentCancelled = urlParams.get('payment') === 'cancelled';
    const cancelStatus = urlParams.get('cancel') === 'true';
    const urlStatus = urlParams.get('status');
    
    if (paymentCancelled || cancelStatus || urlStatus === 'CANCELLED') {
      setStatus('cancel');
      // Set payment data if available from URL params
      const orderCode = urlParams.get('orderCode');
      const id = urlParams.get('id');
      if (orderCode || id) {
        setPaymentData({
          completed: false,
          failed: false,
          cancelled: true,
          orderId: orderCode || id || undefined,
          message: 'Thanh toán đã bị hủy bởi người dùng'
        });
      }
      startCountdown();
      return;
    }

    // If payment status is provided directly in URL params
    if (paymentStatus) {
      handleDirectPaymentStatus(paymentStatus);
      return;
    }

    // If sagaId is provided, check status via API
    if (sagaId) {
      checkPaymentStatus(sagaId);
      return;
    }

    // If no parameters, treat as failed
    setStatus('fail');
    startCountdown();
  }, [sagaId, paymentStatus]);

  const handleDirectPaymentStatus = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'success':
      case 'completed':
        setStatus('success');
        break;
      case 'cancelled':
      case 'cancel':
      case 'canceled':
        setStatus('cancel');
        break;
      case 'failed':
      case 'fail':
        setStatus('fail');
        break;
      default:
        setStatus('loading');
    }
    startCountdown();
  };

  const checkPaymentStatus = async (sagaId: string) => {
    try {
      const response = await fetch(`http://localhost:8082/seminar/api/place-order/status/${sagaId}`);
      const data: PaymentStatus = await response.json();
      
      setPaymentData(data);
      
      if (data.completed && !data.failed) {
        setStatus('success');
      } else if (data.failed) {
        setStatus('fail');
      } else if (data.cancelled) {
        setStatus('cancel');
      } else {
        setStatus('loading');
        // If still loading, check again after 2 seconds
        setTimeout(() => checkPaymentStatus(sagaId), 2000);
        return;
      }
      
      startCountdown();
    } catch (error) {
      console.error('❌ Error fetching payment status:', error);
      setStatus('fail');
      startCountdown();
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigateBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const navigateBack = () => {
    // Clear pending payment data
    localStorage.removeItem('pendingPayment');
    
    // Try to get seminar ID from various sources
    let seminarId = paymentData?.seminarId;
    
    if (!seminarId) {
      // Try to get from stored pending payment
      try {
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (pendingPayment) {
          const parsed = JSON.parse(pendingPayment);
          seminarId = parsed.seminarId;
        }
      } catch (error) {
        console.error('Error parsing pending payment:', error);
      }
    }
    
    if (seminarId) {
      navigate(`/seminars/${seminarId}`);
    } else {
      navigate('/seminars');
    }
  };

  const handleManualNavigation = () => {
    navigateBack();
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <FaSpinner className="status-icon loading" />;
      case 'success':
        return <FaCheckCircle className="status-icon success" />;
      case 'cancel':
        return <FaExclamationTriangle className="status-icon cancel" />;
      case 'fail':
        return <FaTimesCircle className="status-icon fail" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return 'Đang xử lý thanh toán...';
      case 'success':
        return 'Thanh toán thành công!';
      case 'cancel':
        return 'Bạn đã hủy thanh toán';
      case 'fail':
        return 'Thanh toán thất bại';
      default:
        return 'Đang xử lý...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'loading':
        return 'Vui lòng chờ trong giây lát...';
      case 'success':
        return 'Vé hội thảo của bạn đã được đặt thành công. Bạn sẽ nhận được email xác nhận sớm.';
      case 'cancel':
        return 'Giao dịch đã bị hủy. Bạn có thể thử lại sau.';
      case 'fail':
        return paymentData?.message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.';
      default:
        return '';
    }
  };

  return (
    <div className="payment-status-page">
      <div className="payment-status-container">
        <div className="status-content">
          {getStatusIcon()}
          <h1 className={`status-title ${status}`}>{getStatusMessage()}</h1>
          <p className="status-description">{getStatusDescription()}</p>
          
          {paymentData?.orderId && (
            <div className="order-info">
              <p><strong>Mã đơn hàng:</strong> {paymentData.orderId}</p>
            </div>
          )}
          
          {status !== 'loading' && (
            <div className="navigation-section">
              <p className="countdown-text">
                Tự động chuyển hướng sau {countdown} giây
              </p>
              <button 
                onClick={handleManualNavigation}
                className="navigate-button"
              >
                Quay lại ngay
              </button>
            </div>
          )}
          
          {status === 'loading' && (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
