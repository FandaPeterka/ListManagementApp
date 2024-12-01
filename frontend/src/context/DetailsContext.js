'use client';

/**
 * DetailsContext provides comprehensive state management and functionality for a specific list and its items and members.
 * 
 * **Features:**
 * 1. **State Management**:
 *    - `listData`: Holds the data of the currently selected list, including items and members.
 *    - `members`: Array of members associated with the list.
 *    - `filteredItems`: Items filtered by their resolved or unresolved status.
 * 
 * 2. **API Interaction**:
 *    - `fetchListDetails`: Fetches details of a specific list by its ID, including members and items.
 *    - `onAddItem`: Adds a new item to the list.
 *    - `onRemoveItem`: Removes an item from the list.
 *    - `onToggleItemResolved`: Toggles the resolved status of an item in the list.
 *    - `onRemoveMember`: Removes a member from the list.
 *    - `addMemberByUsername`: Adds a new member to the list by their username.
 *    - `onUpdateTitle`: Updates the title of the list.
 *    - `removeSelf`: Removes the current user from the list and redirects to the list overview page.
 *    - `fetchItemsByStatus`: Fetches items from the list filtered by their status (e.g., resolved or unresolved).
 * 
 * 3. **Integration**:
 *    - Utilizes `useAuth` for accessing the current user's authentication status and data.
 *    - Leverages `useNotification` for managing notifications, such as success and error messages, and loading states.
 *    - Redirects the user to `/lists-overview` in case of errors during list operations.
 * 
 * 4. **Context Value**:
 *    - Exposes state and functions for managing list operations, enabling granular control over items, members, and metadata.
 * 
 * This context is intended to be used within a `DetailsProvider` wrapping relevant components and can be accessed using `useDetails`.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { 
  getListById, 
  addItemToList, 
  deleteItemFromList, 
  markItemResolved, 
  addMemberToList, 
  removeMemberFromList, 
  updateListName,
  removeSelfFromList,
} from '../services/listService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useRouter } from 'next/navigation';

const DetailsContext = createContext();

export const DetailsProvider = ({ children }) => {
  const [listData, setListData] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const { currentUser } = useAuth();
  const { addError, addSuccess, startLoading, stopLoading } = useNotification();
  const router = useRouter();

  const fetchListDetails = useCallback(async (listId) => {
    startLoading();
    try {
      const data = await getListById(listId);
      setListData(data);
      setMembers(data.members);
      addSuccess('list_load_success');
    } catch (error) {
      addError('list_load_error', error);
      router.push('/lists-overview');
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, router, startLoading, stopLoading]);

  const onAddItem = useCallback(async (itemText) => {
    if (!listData) return;
    startLoading();
    try {
      const newItem = await addItemToList(listData._id, itemText);
      setListData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
      addSuccess('item_add_success');
    } catch (error) {
      addError('item_add_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, listData, startLoading, stopLoading]);

  const onRemoveItem = useCallback(async (itemId) => {
    if (!listData) return;
    startLoading();
    try {
      await deleteItemFromList(listData._id, itemId);
      setListData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== itemId),
      }));
      addSuccess('item_remove_success');
    } catch (error) {
      addError('item_remove_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, listData, startLoading, stopLoading]);

  const onToggleItemResolved = useCallback(async (itemId) => {
    if (!listData) return;
    startLoading();
    try {
      const item = listData.items.find((item) => item._id === itemId);
      if (!item) throw new Error('Item not found.');
      const updatedItem = await markItemResolved(listData._id, itemId, !item.isResolved);
      setListData((prev) => ({
        ...prev,
        items: prev.items.map((it) => (it._id === itemId ? updatedItem : it)),
      }));
      addSuccess('item_toggle_success');
    } catch (error) {
      addError('item_toggle_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, listData, startLoading, stopLoading]);

  const onRemoveMember = useCallback(async (memberId) => {
    if (!listData) return;
    startLoading();
    try {
      await removeMemberFromList(listData._id, memberId);
      setMembers((prev) => prev.filter((member) => member._id !== memberId));
      addSuccess('member_remove_success');
    } catch (error) {
      addError('member_remove_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, listData, startLoading, stopLoading]);

  const addMemberByUsername = useCallback(async (username) => {
    if (!listData) return;
    startLoading();
    try {
      const updatedList = await addMemberToList(listData._id, username);
      setMembers(updatedList.members);
      setListData(updatedList);
      addSuccess('member_add_success');
    } catch (error) {
      addError('member_add_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, listData, startLoading, stopLoading]);

  const onUpdateTitle = useCallback(async (newTitle) => {
    if (!listData) return;
    startLoading();
    try {
      const updatedList = await updateListName(listData._id, newTitle);
      setListData(updatedList);
      addSuccess('title_update_success');
    } catch (error) {
      addError('title_update_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, listData, startLoading, stopLoading]);

  const removeSelf = useCallback(async () => {
    if (!listData || !currentUser) return;
    startLoading();
    try {
      await removeSelfFromList(listData._id);
      router.push('/lists-overview');
      addSuccess('self_remove_success');
    } catch (error) {
      addError('self_remove_error', error);
    } finally {
      stopLoading();
    }
  }, [addError, addSuccess, currentUser, listData, router, startLoading, stopLoading]);


  const contextValue = useMemo(() => ({
    listData,
    members,
    fetchListDetails,
    onAddItem,
    onRemoveItem,
    filteredItems,
    onToggleItemResolved,
    onRemoveMember,
    addMemberByUsername,
    onUpdateTitle,
    removeSelf,
  }), [
    listData,
    members,
    fetchListDetails,
    onAddItem,
    onRemoveItem,
    filteredItems,
    onToggleItemResolved,
    onRemoveMember,
    addMemberByUsername,
    onUpdateTitle,
    removeSelf,
  ]);

  return (
    <DetailsContext.Provider value={contextValue}>
      {children}
    </DetailsContext.Provider>
  );
};

export const useDetails = () => useContext(DetailsContext);