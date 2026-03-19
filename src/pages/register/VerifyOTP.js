import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) navigate('/register');
    
    gsap.from('.edu-auth-left', { x: -100, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.edu-auth-card', { x: 100, opacity: 0, duration: 1, delay: 0.2, ease: 'power4.out' });
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (otp.length !== 6) return setError('Please enter a valid 6-digit OTP');
    setLoading(true);
    try {
      await authService.verifyOTP(email, otp);
      setMessage('Account verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); setMessage('');
    try {
      await authService.resendOTP(email);
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="edu-auth-page">
      <div className="edu-auth-left">
        <div className="edu-auth-brand">
          <div className="edu-auth-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1>NexLearn</h1>
          <p>Secure authentication protocol initiated. Please verify your identity with NexLearn.</p>
        </div>
      </div>
      <div className="edu-auth-right">
        <div className="edu-auth-card">
          <div className="edu-auth-mobile-header">
            <div className="brand-icon" style={{background: '#2D5BE3', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'}}>
              <svg viewBox="0 0 24 24" style={{width: '24px', height: '24px', fill: 'white'}}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#1A1916', margin: 0, marginBottom: '24px'}}>NexLearn</h2>
          </div>
          <h2>Identify Validation</h2>
          <p className="edu-auth-sub">Enter the 6-digit code sent to <br/><strong>{email}</strong></p>
          
          {error && <div className="edu-auth-error">{error}</div>}
          {message && <div style={{background:'#EBF6F1',color:'#1C7A52',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:14}}>{message}</div>}
          
          <form className="edu-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="edu-auth-label">6-Digit Code</label>
              <input 
                type="text" 
                className="edu-auth-input" 
                placeholder="000000"
                style={{letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem'}}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>
            <button type="submit" className="edu-auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          
          <div className="edu-auth-footer">
            Didn't receive the code? <span onClick={handleResend} style={{color:'#2D5BE3', fontWeight:'600', cursor:'pointer'}}>Resend OTP</span>
            <br/>
            <Link to="/register" style={{color:'#9B9890', fontSize:'12px', marginTop:'12px', display:'inline-block'}}>← Back to Signup</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
