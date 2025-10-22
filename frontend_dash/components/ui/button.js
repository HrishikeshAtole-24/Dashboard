import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  type = 'button',
  onClick,
  ...props 
}, ref) => {
  const baseClass = 'btn';
  const variantClass = variant === 'secondary' ? 'btn-secondary' : variant === 'danger' ? 'btn-danger' : 'btn-primary';
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  
  const combinedClassName = [baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={combinedClassName}
      disabled={disabled}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };