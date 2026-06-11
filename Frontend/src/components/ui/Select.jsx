import { cn } from '../../utils/cn'

export function Select({
  label,
  error,
  className,
  id,
  options = [],
  ...props
}) {
  const selectId = id || props.name
  const hasError = Boolean(error)

  return (
    <label className="block text-left" htmlFor={selectId}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-[var(--text-h)]">
          {label}
        </span>
      )}
      <select
        id={selectId}
        className={cn(
          'h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-h)] outline-none transition focus:border-[var(--accent)]',
          hasError && 'border-red-500 focus:border-red-500',
          className,
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${selectId}-error` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span id={`${selectId}-error`} className="mt-1 block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}

export default Select
