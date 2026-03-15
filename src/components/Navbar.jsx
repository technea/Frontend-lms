import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import PlayfulButton from './PlayfulButton';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const [user, setUser] = useState(null);
  const { isDark, toggleTheme } = useTheme();

  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    if (!navRef.current) return;
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    });
  }, []);

  useEffect(() => {
    if (toggleRef.current) {
      gsap.fromTo(toggleRef.current, 
        { rotation: -180, scale: 0 },
        { rotation: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [isDark]);

  return (
    <nav ref={navRef} style={navStyles.nav}>
      <div style={navStyles.container} className="nav-container-responsive">
        <Link to="/" style={navStyles.logo}>
          Nex<span className="gradient-text">Learn</span>
        </Link>
        <div style={navStyles.links} className="mobile-hide">
          <Link to="/courses" style={navStyles.link}>Courses</Link>
          <Link to="/about" style={navStyles.link}>About</Link>
          {user && (
            <Link to="/my-courses" style={navStyles.link}>My Courses</Link>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin" style={navStyles.link}>Admin Panel</Link>
          )}
          {user && (user.role === 'instructor' || user.role === 'admin') && (
            <Link to="/instructor" style={navStyles.link}>Instructor Dashboard</Link>
          )}
        </div>
        <div style={navStyles.auth} className="auth-responsive">
          <div
            onClick={toggleTheme}
            style={{
              ...navStyles.themeToggle,
              background: isDark 
                ? 'linear-gradient(135deg, #1e293b, #334155)' 
                : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
              border: `2px solid ${isDark ? 'rgba(129,140,248,0.3)' : 'rgba(79,70,229,0.2)'}`,
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span ref={toggleRef} style={{ fontSize: '1.1rem', lineHeight: 1 }}>
              {isDark ? '🌙' : '☀️'}
            </span>
          </div>

           {user ? (
            <>
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={navStyles.avatarSmall}>
                  {user.avatar ? (
                    <img 
                      src={`${API_URL}${user.avatar}`} 
                      alt="P" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={navStyles.userText}>{user.name}</span>
              </Link>
              <button 
                style={navStyles.logoutBtn} 
                onClick={() => { authService.logout(); window.location.reload(); }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <span style={navStyles.loginText}>Login</span>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <PlayfulButton>Sign Up</PlayfulButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const navStyles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '80px',
    backgroundColor: 'var(--navBg)',
    borderBottom: '1px solid var(--navBorder)',
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center'
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text)',
    textDecoration: 'none',
    letterSpacing: '-0.5px'
  },
  links: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  },
  link: {
    color: 'var(--textSecondary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  loginText: {
    color: 'var(--text)',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  userText: {
    color: 'var(--accent)',
    fontWeight: '700',
    fontSize: '0.95rem',
    marginRight: '10px'
  },
  themeToggle: {
    width: '42px',
    height: '42px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginLeft: '10px'
  },
  avatarSmall: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    backgroundImage: 'var(--accentGradient)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    overflow: 'hidden'
  }
};

export default Navbar;