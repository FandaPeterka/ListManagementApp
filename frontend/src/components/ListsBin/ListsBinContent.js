'use client';

/**
 * `ListsBinContent`:
 * - Displays a trash bin containing all deleted lists with options to manage them.
 * - Allows users to:
 *   - Restore individual lists.
 *   - Permanently delete individual lists.
 *   - Empty the entire trash bin using the `EmptyTrashButton` component.
 * - Integrates pagination to navigate through the deleted lists.
 * - Filters lists to ensure only lists relevant to the current user are displayed.
 * - Utilizes `DeletedListContext` for managing deleted lists and `AuthContext` for user authentication checks.
 * - Redirects unauthenticated users to the home page (`/`).
 */
 
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useDeletedList, DeletedListProvider } from '@/context/DeletedListContext';
import { useAuth } from '@/context/AuthContext';

import DeletedListItem from './DeletedListItem';
import EmptyTrashButton from './EmptyTrashButton';
import Pagination from '../Pagination';

const ListsBinContent = () => {
  const { 
    deletedLists, 
    total, 
    currentPage, 
    limit, 
    fetchDeletedLists 
  } = useDeletedList();
  const { currentUser, isAuthChecked } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.push('/');
    }
  }, [currentUser, isAuthChecked, router]);

  if (!isAuthChecked) return null; 

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (page) => {
    fetchDeletedLists(page, limit);
  };

  return (
    <div className="lists-bin-container">
      <h1 className="lists-bin-heading">{t('deleted_lists')}</h1>
      
      <EmptyTrashButton />

      <ul className="deleted-lists">
        {deletedLists
          .filter((list) =>
            currentUser &&
            (list.ownerId._id.toString() === currentUser.id ||
              list.members.some((member) => member._id.toString() === currentUser.id))
          )
          .map((list, index) => (
            <DeletedListItem
              key={list._id}
              listId={list._id}
              title={list.title}
              isOwner={currentUser && list.ownerId._id.toString() === currentUser.id}
              index={index}
            />
          ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

const ListsBin = () => (
  <DeletedListProvider>
    <ListsBinContent />
  </DeletedListProvider>
);

export default ListsBin;