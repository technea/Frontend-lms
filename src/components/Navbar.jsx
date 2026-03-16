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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    if (!navRef.current) return;
    
    // Smooth entrance animation
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: 'power4.out'
    });

    // Logo reveal
    gsap.from('.nav-logo-responsive', {
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      ease: 'back.out(1.7)'
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

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav ref={navRef} style={navStyles.nav} className="navbar-fixed navbar-fixed-shadow">
        <div style={navStyles.container} className="nav-container-responsive">
          <Link to="/" style={navStyles.logo} className="nav-logo-responsive" onClick={closeMobile}>
            Nex<span className="gradient-text">Learn</span>
          </Link>

          {/* Desktop & Mobile Links */}
          <div 
            style={navStyles.links} 
            className={`nav-links-responsive ${mobileOpen ? 'mobile-open' : ''}`}
          >
            <Link to="/courses" style={navStyles.link} onClick={closeMobile}>Courses</Link>
            <Link to="/about" style={navStyles.link} onClick={closeMobile}>About</Link>
            {user && (
              <Link to="/my-courses" style={navStyles.link} onClick={closeMobile}>My Courses</Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" style={navStyles.link} onClick={closeMobile}>Admin Panel</Link>
            )}
            {user && (user.role === 'instructor' || user.role === 'admin') && (
              <Link to="/instructor" style={navStyles.link} onClick={closeMobile}>Instructor Dashboard</Link>
            )}

            {/* Mobile-only auth links inside the menu */}
            <div className="mobile-auth-links" style={navStyles.mobileAuth}>
              {user ? (
                <>
                  <Link to="/profile" style={navStyles.mobileAuthLink} onClick={closeMobile}>
                    👤 My Profile
                  </Link>
                  <button 
                    style={navStyles.mobileLogoutBtn} 
                    onClick={() => { authService.logout(); window.location.reload(); }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" style={navStyles.mobileAuthLink} onClick={closeMobile}>Login</Link>
              )}
            </div>
          </div>

          <div style={navStyles.rightSection}>
            {/* Auth section - desktop */}
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
                    <span style={navStyles.userText} className="user-name-responsive">{user.name}</span>
                  </Link>
                  <button 
                    style={navStyles.logoutBtn} 
                    className="user-name-responsive"
                    onClick={() => { authService.logout(); window.location.reload(); }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <PlayfulButton>Login</PlayfulButton>
                </Link>
              )}
            </div>

            {/* Hamburger Button */}
            <button 
              className={`hamburger-btn ${mobileOpen ? 'active' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={closeMobile}
        style={{ display: mobileOpen ? 'block' : 'none' }}
      />
    </>
  );
};

const navStyles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: '80px',
    backgroundColor: 'var(--navBg)', borderBottom: '1px solid var(--navBorder)',
    backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center'
  },
  container: {
    width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  logo: { fontSize: '24px', fontWeight: '800', color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.5px' },
  links: { display: 'flex', gap: '30px', alignItems: 'center' },
  link: { 
    color: 'var(--text)', 
    textDecoration: 'none', 
    fontSize: '1rem', 
    fontWeight: '600' 
  },
  rightSection: { display: 'flex', alignItems: 'center', gap: '10px' },
  auth: { display: 'flex', alignItems: 'center', gap: '16px' },
  userText: { color: 'var(--accent)', fontWeight: '700', fontSize: '0.95rem' },
  themeToggle: {
    width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  logoutBtn: {
    padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none',
    borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', marginLeft: '10px'
  },
  avatarSmall: {
    width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--accent)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: '700', overflow: 'hidden'
  },
  mobileAuth: { display: 'none', flexDirection: 'column', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--cardBorder)' },
  mobileAuthLink: { 
    color: 'var(--text)', 
    textDecoration: 'none', 
    fontSize: '1.05rem', 
    fontWeight: '600', 
    padding: '14px 20px', 
    borderRadius: '12px', 
    display: 'block' 
  },
  mobileLogoutBtn: { padding: '14px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1.05rem', textAlign: 'left' }
};

export default Navbar;