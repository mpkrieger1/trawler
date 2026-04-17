// Shared ref-like state for wheel input sources.
// Components set a flag while actively driving the wheel; a single
// spring-back loop decays wheel toward 0 when no source is active.

export const wheelInputState = {
  pointerDragging: false,
  keyboardHolding: false,
}
