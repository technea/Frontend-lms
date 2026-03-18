import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', age: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.from('.edu-auth-left', { x: -20, opacity: 0, duration: 0.8, ease: 'power2.out' });
    gsap.from('.edu-auth-card', { x: 20, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power2.out' });
    gsap.from('.edu-auth-stat', { opacity: 0, stagger: 0.05, duration: 0.6, delay: 0.3 });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.name.length < 4) return setError('Name must be at least 4 characters long');
    if (parseInt(formData.age) < 16) return setError('Age must be at least 16');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters long');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
      toast.success('Registration Successful! Please check your email for the OTP.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || (typeof err === 'string' ? err : 'Registration failed.'));
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
          <p>Join the elite collective of creators architecting the digital future.</p>
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
            <div className="edu-auth-stat-num">24/7</div>
            <div className="edu-auth-stat-label">Support</div>
          </div>
        </div>
      </div>

      <div className="edu-auth-right">
        <div className="edu-auth-card">
           <h2>Initialize Journey</h2>
          <p className="edu-auth-sub">Enter the NexLearn ecosystem and accelerate your growth</p>

          {error && <div className="edu-auth-error">{error}</div>}

          <form className="edu-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="edu-auth-label">Full Name</label>
              <input type="text" className="edu-auth-input" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="edu-auth-label">Email Address</label>
              <input type="email" className="edu-auth-input" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="edu-auth-row">
              <div>
                <label className="edu-auth-label">Age</label>
                <input type="number" className="edu-auth-input" placeholder="18" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required />
              </div>
              <div>
                <label className="edu-auth-label">I am a</label>
                <select className="edu-auth-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="student">Student</option>
                  <option value="instructor">Teacher</option>
                </select>
              </div>
            </div>
            <div>
              <label className="edu-auth-label">Password</label>
              <input type="password" className="edu-auth-input" placeholder="Min 8 characters" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
            <div>
              <label className="edu-auth-label">Confirm Password</label>
              <input type="password" className="edu-auth-input" placeholder="Re-enter password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
            </div>
            <button type="submit" className="edu-auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="edu-auth-footer">
            Already have an account? <Link to="/login">Login</Link>
            <br/>
            <Link to="/" style={{color:'#9B9890', fontSize:'12px', marginTop:'12px', display:'inline-block'}}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
