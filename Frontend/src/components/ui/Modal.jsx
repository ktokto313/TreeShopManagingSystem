import { cn } from '../../utils/cn'

export function Modal({ open, isOpen, title, children, onClose, className }) {
  const shouldOpen = open ?? isOpen

  if (!shouldOpen) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8',
        className,
      )}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[var(--bg)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <h2 className="text-lg font-semibold text-[var(--text-h)]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md p-1 text-[var(--text-h)] opacity-60 transition hover:bg-[var(--social-bg)] hover:opacity-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}
        <div className={title ? 'p-6' : ''}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
