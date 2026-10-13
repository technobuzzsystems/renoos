/**
 * Centralized Audio Manager for Renoos Hotel
 * Coordinates both general receptionist interactions and room-specific announcements.
 * Guarantees zero overlapping audio, browser autoplay unlock, reactive subscriptions,
 * missing-file fallbacks, and clean scene unmount cleanup.
 */

import {
  type AudioItem,
  type AudioKey,
  type Language,
  type RoomAudioItem,
  getAudioItem,
  getRoomAudioItem,
  hasRoomAudio,
} from '@/data/audioManifest'

export interface AudioPlayerState {
  isPlaying: boolean
  currentKey: AudioKey | null
  currentLanguage: Language | null
  currentText: string | null
  currentSrc: string | null
  isMuted: boolean
  hasError: boolean
}

export type AudioListener = (state: AudioPlayerState) => void

export class AudioManager {
  private audio: HTMLAudioElement | null = null
  private listeners = new Set<AudioListener>()
  private pendingAutoplayItem: AudioItem | null = null
  private gestureListenerAttached = false
  private playedGreetings = new Set<string>()

  private state: AudioPlayerState = {
    isPlaying: false,
    currentKey: null,
    currentLanguage: null,
    currentText: null,
    currentSrc: null,
    isMuted: false,
    hasError: false,
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio()
    }
  }

  private initAudio() {
    if (this.audio) return
    this.audio = new Audio()
    this.audio.preload = 'none'

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, hasError: false })
    })

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false })
    })

    this.audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false })
    })

    this.audio.addEventListener('error', (e) => {
      console.warn('AudioManager encountered a playback error:', e, this.audio?.src)
      this.updateState({ isPlaying: false, hasError: true })
    })
  }

  private updateState(partial: Partial<AudioPlayerState>) {
    this.state = { ...this.state, ...partial }
    this.listeners.forEach((listener) => {
      try {
        listener(this.state)
      } catch (err) {
        console.error('Error in AudioManager subscriber:', err)
      }
    })
  }

  public getState(): AudioPlayerState {
    return { ...this.state }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Stop previous audio and play specified AudioItem.
   */
  public async play(
    item: AudioItem,
    options?: { forceRestart?: boolean; onEnded?: () => void }
  ): Promise<boolean> {
    this.initAudio()
    if (!this.audio) return false

    // If currently playing the exact same file and not forcing restart, toggle to pause
    if (
      this.state.isPlaying &&
      this.state.currentSrc === item.src &&
      !options?.forceRestart
    ) {
      this.pause()
      return false
    }

    // Immediately stop previous audio to eliminate any possibility of overlap
    this.stop()

    this.updateState({
      currentKey: item.key,
      currentLanguage: item.language,
      currentText: item.text,
      currentSrc: item.src,
      hasError: false,
    })

    this.audio.src = item.src
    this.audio.muted = this.state.isMuted

    try {
      await this.audio.play()
      return true
    } catch (err: any) {
      // Browser Autoplay restriction handling
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        console.log('Autoplay deferred until user gesture for:', item.key, item.language)
        this.pendingAutoplayItem = item
        this.attachAutoplayUnlock()
        return false
      }

      console.warn('AudioManager play error:', err)
      this.updateState({ isPlaying: false, hasError: true })
      return false
    }
  }

  /**
   * Play interaction audio by language and key (e.g. 'welcome', 'selectDates').
   */
  public async playInteraction(
    language: Language,
    key: AudioKey,
    options?: { forceRestart?: boolean }
  ): Promise<boolean> {
    const item = getAudioItem(language, key)
    return this.play(item, options)
  }

  /**
   * Play room announcement by language and room number (e.g. '201', '202').
   * If recording does not exist, stops current audio and returns false safely.
   */
  public async playRoomAnnouncement(
    language: Language,
    roomNumber: string,
    options?: { forceRestart?: boolean }
  ): Promise<boolean> {
    const item = getRoomAudioItem(language, roomNumber)
    if (!item) {
      console.warn(`No room announcement recording found for room ${roomNumber} in ${language}`)
      this.stop()
      return false
    }
    return this.play(item, { forceRestart: options?.forceRestart ?? true })
  }

  /**
   * Pause playback.
   */
  public pause() {
    if (this.audio) {
      this.audio.pause()
    }
    this.updateState({ isPlaying: false })
  }

  /**
   * Resume current playback if paused.
   */
  public async resume(): Promise<boolean> {
    if (!this.audio || !this.state.currentSrc) return false
    try {
      await this.audio.play()
      return true
    } catch (err) {
      console.warn('Resume error:', err)
      return false
    }
  }

  /**
   * Replay current clip from start.
   */
  public async replay(): Promise<boolean> {
    if (!this.audio || !this.state.currentSrc) return false
    try {
      this.audio.currentTime = 0
      await this.audio.play()
      return true
    } catch (err) {
      console.warn('Replay error:', err)
      return false
    }
  }

  /**
   * Stop audio completely and reset currentTime.
   */
  public stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
    this.updateState({ isPlaying: false })
  }

  /**
   * Toggle mute state.
   */
  public setMuted(muted: boolean) {
    if (this.audio) {
      this.audio.muted = muted
    }
    this.updateState({ isMuted: muted })
  }

  /**
   * Check if a greeting has already been played in this session/entry.
   */
  public hasGreetingBeenPlayed(key: string): boolean {
    return this.playedGreetings.has(key)
  }

  /**
   * Mark a greeting as played so it is not repeated on every render.
   */
  public markGreetingPlayed(key: string): void {
    this.playedGreetings.add(key)
  }

  /**
   * Reset played greetings (e.g. on fresh scene entrance).
   */
  public resetGreeting(key?: string): void {
    if (key) {
      this.playedGreetings.delete(key)
    } else {
      this.playedGreetings.clear()
    }
  }

  /**
   * Check if a room has an announcement clip.
   */
  public hasRoomAnnouncement(language: Language, roomNumber: string): boolean {
    return hasRoomAudio(language, roomNumber)
  }

  /**
   * Retrieve room audio item metadata.
   */
  public getRoomAnnouncementItem(language: Language, roomNumber: string): RoomAudioItem | null {
    return getRoomAudioItem(language, roomNumber)
  }

  /**
   * Attaches one-time gesture unlock for browsers blocking initial autoplay.
   */
  private attachAutoplayUnlock() {
    if (this.gestureListenerAttached || typeof window === 'undefined') return
    this.gestureListenerAttached = true

    const unlock = () => {
      this.gestureListenerAttached = false
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)

      if (this.pendingAutoplayItem) {
        const itemToPlay = this.pendingAutoplayItem
        this.pendingAutoplayItem = null
        this.play(itemToPlay, { forceRestart: true }).catch(() => {})
      }
    }

    window.addEventListener('click', unlock, { once: true, passive: true })
    window.addEventListener('touchstart', unlock, { once: true, passive: true })
    window.addEventListener('pointerdown', unlock, { once: true, passive: true })
    window.addEventListener('keydown', unlock, { once: true, passive: true })
  }
}

export const audioManager = new AudioManager()
