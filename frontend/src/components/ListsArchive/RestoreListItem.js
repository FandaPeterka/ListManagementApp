'use client';

/**
 * `RestoreListItem`:
 * - Provides a button to restore an archived list.
 * - Integrates with `ArchivedListContext` to handle list restoration.
 * - Displays a restore icon and supports a customizable title tooltip.
 */

import React from 'react';
import { MdRestore } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useArchivedList } from '@/context/ArchivedListContext';

const RestoreListItem = ({ listId, title }) => {
  const { t } = useTranslation();
  const { handleRestoreList } = useArchivedList();

  const handleRestore = () => {
    handleRestoreList(listId);
  };

  return (
    <button onClick={handleRestore} title={title} className="action-button">
      <MdRestore size={20} />
    </button>
  );
};

export default RestoreListItem;