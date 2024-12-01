/**
 * `Notification`:
 * - Displays notifications for success, error, or loading states.
 * - Provides a user-friendly way to convey application messages or statuses.
 * 
 * **Props**:
 * - `type`: Type of notification (`success`, `error`, or `loading`).
 * - `message`: Content of the notification, which can be a string or an array of strings.
 * - `onClose`: Callback function triggered when the close button is clicked.
 * 
 * **Key Features**:
 * - **Loading State**: Shows a spinner overlay when `type` is `loading`, without a close button.
 * - **Success/Error States**: Displays a message or list of messages with a close button.
 * - Dynamically applies appropriate styles based on the `type` (e.g., success or error).
 * - Ensures accessibility with an easily clickable close button for dismissing notifications.
 */

import React from 'react';

const Notification = ({ type, message, onClose }) => {
  if (type === 'loading') {
    return (
      <div className="app-loading-overlay">
        <div className="app-loading-spinner"></div>
      </div>
    );
  }

  const notificationClass =
    type === 'success' ? 'app-success-notification' : 'app-error-notification';
  const closeButtonClass =
    type === 'success' ? 'app-success-close-button' : 'app-error-close-button';

  return (
    <div className={notificationClass}>
      {Array.isArray(message) ? (
        <ul>
          {message.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      ) : (
        <span>{message}</span>
      )}
      <button onClick={onClose} className={closeButtonClass}>✖</button>
    </div>
  );
};

export default Notification;