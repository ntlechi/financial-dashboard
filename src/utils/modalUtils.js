// 🛠️ MODAL UTILITIES - Fixes for modal bugs and focus management
// This file contains utilities to fix modal interaction issues

import { useEffect, useRef } from 'react';

// 🎯 MODAL FOCUS MANAGEMENT
export const useModalFocus = (isOpen, modalRef) => {
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, modalRef]);
};

// 🚫 SCROLL PREVENTION - Mobile Keyboard Safe Version
export const useScrollPrevention = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Store original scroll position
      const scrollY = window.scrollY;
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Mobile-specific fix: Use transform instead of position fixed
      // This prevents the keyboard background issue
      if (window.innerWidth <= 768) {
        // Mobile: Use transform to prevent scroll without position fixed
        document.body.style.position = 'relative';
        document.body.style.transform = `translateY(-${scrollY}px)`;
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.bottom = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        
        // Store scroll position for restoration
        document.body.setAttribute('data-scroll-y', scrollY.toString());
      } else {
        // Desktop: Use position fixed (works fine on desktop)
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.bottom = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.transform = '';
      
      // Restore scroll position on mobile
      if (window.innerWidth <= 768) {
        const scrollY = document.body.getAttribute('data-scroll-y');
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY));
          document.body.removeAttribute('data-scroll-y');
        }
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.transform = '';
      document.body.removeAttribute('data-scroll-y');
    };
  }, [isOpen]);
};

// 🎯 MODAL BACKDROP CLICK HANDLER
export const handleBackdropClick = (event, onClose) => {
  // Only close if clicking the backdrop itself, not child elements
  if (event.target === event.currentTarget) {
    onClose();
  }
};

// 🚫 PREVENT MODAL SCROLL PROPAGATION
export const preventModalScroll = (event) => {
  // Prevent scroll events from bubbling up to the body
  event.stopPropagation();
};

// 🎯 TRAP FOCUS WITHIN MODAL
export const useFocusTrap = (isOpen, modalRef) => {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Add event listener
    modal.addEventListener('keydown', handleTabKey);

    // Focus first element when modal opens
    firstElement?.focus();

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, modalRef]);
};

// 🎯 MODAL CONTAINER STYLES
export const getModalContainerStyles = () => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
});

// 🎯 MODAL CONTENT STYLES
export const getModalContentStyles = () => ({
  position: 'relative',
  maxHeight: '85vh',
  overflowY: 'auto',
  overflowX: 'hidden',
  outline: 'none',
  borderRadius: '0.75rem',
  backgroundColor: '#1F2937',
  border: '1px solid rgba(75, 85, 99, 0.3)',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
});

// 🎯 INPUT FOCUS STYLES
export const getInputFocusStyles = () => ({
  focus: {
    borderColor: '#3B82F6',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  hover: {
    borderColor: '#6B7280',
  },
  base: {
    backgroundColor: '#374151',
    color: '#FFFFFF',
    border: '1px solid #4B5563',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    transition: 'all 0.2s ease-in-out',
  }
});

// 🎯 MODAL ANIMATION UTILITIES
export const getModalAnimations = () => ({
  enter: {
    opacity: 0,
    transform: 'scale(0.95) translateY(-10px)',
  },
  enterActive: {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
    transition: 'all 0.2s ease-out',
  },
  exit: {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  },
  exitActive: {
    opacity: 0,
    transform: 'scale(0.95) translateY(-10px)',
    transition: 'all 0.15s ease-in',
  },
});

// 🎯 MODAL ERROR HANDLING
export const handleModalError = (error, context) => {
  console.error(`Modal Error in ${context}:`, error);
  
  // Show user-friendly error message
  const errorMessage = error.message || 'An unexpected error occurred';
  
  // You can integrate with your notification system here
  // For now, we'll use a simple alert
  alert(`Error: ${errorMessage}`);
};

// 🎯 MODAL ACCESSIBILITY UTILITIES
export const getModalAccessibilityProps = (title, description) => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-labelledby': title ? `${title.toLowerCase().replace(/\s+/g, '-')}-title` : undefined,
  'aria-describedby': description ? `${description.toLowerCase().replace(/\s+/g, '-')}-description` : undefined,
});

// 🎯 MODAL KEYBOARD SHORTCUTS
export const useModalKeyboardShortcuts = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Escape key closes modal
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
};

// 🎯 MODAL PERFORMANCE OPTIMIZATION
export const useModalPerformance = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Disable pointer events on body to prevent interactions
      document.body.style.pointerEvents = 'none';
      
      // Re-enable pointer events on modal
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        modal.style.pointerEvents = 'auto';
      }
    } else {
      // Re-enable pointer events on body
      document.body.style.pointerEvents = '';
    }

    return () => {
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);
};

// 🎯 MOBILE KEYBOARD HANDLING - Prevents keyboard background issues
export const useMobileKeyboardFix = (isOpen) => {
  useEffect(() => {
    if (!isOpen || window.innerWidth > 768) return;

    // Mobile-specific keyboard handling
    const handleResize = () => {
      // When keyboard opens/closes, the viewport height changes
      // We need to adjust the modal positioning
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const handleOrientationChange = () => {
      // Handle orientation changes on mobile
      setTimeout(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }, 100);
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial setup
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isOpen]);
};

// 🎯 MODAL UTILITY HOOK - Combines all modal utilities
export const useModal = (isOpen, onClose) => {
  const modalRef = useRef(null);

  // Apply all modal utilities
  useModalFocus(isOpen, modalRef);
  useScrollPrevention(isOpen);
  useFocusTrap(isOpen, modalRef);
  useModalKeyboardShortcuts(isOpen, onClose);
  useModalPerformance(isOpen);
  useMobileKeyboardFix(isOpen);

  return {
    modalRef,
    containerStyles: getModalContainerStyles(),
    contentStyles: getModalContentStyles(),
    inputStyles: getInputFocusStyles(),
    animations: getModalAnimations(),
    accessibilityProps: getModalAccessibilityProps(),
    handleBackdropClick: (e) => handleBackdropClick(e, onClose),
    preventModalScroll,
  };
};

export default {
  useModal,
  useModalFocus,
  useScrollPrevention,
  useFocusTrap,
  useModalKeyboardShortcuts,
  useModalPerformance,
  handleBackdropClick,
  preventModalScroll,
  getModalContainerStyles,
  getModalContentStyles,
  getInputFocusStyles,
  getModalAnimations,
  getModalAccessibilityProps,
  handleModalError,
};
