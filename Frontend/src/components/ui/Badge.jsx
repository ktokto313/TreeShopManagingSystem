import { cn } from '../../utils/cn'

const statusStyles = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-700',
  danger: 'bg-red-100 text-red-700',
}

export default function Badge({ status = 'active', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        statusStyles[status],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
