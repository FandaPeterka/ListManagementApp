'use client';

/**
 * `Member`:
 * - Represents a single member of a list.
 * - Displays the member's name and allows the list owner to remove the member.
 * - Checks the current user's role (owner or member) to conditionally enable the remove action.
 * - Includes animations for smooth rendering using `framer-motion`.
 */

import React from 'react';
import { MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useDetails } from '@/context/DetailsContext';
import { useAuth } from '@/context/AuthContext';

const Member = ({ memberId, memberName, isMemberOwner, isCurrentUser, index }) => {
  const { t } = useTranslation();
  const { onRemoveMember, listData } = useDetails();
  const { currentUser } = useAuth();

  const isOwner = listData.ownerId._id === currentUser.id;
  const canRemove = isOwner && !isMemberOwner && !isCurrentUser;

  const handleRemove = () => {
    if (onRemoveMember) {
      onRemoveMember(memberId);
    }
  };

  return (
    <motion.li
      className="list-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
        delay: index * 0.1, 
      }}
    >
      <span className="list-item-name">{memberName}</span>
      {canRemove && (
        <div className="list-item-actions">
          <button
            onClick={handleRemove}
            title={t('remove_member')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <MdDelete size={20} color="red" />
          </button>
        </div>
      )}
    </motion.li>
  );
};

export default Member;