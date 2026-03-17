import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/EduFlow.css';

const Navbar = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();



  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="edu-navbar">
      <div className="edu-navbar-container">
        <Link to="/" className="edu-navbar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="brand-name">NexLearn</span>
        </Link>

        {/* Desktop Links */}
        <div className="edu-navbar-desktop">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="nav-divider"></div>
          
          {user ? (
            <div className="nav-user-actions">
              <Link to="/dashboard" className="edu-btn edu-btn-outline" style={{padding: '8px 16px', fontSize: '13px'}}>Dashboard</Link>
              <button onClick={handleLogout} className="edu-btn edu-btn-primary" style={{padding: '8px 16px', fontSize: '13px'}}>Logout</button>
            </div>
          ) : (
            <div className="nav-auth-actions">
              <Link to="/login" className="nav-item">Login</Link>
              <Link to="/register" className="edu-btn edu-btn-primary" style={{padding: '8px 16px', fontSize: '13px', textDecoration:'none'}}>Join Free</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="edu-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenuOpen ? "M18 6L6 18M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"}/></svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="edu-mobile-menu">
           {navLinks.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">{link.name}</Link>
           ))}
           <div className="mobile-divider"></div>
           {user ? (
             <>
               <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">Dashboard</Link>
               <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">My Profile</Link>
               <button onClick={handleLogout} className="edu-btn edu-btn-primary" style={{margin:'10px 20px'}}>Logout</button>
             </>
           ) : (
             <>
               <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">Login</Link>
               <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="edu-btn edu-btn-primary" style={{margin:'10px 20px', textDecoration:'none', textAlign:'center'}}>Sign Up</Link>
             </>
           )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;