import type { StyleSpecification } from 'maplibre-gl'

export type ChartStyleOptions = {
  openSeaMap?: boolean
}

export function createChartStyle(opts: ChartStyleOptions = {}): StyleSpecification {
  const { openSeaMap = true } = opts

  const sources: StyleSpecification['sources'] = {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 18,
      attribution: '© OpenStreetMap contributors',
    },
  }

  const layers: StyleSpecification['layers'] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#d8e7ea' },
    },
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm',
    },
  ]

  if (openSeaMap) {
    sources.seamark = {
      type: 'raster',
      tiles: ['https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 18,
      attribution: '© OpenSeaMap contributors',
    }
    layers.push({
      id: 'seamark-raster',
      type: 'raster',
      source: 'seamark',
    })
  }

  return {
    version: 8,
    sources,
    layers,
  }
}
