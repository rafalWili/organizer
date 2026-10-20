import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(124_92_252/0.28)] hover:brightness-105',
  secondary: 'bg-card border border-border hover:bg-accent',
  ghost: 'hover:bg-accent',
  destructive: 'bg-destructive text-white hover:opacity-90'
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-none transition disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
