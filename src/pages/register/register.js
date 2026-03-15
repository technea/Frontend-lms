import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlayfulButton from '../../components/PlayfulButton';
import authService from '../../services/authService';
import gsap from 'gsap';

const Register = () => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)"
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.name.length < 4) {
      return setError('Name must be at least 4 characters long');
    }

    if (parseInt(formData.age) < 16) {
      return setError('Age must be at least 16');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      console.log('Sending register data to server:', registerData);
      const res = await authService.register(registerData);
      console.log('Registration success response:', res);
      
      alert('Registration Successful! Please check your email for the OTP.');
      navigate('/verify-otp', { state: { email: formData.email } }); // Redirect to OTP verification
    } catch (err) {
      console.error('Registration error on frontend:', err);
      // Handle backend validation error message
      const errorMsg = err.message || (typeof err === 'string' ? err : 'Registration failed. Please try again.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div style={styles.container}>
      <div ref={cardRef} style={styles.card} className="mobile-full-width">
        <div style={styles.glassEffect}></div>
        <div style={styles.content}>
          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.subtext}>Join NexLearn and start your journey today</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <input 
                type="text" 
                placeholder="Full Name" 
                style={styles.input} 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
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
            <div style={styles.row}>
              <div style={{...styles.inputGroup, flex: 1}}>
                <input 
                  type="number" 
                  placeholder="Age" 
                  style={styles.input} 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                />
              </div>
              <div style={{...styles.inputGroup, flex: 1}}>
                <select 
                  style={styles.input} 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="student">I am a Student</option>
                  <option value="instructor">I am a Teacher</option>
                </select>
              </div>
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
            <div style={styles.inputGroup}>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                style={styles.input} 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <PlayfulButton type="submit" className="w-100 mt-3" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </PlayfulButton>
          </form>
          <div style={styles.footer}>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
    background: 'linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%)',
    fontFamily: '"Outfit", sans-serif'
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
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
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '10px'
  },
  subtext: {
    color: '#475569',
    marginBottom: '30px',
    fontSize: '0.95rem'
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
    fontSize: '0.95rem',
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
    marginTop: '25px'
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '5px'
  },
  backLink: {
    display: 'block',
    marginTop: '15px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem'
  },
  row: {
    display: 'flex',
    gap: '15px'
  }
};

export default Register;
