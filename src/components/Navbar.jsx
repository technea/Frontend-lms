import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import { FaGithub, FaLinkedinIn, FaTimes, FaBars } from 'react-icons/fa';

const CustomNavbar = () => {
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';

    useEffect(() => {
        setUser(authService.getCurrentUser());
    }, []);

    const handleLogout = () => {
        authService.logout();
        window.location.reload();
    };

    const toggleMobile = () => setMobileOpen(!mobileOpen);

    return (
        <>
            {/* Desktop & Main Nav Bar */}
            <nav className={`main-navbar ${isDark ? 'dark' : 'light'}`}>
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        Nex<span>Learn</span>
                    </Link>

                    <div className="nav-links-desktop">
                        <Link to="/courses">Courses</Link>
                        <Link to="/about">About</Link>
                        {user && <Link to="/my-courses">My Courses</Link>}
                        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
                        {(user?.role === 'instructor' || user?.role === 'admin') && (
                            <Link to="/instructor">Instructor</Link>
                        )}
                    </div>

                    <div className="nav-actions">
                        <div className="theme-toggle" onClick={toggleTheme}>
                            {isDark ? '🌙' : '☀️'}
                        </div>

                        {user ? (
                            <div className="user-profile-nav">
                                <Link to="/profile" className="avatar-link">
                                    <div className="avatar-circle">
                                        {user.avatar ? (
                                            <img src={`${API_URL}${user.avatar}`} alt="Avatar" />
                                        ) : (
                                            (user.name || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="user-name-desktop">{user.name}</span>
                                </Link>
                                <button className="logout-btn-nav" onClick={handleLogout}>Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="login-btn-nav">Login</Link>
                        )}

                        {/* Hamburger Button */}
                        <button className="hamburger-trigger" onClick={toggleMobile}>
                            <FaBars />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Premium Mobile Menu Overlay */}
            <div className={`mobile-menu-premium ${mobileOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <div className="mobile-brand">Nex<span>Learn</span></div>
                    <button className="mobile-close" onClick={toggleMobile}>
                        <FaTimes />
                    </button>
                </div>

                <div className="mobile-links-container">
                    <Link to="/" onClick={toggleMobile}>Home</Link>
                    <Link to="/about" onClick={toggleMobile}>About</Link>
                    <Link to="/courses" onClick={toggleMobile}>Courses</Link>
                    {user && <Link to="/my-courses" onClick={toggleMobile}>My Courses</Link>}
                    {user && <Link to="/profile" onClick={toggleMobile}>Profile</Link>}
                    
                    <div className="mobile-auth-section">
                        {user ? (
                            <button className="mobile-logout-btn" onClick={() => { handleLogout(); toggleMobile(); }}>
                                Logout Account
                            </button>
                        ) : (
                            <Link to="/login" className="mobile-login-btn" onClick={toggleMobile}>
                                Login to Account
                            </Link>
                        )}
                    </div>
                </div>

                <div className="mobile-socials">
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedinIn /></a>
                    <a href="https://github.com" target="_blank" rel="noreferrer"><FaGithub /></a>
                </div>
            </div>
        </>
    );
};

export default CustomNavbar;