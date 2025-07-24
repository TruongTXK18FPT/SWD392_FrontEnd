import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Alert from '../components/Alert';
import {
  FaCheck,
  FaGraduationCap,
  FaCalendarAlt,
  FaInfinity,
  FaRobot,
  FaChartLine,
  FaBriefcase,
  FaUsers,
  FaHeadset,
  FaArrowLeft,
  FaStar
} from 'react-icons/fa';
import { upgradeToPremium } from '../services/premiumService';
import { getCurrentUser } from '../services/userService';
import '../styles/PremiumPage.css';
import loginVideo from '../assets/Login.mp4';

interface CurrentUser {
  id: number;
  email: string;
  currentPackage: string | null; // Allow currentPackage to be null
}

interface PremiumPageProps {
  isAuthenticated?: boolean;
}

const PremiumPage: React.FC<PremiumPageProps> = ({
                                                   isAuthenticated = false
                                                 }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning";
    message: string;
    description?: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // Fetch current user details when component mounts and user is authenticated
  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const user = await getCurrentUser();
          console.log('User data fetched in PremiumPage:', user);
          setCurrentUser(user);
        } catch (error) {
          console.error("Failed to fetch current user in PremiumPage:", error);
          setAlert({
            show: true,
            type: 'error',
            message: 'Lỗi tải thông tin người dùng',
            description: 'Không thể lấy thông tin tài khoản của bạn. Vui lòng thử tải lại trang.'
          });
        }
      }
    };

    fetchUser();
  }, [isAuthenticated]);

  const packages = [
    {
      id: 1, // monthly
      name: 'Hàng Tháng',
      icon: <FaCalendarAlt />,
      price: 4000,
      period: 'tháng',
      originalPrice: null,
      discount: null,
      popular: true,
      features: [
        'Không giới hạn bài test',
        'AI Chatbot cá nhân',
        'Báo cáo chi tiết',
        'Tư vấn nghề nghiệp',
        'Parent Dashboard',
        'Hỗ trợ 24/7'
      ],
      packageName: 'PREMIUM'
    }
  ];

  const handleSelectPlan = async (planId: number, event?: React.MouseEvent) => {
    console.log('handleSelectPlan called with planId:', planId);

    if (event) {
      console.log('Preventing default event behavior');
      event.preventDefault();
      event.stopPropagation();
    }

    const token = localStorage.getItem('token');
    console.log('Current auth state - isAuthenticated:', isAuthenticated, 'token exists:', !!token);

    // Check if user is properly authenticated and user data is loaded
    if (!isAuthenticated || !currentUser || !token) {
      console.log('User not properly authenticated or user data not loaded, redirecting to login');
      navigate('/login', {
        state: {
          from: window.location.pathname,
          message: 'Vui lòng đăng nhập để nâng cấp tài khoản'
        }
      });
      return;
    }

    if (loading) return;

    setSelectedPlan(planId);
    setLoading(true);

    try {
      // Call the service with the correct user ID from the state
      console.log('Initiating premium upgrade for user:', currentUser.id);
      const response = await upgradeToPremium(currentUser.id);
      console.log('Payment initiation response:', response);

      if (response && response.checkoutUrl) {
        console.log('Redirecting to payment URL:', response.checkoutUrl);
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error: any) {
      console.error('Failed to initiate premium upgrade:', error);
      setLoading(false);
      setAlert({
        show: true,
        type: 'error',
        message: 'Lỗi khởi tạo thanh toán',
        description: error.response?.data?.message || 'Không thể kết nối đến hệ thống thanh toán. Vui lòng thử lại sau.'
      });
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const getButtonContent = (pkg: any) => {
    if (loading && selectedPlan === pkg.id) {
      return 'Đang xử lý...';
    }
    if (!isAuthenticated || !currentUser) {
      return 'Đăng nhập để đăng ký';
    }
    if (currentUser.currentPackage?.toUpperCase() === pkg.packageName) {
      return 'Bạn đang ở gói này';
    }
    return 'Chọn gói này';
  };

  const isButtonDisabled = (pkg: any) => {
    if (loading) return true;
    if (!isAuthenticated || !currentUser) return false; // Let the click handler redirect to login
    return currentUser.currentPackage?.toUpperCase() === pkg.packageName;
  }

  return (
      <div className="premium-page">
        {/* Alert */}
        {alert.show && (
            <Alert
                type={alert.type}
                message={alert.message}
                description={alert.description}
                onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
            />
        )}

        {/* Background Video */}
        <div className="premium-video-container">
          <video
              autoPlay
              muted
              loop
              playsInline
              className="premium-video-background"
          >
            <source src={loginVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="premium-video-overlay" />
        </div>

        {/* Content */}
        <div className="premium-content">
          {/* Header */}
          <motion.div
              className="premium-header"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
          >
            <button
                className="back-button"
                onClick={() => navigate(-1)}
            >
              <FaArrowLeft />
              <span>Quay lại</span>
            </button>

            <div className="premium-title-section">
              <h1 className="premium-title">
                Nâng Cấp Premium
              </h1>
              <p className="premium-subtitle">
                Mở khóa toàn bộ tính năng và trải nghiệm cá nhân hóa hoàn toàn
              </p>
            </div>
          </motion.div>

          {/* Features Overview */}
          <motion.div
              className="premium-features-overview"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="feature-highlight">
              <FaRobot className="feature-icon" />
              <h3>AI Tư Vấn Cá Nhân</h3>
              <p>Chatbot thông minh hỗ trợ 24/7</p>
            </div>
            <div className="feature-highlight">
              <FaChartLine className="feature-icon" />
              <h3>Báo Cáo Chi Tiết</h3>
              <p>Phân tích sâu về tính cách và xu hướng</p>
            </div>
            <div className="feature-highlight">
              <FaBriefcase className="feature-icon" />
              <h3>Tư Vấn Nghề Nghiệp</h3>
              <p>Gợi ý nghề nghiệp phù hợp với tính cách</p>
            </div>
            <div className="feature-highlight">
              <FaUsers className="feature-icon" />
              <h3>Parent Dashboard</h3>
              <p>Theo dõi tiến trình của con em</p>
            </div>
          </motion.div>

          {/* Pricing Plans */}
          <motion.div
              className="premium-packages"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="packages-title">Chọn Gói Phù Hợp</h2>

            <div className="packages-grid">
              {packages.map((pkg, index) => {
                const isDisabled = isButtonDisabled(pkg);
                return (
                    <motion.div
                        key={pkg.id}
                        className={`package-card ${pkg.popular ? 'popular' : ''} ${selectedPlan === pkg.id ? 'selected' : ''}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                    >
                      {pkg.popular && (
                          <div className="popular-badge">
                            <FaStar />
                            <span>Phổ biến nhất</span>
                          </div>
                      )}

                      {pkg.discount && (
                          <div className="discount-badge">
                            Tiết kiệm {pkg.discount}
                          </div>
                      )}

                      <div className="package-header">
                        <div className="package-icon">
                          {pkg.icon}
                        </div>
                        <h3 className="package-name">{pkg.name}</h3>

                        <div className="package-price">
                          <div className="price-main">
                            <span className="currency">₫</span>
                            <span className="amount">{formatPrice(pkg.price)}</span>
                            <span className="period">/{pkg.period}</span>
                          </div>
                          {pkg.originalPrice && (
                              <div className="price-original">
                                <span>₫{formatPrice(pkg.originalPrice)}</span>
                              </div>
                          )}
                        </div>
                      </div>

                      <div className="package-features">
                        {pkg.features.map((feature) => (
                            <div key={feature} className="feature-item">
                              <FaCheck className="check-icon" />
                              <span>{feature}</span>
                            </div>
                        ))}
                      </div>

                      <div
                          onClick={(e) => {
                            if (!isDisabled) {
                              console.log('Button container clicked');
                              handleSelectPlan(pkg.id, e);
                            }
                          }}
                          style={{ display: 'inline-block', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                      >
                        <motion.button
                            type="button"
                            className={`package-button ${pkg.popular ? 'popular' : ''}`}
                            disabled={isDisabled}
                            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                        >
                          {getButtonContent(pkg)}
                        </motion.button>
                      </div>
                    </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Additional Benefits */}
          <motion.div
              className="premium-benefits"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="benefits-title">Tại Sao Chọn Premium?</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <FaHeadset className="benefit-icon" />
                <h3>Hỗ Trợ 24/7</h3>
                <p>Đội ngũ chuyên gia sẵn sàng hỗ trợ bạn mọi lúc</p>
              </div>
              <div className="benefit-item">
                <FaChartLine className="benefit-icon" />
                <h3>Phân Tích Tiên Tiến</h3>
                <p>Công nghệ AI để hiểu rõ hơn về bản thân</p>
              </div>
              <div className="benefit-item">
                <FaStar className="benefit-icon" />
                <h3>Trải Nghiệm Cao Cấp</h3>
                <p>Giao diện và tính năng được tối ưu hóa</p>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
              className="premium-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
          >
            <p>
              Có thể hủy bất kỳ lúc nào. Không có cam kết dài hạn.
            </p>
            <div className="security-badges">
              <span>🔒 Thanh toán an toàn</span>
              <span>💳 Hỗ trợ nhiều phương thức</span>
              <span>🔄 Hoàn tiền 7 ngày</span>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default PremiumPage;
