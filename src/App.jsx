import { useMemo, useState } from 'react'
import { FilterBar } from './components/FilterBar'
import { Header } from './components/Header'
import { ProgressBar } from './components/ProgressBar'
import { SearchBox } from './components/SearchBox'
import { SongList } from './components/SongList'
import { StatsPanel } from './components/StatsPanel'
import { useSongStore } from './hooks/useSongStore'
import { countSung, filterAndSortSongs, uniqueSeriesCount } from './lib/songFilters'
import { getSongRepository } from './repositories/songRepositoryFactory'

function App() {
  const repository = useMemo(() => getSongRepository(), [])
  const { songs, toggleSong, setSongsSung, status, errorMessage } = useSongStore(repository)
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [viewMode, setViewMode] = useState('grouped')
  const [sortMode, setSortMode] = useState('series')

  const filteredSongs = useMemo(() => {
    return filterAndSortSongs({ songs, filter, typeFilter, searchText, sortMode })
  }, [filter, searchText, songs, sortMode, typeFilter])

  const total = songs.length
  const sung = countSung(songs)
  const opSongs = songs.filter((song) => song.songType === 'OP')
  const edSongs = songs.filter((song) => song.songType === 'ED')
  const filterLabel = filter === 'all' ? 'なし' : filter === 'sung' ? '歌った' : '未歌唱'
  const typeFilterLabel = typeFilter === 'all' ? 'なし' : typeFilter
  const sortModeLabel = sortMode === 'updated' ? '更新順' : '戦隊順'

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
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />
      <section className="panel">
        <p className="search-label">
          表示件数: {filteredSongs.length} / {total}（状態フィルタ: {filterLabel} / 種類フィルタ:{' '}
          {typeFilterLabel} / 並び順: {sortModeLabel}）
        </p>
      </section>
      <SearchBox searchText={searchText} setSearchText={setSearchText} />
      <StatsPanel
        total={total}
        sung={sung}
        opTotal={opSongs.length}
        opSung={countSung(opSongs)}
        edTotal={edSongs.length}
        edSung={countSung(edSongs)}
        seriesCount={uniqueSeriesCount(songs)}
      />
      <SongList
        songs={filteredSongs}
        viewMode={viewMode}
        onToggle={toggleSong}
        onSetGroupSung={setSongsSung}
      />
    </main>
  )
}

export default App
