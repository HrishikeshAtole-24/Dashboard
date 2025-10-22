import { useState, useRef, useEffect } from 'react';

export const Dropdown = ({ children, className = '', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <div 
      ref={dropdownRef}
      className={`dropdown ${isOpen ? 'active' : ''} ${className}`}
      {...props}
    >
      {children({ isOpen, setIsOpen })}
    </div>
  );
};

export const DropdownTrigger = ({ children, onClick, className = '', ...props }) => (
  <button
    className={`dropdown-trigger ${className}`}
    onClick={onClick}
    type="button"
    {...props}
  >
    {children}
  </button>
);

export const DropdownContent = ({ children, className = '', ...props }) => (
  <div className={`dropdown-content ${className}`} {...props}>
    {children}
  </div>
);

export const DropdownItem = ({ children, onClick, className = '', ...props }) => (
  <button
    className={`dropdown-item ${className}`}
    onClick={onClick}
    type="button"
    {...props}
  >
    {children}
  </button>
);

// Legacy component names for easier migration
export const DropdownMenu = Dropdown;
export const DropdownMenuTrigger = DropdownTrigger;
export const DropdownMenuContent = DropdownContent;
export const DropdownMenuItem = DropdownItem;