import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
  FaSchool,
  FaEdit,
  FaTimes,
  FaSave,
  FaEnvelope,
  FaUserEdit
} from "react-icons/fa";
import { getProfile } from "../services/authService";
import { getCurrentUser, updateProfile } from "../services/userService";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/Profile.css";

// Define interface for profile data
interface UserProfile {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  birthDay?: string;
  gender?: string;
  school?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    birthDay: "",
    gender: "",
    school: "",
  });
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    description: string;
  }>({ show: false, type: 'info', message: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRoleDisplayName = (role: string): string => {
    if (!role) return 'Người dùng';
    switch (role.toLowerCase()) {
      case 'admin': return 'Quản trị viên';
      case 'event_manager': return 'Quản lý sự kiện';
      case 'parent': return 'Phụ huynh';
      case 'student': return 'Học sinh';
      default: return 'Người dùng';
    }
  };

  const handleEditClick = async () => {
    setEditData({
      fullName: profile?.fullName || "",
      phoneNumber: profile?.phoneNumber || "",
      address: profile?.address || "",
      birthDay: profile?.birthDay ? profile.birthDay.split('T')[0] : "",
      gender: profile?.gender || "",
      school: profile?.school || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return true;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date <= new Date();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.fullName?.trim()) {
      setAlert({ show: true, type: "error", message: "Lỗi", description: "Vui lòng nhập họ và tên" });
      return;
    }
    if (editData.birthDay && !isValidDate(editData.birthDay)) {
      setAlert({ show: true, type: "error", message: "Lỗi", description: "Ngày sinh không hợp lệ." });
      return;
    }

    setUpdateLoading(true);
    try {
      const updateDataPayload = {
        fullName: editData.fullName.trim(),
        phoneNumber: editData.phoneNumber?.trim() || undefined,
        address: editData.address?.trim() || undefined,
        birthDay: editData.birthDay || undefined,
        gender: editData.gender || undefined,
        school: editData.school?.trim() || undefined,
      };

      const updatedProfile = await updateProfile(currentUser.id, updateDataPayload);
      setProfile(updatedProfile);

      setAlert({ show: true, type: "success", message: "Thành công", description: "Cập nhật hồ sơ thành công!" });
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      setAlert({ show: true, type: "error", message: "Lỗi", description: "Không thể cập nhật hồ sơ." });
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await getCurrentUser();
        if (!userData?.id) throw new Error("Không thể xác thực người dùng.");
        setCurrentUser(userData);

        const profileData = await getProfile(userData.id);
        if (profileData.result) {
          setProfile(profileData.result);
        } else {
          setProfile({});
        }
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        setError("Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  if (loading) return <LoadingSpinner size="medium" message="Đang tải thông tin cá nhân..." />;
  if (error) return <div className="profile-container"><div className="profile-error">{error}</div></div>;

  // Display address directly from profile data
  const getDisplayAddress = () => {
    return profile?.address || 'Chưa cập nhật';
  };

  return (
      <div className="profile-container">
        <div className="profile-content">
          {alert.show && <Alert {...alert} onClose={() => setAlert(prev => ({ ...prev, show: false }))} />}

          {!profile?.fullName && !isEditing && (
              <div className="welcome-message">
                <h3>Chào mừng bạn!</h3>
                <p>Hãy cập nhật thông tin để có trải nghiệm tốt nhất.</p>
              </div>
          )}

          <div className="profile-header">
            <div className="profile-avatar"><FaUser className="avatar-icon" /></div>
            <div className="profile-title">
              <h1>{profile?.fullName || 'Người dùng mới'}</h1>
              <p className="role-badge">{currentUser?.role ? getRoleDisplayName(currentUser.role) : 'Người dùng'}</p>
            </div>
            {!isEditing && (
                <button className="edit-profile-button" onClick={handleEditClick}>
                  <FaEdit /> {profile?.fullName ? 'Chỉnh sửa' : 'Thêm thông tin'}
                </button>
            )}
            <button className="edit-profile-button" onClick={() => window.location.href = '/my-result'}>
              <FaUser/> Kết quả
            </button>
          </div>

          {!isEditing ? (
              <div className="profile-details">
                <div className="detail-section">
                  <h3>Thông tin cá nhân</h3>
                  <div className="detail-grid">
                    <div className="detail-item"><FaUser className="detail-icon" /><div><label>Họ và tên</label><p>{profile?.fullName || 'Chưa cập nhật'}</p></div></div>
                    <div className="detail-item"><FaEnvelope className="detail-icon" /><div><label>Email</label><p>{currentUser?.email || 'Chưa cập nhật'}</p></div></div>
                    <div className="detail-item"><FaPhone className="detail-icon" /><div><label>Số điện thoại</label><p>{profile?.phoneNumber || 'Chưa cập nhật'}</p></div></div>
                    <div className="detail-item"><FaCalendarAlt className="detail-icon" /><div><label>Ngày sinh</label><p>{profile?.birthDay ? new Date(profile.birthDay).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p></div></div>
                    <div className="detail-item"><FaVenusMars className="detail-icon" /><div><label>Giới tính</label><p>{profile?.gender === 'MALE' ? 'Nam' : profile?.gender === 'FEMALE' ? 'Nữ' : 'Chưa cập nhật'}</p></div></div>
                    <div className="detail-item"><FaSchool className="detail-icon" /><div><label>Trường học</label><p>{profile?.school || 'Chưa cập nhật'}</p></div></div>
                    <div className="detail-item full-width"><FaMapMarkerAlt className="detail-icon" /><div><label>Địa chỉ</label><p>{getDisplayAddress()}</p></div></div>
                  </div>
                </div>
              </div>
          ) : (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <div className="form-section">
                  <h3 className="edit-form-title">
                    <FaUserEdit className="title-icon" />
                    <span>Chỉnh sửa thông tin</span>
                  </h3>
                  <div className="form-grid">
                    <div className="profile-form-group">
                      <div className="input-wrapper">
                        <i className="fas fa-user"></i>
                        <input
                          type="text"
                          name="fullName"
                          value={editData.fullName}
                          onChange={e => setEditData({...editData, fullName: e.target.value})}
                          placeholder="Nhập họ và tên"
                          className="profile-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <div className="input-wrapper">
                        <i className="fas fa-phone"></i>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={editData.phoneNumber}
                          onChange={e => setEditData({...editData, phoneNumber: e.target.value})}
                          placeholder="Nhập số điện thoại"
                          className="profile-input"
                        />
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <div className="input-wrapper">
                        <i className="fas fa-calendar-alt"></i>
                        <input
                          type="date"
                          name="birthDay"
                          value={editData.birthDay}
                          onChange={e => setEditData({...editData, birthDay: e.target.value})}
                          max={new Date().toISOString().split('T')[0]}
                          className="profile-input"
                        />
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <div className="input-wrapper">
                        <i className="fas fa-venus-mars"></i>
                        <select
                          name="gender"
                          value={editData.gender}
                          onChange={e => setEditData({...editData, gender: e.target.value})}
                          className="profile-select"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <div className="input-wrapper">
                        <i className="fas fa-school"></i>
                        <input
                          type="text"
                          name="school"
                          value={editData.school}
                          onChange={e => setEditData({...editData, school: e.target.value})}
                          placeholder="Tên trường học"
                          className="profile-input"
                        />
                      </div>
                    </div>
                    <div className="profile-form-group full-width">
                      <div className="input-wrapper">
                        <i className="fas fa-map-marker-alt"></i>
                        <input
                          type="text"
                          name="address"
                          value={editData.address}
                          onChange={e => setEditData({...editData, address: e.target.value})}
                          placeholder="Địa chỉ chi tiết"
                          className="profile-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button" 
                    onClick={handleCancelEdit} 
                    disabled={updateLoading}
                  >
                    <FaTimes className="button-icon" />
                    <span>Hủy</span>
                  </button>
                  <button 
                    type="submit" 
                    className="save-button" 
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <span>Đang lưu...</span>
                    ) : (
                      <>
                        <FaSave className="button-icon" />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
          )}
        </div>
      </div>
  );
};

export default Profile;