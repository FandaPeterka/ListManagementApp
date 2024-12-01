# 📝 Next.js List Management Application

Welcome to the **Next.js List Management Application**! This frontend application is built with **Next.js** and **React**, providing a seamless and interactive experience for managing your lists, items, and user accounts. Whether you're organizing tasks, projects, or personal to-dos, this application offers robust features to keep you productive and organized.

## 🚀 Features

### 🗂️ List Management
- **Create, Edit, and Delete Lists**: Easily manage multiple lists with options to add, rename, archive, or delete them.
- **Soft Deletion & Trash Management**: Deleted lists are moved to a trash section, allowing for restoration or permanent deletion.
- **Pagination Support**: Navigate through your lists effortlessly with built-in pagination.

### 📋 Item Management
- **Add and Remove Items**: Populate your lists with items, and remove them as needed.
- **Resolve Status**: Mark items as resolved or unresolved to track progress.
- **Filter Items**: View items based on their resolution status for better organization.

### 👥 User Account Management
- **Authentication**: Secure login and signup functionalities to protect your data.
- **Profile Customization**: Update your profile information, including bio, status, and profile picture.
- **Password Management**: Change your account password with ease.

### 🔔 Notifications
- **Real-time Feedback**: Receive instant success and error notifications for your actions.
- **Loading Indicators**: Stay informed with loading states during data fetching and processing.

### 🛠️ Technical Highlights
- **Next.js Framework**: Leveraging the power of Next.js for server-side rendering and optimized performance.
- **React Context API**: Efficient state management across the application using Context Providers.
- **API Integration**: Seamless interaction with backend services for data fetching and manipulation.
- **Responsive Design**: Accessible and user-friendly interface across all devices.

---

### Installation & Start

#### 1. Configure and start backend server before frontend 

#### 2. Install Dependencies

Ensure you have Node.js installed. Then, install the necessary packages:
```bash
npm install
``` 

#### 3. Configure Environment Variables

Create a .env file in the root directory and add your environment-specific variables:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

#### 4.	Run the Development Server
```bash
npm run dev
```

---

### 🔧 Configuration

#### API Endpoints

All API interactions are managed through service files located in the services directory. The apiClient.js handles API requests with automatic token refresh support. Update the ENDPOINTS in constants/api.js to match your backend API structure.

#### Internationalization
The application uses i18n for handling translations. Update the i18n.js file to add or modify language support as needed.

---

### Project Structure 

```bash
/src
  ├── /app
  │     ├── layout.js
  │     ├── page.js
  │     ├── globals.css
  │     ├── head.js
  │     │
  │     ├── /list-details
  │     │     └── [listId]
  │     │           └── page.js
  │     │
  │     ├── /lists-overview
  │     │     └── page.js
  │     │
  │     ├── /lists-archive
  │     │     └── page.js
  │     │
  │     ├── /lists-bin
  │     │     └── page.js
  │     │
  │     └── /user-account
  │           └── page.js
  │
  ├── /components
  │     ├── AppInitializer.js
  │     ├── Navbar.js
  │     ├── Notification.js
  │     ├── Pagination.js
  │     ├── ConfirmDeleteModal.js
  │     ├── CustomModal.js
  │     ├── LanguageSwitcher.js
  │     ├── ThemeToggle.js
  │     ├── ThemeToggle.css
  │     │
  │     ├── /ListDetails
  │     │     ├── ListDetailsContent.js
  │     │     ├── ListTitle.js
  │     │     ├── ListItems.js
  │     │     ├── Item.js
  │     │     ├── AddItemForm.js
  │     │     ├── ListMembers.js
  │     │     ├── Member.js
  │     │     ├── AddMemberByUsernameForm.js
  │     │     └── ItemsStatusPieChart.js
  │     │
  │     ├── /ListsOverview
  │     │     ├── ListsOverviewContent.js
  │     │     ├── AddListItemForm.js
  │     │     ├── ListItem.js
  │     │     ├── ArchiveListItem.js
  │     │     ├── DeleteListItem.js
  │     │     └── ActiveListsBarChart.js
  │     │
  │     ├── /ListsArchive
  │     │     ├── ListsArchiveContent.js
  │     │     ├── ArchivedListItem.js
  │     │     ├── RestoreListItem.js
  │     │     └── DeleteListItem.js
  │     │
  │     ├── /ListsBin
  │     │     ├── ListsBinContent.js
  │     │     ├── DeletedListItem.js
  │     │     ├── RestoreDeletedList.js
  │     │     ├── PermanentDeleteList.js
  │     │     └── EmptyTrashButton.js
  │     │
  │     └── /UserAccount
  │           ├── UserAccountContent.js
  │           ├── ProfileSection.js
  │           ├── ProfilePictureSection.js
  │           ├── BioSection.js
  │           ├── StatusSection.js
  │           └── ChangePasswordSection.js
  │
  ├── /context
  │     ├── AuthContext.js
  │     ├── ListContext.js
  │     ├── DetailsContext.js
  │     ├── ArchivedListContext.js
  │     ├── DeletedListContext.js
  │     ├── UserAccountContext.js
  │     └── NotificationContext.js
  │
  ├── /services
  │     ├── apiClient.js
  │     ├── listService.js
  │     ├── authService.js
  │     └── userAccountService.js
  │
  ├── i18n.js
  │
  ├── /locales
  │     ├── /cs
  │     │    └── translation.json
  │     └── /en
  │          └── translation.json
  │
  └── /constants
        ├── config.js
        └── api.js
```

