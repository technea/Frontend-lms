import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.from('.edu-auth-left', { x: -100, opacity: 0, duration: 1, ease: 'power4.out' });
    gsap.from('.edu-auth-card', { x: 100, opacity: 0, duration: 1, delay: 0.2, ease: 'power4.out' });
    gsap.from('.edu-auth-stat', { y: 20, opacity: 0, stagger: 0.1, duration: 0.8, delay: 0.5 });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(formData.email, formData.password);
      if (data.token) navigate('/dashboard');
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
