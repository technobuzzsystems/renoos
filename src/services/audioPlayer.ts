/**
 * Audio Player re-export bridging to the master AudioManager service.
 * Retains backwards compatibility for any existing imports in the application.
 */

export {
  audioManager,
  audioManager as receptionistAudioPlayer,
  AudioManager,
  type AudioPlayerState,
  type AudioListener,
} from './audioManager'
