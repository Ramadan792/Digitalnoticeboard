import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'noticeboard_theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read the saved preference on init so there's no flash of the wrong
  // theme on refresh. Falls back to 'light' if nothing's stored yet.
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  });

  // The actual dark-mode switch: toggling the "dark" class on <html>
  // (document.documentElement) means every CSS rule in index.css that
  // targets `:root.dark { --token: value }` takes over instantly, since
  // all the app's colors are already defined as CSS custom properties.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return ctx;
}
