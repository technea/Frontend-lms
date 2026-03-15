import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.brandSection}>
            <h3 style={styles.logo}>
              Nex<span className="gradient-text">Learn</span>
            </h3>
            <p style={styles.description}>
              Empowering learners worldwide with state-of-the-art educational tools and expert-led curriculum.
            </p>
          </div>
          <div style={styles.linkSection}>
            <h4 style={styles.linkHeading}>Quick Links</h4>
            <Link to="/" style={styles.link}>Courses</Link>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Sign Up</Link>
          </div>
          <div style={styles.linkSection}>
            <h4 style={styles.linkHeading}>Support</h4>
            <Link to="/" style={styles.link}>Help Center</Link>
            <Link to="/" style={styles.link}>Privacy Policy</Link>
            <Link to="/" style={styles.link}>Terms of Service</Link>
          </div>
        </div>
        <div style={styles.bottomBar}>
          <p style={styles.copyright}>© 2026 NexLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'var(--footerBg)',
    borderTop: '1px solid var(--footerBorder)',
    padding: '60px 0 30px 0',
    color: 'var(--text)',
    fontFamily: '"Outfit", sans-serif'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '40px'
  },
  brandSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text)'
  },
  description: {
    color: 'var(--textSecondary)',
    lineHeight: '1.6',
    fontSize: '0.95rem'
  },
  linkSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  linkHeading: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '8px',
    color: 'var(--text)'
  },
  link: {
    color: 'var(--textSecondary)',
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  bottomBar: {
    borderTop: '1px solid var(--footerBorder)',
    paddingTop: '30px',
    textAlign: 'center'
  },
  copyright: {
    color: 'var(--textMuted)',
    fontSize: '0.85rem'
  }
};

export default Footer;
