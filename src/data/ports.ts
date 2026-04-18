// PRD §6 — 21 Inside Passage ports, ordered south-to-north.
// Coordinates are approximate marina positions (~0.001° ≈ 100 m), sufficient for
// chart markers. Collision geometry uses GLB-local coords, not these lat/lng.

export const PORT_REGIONS = [
  'puget-sound',
  'san-juans',
  'gulf-islands',
  'desolation',
  'central-bc',
  'southeast-ak',
] as const

export type PortRegion = (typeof PORT_REGIONS)[number]

export const TIDE_STATIONS = ['seattle', 'campbell-river', 'juneau'] as const

export type TideStationId = (typeof TIDE_STATIONS)[number]

export type Port = {
  id: string
  name: string
  region: PortRegion
  lat: number
  lng: number
  glbPath: string
  tideStationRef: TideStationId
}

function makePort(
  id: string,
  name: string,
  region: PortRegion,
  lat: number,
  lng: number,
  tideStationRef: TideStationId,
): Port {
  return {
    id,
    name,
    region,
    lat,
    lng,
    glbPath: `/assets/models/ports/${id}.glb`,
    tideStationRef,
  }
}

export const ports: readonly Port[] = [
  makePort('seattle', 'Seattle', 'puget-sound', 47.605, -122.338, 'seattle'),
  makePort('bainbridge', 'Bainbridge Island', 'puget-sound', 47.620, -122.518, 'seattle'),
  makePort('kingston', 'Kingston', 'puget-sound', 47.797, -122.497, 'seattle'),
  makePort('port-townsend', 'Port Townsend', 'puget-sound', 48.117, -122.761, 'seattle'),
  makePort('anacortes', 'Anacortes', 'puget-sound', 48.516, -122.612, 'seattle'),
  makePort('friday-harbor', 'Friday Harbor', 'san-juans', 48.535, -123.012, 'seattle'),
  makePort('roche-harbor', 'Roche Harbor', 'san-juans', 48.614, -123.160, 'seattle'),
  makePort('deer-harbor', 'Deer Harbor', 'san-juans', 48.616, -123.003, 'seattle'),
  makePort('sidney', 'Sidney', 'gulf-islands', 48.653, -123.400, 'campbell-river'),
  makePort('nanaimo', 'Nanaimo', 'gulf-islands', 49.166, -123.940, 'campbell-river'),
  makePort('pender-harbour', 'Pender Harbour', 'gulf-islands', 49.627, -124.032, 'campbell-river'),
  makePort('campbell-river', 'Campbell River', 'gulf-islands', 50.033, -125.244, 'campbell-river'),
  makePort('refuge-cove', 'Refuge Cove', 'desolation', 50.124, -124.845, 'campbell-river'),
  makePort('port-mcneill', 'Port McNeill', 'desolation', 50.592, -127.082, 'campbell-river'),
  makePort('shearwater', 'Shearwater', 'central-bc', 52.148, -128.083, 'juneau'),
  makePort('prince-rupert', 'Prince Rupert', 'central-bc', 54.315, -130.321, 'juneau'),
  makePort('ketchikan', 'Ketchikan', 'southeast-ak', 55.342, -131.646, 'juneau'),
  makePort('wrangell', 'Wrangell', 'southeast-ak', 56.471, -132.376, 'juneau'),
  makePort('petersburg', 'Petersburg', 'southeast-ak', 56.812, -132.955, 'juneau'),
  makePort('sitka', 'Sitka', 'southeast-ak', 57.053, -135.330, 'juneau'),
  makePort('juneau', 'Juneau', 'southeast-ak', 58.300, -134.420, 'juneau'),
]

const portById = new Map(ports.map((p) => [p.id, p]))

export function getPortById(id: string): Port | undefined {
  return portById.get(id)
}
