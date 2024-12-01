/**
 * `RootLayout`:
 * - Serves as the root layout for the application, providing a consistent structure across all pages.
 * - Wraps the application with key providers:
 *   - `NotificationProvider`: Manages global notifications for success/error messages.
 *   - `AuthProvider`: Handles user authentication and authorization state.
 *   - `AppInitializer`: Prepares the app with initial settings or data fetching if required.
 * - Includes a global `Navbar` for navigation and a dedicated `modal-root` for modal rendering.
 * - Uses a `<main>` tag to render the main content (`children`).
 */

import './globals.css';
import Navbar from '../components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import AppInitializer from '@/components/AppInitializer';

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <head />
      <body>
        <NotificationProvider>
          <AuthProvider>
            <AppInitializer>
              <Navbar />
              <main>{children}</main>
              <div id="modal-root"></div>
            </AppInitializer>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}