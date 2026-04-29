'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  RACE_LAPS,
  emptyRaceStats,
  loadRaceStats,
  recordRaceResult,
  type StoredRaceStats,
} from '@/lib/race/stats'
import type { RaceGateId } from '@/components/race/race-gates'

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type RaceState = {
  checkpointIndex: number
  currentLap: number
  finished: boolean
  lapTimesMs: Array<number | null>
  status: string
}

export type RaceSession = {
  raceState: RaceState
  currentLapElapsedMs: number
  currentSpeedKmh: number
  topSpeedKmh: number
  storedStats: StoredRaceStats
  isPaused: boolean
  handleGateHit: (gateId: RaceGateId) => void
  handleSpeedChange: (speedKmh: number) => void
  restartRace: () => void
  togglePause: () => void
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const initialRaceState = (): RaceState => ({
  checkpointIndex: 0,
  currentLap: 1,
  finished: false,
  lapTimesMs: Array.from({ length: RACE_LAPS }, () => null),
  status: 'Race running',
})

function checkpointNumberFromGate(gateId: RaceGateId) {
  if (gateId === 'finish') return null
  return Number(gateId.replace('checkpoint-', ''))
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useRaceSession(): RaceSession {
  const lapStartedAtRef = useRef(0)
  const finishRecordedRef = useRef(false)
  const topSpeedRef = useRef(0)

  const [currentLapElapsedMs, setCurrentLapElapsedMs] = useState(0)
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0)
  const [raceState, setRaceState] = useState<RaceState>(initialRaceState)
  const [storedStats, setStoredStats] = useState<StoredRaceStats>(emptyRaceStats)
  const [topSpeedKmh, setTopSpeedKmh] = useState(0)

  const [isPaused, setIsPaused] = useState(false)
  const pauseTimeRef = useRef(0)

  /* --- Bootstrap ------------------------------------------------------- */
  useEffect(() => {
    lapStartedAtRef.current = performance.now()
    setStoredStats(loadRaceStats())
  }, [])

  /* --- Lap timer tick -------------------------------------------------- */
  useEffect(() => {
    if (raceState.finished || isPaused) return

    const intervalId = window.setInterval(() => {
      if (lapStartedAtRef.current === 0) {
        lapStartedAtRef.current = performance.now()
      }
      setCurrentLapElapsedMs(performance.now() - lapStartedAtRef.current)
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [raceState.finished, isPaused])

  /* --- Persist results when finished ----------------------------------- */
  useEffect(() => {
    if (!raceState.finished || finishRecordedRef.current) return

    finishRecordedRef.current = true
    const completedLapTimes = raceState.lapTimesMs.filter(
      (lapTime): lapTime is number => lapTime !== null,
    )
    setStoredStats(recordRaceResult(completedLapTimes, topSpeedRef.current))
    setCurrentLapElapsedMs(0)
  }, [raceState.finished, raceState.lapTimesMs])

  /* --- Speed handler --------------------------------------------------- */
  const handleSpeedChange = useCallback((speedKmh: number) => {
    setCurrentSpeedKmh(speedKmh)
    setTopSpeedKmh((currentTopSpeed) => {
      const nextTopSpeed = Math.max(currentTopSpeed, speedKmh)
      topSpeedRef.current = nextTopSpeed
      return nextTopSpeed
    })
  }, [])

  /* --- Gate-hit handler ------------------------------------------------ */
  const handleGateHit = useCallback((gateId: RaceGateId) => {
    if (isPaused) return
    const now = performance.now()
    if (lapStartedAtRef.current === 0) {
      lapStartedAtRef.current = now
    }

    setRaceState((currentRace) => {
      if (currentRace.finished) return currentRace

      const checkpointNumber = checkpointNumberFromGate(gateId)
      if (checkpointNumber !== null) {
        if (checkpointNumber === currentRace.checkpointIndex + 1) {
          return {
            ...currentRace,
            checkpointIndex: checkpointNumber,
            status: `Checkpoint ${checkpointNumber} recorded`,
          }
        }

        if (checkpointNumber <= currentRace.checkpointIndex) return currentRace

        return {
          ...currentRace,
          status: `Checkpoint ${currentRace.checkpointIndex + 1} is still required`,
        }
      }

      if (currentRace.checkpointIndex < 3) {
        return {
          ...currentRace,
          status: 'Lap gate ignored until all checkpoints are recorded',
        }
      }

      const lapTimesMs = [...currentRace.lapTimesMs]
      lapTimesMs[currentRace.currentLap - 1] = now - lapStartedAtRef.current
      lapStartedAtRef.current = now

      if (currentRace.currentLap >= RACE_LAPS) {
        return {
          ...currentRace,
          finished: true,
          lapTimesMs,
          status: 'Finished 3 laps',
        }
      }

      return {
        checkpointIndex: 0,
        currentLap: currentRace.currentLap + 1,
        finished: false,
        lapTimesMs,
        status: `Lap ${currentRace.currentLap} complete`,
      }
    })
  }, [isPaused])

  /* --- Pause Toggle ---------------------------------------------------- */
  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const now = performance.now()
      if (prev) {
        const timePaused = now - pauseTimeRef.current
        if (lapStartedAtRef.current !== 0) {
          lapStartedAtRef.current += timePaused
        }
      } else {
        pauseTimeRef.current = now
      }
      return !prev
    })
  }, [])

  /* --- Restart --------------------------------------------------------- */
  const restartRace = useCallback(() => {
    setRaceState(initialRaceState())
    setCurrentLapElapsedMs(0)
    setCurrentSpeedKmh(0)
    setTopSpeedKmh(0)
    topSpeedRef.current = 0
    finishRecordedRef.current = false
    setIsPaused(false)
    lapStartedAtRef.current = performance.now()
  }, [])

  return {
    raceState,
    currentLapElapsedMs,
    currentSpeedKmh,
    topSpeedKmh,
    storedStats,
    isPaused,
    handleGateHit,
    handleSpeedChange,
    restartRace,
    togglePause,
  }
}
