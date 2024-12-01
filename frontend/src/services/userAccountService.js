import { fetchWithRefresh } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { t } from '../i18n'; // Import the `t` function

/**
 * Retrieves details of the currently logged-in user.
 *
 * @returns {Promise<object>} - Returns user data.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getUserDetails = async () => {
  const response = await fetchWithRefresh(ENDPOINTS.auth.getCurrentUser, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(t('errors.fetchUserDetailsFailed'));
  }
  
  const data = await response.json();
  return data.data.user;
};

/**
 * Updates the user's profile.
 *
 * @param {object} updatedData - Data to update the profile (bio, status, profilePicture, username).
 * @returns {Promise<object>} - Returns the updated user.
 * @throws {Error} - Throws an error if the request fails.
 */
export const updateUserProfile = async (updatedData) => {
  const formData = new FormData();

  if (updatedData.bio !== undefined) {
    formData.append('bio', updatedData.bio);
  }
  if (updatedData.status !== undefined) {
    formData.append('status', updatedData.status);
  }
  if (updatedData.profilePicture) {
    formData.append('profilePicture', updatedData.profilePicture);
  }
  if (updatedData.username) {
    formData.append('newUsername', updatedData.username);
  }

  const response = await fetchWithRefresh(ENDPOINTS.auth.getCurrentUser, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(t('errors.updateUserProfileFailed'));
  }
  
  const data = await response.json();
  return data.data.user;
};

/**
 * Changes the user's password.
 *
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The user's new password.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the request fails.
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await fetchWithRefresh(ENDPOINTS.auth.changePassword, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || t('errors.changePasswordFailed'));
  }
};