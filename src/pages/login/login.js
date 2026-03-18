import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState('');

  useEffect(() => {
    gsap.from('.edu-auth-left', { x: -20, opacity: 0, duration: 0.8, ease: 'power2.out' });
    gsap.from('.edu-auth-card', { x: 20, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power2.out' });
    gsap.from('.edu-auth-stat', { opacity: 0, stagger: 0.05, duration: 0.6, delay: 0.3 });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(formData.email, formData.password);
      if (data.twoFactorRequired) {
        setShow2FA(true);
        setTempUserId(data.userId);
      } else if (data.token) {
        if (data.user?.role === 'admin') {
          toast.info('Admin detected. Redirecting to Management Console...');
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const errorMsg = err.message || (typeof err === 'string' ? err : 'Login failed.');
      if (err.unverified) {
        setError(
          <span>{errorMsg}. <Link to="/verify-otp" state={{ email: formData.email }} style={{ color: '#E85D2A', fontWeight: 'bold', textDecoration: 'underline' }}>Verify Now</Link></span>
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.loginWith2FA(tempUserId, twoFactorToken);
      if (data.token) {
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || '2FA verification failed');
    } finally {
      setLoading(false);
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
          <p>The premium ecosystem for architects of the digital future.</p>
        </div>
        <div className="edu-auth-stats">
          <div className="edu-auth-stat">
            <div className="edu-auth-stat-num">150+</div>
            <div className="edu-auth-stat-label">Courses</div>
          </div>
          <div className="edu-auth-stat">
            <div className="edu-auth-stat-num">10K+</div>
            <div className="edu-auth-stat-label">Students</div>
          </div>
          <div className="edu-auth-stat">
            <div className="edu-auth-stat-num">98%</div>
            <div className="edu-auth-stat-label">Success</div>
          </div>
        </div>
      </div>

      <div className="edu-auth-right">
        <div className="edu-auth-card">
          {!show2FA ? (
            <>
              <h2>Welcome Back</h2>
              <p className="edu-auth-sub">Enter your credentials to access your dashboard</p>

              {error && <div className="edu-auth-error">{error}</div>}

              <form className="edu-auth-form" onSubmit={handleSubmit}>
                <div>
                  <label className="edu-auth-label">Email Address</label>
                  <input
                    type="email"
                    className="edu-auth-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="edu-auth-label">Password</label>
                  <input
                    type="password"
                    className="edu-auth-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div style={{textAlign:'right'}}>
                  <Link to="/forgot-password" className="edu-auth-link">Forgot Password?</Link>
                </div>
                <button type="submit" className="edu-auth-btn" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Verify Identity</h2>
              <p className="edu-auth-sub">Please enter the 6-digit code from your authenticator app</p>

              {error && <div className="edu-auth-error">{error}</div>}

              <form className="edu-auth-form" onSubmit={handle2FASubmit}>
                <div>
                  <label className="edu-auth-label">6-Digit Key</label>
                  <input
                    type="text"
                    className="edu-auth-input"
                    placeholder="000000"
                    maxLength="6"
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    required
                    style={{letterSpacing: '8px', textAlign: 'center', fontSize: '24px'}}
                  />
                </div>
                <button type="submit" className="edu-auth-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Authorize Access'}
                </button>
                <button 
                  type="button" 
                  className="edu-auth-link" 
                  style={{background:'none', border:'none', marginTop:'15px'}}
                  onClick={() => setShow2FA(false)}
                >
                  ← Back to Login
                </button>
              </form>
            </>
          )}

          <div className="edu-auth-footer">
            Don't have an account? <Link to="/register">Sign Up</Link>
            <br/>
            <Link to="/" style={{color:'#9B9890', fontSize:'12px', marginTop:'12px', display:'inline-block'}}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
