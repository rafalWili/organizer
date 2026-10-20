import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-primary',
        className
      )}
      {...props}
    />
  )
}
