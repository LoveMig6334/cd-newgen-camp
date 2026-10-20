// Random student-picker wheel: fair winner selection and the rotation that
// lands the pointer on it. Kept free of imports so `npm test` can load it
// with plain Node.
//
// Geometry: segment i covers [i·s, (i+1)·s) degrees clockwise from the top,
// where s = 360 / count. The pointer sits at the top; rotating the wheel by
// R degrees clockwise puts wheel angle (−R mod 360) under the pointer.

export const SPIN_MS = 4500;
export const MIN_SPINS = 5;

export interface WheelState {
  /** Ids in the order they were picked (ลำดับการนำเสนอ). */
  picked: string[];
  /** Ids a TA removed from the wheel (e.g. absent). */
  excluded: string[];
  /** When false, picked students leave the wheel. */
  allowRepeat: boolean;
}

export const DEFAULT_WHEEL_STATE: WheelState = {
  picked: [],
  excluded: [],
  allowRepeat: false,
};

const mod360 = (deg: number) => ((deg % 360) + 360) % 360;

/** Uniform integer in [0, max) from crypto.getRandomValues (no modulo bias). */
export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError("max must be a positive integer");
  }
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

/** Index of the segment under the pointer for a wheel rotated by `rotation`. */
export function segmentAt(rotation: number, count: number): number {
  const size = 360 / count;
  return Math.min(count - 1, Math.floor(mod360(-rotation) / size));
}

/**
 * Final rotation (always ahead of `current` by `spins` full turns plus less
 * than one more) that stops the pointer inside segment `winner`.
 * `offset` in [0, 1) picks the spot within the middle 70% of the segment.
 */
export function spinTarget(
  current: number,
  count: number,
  winner: number,
  offset: number,
  spins = MIN_SPINS,
): number {
  const size = 360 / count;
  const theta = (winner + 0.15 + 0.7 * offset) * size;
  const delta = mod360(mod360(-theta) - mod360(current));
  return current + spins * 360 + delta;
}

/** Students currently on the wheel, in roster order. */
export function wheelPool<T extends { id: string }>(
  people: T[],
  state: WheelState,
): T[] {
  return people.filter(
    (p) =>
      !state.excluded.includes(p.id) &&
      (state.allowRepeat || !state.picked.includes(p.id)),
  );
}

/** Drop ids that are no longer in the roster (e.g. stale localStorage). */
export function sanitizeWheelState(raw: unknown, ids: ReadonlySet<string>): WheelState {
  const r = (raw ?? {}) as Partial<Record<keyof WheelState, unknown>>;
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((id): id is string => typeof id === "string" && ids.has(id)) : [];
  return {
    picked: list(r.picked),
    excluded: [...new Set(list(r.excluded))],
    allowRepeat: r.allowRepeat === true,
  };
}
