export const STATUS_FILTERS = [
  { key: 'sung', label: '歌った' },
  { key: 'unsung', label: '未歌唱' },
]

export const TYPE_FILTERS = [
  { key: 'OP', label: 'OPのみ' },
  { key: 'ED', label: 'EDのみ' },
]

export const SORT_MODES = [
  { key: 'series', label: '戦隊順' },
  { key: 'updated', label: '更新順' },
]

export const FILTER_ALL = 'all'
export const SORT_SERIES = 'series'
export const SORT_UPDATED = 'updated'

export function statusFilterLabel(filterKey) {
  if (filterKey === FILTER_ALL) {
    return 'なし'
  }
  if (filterKey === 'sung') {
    return '歌った'
  }
  return '未歌唱'
}

export function typeFilterLabel(filterKey) {
  return filterKey === FILTER_ALL ? 'なし' : filterKey
}

export function sortModeLabel(mode) {
  return mode === SORT_UPDATED ? '更新順' : '戦隊順'
}
