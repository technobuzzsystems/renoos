import React, { useState } from 'react'
import { Image, Compass, Box, Check } from 'lucide-react'
import type { Space } from '@/types'
import { PanoramaViewer } from '../panorama'
import { Model3DViewer } from '../model3d'

interface SpaceViewerProps {
  space: Space
  roomNumber: string
  initialMode?: ExplorationMode
  previousSpaceTitle?: string
  onReturnPreviousSpace?: () => void
  onNavigateSpace?: (targetSpaceId: string) => void
  className?: string
}

type ExplorationMode = 'photo' | 'panorama' | 'model3d'

export const SpaceViewer: React.FC<SpaceViewerProps> = ({
  space,
  roomNumber,
  initialMode,
  previousSpaceTitle,
  onReturnPreviousSpace,
  onNavigateSpace,
  className = '',
}) => {
  const [activeMode, setActiveMode] = useState<ExplorationMode>(initialMode || 'photo')
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null)

  React.useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode)
    }
  }, [initialMode])

  // Check if a real spherical panorama asset is ready for live interactive exploration
  const isPanoramaAvailable = Boolean(space.panorama.isAvailable && !space.panorama.isPlaceholder)

  // Derive selected image: if user selection is in current space's gallery, use it; else fallback to main space image
  const selectedGalleryImage =
    userSelectedImage && space.images.gallery?.includes(userSelectedImage)
      ? userSelectedImage
      : space.images.main

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Exploration View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-cream/95 border border-[#E9E4DB] rounded-2xl backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-ivory rounded-full border border-[#E9E4DB] w-full sm:w-auto">
          <button
            onClick={() => setActiveMode('photo')}
            data-testid="mode-photo"
            className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 min-h-[40px] text-xs uppercase tracking-wider rounded-full transition-all duration-300 font-medium flex-1 sm:flex-initial ${
              activeMode === 'photo'
                ? 'bg-forest text-cream font-semibold shadow-warm'
                : 'text-charcoal-muted hover:text-forest hover:bg-cream/60'
            }`}
          >
            <Image className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">High-Res Photography</span>
            <span className="inline sm:hidden">Photos</span>
          </button>

          <button
            onClick={() => setActiveMode('panorama')}
            data-testid="mode-panorama"
            className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 min-h-[40px] text-xs uppercase tracking-wider rounded-full transition-all duration-300 font-medium flex-1 sm:flex-initial ${
              activeMode === 'panorama'
                ? 'bg-forest text-cream font-semibold shadow-warm'
                : 'text-charcoal-muted hover:text-forest hover:bg-cream/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">360° Virtual Tour</span>
            <span className="inline sm:hidden">360° Tour</span>
            {isPanoramaAvailable && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Live 360° tour available" />
            )}
          </button>

          {space.model3d && (
            <button
              onClick={() => setActiveMode('model3d')}
              data-testid="mode-model3d"
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 min-h-[40px] text-xs uppercase tracking-wider rounded-full transition-all duration-300 font-medium flex-1 sm:flex-initial ${
                activeMode === 'model3d'
                  ? 'bg-forest text-cream font-semibold shadow-warm'
                  : 'text-charcoal-muted hover:text-forest hover:bg-cream/60'
              }`}
            >
              <Box className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">3D View</span>
              <span className="inline sm:hidden">3D</span>
            </button>
          )}
        </div>

        {/* Space Meta Pill */}
        <div className="hidden sm:flex items-center gap-2 pr-3 text-xs text-charcoal-muted font-light">
          <span className="font-medium text-forest">{space.title}</span>
          {space.area && (
            <>
              <span>·</span>
              <span className="text-terracotta font-mono font-medium">{space.area} m²</span>
            </>
          )}
        </div>
      </div>

      {/* Main Exploration Stage */}
      {activeMode === 'photo' && (
        <div key={space.id} className="space-y-8 animate-mode-fade">
          {/* Main Visual Display */}
          <div className="relative aspect-[16/9] md:aspect-[21/10] overflow-hidden bg-cream rounded-3xl border border-[#E9E4DB] shadow-warm-lg group">
            <img
              src={selectedGalleryImage}
              alt={space.images.alt}
              width={1400}
              height={700}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = space.images.main
              }}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pointer-events-none">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-terracotta-light px-2.5 sm:px-3 py-0.5 sm:py-1 bg-forest-dark/85 backdrop-blur-md rounded-full border border-forest-light/30 mb-1.5 sm:mb-2 inline-block pointer-events-auto font-semibold">
                  Space Focus · {space.type.toUpperCase()}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-cream font-normal">
                  {space.title}
                </h3>
                {space.subtitle && (
                  <p className="text-xs sm:text-sm text-cream/80 font-light mt-0.5 sm:mt-1 max-w-xl line-clamp-2 sm:line-clamp-none">
                    {space.subtitle}
                  </p>
                )}
              </div>

              {/* Launch 360 Tour Button */}
              <button
                onClick={() => setActiveMode('panorama')}
                className="pointer-events-auto inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-cream hover:bg-ivory text-forest text-xs uppercase tracking-wider font-semibold rounded-full shadow-warm transition-all self-start sm:self-auto shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-forest" />
                <span>
                  {isPanoramaAvailable
                    ? 'Explore 360° Virtual Tour'
                    : '360° Tour in Preparation'}
                </span>
              </button>
            </div>
          </div>

          {/* Space Details & Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 sm:p-8 bg-cream border border-[#E9E4DB] rounded-3xl shadow-warm">
            {/* Description Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-xs uppercase tracking-wider text-terracotta font-medium">
                Architectural Narrative
              </div>
              <p className="text-sm md:text-base text-charcoal-muted font-light leading-relaxed">
                {space.description}
              </p>

              {/* Additional Photos Thumbnails if more than 1 image */}
              {space.images.gallery && space.images.gallery.length > 1 && (
                <div className="pt-4">
                  <div className="text-xs uppercase tracking-wider text-charcoal font-medium mb-3">
                    Space Perspectives
                  </div>
                  <div className="flex items-center gap-3">
                    {space.images.gallery.map((imgSrc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserSelectedImage(imgSrc)}
                        aria-label={`View perspective ${idx + 1}`}
                        className={`relative aspect-[4/3] w-24 overflow-hidden rounded-xl border transition-all ${
                          selectedGalleryImage === imgSrc
                            ? 'border-forest scale-105 shadow-warm ring-2 ring-forest/20'
                            : 'border-[#E9E4DB] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`${space.title} perspective ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Key Features Column */}
            <div className="space-y-4 lg:border-l lg:border-[#E9E4DB] lg:pl-8">
              <div className="text-xs uppercase tracking-wider text-terracotta font-medium flex items-center justify-between">
                <span>Key Specifications</span>
                {space.area && (
                  <span className="font-mono text-forest font-semibold text-xs">{space.area} m²</span>
                )}
              </div>
              <ul className="space-y-3">
                {space.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-charcoal-muted font-light leading-relaxed">
                    <span className="p-1 rounded-full bg-forest/10 text-forest shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 360° Equirectangular Panorama Mode */}
      {activeMode === 'panorama' && (
        <div className="animate-mode-fade">
          <PanoramaViewer
            key={roomNumber}
            config={space.panorama}
            spaceTitle={space.title}
            roomNumber={roomNumber}
            previousSpaceTitle={previousSpaceTitle}
            onReturnPreviousSpace={onReturnPreviousSpace}
            onNavigateSpace={onNavigateSpace}
            onReturnToPhoto={() => setActiveMode('photo')}
          />
        </div>
      )}

      {/* 3D Model Mode */}
      {activeMode === 'model3d' && (
        <div className="animate-mode-fade">
          <Model3DViewer
            config={space.model3d}
            spaceTitle={space.title}
            roomNumber={roomNumber}
            onReturnToPhoto={() => setActiveMode('photo')}
            onExplore360={() => setActiveMode('panorama')}
          />
        </div>
      )}
    </div>
  )
}
