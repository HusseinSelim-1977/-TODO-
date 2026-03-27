import * as React from 'react'
import { cn } from '../lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-[#c9b8ab] bg-[#f5ebe4] px-3 py-1 text-base text-[#2d2420] placeholder:text-[#a89185] transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:border-[#a89185] focus-visible:ring-2 focus-visible:ring-[#a89185]/30 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
