/**
 * `Pagination`:
 * - Provides navigation controls for paginated data.
 * 
 * **Props**:
 * - `currentPage`: Current active page number.
 * - `totalPages`: Total number of pages available.
 * - `onPageChange`: Callback function triggered when the page changes.
 * 
 * **Key Features**:
 * - **Previous/Next Controls**: Allows navigation to the previous or next page using buttons.
 * - **Dynamic Button States**: Disables the previous button on the first page and the next button on the last page.
 * - **Page Info Display**: Shows the current page and total number of pages.
 * - **Accessibility**: Includes `aria-label` attributes for screen readers.
 * - **Internationalization**: Supports translations using the `react-i18next` library.
 */

import React from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation();

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="pagination-container">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
        aria-label={t('previous_page')}
      >
        <FaArrowLeft className="pagination-icon" />
      </button>
      <span className="pagination-info">
        {t('page')} {currentPage} {t('of')} {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
        aria-label={t('next_page')}
      >
        <FaArrowRight className="pagination-icon" />
      </button>
    </div>
  );
};

export default Pagination;