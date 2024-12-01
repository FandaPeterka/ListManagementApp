'use client';

/**
 * `EmptyTrashButton`:
 * - Provides a button to permanently delete all lists in the trash.
 * - Displays a confirmation modal before executing the delete operation.
 * - Integrates with `DeletedListContext` to handle the empty trash operation.
 * - Uses `ConfirmDeleteModal` to ensure user confirmation before deletion.
 */

import React, { useState } from 'react';
import { MdDeleteSweep } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import { useDeletedList } from '@/context/DeletedListContext';

const EmptyTrashButton = () => {
  const { t } = useTranslation();
  const { handleEmptyTrash } = useDeletedList();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const confirmEmptyTrash = () => {
    handleEmptyTrash();
    closeModal();
  };

  return (
    <>
      <button onClick={openModal} title={t('empty_trash')} className="empty-trash-button">
        <MdDeleteSweep size={20} className="empty-trash-icon" />
        {t('empty_trash')}
      </button>
      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmEmptyTrash}
        title={t('confirm_empty_trash_title')}
        message={t('confirm_empty_trash_message')}
      />
    </>
  );
};

export default EmptyTrashButton;