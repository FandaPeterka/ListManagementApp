'use client';

/**
 * `ListTitle`:
 * - Displays the title of a list.
 * - Allows the owner of the list to edit and save a new title.
 * - Retrieves the current list data and update functionality from `DetailsContext`.
 * - Dynamically checks the user's ownership of the list to determine edit permissions.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { useDetails } from '@/context/DetailsContext';
import { useAuth } from '@/context/AuthContext';

const ListTitle = () => {
  const { t } = useTranslation();
  const { listData, onUpdateTitle } = useDetails();
  const { currentUser } = useAuth();

  const isOwner = listData.ownerId._id === currentUser.id;

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(listData.title);

  useEffect(() => {
    setNewTitle(listData.title);
  }, [listData.title]);

  const handleSave = () => {
    if (newTitle.trim() === "") {
      alert(t('title_cannot_be_empty'));
      return;
    }
    onUpdateTitle(newTitle);
    setIsEditing(false);
  };

  return (
    <div className="box">
      {isEditing ? (
        <div className="list-title-edit">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="list-title-input"
            placeholder={t('edit_title_placeholder')}
          />
          <div className="list-title-edit-buttons">
            <button
              onClick={handleSave}
              title={t('save_changes')}
              aria-label={t('save')}
              className="list-title-button"
            >
              <MdSave size={24} />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewTitle(listData.title);
              }}
              title={t('cancel_changes')}
              aria-label={t('cancel')}
              className="list-title-button"
            >
              <MdCancel size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="list-title-display">
          <h1 className="list-title-text">{listData.title}</h1>
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              title={t('edit_title')}
              aria-label={t('edit')}
              className="list-title-button"
            >
              <MdEdit size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ListTitle;