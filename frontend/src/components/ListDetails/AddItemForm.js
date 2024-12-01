'use client';

/**
 * `AddItemForm`:
 * - Provides a form for users to add a new item to the list.
 * - Integrates with `DetailsContext` to handle item addition through the `onAddItem` function.
 * - Includes input validation to ensure the text field is not empty before submission.
 * - Resets the input field after successful submission.
 */

import React, { useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useDetails } from '@/context/DetailsContext';

const AddItemForm = () => {
  const [itemText, setItemText] = useState('');
  const { t } = useTranslation();
  const { onAddItem } = useDetails();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (itemText.trim()) {
      onAddItem(itemText);
      setItemText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={itemText}
        onChange={(e) => setItemText(e.target.value)}
        placeholder={t('new_item_placeholder')}
        required
      />
      <button type="submit" title={t('add_item')}>
        <MdAdd size={24} />
      </button>
    </form>
  );
};

export default AddItemForm;