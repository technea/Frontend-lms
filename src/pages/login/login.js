import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlayfulButton from '../../components/PlayfulButton';
import authService from '../../services/authService';
import gsap from 'gsap';

const Login = () => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.type === 'email' ? 'email' : 'password']: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(formData.email, formData.password);
      if (data.token) {
        navigate('/'); // Redirect to home on success
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.message || (typeof err === 'string' ? err : 'Login failed. Please try again.');
      
      if (err.unverified) {
        setError(
          <span>
            {errorMsg}. <Link to="/verify-otp" state={{ email: formData.email }} style={{ color: '#b91c1c', fontWeight: 'bold', textDecoration: 'underline' }}>Verify Now</Link>
          </span>
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div style={styles.container}>
      <div ref={cardRef} style={styles.card} className="mobile-full-width">
        <div style={styles.glassEffect}></div>
        <div style={styles.content}>
          <h2 style={styles.heading}>Welcome Back</h2>
          <p style={styles.subtext}>Enter your details to access your dashboard</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <input 
                type="email" 
                placeholder="Email Address" 
                style={styles.input} 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="Password" 
                style={styles.input} 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <PlayfulButton type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </PlayfulButton>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
          </form>
          <div style={styles.footer}>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Don't have an account? <Link to="/register" style={styles.link}>Sign Up</Link>
            </p>
            <Link to="/" style={styles.backLink}>← Back to Home</Link>
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
    background: 'linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%)',
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
  inputGroup: {
    position: 'relative'
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease'
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
  footer: {
    marginTop: '30px'
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '5px'
  },
  forgotLink: {
    display: 'block',
    marginTop: '15px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem',
    textAlign: 'center'
  },
  backLink: {
    display: 'block',
    marginTop: '20px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'color 0.3s'
  }
};

export default Login;
