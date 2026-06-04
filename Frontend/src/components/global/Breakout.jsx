import { cn } from '../../utils/cn'

export default function Breakout({ className, children, ...props }) {
  return (
    <section className={cn('w-full', className)} {...props}>
      {children}
    </section>
  )
}
