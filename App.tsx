import React, { useState, useCallback, useEffect } from 'react';
import MainApp from './MainApp';
import LoginPage from './LoginPage';
import type { User } from './types';

// FIX: Add a global declaration for the 'google' object from the GSI script.
// This prevents TypeScript errors when calling the Google Sign-In API.
declare const google: any;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Attempt to load user from session storage on initial load
    try {
      const savedUser = sessionStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from session storage", e);
      return null;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => setIsDarkMode(prev => !prev);

  const handleLoginSuccess = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('user', JSON.stringify(loggedInUser));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('user');
    // Also sign out from Google to allow account switching
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
  }, []);

  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
    );
  }

  return (
    <MainApp
      user={user}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      onThemeToggle={handleThemeToggle}
    />
  );
};

export default App;