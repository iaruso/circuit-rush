export interface ControlState {
  throttle: number
  brake: number
  steering: number
  drs: boolean
  gear: number
}

export function shouldDeactivateDrs(brake: number, steeringAngleDeg: number): boolean {
  return brake > 0.1 || Math.abs(steeringAngleDeg) > 20
}
