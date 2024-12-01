'use client';

/**
 * `CustomModal`:
 * - Renders a reusable modal dialog that can display dynamic content.
 * - Provides accessibility support and ensures the modal is rendered only on the client side.
 * 
 * **Props**:
 * - `isOpen`: Boolean indicating whether the modal is visible.
 * - `onClose`: Callback function to close the modal.
 * - `title`: Optional title displayed at the top of the modal.
 * - `children`: Content to display within the modal.
 * 
 * **Key Features**:
 * - Uses `ReactDOM.createPortal` to render the modal in a designated DOM element (`#modal-root`).
 * - Listens for the "Escape" key to close the modal for improved user accessibility.
 * - Prevents background scrolling when the modal is open by manipulating `document.body.style.overflow`.
 * - Includes a click-to-close overlay while ensuring clicks inside the modal content do not close it.
 * - Handles edge cases like missing `#modal-root` element with a console error.
 */

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const CustomModal = ({ isOpen, onClose, title, children }) => {
  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error('Element with id "modal-root" not found.');
    return null;
  }

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} 
      >
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    modalRoot
  );
};

export default CustomModal;