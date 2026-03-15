import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import PlayfulButton from '../../components/PlayfulButton';
import authService from '../../services/authService';
import gsap from 'gsap';

const VerifyOTP = () => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }

    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)"
    });
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      return setError('Please enter a valid 6-digit OTP');
    }

    setLoading(true);

    try {
      await authService.verifyOTP(email, otp);
      setMessage('Account verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await authService.resendOTP(email);
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div style={styles.container}>
      <div ref={cardRef} style={styles.card}>
        <div style={styles.glassEffect}></div>
        <div style={styles.content}>
          <h2 style={styles.heading}>Verify Email</h2>
          <p style={styles.subtext}>Enter the 6-digit code sent to <br/><strong>{email}</strong></p>
          
          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}
          
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <input 
                type="text" 
                placeholder="6-Digit OTP" 
                style={styles.input} 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength="6"
              />
            </div>
            <PlayfulButton type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </PlayfulButton>
          </form>
          
          <div style={styles.footer}>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Didn't receive the code? <span onClick={handleResend} style={styles.link}>Resend OTP</span>
            </p>
            <Link to="/register" style={styles.backLink}>← Back to Signup</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%)',
    fontFamily: '"Outfit", sans-serif'
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff'
  },
  glassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    zIndex: 1
  },
  content: {
    position: 'relative',
    zIndex: 2,
    padding: '40px 50px',
    textAlign: 'center'
  },
  heading: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '10px'
  },
  subtext: {
    color: '#475569',
    marginBottom: '30px',
    fontSize: '0.95rem',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    position: 'relative'
  },
  input: {
    width: '100%',
    padding: '14px 20px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#0f172a',
    fontSize: '1.2rem',
    letterSpacing: '5px',
    textAlign: 'center',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontWeight: '600'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    border: '1px solid #fecaca'
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    border: '1px solid #bbf7d0'
  },
  footer: {
    marginTop: '25px'
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '5px',
    cursor: 'pointer'
  },
  backLink: {
    display: 'block',
    marginTop: '15px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem'
  }
};

export default VerifyOTP;
