'use client';

/**
 * ListContext provides state management and functionality for managing and interacting with lists.
 * 
 * **Features:**
 * 1. **State Management**:
 *    - `lists`: Holds an array of lists, either active or based on a specified type (e.g., archived, deleted).
 *    - `selectedList`: Tracks the currently selected list for additional operations.
 *    - `itemCounts`: Stores the count of items for each list.
 *    - `total`: Tracks the total number of lists for pagination.
 *    - `currentPage`: Tracks the current page for paginated list fetching.
 *    - `limit`: Fixed number of items per page for pagination.
 * 
 * 2. **API Interaction**:
 *    - `fetchLists`: Fetches lists based on their type (e.g., active, archived) and pagination settings.
 *    - `computeItemCounts`: Computes the number of items in the active lists.
 *    - `handleAddList`: Creates a new list and updates the state.
 *    - `handleDeleteList`: Deletes a specific list and updates the state.
 *    - `handleArchiveList`: Archives a specific list and updates the state.
 * 
 * 3. **Integration**:
 *    - Utilizes `useAuth` to check authentication and fetch current user data for authorization.
 *    - Leverages `useNotification` for displaying success and error messages and managing loading states.
 * 
 * 4. **Initialization and Effects**:
 *    - Automatically fetches active lists when the user is authenticated.
 *    - Updates item counts whenever the list data changes.
 * 
 * 5. **Context Value**:
 *    - Exposes functions and state variables to components wrapped within the `ListProvider`.
 *    - Enables dynamic operations on lists, such as creation, deletion, and archiving, along with pagination support.
 * 
 * This context should be used within a `ListProvider` wrapping relevant components and can be accessed using `useList`.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getLists, getActiveListsItemCounts, createList, deleteList, archiveList } from '../services/listService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [itemCounts, setItemCounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const { currentUser, isAuthChecked } = useAuth();
  const { addError, addSuccess, startLoading, stopLoading } = useNotification();
  const [isFetched, setIsFetched] = useState(false);

  const fetchLists = useCallback(async (type = 'active', page = 1, limit = 10) => {
    startLoading();
    try {
      const data = await getLists(type, page, limit);
      setLists(Array.isArray(data.lists) ? data.lists : []);
      setTotal(data.total || 0);
      setCurrentPage(page);
      addSuccess(`lists_load_${type}_success`);
      setIsFetched(true);
    } catch (error) {
      addError(`lists_load_${type}_error`, error);
    } finally {
      stopLoading();
    }
  }, [addSuccess, addError, startLoading, stopLoading]);

  const computeItemCounts = useCallback(async () => {
    if (lists.length === 0) {
      setItemCounts([]);
      return;
    }
    startLoading();
    try {
      const listIds = lists.map(list => list._id);
      const counts = await getActiveListsItemCounts(listIds);
      setItemCounts(counts);
    } catch (error) {
      addError('item_counts_error', error);
    } finally {
      stopLoading();
    }
  }, [lists, addError, startLoading, stopLoading]);

  const handleAddList = useCallback(async (title) => {
    startLoading();
    try {
      const newList = await createList(title);
      setLists((prevLists) => [newList, ...prevLists]);
      setTotal((prevTotal) => prevTotal + 1);
      addSuccess('list_create_success');
    } catch (error) {
      addError('list_create_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  const handleDeleteList = useCallback(async (listId) => {
    startLoading();
    try {
      const result = await deleteList(listId);
      if (result) {
        setLists((prev) => prev.filter(list => list._id !== listId));
        setTotal((prevTotal) => prevTotal - 1);
        addSuccess('list_delete_success');
      } else {
        addError('list_delete_failed', new Error('Deletion failed'));
      }
    } catch (error) {
      addError('list_delete_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  const handleArchiveList = useCallback(async (listId) => {
    startLoading();
    try {
      const result = await archiveList(listId);
      if (result) {
        setLists((prev) => prev.filter(list => list._id !== listId));
        setTotal((prevTotal) => prevTotal - 1);
        addSuccess('list_archive_success');
      } else {
        addError('list_archive_failed', new Error('Archiving failed'));
      }
    } catch (error) {
      addError('list_archive_error', error);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, addSuccess, addError]);

  useEffect(() => {
    if (isAuthChecked && currentUser && !isFetched) {
      fetchLists('active', currentPage, limit);
    }
  }, [isAuthChecked, currentUser, isFetched, fetchLists, currentPage, limit]);

  useEffect(() => {
    computeItemCounts();
  }, [lists, computeItemCounts]);

  const contextValue = useMemo(() => ({
    lists,
    selectedList,
    itemCounts,
    total,
    currentPage,
    limit,
    setSelectedList,
    setCurrentPage,
    handleAddList,
    handleDeleteList,
    handleArchiveList,
    fetchLists,
    computeItemCounts,
  }), [
    lists,
    selectedList,
    itemCounts,
    total,
    currentPage,
    limit,
    handleAddList,
    handleDeleteList,
    handleArchiveList,
    fetchLists,
    computeItemCounts,
  ]);

  return (
    <ListContext.Provider value={contextValue}>
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useList must be used within a ListProvider');
  }
  return context;
};