'use client';

/**
 * `ListItem`:
 * - Represents a single list in the overview.
 * - Allows navigation to list details and provides options to archive or delete for owners.
 * - Leverages `AuthContext` for ownership checks and `framer-motion` for animations.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import DeleteListItem from './DeleteListItem';
import ArchiveListItem from './ArchiveListItem';
import { useRouter } from 'next/navigation';

const ListItem = ({ listId, title, ownerId, index }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const router = useRouter();

  const isOwner = currentUser?.id?.toString() === ownerId?._id?.toString();

  const handleNavigate = () => {
    router.push(`/list-details/${listId}`);
  };

  return (
    <motion.li
      className="overview-list-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
        delay: index * 0.1,
      }}
    >
      <button
        onClick={handleNavigate}
        className="overview-list-item-button"
        aria-label={`View details for ${title}`}
        title={`View details for ${title}`}
      >
        <span className="overview-list-item-title">{title}</span>
      </button>

      {isOwner && (
        <div className="overview-list-actions">
          <ArchiveListItem listId={listId} />
          <DeleteListItem listId={listId} />
        </div>
      )}
    </motion.li>
  );
};

export default ListItem;