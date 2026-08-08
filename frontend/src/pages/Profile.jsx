import { useState, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';
// import { updateProfile, changePassword } from '../services/userService'; // Assume these exist

const Profile = () => {
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    // Simulated fetch
    setProfileData({ name: 'Admin User', email: 'admin@marketing.com' });
  }, []);

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully! (Simulated)');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password changed successfully! (Simulated)');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>User Profile</h1>
          <p>Manage your account settings and change your password.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <User size={20} /> Personal Information
          </h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="input-field" value={profileData.name} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="input-field" value={profileData.email} onChange={handleProfileChange} required />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
              <Save size={18} /> Update Profile
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Lock size={20} /> Change Password
          </h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" name="currentPassword" className="input-field" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" name="newPassword" className="input-field" value={passwordData.newPassword} onChange={handlePasswordChange} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" name="confirmPassword" className="input-field" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
              <Lock size={18} /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
