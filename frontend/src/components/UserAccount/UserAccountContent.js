'use client';

/**
 * `UserAccountContent`:
 * - Displays user account details and profile information.
 * - Ensures authentication by redirecting unauthenticated users to the home page.
 * - Uses `AuthContext` for authentication state and `UserAccountContext` for user-specific details.
 * - Renders the `ProfileSection` component when user details are available; otherwise, shows a fallback message.
 */

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserAccountProvider, useUserAccount } from '@/context/UserAccountContext';
import ProfileSection from './ProfileSection';

const UserAccountContent = () => {
  const { currentUser, isAuthChecked } = useAuth();
  const { userDetails } = useUserAccount();
  const router = useRouter();

  React.useEffect(() => {
    const checkAuth = () => {
      if (isAuthChecked && !currentUser) {
        router.push('/');
      }
    };
    checkAuth();
  }, [currentUser, isAuthChecked, router]);

  if (!isAuthChecked) {
    return null; 
  }

  return (
    <div className="user-account-container">
      {userDetails ? <ProfileSection /> : <div>No user details available.</div>}
    </div>
  );
};

const UserAccount = () => (
  <UserAccountProvider>
    <UserAccountContent />
  </UserAccountProvider>
);

export default UserAccount;