import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    gsap.from('.edu-auth-left', { x: -100, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.edu-auth-card', { x: 100, opacity: 0, duration: 1, delay: 0.2, ease: 'power4.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      await authService.forgotPassword(email);
      setMessage('A reset code has been sent to your email address.');
      setTimeout(() => navigate('/reset-password'), 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="edu-auth-page">
      <div className="edu-auth-left">
        <div className="edu-auth-brand">
          <div className="edu-auth-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1>NexLearn</h1>
          <p>Security protocol restoration. We'll assist you in regaining access to your ecosystem.</p>
        </div>
      </div>
      <div className="edu-auth-right">
        <div className="edu-auth-card">
          <h2>Restore Access</h2>
          <p className="edu-auth-sub">Enter your email and we'll send you a recovery code</p>
          {error && <div className="edu-auth-error">{error}</div>}
          {message && <div style={{background:'#EBF6F1',color:'#1C7A52',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:14}}>{message}</div>}
          <form className="edu-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="edu-auth-label">Email Address</label>
              <input type="email" className="edu-auth-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="edu-auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Get Reset Code'}
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

export default ForgotPassword;
