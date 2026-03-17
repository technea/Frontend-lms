import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ code: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    gsap.from('.edu-auth-left', { x: -100, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.edu-auth-card', { x: 100, opacity: 0, duration: 1, delay: 0.2, ease: 'power4.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true); setError('');
    try {
      await authService.resetPassword({ code: formData.code, password: formData.password });
      alert('Password reset successful! You can now login.');
      navigate('/login');
    } catch (err) { setError(err.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="edu-auth-page">
      <div className="edu-auth-left">
        <div className="edu-auth-brand">
          <div className="edu-auth-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1>NexLearn</h1>
          <p>Establish a new cryptographic key for your account security.</p>
        </div>
      </div>
      <div className="edu-auth-right">
        <div className="edu-auth-card">
          <h2>Recalibrate Security</h2>
          <p className="edu-auth-sub">Enter the code from your email and your new password</p>
          {error && <div className="edu-auth-error">{error}</div>}
          <form className="edu-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="edu-auth-label">Reset Code</label>
              <input type="text" className="edu-auth-input" placeholder="6-digit code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
            </div>
            <div>
              <label className="edu-auth-label">New Password</label>
              <input type="password" className="edu-auth-input" placeholder="Min 8 characters" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
            <div>
              <label className="edu-auth-label">Confirm Password</label>
              <input type="password" className="edu-auth-input" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
            </div>
            <button type="submit" className="edu-auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <div className="edu-auth-footer">
            <Link to="/login" style={{color:'#9B9890'}}>← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
