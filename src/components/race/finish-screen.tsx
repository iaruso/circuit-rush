'use client'

import Link from 'next/link'
import { RACE_LAPS, formatLapTime } from '@/lib/race/stats'

type FinishScreenProps = {
  lapTimesMs: Array<number | null>
  bestLapMs: number | null
  topSpeedKmh: number
  onRestart: () => void
}

export default function FinishScreen({
  lapTimesMs,
  bestLapMs,
  topSpeedKmh,
  onRestart,
}: FinishScreenProps) {
  const completedTimes = lapTimesMs.filter((t): t is number => t !== null)
  const totalMs = completedTimes.reduce((sum, t) => sum + t, 0)
  const sessionBest = completedTimes.length > 0 ? Math.min(...completedTimes) : null

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#1a1d2e] to-[#0d0f1a] p-8 shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Race Complete
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {formatLapTime(totalMs)} total
          </p>
        </div>

        {/* Lap table */}
        <div className="space-y-2">
          {Array.from({ length: RACE_LAPS }, (_, index) => {
            const time = lapTimesMs[index]
            const isBest = time !== null && time === sessionBest
            return (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${
                  isBest
                    ? 'bg-emerald-500/15 ring-1 ring-emerald-400/30'
                    : 'bg-white/5'
                }`}
              >
                <span className="text-sm text-white/70">
                  Lap {index + 1}
                  {isBest && (
                    <span className="ml-2 text-xs font-semibold text-emerald-400">
                      BEST
                    </span>
                  )}
                </span>
                <strong className={`font-mono text-sm ${isBest ? 'text-emerald-300' : 'text-white'}`}>
                  {formatLapTime(time ?? null)}
                </strong>
              </div>
            )
          })}
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/5 px-4 py-3 text-center">
            <div className="text-xs text-white/50">Best Lap Record</div>
            <div className="mt-0.5 font-mono text-sm font-bold text-white">
              {formatLapTime(bestLapMs)}
            </div>
          </div>
          <div className="rounded-lg bg-white/5 px-4 py-3 text-center">
            <div className="text-xs text-white/50">Top Speed</div>
            <div className="mt-0.5 font-mono text-sm font-bold text-white">
              {topSpeedKmh} km/h
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="flex-1 cursor-pointer rounded-lg bg-white px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-white/90"
          >
            Restart
          </button>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center rounded-lg bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
          >
            Menu
          </Link>
        </div>
      </div>
    </div>
  )
}
