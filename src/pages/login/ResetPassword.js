import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayfulButton from '../../components/PlayfulButton';
import authService from '../../services/authService';
import gsap from 'gsap';

const ResetPassword = () => {
  const cardRef = useRef(null);
  const [formData, setFormData] = useState({
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 1,
      ease: "back.out(1.7)"
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword({
        code: formData.code,
        password: formData.password
      });
      alert('Password reset successful! You can now login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div ref={cardRef} style={styles.card}>
        <div style={styles.content}>
          <h2 style={styles.heading}>Reset Password</h2>
          <p style={styles.subtext}>Enter the code you received and your new password</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form style={styles.form} onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="6-Digit Code" 
              style={styles.input} 
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="New Password" 
              style={styles.input} 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              style={styles.input} 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
            <PlayfulButton type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </PlayfulButton>
          </form>
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
    background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
    fontFamily: '"Outfit", sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '24px',
    backgroundColor: '#fff',
    padding: '50px 40px',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  content: { position: 'relative' },
  heading: { fontSize: '2.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '10px' },
  subtext: { color: '#475569', marginBottom: '35px', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
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
  }
};

export default ResetPassword;
