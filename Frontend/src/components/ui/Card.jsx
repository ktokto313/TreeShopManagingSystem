import { cn } from '../../utils/cn'

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
