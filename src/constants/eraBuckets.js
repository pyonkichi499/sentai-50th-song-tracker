export const ERA_BUCKETS = [
  { key: 'showa', label: '昭和' },
  { key: 'heisei_20c', label: '20世紀平成' },
  { key: 'heisei_21c', label: '21世紀平成' },
  { key: 'reiwa', label: '令和' },
  { key: 'extra', label: '番外' },
]

const ERA_LABEL_BY_KEY = Object.fromEntries(ERA_BUCKETS.map((item) => [item.key, item.label]))

export function eraLabel(bucket) {
  return ERA_LABEL_BY_KEY[bucket] || '未分類'
}

export function eraOrder(bucket) {
  const index = ERA_BUCKETS.findIndex((item) => item.key === bucket)
  return index === -1 ? 99 : index
}
