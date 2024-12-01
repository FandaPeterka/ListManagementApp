# List Management Application API Documentation

Welcome to the **List Management Application** API documentation. This guide will help you set up and use the provided **Insomnia** and **Postman** collections effectively. Follow the instructions below to configure your environment, authenticate, and interact with the API seamlessly.

## Importing Collections

### Insomnia

1. **Open Insomnia**.
2. Navigate to the **Import/Export** option.
3. Select **Import Data** and then choose **From File**.
4. Locate and select the `insomnia_collection.json` file provided for this project.
5. The collection will be imported and available under your workspaces.

### Postman

1. **Open Postman**.
2. Click on the **Import** button located at the top-left corner.
3. Select the **File** option and choose the `postman_collection.json` file provided.
4. The collection will be imported and appear in your Postman workspace.

## Setting Up Environment Variables

Environment variables are essential for configuring the base URL and dynamic IDs used in API requests. Follow the steps below to set them up in both Insomnia and Postman.

### Insomnia Environment Setup

1. **Open Insomnia** and select your workspace.
2. Click on the **Environment** dropdown in the top-left corner and choose **Manage Environments**.
3. Select the **Base Environment** or create a new one.
4. Add the following variables:

   - **baseUrl**: `http://localhost:4000/api`
   - **listId**: *(Leave empty initially)*
   - **itemId**: *(Leave empty initially)*
   - **memberId**: *(Leave empty initially)*

5. Save the environment by clicking **Done**.

### Postman Environment Setup

1. **Open Postman** and navigate to the **Environments** section by clicking the gear icon in the top-right corner.
2. Click on **Add** to create a new environment.
3. Name your environment (e.g., "List Management API").
4. Add the following variables:

   | Variable   | Initial Value              | Current Value              |
   |------------|----------------------------|----------------------------|
   | baseUrl    | http://localhost:4000/api  | http://localhost:4000/api  |
   | listId     |                            |                            |
   | itemId     |                            |                            |
   | memberId   |                            |                            |

5. Save the environment by clicking **Add**.

## Authentication Workflow

Most API endpoints require user authentication. Follow these steps to authenticate and obtain the necessary tokens.

1. **Signup User**
   - Use the **Signup User** endpoint under **User Routes**.
   - Provide `email`, `username`, and `password` in the request body to create a new user account.
   - - Upon successful signup, access and refresh tokens are stored in cookies automatically.

2. **Login User**
   - Use the **Login User** endpoint to log in with your credentials.
   - Provide `email` and `password` in the request body.
   - Upon successful login, access and refresh tokens are stored in cookies automatically.

3. **Ensure Cookie Management**
   - Make sure that both **Send Cookies** and **Store Cookies** options are enabled in your API client settings.
   - This ensures that tokens are managed correctly for authenticated requests.

## Refreshing Access Tokens

Access tokens expire every **15 minutes**. To maintain authenticated sessions, you need to refresh your tokens periodically.

1. **Refresh Token Endpoint**
   - Use the **Refresh Token** endpoint under **Token Routes**.
   - Send a POST request without any body parameters.
   - The server will respond with new access and refresh tokens, updating them in your cookies.

2. **Automate Token Refresh (Optional)**
   - To streamline the process, consider setting up automated scripts or using Postman's test scripts to refresh tokens before they expire.

**Note**: Failing to refresh tokens within the 15-minute window will result in expired tokens, causing authentication errors.

## Using the API Endpoints

The API is organized into several route groups: **User Routes**, **Token Routes**, **List Routes**, and **Item Routes**. Below is an overview of each group and how to use their endpoints effectively.

### User Routes

Manage user accounts and profiles.

- **Signup User**
  - **Method**: POST
  - **Endpoint**: `/users/signup`
  - **Description**: Register a new user with `email`, `username`, and `password`.

- **Login User**
  - **Method**: POST
  - **Endpoint**: `/users/login`
  - **Description**: Authenticate a user and receive access and refresh tokens.

- **Get Current User Info**
  - **Method**: GET
  - **Endpoint**: `/users/me`
  - **Description**: Retrieve information about the authenticated user.

- **Update User Profile**
  - **Method**: PUT
  - **Endpoint**: `/users/me`
  - **Description**: Update the profile details of the authenticated user.

- **Change Password**
  - **Method**: POST
  - **Endpoint**: `/users/change-password`
  - **Description**: Change the password of the authenticated user.

- **Logout User**
  - **Method**: POST
  - **Endpoint**: `/users/logout`
  - **Description**: Logout the authenticated user and invalidate tokens.

### Token Routes

Handle token management for authenticated sessions.

- **Refresh Token**
  - **Method**: POST
  - **Endpoint**: `/tokens/refresh-token`
  - **Description**: Refresh the access and refresh tokens to maintain authenticated sessions.

