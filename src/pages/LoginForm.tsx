import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/LoginForm.css";
import Login from "../assets/Login.mp4";
import OAuthConfig from "../configurations/configuration";
import { login} from "../services/authService";
import { getCurrentUser } from "../services/userService";
import { getToken } from "../services/localStorageService";

interface LoginPageProps {
  onLoginSuccess?: () => Promise<void>;
}

// ...existing code...
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const navigate = useNavigate();

  React.useEffect(() => {
    const token = getToken();
    if (token) {
      navigate("/", { replace: true }); // prevent going back to /login
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);

      // Update authentication state and wait for user data
      if (onLoginSuccess) {
        await onLoginSuccess();
      }

      // Show success alert
      setAlert({
        show: true,
        type: "success",
        message: "Đăng nhập thành công!",
        description: "Đang chuyển hướng...",
      });

      // Get user data to determine redirect
      setTimeout(async () => {
        try {
          const userData = await getCurrentUser();
          console.log('LoginForm: userData received:', userData);
          const userRole = userData?.role;
          console.log('LoginForm: userRole extracted:', userRole);

          // Redirect based on user role (case-insensitive)
          if (userRole && userRole.toLowerCase() === "admin") {
            navigate("/admin");
          } else if (userRole && userRole.toLowerCase() === "event_manager") {
            navigate("/event-manager");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error('LoginForm: Error getting user data:', error);
          navigate("/"); // Default redirect
        }
      }, 1500);
    } catch (error: any) {
      // Check for error message
      const errorMessage = error?.response?.data?.message ?? "";
      setAlert({
        show: true,
        type: "error",
        message: "Đăng nhập thất bại",
        description: errorMessage || "Email hoặc mật khẩu không chính xác",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const callbackUrl = OAuthConfig.redirectUri;
      const authUrl = OAuthConfig.authUri;
      const googleClientId = OAuthConfig.clientId;

      const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
        callbackUrl
      )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

      window.location.href = targetUrl;
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: "Đăng nhập Google thất bại",
        description: "Có lỗi xảy ra khi đăng nhập với Google",
      });
    }
  };

  return (
    <div className="login-container">
      {isLoading && (
        <LoadingSpinner
          size="medium"
          message="Đang đăng nhập..."
        />
      )}

      <video autoPlay muted loop className="login-background">
        <source src={Login} type="video/mp4" />
      </video>

      <div className="login-overlay">
        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            description={alert.description}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          />
        )}
      </div>

      <div className="login-form-container">
        <div className="login-form-card">
          <div className="login-header">
            <h1 className="login-title">Chào mừng trở lại</h1>
            <p className="login-subtitle">
              Đăng nhập để khám phá tính cách của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-form-input"
              />
            </div>

            <div className="form-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-form-input"
              />

              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: "1.2rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: "1.2rem",
                  zIndex: 10,
                }}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="form-options">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "0.5rem",
                }}
              >
                <Link to="/forgot-password" className="forgot-password">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              isLoading={isLoading}
              className="login-button"
            >
              Đăng Nhập
            </Button>
          </form>

          <div className="social-login">
            <div className="divider">
              <span>Hoặc đăng nhập với</span>
            </div>

            <div className="google-login-container">
              <Button
                variant="outline"
                size="lg"
                icon={<FaGoogle />}
                onClick={handleGoogleLogin}
                className="google-login-button"
              >
                Đăng nhập với Google
              </Button>
            </div>
          </div>

          <div className="register-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
