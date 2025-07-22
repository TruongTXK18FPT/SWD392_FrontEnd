import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEye,
  FaClock,
  FaUsers,
  FaDollarSign,
  FaCheck,
  FaTimes,
  FaPause,
  FaPlay,
} from 'react-icons/fa';
import Button from '../components/Button';
import Alert from '../components/Alert';
import '../styles/EventManagerPage.css';
import { Seminar } from '../types/Seminar';
import { 
  createSeminar, 
  fetchAllSeminars, 
  updateSeminarStatus, 
  CreateSeminarRequest 
} from '../api/SeminarApi';

const EventManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
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

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const data = await fetchAllSeminars();
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
      console.log('📄 Complete seminar data being sent:', JSON.stringify(seminarData, null, 2));

      await createSeminar(seminarData);
      
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
    try {
      await updateSeminarStatus(seminarId, newStatus);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Cập nhật trạng thái thành công!',
      });

      // Refresh seminars list
      fetchSeminars();
      
    } catch (error) {
      console.error('Failed to update status:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Không thể cập nhật trạng thái',
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
          <FaEye /> Xem tất cả hội thảo
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
                    <img src={seminar.imageUrl} alt={seminar.title} />
                  </div>
                  <div className="seminar-content">
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

                    <div className="seminar-status">
                      {getStatusBadge(seminar.status)}
                      {getApprovalBadge(seminar.statusApprove)}
                    </div>

                    <div className="seminar-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FaPlay />}
                        onClick={() => handleStatusUpdate(seminar.id, 'ONGOING')}
                        disabled={seminar.status === 'ONGOING'}
                      >
                        Bắt đầu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FaPause />}
                        onClick={() => handleStatusUpdate(seminar.id, 'PENDING')}
                        disabled={seminar.status === 'PENDING'}
                      >
                        Tạm dừng
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FaCheck />}
                        onClick={() => handleStatusUpdate(seminar.id, 'COMPLETED')}
                        disabled={seminar.status === 'COMPLETED'}
                      >
                        Hoàn thành
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FaTimes />}
                        onClick={() => handleStatusUpdate(seminar.id, 'CANCELLED')}
                        disabled={seminar.status === 'CANCELLED'}
                      >
                        Hủy
                      </Button>
                    </div>
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
