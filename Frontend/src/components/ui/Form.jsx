import { cn } from '../../utils/cn'

export default function Form({ className, children, ...props }) {
  return (
    <form className={cn('space-y-4', className)} noValidate {...props}>
      {children}
    </form>
  )
}
