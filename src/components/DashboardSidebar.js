import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const DashboardSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';

  const mainLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/my-courses', label: 'My Courses', icon: <BookIcon />, badge: null },
    { path: '/courses', label: 'Explore', icon: <SearchIcon /> },
  ];

  const accountLinks = [
    { path: '/profile', label: 'Profile', icon: <UserIcon /> },
  ];

  // Add admin/instructor links if applicable
  if (user?.role === 'admin') {
    mainLinks.push({ path: '/admin', label: 'Admin Panel', icon: <SettingsIcon /> });
  }
  if (user?.role === 'instructor' || user?.role === 'admin') {
    mainLinks.push({ path: '/instructor', label: 'Instructor Panel', icon: <CertIcon /> });
  }

  return (
    <>
      <div className={`edu-sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`edu-sidebar ${isOpen ? 'open' : ''}`}>
        <Link to="/" className="edu-logo" style={{textDecoration:'none'}}>
          <div className="edu-logo-mark">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="edu-logo-text">NexLearn</span>
        </Link>

        <nav className="edu-nav-section">
          <div className="edu-nav-label">Main</div>
          {mainLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`edu-nav-item ${location.pathname === link.path ? 'active' : ''}`}
              onClick={onClose}
            >
              {link.icon}
              {link.label}
              {link.badge && <span className="edu-nav-badge">{link.badge}</span>}
            </Link>
          ))}
        </nav>

        <nav className="edu-nav-section">
          <div className="edu-nav-label">Account</div>
          {accountLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`edu-nav-item ${location.pathname === link.path ? 'active' : ''}`}
              onClick={onClose}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <button
            className="edu-nav-item"
            onClick={() => { authService.logout(); window.location.href = '/'; }}
          >
            <LogoutIcon />
            Logout
          </button>
        </nav>

        <Link to="/profile" className="edu-sidebar-user" onClick={onClose}>
          <div className="edu-avatar">{initials}</div>
          <div>
            <div className="edu-user-name">{user?.name || 'User'}</div>
            <div className="edu-user-role" style={{textTransform:'capitalize'}}>{user?.role || 'Student'}</div>
          </div>
          <svg style={{marginLeft:'auto',width:14,height:14,color:'var(--edu-text3)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </Link>
      </aside>
    </>
  );
};

/* ── SVG Icon Components ── */
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
);
const CertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

export default DashboardSidebar;
