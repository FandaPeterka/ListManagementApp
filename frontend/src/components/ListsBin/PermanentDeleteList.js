'use client';

/**
 * `PermanentDeleteList`:
 * - Provides a button to permanently delete a specific deleted list.
 * - Displays a confirmation modal before performing the delete operation.
 * - Integrates with `DeletedListContext` to handle the delete operation.
 * - Uses `ConfirmDeleteModal` to ensure user confirmation before proceeding.
 */

import React, { useState } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import { useDeletedList } from '@/context/DeletedListContext';

const PermanentDeleteList = ({ listId, title }) => {
  const { t } = useTranslation();
  const { handlePermanentDelete } = useDeletedList();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => setIsModalOpen(true);

  const handleConfirmDelete = () => {
    handlePermanentDelete(listId);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <button onClick={handleDeleteClick} title={title} className="action-button">
        <MdDeleteForever size={20} />
      </button>
      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title={t('confirm_permanent_delete_title')}
        message={t('confirm_permanent_delete_message')}
      />
    </>
  );
};

export default PermanentDeleteList;