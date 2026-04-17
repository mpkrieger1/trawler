import { describe, it, expect } from 'vitest'

import {
  stepPhysics,
  CRUISE_MPS,
  MAX_MPS,
  REVERSE_MPS,
  type BoatPhysicsState,
} from './physics'

const ZERO_STATE: BoatPhysicsState = {
  position: [0, 0, 0],
  heading: 0,
  velocity: 0,
}

const IDLE_INPUT = { throttle: 0, wheel: 0, externalForce: [0, 0] as [number, number] }

function runFor(
  state: BoatPhysicsState,
  input: typeof IDLE_INPUT,
  durationSec: number,
  dt = 1 / 60,
): BoatPhysicsState {
  let s = state
  const steps = Math.round(durationSec / dt)
  for (let i = 0; i < steps; i++) {
    s = stepPhysics(s, input, dt)
  }
  return s
}

describe('stepPhysics', () => {
  it('idle input at zero velocity leaves boat stationary', () => {
    const s = stepPhysics(ZERO_STATE, IDLE_INPUT, 1 / 60)
    expect(s.velocity).toBeCloseTo(0, 6)
    expect(s.position[0]).toBeCloseTo(0, 6)
    expect(s.position[2]).toBeCloseTo(0, 6)
    expect(s.heading).toBeCloseTo(0, 6)
  })

  it('throttle 0.75 for ~30s approaches cruise velocity', () => {
    const result = runFor(ZERO_STATE, { ...IDLE_INPUT, throttle: 0.75 }, 45)
    // After 45s (1.5× time constant) should be well within 10% of cruise
    expect(result.velocity).toBeGreaterThan(CRUISE_MPS * 0.75)
    expect(result.velocity).toBeLessThanOrEqual(CRUISE_MPS + 0.01)
  })

  it('full throttle 1.0 approaches max velocity', () => {
    const result = runFor(ZERO_STATE, { ...IDLE_INPUT, throttle: 1.0 }, 60)
    expect(result.velocity).toBeGreaterThan(MAX_MPS * 0.85)
    expect(result.velocity).toBeLessThanOrEqual(MAX_MPS + 0.01)
  })

  it('reverse throttle −1.0 approaches negative reverse velocity', () => {
    const result = runFor(ZERO_STATE, { ...IDLE_INPUT, throttle: -1.0 }, 60)
    expect(result.velocity).toBeLessThan(-REVERSE_MPS * 0.85)
    expect(result.velocity).toBeGreaterThanOrEqual(-REVERSE_MPS - 0.01)
  })

  it('cutting throttle from cruise causes velocity to decay (coasting)', () => {
    const cruising: BoatPhysicsState = {
      position: [0, 0, 0],
      heading: 0,
      velocity: CRUISE_MPS,
    }
    const after = runFor(cruising, IDLE_INPUT, 60)
    // After 60s (> deceleration time constant) should be near zero
    expect(Math.abs(after.velocity)).toBeLessThan(CRUISE_MPS * 0.2)
  })

  it('non-zero wheel at cruise changes heading', () => {
    const cruising: BoatPhysicsState = {
      position: [0, 0, 0],
      heading: 0,
      velocity: CRUISE_MPS,
    }
    const after = runFor(cruising, { throttle: 0.75, wheel: 1.0, externalForce: [0, 0] }, 1)
    // 1 second at full wheel at cruise → roughly 2 degrees
    expect(Math.abs(after.heading)).toBeGreaterThan(0.01)
    expect(Math.abs(after.heading)).toBeLessThan(0.1)
  })

  it('turn rate scales with velocity — no turn at zero velocity', () => {
    const stationary: BoatPhysicsState = {
      position: [0, 0, 0],
      heading: 0,
      velocity: 0,
    }
    const after = stepPhysics(
      stationary,
      { throttle: 0, wheel: 1.0, externalForce: [0, 0] },
      1 / 60,
    )
    expect(after.heading).toBeCloseTo(0, 6)
  })

  it('external force translates position over time', () => {
    const after = stepPhysics(
      ZERO_STATE,
      { throttle: 0, wheel: 0, externalForce: [2, 3] },
      1,
    )
    expect(after.position[0]).toBeCloseTo(2, 4)
    expect(after.position[2]).toBeCloseTo(3, 4)
  })

  it('NaN inputs do not corrupt state', () => {
    const badInput = { throttle: NaN, wheel: 0, externalForce: [0, 0] as [number, number] }
    const after = stepPhysics(ZERO_STATE, badInput, 1 / 60)
    expect(Number.isFinite(after.velocity)).toBe(true)
    expect(Number.isFinite(after.heading)).toBe(true)
    expect(Number.isFinite(after.position[0])).toBe(true)
    expect(Number.isFinite(after.position[2])).toBe(true)
  })

  it('produces forward motion in +Z direction at heading 0', () => {
    const moving: BoatPhysicsState = {
      position: [0, 0, 0],
      heading: 0,
      velocity: CRUISE_MPS,
    }
    const after = stepPhysics(moving, IDLE_INPUT, 1)
    // heading 0 = north/+Z in our scene convention
    expect(after.position[2]).toBeGreaterThan(1)
    expect(Math.abs(after.position[0])).toBeLessThan(0.5)
  })
})
