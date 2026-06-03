import { cn } from '../../utils/cn'

export default function Textarea({ label, error, className, id, ...props }) {
  const textareaId = id || props.name
  const hasError = Boolean(error)

  return (
    <label className="block text-left" htmlFor={textareaId}>
      {label && (
        <span className="mb-1 block text-sm font-medium text-[var(--text-h)]">
          {label}
        </span>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-h)] outline-none transition placeholder:text-[var(--text)] focus:border-[var(--accent)]',
          hasError && 'border-red-500 focus:border-red-500',
          className,
        )}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${textareaId}-error` : undefined}
        {...props}
      />
      {hasError && (
        <span id={`${textareaId}-error`} className="mt-1 block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}
