/**
 * `ENDPOINTS`:
 * - Provides centralized management for API endpoint URLs, ensuring consistency and reusability across the application.
 * 
 * **Structure**:
 * - **Base URLs**:
 *   - `BASE_URL`: Derived from the `NEXT_PUBLIC_BASE_URL` environment variable, defaults to `http://localhost:4000`.
 *   - `API_BASE_URL`: Constructed by appending `/api` to the `BASE_URL`.
 * 
 * - **Endpoints**:
 *   - Categorized into logical groups such as `auth`, `tokens`, `lists`, `members`, and `items`.
 *   - Includes both static URLs and dynamic ones (e.g., `getOne`, `updateName`) using template functions for parameterized paths.
 * 
 * **Key Features**:
 * - **Authentication**:
 *   - Supports user actions like login, signup, logout, and password change.
 *   - Includes endpoint for fetching the current user and refreshing tokens.
 * 
 * - **List Management**:
 *   - Covers operations like creating, updating, deleting, archiving, and restoring lists.
 *   - Includes specialized endpoints for getting item counts and handling bulk deletion of all deleted lists.
 * 
 * - **Member Management**:
 *   - Allows adding, removing members (including self-removal), and retrieving member lists for a specific list.
 * 
 * - **Item Management**:
 *   - Supports adding, updating, deleting, and filtering items by status.
 *   - Includes endpoints for retrieving all items or items with a specific status.
 * 
 * - **Dynamic URL Support**:
 *   - Dynamically generates URLs with required parameters (e.g., `getOne(listId)`).
 * 
 * **Usage**:
 * - Import the `ENDPOINTS` object to access URLs for API requests.
 * - Ensure consistency in API paths across the application.
 */

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000';

export const API_BASE_URL = `${BASE_URL}/api`;

export const ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/users/login`,
    signup: `${API_BASE_URL}/users/signup`,
    getCurrentUser: `${API_BASE_URL}/users/me`,
    logout: `${API_BASE_URL}/users/logout`,
    changePassword: `${API_BASE_URL}/users/change-password`,
  },
  tokens: {
    refreshToken: `${API_BASE_URL}/tokens/refresh-token`,
  },
  lists: {
    getAll: `${API_BASE_URL}/lists`,
    getOne: (listId) => `${API_BASE_URL}/lists/${listId}`,
    create: `${API_BASE_URL}/lists`,
    updateName: (listId) => `${API_BASE_URL}/lists/${listId}/updateName`,
    delete: (listId) => `${API_BASE_URL}/lists/${listId}/delete`,
    permanentlyDelete: (listId) => `${API_BASE_URL}/lists/${listId}/permanent`,
    restoreDeleted: (listId) => `${API_BASE_URL}/lists/${listId}/restoreDeleted`,
    archive: (listId) => `${API_BASE_URL}/lists/${listId}/archive`,
    restore: (listId) => `${API_BASE_URL}/lists/${listId}/restore`,
    getActiveListsItemCounts: `${API_BASE_URL}/lists/activeLists/items-counts`,
    permanentlyDeleteAllDeletedLists: `${API_BASE_URL}/lists/deleted/all`,
  },
  members: {
    addMember: (listId) => `${API_BASE_URL}/lists/${listId}/members`,
    removeMember: (listId, memberId) => `${API_BASE_URL}/lists/${listId}/members/${memberId}/remove`,
    removeSelf: (listId) => `${API_BASE_URL}/lists/${listId}/members/removeSelf`,
  },
  items: {
    addItem: (listId) => `${API_BASE_URL}/lists/${listId}/items`,
    updateItem: (listId, itemId) => `${API_BASE_URL}/lists/${listId}/items/${itemId}`,
    deleteItem: (listId, itemId) => `${API_BASE_URL}/lists/${listId}/items/${itemId}`,
  },
};