import { forwardRef, useId } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  const generatedId = useId();
  const inputId = props.id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-black">
          {label}
        </label>
      )}
      
      <input
        {...props}
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`
          w-full px-3 py-2 border rounded-md outline-none transition-colors
          bg-bg-base text-black border-border
          focus-visible:border-interactive focus-visible:ring-1 focus-visible:ring-interactive
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-bg-error focus-visible:border-bg-error focus-visible:ring-bg-error' : ''}
        `}
      />
      
      {error && (
        <p id={errorId} className="text-sm font-medium text-bg-error">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';