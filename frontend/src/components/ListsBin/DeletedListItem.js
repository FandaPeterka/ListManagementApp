'use client';

/**
 * `DeletedListItem`:
 * - Represents a single deleted list in the trash bin.
 * - Provides the following actions for owners:
 *   - **Restore List**: Restores the deleted list using the `RestoreDeletedList` component.
 *   - **Permanently Delete**: Deletes the list permanently using the `PermanentDeleteList` component.
 * - Animates its appearance using `framer-motion` for a smooth entry.
 * - Dynamically adjusts actions based on the user's ownership of the list.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import RestoreDeletedList from './RestoreDeletedList';
import PermanentDeleteList from './PermanentDeleteList';

const DeletedListItem = ({ listId, title, isOwner, index }) => {
  const { t } = useTranslation();

  return (
    <motion.li
      className="deleted-list-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
        delay: index * 0.1,
      }}
    >
      <div className="deleted-list-item-details">
        {title}
      </div>

      {isOwner && (
        <div className="deleted-list-actions">
          <RestoreDeletedList
            listId={listId}
            title={t('restore_list')}
          />
          <PermanentDeleteList
            listId={listId}
            title={t('permanent_delete')}
          />
        </div>
      )}
    </motion.li>
  ); 
};

export default DeletedListItem;