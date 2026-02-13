import { useEffect, useRef, useState } from 'react'
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

export function SongList({ songs, viewMode, onToggle }) {
  if (songs.length === 0) {
    return (
      <section className="panel">
        <p className="empty">該当する曲がありません。</p>
      </section>
    )
  }

  if (viewMode === 'list') {
    return <VirtualSongList songs={songs} onToggle={onToggle} />
  }

  const groups = groupSongs(songs)

  return (
    <section className="group-list">
      {groups.map((group) => (
        <article key={`${group.seriesNumber}:${group.seriesName}`} className="panel">
          <h3>
            #{group.seriesNumber} {group.seriesName}
            {group.year ? ` (${group.year})` : ''}
          </h3>
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

const ITEM_HEIGHT = 74
const OVERSCAN = 8

function VirtualSongList({ songs, onToggle }) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(560)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const updateHeight = () => {
      setViewportHeight(container.clientHeight || 560)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
  const visibleCount = Math.ceil(viewportHeight / ITEM_HEIGHT) + OVERSCAN * 2
  const endIndex = Math.min(songs.length, startIndex + visibleCount)
  const visibleSongs = songs.slice(startIndex, endIndex)
  const paddingTop = startIndex * ITEM_HEIGHT
  const paddingBottom = Math.max(0, (songs.length - endIndex) * ITEM_HEIGHT)

  return (
    <section className="panel">
      <div
        ref={containerRef}
        className="virtual-scroll"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <ul className="virtual-list" style={{ paddingTop, paddingBottom }}>
          {visibleSongs.map((song) => (
            <SongItem key={song.id} song={song} onToggle={onToggle} />
          ))}
        </ul>
      </div>
    </section>
  )
}
