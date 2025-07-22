import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditSeminarPage.css';

interface SeminarFormData {
  title: string;
  description: string;
  duration: number;
  price: number;
  slot: number;
  meetingUrl: string;
  formUrl: string;
  imageUrl: string;
}

const EditSeminarPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SeminarFormData>({
    title: '',
    description: '',
    duration: 0,
    price: 0,
    slot: 0,
    meetingUrl: '',
    formUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    // Gọi API để lấy thông tin seminar hiện tại theo id
    fetch(`/api/seminars/${id}`)
      .then(res => res.json())
      .then(data => setFormData(data))
      .catch(() => alert('Không tìm thấy hội thảo hoặc có lỗi xảy ra.'));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'duration' || name === 'price' || name === 'slot' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.price < 1 || formData.slot < 1) {
      alert('Giá vé và số lượng slot phải lớn hơn 0');
      return;
    }

    // Gửi PUT lên server
    fetch(`/api/seminars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        alert('Cập nhật hội thảo thành công!');
        navigate('/seminars');
      })
      .catch(() => alert('Có lỗi xảy ra khi cập nhật hội thảo.'));
  };

  return (
    <div className="seminar-form-page">
      <h1>Chỉnh sửa hội thảo</h1>
      <form onSubmit={handleSubmit} className="seminar-form">
        <label>Tiêu đề
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>

        <label>Mô tả
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </label>

        <div className="form-row">
          <label>Thời lượng (phút)
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} required />
          </label>
          <label>Giá vé (VND)
            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </label>
          <label>Số lượng slot
            <input type="number" name="slot" value={formData.slot} onChange={handleChange} required />
          </label>
        </div>

        <label>Link Google Meet
          <input type="text" name="meetingUrl" value={formData.meetingUrl} onChange={handleChange} />
        </label>

        <label>Link Google Form (đăng ký)
          <input type="text" name="formUrl" value={formData.formUrl} onChange={handleChange} />
        </label>

        <label>Ảnh poster (URL)
          <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
        </label>

        <button type="submit" className="submit-btn">Lưu chỉnh sửa</button>
      </form>
    </div>
  );
};

export default EditSeminarPage;
