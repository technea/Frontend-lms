import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/EduFlow.css';

const Footer = () => {
  return (
    <footer className="edu-footer">
      <div className="edu-navbar-container" style={{flexDirection: 'column', padding: '60px 32px 30px'}}>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="edu-navbar-brand" style={{marginBottom: '16px'}}>
              <div className="brand-icon" style={{background: '#E85D2A'}}>
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="white"/></svg>
              </div>
              <span className="brand-name">NexLearn</span>
            </Link>
            <p className="footer-desc">
              Empowering the next generation of digital leaders through world-class education and industry-leading mentorship.
            </p>
          </div>
          
          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/courses">Courses</Link>
              <Link to="/about">About Us</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <Link to="/">Help Center</Link>
              <Link to="/">Terms of Service</Link>
              <Link to="/">Privacy Policy</Link>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 NexLearn LMS. All rights reserved.</p>
          <div className="footer-social-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
