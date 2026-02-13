import { ERA_BUCKETS } from '../constants/eraBuckets'
import { FILTER_ALL, SORT_MODES, STATUS_FILTERS, TYPE_FILTERS } from '../constants/filters'

function ToggleGroup({
  title,
  items,
  value,
  values,
  onChange,
  mode = 'single',
  allowToggleOff = true,
  className = '',
}) {
  const selected = mode === 'multi' ? new Set(values) : null

  const isActive = (key) => (mode === 'multi' ? selected.has(key) : value === key)
  const handleClick = (key) => {
    if (mode === 'multi') {
      if (selected.has(key)) {
        onChange(values.filter((current) => current !== key))
        return
      }
      onChange([...values, key])
      return
    }

    onChange(value === key && allowToggleOff ? FILTER_ALL : key)
  }

  return (
    <div className={`segment ${className}`.trim()}>
      {title ? <span>{title}</span> : null}
      <div>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className={isActive(item.key) ? 'active' : ''}
            aria-pressed={isActive(item.key)}
            onClick={() => handleClick(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterBar({
  filter,
  setFilter,
  typeFilter,
  setTypeFilter,
  eraFilters,
  setEraFilters,
  sortMode,
  setSortMode,
}) {
  return (
    <section className="panel filter-grid">
      <p className="search-label">フィルタ</p>
      <div className="filter-main">
        <ToggleGroup
          title="状態"
          items={STATUS_FILTERS}
          value={filter}
          onChange={setFilter}
          allowToggleOff
        />
        <ToggleGroup
          title="種類"
          items={TYPE_FILTERS}
          value={typeFilter}
          onChange={setTypeFilter}
          allowToggleOff
        />
        <ToggleGroup
          title="時代区分（複数選択可）"
          items={ERA_BUCKETS}
          values={eraFilters}
          onChange={setEraFilters}
          mode="multi"
          className="segment-wide"
        />
      </div>
      <div className="sort-controls">
        <p className="search-label">並び順</p>
        <ToggleGroup
          title=""
          items={SORT_MODES}
          value={sortMode}
          onChange={setSortMode}
          allowToggleOff={false}
        />
      </div>
    </section>
  )
}
