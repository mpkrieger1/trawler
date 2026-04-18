import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import { getPortById, ports, type Port } from '@/data/ports'
import { useGameStore } from '@/state/store'

import { getCollision } from '@/systems/groundingState'

import { createChartStyle } from './chartStyle'
import { createBridge, type CoordinateBridge } from './coords'
import { formatDistanceNm, greatCircleRoute } from './routing'
import { buildTideArrowGeoJSON } from './tideArrows'
import styles from './Chartplotter.module.css'

// Project the currently-loaded port's collision land polygons through the
// coordinate bridge so we can draw them as a "shoreline hazard" contour on
// the chart. Returns an empty FeatureCollection if no collision is loaded.
function buildDepthContourGeoJSON(
  bridge: CoordinateBridge,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const col = getCollision()
  const features: GeoJSON.Feature<GeoJSON.LineString>[] = []
  if (col) {
    for (const poly of col.collision.polygons) {
      const coords: [number, number][] = []
      for (const [x, z] of poly) {
        const [lat, lng] = bridge.localToLatLng([x, z])
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          coords.push([lng, lat])
        }
      }
      if (coords.length >= 2) {
        features.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        })
      }
    }
  }
  return { type: 'FeatureCollection', features }
}

const FALLBACK_CENTER: [number, number] = [-122.338, 47.605] // Seattle lng,lat
const RAD_TO_DEG = 180 / Math.PI

function portPopupHtml(port: Port, bridge: CoordinateBridge | null): string {
  const boatPos = useGameStore.getState().position
  let distanceLabel = ''
  if (bridge) {
    try {
      const [boatLat, boatLng] = bridge.localToLatLng([boatPos[0], boatPos[2]])
      const meters = bridge.distanceMeters([boatLat, boatLng], [port.lat, port.lng])
      distanceLabel = `${formatDistanceNm(meters)} from boat`
    } catch {
      distanceLabel = '—'
    }
  }
  return `
    <div style="font-family:Inter,system-ui,sans-serif;color:#1a2128;min-width:140px;">
      <div style="font-weight:600;font-size:14px;margin-bottom:2px;">${port.name}</div>
      <div style="font-size:12px;color:#58585a;">${distanceLabel}</div>
    </div>
  `
}

export default function Chartplotter() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const state = useGameStore.getState()
    const startPort = state.startPortId ? getPortById(state.startPortId) : null
    const destPort = state.destinationPortId ? getPortById(state.destinationPortId) : null
    const center: [number, number] = startPort ? [startPort.lng, startPort.lat] : FALLBACK_CENTER
    const bridge = startPort ? createBridge([startPort.lat, startPort.lng]) : null

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createChartStyle(),
      center,
      zoom: 9,
    })

    const selectedIds = new Set([state.startPortId, state.destinationPortId])
    for (const p of ports) {
      const el = document.createElement('div')
      el.className = styles.portMarker + (selectedIds.has(p.id) ? ' ' + styles.portMarkerSelected : '')
      el.title = p.name
      const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map)
      el.addEventListener('click', (ev) => {
        ev.stopPropagation()
        new maplibregl.Popup({ offset: 14, closeButton: true, closeOnClick: true })
          .setLngLat([p.lng, p.lat])
          .setHTML(portPopupHtml(p, bridge))
          .addTo(map)
      })
      void marker
    }

    const boatEl = document.createElement('div')
    boatEl.className = styles.boatMarker
    const boatLngLat: [number, number] = bridge
      ? ((): [number, number] => {
          const [lat, lng] = bridge.localToLatLng([state.position[0], state.position[2]])
          return [lng, lat]
        })()
      : center
    const boatMarker = new maplibregl.Marker({ element: boatEl }).setLngLat(boatLngLat).addTo(map)
    boatEl.style.transform = `rotate(${state.heading * RAD_TO_DEG}deg)`

    // Red grounding marker — shown on Game Over scene when a fatal collision
    // set `groundingLocation`. Voyage scene clears this on reset.
    if (bridge && state.groundingLocation) {
      try {
        const [gx, gz] = state.groundingLocation
        const [gLat, gLng] = bridge.localToLatLng([gx, gz])
        if (Number.isFinite(gLat) && Number.isFinite(gLng)) {
          const gEl = document.createElement('div')
          gEl.className = styles.groundingMarker
          gEl.title = 'Ran aground here'
          new maplibregl.Marker({ element: gEl }).setLngLat([gLng, gLat]).addTo(map)
        }
      } catch (e) {
        console.warn('Chartplotter grounding marker failed:', e)
      }
    }

    map.on('load', () => {
      if (startPort && destPort) {
        const route = greatCircleRoute(
          [startPort.lat, startPort.lng],
          [destPort.lat, destPort.lng],
        )
        map.addSource('route', { type: 'geojson', data: route })
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#2c2e73', 'line-width': 2, 'line-opacity': 0.85 },
        })
      }

      if (bridge) {
        map.addSource('depth-contour', {
          type: 'geojson',
          data: buildDepthContourGeoJSON(bridge),
        })
        map.addLayer({
          id: 'depth-contour-line',
          type: 'line',
          source: 'depth-contour',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#c2571a',
            'line-width': 1.5,
            'line-opacity': 0.8,
            'line-dasharray': [2, 2],
          },
        })
      }

      map.addSource('tide-arrows', {
        type: 'geojson',
        data: buildTideArrowGeoJSON(useGameStore.getState().gameTime),
      })
      map.addLayer({
        id: 'tide-arrow-line',
        type: 'line',
        source: 'tide-arrows',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#2c6fd9',
          'line-width': [
            'interpolate',
            ['linear'],
            ['get', 'magnitude'],
            0,
            1,
            1.5,
            4,
          ],
          'line-opacity': 0.85,
        },
      })
    })

    let lastArrowUpdateMs = 0
    let lastLoadedPortId = useGameStore.getState().loadedPortId
    const unsub = useGameStore.subscribe((s) => {
      if (!bridge) return
      try {
        const [lat, lng] = bridge.localToLatLng([s.position[0], s.position[2]])
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          boatMarker.setLngLat([lng, lat])
        }
        boatEl.style.transform = `rotate(${s.heading * RAD_TO_DEG}deg)`

        const now = Date.now()
        if (now - lastArrowUpdateMs >= 2000) {
          lastArrowUpdateMs = now
          const src = map.getSource('tide-arrows') as maplibregl.GeoJSONSource | undefined
          if (src) src.setData(buildTideArrowGeoJSON(s.gameTime))
        }

        if (s.loadedPortId !== lastLoadedPortId) {
          lastLoadedPortId = s.loadedPortId
          const src = map.getSource('depth-contour') as maplibregl.GeoJSONSource | undefined
          if (src) src.setData(buildDepthContourGeoJSON(bridge))
        }
      } catch (e) {
        console.warn('Chartplotter boat marker update failed:', e)
      }
    })

    return () => {
      unsub()
      map.remove()
    }
  }, [])

  return <div ref={containerRef} className={styles.container} />
}
