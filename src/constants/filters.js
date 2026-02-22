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
  { key: 'updatedAsc', label: '更新順（昇順）' },
  { key: 'updatedDesc', label: '更新順（降順）' },
]

export const FILTER_ALL = 'all'
export const SORT_SERIES = 'series'
export const SORT_UPDATED_DESC = 'updatedDesc'
export const SORT_UPDATED_ASC = 'updatedAsc'

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
  if (mode === SORT_UPDATED_DESC) {
    return '更新順（降順）'
  }
  if (mode === SORT_UPDATED_ASC) {
    return '更新順（昇順）'
  }
  return '戦隊順'
}
