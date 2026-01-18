export interface TransmissionData {
  min: number;
  max: number;
}

export interface AeroState {
  powerMultiplier: number;
  topSpeed: number;
  drag: number;
}

export interface SteeringOutput {
  inner: number;
  outer: number;
  base: number;
}

export const GEAR_SPEED_LIMITS: number[] = [
  105, 135, 165, 195, 230, 275, 315, 360
];

export function getTransmissionData(speed: number, gear: number): TransmissionData {
  const clampedGear = Math.max(1, Math.min(gear, GEAR_SPEED_LIMITS.length));
  const max = GEAR_SPEED_LIMITS[clampedGear - 1];
  const min = clampedGear === 1 ? 0 : GEAR_SPEED_LIMITS[clampedGear - 2];
  return { min, max };
}

export function getAeroModifiers(drsActive: boolean): AeroState {
  return drsActive
    ? { powerMultiplier: 1.1, topSpeed: 360, drag: 0.7 }
    : { powerMultiplier: 1.0, topSpeed: 320, drag: 1.0 };
}

export function getSteeringAngles(input: number, speed: number): SteeringOutput {
  // Speed sensitivity: 1.0x at 100km/h, 1.2x at 300km/h
  const minFactor = 1.0;
  const maxFactor = 1.2;
  const clampedSpeed = Math.max(0, Math.min(speed, 300));
  const speedFactor = minFactor + ((maxFactor - minFactor) * (clampedSpeed - 100)) / 200;
  const factor = Math.max(minFactor, Math.min(speedFactor, maxFactor));
  // Ackermann: inner 1.4x, outer 0.6x
  const base = input * factor;
  return {
    inner: base * 1.4,
    outer: base * 0.6,
    base,
  };
}
