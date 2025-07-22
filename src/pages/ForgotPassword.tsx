import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import Alert from "../components/Alert";
import Login from "../assets/Login.mp4";
import "../styles/ForgotPassword.css";

// ✅ Sử dụng các API mới
import {
  sendResetOtpNew,
  verifyResetOtpNew,
  resetPasswordNewApi,
} from "../services/authService";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendResetOtpNew(email);
      setAlert({
        show: true,
        type: "success",
        message: "Mã OTP đã được gửi đến email của bạn.",
      });
      setStep("otp");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Email không tồn tại trong hệ thống.";
      setAlert({
        show: true,
        type: "error",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyResetOtpNew(email, otp);
      setAlert({
        show: true,
        type: "success",
        message: "Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới.",
      });
      setStep("newPassword");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Mã OTP không hợp lệ. Vui lòng thử lại.";
      setAlert({
        show: true,
        type: "error",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  

const handlePasswordSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (newPassword.length < 5) {
    setAlert({
      show: true,
      type: "error",
      message: "Mật khẩu phải có ít nhất 5 ký tự.",
    });
    return;
  }

  if (confirmPassword.length < 6) {
    setAlert({
      show: true,
      type: "error",
      message: "Mật khẩu xác nhận phải có ít nhất 5 ký tự.",
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    setAlert({
      show: true,
      type: "error",
      message: "Mật khẩu xác nhận không khớp.",
    });
    return;
  }

  setIsLoading(true);

  try {
    await resetPasswordNewApi(email, newPassword, confirmPassword); // 👈 gọi API mới

    setAlert({
      show: true,
      type: "success",
      message: "Đổi mật khẩu thành công! Đang chuyển hướng...",
    });

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      "Không thể cập nhật mật khẩu. Vui lòng thử lại sau.";
    setAlert({
      show: true,
      type: "error",
      message,
    });
  } finally {
    setIsLoading(false);
  }
};



  const handleResendOtp = async () => {
    try {
      await sendResetOtpNew(email);
      window.alert("Đã gửi lại mã OTP!");
    } catch (error) {
      window.alert("Không thể gửi lại OTP.");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-video-container">
        <video autoPlay muted loop className="forgot-password-video-background">
          <source src={Login} type="video/mp4" />
        </video>
        <div className="forgot-password-video-overlay">
          <AnimatePresence>
            {alert.show && (
              <Alert
                type={alert.type}
                message={alert.message}
                duration={5000}
                onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="forgot-password-content">
        <div className="forgot-password-form-card">
          <div className="forgot-password-header">
            <div className="step-indicator">
              <div className={`step ${step === "email" ? "active" : (step === "otp" || step === "newPassword") ? "completed" : ""}`}></div>
              <div className={`step ${step === "otp" ? "active" : step === "newPassword" ? "completed" : ""}`}></div>
              <div className={`step ${step === "newPassword" ? "active" : ""}`}></div>
            </div>

            <h1 className="forgot-password-title">Quên Mật Khẩu</h1>
            <p className="forgot-password-subtitle">
              {step === "email" && "Nhập email của bạn để nhận mã xác thực"}
              {step === "otp" && "Nhập mã OTP đã được gửi đến email của bạn"}
              {step === "newPassword" && "Tạo mật khẩu mới cho tài khoản của bạn"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.form
                onSubmit={handleEmailSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="forgot-password-form"
              >
                <div className="forgot-password-form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                    className="forgot-password-form-input"
                  />
                  <FaEnvelope className="forgot-password-input-icon" />
                </div>

                <button
                  type="submit"
                  className="forgot-password-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                </button>
              </motion.form>
            )}

            {step === "otp" && (
              <motion.form
                onSubmit={handleOtpSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="forgot-password-form"
              >
                <div className="forgot-password-form-group">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã OTP"
                    maxLength={6}
                    required
                    className="forgot-password-form-input forgot-password-otp-input"
                  />
                  <FaKey className="forgot-password-input-icon" />
                </div>

                <button
                  type="submit"
                  className="forgot-password-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận"}
                </button>

                <button
                  type="button"
                  className="register-text-button"
                  onClick={handleResendOtp}
                >
                  Chưa nhận được mã OTP? Gửi lại
                </button>
              </motion.form>
            )}

            {step === "newPassword" && (
              <motion.form
                onSubmit={handlePasswordSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="forgot-password-form"
              >
                <div className="forgot-password-form-group">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                    required
                    className="forgot-password-form-input"
                  />
                  <FaLock className="forgot-password-input-icon" />
                </div>

                <div className="forgot-password-form-group">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    required
                    className="forgot-password-form-input"
                  />
                  <FaLock className="forgot-password-input-icon" />
                </div>

                <button
                  type="submit"
                  className="forgot-password-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="forgot-password-footer">
            Đã nhớ mật khẩu? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
