import Fuse from 'fuse.js'
import {
  FILTER_ALL,
  SORT_SERIES,
  SORT_UPDATED_ASC,
  SORT_UPDATED_DESC,
} from '../constants/filters.js'

function normalizeText(value) {
  return toHiragana(String(value ?? '').normalize('NFKC')).toLowerCase().trim()
}

function toHiragana(text) {
  return text.replace(/[\u30a1-\u30f6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60),
  )
}

function normalizeLooseText(value) {
  return normalizeText(value).replace(
    /[\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~。、，．・！？【】「」『』（）ー〜～]/g,
    '',
  )
}

function sortBySeries(a, b) {
  if (a.seriesNumber !== b.seriesNumber) {
    return a.seriesNumber - b.seriesNumber
  }

  if (a.songType !== b.songType) {
    const songTypeOrder = { OP: 0, ED: 1 }
    const aOrder = songTypeOrder[a.songType] ?? 99
    const bOrder = songTypeOrder[b.songType] ?? 99
    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }
  }

  if (a.songNumber !== b.songNumber) {
    return a.songNumber - b.songNumber
  }

  return a.songTitle.localeCompare(b.songTitle, 'ja')
}

function parsedSungAt(song) {
  const time = Date.parse(song.sungAt || '')
  return Number.isNaN(time) ? null : time
}

function compareByUpdateTime(a, b, direction) {
  const aTime = parsedSungAt(a)
  const bTime = parsedSungAt(b)
  const aHasUpdate = aTime !== null
  const bHasUpdate = bTime !== null

  // Always place unsung/unupdated songs after songs with sungAt.
  if (aHasUpdate !== bHasUpdate) {
    return aHasUpdate ? -1 : 1
  }

  if (aTime !== bTime) {
    return direction === 'asc' ? aTime - bTime : bTime - aTime
  }

  return sortBySeries(a, b)
}

function sortByRecentUpdateDesc(a, b) {
  return compareByUpdateTime(a, b, 'desc')
}

function sortByRecentUpdateAsc(a, b) {
  return compareByUpdateTime(a, b, 'asc')
}

function fuzzySearchSongs(songs, query) {
  const fuse = new Fuse(songs, {
    includeScore: true,
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'songTitle', weight: 0.45 },
      { name: 'songTitleReading', weight: 0.35 },
      { name: 'seriesName', weight: 0.3 },
      { name: 'seriesNameReading', weight: 0.2 },
      { name: 'artist', weight: 0.2 },
      { name: 'artistReading', weight: 0.1 },
      { name: 'variant', weight: 0.05 },
      { name: '_searchLoose', weight: 0.35 },
    ],
    getFn: (song, path) => {
      if (path === '_searchLoose') {
        return [
          song.seriesName,
          song.seriesNameReading,
          song.songTitle,
          song.songTitleReading,
          song.songType,
          song.artist,
          song.artistReading,
          song.variant,
          song.year,
        ]
          .map(normalizeText)
          .map(normalizeLooseText)
          .join(' ')
      }
      return normalizeText(song[path])
    },
  })

  return fuse
    .search(query)
    .filter((entry) => (entry.score ?? 1) <= 0.3)
    .map((entry) => entry.item)
}

function matchesQuery(song, query) {
  const searchable = [
    song.seriesName,
    song.seriesNameReading,
    song.songTitle,
    song.songTitleReading,
    song.songType,
    song.artist,
    song.artistReading,
    song.variant,
    song.year,
  ]
    .map(normalizeText)
    .join(' ')
  return searchable.includes(query)
}

export function filterAndSortSongs({
  songs,
  filter,
  typeFilter,
  eraFilters = [],
  searchText,
  sortMode = SORT_SERIES,
}) {
  const query = normalizeText(searchText)
  const looseQuery = normalizeLooseText(searchText)

  const filtered = songs
    .filter((song) => {
      if (filter === 'sung') {
        return song.sung
      }
      if (filter === 'unsung') {
        return !song.sung
      }
      return true
    })
    .filter((song) => (typeFilter === FILTER_ALL ? true : song.songType === typeFilter))
    .filter((song) => {
      if (!Array.isArray(eraFilters) || eraFilters.length === 0) {
        return true
      }
      return eraFilters.includes(song.eraBucket)
    })

  let searched = filtered
  if (query.length > 0) {
    const strictMatches = filtered.filter((song) => matchesQuery(song, query))
    searched = strictMatches.length > 0 ? strictMatches : fuzzySearchSongs(filtered, looseQuery || query)
  }

  if (sortMode === SORT_UPDATED_DESC) {
    return searched.toSorted(sortByRecentUpdateDesc)
  }
  if (sortMode === SORT_UPDATED_ASC) {
    return searched.toSorted(sortByRecentUpdateAsc)
  }
  return searched.toSorted(sortBySeries)
}

export function countSung(songs) {
  return songs.filter((song) => song.sung).length
}

export function uniqueSeriesCount(songs) {
  return new Set(songs.map((song) => `${song.seriesNumber}:${song.seriesName}`)).size
}
