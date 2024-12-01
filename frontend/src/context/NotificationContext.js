'use client';

/**
 * NotificationContext manages application-wide notifications and loading state.
 * 
 * **Features:**
 * 1. **State Management**:
 *    - `notifications`: Stores a list of notification objects, each containing:
 *      - `id`: A unique identifier for the notification.
 *      - `type`: Type of notification (`success`, `error`, etc.).
 *      - `message`: The message content of the notification.
 *    - `isLoading`: Tracks whether the application is currently in a loading state.
 * 
 * 2. **Notification Handling**:
 *    - `addNotification`: Adds a notification to the list with a timeout for automatic removal.
 *    - `addError`: A shorthand function for adding error notifications with optional error details.
 *    - `addSuccess`: A shorthand function for adding success notifications.
 *    - `clearNotifications`: Removes all notifications immediately.
 * 
 * 3. **Loading State Management**:
 *    - `startLoading`: Sets `isLoading` to `true`, indicating a loading state.
 *    - `stopLoading`: Sets `isLoading` to `false`, indicating the end of a loading state.
 * 
 * 4. **Integration**:
 *    - Utilizes `i18n` for translating notification messages, allowing localization.
 *    - Uses `uuid` to assign unique IDs to each notification for efficient rendering and removal.
 * 
 * 5. **Notification Rendering**:
 *    - Dynamically renders a list of notifications using the `Notification` component.
 *    - Displays a loading spinner if `isLoading` is `true`.
 * 
 * 6. **Context Value**:
 *    - Exposes functions and state variables to components wrapped within the `NotificationProvider`.
 *    - Provides a centralized system for managing user feedback (notifications) and application state (loading).
 * 
 * This context should be used within a `NotificationProvider` wrapping relevant components and can be accessed using `useNotification`.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Notification from '@/components/Notification';
import i18n from '../i18n';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();
const NOTIFICATION_TIMEOUT = 5000;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addNotification = useCallback((type, messageKey, errorObj = null) => {
    let message = i18n.t(messageKey);
    if (errorObj && errorObj.message) {
      message += `: ${errorObj.message}`;
    }
    const id = uuidv4();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, NOTIFICATION_TIMEOUT);
  }, []);

  const addError = useCallback((messageKey, errorObj) => {
    addNotification('error', messageKey, errorObj);
  }, [addNotification]);

  const addSuccess = useCallback((messageKey) => {
    addNotification('success', messageKey);
  }, [addNotification]);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const contextValue = useMemo(() => ({
    notifications,
    addError,
    addSuccess,
    clearNotifications,
    isLoading,
    startLoading,
    stopLoading,
  }), [notifications, addError, addSuccess, clearNotifications, isLoading, startLoading, stopLoading]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {isLoading && <Notification type="loading" />}
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          type={notif.type}
          message={notif.message}
          onClose={() => setNotifications((prev) => prev.filter(n => n.id !== notif.id))}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);