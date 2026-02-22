function formatDate(iso) {
  if (!iso) {
    return '-'
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SongItem({ song, onToggle, showSeries = false }) {
  const normalizedVariant = String(song.variant ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .toUpperCase()
  const isRedundantVariant = normalizedVariant === `${song.songType}${song.songNumber}`

  return (
    <li className={`song-item ${song.sung ? 'is-sung' : ''}`}>
      <label>
        <input type="checkbox" checked={song.sung} onChange={() => onToggle(song.id)} />
        <div className="song-meta">
          <p className="song-title">{song.songTitle}</p>
          {showSeries ? (
            <p className="song-subline">
              #{song.seriesNumber} {song.seriesName}
              {song.year ? ` (${song.year})` : ''}
            </p>
          ) : null}
          <p className="song-subline">
            {song.songType} #{song.songNumber}
            {song.artist ? ` / ${song.artist}` : ''}
            {song.variant && !isRedundantVariant ? ` / ${song.variant}` : ''}
          </p>
          <p className="song-subline">最終更新: {formatDate(song.sungAt)}</p>
        </div>
      </label>
    </li>
  )
}
