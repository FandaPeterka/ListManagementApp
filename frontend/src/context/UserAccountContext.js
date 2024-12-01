'use client';

/**
 * UserAccountContext provides user account management functionalities, including fetching and updating user details.
 * 
 * **Features:**
 * 1. **State Management**:
 *    - `userDetails`: Stores the details of the currently authenticated user, fetched from the server.
 * 
 * 2. **Data Fetching**:
 *    - `fetchUserDetails`: Retrieves the current user's account details from the server and updates the `userDetails` state.
 * 
 * 3. **Profile Updates**:
 *    - `updateProfileInformation`: Updates general user profile information such as bio, status, or username.
 *    - `updateProfilePicture`: Updates the user's profile picture.
 *    - `updateBio`: Updates the user's bio field specifically.
 *    - `updateStatus`: Updates the user's status field specifically.
 * 
 * 4. **Password Management**:
 *    - `changeUserPassword`: Allows the user to change their account password by providing the current and new passwords.
 * 
 * 5. **Integration**:
 *    - Relies on `useAuth` for checking user authentication status and `useNotification` for feedback to the user.
 *    - Updates are made via the `updateUserProfile` and `changePassword` functions from the `userAccountService`.
 * 
 * 6. **Context Value**:
 *    - Exposes the current user details and update functions to any component wrapped within `UserAccountProvider`.
 * 
 * 7. **Lifecycle Management**:
 *    - Automatically fetches user details when authentication is verified (`isAuthChecked`) and a `currentUser` exists.
 * 
 * This context centralizes user account data and operations, making it easily accessible across the application. Use it within a `UserAccountProvider` and access through `useUserAccount`.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getUserDetails, updateUserProfile, changePassword } from '../services/userAccountService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const UserAccountContext = createContext();

export const UserAccountProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const { currentUser, isAuthChecked } = useAuth();
  const { addError, addSuccess, startLoading, stopLoading } = useNotification();

  const fetchUserDetails = useCallback(async () => {
    startLoading();
    try {
      const data = await getUserDetails();
      setUserDetails(data);
      addSuccess('user_data_load_success');
    } catch (error) {
      addError('user_data_load_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, startLoading, stopLoading]);

  useEffect(() => {
    if (isAuthChecked && currentUser) {
      fetchUserDetails();
    }
  }, [isAuthChecked, currentUser, fetchUserDetails]);

  const updateProfileInformation = useCallback(async (updatedData) => {
    startLoading();
    try {
      const data = await updateUserProfile(updatedData);
      setUserDetails(data);
      addSuccess('profile_updated');
    } catch (error) {
      addError('failed_to_update_profile', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, startLoading, stopLoading]);

  const updateProfilePicture = useCallback(async (profilePicture) => {
    startLoading();
    try {
      const data = await updateUserProfile({ profilePicture });
      setUserDetails(data);
      addSuccess('profile_picture_updated');
    } catch (error) {
      addError('failed_to_update_profile_picture', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, startLoading, stopLoading]);

  const updateBio = useCallback(async (bio) => {
    startLoading();
    try {
      const data = await updateUserProfile({ bio });
      setUserDetails(data);
      addSuccess('bio_updated');
    } catch (error) {
      addError('failed_to_update_bio', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, startLoading, stopLoading]);

  const updateStatus = useCallback(async (status) => {
    startLoading();
    try {
      const data = await updateUserProfile({ status });
      setUserDetails(data);
      addSuccess('status_updated');
    } catch (error) {
      addError('failed_to_update_status', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, startLoading, stopLoading]);

  const changeUserPassword = useCallback(async (currentPassword, newPassword) => {
    startLoading();
    try {
      await changePassword(currentPassword, newPassword);
      addSuccess('password_changed');
    } catch (error) {
      addError('failed_to_change_password', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, startLoading, stopLoading]);

  const value = useMemo(() => ({
    userDetails,
    updateProfileInformation,
    updateProfilePicture,
    updateBio,
    updateStatus,
    changeUserPassword,
  }), [
    userDetails,
    updateProfileInformation,
    updateProfilePicture,
    updateBio,
    updateStatus,
    changeUserPassword,
  ]);

  return (
    <UserAccountContext.Provider value={value}>
      {children}
    </UserAccountContext.Provider>
  );
};

export const useUserAccount = () => useContext(UserAccountContext);