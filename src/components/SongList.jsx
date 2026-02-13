import { SongItem } from './SongItem'

function groupSongs(songs) {
  const grouped = new Map()

  songs.forEach((song) => {
    const key = `${song.seriesNumber}:${song.seriesName}`
    const current = grouped.get(key)
    if (current) {
      current.songs.push(song)
      return
    }

    grouped.set(key, {
      seriesNumber: song.seriesNumber,
      seriesName: song.seriesName,
      year: song.year,
      songs: [song],
    })
  })

  return Array.from(grouped.values())
}

export function SongList({ songs, viewMode, onToggle, onSetGroupSung }) {
  if (songs.length === 0) {
    return (
      <section className="panel">
        <p className="empty">該当する曲がありません。</p>
      </section>
    )
  }

  if (viewMode === 'grouped') {
    const groups = groupSongs(songs)

    return (
      <section className="group-list">
        {groups.map((group) => (
          <article key={`${group.seriesNumber}:${group.seriesName}`} className="panel">
            <div className="group-head">
              <h3>
                #{group.seriesNumber} {group.seriesName}
                {group.year ? ` (${group.year})` : ''}
              </h3>
              <div className="group-actions">
                <button
                  type="button"
                  onClick={() =>
                    onSetGroupSung(
                      group.songs.map((song) => song.id),
                      true,
                    )
                  }
                >
                  全曲歌唱
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSetGroupSung(
                      group.songs.map((song) => song.id),
                      false,
                    )
                  }
                >
                  未歌唱に戻す
                </button>
              </div>
            </div>
            <ul>
              {group.songs.map((song) => (
                <SongItem key={song.id} song={song} onToggle={onToggle} />
              ))}
            </ul>
          </article>
        ))}
      </section>
    )
  }

  return (
    <section className="panel">
      <ul>
        {songs.map((song) => (
          <SongItem key={song.id} song={song} onToggle={onToggle} />
        ))}
      </ul>
    </section>
  )
}
