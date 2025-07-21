import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../api/authAPI';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
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

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        address: user.address || '',
        imgURL: user.imgURL || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only track field if it's different from original value
    if (value !== user[name]) {
      setChangedFields(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      // Remove field if it's back to original value
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
    
    // Only proceed if there are changes
    if (Object.keys(changedFields).length === 0) {
      setIsEditing(false);
      return;
    }
    
    try {
      const response = await updateUserProfile(changedFields);
      if (response) {
        setUser({ ...user, ...changedFields });
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setChangedFields({}); // Reset changed fields
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Update error:', err);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      gender: user?.gender || '',
      address: user?.address || '',
      imgURL: user?.imgURL || ''
    });
    setChangedFields({});
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>My profile</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-field">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="profile-field">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="profile-field">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="profile-field">
              <label>Profile Image URL</label>
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
          <div className="profile-info">
            <div className="profile-field">
              <label>Name</label>
              <p>{user?.firstName} {user?.lastName}</p>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <p>{user?.phoneNumber || 'Not specified'}</p>
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <p>{user?.gender || 'Not specified'}</p>
            </div>
            <div className="profile-field">
              <label>Address</label>
              <p>{user?.address || 'Not specified'}</p>
            </div>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
