// 🛠️ FIXED MODAL COMPONENT - Bulletproof modal that fixes all the bugs
import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '../utils/modalUtils';

const FixedModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  headerClassName = '', // NEW: Allow custom header styling
  size = 'md', // sm, md, lg, xl
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ...props
}) => {
  const {
    modalRef,
    containerStyles,
    contentStyles,
    handleBackdropClick,
    preventModalScroll,
  } = useModal(isOpen, onClose);

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      style={{
        ...containerStyles,
        // Mobile-safe viewport height
        height: 'calc(var(--vh, 1vh) * 100)',
        minHeight: 'calc(var(--vh, 1vh) * 100)',
        // Override inline background to use Tailwind classes instead
        backgroundColor: undefined,
      }}
      onClick={closeOnBackdropClick ? (e) => {
        // 🚨 CRITICAL: Blur active element before closing
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
        handleBackdropClick(e);
      } : undefined}
      onWheel={preventModalScroll}
      onTouchMove={preventModalScroll}
      {...props}
    >
      <div
        className={`w-full ${sizeClasses[size]} ${className}`}
        style={contentStyles}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${title.toLowerCase().replace(/\s+/g, '-')}-title` : undefined}
        aria-describedby={description ? `${description.toLowerCase().replace(/\s+/g, '-')}-description` : undefined}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-6 border-b border-gray-700 ${headerClassName}`}>
            <div className="flex-1">
              {title && (
                <h3 
                  id={title ? `${title.toLowerCase().replace(/\s+/g, '-')}-title` : undefined}
                  className="text-xl font-bold text-white"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p 
                  id={description ? `${description.toLowerCase().replace(/\s+/g, '-')}-description` : undefined}
                  className="text-sm text-gray-400 mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// 🎯 FIXED INPUT COMPONENT - Prevents focus issues
export const FixedInput = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  autoFocus = false,
  ...props
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <input
      ref={inputRef}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full max-w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 transition-all ${className}`}
      style={type === 'date' ? { 
        width: '100%', 
        maxWidth: '100%', 
        minWidth: '0',
        boxSizing: 'border-box',
        overflow: 'hidden'
      } : undefined}
      onFocus={(e) => {
        // Prevent page scroll when input is focused
        e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }}
      {...props}
    />
  );
};

// 🎯 FIXED TEXTAREA COMPONENT - Prevents focus issues
export const FixedTextarea = ({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 4,
  autoFocus = false,
  ...props
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 transition-all resize-none ${className}`}
      onFocus={(e) => {
        // Prevent page scroll when textarea is focused
        e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }}
      {...props}
    />
  );
};

// 🎯 FIXED SELECT COMPONENT - Prevents focus issues
export const FixedSelect = ({
  value,
  onChange,
  children,
  className = '',
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${className}`}
      onFocus={(e) => {
        // Prevent page scroll when select is focused
        e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }}
      {...props}
    >
      {children}
    </select>
  );
};

// 🎯 FIXED BUTTON COMPONENT - Prevents focus issues
export const FixedButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, success
  size = 'md', // sm, md, lg
  disabled = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onFocus={(e) => {
        // Prevent page scroll when button is focused
        e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default FixedModal;
