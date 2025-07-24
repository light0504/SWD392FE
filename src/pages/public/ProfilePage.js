import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import defaultProfile from '../../assets/default-profile.png';
import { useAuth } from '../../hooks/useAuth';
import { getCustomerProfile, updateUserProfile } from '../../api/authAPI';
import { getMembershipByCustomer } from '../../api/membershipAPI';
import { useNavigate } from 'react-router-dom';

const genderMap = {
  1: 'Nam',
  2: 'Nữ',
  0: 'Khác',
  MALE: 1,
  FEMALE: 2,
  OTHER: 0
};

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [memberships, setMemberships] = useState([]);
  const [changedFields, setChangedFields] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await getCustomerProfile();
        const profile = res.data || {};
        setCurrentUser(profile);
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phoneNumber: profile.phone || '',
          gender: profile.gender || '',
          address: profile.address || '',
          imgURL: profile.imgURL || ''
        });
      } catch {
        setError('Không thể tải hồ sơ người dùng.');
      } finally {
        setLoading(false);
      }
    };

    const fetchMemberships = async () => {
      try {
        const res = await getMembershipByCustomer(user.id);
        if (res?.isSuccess && res.data) {
          setMemberships([res.data]);
        } else {
          setMemberships([]);
        }
      } catch {
        setMemberships([]);
      } finally {
        setLoadingMemberships(false);
      }
    };

    fetchProfile();
    fetchMemberships();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newVal = name === 'gender' ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: newVal }));
    if (currentUser?.[name] !== newVal) {
      setChangedFields((prev) => ({ ...prev, [name]: newVal }));
    } else {
      const updated = { ...changedFields };
      delete updated[name];
      setChangedFields(updated);
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
      const res = await updateUserProfile(changedFields);
      if (res?.isSuccess) {
        await getCustomerProfile().then((response) =>
          setCurrentUser(response.data)
        );
        setSuccess('Cập nhật thành công!');
        setChangedFields({});
        setIsEditing(false);
      } else {
        setError(res.message || 'Cập nhật thất bại.');
      }
    } catch {
      setError('Lỗi khi cập nhật hồ sơ.');
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phoneNumber: currentUser.phone || '',
        gender:
          typeof currentUser.gender === 'number'
            ? currentUser.gender
            : genderMap[currentUser.gender] ?? '',
        address: currentUser.address || '',
        imgURL: currentUser.imgURL || ''
      });
    }
    setChangedFields({});
    setIsEditing(false);
    setError('');
  };

  if (loading) return <div className="profile-container"><h2>Đang tải...</h2></div>;

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
                src={currentUser?.imgURL || defaultProfile}
                alt="Profile"
                className="user-profile-img"
              />
            </div>

            <div className="memberships-section">
              <h3 className="memberships-title">Gói thành viên</h3>
              <div className="current-membership">
                {loadingMemberships
                  ? 'Đang tải...'
                  : memberships[0]?.membershipName || 'Chưa có'}
              </div>
            </div>
          </div>

          <div className="profile-info">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <InputField label="Họ" name="firstName" value={formData.firstName} onChange={handleChange} />
                <InputField label="Tên" name="lastName" value={formData.lastName} onChange={handleChange} />
                <InputField label="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} type="tel" />
                <SelectField label="Giới tính" name="gender" value={formData.gender} onChange={handleChange} />
                <InputField label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} />
                <InputField label="Ảnh đại diện (URL)" name="imgURL" value={formData.imgURL} onChange={handleChange} type="url" />

                <div className="form-buttons">
                  <button type="submit" className="save-button" disabled={!Object.keys(changedFields).length}>Lưu</button>
                  <button type="button" className="cancel-button" onClick={handleCancel}>Huỷ</button>
                </div>
              </form>
            ) : (
              <>
                <ViewField label="Họ và Tên" value={`${currentUser?.lastName} ${currentUser?.firstName}`} />
                <ViewField label="Email" value={currentUser?.email} />
                <ViewField label="Số điện thoại" value={currentUser?.phone || 'Chưa có'} />
                <ViewField label="Giới tính" value={genderMap[currentUser?.gender] || 'Chưa có'} />
                <ViewField label="Địa chỉ" value={currentUser?.address || 'Chưa có'} />
                <button className="edit-button" onClick={() => setIsEditing(true)}>Sửa</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div className="profile-field">
      <label>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} />
    </div>
  );
}

function SelectField({ label, name, value, onChange }) {
  return (
    <div className="profile-field">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        <option value="">Chọn giới tính</option>
        <option value={1}>Nam</option>
        <option value={2}>Nữ</option>
        <option value={0}>Khác</option>
      </select>
    </div>
  );
}

function ViewField({ label, value }) {
  return (
    <div className="profile-field">
      <label>{label}</label>
      <div className="profile-view-box">{value}</div>
    </div>
  );
}
