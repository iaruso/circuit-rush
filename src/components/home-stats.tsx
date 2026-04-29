'use client'

import { useEffect, useState } from 'react'
import { RACE_LAPS, emptyRaceStats, formatLapTime, loadRaceStats, type StoredRaceStats } from '@/lib/race/stats'

export default function HomeStats() {
  const [stats, setStats] = useState<StoredRaceStats>(emptyRaceStats)

  useEffect(() => {
    setStats(loadRaceStats())
  }, [])

  return (
    <section className="mt-8 w-full max-w-xl rounded border border-black/10 bg-white p-5 text-black">
      <h2 className="text-2xl font-bold">Local Stats</h2>
      <div className="mt-4 grid gap-3">
        {Array.from({ length: RACE_LAPS }, (_, index) => (
          <div key={index} className="flex items-center justify-between border-b border-black/10 pb-2">
            <span>Lap {index + 1}</span>
            <strong>{formatLapTime(stats.lapTimesMs[index] ?? null)}</strong>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <div className="flex items-center justify-between">
          <span>Best Lap Record</span>
          <strong>{formatLapTime(stats.bestLapMs)}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Top Speed</span>
          <strong>{stats.topSpeedKmh} km/h</strong>
        </div>
      </div>
    </section>
  )
}
