# 🚀 Express.js & MongoDB Backend for List Management Application

Welcome to the **Express.js & MongoDB Backend** for the **List Management Application**! This backend serves as a robust and secure RESTful API, powering the frontend built with Next.js. It provides comprehensive functionalities for user authentication, list and item management, and ensures data integrity and security through various middleware and best practices.

## 📋 Features

### 🔐 User Authentication & Management
- **Secure Registration & Login**: Users can register and log in with encrypted passwords.
- **JWT Authentication**: Implements access and refresh tokens for secure and efficient authentication.
- **Profile Management**: Users can update their profiles, including bio, status, and profile pictures.
- **Password Management**: Allows users to change their passwords securely.

### 🗂️ List & Item Management
- **Create, Update, & Delete Lists**: Users can create new lists, update existing ones, archive, or soft delete them.
- **Item Operations**: Add, mark as resolved/unresolved, and delete items within lists.
- **Member Management**: Add or remove members from lists, including self-removal.

### 🛡️ Security Enhancements
- **Input Validation & Sanitization**: Uses Joi and XSS to validate and sanitize user inputs.
- **Rate Limiting**: Protects against brute-force attacks by limiting the number of requests.
- **Secure HTTP Headers**: Utilizes Helmet to set secure HTTP headers.
- **CORS Configuration**: Configured to allow requests from the frontend domain.

### 🛠️ Technical Excellence
- **Error Handling**: Centralized error handling with custom AppError class.
- **Logging**: Detailed logging using Winston for monitoring and debugging.
- **File Uploads**: Handles profile picture uploads securely with Multer.
- **Token Blacklisting**: Manages token revocation to enhance security.

---

### Installation & Start

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables env
- You have to use your mongo_uri and connect it to your own database otherwise it won't work!

```bash
PORT=4000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
NODE_ENV=development
``` 

#### Start the Server
```bash
npm run dev
```

#### Use frontend or use Postman / Insomnia files from [tests/api](./tests/api)


---

# 📝 API Documentation
- **Swagger Integration**: Comprehensive API documentation available via Swagger UI.

## Authentication

### Register User

- **Endpoint**: `POST /api/users/signup`
- **Description**: Registers a new user.
- **Authentication**: Not required.

### Login User

- **Endpoint**: `POST /api/users/login`
- **Description**: Authenticates a user and returns access and refresh tokens.
- **Authentication**: Not required.

### Logout User

- **Endpoint**: `POST /api/users/logout`
- **Description**: Logs out the current user by blacklisting the refresh token.
- **Authentication**: Required (access token).

### Change Password

- **Endpoint**: `POST /api/users/change-password`
- **Description**: Changes the current user’s password.
- **Authentication**: Required (access token).

### Get Current User

- **Endpoint**: `GET /api/users/me`
- **Description**: Retrieves information about the current authenticated user.
- **Authentication**: Required (access token).

### Update Profile

- **Endpoint**: `PUT /api/users/me`
- **Description**: Updates the current user’s profile, including bio, status, username, and profile picture.
- **Authentication**: Required (access token).

## Token Management

### Refresh Token

- **Endpoint**: `POST /api/tokens/refresh-token`
- **Description**: Refreshes access and refresh tokens using a valid refresh token.
- **Authentication**: Not required (uses refresh token from cookies).

## List Management

### Create List

- **Endpoint**: `POST /api/lists`
- **Description**: Creates a new list.
- **Authentication**: Required (access token).

### Get Lists

- **Endpoint**: `GET /api/lists`
- **Description**: Retrieves a list of all lists with optional filtering.
- **Authentication**: Required (access token; owner or member).

### Get List by ID

- **Endpoint**: `GET /api/lists/{listId}`
- **Description**: Retrieves details of a specific list by its ID.
- **Authentication**: Required (access token; owner or member).

### Update List Name

- **Endpoint**: `PATCH /api/lists/{listId}/updateName`
- **Description**: Updates the name/title of a specific list.
- **Authentication**: Required (access token; owner only).

### Delete List (Soft Delete)

- **Endpoint**: `DELETE /api/lists/{listId}/delete`
- **Description**: Soft deletes a list by marking it as deleted.
- **Authentication**: Required (access token; owner only).

### Permanently Delete List

- **Endpoint**: `DELETE /api/lists/{listId}/permanent`
- **Description**: Permanently deletes a list and its associated items.
- **Authentication**: Required (access token; owner only).

### Archive List

- **Endpoint**: `PATCH /api/lists/{listId}/archive`
- **Description**: Archives a list.
- **Authentication**: Required (access token; owner only).

### Restore Archived List

- **Endpoint**: `PATCH /api/lists/{listId}/restore`
- **Description**: Restores an archived list.
- **Authentication**: Required (access token; owner only).

### Restore Deleted List

- **Endpoint**: `PATCH /api/lists/{listId}/restoreDeleted`
- **Description**: Restores a soft-deleted list.
- **Authentication**: Required (access token; owner only).

### Get List Members

- **Endpoint**: `GET /api/lists/{listId}/members`
- **Description**: Retrieves all members of a specific list.
- **Authentication**: Required (access token; owner or member).

### Add Member to List

- **Endpoint**: `POST /api/lists/{listId}/members`
- **Description**: Adds a member to a list by username.
- **Authentication**: Required (access token; owner only).

### Remove Member from List

- **Endpoint**: `DELETE /api/lists/{listId}/members/{memberId}/remove`
- **Description**: Removes a member from a list by member ID.
- **Authentication**: Required (access token; owner only).

### Remove Self from List

- **Endpoint**: `DELETE /api/lists/{listId}/members/removeSelf`
- **Description**: Allows a user to remove themselves from a list.
- **Authentication**: Required (access token; member only).

### Get Item Statistics

- **Endpoint**: `GET /api/lists/{listId}/items-stats`
- **Description**: Retrieves statistics of items within a specific list.
- **Authentication**: Required (access token; owner or member).

### Get Active Lists Item Counts

- **Endpoint**: `POST /api/lists/activeLists/items-counts`
- **Description**: Retrieves counts of active items in multiple lists.
- **Authentication**: Required (access token; owner or member).

### Permanently Delete All Deleted Lists

- **Endpoint**: `DELETE /api/lists/deleted/all`
- **Description**: Permanently deletes all soft-deleted lists for the authenticated user.
- **Authentication**: Required (access token; owner only).

## Item Management

### Add Item to List

- **Endpoint**: `POST /api/lists/{listId}/items`
- **Description**: Adds a new item to a specific list.
- **Authentication**: Required (access token; owner or member).

### Get Items from List

- **Endpoint**: `GET /api/lists/{listId}/items`
- **Description**: Retrieves all items from a specific list with optional status filtering.
- **Authentication**: Required (access token; owner or member).

### Mark Item as Resolved/Unresolved

- **Endpoint**: `PATCH /api/lists/{listId}/items/{itemId}`
- **Description**: Marks an item as resolved or unresolved.
- **Authentication**: Required (access token; owner or member).

### Delete Item from List

- **Endpoint**: `DELETE /api/lists/{listId}/items/{itemId}`
- **Description**: Deletes an item from a specific list.
- **Authentication**: Required (access token; owner or member).

---

### Project structure

```bash
/backend
  ├── /config
  │     └── db.js
  │
  ├── /middleware
  │     ├── logger.js
  │     ├── errorHandler.js
  │     ├── rateLimiter.js
  │     ├── sanitizeMiddleware.js
  │     ├── uploadMiddleware.js
  │     ├── validate.js
  │     ├── validateObjectId.js
  │     ├── authorize.js
  │     └── requireAuth.js
  │
  ├── /features
  │     ├── /users
  │     │     ├── userModel.js
  │     │     ├── userService.js
  │     │     ├── userController.js
  │     │     ├── userRoutes.js
  │     │     └── userValidation.js
  │     │
  │     ├── /lists
  │     │     ├── listModel.js
  │     │     ├── listService.js
  │     │     ├── listController.js
  │     │     ├── listRoutes.js
  │     │     └── listValidation.js
  │     │
  │     ├── /items
  │     │     ├── itemModel.js
  │     │     ├── itemService.js
  │     │     ├── itemController.js
  │     │     ├── itemRoutes.js
  │     │     └── itemValidation.js
  │     │
  │     └── /tokens
  │           ├── blacklistedTokenModel.js
  │           ├── blacklistToken.js
  │           ├── refreshTokenModel.js
  │           ├── sendTokensResponse.js
  │           ├── tokenController.js
  │           ├── tokenRoutes.js
  │           ├── tokenService.js
  │           └── validateRefreshToken.js
  │
  ├── /tests
  ├── app.js
  └── server.js
```

