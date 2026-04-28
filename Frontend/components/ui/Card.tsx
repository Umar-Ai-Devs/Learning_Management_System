import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'sm' | 'md' | 'lg'
}

const Card = ({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md',
  ...props 
}: CardProps) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-soft',
    outlined: 'bg-white border-2 border-gray-200',
    elevated: 'bg-white shadow-medium border border-gray-100',
  }

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card