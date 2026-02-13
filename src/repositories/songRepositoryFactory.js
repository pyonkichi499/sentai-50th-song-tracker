import { createLocalSongRepository } from './localSongRepository'
import { createFirestoreSongRepository } from './firestoreSongRepository'

let repository

export function getSongRepository() {
  if (!repository) {
    const source = import.meta.env.VITE_DATA_SOURCE || 'firestore'

    if (source === 'local') {
      repository = createLocalSongRepository()
    } else {
      repository = createFirestoreSongRepository()
    }
  }
  return repository
}
