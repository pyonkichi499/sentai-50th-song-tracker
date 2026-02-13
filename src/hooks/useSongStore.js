import { useEffect, useState } from 'react'

export function useSongStore(repository) {
  const [songs, setSongs] = useState([])
  const [status, setStatus] = useState('connecting')
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    const unsubscribe = repository.subscribe((nextSongs) => {
      setSongs(nextSongs)
    })

    const unsubscribeStatus =
      typeof repository.subscribeStatus === 'function'
        ? repository.subscribeStatus(({ status: nextStatus, errorMessage: nextErrorMessage }) => {
            setStatus(nextStatus)
            setErrorMessage(nextErrorMessage)
          })
        : () => {}

    return () => {
      unsubscribe()
      unsubscribeStatus()
    }
  }, [repository])

  const toggleSong = async (songId) => {
    try {
      await repository.toggleSong(songId)
    } catch (error) {
      setErrorMessage(error?.message || 'チェックの更新に失敗しました。')
      console.error('[song-store] toggle failed:', error)
    }
  }

  const setSongsSung = async (songIds, sung) => {
    try {
      if (typeof repository.setSongsSung === 'function') {
        await repository.setSongsSung(songIds, sung)
        return
      }

      const targetIds = new Set(songIds)
      const targets = songs.filter((song) => targetIds.has(song.id))
      for (const song of targets) {
        if (song.sung !== sung) {
          await repository.toggleSong(song.id)
        }
      }
    } catch (error) {
      setErrorMessage(error?.message || '一括更新に失敗しました。')
      console.error('[song-store] bulk update failed:', error)
    }
  }

  return { songs, toggleSong, setSongsSung, status, errorMessage }
}
