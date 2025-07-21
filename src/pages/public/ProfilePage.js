import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { getCustomerProfile, updateUserProfile } from '../../api/authAPI';
import axios from 'axios';

const genderMap = {
  0: 'Nam',
  1: 'Nữ',
  2: 'Other',
  'MALE': 0,
  'FEMALE': 1,
  'OTHER': 2
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    address: '',
    imgURL: ''
  });
  const [changedFields, setChangedFields] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const response = await getCustomerProfile();
      const profile = response.data || {};
      setUser(profile);
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        address: profile.address || '',
        imgURL: profile.imgURL || ''
      });
    } catch (err) {
      setError('Could not fetch user profile.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipByCustomer = async (customerId) => {
    setLoadingMemberships(true);
    try {
      const res = await axios.get(`/api/CustomerMembership/by-customer/${customerId}`);
      if (res.data && res.data.isSuccess && Array.isArray(res.data.data)) {
        setMemberships(res.data.data);
      } else {
        setMemberships([]);
      }
    } catch (err) {
      setMemberships([]);
    } finally {
      setLoadingMemberships(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchUserProfile();
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchMembershipByCustomer(user.id);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'gender') val = Number(value);
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
    if (user && val !== user[name]) {
      setChangedFields(prev => ({
        ...prev,
        [name]: val
      }));
    } else {
      setChangedFields(prev => {
        const newFields = { ...prev };
        delete newFields[name];
        return newFields;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (Object.keys(changedFields).length === 0) {
      setIsEditing(false);
      return;
    }
    try {
      const response = await updateUserProfile(changedFields);
      if (response && response.isSuccess) {
        await fetchUserProfile();
        setSuccess('Cập nhật profile thành công!');
        setIsEditing(false);
        setChangedFields({});
      } else {
        setError(response.message || 'Cập nhật profile thất bại.');
      }
    } catch (err) {
      setError('Cập nhật profile thất bại. Xin thử lại.');
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phone || '',
        gender: typeof user.gender === 'number' ? user.gender : (genderMap[user.gender] ?? ''),
        address: user.address || '',
        imgURL: user.imgURL || ''
      });
    }
    setChangedFields({});
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return <div className="profile-container"><h2>Đang tải...</h2></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Hồ sơ của tôi</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="profile-content">
          <div className="profile-left">
            <div className="profile-image">
              <img
                src={user?.imgURL || '/default-profile.png'}
                alt="Profile"
                className="user-profile-img"
              />
            </div>
            <div className="memberships-section">
              <h3 className="memberships-title">Gói thành viên</h3>
              {loadingMemberships ? (
                <div>Đang tải...</div>
              ) : (
                <div className="current-membership">
                   {memberships[0]?.name || 'Chưa có'}
                </div>
              )}
            </div>
          </div>
          <div className="profile-info">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="profile-field">
                  <label>Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value={0}>Nam</option>
                    <option value={1}>Nữ</option>
                    <option value={2}>Khác</option>
                  </select>
                </div>
                <div className="profile-field">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>URL của hình ảnh cho profile</label>
                  <input
                    type="url"
                    name="imgURL"
                    value={formData.imgURL}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-buttons">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={Object.keys(changedFields).length === 0}
                  >
                    Save
                  </button>
                  <button type="button" className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-field">
                  <label>Họ và Tên</label>
                  <div className="profile-view-box">{user?.firstName} {user?.lastName}</div>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <div className="profile-view-box">{user?.email}</div>
                </div>
                <div className="profile-field">
                  <label>Số điện thoại</label>
                  <div className="profile-view-box">{user?.phone || 'Not specified'}</div>
                </div>
                <div className="profile-field">
                  <label>Giới tính</label>
                  <div className="profile-view-box">{typeof user?.gender === 'number' ? genderMap[user.gender] : user?.gender || 'Not specified'}</div>
                </div>
                <div className="profile-field">
                  <label>Địa chỉ</label>
                  <div className="profile-view-box">{user?.address || 'Not specified'}</div>
                </div>
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Sửa
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
