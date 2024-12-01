/**
 * `ThemeToggle`:
 * - Allows users to switch between predefined themes.
 * - Saves the selected theme in local storage for persistence across sessions.
 * 
 * **Key Features**:
 * - **Theme Management**:
 *   - Supports a collection of themes, each with a unique name and color.
 *   - Applies the selected theme to the `data-theme` attribute on the root `<html>` element.
 *   - Reverts to the default theme if none is selected.
 * 
 * - **Persistence**:
 *   - Stores the selected theme in `localStorage` to maintain preferences.
 *   - Loads and applies the stored theme on component mount.
 * 
 * - **Interactive UI**:
 *   - Displays clickable dots representing available themes.
 *   - Highlights the currently active theme with a unique background color and shadow.
 * 
 * - **Dynamic Styling**:
 *   - Updates the appearance of the application dynamically based on the selected theme.
 */

import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';

const themes = [
  { name: 'elegant-slate', color: '#6c8ebf' },
  { name: 'forest-dawn', color: '#689f38' },
  { name: 'sandstorm', color: '#c3986b' },
  { name: 'midnight-purple', color: '#8e44ad' },
  { name: 'glacier-night', color: '#4a90e2' },
  { name: 'mocha-space', color: '#b56737' },
];

const ThemeToggle = () => {
  const [theme, setTheme] = useState('default');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const index = themes.findIndex((t) => t.name === storedTheme);

    if (storedTheme && index !== -1) {
      setTheme(storedTheme);
      setActiveIndex(index);
      document.documentElement.setAttribute("data-theme", storedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme !== 'default') {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (index) => {
    setTheme(themes[index].name);
    setActiveIndex(index);
  };

  return (
    <div className="theme-toggle">
      {themes.map((theme, index) => (
        <div
          key={theme.name}
          className={`theme-toggle-dot ${activeIndex === index ? 'active' : ''}`}
          style={{
            backgroundColor: activeIndex === index ? theme.color : '#b0b0b0',
            boxShadow: activeIndex === index ? `0 0 8px 4px ${theme.color}` : 'none',
          }}
          onClick={() => handleThemeChange(index)}
        />
      ))}
    </div>
  );
};

export default ThemeToggle;