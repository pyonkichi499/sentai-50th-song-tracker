function toSeriesNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function classifySeries(seriesNumberInput) {
  const seriesNumber = toSeriesNumber(seriesNumberInput)
  if (!seriesNumber) {
    return {
      seriesId: null,
      seriesType: 'unknown',
      eraBucket: 'unknown',
    }
  }

  const seriesId = `series_${seriesNumber}`

  if (seriesNumber >= 1 && seriesNumber <= 12) {
    return { seriesId, seriesType: 'main', eraBucket: 'showa' }
  }
  if (seriesNumber >= 13 && seriesNumber <= 24) {
    return { seriesId, seriesType: 'main', eraBucket: 'heisei_20c' }
  }
  if (seriesNumber >= 25 && seriesNumber <= 42) {
    return { seriesId, seriesType: 'main', eraBucket: 'heisei_21c' }
  }
  if (seriesNumber >= 43 && seriesNumber <= 49) {
    return { seriesId, seriesType: 'main', eraBucket: 'reiwa' }
  }
  if (seriesNumber >= 50 && seriesNumber <= 55) {
    return { seriesId, seriesType: 'extra', eraBucket: 'extra' }
  }

  return { seriesId, seriesType: 'unknown', eraBucket: 'unknown' }
}
