import { eraLabel, eraOrder } from '../constants/eraBuckets'
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

function groupSongsByEra(songs) {
  const grouped = new Map()
  songs.forEach((song) => {
    const bucket = song.eraBucket || 'unknown'
    const current = grouped.get(bucket) || []
    current.push(song)
    grouped.set(bucket, current)
  })

  return Array.from(grouped.entries())
    .sort((a, b) => eraOrder(a[0]) - eraOrder(b[0]))
    .map(([bucket, items]) => ({ bucket, label: eraLabel(bucket), songs: items }))
}

function GroupedBySeriesByEra({ eraGroups, onToggle }) {
  return (
    <section className="group-list">
      {eraGroups.map((eraGroup) => (
        <article key={eraGroup.bucket} className="panel era-panel">
          <h2 className="era-title">
            {eraGroup.label}
            <span>{eraGroup.songs.length}曲</span>
          </h2>
          <div className="era-series-list">
            {groupSongs(eraGroup.songs).map((group) => (
              <section key={`${eraGroup.bucket}:${group.seriesNumber}:${group.seriesName}`} className="era-series-block">
                <h3>
                  #{group.seriesNumber} {group.seriesName}
                  {group.year ? ` (${group.year})` : ''}
                </h3>
                <ul>
                  {group.songs.map((song) => (
                    <SongItem key={song.id} song={song} onToggle={onToggle} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

export function SongList({ songs, onToggle }) {
  if (songs.length === 0) {
    return (
      <section className="panel">
        <p className="empty">該当する曲がありません。</p>
      </section>
    )
  }

  const eraGroups = groupSongsByEra(songs)
  return <GroupedBySeriesByEra eraGroups={eraGroups} onToggle={onToggle} />
}
