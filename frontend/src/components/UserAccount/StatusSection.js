/**
 * `StatusSection`:
 * - Displays and allows editing of the user's current status.
 * - Shows the status as an icon and provides a dropdown to select a new status.
 * - Integrates `UserAccountContext` to fetch the current status and update it.
 * - Handles dropdown visibility and closes it when clicking outside.
 * - Provides status options (e.g., `idle`, `focusing`, `busy`) with corresponding icons.
 * - Uses a responsive and interactive UI for seamless status updates.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUserAccount } from '@/context/UserAccountContext';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown } from 'react-icons/md';

const statusIcons = {
  idle: '🟢',
  focusing: '🟡',
  busy: '🔴',
};

const StatusSection = () => {
  const { userDetails, updateStatus } = useUserAccount();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef(null);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleStatusClick = async (status) => {
    await updateStatus(status);
    setIsEditing(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div className="status-section">
      {!isEditing ? (
        <>
          <span
            className="status-icon"
            title={t(`status_${userDetails.status}`)}
          >
            {statusIcons[userDetails.status]}
          </span>
          <button
            onClick={handleEditClick}
            className="edit-status-button"
            title={t('edit_status')}
          >
            <MdArrowDropDown size={24} />
          </button>
        </>
      ) : (
        <div className="status-dropdown" ref={dropdownRef}>
          <div className="dropdown-content">
            {Object.keys(statusIcons).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className="dropdown-item"
              >
                {statusIcons[status]} {t(`status_${status}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusSection;