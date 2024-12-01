'use client';

/**
 * `ChangePasswordSection`:
 * - Allows users to change their password securely via a modal form.
 * - Utilizes `UserAccountContext` to handle password updates.
 * - Includes validation for current and new password inputs.
 * - Displays a modal (`CustomModal`) to encapsulate the password change form.
 * - Resets form fields and closes the modal after successful submission.
 * - Provides accessibility with labels and proper form field associations.
 */

import React, { useState } from 'react';
import { useUserAccount } from '@/context/UserAccountContext';
import { useTranslation } from 'react-i18next';
import { MdLock } from 'react-icons/md';
import CustomModal from '../CustomModal';

const ChangePasswordSection = () => {
  const { changeUserPassword } = useUserAccount();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changeUserPassword(currentPassword, newPassword);
      handleCloseModal();
    } catch (error) {
      console.error("ChangePasswordSection: Error changing password.", error);
    }
  };

  return (
    <div className="change-password-section">
      <h3 className="change-password-heading">{t('change_password')}</h3>
      <button
        onClick={handleOpenModal}
        className="edit-icon-button"
        title={t('change_password')}
      >
        <MdLock size={20} />
      </button>

      <CustomModal isOpen={isModalOpen} onClose={handleCloseModal} title={t('change_password')}>
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              {t('current_password')}
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              {t('new_password')}
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="form-input"
            />
          </div>
          <div className="button-group">
            <button
              type="submit"
              className="save-button"
            >
              {t('save')}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="cancel-button"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default ChangePasswordSection;