import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import { getPortById, ports } from '@/data/ports'
import { useGameStore } from '@/state/store'

import { createChartStyle } from './chartStyle'
import { createBridge } from './coords'
import styles from './Chartplotter.module.css'

const FALLBACK_CENTER: [number, number] = [-122.338, 47.605] // Seattle lng,lat
const RAD_TO_DEG = 180 / Math.PI

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
      new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map)
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

    const unsub = useGameStore.subscribe((s) => {
      if (!bridge) return
      try {
        const [lat, lng] = bridge.localToLatLng([s.position[0], s.position[2]])
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          boatMarker.setLngLat([lng, lat])
        }
        boatEl.style.transform = `rotate(${s.heading * RAD_TO_DEG}deg)`
      } catch (e) {
        console.warn('Chartplotter boat marker update failed:', e)
      }
    })

    // Destination marker uses the same start/dest color if picked — nothing to
    // do here if dest equals startPortId pathologically; skip since UI prevents it.
    void destPort

    return () => {
      unsub()
      map.remove()
    }
  }, [])

  return <div ref={containerRef} className={styles.container} />
}
