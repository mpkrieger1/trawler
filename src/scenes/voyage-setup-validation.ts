export type StartReason = 'SELECT_START' | 'SELECT_DEST' | 'SAME_PORT'

export type StartCheck =
  | { ok: true }
  | { ok: false; reason: StartReason }

export function canStartVoyage(input: {
  startId: string | null
  destId: string | null
}): StartCheck {
  if (!input.startId) return { ok: false, reason: 'SELECT_START' }
  if (!input.destId) return { ok: false, reason: 'SELECT_DEST' }
  if (input.startId === input.destId) return { ok: false, reason: 'SAME_PORT' }
  return { ok: true }
}
