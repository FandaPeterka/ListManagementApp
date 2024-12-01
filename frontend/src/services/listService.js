import { ENDPOINTS } from '../constants/api';
import { fetchWithRefresh } from './apiClient';
import { t } from '../i18n'; // Import the `t` function

/**
 * Retrieves lists based on the filter type.
 *
 * @param {string} type - Type of list ('all', 'active', 'archived', 'deleted').
 * @param {number} page - Page number for pagination.
 * @param {number} limit - Number of items per page.
 * @returns {Promise<Array>} - Returns an array of lists.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getLists = async (type = 'all', page = 1, limit = 10) => {
  const response = await fetchWithRefresh(`${ENDPOINTS.lists.getAll}?type=${type}&page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (response.ok) {
    return data.data; // Returns only the array of lists
  } else {
    throw new Error(data.message || t('errors.fetchListsFailed'));
  }
};

/**
 * Retrieves a list by its ID.
 *
 * @param {string} listId - ID of the list.
 * @returns {Promise<Object>} - Returns data about the list.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getListById = async (listId) => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.getOne(listId), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (response.ok) {
    return data.data;
  } else {
    throw new Error(data.error || t('errors.fetchListByIdFailed'));
  }
};

/**
 * Creates a new list.
 *
 * @param {string} title - Title of the list.
 * @returns {Promise<Object>} - Returns the created list.
 * @throws {Error} - Throws an error if the request fails.
 */
export const createList = async (title) => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.create, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  const data = await response.json();

  if (response.ok) {
    return data.data;
  } else {
    throw new Error(data.error || t('errors.createListFailed'));
  }
};

/**
 * Deletes a list.
 *
 * @param {string} listId - ID of the list.
 * @returns {Promise<boolean>} - Returns true upon successful deletion.
 * @throws {Error} - Throws an error if the request fails.
 */
export const deleteList = async (listId) => {
  try {
    const response = await fetchWithRefresh(ENDPOINTS.lists.delete(listId), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return true;
    } else {
      const data = await response.json();
      throw new Error(data.error || t('errors.deleteListFailed'));
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Archives a list.
 *
 * @param {string} listId - ID of the list.
 * @returns {Promise<boolean>} - Returns true upon successful archiving.
 * @throws {Error} - Throws an error if the request fails.
 */
export const archiveList = async (listId) => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.archive(listId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return true;
  } else {
    const data = await response.json();
    throw new Error(data.error || t('errors.archiveListFailed'));
  }
};

/**
 * Restores an archived list.
 *
 * @param {string} listId - ID of the list.
 * @returns {Promise<boolean>} - Returns true upon successful restoration.
 * @throws {Error} - Throws an error if the request fails.
 */
export const restoreList = async (listId) => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.restore(listId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return true;
  } else {
    const data = await response.json();
    throw new Error(data.error || t('errors.restoreListFailed'));
  }
};

/**
 * Retrieves item counts for all active lists.
 *
 * @param {Array<string>} listIds - Array of list IDs.
 * @returns {Promise<Array>} - Returns an array of objects with item count information.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getActiveListsItemCounts = async (listIds) => {
  try {
    const response = await fetchWithRefresh(ENDPOINTS.lists.getActiveListsItemCounts, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listIds }),
    });

    const data = await response.json();

    if (response.ok) {
      return data.data; // Assumes structure { status: 'success', data: [...] }
    } else {
      throw new Error(data.message || t('errors.fetchItemCountsFailed'));
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Updates the name of a list.
 *
 * @param {string} listId - ID of the list.
 * @param {string} title - New title of the list.
 * @returns {Promise<Object>} - Returns the updated list.
 * @throws {Error} - Throws an error if the request fails.
 */
export const updateListName = async (listId, title) => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.updateName(listId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  const data = await response.json();

  if (response.ok) {
    return data.data;
  } else {
    throw new Error(data.error || t('errors.updateListNameFailed'));
  }
};

/**
 * Adds an item to a list.
 *
 * @param {string} listId - ID of the list.
 * @param {string} itemText - Text of the item.
 * @returns {Promise<Object>} - Returns the added item.
 * @throws {Error} - Throws an error if the request fails.
 */
export const addItemToList = async (listId, itemText) => {
  const response = await fetchWithRefresh(ENDPOINTS.items.addItem(listId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemText }), // Corrected key from 'text' to 'itemText'
  });

  const data = await response.json();

  if (response.ok) {
    return data.data;
  } else {
    throw new Error(data.error || t('errors.addItemToListFailed'));
  }
};

