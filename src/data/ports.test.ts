import { describe, it, expect } from 'vitest'

import {
  PORT_REGIONS,
  TIDE_STATIONS,
  getPortById,
  ports,
} from '@/data/ports'

describe('ports', () => {
  it('has exactly 21 entries', () => {
    expect(ports).toHaveLength(21)
  })

  it('has unique, kebab-case ids', () => {
    const ids = ports.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
    }
  })

  it('has non-empty names and valid regions', () => {
    for (const p of ports) {
      expect(p.name.length).toBeGreaterThan(0)
      expect(PORT_REGIONS).toContain(p.region)
    }
  })

  it('has lat/lng within Inside Passage envelope', () => {
    for (const p of ports) {
      expect(p.lat).toBeGreaterThanOrEqual(47)
      expect(p.lat).toBeLessThanOrEqual(59)
      expect(p.lng).toBeGreaterThanOrEqual(-136)
      expect(p.lng).toBeLessThanOrEqual(-122)
    }
  })

  it('has glbPath matching convention', () => {
    for (const p of ports) {
      expect(p.glbPath).toBe(`/assets/models/ports/${p.id}.glb`)
    }
  })

  it('has tideStationRef from the three allowed stations', () => {
    for (const p of ports) {
      expect(TIDE_STATIONS).toContain(p.tideStationRef)
    }
  })

  it('is sorted south-to-north by latitude', () => {
    for (let i = 1; i < ports.length; i++) {
      expect(ports[i].lat).toBeGreaterThanOrEqual(ports[i - 1].lat)
    }
  })
})

describe('getPortById', () => {
  it('returns the port for a valid id', () => {
    const seattle = getPortById('seattle')
    expect(seattle).toBeDefined()
    expect(seattle?.name).toBe('Seattle')
  })

  it('returns undefined for an unknown id', () => {
    expect(getPortById('atlantis')).toBeUndefined()
  })
})
