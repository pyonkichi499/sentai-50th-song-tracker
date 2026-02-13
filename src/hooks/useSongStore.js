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

  return { songs, toggleSong, status, errorMessage }
}
