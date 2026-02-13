import { sampleSongs } from '../constants/sampleSongs'
import { createSongRepository } from './createSongRepository'

const STORAGE_KEY = 'sentai-song-tracker:v1'

function createClientId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadPersistedSongs() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function createLocalSongRepository() {
  const canBroadcast = typeof BroadcastChannel !== 'undefined'
  const channel = canBroadcast ? new BroadcastChannel(STORAGE_KEY) : null

  const subscribeExternal = (onMessage) => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return
      }

      try {
        const songs = JSON.parse(event.newValue)
        onMessage({ source: 'storage-event', songs })
      } catch {
        // no-op
      }
    }

    const handleBroadcast = (event) => {
      onMessage(event.data)
    }

    window.addEventListener('storage', handleStorage)
    if (channel) {
      channel.addEventListener('message', handleBroadcast)
    }

    return () => {
      window.removeEventListener('storage', handleStorage)
      if (channel) {
        channel.removeEventListener('message', handleBroadcast)
      }
    }
  }

  const repository = createSongRepository({
    defaultSongs: sampleSongs,
    loadPersistedSongs,
    savePersistedSongs: (songs) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
    },
    subscribeExternal,
    publishExternal: (message) => {
      if (channel) {
        channel.postMessage(message)
      }
    },
    clientId: createClientId(),
  })

  return {
    ...repository,
    subscribeStatus(listener) {
      listener({ status: 'ready', errorMessage: null })
      return () => {}
    },
    dispose() {
      repository.dispose()
      if (channel) {
        channel.close()
      }
    },
  }
}
