'use client';

/**
 * `DeleteListItem`:
 * - Provides a button to delete an archived list permanently.
 * - Displays a confirmation modal before performing the deletion.
 * - Integrates with `ArchivedListContext` to handle list deletion.
 * - Uses `ConfirmDeleteModal` for user confirmation before the action.
 */

import React, { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import { useArchivedList } from '@/context/ArchivedListContext';

const DeleteListItem = ({ listId, title }) => {
  const { t } = useTranslation();
  const { handleDeleteList } = useArchivedList();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => setIsModalOpen(true);

  const handleConfirmDelete = () => {
    handleDeleteList(listId);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <button onClick={handleDeleteClick} title={title} className="action-button">
        <MdDelete size={20} />
      </button>
      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title={t('confirm_delete_title')}
        message={t('confirm_delete_message')}
      />
    </>
  );
};

export default DeleteListItem;