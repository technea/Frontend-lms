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
    <div className="edu-auth-page admin-access" style={{background: '#1A1916'}}>
      <div className="edu-auth-right" style={{width: '100%', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="edu-auth-card shadow-2xl" style={{
          margin: '0 auto', 
          maxWidth: '480px', 
          border: '1px solid rgba(232, 93, 42, 0.3)',
          borderRadius: '32px',
          padding: '50px',
          background: '#fff',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
            width: '80px', height: '80px', background: '#E85D2A', borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            fontSize: '32px', border: '5px solid #fff', boxShadow: '0 15px 35px rgba(232, 93, 42, 0.3)',
            fontWeight: '900'
          }} className="edu-admin-lock">
             🛡️
          </div>
          
          <div style={{height: '30px'}}></div>

          {!show2FA ? (
            <>
              <div className="text-center mb-5">
                <h2 style={{
                  fontFamily: '"Playfair Display", serif', 
                  fontSize: '30px', 
                  fontWeight: 900, 
                  color: '#1A1916',
                  letterSpacing: '-0.5px'
                }}>Admin Protocol</h2>
                <p style={{fontSize: '14px', color: '#6B6962', marginTop: '10px', fontWeight: 500}}>
                   Restricted administrative access. Please authorize with your security credentials.
                </p>
              </div>

              {error && <div className="mb-4" style={{
                background: '#FEF2F2', color: '#EF4444', padding: '14px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', fontWeight: '600'
              }}>{error}</div>}

              <form className="edu-auth-form" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9B9890', marginBottom: '8px', display: 'block'}}>ADMINISTRATOR ID</label>
                  <input
                    type="email"
                    className="edu-auth-input"
                    placeholder="admin@nexlearn.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    style={{
                      height: '56px', border: '1px solid #E2E0D8', borderRadius: '14px', padding: '0 20px', fontSize: '15px'
                    }}
                  />
                </div>
                <div className="mb-5">
                  <label style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9B9890', marginBottom: '8px', display: 'block'}}>SECURITY PASSKEY</label>
                  <input
                    type="password"
                    className="edu-auth-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    style={{
                      height: '56px', border: '1px solid #E2E0D8', borderRadius: '14px', padding: '0 20px', fontSize: '15px'
                    }}
                  />
                </div>
                <button type="submit" className="edu-auth-btn" style={{
                  background: '#1A1916', 
                  color: '#fff',
                  height: '60px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: 700,
                  width: '100%',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                  transition: '0.3s'
                }} disabled={loading}>
                  {loading ? 'AUTHENTICATING...' : 'AUTHORIZE LOGIN'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-5">
                <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: '28px', fontWeight: 900}}>MFA Bypass Code</h2>
                <p style={{color: '#64748B'}}>Enter the 6-digit administrative verification key.</p>
              </div>

              {error && <div className="mb-4">{error}</div>}

              <form className="edu-auth-form" onSubmit={handle2FASubmit}>
                <div className="mb-5">
                  <label style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'}}>Security Key</label>
                  <input
                    type="text"
                    className="edu-auth-input text-center"
                    placeholder="000 000"
                    maxLength="6"
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    required
                    style={{
                      letterSpacing: '10px', fontSize: '28px', fontWeight: 800, 
                      height: '75px', borderRadius: '16px', border: '2px solid #E85D2A'
                    }}
                  />
                </div>
                <button type="submit" className="edu-auth-btn" style={{
                  background: '#E85D2A', height: '60px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, width: '100%', color: '#fff'
                }} disabled={loading}>
                  {loading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-5">
            <Link to="/login" style={{color:'#9B9890', fontSize:'13px', textDecoration: 'none', fontWeight: 600}}>
               ← RETURN TO USER GATEWAY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
