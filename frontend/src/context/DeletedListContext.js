'use client';

/**
 * DeletedListContext manages the state and operations for handling deleted lists in the application.
 * 
 * **Features:**
 * 1. **State Management**:
 *    - `deletedLists`: Array of lists that have been marked as deleted.
 *    - `total`: Total number of deleted lists available.
 *    - `currentPage`: Current page for paginated deleted lists.
 *    - `limit`: Fixed number of items per page.
 * 
 * 2. **API Interaction**:
 *    - `fetchDeletedLists`: Fetches deleted lists from the server.
 *    - `handleRestoreList`: Restores a deleted list by its ID.
 *    - `handlePermanentDelete`: Permanently deletes a single deleted list by its ID.
 *    - `handleEmptyTrash`: Permanently deletes all deleted lists at once.
 * 
 * 3. **Integration**:
 *    - Utilizes `useAuth` for accessing the authenticated user's information.
 *    - Leverages `useNotification` for displaying success/error messages and managing loading states.
 * 
 * 4. **Context Value**:
 *    - Exposes state and functions for managing deleted lists, restoring them, and emptying the trash.
 * 
 * 5. **Reactive State Updates**:
 *    - Automatically fetches deleted lists when the user is authenticated.
 * 
 * This context should be wrapped around components requiring access to deleted lists using `DeletedListProvider`.
 * It can be consumed in child components using `useDeletedList`.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getLists, 
  restoreDeletedList, 
  permanentlyDeleteList, 
  permanentlyDeleteAllDeletedLists 
} from '../services/listService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const DeletedListContext = createContext();

export const DeletedListProvider = ({ children }) => {
  const [deletedLists, setDeletedLists] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { currentUser, isAuthChecked } = useAuth();
  const { addError, addSuccess, startLoading, stopLoading } = useNotification();

  const fetchDeletedLists = useCallback(async (page = 1, limit = 10) => {
    startLoading();
    try {
      const data = await getLists('deleted', page, limit);
      setDeletedLists(Array.isArray(data.lists) ? data.lists : []);
      setTotal(data.total || 0);
      setCurrentPage(page);
      addSuccess('deleted_lists_load_success');
    } catch (error) {
      addError('deleted_lists_load_error', error);
    } finally {
      stopLoading();
    }
  }, [addSuccess, addError, startLoading, stopLoading]);

  useEffect(() => {
    if (isAuthChecked && currentUser) {
      fetchDeletedLists(1, limit);
    }
  }, [isAuthChecked, currentUser, fetchDeletedLists, limit]);

  const handleRestoreList = useCallback(async (listId) => {
    startLoading();
    try {
      await restoreDeletedList(listId);
      setDeletedLists((prev) => prev.filter((list) => list._id !== listId));
      setTotal((prevTotal) => prevTotal - 1);
      addSuccess('list_restore_success');
    } catch (error) {
      addError('list_restore_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  const handlePermanentDelete = useCallback(async (listId) => {
    startLoading();
    try {
      await permanentlyDeleteList(listId);
      setDeletedLists((prev) => prev.filter((list) => list._id !== listId));
      setTotal((prevTotal) => prevTotal - 1);
      addSuccess('list_permanent_delete_success');
    } catch (error) {
      addError('list_permanent_delete_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  const handleEmptyTrash = useCallback(async () => {
    startLoading();
    try {
      await permanentlyDeleteAllDeletedLists();
      setDeletedLists([]);
      setTotal(0);
      addSuccess('empty_trash_success');
    } catch (error) {
      addError('empty_trash_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  const contextValue = useMemo(() => ({
    deletedLists,
    total,
    currentPage,
    limit,
    setCurrentPage,
    handleRestoreList,
    handlePermanentDelete,
    handleEmptyTrash,
    fetchDeletedLists,
  }), [
    deletedLists,
    total,
    currentPage,
    limit,
    handleRestoreList,
    handlePermanentDelete,
    handleEmptyTrash,
    fetchDeletedLists,
  ]);

  return (
    <DeletedListContext.Provider value={contextValue}>
      {children}
    </DeletedListContext.Provider>
  );
};

export const useDeletedList = () => {
  const context = useContext(DeletedListContext);
  if (!context) {
    throw new Error('useDeletedList must be used within a DeletedListProvider');
  }
  return context;
};