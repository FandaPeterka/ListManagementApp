'use client';

/**
 * `AddListItemForm`:
 * - Enables the creation of a new list by entering its title.
 * - Interacts with `ListContext` for adding the list to the backend.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useList } from '@/context/ListContext';

const AddListItemForm = () => {
  const [title, setTitle] = useState('');
  const { t } = useTranslation();
  const { handleAddList } = useList();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert(t('title_cannot_be_empty'));
      return;
    }
    try {
      await handleAddList(trimmedTitle);
      setTitle('');
    } catch (error) {
      console.error("Failed to add list:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-list-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('new_list_placeholder')}
        required
      />
      <button type="submit">
        {t('add_list')}
      </button>
    </form>
  );
};

export default AddListItemForm;