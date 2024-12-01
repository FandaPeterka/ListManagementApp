'use client';

/**
 * `ArchiveListItem`:
 * - Offers a button to archive a list.
 * - Uses `ListContext` for backend integration to manage archive actions.
 */

import React from 'react';
import { MdArchive } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useList } from '@/context/ListContext';

const ArchiveListItem = ({ listId }) => {
  const { t } = useTranslation();
  const { handleArchiveList } = useList();

  const handleArchive = () => {
    handleArchiveList(listId);
  };

  return (
    <button onClick={handleArchive} title={t('archive_list')} className="archive-list">
      <MdArchive size={20} />
    </button>
  );
};

export default ArchiveListItem;