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
    <div className="edu-auth-page admin-access" style={{background: '#F8FAFC'}}>
      <div className="edu-auth-right" style={{width: '100%', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="edu-auth-card shadow-2xl" style={{
          margin: '0 auto', 
          maxWidth: '500px', 
          border: '1px solid #E2E8F0',
          borderRadius: '32px',
          padding: '60px',
          background: '#fff',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
            width: '80px', height: '80px', background: '#6366F1', borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            fontSize: '32px', border: '5px solid #fff', boxShadow: '0 15px 35px rgba(99,102,241,0.2)',
            fontWeight: '900'
          }} className="edu-admin-lock">
             N
          </div>
          
          <div style={{height: '40px'}}></div>

          {!show2FA ? (
            <>
              <div className="text-center mb-5">
                <h2 style={{
                  fontFamily: '"Inter", sans-serif', 
                  fontSize: '32px', 
                  fontWeight: 800, 
                  color: '#0F172A',
                  letterSpacing: '-1px'
                }}>Administrative Access</h2>
                <p style={{fontSize: '15px', color: '#64748B', marginTop: '12px', fontWeight: 500}}>
                  Please authenticate with your system-issued credentials to continue to central command.
                </p>
              </div>

              {error && <div className="mb-4" style={{
                background: '#FEF2F2', color: '#EF4444', padding: '16px', borderRadius: '16px', fontSize: '14px', textAlign: 'center', fontWeight: '600'
              }}>{error}</div>}

              <form className="edu-auth-form" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#475569', marginBottom: '10px', display: 'block'}}>NETWORK IDENTIFIER (ID)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@nexlearn.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    style={{
                      height: '60px', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '0 20px', fontSize: '15px', background: '#F8FAFC'
                    }}
                  />
                </div>
                <div className="mb-5">
                  <label style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#475569', marginBottom: '10px', display: 'block'}}>SECURITY PASSKEY (SK)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    style={{
                      height: '60px', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '0 20px', fontSize: '15px', background: '#F8FAFC'
                    }}
                  />
                </div>
                <button type="submit" className="primary-btn-v3" style={{
                  background: '#6366F1', 
                  color: '#fff',
                  border: 'none',
                  height: '64px',
                  borderRadius: '16px',
                  fontSize: '17px',
                  fontWeight: 700,
                  width: '100%',
                  boxShadow: '0 20px 40px rgba(99,102,241,0.2)',
                  transition: '0.3s'
                }} disabled={loading}>
                  {loading ? 'SYNCHRONIZING...' : 'AUTHORIZE COMMAND'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-5">
                <h2 style={{fontSize: '32px', fontWeight: 800, color: '#0F172A'}}>MFA Required</h2>
                <p style={{color: '#64748B'}}>Verification of administrative authority required.</p>
              </div>

              {error && <div className="mb-4">{error}</div>}

              <form className="edu-auth-form" onSubmit={handle2FASubmit}>
                <div className="mb-5">
                  <label style={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'}}>AUTH CODE</label>
                  <input
                    type="text"
                    className="form-control text-center"
                    placeholder="000 000"
                    maxLength="6"
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    required
                    style={{
                      letterSpacing: '12px', fontSize: '32px', fontWeight: 800, 
                      height: '80px', borderRadius: '20px', border: '2px solid #6366F1', background: '#F8FAFC'
                    }}
                  />
                </div>
                <button type="submit" className="primary-btn-v3" style={{
                  background: '#6366F1', height: '64px', borderRadius: '16px', fontSize: '17px', fontWeight: 700, width: '100%', color: '#fff'
                }} disabled={loading}>
                  {loading ? 'VERIFYING...' : 'CONFIRM AUTHORITY'}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-5">
            <Link to="/login" style={{color:'#64748B', fontSize:'14px', textDecoration: 'none', fontWeight: 600}}>
               ← RELEASE TEMPORARY ACCESS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
