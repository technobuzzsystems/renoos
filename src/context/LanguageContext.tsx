import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  type Language,
  type AudioKey,
  type AudioItem,
  type RoomAudioItem,
  type LanguageOption,
  SUPPORTED_LANGUAGES,
  getAudioItem,
  getAudioText,
  getRoomAudioItem,
  hasRoomAudio as manifestHasRoomAudio,
} from '@/data/audioManifest'
import { audioManager, type AudioPlayerState } from '@/services/audioManager'

const LANGUAGE_STORAGE_KEY = 'renoos_language'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  languages: LanguageOption[]
  activeLanguageOption: LanguageOption

  // Audio Playback State
  isPlaying: boolean
  currentKey: AudioKey | null
  currentText: string | null
  currentSrc: string | null
  isMuted: boolean
  hasError: boolean

  // General Playback Actions
  playAudio: (key: AudioKey, forceRestart?: boolean) => Promise<boolean>
  playRoomAudio: (roomNumber: string, forceRestart?: boolean) => Promise<boolean>
  pauseAudio: () => void
  resumeAudio: () => Promise<boolean>
  togglePlayPause: () => void
  replayAudio: () => Promise<boolean>
  stopAudio: () => void
  toggleMute: () => void

  // Helpers & Metadata
  getText: (key: AudioKey) => string
  getItem: (key: AudioKey) => AudioItem
  hasRoomAudio: (roomNumber: string) => boolean
  getRoomAudio: (roomNumber: string) => RoomAudioItem | null
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored === 'en' || stored === 'mr' || stored === 'hi') {
        return stored
      }
    } catch {
      // ignore
    }
    return 'en' // Default to English for first-time visitors
  })

  const [playerState, setPlayerState] = useState<AudioPlayerState>(() =>
    audioManager.getState()
  )

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setPlayerState(state)
    })
    return () => unsubscribe()
  }, [])

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang)
    } catch {
      // ignore
    }

    // If audio is currently playing, immediately switch to the new language for the exact active recording
    const currentState = audioManager.getState()
    if (currentState.isPlaying && currentState.currentKey) {
      if (currentState.currentKey.startsWith('room_')) {
        const roomNum = currentState.currentKey.replace('room_', '')
        const newRoomItem = getRoomAudioItem(newLang, roomNum)
        if (newRoomItem) {
          audioManager.play(newRoomItem, { forceRestart: true })
        }
      } else {
        const newItem = getAudioItem(newLang, currentState.currentKey as AudioKey)
        audioManager.play(newItem, { forceRestart: true })
      }
    }
  }, [])

  const playAudio = useCallback(
    async (key: AudioKey, forceRestart = false): Promise<boolean> => {
      const item = getAudioItem(language, key)
      return audioManager.play(item, { forceRestart })
    },
    [language]
  )

  const playRoomAudio = useCallback(
    async (roomNumber: string, forceRestart = true): Promise<boolean> => {
      return audioManager.playRoomAnnouncement(language, roomNumber, { forceRestart })
    },
    [language]
  )

  const pauseAudio = useCallback(() => {
    audioManager.pause()
  }, [])

  const resumeAudio = useCallback(async (): Promise<boolean> => {
    return audioManager.resume()
  }, [])

  const togglePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      audioManager.pause()
    } else if (playerState.currentKey) {
      if (playerState.currentKey.startsWith('room_')) {
        const roomNum = playerState.currentKey.replace('room_', '')
        const item = getRoomAudioItem(language, roomNum)
        if (item) {
          audioManager.play(item, { forceRestart: false })
        }
      } else {
        const item = getAudioItem(language, playerState.currentKey as AudioKey)
        audioManager.play(item, { forceRestart: false })
      }
    } else {
      // Default to welcome if nothing has played yet
      const item = getAudioItem(language, 'welcome')
      audioManager.play(item, { forceRestart: true })
    }
  }, [playerState.isPlaying, playerState.currentKey, language])

  const replayAudio = useCallback(async (): Promise<boolean> => {
    if (playerState.currentKey) {
      if (playerState.currentKey.startsWith('room_')) {
        const roomNum = playerState.currentKey.replace('room_', '')
        const item = getRoomAudioItem(language, roomNum)
        if (item) {
          return audioManager.play(item, { forceRestart: true })
        }
      } else {
        const item = getAudioItem(language, playerState.currentKey as AudioKey)
        return audioManager.play(item, { forceRestart: true })
      }
    }
    const item = getAudioItem(language, 'welcome')
    return audioManager.play(item, { forceRestart: true })
  }, [playerState.currentKey, language])

  const stopAudio = useCallback(() => {
    audioManager.stop()
  }, [])

  const toggleMute = useCallback(() => {
    audioManager.setMuted(!playerState.isMuted)
  }, [playerState.isMuted])

  const getText = useCallback(
    (key: AudioKey): string => {
      return getAudioText(language, key)
    },
    [language]
  )

  const getItem = useCallback(
    (key: AudioKey): AudioItem => {
      return getAudioItem(language, key)
    },
    [language]
  )

  const hasRoomAudio = useCallback(
    (roomNumber: string): boolean => {
      return manifestHasRoomAudio(language, roomNumber)
    },
    [language]
  )

  const getRoomAudio = useCallback(
    (roomNumber: string): RoomAudioItem | null => {
      return getRoomAudioItem(language, roomNumber)
    },
    [language]
  )

  const activeLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0]

  const value: LanguageContextType = {
    language,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    activeLanguageOption,
    isPlaying: playerState.isPlaying,
    currentKey: playerState.currentKey,
    currentText: playerState.currentText,
    currentSrc: playerState.currentSrc,
    isMuted: playerState.isMuted,
    hasError: playerState.hasError,
    playAudio,
    playRoomAudio,
    pauseAudio,
    resumeAudio,
    togglePlayPause,
    replayAudio,
    stopAudio,
    toggleMute,
    getText,
    getItem,
    hasRoomAudio,
    getRoomAudio,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
