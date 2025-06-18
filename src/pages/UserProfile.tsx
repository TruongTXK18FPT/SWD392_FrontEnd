// (Đầu file giữ nguyên)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/UserProfile.css';
import NewsSlider from '../components/NewsSlider';
import PersonalityTypes from '../components/PersonalityTypes';
import ChatbotPreview from '../components/ChatbotPreview';
import Footer from '../components/Footer';
import '../styles/Home.css';

const UserProfile: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // ✅ HÀM KÉO API GET PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:8080/user/api/profiles/1');
        console.log("📦 Dữ liệu lấy về từ API:", res.data);
        setProfile(res.data);
      } catch (err) {
        console.error('❌ Lỗi khi fetch user profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // ✅ HÀM MỚI: GỌI API POST để UPDATE PROFILE
const updateUserProfile = async (userId: number, updatedProfile: any) => {
  try {
    // ✅ Định dạng ngày sinh thành yyyy-MM-dd
    const convertDateToISO = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0]; // yyyy-MM-dd
    };

    const fixedProfile = {
      ...updatedProfile,
      birthDay: convertDateToISO(updatedProfile.birthDay),
    };

    console.log("📤 Payload gửi đi:", fixedProfile); // để kiểm tra

    const res = await axios.post(`http://localhost:8080/user/api/profiles/1`, fixedProfile);
    console.log("✅ Đã cập nhật:", res.data);
    return res.data;
  } catch (err) {
    console.error('❌ API lỗi khi cập nhật:', err);
    throw err;
  }
};


  // ✅ Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  // ✅ Hàm lưu lại sau khi chỉnh sửa
  const handleSave = async () => {
    try {
      await updateUserProfile(profile.profileId, profile);
      setIsEditing(false);
    } catch (err) {
      alert("❌ Cập nhật thất bại");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <motion.section
        className="user-info-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="user-info-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="user-image-wrapper">
            <img
              src={profile.imageUrl ? profile.imageUrl : '/src/assets/user-avatar.png'}
              alt="User Avatar"
              className="user-avatar"
            />
          </div>
          <div className="user-details">
            <h2>Thông tin cá nhân</h2>
            {!isEditing ? (
              <>
                <ul>
                  <li><strong>ID:</strong> {profile.profileId}</li>
                  <li><strong>Họ tên:</strong> {profile.fullName}</li>
                  <li><strong>Ngày sinh:</strong> {profile.birthDay}</li>
                  <li><strong>Giới tính:</strong> {profile.gender}</li>
                  <li><strong>Số điện thoại:</strong> {profile.phoneNumber}</li>
                  <li><strong>Địa chỉ:</strong> {profile.address}</li>
                  <li><strong>Trường:</strong> {profile.school}</li>
                  <li><strong>Loại Tài Khoản:</strong> {profile.accountType}</li>
                </ul>
                <button onClick={() => setIsEditing(true)} className="edit-btn">Chỉnh sửa</button>
              </>
            ) : (
              <>
                <div className="edit-form">
                  <label>Họ tên: <input name="fullName" value={profile.fullName} onChange={handleInputChange} /></label>
                  <label>Ngày sinh: <input type="date" name="birthDay" value={profile.birthDay} onChange={handleInputChange} /></label>
                  <label>Giới tính:
                    <select name="gender" value={profile.gender} onChange={handleInputChange}>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  </label>
                  <label>Số điện thoại: <input name="phoneNumber" value={profile.phoneNumber} onChange={handleInputChange} /></label>
                  <label>Địa chỉ: <input name="address" value={profile.address} onChange={handleInputChange} /></label>
                  <label>Trường: <input name="school" value={profile.school} onChange={handleInputChange} /></label>
                  <label>Loại tài khoản: <input name="accountType" value={profile.accountType} onChange={handleInputChange} /></label>
                </div>
                <div className="edit-buttons">
                  <button onClick={handleSave} className="save-btn">Lưu</button>
                  <button onClick={handleCancel} className="cancel-btn">Hủy</button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.section>

      <div className="main-content">
        <motion.div
          className="main-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <div className="left-column">
            <PersonalityTypes />
          </div>

          <div className="result-card">
            <h3>🧠 Kết quả tính cách</h3>
            <p className="subtitle">Phân tích chi tiết về tính cách của bạn</p>

            <div className="trait-box">
              <div className="trait-header">
                <span>MBTI</span>
                <strong>ENFP</strong>
              </div>
              <div className="trait-bar-container">
                <div className="trait-bar mbti"></div>
              </div>
              <p className="trait-desc">Người truyền cảm hứng, sáng tạo và năng động</p>
            </div>

            <div className="trait-box">
              <div className="trait-header">
                <span>DISC</span>
                <strong>Influencer</strong>
              </div>
              <div className="trait-bar-container">
                <div className="trait-bar disc"></div>
              </div>
              <p className="trait-desc">Có khả năng ảnh hưởng và truyền cảm hứng cho người khác</p>
            </div>

            <h3 className="activity-title">🕒 Hoạt động gần đây</h3>
            <ul className="activity-list">
              <li>
                <span>📌 MBTI - 15/1/2024</span>
                <span className="status done">Hoàn thành</span>
              </li>
              <li>
                <span>📌 DISC - 10/1/2024</span>
                <span className="status done">Hoàn thành</span>
              </li>
              <li>
                <span>📌 Big Five - 20/1/2024</span>
                <span className="status pending">Đang thực hiện</span>
              </li>
            </ul>
          </div>

          <div className="right-column">
            <NewsSlider />
            <ChatbotPreview />
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
