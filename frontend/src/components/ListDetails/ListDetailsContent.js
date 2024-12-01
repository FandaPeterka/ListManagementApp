'use client';

/**
 * `ListDetailsContent`:
 * - Displays a detailed view of a specific list, including its title, members, and items.
 * - Allows filtering of resolved/unresolved items and provides a summary of item statuses using a pie chart.
 * - Ensures role-based access control by verifying the user's membership in the list.
 * - Handles redirection for unauthorized users or users not logged in.
 * - Leverages context (`DetailsContext` and `AuthContext`) for fetching and managing list data.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useDetails, DetailsProvider } from '@/context/DetailsContext';

import ListTitle from './ListTitle';
import ListMembers from './ListMembers';
import ListItems from './ListItems';
import ItemsStatusPieChart from './ItemsStatusPieChart';

const ListDetailsContent = () => {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser, isAuthChecked } = useAuth();
  const {
    listData,
    members,
    fetchListDetails,
  } = useDetails();

  const listId = params.listId;
  const [filterResolved, setFilterResolved] = useState(true);

  useEffect(() => {
    const loadListDetails = async () => {
      if (listId) {
        await fetchListDetails(listId);
      }
    };
    loadListDetails();
  }, [listId, fetchListDetails]);

  useEffect(() => {
    if (isAuthChecked && !currentUser) {
      router.push('/');
    }
  }, [currentUser, isAuthChecked, router]);

  const toggleFilter = () => {
    setFilterResolved(prev => !prev);
  };

  if (!isAuthChecked || !listData) return null;

  const isMember = members.some((member) => member._id === currentUser.id);
  if (!isMember) {
    return <div>{t('access_denied')}</div>;
  }

  return (
    <div className="list-details-container">
      <ListTitle />
      <div className="flex-container">
        <div style={{ flex: 1 }}>
          <ListItems filterResolved={filterResolved} toggleFilter={toggleFilter} />
        </div>
        <div style={{ flex: 1 }}>
          <ListMembers />
        </div>
      </div>
      <ItemsStatusPieChart />
    </div>
  );
};

const ListDetailsPageContent = () => (
  <DetailsProvider>
    <ListDetailsContent />
  </DetailsProvider>
);

export default ListDetailsPageContent;