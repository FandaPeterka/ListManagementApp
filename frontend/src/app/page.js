'use client'; 

/**
 * `Home`:
 * - Provides a user authentication interface for logging in or signing up.
 * - Integrates with `AuthContext` for handling login and signup actions.
 * 
 * **Key Features**:
 * - **Dynamic Authentication Mode**: Switches between login and signup modes with a toggle.
 * - **Form Inputs**:
 *   - Login: Requires email and password.
 *   - Signup: Requires email, username, and password.
 * - **Error Handling**: Displays appropriate error messages for login/signup failures.
 * - **Animations**: Utilizes `framer-motion` for smooth title animations.
 * 
 * **Context Integration**:
 * - Uses `useAuth` for authentication actions (`handleLogin` and `handleSignup`).
 * - Uses `useTranslation` for multilingual support in labels, buttons, and error messages.
 */

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Home = () => {
  const { handleLogin, handleSignup } = useAuth();
  const { t } = useTranslation();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const toggleAuthMode = () => {
    setIsLogin((prevIsLogin) => !prevIsLogin);
    setError('');
  };

  const authHandler = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await handleLogin(email, password);
      } else {
        await handleSignup(email, username, password);
      }
    } catch (err) {
      setError(isLogin ? t('invalid_credentials') : t('signup_failed'));
    }
  };

  return (
    <div className="home-container">
      <motion.h1
        className="auth-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {isLogin ? t('login') : t('signup')}
      </motion.h1>

      {error && (
        <p className="error-message">{error}</p>
      )}

      <form onSubmit={authHandler} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="username">{t('username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">{t('email')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('password')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <button type="submit" className="auth-button">
          {isLogin ? t('login') : t('signup')}
        </button>
      </form>

      <div
        onClick={toggleAuthMode}
        className="toggle-auth-mode"
        style={{ cursor: 'pointer', marginTop: '10px', color: '#007bff' }}
      >
        {isLogin ? t('no_account') : t('have_account')}
      </div>
    </div>
  );
};

export default Home;