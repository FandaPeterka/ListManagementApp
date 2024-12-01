'use client';

import { ENDPOINTS } from '../constants/api';
import { HTTP_STATUS, API_CONFIG } from '../constants/config';
import { t } from '../i18n'; // Import the `t` function for translations

let handleLogoutFn = null;
let refreshTokenPromise = null; // Shared Promise for token refresh

/**
 * Sets the logout handler function.
 * This function is invoked when the user's session expires or becomes invalid.
 *
 * @param {Function} fn - Function to handle user logout.
 */
export const setHandleLogout = (fn) => {
  handleLogoutFn = fn;
};

/**
 * Central function for making API requests with automatic token refresh support.
 * If a request returns a 401 Unauthorized status, it attempts to refresh the authentication token
 * and retries the original request. Ensures that only one token refresh operation occurs at a time.
 *
 * @param {string} url - The API endpoint URL.
 * @param {object} [options={}] - Fetch options such as method, headers, body, etc.
 * @param {number} [timeout=API_CONFIG.timeout] - Request timeout in milliseconds.
 * @returns {Promise<Response>} - A Promise that resolves to the fetch response.
 * @throws {Error} - Throws an error if the request fails or the session has expired.
 */
export const fetchWithRefresh = async (url, options = {}, timeout = API_CONFIG.timeout) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal, credentials: 'include' });
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
  clearTimeout(id);

  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    // If no token refresh is in progress, initiate one
    if (!refreshTokenPromise) {
      refreshTokenPromise = (async () => {
        try {
          const refreshResponse = await fetch(ENDPOINTS.tokens.refreshToken, {
            method: 'POST',
            credentials: 'include',
          });

          if (!refreshResponse.ok) {
            if (handleLogoutFn) await handleLogoutFn();
            throw new Error(t('errors.sessionExpired'));
          }
        } catch (err) {
          if (handleLogoutFn) await handleLogoutFn();
          throw new Error(t('errors.sessionExpired'));
        } finally {
          refreshTokenPromise = null; // Reset the Promise after completion
        }
      })();
    }

    // Wait for the token refresh to complete
    try {
      await refreshTokenPromise;
    } catch (err) {
      // Token refresh failed, propagate the error
      throw err;
    }

    // Retry the original request after successful token refresh
    response = await fetch(url, { ...options, signal: controller.signal, credentials: 'include' });

    // If still unauthorized after token refresh, handle logout
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      if (handleLogoutFn) await handleLogoutFn();
      throw new Error(t('errors.sessionExpired'));
    }
  }

  return response;
};