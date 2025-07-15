import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [editing, setEditing] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState('None');
  const [review, setReview] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.firstName || user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
      });
      // If user has order history, set it here. Example:
      // setOrderHistory(user.orders || []); // This line is removed
    } else {
      // setOrderHistory([]); // This line is removed
    }
    // Fetch membership status (placeholder)
    setMembershipStatus('Active');
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    // Placeholder for API call to update profile
    setEditing(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleBuyMembership = () => {
    // Placeholder for API call
    setMembershipStatus('Active');
    setMessage('Membership purchased!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    // Placeholder for API call
    setReview('');
    setMessage('Thank you for your review!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="profile-page">
      <h1 style={{ marginTop: '32px' }}>My Profile</h1>
      {message && <div className="profile-message">{message}</div>}
      {/* Profile Info Section */}
      <section className="profile-section">
        <h2>Account Information</h2>
        {editing ? (
          <form onSubmit={handleProfileSave} className="profile-form">
            <label>
              Name:
              <input name="name" value={profile.name} onChange={handleProfileChange} required />
            </label>
            <label>
              Email:
              <input name="email" value={profile.email} onChange={handleProfileChange} required type="email" />
            </label>
            <label>
              Phone:
              <input name="phone" value={profile.phoneNumber} onChange={handleProfileChange} required />
            </label>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : (
          <div className="profile-info">
            <div><strong>Name:</strong> {profile.name}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Phone:</strong> {profile.phone}</div>
            <button onClick={() => setEditing(true)}>Edit</button>
          </div>
        )}
      </section>

      {/* Membership Section */}
      <section className="profile-section">
        <h2>Membership</h2>
        <div>Status: <strong>{membershipStatus}</strong></div>
        {membershipStatus !== 'Active' && (
          <button onClick={handleBuyMembership}>Buy Membership</button>
        )}
      </section>

      {/* Review Service Section */}
      <section className="profile-section">
        <h2>Review Service</h2>
        <form onSubmit={handleReviewSubmit} className="review-form">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            required
          />
          <button type="submit">Submit Review</button>
        </form>
      </section>
    </div>
  );
}
