import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const AppNavbar = () => {
  const [user, setUser] = useState(null);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="shadow-sm"
      style={{
        background: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        minHeight: '80px',
      }}
    >
      <Container>

        {/* Logo */}
        <Navbar.Brand as={Link} to="/" style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1px', color: isDark ? '#f1f5f9' : '#0f172a' }}>
          Nex<span style={{ background: 'linear-gradient(to right, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Learn</span>
        </Navbar.Brand>

        {/* Hamburger - Auto Bootstrap */}
        <Navbar.Toggle aria-controls="main-navbar" style={{ border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '12px', padding: '8px 12px' }}>
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }} />
        </Navbar.Toggle>

        <Navbar.Collapse id="main-navbar">

          {/* Nav Links */}
          <Nav className="me-auto gap-2 mt-2 mt-lg-0">
            <Nav.Link as={Link} to="/courses" style={{ color: isDark ? '#94a3b8' : '#475569', fontWeight: 600 }}>
              Courses
            </Nav.Link>
            <Nav.Link as={Link} to="/about" style={{ color: isDark ? '#94a3b8' : '#475569', fontWeight: 600 }}>
              About
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/my-courses" style={{ color: isDark ? '#94a3b8' : '#475569', fontWeight: 600 }}>
                My Courses
              </Nav.Link>
            )}
            {user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin" style={{ color: isDark ? '#94a3b8' : '#475569', fontWeight: 600 }}>
                Admin Panel
              </Nav.Link>
            )}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <Nav.Link as={Link} to="/instructor" style={{ color: isDark ? '#94a3b8' : '#475569', fontWeight: 600 }}>
                Instructor Dashboard
              </Nav.Link>
            )}
          </Nav>

          {/* Right Side */}
          <Nav className="align-items-center gap-2">

            {/* Theme Toggle */}
            <div
              onClick={toggleTheme}
              style={{
                width: '42px', height: '42px', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s ease',
                background: isDark ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                border: isDark ? '2px solid rgba(129,140,248,0.3)' : '2px solid rgba(79,70,229,0.2)',
              }}
            >
              {isDark ? '🌙' : '☀️'}
            </div>

            {/* Auth */}
            {user ? (
              <>
                <Nav.Link as={Link} to="/profile" className="d-flex align-items-center gap-2 text-decoration-none">
                  <div style={{
                    width: '35px', height: '35px', borderRadius: '50%',
                    background: '#4f46e5', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden'
                  }}>
                    {user.avatar
                      ? <img src={`${API_URL}${user.avatar}`} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (user.name || 'U').charAt(0).toUpperCase()
                    }
                  </div>
                  <span style={{ color: '#4f46e5', fontWeight: 700 }}>{user.name}</span>
                </Nav.Link>

                <Button
                  size="sm"
                  onClick={handleLogout}
                  style={{ background: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: 600, padding: '8px 16px' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                as={Link}
                to="/login"
                size="sm"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)', border: 'none', borderRadius: '10px', fontWeight: 600, padding: '8px 20px' }}
              >
                Login
              </Button>
            )}
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navbar;