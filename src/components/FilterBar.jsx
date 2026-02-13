const STATUS_FILTERS = [
  { key: 'sung', label: '歌った' },
  { key: 'unsung', label: '未歌唱' },
]

const TYPE_FILTERS = [
  { key: 'OP', label: 'OPのみ' },
  { key: 'ED', label: 'EDのみ' },
]

const VIEW_MODES = [
  { key: 'list', label: '一覧' },
  { key: 'grouped', label: '戦隊別' },
]

function Segment({ title, items, value, onChange, canToggleOff = false }) {
  return (
    <div className="segment">
      <span>{title}</span>
      <div>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={value === item.key ? 'active' : ''}
            onClick={() => onChange(value === item.key && canToggleOff ? 'all' : item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterBar({ filter, setFilter, typeFilter, setTypeFilter, viewMode, setViewMode }) {
  return (
    <section className="panel filter-grid">
      <p className="search-label">フィルタ</p>
      <Segment
        title="状態"
        items={STATUS_FILTERS}
        value={filter}
        onChange={setFilter}
        canToggleOff
      />
      <Segment
        title="種類"
        items={TYPE_FILTERS}
        value={typeFilter}
        onChange={setTypeFilter}
        canToggleOff
      />
      <Segment title="表示モード" items={VIEW_MODES} value={viewMode} onChange={setViewMode} />
    </section>
  )
}
