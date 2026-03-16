import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import authService from '../../services/authService';
import api from '../../services/api';
import PlayfulButton from '../../components/PlayfulButton';
import gsap from 'gsap';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile Update State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change State
  const [pwData, setPwData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwLoading, setPwLoading] = useState(false);

  // Avatar State
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Delete Profile State
  const [agreeDelete, setAgreeDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        mobile: currentUser.mobile || ''
      });
      setLoading(false);
    }
    
    // GSAP Animations
    gsap.from('.profile-header-anim', {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
    
    gsap.from('.settings-card-anim', {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return alert('File size too large. Max 5MB allowed.');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    try {
      const res = await authService.updateAvatar(formData);
      const updatedUser = { ...user, avatar: res.avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile picture updated!');
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Error occurred'));
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.put(`/users/${user._id}`, {
        name: profileData.name,
        mobile: profileData.mobile
      });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Profile details updated successfully!');
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      return alert('New passwords do not match!');
    }
    if (pwData.newPassword.length < 8) {
      return alert('New password must be at least 8 characters long');
    }

    setPwLoading(true);
    try {
      await authService.changePassword({
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword
      });
      alert('Password changed successfully!');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert('Error: ' + (err.message || 'Failed to change password'));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!agreeDelete) return;
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/users/${user._id}`);
      alert('Your account has been deleted.');
      authService.logout();
      window.location.href = '/login';
    } catch (err) {
      alert('Deletion failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading || !user) return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.main}>
        <div style={styles.errorCard}>Loading Profile...</div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.main} className="section-padding-responsive">
        
        {/* Profile Header with Picture */}
        <div className="profile-header-anim" style={styles.profileHeader}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              {user.avatar ? (
                <img 
                  src={`${API_URL}${user.avatar}`} 
                  alt="Profile" 
                  style={styles.avatarImg} 
                />
              ) : (
                <span style={styles.initials}>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <label style={styles.cameraIcon}>
              <span role="img" aria-label="camera">📷</span>
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
            </label>
            {avatarLoading && <div style={styles.loadingOverlay}>...</div>}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.userName}>{user.name}</h1>
            <p style={styles.userRole}>{user.role.toUpperCase()}</p>
          </div>
        </div>

        <div style={styles.settingsGrid} className="grid-1-mobile grid-2-tablet">
          
          {/* Update Profile Details */}
          <div className="settings-card-anim" style={styles.card}>
            <h3 style={styles.cardTitle}>Update Profile Details</h3>
            <form style={styles.form} onSubmit={handleUpdateProfile}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name *</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  required 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input 
                  type="email" 
                  style={{...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed'}} 
                  value={user.email}
                  disabled 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mobile</label>
                <div style={styles.mobileInput}>
                  <span style={styles.prefix}>+92</span>
                  <input 
                    type="tel" 
                    style={styles.mobileField} 
                    placeholder="3058564053"
                    value={profileData.mobile}
                    onChange={(e) => setProfileData({...profileData, mobile: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <PlayfulButton type="submit" disabled={profileLoading} style={{ width: '100%' }}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </PlayfulButton>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="settings-card-anim" style={styles.card}>
            <h3 style={styles.cardTitle}>Change Password</h3>
            <form style={styles.form} onSubmit={handlePasswordChange}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Current Password</label>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="•••••••••••••••"
                  value={pwData.currentPassword}
                  onChange={(e) => setPwData({...pwData, currentPassword: e.target.value})}
                  required 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="New Password"
                  value={pwData.newPassword}
                  onChange={(e) => setPwData({...pwData, newPassword: e.target.value})}
                  required 
                />
                <span style={styles.hint}>Minimum 8 characters required</span>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Retype new Password</label>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="Retype new Password"
                  value={pwData.confirmPassword}
                  onChange={(e) => setPwData({...pwData, confirmPassword: e.target.value})}
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <PlayfulButton type="submit" disabled={pwLoading} style={{ width: '100%' }}>
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </PlayfulButton>
              </div>
            </form>
          </div>

          {/* Delete Profile */}
          <div className="settings-card-anim" style={{...styles.card, border: '1px solid #fee2e2'}}>
            <h3 style={{...styles.cardTitle, color: '#dc2626'}}>Delete Profile</h3>
            <div style={styles.deleteSection}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={agreeDelete}
                  onChange={(e) => setAgreeDelete(e.target.checked)}
                  style={styles.checkbox}
                />
                I agree to delete my profile
              </label>
              <p style={styles.warningText}>
                Please note that if you choose to delete your own profile, your learner account would no longer exist. 
                You would lose access to the courses and resources provided.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <PlayfulButton 
                  onClick={handleDeleteProfile}
                  disabled={!agreeDelete || deleteLoading}
                  style={{
                    backgroundColor: agreeDelete ? '#ef4444' : '#fca5a5',
                    backgroundImage: 'none',
                    width: '100%'
                  }}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Profile'}
                </PlayfulButton>
              </div>
            </div>
            <button 
              onClick={() => { authService.logout(); window.location.href = '/login'; }}
              style={styles.logoutSecondary}
            >
              Sign Out from Device
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '"Outfit", sans-serif'
  },
  main: {
    maxWidth: '1000px',
    margin: '100px auto 50px',
    padding: '0 20px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
  },
  avatarContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid #fff',
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  initials: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#fff'
  },
  cameraIcon: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    width: '35px',
    height: '35px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    fontSize: '1.2rem'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold'
  },
  headerInfo: { display: 'flex', flexDirection: 'column', gap: '5px' },
  userName: { fontSize: '2rem', fontWeight: '800', margin: 0, color: '#0f172a' },
  userRole: { fontSize: '0.9rem', color: '#6366f1', fontWeight: '700', letterSpacing: '1px' },
  
  settingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '25px',
    color: '#0f172a',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '15px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#64748b' },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  mobileInput: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    overflow: 'hidden'
  },
  prefix: {
    padding: '12px 16px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontWeight: '700',
    borderRight: '1px solid #e2e8f0'
  },
  mobileField: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '1rem'
  },
  hint: { fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' },
  actionBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
  },
  deleteSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer'
  },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  warningText: { fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' },
  logoutSecondary: {
    width: '100%',
    marginTop: '30px',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px dashed #cbd5e1',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorCard: {
    padding: '60px',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '24px',
    fontSize: '1.2rem',
    color: '#64748b'
  }
};

export default Profile;
