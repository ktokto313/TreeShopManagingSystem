import { cn } from '../../utils/cn'

export function Input({ label, error, className, id, ...props }) {
  const inputId = id || props.name
  const hasError = Boolean(error)

  return (
    <label className="block text-left" htmlFor={inputId}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-[var(--text-h)]">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={cn(
          'h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-h)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--accent)]',
          hasError && 'border-red-500 focus:border-red-500',
          className,
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        {...props}
      />
      {hasError && (
        <span id={`${inputId}-error`} className="mt-1 block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}

export default Input
