'use client';

/**
 * `AppInitializer`:
 * - Initializes global application settings such as language and theme.
 * - Wraps the application in an `I18nextProvider` to enable multilingual support.
 * 
 * **Key Features**:
 * - **Language Initialization**:
 *   - Defaults to Czech (`cs`) if no language is set in `i18n`.
 * - **Theme Management**:
 *   - Retrieves the user's preferred theme from `localStorage` and applies it to the document's `data-theme` attribute.
 * - **Provider Integration**:
 *   - Ensures child components have access to the configured `i18n` instance for translations.
 */

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const AppInitializer = ({ children }) => {
  useEffect(() => {
    if (!i18n.language) {
      i18n.changeLanguage('cs');
    }

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.setAttribute('data-theme', storedTheme);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export default AppInitializer;