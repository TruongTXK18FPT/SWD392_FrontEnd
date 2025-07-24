import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Alert from "../components/Alert";
import "../styles/Register.css";
import { registerUser } from "../services/authService";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    isParent: false,
  });

  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      password: "",
      confirmPassword: "",
    };

    // Password validation (minimum 5 characters)
    if (formData.password.length < 5) {
      newErrors.password = "Mật khẩu phải có ít nhất 5 ký tự!";
      isValid = false;
    }

    // Password confirmation validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Role ID: 3 for parent, 1 for student
      const roleId = formData.isParent ? 3 : 1;

      await registerUser({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        roleId: roleId,
      });

      setAlert({
        show: true,
        type: "success",
        message: "Đăng ký thành công! Vui lòng đăng nhập.",
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";

      setAlert({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="register-form-card">
          <h1 className="register-title">Đăng Ký Tài Khoản</h1>

          <form onSubmit={handleSubmit} className="register-form">
            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FaEnvelope className="register-input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email"
                required
                className="register-form-input"
              />
            </motion.div>

            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FaLock className="register-input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Mật khẩu (tối thiểu 5 ký tự)"
                required
                className={`register-form-input ${
                  formErrors.password ? "error" : formData.password.length >= 5 ? "success" : ""
                }`}
              />
              {formErrors.password && (
                <div className="validation-message error">{formErrors.password}</div>
              )}
            </motion.div>

            <motion.div
              className="register-form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FaLock className="register-input-icon" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Xác nhận mật khẩu"
                required
                className={`register-form-input ${
                  formErrors.confirmPassword ? "error" : ""
                }`}
              />
              {formErrors.confirmPassword && (
                <div className="validation-message error">{formErrors.confirmPassword}</div>
              )}
            </motion.div>

            <motion.div
              className="register-form-group-checkbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <input
                type="checkbox"
                id="isParent"
                name="isParent"
                checked={formData.isParent}
                onChange={(e) =>
                  setFormData({ ...formData, isParent: e.target.checked })
                }
                className="register-role-checkbox"
              />
              <label htmlFor="isParent" className="register-role-label">
                Tôi là phụ huynh
              </label>
            </motion.div>

            <motion.button
              type="submit"
              className="register-submit-button"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isLoading ? "Đang xử lý..." : "Đăng Ký"}
            </motion.button>
          </form>

          <motion.p
            className="register-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;