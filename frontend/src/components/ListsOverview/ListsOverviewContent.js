'use client';

/**
 * `ListsOverviewContent`:
 * - Displays a paginated overview of all active lists.
 * - Provides functionality to add new lists, view details, and visualize list data.
 * - Utilizes `ListContext` to manage lists and `AuthContext` for user authentication.
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useList, ListProvider } from '@/context/ListContext';
import { useAuth } from '@/context/AuthContext';

import AddListItemForm from './AddListItemForm';
import ListItem from './ListItem';
import ActiveListsBarChart from './ActiveListsBarChart';
import Pagination from '../Pagination';

const ListsOverviewContent = () => {
  const {
    lists,
    total,
    currentPage,
    limit,
    fetchLists,
  } = useList();
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
    fetchLists('active', page, limit);
  };

  return (
    <div className="lists-overview-container">
      <h1 className="lists-overview-heading">{t('lists_overview')}</h1>
      <AddListItemForm />

      {(!lists || lists.length === 0) ? (
        <p>{t('no_lists_available')}</p>
      ) : (
        <>
          <ul className="lists-overview-list">
            {lists.map((list, index) => (
              <ListItem
                key={list._id}
                listId={list._id}
                title={list.title}
                ownerId={list.ownerId}
                index={index}
              />
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          <ActiveListsBarChart />
        </>
      )}
    </div>
  );
};

const ListsOverview = () => (
  <ListProvider>
    <ListsOverviewContent />
  </ListProvider>
);

export default ListsOverview;