import React from 'react'
import { Globe, Check, Volume2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/data/audioManifest'

interface LanguageSelectorProps {
  variant?: 'pill' | 'compact' | 'segmented'
  className?: string
  showIcon?: boolean
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'pill',
  className = '',
  showIcon = true,
}) => {
  const { language, setLanguage, languages, isPlaying } = useLanguage()

  // Compact variant for tight header spots
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-full bg-[#0f1b13]/90 border border-cream/20 backdrop-blur-md shadow-inner text-[10px] sm:text-xs font-mono shrink-0 ${className}`}
        role="group"
        aria-label="Language Selector"
      >
        {languages.map((l) => {
          const isActive = l.code === language
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code as Language)}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? 'bg-cream text-[#16251C] font-bold shadow-sm'
                  : 'text-cream/70 hover:text-white hover:bg-cream/10'
              }`}
              title={`${l.label} (${l.nativeLabel})`}
              aria-pressed={isActive}
            >
              <span>{l.nativeLabel}</span>
              {isActive && isPlaying && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Segmented control (ideal for concierge panels, cards, or hero cockpits)
  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-[#0f1b13]/90 border border-cream/20 backdrop-blur-md shadow-lg ${className}`}
      role="group"
      aria-label="Select Receptionist Language"
    >
      {showIcon && (
        <div className="pl-2 pr-1.5 text-amber-200/80 flex items-center gap-1.5 hidden xs:flex">
          <Globe className="w-3.5 h-3.5 text-amber-300" />
        </div>
      )}

      <div className="flex items-center gap-1">
        {languages.map((l) => {
          const isActive = l.code === language
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code as Language)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-xs font-mono transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cream text-[#16251C] font-bold shadow-md transform scale-[1.02]'
                  : 'text-cream/75 hover:text-white hover:bg-cream/10'
              }`}
              aria-pressed={isActive}
              title={`Switch to ${l.label} (${l.nativeLabel})`}
            >
              <span className="font-medium">{l.nativeLabel}</span>
              {isActive && (
                <span className="inline-flex items-center">
                  {isPlaying ? (
                    <Volume2 className="w-3 h-3 text-emerald-600 animate-pulse" />
                  ) : (
                    <Check className="w-3 h-3 text-[#16251C]" />
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
