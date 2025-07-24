import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEye,
  FaClock,
  FaUsers,
  FaDollarSign,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSave,
} from 'react-icons/fa';
import Button from '../components/Button';
import Alert from '../components/Alert';
import '../styles/EventManagerPage.css';
import { Seminar } from '../types/Seminar';
import { 
  createSeminar, 
  fetchEventManagerSeminars, 
  updateSeminarStatus, 
  updateSeminar,
  deleteSeminar,
  CreateSeminarRequest 
} from '../api/SeminarApi';
import { getCurrentUser } from '../services/userService';

const EventManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
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

  const [formData, setFormData] = useState<CreateSeminarRequest>({
    title: '',
    description: '',
    duration: 1, // Match your successful test
    price: 0,
    meetingUrl: '',
    formUrl: '',
    slot: 10, // Match your successful test  
    imageUrl: '',
    startingTime: '',
    endingTime: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // State for editing seminars
  const [editingSeminarId, setEditingSeminarId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<CreateSeminarRequest>({
    title: '',
    description: '',
    duration: 1,
    price: 0,
    meetingUrl: '',
    formUrl: '',
    slot: 10,
    imageUrl: '',
    startingTime: '',
    endingTime: '',
  });
  const [editFormErrors, setEditFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user first
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        
        // Then fetch seminars created by this event manager
        if (userData?.id) {
          console.log('🔄 Fetching seminars for event manager:', userData.id);
          const seminarsData = await fetchEventManagerSeminars(userData.id);
          setSeminars(seminarsData);
        } else {
          console.warn('⚠️ No user ID found, cannot fetch event manager seminars');
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setAlert({
          show: true,
          type: 'error',
          message: 'Không thể tải dữ liệu',
          description: 'Vui lòng thử lại sau',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchSeminars = async () => {
    if (!currentUser?.id) {
      console.warn('⚠️ No current user ID, cannot fetch seminars');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Refreshing seminars for event manager:', currentUser.id);
      const data = await fetchEventManagerSeminars(currentUser.id);
      setSeminars(data);
    } catch (error) {
      console.error('Failed to fetch seminars:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể tải danh sách hội thảo',
        description: 'Vui lòng thử lại sau',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) errors.title = 'Tiêu đề là bắt buộc';
    if (formData.title.length > 255) errors.title = 'Tiêu đề không được vượt quá 255 ký tự';
    
    if (!formData.description.trim()) errors.description = 'Mô tả là bắt buộc';
    if (formData.description.length > 1000) errors.description = 'Mô tả không được vượt quá 1000 ký tự';
    
    if (formData.duration < 1) errors.duration = 'Thời lượng phải lớn hơn 0';
    if (formData.duration > 480) errors.duration = 'Thời lượng không được vượt quá 480 phút (8 giờ)';
    
    if (formData.price < 0) errors.price = 'Giá không được âm';
    
    if (formData.slot < 1) errors.slot = 'Số slot phải lớn hơn 0';
    if (formData.slot > 1000) errors.slot = 'Số slot không được vượt quá 1000';
    
    // Make URL fields optional - only validate if they have values
    if (formData.meetingUrl && formData.meetingUrl.trim() && !formData.meetingUrl.match(/^https?:\/\/.*/)) {
      errors.meetingUrl = 'URL phòng họp phải là URL hợp lệ';
    }
    
    if (formData.formUrl && formData.formUrl.trim() && !formData.formUrl.match(/^https?:\/\/.*/)) {
      errors.formUrl = 'URL form đăng ký phải là URL hợp lệ';
    }
    
    if (formData.imageUrl && formData.imageUrl.trim() && !formData.imageUrl.match(/^https?:\/\/.*/)) {
      errors.imageUrl = 'URL hình ảnh phải là URL hợp lệ';
    }
    
    if (!formData.startingTime) errors.startingTime = 'Thời gian bắt đầu là bắt buộc';
    if (!formData.endingTime) errors.endingTime = 'Thời gian kết thúc là bắt buộc';
    
    // Check if start time is in the future (at least 1 hour from now)
    if (formData.startingTime) {
      const startTime = new Date(formData.startingTime);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
      
      if (startTime <= oneHourFromNow) {
        errors.startingTime = 'Thời gian bắt đầu phải ít nhất 1 giờ sau thời điểm hiện tại';
      }
    }
    
    // Check if end time is after start time (at least 30 minutes later)
    if (formData.startingTime && formData.endingTime) {
      const startTime = new Date(formData.startingTime);
      const endTime = new Date(formData.endingTime);
      const minimumDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      if (endTime <= startTime) {
        errors.endingTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      } else if (endTime.getTime() - startTime.getTime() < minimumDuration) {
        errors.endingTime = 'Hội thảo phải kéo dài ít nhất 30 phút';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' || name === 'slot'
        ? Number(value)
        : value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatDateTimeForAPI = (dateTimeLocal: string): string => {
    // dateTimeLocal comes in format: "2025-07-23T19:42"
    if (!dateTimeLocal) {
      throw new Error('Date time is required');
    }
    
    // IMPORTANT: Keep the local time without timezone conversion
    // The backend expects: "yyyy-MM-dd HH:mm" (WITHOUT seconds)
    
    // Simple format: Replace T with space (NO seconds)
    const formatted = dateTimeLocal.replace('T', ' ');
    
    console.log(`🕐 Original input (local time): "${dateTimeLocal}"`);
    console.log(`🕐 Formatted for API (NO seconds): "${formatted}"`);
    
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    try {
      // Enhanced user authentication check with debugging
      console.log('🔍 Form submission - Current user state:', currentUser);
      console.log('🔍 Form submission - User ID:', currentUser?.id);
      console.log('🔍 Form submission - User ID type:', typeof currentUser?.id);
      console.log('🔍 Form submission - User email:', currentUser?.email);
      console.log('🔍 Form submission - User role:', currentUser?.role);
      
      // If user is not loaded, try to fetch it again
      let userToUse = currentUser;
      if (!currentUser) {
        console.log('⚠️ User not found in state, attempting to fetch fresh user data...');
        try {
          userToUse = await getCurrentUser();
          setCurrentUser(userToUse);
          console.log('✅ Fresh user data fetched:', userToUse);
        } catch (userError) {
          console.error('❌ Failed to fetch fresh user data:', userError);
          throw new Error('User data not loaded. Please refresh the page and try again.');
        }
      }
      
      if (!userToUse) {
        throw new Error('User data not loaded. Please refresh the page and try again.');
      }
      
      if (!userToUse.id) {
        throw new Error('User ID not found. Please log out and log back in.');
      }

      const seminarData: CreateSeminarRequest = {
        ...formData,
        startingTime: formatDateTimeForAPI(formData.startingTime),
        endingTime: formatDateTimeForAPI(formData.endingTime),
      };

      console.log('📅 Raw form data times:');
      console.log('  startingTime input:', formData.startingTime);
      console.log('  endingTime input:', formData.endingTime);
      console.log('📅 Formatted times for API:');
      console.log('  startingTime:', seminarData.startingTime);
      console.log('  endingTime:', seminarData.endingTime);
      console.log('👤 Current user ID:', currentUser.id);
      console.log('� User ID type:', typeof currentUser.id);
      console.log('�📄 Complete seminar data being sent:', JSON.stringify(seminarData, null, 2));
      console.log('📋 Checking data format matches backend expectations:');
      console.log('  ✓ title:', typeof seminarData.title, '=', seminarData.title);
      console.log('  ✓ description:', typeof seminarData.description, '=', seminarData.description);
      console.log('  ✓ duration:', typeof seminarData.duration, '=', seminarData.duration);
      console.log('  ✓ price:', typeof seminarData.price, '=', seminarData.price);
      console.log('  ✓ meetingUrl:', typeof seminarData.meetingUrl, '=', seminarData.meetingUrl);
      console.log('  ✓ formUrl:', typeof seminarData.formUrl, '=', seminarData.formUrl);
      console.log('  ✓ slot:', typeof seminarData.slot, '=', seminarData.slot);
      console.log('  ✓ imageUrl:', typeof seminarData.imageUrl, '=', seminarData.imageUrl);
      console.log('  ✓ startingTime format:', seminarData.startingTime);
      console.log('  ✓ endingTime format:', seminarData.endingTime);

      await createSeminar(seminarData, userToUse.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Tạo hội thảo thành công!',
        description: 'Hội thảo đã được tạo và đang chờ duyệt.',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        duration: 1,
        price: 0,
        meetingUrl: '',
        formUrl: '',
        slot: 10,
        imageUrl: '',
        startingTime: '',
        endingTime: '',
      });

      // Refresh seminars list
      fetchSeminars();
      
      // Switch to view tab
      setActiveTab('view');
      
    } catch (error) {
      console.error('Failed to create seminar:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể tạo hội thảo',
        description: 'Vui lòng kiểm tra thông tin và thử lại.',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusUpdate = async (seminarId: number, newStatus: string) => {
    if (!currentUser?.id) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể xác định thông tin người dùng',
        description: 'Vui lòng đăng nhập lại.',
      });
      return;
    }

    // Find the seminar to verify ownership
    const seminar = seminars.find(s => s.id === seminarId);
    if (!seminar) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Không tìm thấy hội thảo',
        description: 'Hội thảo có thể đã bị xóa hoặc bạn không có quyền truy cập.',
      });
      return;
    }

    // Verify that the seminar belongs to the current user
    if (seminar.createBy !== currentUser.id) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Không có quyền cập nhật',
        description: 'Bạn chỉ có thể cập nhật hội thảo do mình tạo.',
      });
      return;
    }

    // Verify that the seminar is approved
    if (seminar.statusApprove !== 'APPROVED') {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Hội thảo chưa được duyệt',
        description: 'Chỉ có thể cập nhật trạng thái khi hội thảo đã được admin duyệt.',
      });
      return;
    }

    try {
      console.log('🔄 Updating seminar status:', {
        seminarId,
        newStatus,
        eventManagerId: currentUser.id,
        currentStatus: seminar.status,
        seminarTitle: seminar.title,
        seminarCreatedBy: seminar.createBy
      });
      
      await updateSeminarStatus(seminarId, newStatus, currentUser.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Cập nhật trạng thái thành công!',
      });

      // Refresh seminars list
      fetchSeminars();
      
    } catch (error) {
      console.error('Failed to update status:', error);
      
      // Show more specific error messages based on the error
      let errorMessage = 'Không thể cập nhật trạng thái';
      let errorDescription = 'Vui lòng thử lại sau.';
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorMessage = 'Lỗi server khi cập nhật trạng thái';
          errorDescription = 'Server đang gặp sự cố. Vui lòng liên hệ admin hoặc thử lại sau.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Không có quyền cập nhật';
          errorDescription = 'Bạn không có quyền cập nhật trạng thái hội thảo này.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Không tìm thấy hội thảo';
          errorDescription = 'Hội thảo có thể đã bị xóa hoặc không tồn tại.';
        }
      }
      
      setAlert({
        show: true,
        type: 'error',
        message: errorMessage,
        description: errorDescription,
      });
    }
  };

  // Handle editing seminar
  const handleEditSeminar = (seminar: Seminar) => {
    setEditingSeminarId(seminar.id);
    setEditFormData({
      title: seminar.title,
      description: seminar.description,
      duration: seminar.duration,
      price: seminar.price,
      meetingUrl: seminar.meetingUrl,
      formUrl: seminar.formUrl,
      slot: seminar.slot,
      imageUrl: seminar.imageUrl,
      startingTime: seminar.startingTime,
      endingTime: seminar.endingTime,
    });
    setEditFormErrors({});
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSeminarId(null);
    setEditFormData({
      title: '',
      description: '',
      duration: 1,
      price: 0,
      meetingUrl: '',
      formUrl: '',
      slot: 10,
      imageUrl: '',
      startingTime: '',
      endingTime: '',
    });
    setEditFormErrors({});
  };

  // Handle edit form input change
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' || name === 'slot'
        ? Number(value)
        : value,
    }));
    
    // Clear error when user starts typing
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Save edited seminar
  const handleSaveEdit = async () => {
    if (!currentUser?.id || !editingSeminarId) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể xác định thông tin người dùng hoặc hội thảo',
      });
      return;
    }

    try {
      // Format times for API
      const formattedData = {
        ...editFormData,
        startingTime: editFormData.startingTime.includes('T') 
          ? editFormData.startingTime.replace('T', ' ')
          : editFormData.startingTime,
        endingTime: editFormData.endingTime.includes('T')
          ? editFormData.endingTime.replace('T', ' ')
          : editFormData.endingTime,
      };

      await updateSeminar(editingSeminarId, formattedData, currentUser.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Cập nhật hội thảo thành công!',
      });

      // Refresh seminars list and exit edit mode
      fetchSeminars();
      handleCancelEdit();
      
    } catch (error) {
      console.error('Failed to update seminar:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể cập nhật hội thảo',
        description: 'Vui lòng kiểm tra thông tin và thử lại.',
      });
    }
  };

  // Handle delete seminar
  const handleDeleteSeminar = async (seminarId: number) => {
    if (!currentUser?.id) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể xác định thông tin người dùng',
      });
      return;
    }

    // Find the seminar to verify it can be deleted
    const seminar = seminars.find(s => s.id === seminarId);
    if (!seminar) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Không tìm thấy hội thảo',
      });
      return;
    }

    // Check if seminar is approved (cannot delete approved seminars)
    if (seminar.statusApprove === 'APPROVED') {
      setAlert({
        show: true,
        type: 'warning',
        message: 'Không thể xóa hội thảo đã được duyệt',
        description: 'Hội thảo đã được admin duyệt không thể xóa.',
      });
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hội thảo "${seminar.title}"?`)) {
      return;
    }

    try {
      await deleteSeminar(seminarId, currentUser.id);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Đã xóa hội thảo thành công!',
      });

      // Refresh seminars list
      fetchSeminars();
      
    } catch (error) {
      console.error('Failed to delete seminar:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể xóa hội thảo',
        description: 'Vui lòng thử lại sau.',
      });
    }
  };

  const getStatusBadge = (status: Seminar['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="status-badge pending">Chờ diễn ra</span>;
      case 'ONGOING':
        return <span className="status-badge ongoing">Đang diễn ra</span>;
      case 'COMPLETED':
        return <span className="status-badge completed">Đã kết thúc</span>;
      case 'CANCELLED':
        return <span className="status-badge cancelled">Đã hủy</span>;
      default:
        return null;
    }
  };

  const getApprovalBadge = (statusApprove: Seminar['statusApprove']) => {
    switch (statusApprove) {
      case 'PENDING':
        return <span className="approval-badge pending">Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="approval-badge approved">Đã duyệt</span>;
      case 'REJECTED':
        return <span className="approval-badge rejected">Bị từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div className="event-manager-page">
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        />
      )}

      <div className="page-header">
        <h1>Quản lý Hội thảo</h1>
        <p>Tạo, quản lý và cập nhật trạng thái hội thảo</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          <FaEye /> Hội thảo của tôi
        </button>
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <FaPlus /> Tạo hội thảo mới
        </button>
      </div>

      {activeTab === 'view' && (
        <div className="seminars-section">
          {loading ? (
            <div className="loading-state">
              <div>Đang tải danh sách hội thảo...</div>
            </div>
          ) : (
            <div className="seminars-grid">
              {seminars.map((seminar) => (
                <div key={seminar.id} className="seminar-card">
                  <div className="seminar-image">
                    <img 
                      src={seminar.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+U2VtaW5hcjwvdGV4dD4KPHN2Zz4='} 
                      alt={seminar.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+U2VtaW5hcjwvdGV4dD4KPHN2Zz4=';
                      }}
                    />
                  </div>
                  <div className="seminar-content">
                    {editingSeminarId === seminar.id ? (
                      // Edit mode
                      <div className="edit-form">
                        <div className="form-group">
                          <label>Tiêu đề *</label>
                          <input
                            type="text"
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditInputChange}
                            className={editFormErrors.title ? 'error' : ''}
                            maxLength={255}
                          />
                          {editFormErrors.title && <span className="error-text">{editFormErrors.title}</span>}
                        </div>

                        <div className="form-group">
                          <label>Mô tả *</label>
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditInputChange}
                            rows={3}
                            className={editFormErrors.description ? 'error' : ''}
                            maxLength={1000}
                          />
                          {editFormErrors.description && <span className="error-text">{editFormErrors.description}</span>}
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Thời lượng (phút) *</label>
                            <input
                              type="number"
                              name="duration"
                              value={editFormData.duration}
                              onChange={handleEditInputChange}
                              min="1"
                              max="480"
                              className={editFormErrors.duration ? 'error' : ''}
                            />
                            {editFormErrors.duration && <span className="error-text">{editFormErrors.duration}</span>}
                          </div>

                          <div className="form-group">
                            <label>Giá (VNĐ) *</label>
                            <input
                              type="number"
                              name="price"
                              value={editFormData.price}
                              onChange={handleEditInputChange}
                              min="0"
                              step="1000"
                              className={editFormErrors.price ? 'error' : ''}
                            />
                            {editFormErrors.price && <span className="error-text">{editFormErrors.price}</span>}
                          </div>

                          <div className="form-group">
                            <label>Số chỗ *</label>
                            <input
                              type="number"
                              name="slot"
                              value={editFormData.slot}
                              onChange={handleEditInputChange}
                              min="1"
                              max="1000"
                              className={editFormErrors.slot ? 'error' : ''}
                            />
                            {editFormErrors.slot && <span className="error-text">{editFormErrors.slot}</span>}
                          </div>
                        </div>

                        <div className="edit-actions">
                          <Button
                            onClick={handleSaveEdit}
                            variant="success"
                            size="sm"
                          >
                            <FaSave /> Lưu
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            <FaTimes /> Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <h3>{seminar.title}</h3>
                        <p className="seminar-description">{seminar.description}</p>
                        
                        <div className="seminar-meta">
                          <div className="meta-item">
                            <FaClock /> {seminar.duration} phút
                          </div>
                          <div className="meta-item">
                            <FaUsers /> {seminar.slot} slots
                          </div>
                          <div className="meta-item">
                            <FaDollarSign /> {seminar.price === 0 ? 'Miễn phí' : `${seminar.price.toLocaleString()}₫`}
                          </div>
                        </div>

                        <div className="seminar-times">
                          <div className="meta-item">
                            <strong>Bắt đầu:</strong> {new Date(seminar.startingTime).toLocaleString('vi-VN')}
                          </div>
                          <div className="meta-item">
                            <strong>Kết thúc:</strong> {new Date(seminar.endingTime).toLocaleString('vi-VN')}
                          </div>
                        </div>

                        <div className="seminar-status">
                          {getStatusBadge(seminar.status)}
                          {getApprovalBadge(seminar.statusApprove)}
                        </div>

                        {/* Edit and Delete buttons for pending seminars */}
                        {seminar.statusApprove === 'PENDING' && (
                          <div className="seminar-actions">
                            <Button
                              onClick={() => handleEditSeminar(seminar)}
                              variant="outline"
                              size="sm"
                            >
                              <FaEdit /> Chỉnh sửa
                            </Button>
                            <Button
                              onClick={() => handleDeleteSeminar(seminar.id)}
                              variant="danger"
                              size="sm"
                            >
                              <FaTrash /> Xóa
                            </Button>
                          </div>
                        )}

                        {/* Only show status update dropdown if seminar is approved */}
                        {seminar.statusApprove === 'APPROVED' && (
                          <div className="seminar-actions">
                            <div className="status-update-section">
                              <label>Cập nhật trạng thái:</label>
                              <select
                                value={seminar.status}
                                onChange={(e) => handleStatusUpdate(seminar.id, e.target.value)}
                                className="status-select"
                              >
                                <option value="PENDING">Chờ diễn ra</option>
                                <option value="ONGOING">Đang diễn ra</option>
                                <option value="COMPLETED">Đã hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Show message if not approved yet */}
                        {seminar.statusApprove === 'PENDING' && (
                          <div className="pending-approval-message">
                            <p>⏳ Hội thảo đang chờ admin duyệt</p>
                          </div>
                        )}

                        {seminar.statusApprove === 'REJECTED' && (
                          <div className="rejected-message">
                            <p>❌ Hội thảo đã bị từ chối bởi admin</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-section">
          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-group">
              <label>Tiêu đề *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề hội thảo"
                className={formErrors.title ? 'error' : ''}
                maxLength={255}
              />
              {formErrors.title && <span className="error-text">{formErrors.title}</span>}
            </div>

            <div className="form-group">
              <label>Mô tả *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả hội thảo"
                className={formErrors.description ? 'error' : ''}
                maxLength={1000}
                rows={4}
              />
              {formErrors.description && <span className="error-text">{formErrors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thời lượng (phút) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min={1}
                  max={480}
                  className={formErrors.duration ? 'error' : ''}
                />
                {formErrors.duration && <span className="error-text">{formErrors.duration}</span>}
              </div>

              <div className="form-group">
                <label>Giá vé (VND) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min={0}
                  className={formErrors.price ? 'error' : ''}
                />
                {formErrors.price && <span className="error-text">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label>Số lượng slot *</label>
                <input
                  type="number"
                  name="slot"
                  value={formData.slot}
                  onChange={handleInputChange}
                  min={1}
                  max={1000}
                  className={formErrors.slot ? 'error' : ''}
                />
                {formErrors.slot && <span className="error-text">{formErrors.slot}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thời gian bắt đầu *</label>
                <input
                  type="datetime-local"
                  name="startingTime"
                  value={formData.startingTime}
                  onChange={handleInputChange}
                  className={formErrors.startingTime ? 'error' : ''}
                />
                {formErrors.startingTime && <span className="error-text">{formErrors.startingTime}</span>}
              </div>

              <div className="form-group">
                <label>Thời gian kết thúc *</label>
                <input
                  type="datetime-local"
                  name="endingTime"
                  value={formData.endingTime}
                  onChange={handleInputChange}
                  className={formErrors.endingTime ? 'error' : ''}
                />
                {formErrors.endingTime && <span className="error-text">{formErrors.endingTime}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>URL phòng họp</label>
              <input
                type="url"
                name="meetingUrl"
                value={formData.meetingUrl}
                onChange={handleInputChange}
                placeholder="https://meet.google.com/..."
                className={formErrors.meetingUrl ? 'error' : ''}
              />
              {formErrors.meetingUrl && <span className="error-text">{formErrors.meetingUrl}</span>}
            </div>

            <div className="form-group">
              <label>URL form đăng ký</label>
              <input
                type="url"
                name="formUrl"
                value={formData.formUrl}
                onChange={handleInputChange}
                placeholder="https://forms.google.com/..."
                className={formErrors.formUrl ? 'error' : ''}
              />
              {formErrors.formUrl && <span className="error-text">{formErrors.formUrl}</span>}
            </div>

            <div className="form-group">
              <label>URL hình ảnh</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className={formErrors.imageUrl ? 'error' : ''}
              />
              {formErrors.imageUrl && <span className="error-text">{formErrors.imageUrl}</span>}
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={formLoading}
                icon={<FaPlus />}
              >
                {formLoading ? 'Đang tạo...' : 'Tạo hội thảo'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventManagerPage;
