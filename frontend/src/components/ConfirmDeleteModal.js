'use client';

/**
 * `ConfirmDeleteModal`:
 * - Displays a confirmation modal for delete actions.
 * - Provides options to confirm or cancel the action.
 * 
 * **Props**:
 * - `isOpen`: Controls the visibility of the modal.
 * - `onClose`: Callback function to close the modal.
 * - `onConfirm`: Callback function to execute the delete action.
 * - `title`: Optional title for the modal (default: translated "Confirm Delete" title).
 * - `message`: Optional message displayed in the modal (default: translated confirmation message).
 * 
 * **Key Features**:
 * - Utilizes `CustomModal` for modal rendering.
 * - Integrates `react-i18next` for multilingual support.
 * - Provides a clean user interface with clear confirm and cancel actions.
 */

import React from 'react';
import CustomModal from './CustomModal';
import { useTranslation } from 'react-i18next';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useTranslation();

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title || t('confirm_delete_title')}>
      <p className="confirm-delete-message">{message || t('confirm_delete_message')}</p>
      <div className="confirm-delete-buttons">
        <button
          onClick={onConfirm}
          className="confirm-button"
        >
          {t('confirm')}
        </button>
        <button
          onClick={onClose}
          className="cancel-button"
        >
          {t('cancel')}
        </button>
      </div>
    </CustomModal>
  );
};

export default ConfirmDeleteModal;