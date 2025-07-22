import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get all the payment parameters from URL
    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');
    const code = searchParams.get('code');
    const id = searchParams.get('id');
    const orderCode = searchParams.get('orderCode');
    const sagaId = searchParams.get('sagaId');

    console.log('Payment redirect handler - received params:', {
      status, cancel, code, id, orderCode, sagaId
    });

    // Handle direct redirect from payment gateway success
    if (status === 'success' || code === '00' || (status === 'PAID' && cancel === 'false')) {
      // Clear pending payment data
      localStorage.removeItem('pendingPayment');
      
      // Get seminar ID from pending payment if available
      let seminarId = null;
      try {
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (pendingPayment) {
          const parsed = JSON.parse(pendingPayment);
          seminarId = parsed.seminarId;
        }
      } catch (error) {
        console.error('Error parsing pending payment:', error);
      }
      
      // Redirect to seminars page with success message
      const redirectUrl = seminarId ? `/seminars/${seminarId}?payment=success` : '/seminars?payment=success';
      navigate(redirectUrl, { replace: true });
      return;
    }

    // Handle cancellation
    if (cancel === 'true' || status === 'cancel' || status === 'CANCELLED') {
      // Get seminar ID from pending payment if available  
      let seminarId = null;
      try {
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (pendingPayment) {
          const parsed = JSON.parse(pendingPayment);
          seminarId = parsed.seminarId;
        }
      } catch (error) {
        console.error('Error parsing pending payment:', error);
      }
      
      // Redirect to seminar detail page with cancel message
      const redirectUrl = seminarId ? `/seminars/${seminarId}?payment=cancelled` : '/seminars?payment=cancelled';
      navigate(redirectUrl, { replace: true });
      return;
    }

    // Build the redirect URL to PaymentStatusPage for other cases
    const paymentStatusUrl = new URL('/payment-status', window.location.origin);
    
    // Determine the payment status and add appropriate parameters
    if (status === 'COMPLETED' || status === 'SUCCESS') {
      paymentStatusUrl.searchParams.set('status', 'success');
    } else if (status === 'FAILED' || status === 'FAIL') {
      paymentStatusUrl.searchParams.set('status', 'fail');
    }

    // Add additional parameters if available
    if (orderCode) {
      paymentStatusUrl.searchParams.set('orderCode', orderCode);
    }
    if (id) {
      paymentStatusUrl.searchParams.set('id', id);
    }
    if (sagaId) {
      paymentStatusUrl.searchParams.set('sagaId', sagaId);
    }
    if (code) {
      paymentStatusUrl.searchParams.set('code', code);
    }

    // Redirect to PaymentStatusPage with the processed parameters
    navigate(paymentStatusUrl.pathname + paymentStatusUrl.search, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <LoadingSpinner size="medium" message="Đang xử lý kết quả thanh toán..." />
    </div>
  );
};

export default PaymentRedirectHandler;
