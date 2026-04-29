'use client'

import Link from 'next/link'
import { RACE_LAPS, formatLapTime } from '@/lib/race/stats'

type RaceHudProps = {
  bestLapMs: number | null
  checkpointIndex: number
  currentLap: number
  currentLapElapsedMs: number
  currentSpeedKmh: number
  finished: boolean
  lapTimesMs: Array<number | null>
  status: string
  topSpeedKmh: number
  onRestart: () => void
  isPaused?: boolean
  onTogglePause?: () => void
}

export default function RaceHud({
  bestLapMs,
  checkpointIndex,
  currentLap,
  currentLapElapsedMs,
  currentSpeedKmh,
  finished,
  lapTimesMs,
  status,
  topSpeedKmh,
  onRestart,
  isPaused = false,
  onTogglePause,
}: RaceHudProps) {
  const nextGate = finished
    ? 'Race finished'
    : checkpointIndex >= 3
      ? 'Finish gate next'
      : `Checkpoint ${checkpointIndex + 1} next`

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 w-72 rounded bg-black/80 p-4 text-sm text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-bold">{finished ? 'Finished' : `Lap ${currentLap}/${RACE_LAPS}`}</div>
          <div className="text-white/70">{nextGate}</div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          {!finished && onTogglePause && (
            <button
              type="button"
              onClick={onTogglePause}
              title="Pause (P)"
              className="cursor-pointer rounded bg-white/20 px-3 py-1 font-bold text-white transition-colors hover:bg-white/30"
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            title="Restart"
            className="cursor-pointer rounded bg-white/20 px-3 py-1 font-bold text-white transition-colors hover:bg-white/30"
          >
            ↻
          </button>
          <Link className="rounded bg-white px-3 py-1 font-bold text-black" href="/">
            Menu
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {Array.from({ length: RACE_LAPS }, (_, index) => (
          <div key={index} className="flex items-center justify-between">
            <span>Lap {index + 1}</span>
            <strong>{formatLapTime(lapTimesMs[index] ?? null)}</strong>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 border-t border-white/20 pt-4">
        <div className="flex items-center justify-between">
          <span>Current Lap</span>
          <strong>{finished ? '--:--.---' : formatLapTime(currentLapElapsedMs)}</strong>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>Speed</span>
            <strong className="text-emerald-400">{currentSpeedKmh} km/h</strong>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-75 ${
                currentSpeedKmh > 180 ? 'bg-rose-500' : currentSpeedKmh > 120 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min((currentSpeedKmh / 220) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Top Speed</span>
          <strong>{topSpeedKmh} km/h</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Best Lap Record</span>
          <strong>{formatLapTime(bestLapMs)}</strong>
        </div>
      </div>

      <div className="mt-4 rounded bg-white/10 px-3 py-2 text-white/80">{status}</div>
    </div>
  )
}
