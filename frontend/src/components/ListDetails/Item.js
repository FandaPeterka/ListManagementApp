'use client';

/**
 * `Item`:
 * - Represents a single item in the list with options to toggle its resolved state or remove it.
 * - Integrates with `DetailsContext` to invoke item-related actions (`onToggleItemResolved`, `onRemoveItem`).
 * - Displays the item text with a strikethrough if marked as resolved.
 * - Animates the item using `framer-motion` for a smooth appearance transition.
 * - Provides user-friendly buttons for toggling resolution and deleting the item.
 */

import React from 'react';
import { MdCheckCircle, MdRadioButtonUnchecked, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useDetails } from '@/context/DetailsContext';

const Item = ({ itemId, itemText, isResolved, index }) => {
  const { t } = useTranslation();
  const { onToggleItemResolved, onRemoveItem } = useDetails();

  const handleToggle = () => {
    onToggleItemResolved(itemId);
  };

  const handleRemove = () => {
    onRemoveItem(itemId);
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
      <span
        className="list-item-name"
        style={{ textDecoration: isResolved ? 'line-through' : 'none' }}
      >
        {itemText}
      </span>
      <div className="list-item-actions">
        <button
          onClick={handleToggle}
          title={isResolved ? t('mark_unresolved') : t('mark_resolved')}
        >
          {isResolved ? <MdCheckCircle size={24} /> : <MdRadioButtonUnchecked size={24} />}
        </button>
        <button onClick={handleRemove} title={t('delete_item')}>
          <MdDelete size={24} />
        </button>
      </div>
    </motion.li>
  );
};

export default Item;