/**
 * Marks an item as resolved/unresolved.
 *
 * @param {string} listId - ID of the list.
 * @param {string} itemId - ID of the item.
 * @param {boolean} isResolved - Resolution status of the item.
 * @returns {Promise<Object>} - Returns the updated item.
 * @throws {Error} - Throws an error if the request fails.
 */
export const markItemResolved = async (listId, itemId, isResolved) => {
  const response = await fetchWithRefresh(ENDPOINTS.items.updateItem(listId, itemId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isResolved }),
  });

  const data = await response.json();

  if (response.ok) {
    return data.data;
  } else {
    throw new Error(data.error || t('errors.markItemResolvedFailed'));
  }
};

/**
 * Deletes an item from a list.
 *
 * @param {string} listId - ID of the list.
 * @param {string} itemId - ID of the item.
 * @returns {Promise<boolean>} - Returns true upon successful deletion.
 * @throws {Error} - Throws an error if the request fails.
 */
export const deleteItemFromList = async (listId, itemId) => {
  const response = await fetchWithRefresh(ENDPOINTS.items.deleteItem(listId, itemId), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return true;
  } else {
    const data = await response.json();
    throw new Error(data.error || t('errors.deleteItemFromListFailed'));
  }
};

/**
 * Adds a member to a list by username.
 *
 * @param {string} listId - ID of the list.
 * @param {string} username - Username of the member.
 * @returns {Promise<Object>} - Returns the updated list.
 * @throws {Error} - Throws an error if the request fails or if the endpoint is undefined.
 */
export const addMemberToList = async (listId, username) => {
  if (!ENDPOINTS.members || !ENDPOINTS.members.addMember) {
    throw new Error(t('errors.endpointsUndefined'));
  }

  const url = ENDPOINTS.members.addMember(listId);

  const response = await fetchWithRefresh(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (response.ok) {
    return data.data; // Returns the updated list
  } else {
    throw new Error(data.error || t('errors.addMemberToListFailed'));
  }
};

/**
 * Removes a member from a list by member ID.
 *
 * @param {string} listId - ID of the list.
 * @param {string} memberId - ID of the member.
 * @returns {Promise<boolean>} - Returns true upon successful removal.
 * @throws {Error} - Throws an error if the request fails.
 */
export const removeMemberFromList = async (listId, memberId) => {
  const response = await fetchWithRefresh(ENDPOINTS.members.removeMember(listId, memberId), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    return true;
  } else {
    // If the response is 204 (No Content), you don't need to call response.json()
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      throw new Error(data.error || t('errors.removeMemberFromListFailed'));
    } else {
      throw new Error(t('errors.removeMemberFromListFailed'));
    }
  }
};

/**
 * Removes oneself from a list.
 *
 * @param {string} listId - ID of the list.
 * @returns {Promise<boolean>} - Returns true upon successful removal.
 * @throws {Error} - Throws an error if the request fails.
 */
export const removeSelfFromList = async (listId) => {
  const response = await fetchWithRefresh(ENDPOINTS.members.removeSelf(listId), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || t('errors.removeSelfFromListFailed'));
  }
  return true; // 204 No Content does not return any data
};

/**
 * Restores a soft-deleted list.
 *
 * @param {string} listId - ID of the list.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the request fails.
 */
export const restoreDeletedList = async (listId) => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.restoreDeleted(listId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || t('errors.restoreDeletedListFailed'));
  }
};

/**
 * Permanently deletes a list.
 *
 * @param {string} listId - ID of the list.
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the request fails.
 */
export const permanentlyDeleteList = async (listId) => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.permanentlyDelete(listId), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || t('errors.permanentlyDeleteListFailed'));
  }
};

/**
 * Permanently deletes all deleted lists.
 *
 * @returns {Promise<void>}
 * @throws {Error} - Throws an error if the request fails.
 */
export const permanentlyDeleteAllDeletedLists = async () => {
  const response = await fetchWithRefresh(ENDPOINTS.lists.permanentlyDeleteAllDeletedLists, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || t('errors.permanentlyDeleteAllDeletedListsFailed'));
  }
};
