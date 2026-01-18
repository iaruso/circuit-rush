
export interface ControlState {
  throttle: number; // 0..1
  brake: number;    // 0..1
  steering: number; // -1..1
  drs: boolean;
  gear: number;
}

export function shouldDeactivateDrs(brake: number, steeringAngleDeg: number): boolean {
  // DRS closes if braking or steering angle is sharp (> 20°)
  return brake > 0.1 || Math.abs(steeringAngleDeg) > 20;
}
