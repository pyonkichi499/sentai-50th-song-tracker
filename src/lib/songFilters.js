function normalizeText(value) {
  return String(value ?? '').toLowerCase().trim()
}

function sortSongs(a, b) {
  if (a.seriesNumber !== b.seriesNumber) {
    return a.seriesNumber - b.seriesNumber
  }

  if (a.songType !== b.songType) {
    return a.songType.localeCompare(b.songType)
  }

  if (a.songNumber !== b.songNumber) {
    return a.songNumber - b.songNumber
  }

  return a.songTitle.localeCompare(b.songTitle, 'ja')
}

export function filterAndSortSongs({ songs, filter, typeFilter, searchText }) {
  const query = normalizeText(searchText)

  return songs
    .filter((song) => {
      if (filter === 'sung') {
        return song.sung
      }
      if (filter === 'unsung') {
        return !song.sung
      }
      return true
    })
    .filter((song) => (typeFilter === 'all' ? true : song.songType === typeFilter))
    .filter((song) => {
      if (!query) {
        return true
      }

      const searchable = [
        song.seriesName,
        song.songTitle,
        song.songType,
        song.artist,
        song.variant,
        song.year,
      ]
        .map(normalizeText)
        .join(' ')

      return searchable.includes(query)
    })
    .toSorted(sortSongs)
}

export function countSung(songs) {
  return songs.filter((song) => song.sung).length
}

export function uniqueSeriesCount(songs) {
  return new Set(songs.map((song) => `${song.seriesNumber}:${song.seriesName}`)).size
}
