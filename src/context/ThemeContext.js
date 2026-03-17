import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Always light mode now
  const [isDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('nexlearn-theme', 'light');
  }, []);

  const toggleTheme = () => {
    console.warn("Theme toggling is disabled.");
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