### List Routes

Manage lists within the application.

- **Create List**
  - **Method**: POST
  - **Endpoint**: `/lists`
  - **Description**: Create a new list with a specified title.

- **Get Lists**
  - **Method**: GET
  - **Endpoint**: `/lists`
  - **Description**: Retrieve all lists with optional query parameters like `type`, `page`, and `limit`.

- **Get List By ID**
  - **Method**: GET
  - **Endpoint**: `/lists/{{listId}}`
  - **Description**: Retrieve a specific list by its ID.

- **Update List Name**
  - **Method**: PATCH
  - **Endpoint**: `/lists/{{listId}}/updateName`
  - **Description**: Update the name of a specific list.

- **Delete List**
  - **Method**: DELETE
  - **Endpoint**: `/lists/{{listId}}/delete`
  - **Description**: Soft delete a specific list.

- **Restore Deleted List**
  - **Method**: PATCH
  - **Endpoint**: `/lists/{{listId}}/restoreDeleted`
  - **Description**: Restore a soft-deleted list.

- **Archive List**
  - **Method**: PATCH
  - **Endpoint**: `/lists/{{listId}}/archive`
  - **Description**: Archive a specific list.

- **Restore Archived List**
  - **Method**: PATCH
  - **Endpoint**: `/lists/{{listId}}/restore`
  - **Description**: Restore an archived list.

- **Get Members**
  - **Method**: GET
  - **Endpoint**: `/lists/{{listId}}/members`
  - **Description**: Retrieve all members of a specific list.

- **Add Member**
  - **Method**: POST
  - **Endpoint**: `/lists/{{listId}}/members`
  - **Description**: Add a new member to a specific list.

- **Remove Member**
  - **Method**: DELETE
  - **Endpoint**: `/lists/{{listId}}/members/{{memberId}}/remove`
  - **Description**: Remove a member from a specific list.

- **Remove Self**
  - **Method**: DELETE
  - **Endpoint**: `/lists/{{listId}}/members/removeSelf`
  - **Description**: Remove the authenticated user from a specific list.

- **Permanently Delete List**
  - **Method**: DELETE
  - **Endpoint**: `/lists/{{listId}}/permanent`
  - **Description**: Permanently delete a list and its items.

- **Get Active Lists Item Counts**
  - **Method**: POST
  - **Endpoint**: `/lists/activeLists/items-counts`
  - **Description**: Retrieve item counts for active lists.

- **Permanently Delete All Deleted Lists**
  - **Method**: DELETE
  - **Endpoint**: `/lists/deleted/all`
  - **Description**: Permanently delete all soft-deleted lists and their items.

### Item Routes

Manage items within lists.

- **Add Item to List**
  - **Method**: POST
  - **Endpoint**: `/lists/{{listId}}/items`
  - **Description**: Add a new item to a specific list.

- **Get Items from List**
  - **Method**: GET
  - **Endpoint**: `/lists/{{listId}}/items`
  - **Description**: Retrieve all items from a specific list with optional `status` query parameter.

- **Mark Item Resolved**
  - **Method**: PATCH
  - **Endpoint**: `/lists/{{listId}}/items/{{itemId}}`
  - **Description**: Mark an item as resolved in a specific list.

- **Delete Item from List**
  - **Method**: DELETE
  - **Endpoint**: `/lists/{{listId}}/items/{{itemId}}`
  - **Description**: Delete an item from a specific list.

## Important Notes

- **Cookie Management**
  - Ensure that your API client is configured to handle cookies.
  - In **Insomnia**, verify that **Send Cookies** and **Store Cookies** are enabled in the request settings.
  - In **Postman**, cookies are managed automatically, but you can view them by clicking on the **Cookies** option.

- **Token Expiry**
  - Access tokens expire after 15 minutes.
  - Always use the **Refresh Token** endpoint to obtain new tokens before the current ones expire to avoid authentication issues.

- **Environment Variables**
  - Keep your `listId`, `itemId`, and `memberId` variables updated with the correct IDs obtained from API responses.
  - These variables are essential for endpoints that require specific resource identifiers.

- **Error Handling**
  - Pay attention to error messages returned by the API.
  - Common issues include unauthorized access due to expired tokens or missing/incorrect IDs.

- **API Base URL**
  - The default `baseUrl` is set to `http://localhost:4000/api`.
  - If your API server is hosted elsewhere, update the `baseUrl` accordingly in your environment variables.

## Conclusion

By following this guide, you should be well-equipped to interact with the **List Management Application** API using either **Insomnia** or **Postman**. Ensure that your environment variables are correctly set and that you manage your authentication tokens to maintain seamless access to the API endpoints. If you encounter any issues, refer to the [Important Notes](#important-notes) section or consult the API server logs for more details.

Happy coding!