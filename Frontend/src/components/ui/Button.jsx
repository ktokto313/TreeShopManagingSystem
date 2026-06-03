import { cn } from '../../utils/cn'

const buttonVariants = {
  primary: 'bg-[var(--accent)] text-white hover:opacity-90',
  secondary:
    'border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] hover:bg-[var(--social-bg)]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const buttonSizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  )
}
