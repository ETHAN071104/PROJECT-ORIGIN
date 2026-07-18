import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}

export function PixelButton({ children, variant = 'primary', className = '', onKeyDown, ...props }: PixelButtonProps) {
  return (
    <button
      className={`pixel-button pixel-button-${variant} ${className}`}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return
        event.preventDefault()
        event.currentTarget.click()
      }}
    >
      <span>{children}</span>
    </button>
  )
}
