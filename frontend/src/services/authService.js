'use client';

import { ENDPOINTS } from '../constants/api';
import { fetchWithRefresh } from './apiClient';
import { t } from '../i18n'; // Import the `t` function for translations

let handleLogoutFn = null;
let refreshTokenPromise = null; // Shared Promise for token refresh

/**
 * Sets the logout handler function.
 * This function is called when the user's session expires or becomes invalid.
 *
 * @param {Function} fn - Function to handle user logout.
 */
export const setHandleLogout = (fn) => {
  handleLogoutFn = fn;
};

/**
 * Logs in a user with the provided email and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves to the user data upon successful login.
 * @throws {Error} - Throws an error if the login request fails.
 */
export const login = async (email, password) => {
  const response = await fetchWithRefresh(ENDPOINTS.auth.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    return data.data; // Returns only user data
  } else {
    throw new Error(data.error || t('errors.loginFailed'));
  }
};

/**
 * Registers a new user with the provided email, username, and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} username - The desired username.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves to the user data upon successful registration.
 * @throws {Error} - Throws an error if the signup request fails.
 */
export const signup = async (email, username, password) => {
  const response = await fetchWithRefresh(ENDPOINTS.auth.signup, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    return data.data; // Returns only user data
  } else {
    throw new Error(data.error || t('errors.signupFailed'));
  }
};

/**
 * Retrieves the currently authenticated user's data.
 *
 * @returns {Promise<object>} - A promise that resolves to the current user's data.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getCurrentUser = async () => {
  const response = await fetchWithRefresh(ENDPOINTS.auth.getCurrentUser, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (response.ok) {
    return data.data; // Returns only user data
  } else {
    throw new Error(data.error || t('errors.fetchCurrentUserFailed'));
  }
};

/**
 * Logs out the currently authenticated user.
 *
 * @returns {Promise<boolean>} - A promise that resolves to true upon successful logout.
 * @throws {Error} - Throws an error if the logout request fails.
 */
export const logout = async () => {
  const response = await fetchWithRefresh(ENDPOINTS.auth.logout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Ensures cookies are sent with the request
  });

  if (response.ok) {
    return true;
  } else {
    throw new Error(t('errors.logoutFailed'));
  }
};