'use client';

/**
 * `ListsArchive`:
 * - Displays a paginated list of archived lists.
 * - Allows users to view lists they own or are members of.
 * - Provides functionality to navigate through pages of archived lists.
 * - Integrates with `ArchivedListContext` for fetching and managing archived lists.
 * - Ensures authentication via `AuthContext` and redirects unauthenticated users to the home page.
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useArchivedList, ArchivedListProvider } from '@/context/ArchivedListContext';
import { useAuth } from '@/context/AuthContext';

import ArchivedListItem from './ArchivedListItem';
import Pagination from '../Pagination';

const ListsArchiveContent = () => {
  const { 
    archivedLists, 
    total, 
    currentPage, 
    limit, 
    setCurrentPage, 
    fetchArchivedLists 
  } = useArchivedList();
  const { currentUser, isAuthChecked } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthChecked && !currentUser) {
        router.push('/');
      }
    };
    checkAuth();
  }, [currentUser, isAuthChecked, router]);

  if (!isAuthChecked) return null; 

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (page) => {
    fetchArchivedLists(page, limit);
  };

  return (
    <div className="lists-archive-container">
      <h1 className="lists-archive-heading">{t('archived_lists')}</h1>

      <ul className="archived-lists">
        {archivedLists
          .filter((list) =>
            currentUser &&
            (list.ownerId._id.toString() === currentUser.id ||
              list.members.some((member) => member._id.toString() === currentUser.id))
          )
          .map((list, index) => (
            <ArchivedListItem
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

const ListsArchive = () => (
  <ArchivedListProvider>
    <ListsArchiveContent />
  </ArchivedListProvider>
);

export default ListsArchive;