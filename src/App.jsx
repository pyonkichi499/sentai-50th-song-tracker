import { useMemo, useState } from 'react'
import { FilterBar } from './components/FilterBar'
import { Header } from './components/Header'
import { ProgressBar } from './components/ProgressBar'
import { SearchBox } from './components/SearchBox'
import { SongList } from './components/SongList'
import { StatsPanel } from './components/StatsPanel'
import { eraLabel } from './constants/eraBuckets'
import {
  FILTER_ALL,
  SORT_SERIES,
  sortModeLabel,
  statusFilterLabel,
  typeFilterLabel,
} from './constants/filters'
import { useSongStore } from './hooks/useSongStore'
import { countSung, filterAndSortSongs, uniqueSeriesCount } from './lib/songFilters'
import { getSongRepository } from './repositories/songRepositoryFactory'

function App() {
  const repository = useMemo(() => getSongRepository(), [])
  const { songs, toggleSong, status, errorMessage } = useSongStore(repository)
  const [filter, setFilter] = useState(FILTER_ALL)
  const [typeFilter, setTypeFilter] = useState(FILTER_ALL)
  const [eraFilters, setEraFilters] = useState([])
  const [searchText, setSearchText] = useState('')
  const [sortMode, setSortMode] = useState(SORT_SERIES)

  const filteredSongs = useMemo(() => {
    return filterAndSortSongs({ songs, filter, typeFilter, eraFilters, searchText, sortMode })
  }, [eraFilters, filter, searchText, songs, sortMode, typeFilter])

  const total = songs.length
  const sung = countSung(songs)
  const filteredSung = countSung(filteredSongs)
  const opSongs = songs.filter((song) => song.songType === 'OP')
  const edSongs = songs.filter((song) => song.songType === 'ED')
  const filterLabel = statusFilterLabel(filter)
  const typeFilterText = typeFilterLabel(typeFilter)
  const eraFilterLabel = eraFilters.length === 0 ? 'なし' : eraFilters.map(eraLabel).join(' / ')
  const sortModeText = sortModeLabel(sortMode)

  return (
    <main className="app-shell">
      <Header />
      {status === 'connecting' && (
        <section className="panel status-panel">
          <p>Firestoreに接続中です...</p>
        </section>
      )}
      {errorMessage && (
        <section className="panel error-panel">
          <p className="error-title">データ接続エラー</p>
          <p className="error-message">{errorMessage}</p>
          <p className="error-help">
            App Check / Firestore Rules / プロジェクトIDの設定を確認してください。
          </p>
        </section>
      )}
      <ProgressBar total={total} sung={sung} />
      <FilterBar
        filter={filter}
        setFilter={setFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        eraFilters={eraFilters}
        setEraFilters={setEraFilters}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />
      <section className="panel">
        <p className="search-label">
          表示中（歌唱/曲数）: {filteredSung}/{filteredSongs.length}（状態フィルタ: {filterLabel} /
          種類フィルタ: {typeFilterText} / 時代区分: {eraFilterLabel} / 並び順: {sortModeText}）
        </p>
      </section>
      <StatsPanel
        total={total}
        sung={sung}
        opTotal={opSongs.length}
        opSung={countSung(opSongs)}
        edTotal={edSongs.length}
        edSung={countSung(edSongs)}
        seriesCount={uniqueSeriesCount(songs)}
      />
      <SearchBox searchText={searchText} setSearchText={setSearchText} />
      <SongList songs={filteredSongs} onToggle={toggleSong} />
    </main>
  )
}

export default App
