import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Button = forwardRef(({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex cursor-pointer items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-interactive hover:bg-interactive-hover text-white focus-visible:ring-interactive",
    secondary: "bg-bg-surface border border-border text-black hover:bg-border focus-visible:ring-border",
    error: "bg-bg-error text-text-error focus-visible:ring-bg-error hover:opacity-90",
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(`${baseStyles} ${variants[variant]}`, className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';