---

### File Descriptions

#### **/src/app**
- **`layout.js`**  
  *Root layout of the application, includes global components like Navbar.*

- **`page.js`**  
  *Home page of the application.*

- **`globals.css`**  
  *Global CSS styles applied throughout the application.*

- **`head.js`**  
  *Custom Head component for setting meta tags and other head elements.*

#### **/src/app/list-details/[listId]**
- **`page.js`**  
  *Dynamic page for displaying details of a specific list based on `listId`.*

#### **/src/app/lists-overview**
- **`page.js`**  
  *Page displaying an overview of all active lists.*

#### **/src/app/lists-archive**
- **`page.js`**  
  *Page displaying archived lists.*

#### **/src/app/lists-bin**
- **`page.js`**  
  *Page displaying lists in the trash bin.*

#### **/src/app/user-account**
- **`page.js`**  
  *User account page for managing profile and settings.*

#### **/src/components**
- **`AppInitializer.js`**  
  *Initializes global settings like language and theme.*

- **`Navbar.js`**  
  *Navigation bar component.*

- **`Notification.js`**  
  *Component for displaying notifications (success, error, loading).*

- **`Pagination.js`**  
  *Component for paginating lists.*

- **`ConfirmDeleteModal.js`**  
  *Modal component for confirming delete actions.*

- **`CustomModal.js`**  
  *Reusable modal component.*

- **`LanguageSwitcher.js`**  
  *Component for switching application languages.*

- **`ThemeToggle.js`**  
  *Component for toggling between different themes.*

- **`ThemeToggle.css`**  
  *Styles specific to `ThemeToggle` component.*

#### **/src/components/ListDetails**
- **`ListDetailsContent.js`**  
  *Content component for list details.*

- **`ListTitle.js`**  
  *Component for displaying and editing the list title.*

- **`ListItems.js`**  
  *Component for displaying items within a list.*

- **`Item.js`**  
  *Component representing a single item in the list.*

- **`AddItemForm.js`**  
  *Form component for adding new items to the list.*

- **`ListMembers.js`**  
  *Component for displaying list members.*

- **`Member.js`**  
  *Component representing a single member of the list.*

- **`AddMemberByUsernameForm.js`**  
  *Form for adding members by username.*

- **`ItemsStatusPieChart.js`**  
  *Pie chart component summarizing item statuses.*

#### **/src/components/ListsOverview**
- **`ListsOverviewContent.js`**  
  *Content component for lists overview.*

- **`AddListItemForm.js`**  
  *Form component for adding new lists.*

- **`ListItem.js`**  
  *Component representing a single list in the overview.*

- **`ArchiveListItem.js`**  
  *Component/button for archiving a list.*

- **`DeleteListItem.js`**  
  *Component/button for deleting a list.*

- **`ActiveListsBarChart.js`**  
  *Bar chart component showing active lists item counts.*

#### **/src/components/ListsArchive**
- **`ListsArchiveContent.js`**  
  *Content component for archived lists.*

- **`ArchivedListItem.js`**  
  *Component representing a single archived list.*

- **`RestoreListItem.js`**  
  *Component/button for restoring an archived list.*

- **`DeleteListItem.js`**  
  *Component/button for permanently deleting an archived list.*

#### **/src/components/ListsBin**
- **`ListsBinContent.js`**  
  *Content component for the trash bin.*

- **`DeletedListItem.js`**  
  *Component representing a single deleted list.*

- **`RestoreDeletedList.js`**  
  *Component/button for restoring a deleted list.*

- **`PermanentDeleteList.js`**  
  *Component/button for permanently deleting a list.*

- **`EmptyTrashButton.js`**  
  *Button component to empty the trash bin.*

#### **/src/components/UserAccount**
- **`UserAccountContent.js`**  
  *Content component for user account management.*

- **`ProfileSection.js`**  
  *Section for displaying and editing user profile.*

- **`ProfilePictureSection.js`**  
  *Section for managing profile picture.*

- **`BioSection.js`**  
  *Section for displaying and editing user bio.*

- **`StatusSection.js`**  
  *Section for displaying and updating user status.*

- **`ChangePasswordSection.js`**  
  *Section for changing user password.*

#### **/src/context**
- **`AuthContext.js`**  
  *React context for user authentication state and operations.*

- **`ListContext.js`**  
  *React context for managing lists state and operations.*

- **`DetailsContext.js`**  
  *React context for managing list details state and operations.*

- **`ArchivedListContext.js`**  
  *React context for managing archived lists.*

- **`DeletedListContext.js`**  
  *React context for managing deleted lists.*

- **`UserAccountContext.js`**  
  *React context for managing user account details.*

- **`NotificationContext.js`**  
  *React context for managing notifications and loading states.*

#### **/src/services**
- **`apiClient.js`**  
  *API client for making HTTP requests.*

- **`listService.js`**  
  *Service functions for list-related API operations.*

- **`authService.js`**  
  *Service functions for authentication API operations.*

- **`userAccountService.js`**  
  *Service functions for user account API operations.*

#### **/src/i18n.js**
- **`i18n.js`**  
  *Internationalization configuration using `i18next`.*

#### **/src/locales**
- **`/cs/translation.json`**  
  *Czech translation file.*

- **`/en/translation.json`**  
  *English translation file.*

#### **/src/constants**
- **`config.js`**  
  *Configuration constants for the application.*

- **`api.js`**  
  *API endpoint constants.*

---