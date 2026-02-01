export interface TransmissionData {
  min: number
  max: number
}

export interface AeroState {
  powerMultiplier: number
  topSpeed: number
  drag: number
}

export interface SteeringOutput {
  inner: number
  outer: number
  base: number
}

export const GEAR_SPEED_LIMITS = [105, 135, 165, 195, 230, 275, 315, 360]

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

export function getTransmissionData(speed: number, gear: number): TransmissionData {
  const clampedGear = clamp(gear, 1, GEAR_SPEED_LIMITS.length)
  const max = GEAR_SPEED_LIMITS[clampedGear - 1]
  const min = clampedGear === 1 ? 0 : GEAR_SPEED_LIMITS[clampedGear - 2]
  return { min, max }
}

export function getAeroModifiers(drsActive: boolean): AeroState {
  return drsActive
    ? { powerMultiplier: 1.1, topSpeed: 360, drag: 0.7 }
    : { powerMultiplier: 1.0, topSpeed: 320, drag: 1.0 }
}

export function getSteeringAngles(input: number, _speed: number): SteeringOutput {
  const base = input
  return {
    inner: base,
    outer: base,
    base,
  }
}
