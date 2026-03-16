import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('nexlearn-theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = isDark ? darkTheme : lightTheme;
    
    // Apply each theme property as a CSS variable
    Object.keys(currentTheme).forEach(key => {
      root.style.setProperty(`--${key}`, currentTheme[key]);
    });
    
    // Apply data-theme attribute for CSS selectors
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    localStorage.setItem('nexlearn-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightTheme = {
  bg: '#f8fafc',
  bgSecondary: '#ffffff',
  bgTertiary: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#1e293b',
  textMuted: '#475569',
  accent: '#4f46e5',
  accentGradient: 'linear-gradient(to right, #4f46e5, #9333ea)',
  cardBg: '#ffffff',
  cardBorder: '#e2e8f0',
  cardShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
  navBg: 'rgba(255, 255, 255, 0.95)',
  navBorder: 'rgba(0, 0, 0, 0.1)',
  heroOverlay: 'linear-gradient(rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0.85))',
  badgeBg: 'rgba(79, 70, 229, 0.1)',
  badgeBorder: 'rgba(79, 70, 229, 0.2)',
  badgeText: '#4f46e5',
  sectionBorder: '#e2e8f0',
  footerBg: '#f1f5f9',
  footerBorder: '#e2e8f0'
};

const darkTheme = {
  bg: '#0f172a',
  bgSecondary: '#1e293b',
  bgTertiary: '#0f172a',
  text: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  accent: '#818cf8',
  accentGradient: 'linear-gradient(to right, #818cf8, #c084fc)',
  cardBg: '#1e293b',
  cardBorder: 'rgba(255,255,255,0.12)',
  cardShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
  navBg: 'rgba(15, 23, 42, 0.95)',
  navBorder: 'rgba(255, 255, 255, 0.1)',
  heroOverlay: 'linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85))',
  badgeBg: 'rgba(129, 140, 248, 0.2)',
  badgeBorder: 'rgba(129, 140, 248, 0.4)',
  badgeText: '#c7d2fe',
  sectionBorder: 'rgba(255,255,255,0.1)',
  footerBg: '#0a0f1e',
  footerBorder: 'rgba(255,255,255,0.1)'
};

export default ThemeContext;
