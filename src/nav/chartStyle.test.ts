import { describe, it, expect } from 'vitest'

import { createChartStyle } from '@/nav/chartStyle'

describe('createChartStyle', () => {
  it('returns version 8', () => {
    expect(createChartStyle().version).toBe(8)
  })

  it('includes an osm raster source with a tile URL template', () => {
    const style = createChartStyle()
    const osm = style.sources.osm as { type: string; tiles: string[] }
    expect(osm).toBeDefined()
    expect(osm.type).toBe('raster')
    expect(osm.tiles[0]).toContain('{x}/{y}.png')
    expect(osm.tiles[0]).toContain('{z}')
  })

  it('includes the seamark overlay when openSeaMap is true (default)', () => {
    const style = createChartStyle()
    expect(style.sources.seamark).toBeDefined()
  })

  it('omits the seamark overlay when openSeaMap is false', () => {
    const style = createChartStyle({ openSeaMap: false })
    expect(style.sources.seamark).toBeUndefined()
  })

  it('orders layers: background, osm, seamark', () => {
    const ids = createChartStyle().layers.map((l) => l.id)
    expect(ids).toEqual(['background', 'osm-raster', 'seamark-raster'])
  })

  it('drops seamark layer when overlay is disabled', () => {
    const ids = createChartStyle({ openSeaMap: false }).layers.map((l) => l.id)
    expect(ids).toEqual(['background', 'osm-raster'])
  })
})
