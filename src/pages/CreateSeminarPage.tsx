import React, { useState } from 'react';
import '../styles/CreateSeminarPage.css';

interface SeminarForm {
  title: string;
  description: string;
  duration: number;
  price: number;
  meetingUrl: string;
  formUrl: string;
  slot: number;
  imageUrl: string;
  startTime: string;
  endTime: string;
}

const CreateSeminarPage: React.FC = () => {
  const [formData, setFormData] = useState<SeminarForm>({
    title: '',
    description: '',
    duration: 60,
    price: 0,
    meetingUrl: '',
    formUrl: '',
    slot: 50,
    imageUrl: '',
    startTime: '',
    endTime: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' || name === 'slot'
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit seminar data:', formData);
    
    // Gửi API tạo hội thảo tại đây
  };

  return (
    <div className="create-seminar-container">
      <h2>Tạo Hội Thảo Mới</h2>
      <form onSubmit={handleSubmit} className="seminar-form">
        <div className="form-group">
          <label>Tiêu đề</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Thời lượng (phút)</label>
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} min={1} />
          </div>

          <div className="form-group">
            <label>Giá vé (VND)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} />
          </div>

          <div className="form-group">
            <label>Số lượng slot</label>
            <input type="number" name="slot" value={formData.slot} onChange={handleChange} min={1} />
          </div>
        </div>

        <div className="form-group">
          <label>Thời gian bắt đầu</label>
          <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Thời gian kết thúc</label>
          <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Link Google Meet</label>
          <input type="url" name="meetingUrl" value={formData.meetingUrl} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Link Google Form (đăng ký)</label>
          <input type="url" name="formUrl" value={formData.formUrl} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Link ảnh minh hoạ</label>
          <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
        </div>

        <button type="submit" className="submit-btn">Tạo hội thảo</button>
      </form>
    </div>
  );
};

export default CreateSeminarPage;
