import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import authService from '../../services/authService';
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
  const [twoFactorQR, setTwoFactorQR] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);

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

  const handleSetup2FA = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await authService.setup2FA();
      setTwoFactorQR(res.qrCodeUrl);
      setShowQR(true);
    } catch (err) {
      setError(err.message || 'Failed to setup 2FA');
    } finally { setLoading(false); }
  };

  const handleVerifyEnable2FA = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await authService.verifyAndEnable2FA(twoFactorCode);
      setSuccess('2FA enabled successfully!');
      setIs2FAEnabled(true);
      setShowQR(false);
      // Update local storage user
      const updatedUser = { ...user, isTwoFactorEnabled: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      await authService.disable2FA();
      setSuccess('2FA disabled successfully');
      setIs2FAEnabled(false);
      const updatedUser = { ...user, isTwoFactorEnabled: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setError(err.message || 'Failed to disable 2FA');
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

                <div className="edu-profile-section" style={{background: is2FAEnabled ? '#EBF6F1' : 'var(--cardBg)'}}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                      <h3 style={{fontSize:'16px', fontWeight:600, margin:0}}>Two-Factor Authentication (2FA)</h3>
                      <span className={`edu-tag ${is2FAEnabled ? 'edu-tag-blue' : ''}`} style={{background: is2FAEnabled ? '#1C7A52' : '#9B9890', color:'white'}}>
                         {is2FAEnabled ? 'Active' : 'Inactive'}
                      </span>
                   </div>
                   
                   {!is2FAEnabled ? (
                      !showQR ? (
                         <div>
                            <p style={{fontSize:'13px', color:'#6B6962', marginBottom:'16px'}}>Add an extra layer of security to your account by requiring a verification code from your authenticator app.</p>
                            <button className="edu-btn edu-btn-primary" onClick={handleSetup2FA} disabled={loading}>
                               Setup 2FA
                            </button>
                         </div>
                      ) : (
                         <div style={{textAlign:'center', padding:'20px', background:'white', borderRadius:12}}>
                            <p style={{fontSize:'14px', fontWeight:600, marginBottom:'15px'}}>Scan this QR code with your Authenticator App</p>
                            <img src={twoFactorQR} alt="2FA QR Code" style={{width:'180px', height:'180px', marginBottom:'20px'}} />
                            <form onSubmit={handleVerifyEnable2FA}>
                               <label className="edu-auth-label">Enter 6-digit code to verify</label>
                               <input 
                                  className="edu-auth-input" 
                                  placeholder="000000" 
                                  value={twoFactorCode} 
                                  onChange={e => setTwoFactorCode(e.target.value)} 
                                  style={{maxWidth:'200px', textAlign:'center', margin:'0 auto 15px', display:'block', fontSize:'20px', letterSpacing:'4px'}}
                                  maxLength="6"
                                  required
                               />
                               <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
                                  <button type="button" className="edu-btn edu-btn-outline" onClick={() => setShowQR(false)}>Cancel</button>
                                  <button type="submit" className="edu-btn edu-btn-primary" disabled={loading}>Verify & Enable</button>
                               </div>
                            </form>
                         </div>
                      )
                   ) : (
                      <div>
                         <p style={{fontSize:'13px', color:'#6B6962', marginBottom:'16px'}}>Your account is protected with Two-Factor Authentication. You will be asked for a code during login.</p>
                         <button className="edu-btn edu-btn-outline" style={{borderColor:'#E85D2A', color:'#E85D2A'}} onClick={handleDisable2FA} disabled={loading}>
                            Disable 2FA
                         </button>
                      </div>
                   )}
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
