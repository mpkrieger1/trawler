// Pure boat physics — no React, no three.js imports.
// Unit-tested in physics.test.ts. See PRD §7.2 for handling spec.

export type BoatPhysicsState = {
  position: [number, number, number]
  heading: number
  velocity: number
}

export type BoatPhysicsInput = {
  throttle: number
  wheel: number
  externalForce: [number, number]
}

const KNOTS_TO_MPS = 0.5144

export const CRUISE_KNOTS = 8
export const MAX_KNOTS = 10
export const REVERSE_KNOTS = 3

export const CRUISE_MPS = CRUISE_KNOTS * KNOTS_TO_MPS
export const MAX_MPS = MAX_KNOTS * KNOTS_TO_MPS
export const REVERSE_MPS = REVERSE_KNOTS * KNOTS_TO_MPS

// Time constants of exponential velocity response. PRD says ~30s to reach cruise
// and ~45s to coast to stop — using tau = spec/3 gives ~95% after the spec time.
const ACCEL_TIME_SEC = 10
const DECEL_TIME_SEC = 15
const BASE_TURN_RATE_RAD = (2 * Math.PI) / 180

function clampFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback
}

function targetVelocityFromThrottle(throttle: number): number {
  if (throttle >= 0) return throttle * MAX_MPS
  return throttle * REVERSE_MPS
}

export function stepPhysics(
  state: BoatPhysicsState,
  input: BoatPhysicsInput,
  dt: number,
): BoatPhysicsState {
  const safeDt = clampFinite(dt, 1 / 60)
  const throttle = clampFinite(input.throttle, 0)
  const wheel = clampFinite(input.wheel, 0)
  const fx = clampFinite(input.externalForce[0], 0)
  const fz = clampFinite(input.externalForce[1], 0)

  const target = targetVelocityFromThrottle(throttle)
  const towardZero = Math.abs(target) < Math.abs(state.velocity) && Math.sign(target) === Math.sign(state.velocity)
  const timeConstant = target === 0 || towardZero ? DECEL_TIME_SEC : ACCEL_TIME_SEC
  const alpha = 1 - Math.exp(-safeDt / timeConstant)
  const velocity = clampFinite(state.velocity + (target - state.velocity) * alpha, 0)

  const velocityFactor = Math.min(1, Math.abs(velocity) / CRUISE_MPS)
  const headingDelta = wheel * BASE_TURN_RATE_RAD * velocityFactor * safeDt
  const heading = clampFinite(state.heading + headingDelta, state.heading)

  const dx = Math.sin(heading) * velocity * safeDt + fx * safeDt
  const dz = Math.cos(heading) * velocity * safeDt + fz * safeDt

  const x = clampFinite(state.position[0] + dx, state.position[0])
  const y = clampFinite(state.position[1], state.position[1])
  const z = clampFinite(state.position[2] + dz, state.position[2])

  return {
    position: [x, y, z],
    heading,
    velocity,
  }
}
