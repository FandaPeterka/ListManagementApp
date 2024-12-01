'use client';

/**
 * `RestoreDeletedList`:
 * - Provides a button to restore a deleted list back to the active state.
 * - Integrates with `DeletedListContext` to handle the restore operation.
 * - Uses the `MdRestore` icon to visually represent the restore action.
 */

import React from 'react';
import { MdRestore } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useDeletedList } from '@/context/DeletedListContext';

const RestoreDeletedList = ({ listId, title }) => {
  const { t } = useTranslation();
  const { handleRestoreList } = useDeletedList();

  const handleRestore = () => {
    handleRestoreList(listId);
  };

  return (
    <button onClick={handleRestore} title={title} className="action-button">
      <MdRestore size={20} />
    </button>
  );
};

export default RestoreDeletedList;