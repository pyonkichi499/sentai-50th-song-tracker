export function SearchBox({ searchText, setSearchText }) {
  return (
    <section className="panel">
      <label htmlFor="song-search" className="search-label">
        曲名・戦隊名・歌手で検索
      </label>
      <input
        id="song-search"
        type="search"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="例: ゴレンジャー / OP / サイキックラバー"
      />
    </section>
  )
}
