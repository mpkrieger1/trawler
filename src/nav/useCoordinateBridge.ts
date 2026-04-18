import { useMemo } from 'react'

import { getPortById } from '@/data/ports'
import { useGameStore } from '@/state/store'

import { createBridge, type CoordinateBridge } from './coords'

export function useCoordinateBridge(): CoordinateBridge | null {
  const startPortId = useGameStore((s) => s.startPortId)
  return useMemo(() => {
    if (!startPortId) return null
    const port = getPortById(startPortId)
    if (!port) return null
    return createBridge([port.lat, port.lng])
  }, [startPortId])
}
