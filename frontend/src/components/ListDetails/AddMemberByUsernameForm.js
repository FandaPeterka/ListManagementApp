'use client';

/**
 * `AddMemberByUsernameForm`:
 * - Provides a form for adding a new member to the list by their username.
 * - Integrates with `DetailsContext` to invoke the `addMemberByUsername` function.
 * - Validates input to ensure the username is not empty.
 * - Displays a loading state during the member addition process.
 * - Resets the input field after a successful submission.
 */

import React, { useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useDetails } from '@/context/DetailsContext';

const AddMemberByUsernameForm = () => {
  const [username, setUsername] = useState('');
  const { t } = useTranslation();
  const { addMemberByUsername } = useDetails();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      alert(t('username_required')); 
      return;
    }

    setLoading(true);
    try {
      await addMemberByUsername(trimmedUsername);
      setUsername('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={t('enter_username')}
        required
        style={{ flex: 1, padding: '8px', marginRight: '8px' }}
      />
      <button
        type="submit"
        title={t('add_member')}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {loading ? t('adding') : <MdAdd size={24} />}
      </button>
    </form>
  );
};

export default AddMemberByUsernameForm;