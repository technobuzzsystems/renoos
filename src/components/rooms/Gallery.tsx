import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

interface GalleryImage {
  src: string
  alt: string
  caption?: string
}

interface GalleryProps {
  images: GalleryImage[]
  title?: string
}

export const Gallery: React.FC<GalleryProps> = ({ images, title = 'Suite Gallery' }) => {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null)

  const handlePrev = useCallback(() => {
    setActiveModalIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length))
  }, [images.length])

  const handleNext = useCallback(() => {
    setActiveModalIndex((prev) => (prev === null ? null : (prev + 1) % images.length))
  }, [images.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeModalIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalIndex(null)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModalIndex, handleNext, handlePrev])

  if (!images || images.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveModalIndex(index)}
            aria-label={`Open photo ${index + 1}: ${img.caption || img.alt}`}
            className="group relative aspect-[4/3] w-full text-left overflow-hidden bg-cream rounded-2xl cursor-pointer border border-[#E9E4DB] shadow-sm hover:shadow-warm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <img
              src={img.src}
              alt={img.alt}
              width={600}
              height={450}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/IMG/203/kitchen.avif'
              }}
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <div className="flex items-center justify-between text-cream">
                <span className="text-xs font-light text-cream/90 line-clamp-1">
                  {img.caption || img.alt}
                </span>
                <span className="p-2 bg-cream/90 rounded-full border border-cream text-forest shadow-sm">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-forest-dark/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Top Bar with counter and close button */}
          <div className="w-full max-w-6xl flex items-center justify-between z-10 py-2">
            <span className="text-xs font-mono tracking-widest uppercase text-terracotta-light font-semibold">
              Photo {activeModalIndex + 1} of {images.length}
            </span>

            <button
              onClick={() => setActiveModalIndex(null)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-cream/80 hover:text-cream bg-cream/15 hover:bg-cream/25 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cream"
              aria-label="Close Lightbox (Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Stage with Prev, Image, Next */}
          <div className="relative w-full max-w-5xl flex-grow flex items-center justify-center my-auto min-h-0">
            {/* Prev button */}
            <button
              onClick={handlePrev}
              className="absolute left-1 sm:left-4 z-10 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-cream hover:text-white bg-forest/80 hover:bg-forest border border-cream/20 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-cream shadow-warm"
              aria-label="Previous Image (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="absolute right-1 sm:right-4 z-10 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-cream hover:text-white bg-forest/80 hover:bg-forest border border-cream/20 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-cream shadow-warm"
              aria-label="Next Image (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Active Image */}
            <div className="max-h-[68vh] max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-warm-lg border border-cream/15">
              <img
                src={images[activeModalIndex].src}
                alt={images[activeModalIndex].alt}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/IMG/203/kitchen.avif'
                }}
                className="max-h-[68vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>

          {/* Bottom Bar: Caption & Interactive Thumbnail Strip */}
          <div className="w-full max-w-3xl flex flex-col items-center gap-3 pt-3 z-10">
            <p className="text-xs sm:text-sm font-light text-cream/90 text-center max-w-xl line-clamp-2">
              {images[activeModalIndex].caption || images[activeModalIndex].alt}
            </p>

            {/* Thumbnail Navigation Strip */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 scrollbar-none">
              {images.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveModalIndex(idx)}
                  aria-label={`Jump to photo ${idx + 1}`}
                  className={`relative w-14 h-10 sm:w-16 sm:h-11 shrink-0 rounded-xl overflow-hidden border transition-all focus:outline-none ${
                    activeModalIndex === idx
                      ? 'border-terracotta ring-2 ring-terracotta scale-105 opacity-100'
                      : 'border-cream/20 opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={thumb.src}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
