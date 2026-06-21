import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  className = '', 
  onChange,
  ...props 
}, ref) => {
  const generatedId = useId();
  const selectId = props.id || generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={cn(`flex flex-col gap-1.5 ${className}`, className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-black">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          onChange={onChange}
          {...props}
          id={selectId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full px-3 py-2 border rounded-md outline-none transition-colors appearance-none
            bg-bg-base text-black border-border
            focus-visible:border-interactive focus-visible:ring-1 focus-visible:ring-interactive
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-bg-error focus-visible:border-bg-error focus-visible:ring-bg-error' : ''}
          `}
        >
          {options.map((option, index) => (
            <option key={`option-${option.value}-${index}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      
      {error && (
        <p id={errorId} className="text-sm font-medium text-bg-error">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';