---

### File Descriptions

#### **/backend/config**
- **`db.js`**  
  *Connects to the MongoDB database using Mongoose.*

#### **/backend/middleware**
- **`logger.js`**  
  *Configures and exports the logger using Winston for logging application events.*

- **`errorHandler.js`**  
  *Defines the `AppError` class and the global error handling middleware.*

- **`rateLimiter.js`**  
  *Sets up rate limiting using `express-rate-limit` to prevent abuse.*

- **`sanitizeMiddleware.js`**  
  *Sanitizes user input to prevent XSS attacks using `xss`.*

- **`uploadMiddleware.js`**  
  *Configures file uploads using `multer` for handling profile picture uploads.*

- **`validate.js`**  
  *Middleware for validating requests using Joi schemas.*

- **`validateObjectId.js`**  
  *Middleware to validate MongoDB ObjectId parameters in routes.*

- **`authorize.js`**  
  *Authorization middleware to check user roles and permissions.*

- **`requireAuth.js`**  
  *Authentication middleware to verify JWT tokens and ensure the user is authenticated.*

#### **/backend/features**

- **/users**
  - **`userModel.js`**  
    *Defines the User schema and model using Mongoose.*

  - **`userService.js`**  
    *Contains business logic related to user operations like registration, login, profile updates, etc.*

  - **`userController.js`**  
    *Handles user-related HTTP requests and responses.*

  - **`userRoutes.js`**  
    *Defines the routes for user-related endpoints and connects them with controllers and validations.*

  - **`userValidation.js`**  
    *Defines Joi validation schemas for user-related requests.*

- **/lists**
  - **`listModel.js`**  
    *Defines the List schema and model using Mongoose.*

  - **`listService.js`**  
    *Contains business logic related to list operations like creating, updating, deleting lists, managing members, etc.*

  - **`listController.js`**  
    *Handles list-related HTTP requests and responses.*

  - **`listRoutes.js`**  
    *Defines the routes for list-related endpoints and connects them with controllers and validations.*

  - **`listValidation.js`**  
    *Defines Joi validation schemas for list-related requests.*

- **/items**
  - **`itemModel.js`**  
    *Defines the Item schema and model using Mongoose.*

  - **`itemService.js`**  
    *Contains business logic related to item operations like adding, retrieving, marking items as resolved, deleting items, etc.*

  - **`itemController.js`**  
    *Handles item-related HTTP requests and responses.*

  - **`itemRoutes.js`**  
    *Defines the routes for item-related endpoints and connects them with controllers and validations.*

  - **`itemValidation.js`**  
    *Defines Joi validation schemas for item-related requests.*

- **/tokens**
  - **`blacklistedTokenModel.js`**  
    *Defines the BlacklistedToken schema and model using Mongoose for token blacklisting.*

  - **`blacklistToken.js`**  
    *Functions for blacklisting tokens and checking if a token is blacklisted.*

  - **`refreshTokenModel.js`**  
    *Defines the RefreshToken schema and model using Mongoose for handling refresh tokens.*

  - **`sendTokensResponse.js`**  
    *Handles sending tokens (access and refresh) in HTTP responses.*

  - **`tokenController.js`**  
    *Handles token-related HTTP requests such as refreshing tokens.*

  - **`tokenRoutes.js`**  
    *Defines the routes for token-related endpoints and connects them with controllers and validations.*

  - **`tokenService.js`**  
    *Contains business logic related to token operations like generating and rotating tokens.*

  - **`validateRefreshToken.js`**  
    *Middleware to validate refresh tokens in requests.*

#### **/backend/tests**
- *Test files for the application, including unit and integration tests.*

#### **`app.js`**
- *Sets up the Express application, configures middleware, and defines API routes.*

#### **`server.js`**
- *Entry point of the application, connects to the database, starts the server, and handles graceful shutdowns.*

---