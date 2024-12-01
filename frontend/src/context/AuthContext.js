'use client';

/**
 * AuthContext manages authentication state and operations within the application.
 * 
 * **Features:**
 * 1. **State Management**:
 *    - `currentUser`: Stores the currently authenticated user's data.
 *    - `isAuthChecked`: Indicates whether authentication status has been verified.
 * 2. **Authentication Operations**:
 *    - `fetchCurrentUser`: Retrieves the currently logged-in user from the server.
 *    - `handleLogin`: Logs in the user with email and password and updates the state.
 *    - `handleSignup`: Registers a new user, logs them in, and updates the state.
 *    - `handleLogout`: Logs out the user and resets the state.
 * 3. **Integration**:
 *    - Utilizes `useNotification` for success/error messages and loading states.
 *    - Leverages `useRouter` for navigation after login/logout operations.
 * 4. **Context Value**:
 *    - Provides state and functions for authentication-related operations.
 * 
 * This context should be wrapped around the component tree using `AuthProvider` 
 * and consumed using `useAuth` in any child components that require authentication state or operations.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { login, signup, getCurrentUser, logout } from '../services/authService';
import { useNotification } from './NotificationContext';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { addError, addSuccess, startLoading, stopLoading } = useNotification();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    startLoading();
    try {
      const data = await getCurrentUser();
      setCurrentUser(data.user || null);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsAuthChecked(true);
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleLogin = useCallback(async (email, password) => {
    startLoading();
    try {
      await login(email, password);
      await fetchCurrentUser();
      addSuccess('login_success');
      router.push('/lists-overview');
    } catch (error) {
      addError('login_error', error);
    } finally {
      stopLoading();
    }
  }, [fetchCurrentUser, addSuccess, addError, startLoading, stopLoading, router]);

  const handleSignup = useCallback(async (email, username, password) => {
    startLoading();
    try {
      await signup(email, username, password);
      await fetchCurrentUser();
      addSuccess('signup_success');
      router.push('/lists-overview');
    } catch (error) {
      addError('signup_error', error);
    } finally {
      stopLoading();
    }
  }, [fetchCurrentUser, addSuccess, addError, startLoading, stopLoading, router]);

  const handleLogout = useCallback(async () => {
    startLoading();
    try {
      await logout();
      setCurrentUser(null);
      addSuccess('logout_success');
      router.push('/');
    } catch (error) {
      addError('logout_error', error);
    } finally {
      stopLoading();
    }
  }, [addSuccess, addError, startLoading, stopLoading, router]);

  const contextValue = useMemo(() => ({
    currentUser,
    isAuthChecked,
    handleLogin,
    handleSignup,
    handleLogout,
  }), [currentUser, isAuthChecked, handleLogin, handleSignup, handleLogout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);