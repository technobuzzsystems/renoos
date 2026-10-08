import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  light?: boolean
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  light = false,
}) => {
  return (
    <div
      className={cn(
        'max-w-3xl mb-12 md:mb-16',
        align === 'center' && 'mx-auto text-center',
        align === 'left' && 'text-left',
        align === 'right' && 'ml-auto text-right',
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'inline-flex items-center gap-2 mb-3 text-xs md:text-sm uppercase tracking-wider font-medium',
            light ? 'text-terracotta-light' : 'text-terracotta'
          )}
        >
          <span className="w-5 h-px bg-current opacity-60 inline-block" />
          <span>{eyebrow}</span>
          {align === 'center' && <span className="w-5 h-px bg-current opacity-60 inline-block" />}
        </div>
      )}
      <h2
        className={cn(
          'font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-tight',
          light ? 'text-cream' : 'text-forest'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-base md:text-lg font-light leading-relaxed',
            light ? 'text-cream/80' : 'text-charcoal-muted'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
