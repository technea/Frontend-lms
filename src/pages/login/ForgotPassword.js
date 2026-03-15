import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlayfulButton from '../../components/PlayfulButton';
import authService from '../../services/authService';
import gsap from 'gsap';

const ForgotPassword = () => {
  const cardRef = useRef(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.forgotPassword(email);
      setMessage('A reset code has been sent to your email address.');
      
      // Redirect to reset page after a short delay
      setTimeout(() => navigate('/reset-password'), 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div ref={cardRef} style={styles.card}>
        <div style={styles.glassEffect}></div>
        <div style={styles.content}>
          <h2 style={styles.heading}>Forgot Password</h2>
          <p style={styles.subtext}>Enter your email address and we'll send you a recovery code</p>
          
          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}
          
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <input 
                type="email" 
                placeholder="Email Address" 
                style={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <PlayfulButton type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? 'Sending...' : 'Get Reset Code'}
            </PlayfulButton>
          </form>
          <div style={styles.footer}>
            <Link to="/login" style={styles.backLink}>← Back to Login</Link>
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
    background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
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
    padding: '50px 40px',
    textAlign: 'center'
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '10px'
  },
  subtext: {
    color: '#475569',
    marginBottom: '35px',
    fontSize: '0.95rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    fontSize: '1rem',
    outline: 'none'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '0.9rem'
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '0.9rem'
  },
  backLink: {
    display: 'block',
    marginTop: '25px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600'
  }
};

export default ForgotPassword;
