export const RACE_LAPS = 3
export const RACE_STORAGE_KEY = 'circuit-rush:race-stats'

export type StoredRaceStats = {
  lapTimesMs: Array<number | null>
  bestLapMs: number | null
  topSpeedKmh: number
  lastFinishedAt: string | null
}

export const emptyRaceStats: StoredRaceStats = {
  lapTimesMs: Array.from({ length: RACE_LAPS }, () => null),
  bestLapMs: null,
  topSpeedKmh: 0,
  lastFinishedAt: null,
}

const normalizeLapTimes = (lapTimesMs: Array<number | null> = []) =>
  Array.from({ length: RACE_LAPS }, (_, index) => {
    const lapTime = lapTimesMs[index]
    return typeof lapTime === 'number' && Number.isFinite(lapTime) ? lapTime : null
  })

export function normalizeRaceStats(stats: Partial<StoredRaceStats> | null | undefined): StoredRaceStats {
  if (!stats) return emptyRaceStats

  const bestLapMs =
    typeof stats.bestLapMs === 'number' && Number.isFinite(stats.bestLapMs) ? stats.bestLapMs : null
  const topSpeedKmh =
    typeof stats.topSpeedKmh === 'number' && Number.isFinite(stats.topSpeedKmh)
      ? Math.max(0, Math.round(stats.topSpeedKmh))
      : 0

  return {
    lapTimesMs: normalizeLapTimes(stats.lapTimesMs),
    bestLapMs,
    topSpeedKmh,
    lastFinishedAt: typeof stats.lastFinishedAt === 'string' ? stats.lastFinishedAt : null,
  }
}

export function loadRaceStats(): StoredRaceStats {
  if (typeof window === 'undefined') return emptyRaceStats

  try {
    const rawStats = window.localStorage.getItem(RACE_STORAGE_KEY)
    if (!rawStats) return emptyRaceStats
    return normalizeRaceStats(JSON.parse(rawStats) as Partial<StoredRaceStats>)
  } catch {
    return emptyRaceStats
  }
}

export function saveRaceStats(stats: StoredRaceStats) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RACE_STORAGE_KEY, JSON.stringify(normalizeRaceStats(stats)))
}

export function recordRaceResult(lapTimesMs: number[], topSpeedKmh: number) {
  const previousStats = loadRaceStats()
  const normalizedLapTimes = normalizeLapTimes(lapTimesMs)
  const finishedLapTimes = normalizedLapTimes.filter((lapTime): lapTime is number => lapTime !== null)
  const raceBestLap = finishedLapTimes.length > 0 ? Math.min(...finishedLapTimes) : null
  const bestLapMs =
    previousStats.bestLapMs === null
      ? raceBestLap
      : raceBestLap === null
        ? previousStats.bestLapMs
        : Math.min(previousStats.bestLapMs, raceBestLap)

  const stats = normalizeRaceStats({
    lapTimesMs: normalizedLapTimes,
    bestLapMs,
    topSpeedKmh: Math.max(previousStats.topSpeedKmh, topSpeedKmh),
    lastFinishedAt: new Date().toISOString(),
  })

  saveRaceStats(stats)
  return stats
}

export function formatLapTime(timeMs: number | null) {
  if (timeMs === null) return '--:--.---'

  const minutes = Math.floor(timeMs / 60000)
  const seconds = Math.floor((timeMs % 60000) / 1000)
  const milliseconds = Math.floor(timeMs % 1000)

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
}
