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
    { path: '/quizzes', label: 'Quizzes', icon: <QuizIcon />, badge: 'New' },
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
      <aside className={`edu-sidebar ${isOpen ? 'open' : ''}`} style={{
        background: '#fff', 
        color: '#1A1916', 
        borderRight: '1px solid #F0EFEA',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Link to="/" className="edu-logo" style={{textDecoration:'none', marginBottom: '40px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div className="edu-logo-mark" style={{background: '#E85D2A', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center'}}>
            <svg viewBox="0 0 24 24" style={{width: '20px', height: '20px'}}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="white"/></svg>
          </div>
          <span className="edu-logo-text" style={{color: '#1A1916', fontFamily: '"Playfair Display", serif', fontSize: '22px', fontWeight: 700}}>NexLearn</span>
        </Link>
 
        <div style={{flexGrow: 1, overflowY: 'auto'}}>
          <nav className="edu-nav-section" style={{marginBottom: '32px'}}>
            <div className="edu-nav-label" style={{color: '#9B9890', letterSpacing: '2px', fontWeight: 800, fontSize: '10px', padding: '0 12px 12px', textTransform: 'uppercase', opacity: 0.6}}>Ecosystem</div>
            {mainLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`edu-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                onClick={onClose}
                style={{
                  color: location.pathname === link.path ? '#2D5BE3' : '#6B6962',
                  background: location.pathname === link.path ? '#EEF1FD' : 'transparent',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  transition: '0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                <span style={{width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{link.icon}</span>
                <span style={{fontWeight: location.pathname === link.path ? 700 : 500}}>{link.label}</span>
                {link.badge && <span className="edu-nav-badge" style={{background: '#E85D2A', marginLeft: 'auto', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', color: '#fff'}}>{link.badge}</span>}
              </Link>
            ))}
          </nav>
 
          <nav className="edu-nav-section">
            <div className="edu-nav-label" style={{color: '#9B9890', letterSpacing: '2px', fontWeight: 800, fontSize: '10px', padding: '0 12px 12px', textTransform: 'uppercase', opacity: 0.6}}>Personal</div>
            {accountLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`edu-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                onClick={onClose}
                style={{
                  color: '#6B6962', padding: '12px 15px', borderRadius: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', fontSize: '14px'
                }}
              >
                <span style={{width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{link.icon}</span>
                <span style={{fontWeight: 500}}>{link.label}</span>
              </Link>
            ))}
            <button
              className="edu-nav-item"
              onClick={() => { authService.logout(); window.location.href = '/'; }}
              style={{color: '#9B9890', padding: '12px 15px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px'}}
            >
              <LogoutIcon />
              <span style={{fontWeight: 500}}>Logout</span>
            </button>
          </nav>
        </div>
 
        <Link to="/profile" className="edu-sidebar-user" onClick={onClose} style={{
          background: '#FAF9F6', padding: '15px', borderRadius: '16px', border: '1px solid #F0EFEA', marginTop: '20px', display: 'flex', alignItems: 'center', textDecoration: 'none'
        }}>
          <div className="edu-avatar" style={{background: '#2D5BE3', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 700}}>{initials}</div>
          <div style={{marginLeft: '12px'}}>
            <div className="edu-user-name" style={{color: '#1A1916', fontSize: '14px', fontWeight: 700}}>{user?.name || 'User'}</div>
            <div className="edu-user-role" style={{fontSize: '11px', color: '#E85D2A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px'}}>
               {user?.role === 'student' ? 'Student Tier' : user?.role || 'User'}
            </div>
          </div>
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
const QuizIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/><path d="M9 22V12h6v10"/><path d="M12 2v20"/></svg>
);

export default DashboardSidebar;
