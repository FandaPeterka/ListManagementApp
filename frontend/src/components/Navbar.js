'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MdLogout, MdOutlineRestoreFromTrash } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { currentUser, isAuthChecked, handleLogout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const onLogout = () => {
    handleLogout();
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        {currentUser && (
          <>
            <Link href="/lists-overview" className={pathname === '/lists-overview' ? 'active' : ''}>
              {t('lists')}
            </Link>
            <Link href="/lists-archive" className={pathname === '/lists-archive' ? 'active' : ''}>
              {t('archive')}
            </Link>
            <Link href="/user-account" className={pathname === '/user-account' ? 'active' : ''}>
              {t('account')}
            </Link>
          </>
        )}
      </div>

      <div className="user-section">
        {currentUser && (
          <Link href="/lists-bin" className={`trash-link ${pathname === '/lists-bin' ? 'active' : ''}`}>
            <div className="trash-icon-container">
              <MdOutlineRestoreFromTrash aria-label={t('deleted')} className="trash-icon" />
            </div>
          </Link>
        )}
        <LanguageSwitcher />
        <ThemeToggle />

        <div
          className={currentUser ? "green-dot" : "red-dot"}
          aria-label={currentUser ? "User is logged in" : "User is not logged in"}
        />

        {currentUser ? (
          <button
            onClick={onLogout}
            title={t('logout')}
            className="logout-button"
          >
            <MdLogout className="user-icon" />
          </button>
        ) : (
          <Link href="/" className="login-link">
            {t('login')}
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;