'use client';

/**
 * `ArchivedListItem`:
 * - Represents an individual archived list in the archive view.
 * - Displays the list's title and provides actions for owners to restore or delete the list.
 * - Uses animations via `framer-motion` for smooth entry transitions.
 * - Integrates with `RestoreListItem` and `DeleteListItem` components for list actions.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import RestoreListItem from './RestoreListItem';
import DeleteListItem from './DeleteListItem';

const ArchivedListItem = ({ listId, title, isOwner, index }) => {
  const { t } = useTranslation();

  return (
    <motion.li
      className="archived-list-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
        delay: index * 0.1,
      }}
    >
      <div className="archived-list-item-details">
        {title}
      </div>

      {isOwner && (
        <div className="archived-list-actions">
          <RestoreListItem
            listId={listId}
            title={t('restore_list')}
          />
          <DeleteListItem
            listId={listId}
            title={t('delete_list')}
          />
        </div>
      )}
    </motion.li>
  );
};

export default ArchivedListItem;