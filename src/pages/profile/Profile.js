import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import authService from '../../services/authService';
import api from '../../services/api';
import '../../styles/EduFlow.css';

const Profile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    age: user?.age || ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      // In a real app, this would be an API call
      // const res = await api.put('/users/profile', formData);
      // authService.updateUserInStorage(res.data.user);
      setSuccess('Profile identification updated successfully!');
    } catch (err) {
      setError(err.message || 'Transmission error');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return setError('Encryption keys do not match');
    setLoading(true); setError(''); setSuccess('');
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setSuccess('Security credentials updated!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Key update failed');
    } finally { setLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('avatar', file);
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await authService.updateAvatar(data);
      setUser(res.user);
      setSuccess('Visual identity updated!');
    } catch (err) {
      setError(err.message || 'Avatar sync failed');
    } finally { setLoading(false); }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  return (
    <div className="edu-dashboard">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="edu-main">
        <header className="edu-topbar">
          <button className="edu-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="edu-topbar-title">Settings & Identity</span>
          <div className="edu-topbar-actions">
             <div className="edu-avatar">{initials}</div>
          </div>
        </header>

        <div className="edu-content" style={{maxWidth:'1000px'}}>
          <header className="edu-dash-header">
             <h1 className="edu-dash-title">Personal Studio</h1>
          </header>

          {error && <div className="edu-auth-error" style={{marginBottom: '24px'}}>{error}</div>}
          {success && <div style={{background:'#EBF6F1', color:'#1C7A52', padding:'14px', borderRadius:12, fontSize:13, marginBottom:24, border:'1px solid rgba(28,122,82,0.2)'}}>✓ {success}</div>}

          <div className="edu-main-grid" style={{gridTemplateColumns:'300px 1fr'}}>
             <div className="edu-right-panel" style={{order:'-1'}}>
                <div className="edu-card" style={{textAlign:'center', padding:'40px 24px'}}>
                   <div className="edu-avatar" style={{width:'100px', height:'100px', fontSize:'36px', margin:'0 auto 20px', overflow:'hidden'}}>
                     {user?.avatar ? <img src={user.avatar} alt="Profile" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : initials}
                   </div>
                   <h3 style={{fontSize:'18px', fontWeight:600}}>{user?.name}</h3>
                   <p style={{fontSize:'12px', color:'#9B9890', textTransform:'capitalize', marginTop:'4px'}}>{user?.role}</p>
                   
                   <label className="edu-btn edu-btn-outline" style={{marginTop:'24px', cursor:'pointer', width:'100%', justifyContent:'center'}}>
                      Replace Avatar
                      <input type="file" hidden onChange={handleAvatarChange} accept="image/*" />
                   </label>
                   
                   <div style={{marginTop:'32px', textAlign:'left', padding:'16px', background:'#F5F4F0', borderRadius:12}}>
                      <div style={{fontSize:'11px', color:'#9B9890', marginBottom:'4px'}}>Registration Date</div>
                      <div style={{fontSize:'13px', fontWeight:500}}>{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                   </div>
                </div>
             </div>

             <div className="edu-profile-content">
                <div className="edu-profile-section">
                   <h3 style={{fontSize:'16px', fontWeight:600, marginBottom:'20px'}}>General Alignment</h3>
                   <form className="edu-auth-form" onSubmit={handleUpdateProfile}>
                      <div className="edu-auth-row">
                        <div>
                           <label className="edu-auth-label">Digital Handle (Name)</label>
                           <input className="edu-auth-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                           <label className="edu-auth-label">System Email</label>
                           <input className="edu-auth-input" value={formData.email} disabled style={{opacity:0.6}} />
                        </div>
                      </div>
                      <div className="edu-auth-row">
                        <div>
                           <label className="edu-auth-label">Contact Pulse (Mobile)</label>
                           <input className="edu-auth-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="+1 (000) 000-0000" />
                        </div>
                        <div>
                           <label className="edu-auth-label">Chronology (Age)</label>
                           <input type="number" className="edu-auth-input" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                        </div>
                      </div>
                      <button type="submit" className="edu-auth-btn" style={{width:'auto', padding:'12px 32px'}} disabled={loading}>
                        {loading ? 'Processing...' : 'Sync Information'}
                      </button>
                   </form>
                </div>

                <div className="edu-profile-section">
                   <h3 style={{fontSize:'16px', fontWeight:600, marginBottom:'20px'}}>Security Layer</h3>
                   <form className="edu-auth-form" onSubmit={handleChangePassword}>
                      <div>
                         <label className="edu-auth-label">Current Key</label>
                         <input type="password" className="edu-auth-input" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} required />
                      </div>
                      <div className="edu-auth-row">
                        <div>
                           <label className="edu-auth-label">New Key</label>
                           <input type="password" className="edu-auth-input" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required />
                        </div>
                        <div>
                           <label className="edu-auth-label">Verify New Key</label>
                           <input type="password" className="edu-auth-input" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} required />
                        </div>
                      </div>
                      <button type="submit" className="edu-auth-btn" style={{width:'auto', padding:'12px 32px'}} disabled={loading}>
                        {loading ? 'Encrypting...' : 'Update Security'}
                      </button>
                   </form>
                </div>

                <div className="edu-card" style={{border:'1px solid #FDF0EB', background:'#FDF0EB33'}}>
                   <h3 style={{fontSize:'15px', fontWeight:600, color:'#E85D2A', marginBottom:'10px'}}>Archive Identity</h3>
                   <p style={{fontSize:'13px', color:'#6B6962', marginBottom:'20px', lineHeight:1.6}}>Deactivating your account will permanently purge all enrolled progress and achievements from our database. This action is irreversible.</p>
                   <button className="edu-btn edu-btn-outline" style={{borderColor:'#E85D2A', color:'#E85D2A', fontSize:'12px'}} onClick={() => { if(window.confirm('IRREVERSIBLE ACTION: Purge identity?')) { /* delete */ } }}>
                      Permanently Delete Identity
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
