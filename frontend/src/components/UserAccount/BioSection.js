/**
 * `BioSection`:
 * - Displays the user's bio and allows editing with a character limit.
 * - Provides a toggle between viewing and editing modes.
 * - Utilizes `UserAccountContext` for bio retrieval and updates.
 * - Includes validation to ensure changes are saved or reverted appropriately.
 * - Enhances user experience with accessible buttons for edit, save, and cancel actions.
 */

import React, { useState, useEffect } from 'react';
import { useUserAccount } from '@/context/UserAccountContext';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdSave, MdClose } from 'react-icons/md';

const BioSection = () => {
  const { userDetails, updateBio } = useUserAccount();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState('');

  useEffect(() => {
    if (userDetails) {
      setNewBio(userDetails.bio || '');
    }
  }, [userDetails]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setNewBio(userDetails.bio || '');
  };

  const handleSaveClick = async () => {
    try {
      await updateBio(newBio);
      setIsEditing(false);
    } catch (error) {
      console.error("BioSection: Error updating bio.", error);
    }
  };

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bio-section">
      <div className="section-header">
        <h3>{t('bio')}</h3>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="edit-icon-button"
            title={t('edit_bio')}
          >
            <MdEdit size={20} />
          </button>
        )}
      </div>
      {!isEditing ? (
        <div className="bio-content">
          <pre className="bio-text">{userDetails.bio || t('no_bio')}</pre>
        </div>
      ) : (
        <div className="bio-edit">
          <textarea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            rows={3}
            maxLength={500}
            className="bio-textarea"
            placeholder={t('enter_bio')}
          ></textarea>
          <div className="button-group">
            <button
              onClick={handleSaveClick}
              className="save-button"
              title={t('save_bio')}
            >
              <MdSave size={20} /> {t('save')}
            </button>
            <button
              onClick={handleCancelClick}
              className="cancel-button"
              title={t('cancel_bio')}
            >
              <MdClose size={20} /> {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BioSection;