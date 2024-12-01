'use client';

/**
 * ArchivedListContext provides the state and logic for managing archived lists in the application.
 * 
 * **Features:**
 * 1. **State Management**: 
 *    - `archivedLists`: Stores the array of archived lists.
 *    - `total`: Total number of archived lists.
 *    - `currentPage`: Tracks the current page in pagination.
 *    - `limit`: Fixed limit of items per page.
 * 
 * 2. **API Interaction**: 
 *    - `fetchArchivedLists`: Fetches archived lists from the server.
 *    - `handleRestoreList`: Restores an archived list by its ID.
 *    - `handleDeleteList`: Permanently deletes an archived list by its ID.
 * 
 * 3. **Context Value**:
 *    - Provides state values and functions to fetch, restore, or delete archived lists.
 *    - Allows updating the current page for pagination.
 * 
 * 4. **Notifications and Loading**:
 *    - Integrates with `useNotification` to provide success/error messages and manage loading state.
 * 
 * 5. **Reactive State Updates**:
 *    - Automatically fetches archived lists when the user is authenticated.
 * 
 * This context should be wrapped around components requiring access to archived lists using `ArchivedListProvider`.
 * It can be consumed in child components using `useArchivedList`.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getLists, restoreList, deleteList } from '../services/listService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const ArchivedListContext = createContext();

export const ArchivedListProvider = ({ children }) => {
  const [archivedLists, setArchivedLists] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { currentUser, isAuthChecked } = useAuth();
  const { addError, addSuccess, startLoading, stopLoading } = useNotification();

  /**
   * fetchArchivedLists fetches archived lists based on the current page and limit.
   * @param {number} page - The page number to fetch.
   * @param {number} limit - The number of items per page.
   */
  const fetchArchivedLists = useCallback(async (page = 1, limit = 10) => {
    startLoading();
    try {
      const data = await getLists('archived', page, limit);
      setArchivedLists(Array.isArray(data.lists) ? data.lists : []);
      setTotal(data.total || 0);
      setCurrentPage(page);
      addSuccess('archived_lists_load_success');
    } catch (error) {
      addError('archived_lists_load_error', error);
    } finally {
      stopLoading();
    }
  }, [addSuccess, addError, startLoading, stopLoading]);

  /**
   * handleRestoreList restores an archived list by its ID and updates the state.
   * @param {string} listId - The ID of the list to restore.
   */
  const handleRestoreList = useCallback(async (listId) => {
    startLoading();
    try {
      await restoreList(listId);
      setArchivedLists((prev) => prev.filter((list) => list._id !== listId));
      setTotal((prevTotal) => prevTotal - 1);
      addSuccess('list_restore_success');
    } catch (error) {
      addError('list_restore_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  /**
   * handleDeleteList permanently deletes an archived list by its ID and updates the state.
   * @param {string} listId - The ID of the list to delete.
   */
  const handleDeleteList = useCallback(async (listId) => {
    startLoading();
    try {
      await deleteList(listId);
      setArchivedLists((prev) => prev.filter((list) => list._id !== listId));
      setTotal((prevTotal) => prevTotal - 1);
      addSuccess('list_delete_success');
    } catch (error) {
      addError('list_delete_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  useEffect(() => {
    if (isAuthChecked && currentUser) {
      fetchArchivedLists(1, limit);
    }
  }, [isAuthChecked, currentUser, fetchArchivedLists, limit]);

  const contextValue = useMemo(() => ({
    archivedLists,
    total,
    currentPage,
    limit,
    setCurrentPage,
    handleRestoreList,
    handleDeleteList,
    fetchArchivedLists,
  }), [
    archivedLists,
    total,
    currentPage,
    limit,
    handleRestoreList,
    handleDeleteList,
    fetchArchivedLists,
  ]);

  return (
    <ArchivedListContext.Provider value={contextValue}>
      {children}
    </ArchivedListContext.Provider>
  );
};

/**
 * useArchivedList is a custom hook to consume the ArchivedListContext.
 * @returns {object} The context value.
 * @throws Will throw an error if used outside of ArchivedListProvider.
 */
export const useArchivedList = () => {
  const context = useContext(ArchivedListContext);
  if (!context) {
    throw new Error('useArchivedList must be used within an ArchivedListProvider');
  }
  return context;
};