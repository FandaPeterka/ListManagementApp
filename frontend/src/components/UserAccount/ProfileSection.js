/**
 * `ProfileSection`:
 * - Displays and allows editing of the user's profile information.
 * - Features sections for profile picture, user status, bio, and password change.
 * - Provides functionality to edit and update the username:
 *   - Toggles between view and edit mode for the username.
 *   - Validates input for the username and updates it using the `updateProfileInformation` method from `UserAccountContext`.
 * - Integrates subcomponents like `BioSection`, `StatusSection`, `ProfilePictureSection`, and `ChangePasswordSection`.
 * - Utilizes `UserAccountContext` for user details and updates.
 */

import React, { useState, useEffect } from 'react';
import { useUserAccount } from '@/context/UserAccountContext';
import BioSection from './BioSection';
import StatusSection from './StatusSection';
import ProfilePictureSection from './ProfilePictureSection';
import ChangePasswordSection from './ChangePasswordSection';
import { MdSave, MdClose } from 'react-icons/md';
import { FaUserEdit } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const ProfileSection = () => {
  const { userDetails, updateProfileInformation } = useUserAccount();
  const { t } = useTranslation();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    if (userDetails) {
      setNewUsername(userDetails.username);
    }
  }, [userDetails]);

  const handleEditClick = () => {
    setIsEditingUsername(true);
  };

  const handleCancelClick = () => {
    setIsEditingUsername(false);
    setNewUsername(userDetails.username);
  };

  const handleSaveClick = async () => {
    try {
      await updateProfileInformation({ username: newUsername });
      setIsEditingUsername(false);
    } catch (error) {
      console.error("ProfileSection: Error updating username.", error);
    }
  };

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-section">
      <div className="profile-header">
        <ProfilePictureSection />
        <StatusSection />
      </div>
      <div className="profile-info">
        {isEditingUsername ? (
          <div className="edit-username-section">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              className="username-input"
            />
            <div className="button-group">
              <button
                onClick={handleSaveClick}
                className="save-button"
                title={t('save_username')}
              >
                <MdSave size={20} /> {t('save')}
              </button>
              <button
                onClick={handleCancelClick}
                className="cancel-button"
                title={t('cancel_username')}
              >
                <MdClose size={20} /> {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="username-section">
            <h2>{userDetails.username}</h2>
            <button
              onClick={handleEditClick}
              className="edit-icon-button"
              title={t('edit_username')}
            >
              <FaUserEdit size={20} />
            </button>
          </div>
        )}
        <p>{userDetails.email}</p>
      </div>
      <BioSection />
      <ChangePasswordSection />
    </div>
  );
};

export default ProfileSection;