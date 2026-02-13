function mergeWithDefaults(defaultSongs, persistedSongs) {
  const byId = new Map(persistedSongs.map((song) => [song.id, song]))
  return defaultSongs.map((song) => {
    const persisted = byId.get(song.id)
    return persisted ? { ...song, ...persisted } : song
  })
}

function toPersistedArray(value) {
  return Array.isArray(value) ? value : null
}

function buildNextSong(song, { sung, actor, now }) {
  return {
    ...song,
    sung,
    sungAt: sung ? now() : null,
    sungBy: sung ? [actor] : [],
  }
}

export function createSongRepository(options) {
  const {
    defaultSongs,
    loadPersistedSongs,
    savePersistedSongs,
    subscribeExternal,
    publishExternal,
    clientId,
    actor = 'local-user',
    now = () => new Date().toISOString(),
  } = options

  const listeners = new Set()
  const persisted = toPersistedArray(loadPersistedSongs())
  let songs = persisted ? mergeWithDefaults(defaultSongs, persisted) : defaultSongs

  const emit = () => {
    listeners.forEach((listener) => listener(songs))
  }

  const unsubscribeExternal = subscribeExternal((message) => {
    if (!message || message.source === clientId || !Array.isArray(message.songs)) {
      return
    }

    songs = mergeWithDefaults(defaultSongs, message.songs)
    emit()
  })

  return {
    subscribe(listener) {
      listeners.add(listener)
      listener(songs)
      return () => listeners.delete(listener)
    },

    toggleSong(songId) {
      songs = songs.map((song) => {
        if (song.id !== songId) {
          return song
        }

        return buildNextSong(song, { sung: !song.sung, actor, now })
      })

      savePersistedSongs(songs)
      publishExternal({ source: clientId, songs })
      emit()
    },

    dispose() {
      unsubscribeExternal()
      listeners.clear()
    },
  }
}

export { mergeWithDefaults }
