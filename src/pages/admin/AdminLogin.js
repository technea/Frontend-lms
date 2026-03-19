import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const AdminLogin = () => {
  console.log('AdminLogin: rendering');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState('');

  useEffect(() => {
    gsap.from('.edu-admin-lock', { scale: 0.5, opacity: 0, duration: 1, ease: 'back.out(1.7)' });
    gsap.from('.edu-auth-card', { y: 50, opacity: 0, duration: 1, delay: 0.2, ease: 'power4.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(formData.email, formData.password);
      
      // Strict Admin Check
      if (data.user && data.user.role !== 'admin') {
        authService.logout();
        throw new Error('Access Denied: You do not have administrator privileges.');
      }

      if (data.twoFactorRequired) {
        setShow2FA(true);
        setTempUserId(data.userId);
      } else if (data.token) {
        toast.success('Admin Authenticated Successfully');
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      toast.error(err.message || 'Login failed');
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
      if (data.user && data.user.role !== 'admin') {
         authService.logout();
         throw new Error('Access Denied: You do not have administrator privileges.');
      }
      if (data.token) {
        toast.success('Access Granted');
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || '2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edu-auth-page admin-access" style={{background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%'}}>
      <div className="edu-auth-card" style={{
        maxWidth: '480px', 
        width: '100%',
        padding: '0 20px',
        textAlign: 'center',
        background: 'transparent',
        boxShadow: 'none',
        border: 'none'
      }}>
        {!show2FA ? (
          <>
            <h2 style={{
              fontFamily: '"Playfair Display", serif', 
              fontSize: '48px', 
              fontWeight: 900, 
              color: '#1A1916',
              marginBottom: '10px'
            }}>Welcome Back</h2>
            <p style={{fontSize: '16px', color: '#9B9890', marginBottom: '40px'}}>
               Enter your credentials to access your dashboard
            </p>

            {error && <div className="mb-4" style={{color: '#EF4444', fontWeight: 600}}>{error}</div>}

            <form className="edu-auth-form" onSubmit={handleSubmit} style={{textAlign: 'left'}}>
              <div className="mb-4">
                <label style={{fontSize: '14px', fontWeight: 600, color: '#9B9890', marginBottom: '10px', display: 'block', textAlign: 'center'}}>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{
                    height: '60px', border: '1px solid #E2E0D8', borderRadius: '12px', padding: '0 20px', fontSize: '18px', background: '#F5F4F0', width: '100%'
                  }}
                />
              </div>
              <div className="mb-4">
                <label style={{fontSize: '14px', fontWeight: 600, color: '#9B9890', marginBottom: '10px', display: 'block', textAlign: 'center'}}>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  style={{
                    height: '60px', border: '1px solid #E2E0D8', borderRadius: '12px', padding: '0 20px', fontSize: '18px', background: '#F5F4F0', width: '100%'
                  }}
                />
              </div>
              
              <div style={{textAlign: 'right', marginBottom: '30px'}}>
                <Link to="/forgot-password" style={{color: '#6366F1', fontWeight: 600, textDecoration: 'none'}}>Forgot Password?</Link>
              </div>

              <button type="submit" className="edu-auth-btn" style={{
                background: '#2D5BE3', 
                color: '#fff',
                height: '64px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 700,
                width: '100%',
                border: 'none',
                boxShadow: '0 10px 20px rgba(45,91,227,0.2)'
              }} disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </>
        ) : (
          <>
             <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: '36px', fontWeight: 900}}>Verify Identity</h2>
             <p style={{color: '#9B9890', marginBottom: '30px'}}>Please enter the 6-digit verification code.</p>

             <form className="edu-auth-form" onSubmit={handle2FASubmit}>
                <input
                  type="text"
                  className="form-control text-center"
                  placeholder="000 000"
                  maxLength="6"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                  required
                  style={{
                    letterSpacing: '8px', fontSize: '24px', fontWeight: 800, 
                    height: '70px', borderRadius: '12px', border: '1px solid #E2E0D8', background: '#F5F4F0', marginBottom: '30px', width: '100%'
                  }}
                />
                <button type="submit" className="edu-auth-btn" style={{
                  background: '#2D5BE3', height: '64px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, width: '100%', color: '#fff', border: 'none'
                }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Authorize Access'}
                </button>
             </form>
          </>
        )}

        <div className="text-center mt-5">
          <p style={{color: '#9B9890', fontSize: '14px'}}>
            Don't have an account? <Link to="/register" style={{color: '#2D5BE3', fontWeight: 700, textDecoration: 'none'}}>Sign Up</Link>
          </p>
          <Link to="/" style={{color:'#9B9890', fontSize:'14px', textDecoration: 'none', fontWeight: 600, display: 'block', marginTop: '15px'}}>
             ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
