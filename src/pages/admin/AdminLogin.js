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
    <div className="edu-auth-page admin-access">
      <div className="edu-auth-right" style={{width: '100%', maxWidth: '100%'}}>
        <div className="edu-auth-card" style={{margin: '0 auto', maxWidth: '450px', border: '1px solid #E85D2A'}}>
          <div className="edu-admin-lock" style={{textAlign:'center', marginBottom: '20px', fontSize: '40px'}}>
             🕵️‍♂️
          </div>
          
          {!show2FA ? (
            <>
              <h2 style={{color: '#1A1916'}}>Admin Protocol</h2>
              <p className="edu-auth-sub">Restricted access area. Unauthorized entry is prohibited.</p>

              {error && <div className="edu-auth-error">{error}</div>}

              <form className="edu-auth-form" onSubmit={handleSubmit}>
                <div>
                  <label className="edu-auth-label">Administrator ID (Email)</label>
                  <input
                    type="email"
                    className="edu-auth-input"
                    placeholder="admin@nexlearn.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="edu-auth-label">Security Key (Password)</label>
                  <input
                    type="password"
                    className="edu-auth-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="edu-auth-btn" style={{background: '#1A1916', borderColor: '#1A1916'}} disabled={loading}>
                  {loading ? 'Authenticating...' : 'Enter System'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Verify Identity</h2>
              <p className="edu-auth-sub">Please enter the 6-digit administrative bypass code</p>

              {error && <div className="edu-auth-error">{error}</div>}

              <form className="edu-auth-form" onSubmit={handle2FASubmit}>
                <div>
                  <label className="edu-auth-label">6-Digit Admin Key</label>
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
                <button type="submit" className="edu-auth-btn" style={{background: '#1A1916'}} disabled={loading}>
                  {loading ? 'Verifying...' : 'Authorize Access'}
                </button>
              </form>
            </>
          )}

          <div className="edu-auth-footer">
            <Link to="/login" style={{color:'#9B9890', fontSize:'12px', marginTop:'12px', display:'inline-block'}}>← Standard User Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
