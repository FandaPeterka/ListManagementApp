'use client';

/**
 * `DeleteListItem`:
 * - Provides a button to delete a list with a confirmation modal.
 * - Utilizes `ListContext` to handle deletion logic.
 */

import React, { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import ConfirmDeleteModal from '../ConfirmDeleteModal';
import { useList } from '@/context/ListContext';

const DeleteListItem = ({ listId }) => {
  const { t } = useTranslation();
  const { handleDeleteList } = useList();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteList(listId);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={handleDeleteClick} title={t('delete_list')} className="delete-list">
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