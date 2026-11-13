// Truth or Dare (ความจริงหรือคำท้า) — mobile party game at /truth-or-dare.
// Pure helpers: question bank parsing, category settings, no-repeat drawing,
// and the finger chooser's colours + fair pick. Kept free of React so
// `npm test` can load it with plain Node.
import { addUsed, questionKey, type UsedLog } from "./chaser.ts";
import { secureRandomInt } from "./wheel.ts";

export type Kind = "truth" | "dare";

export const KINDS: readonly Kind[] = ["truth", "dare"];

export const KIND_LABEL: Record<Kind, string> = {
  truth: "ความจริง",
  dare: "คำท้า",
};

export interface Prompt {
  /** `truth:<hash of text>` — stable across edits elsewhere in the bank. */
  id: string;
  kind: Kind;
  category: string;
  text: string;
}

// ---------- bank ----------

const HEADER = /^#\s*(ความจริง|คำท้า)\s*[:：]\s*(.+?)\s*$/;

/**
 * Bank text → prompts. `# ความจริง: หมวด` / `# คำท้า: หมวด` start a section,
 * then one prompt per line. Lines before the first header, blank lines,
 * leading list markers and duplicate texts are dropped.
 */
export function parseBank(text: string): Prompt[] {
  const out: Prompt[] = [];
  const seen = new Set<string>();
  let kind: Kind | null = null;
  let category = "";
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const header = HEADER.exec(line);
    if (header) {
      kind = header[1] === "ความจริง" ? "truth" : "dare";
      category = header[2];
      continue;
    }
    if (!kind || line.startsWith("#")) continue;
    const body = line
      .replace(/^(?:[-*•]|\d+[.)])\s*/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!body) continue;
    const id = `${kind}:${questionKey({ question: body })}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, kind, category, text: body });
  }
  return out;
}

/** Category key used in settings, e.g. "truth:เจาะใจ". */
export const categoryKey = (kind: Kind, category: string) => `${kind}:${category}`;

/** Categories of one kind in bank order, with prompt counts. */
export function listCategories(bank: readonly Prompt[], kind: Kind): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of bank) if (p.kind === kind) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
}

// ---------- settings ----------

export interface TodSettings {
  /** categoryKey()s switched off. */
  off: string[];
  sound: boolean;
}

export const DEFAULT_TOD_SETTINGS: TodSettings = { off: [], sound: true };

export function sanitizeTodSettings(raw: unknown): TodSettings {
  const r = (raw ?? {}) as Partial<Record<keyof TodSettings, unknown>>;
  const off = Array.isArray(r.off)
    ? [...new Set(r.off.filter((k): k is string => typeof k === "string" && k.length > 0 && k.length < 80))]
    : [];
  return { off, sound: typeof r.sound === "boolean" ? r.sound : DEFAULT_TOD_SETTINGS.sound };
}

/** Prompts of `kind` whose category is switched on. */
export function enabledPrompts(bank: readonly Prompt[], kind: Kind, settings: TodSettings): Prompt[] {
  const off = new Set(settings.off);
  return bank.filter((p) => p.kind === kind && !off.has(categoryKey(p.kind, p.category)));
}

// ---------- drawing ----------

export interface Draw {
  prompt: Prompt;
  used: UsedLog;
  /** Every enabled prompt of this kind had been used today, so they were reshuffled. */
  recycled: boolean;
}

/**
 * Next prompt of `kind`: one not used today, from a category chosen evenly
 * among those with prompts left (so small categories still come up), never
 * `avoidId` when anything else is available. Returns null when every
 * category of that kind is switched off.
 */
export function drawPrompt(
  bank: readonly Prompt[],
  kind: Kind,
  settings: TodSettings,
  used: UsedLog,
  today: string,
  avoidId: string | null = null,
  random: () => number = Math.random,
): Draw | null {
  const pool = enabledPrompts(bank, kind, settings);
  if (pool.length === 0) return null;

  let log: UsedLog = used.day === today ? used : { day: today, keys: [] };
  const usedKeys = new Set(log.keys);
  let fresh = pool.filter((p) => !usedKeys.has(p.id));
  let recycled = false;
  if (fresh.length === 0) {
    const poolIds = new Set(pool.map((p) => p.id));
    log = { day: today, keys: log.keys.filter((k) => !poolIds.has(k)) };
    fresh = pool;
    recycled = true;
  }
  if (avoidId && fresh.length > 1) fresh = fresh.filter((p) => p.id !== avoidId);

  const byCategory = new Map<string, Prompt[]>();
  for (const p of fresh) {
    const list = byCategory.get(p.category);
    if (list) list.push(p);
    else byCategory.set(p.category, [p]);
  }
  const groups = [...byCategory.values()];
  const group = groups[Math.min(groups.length - 1, Math.floor(random() * groups.length))];
  const prompt = group[Math.min(group.length - 1, Math.floor(random() * group.length))];
  return { prompt, used: addUsed(log, prompt.id, today), recycled };
}

/** How many enabled prompts of `kind` are still unused today. */
export function promptsLeft(bank: readonly Prompt[], kind: Kind, settings: TodSettings, used: UsedLog, today: string): number {
  const keys = new Set(used.day === today ? used.keys : []);
  return enabledPrompts(bank, kind, settings).filter((p) => !keys.has(p.id)).length;
}

// ---------- finger chooser ----------

/** Fingers needed before the countdown starts. */
export const MIN_FINGERS = 2;
/** Fingers must stay put (same count) this long before someone is picked. */
export const ARM_MS = 2600;
/** Red flood after the pick, before the truth/dare choice appears. */
export const REVEAL_MS = 1500;

/** The picked finger turns this red; no finger starts out red or close to it. */
export const PICK_RED = "#ef1d3a";

export const FINGER_COLORS = [
  "#38bdf8", // sky
  "#facc15", // yellow
  "#34d399", // emerald
  "#a78bfa", // violet
  "#fb923c", // orange
  "#22d3ee", // cyan
  "#a3e635", // lime
  "#60a5fa", // blue
  "#e879f9", // fuchsia
  "#f5f5f4", // white
  "#2dd4bf", // teal
  "#fcd34d", // amber
] as const;

/** Lowest colour index not in `taken` (wraps once every colour is in use). */
export function nextColor(taken: readonly number[]): number {
  const set = new Set(taken);
  for (let i = 0; i < FINGER_COLORS.length; i++) if (!set.has(i)) return i;
  return taken.length % FINGER_COLORS.length;
}

/** Uniformly random member of `ids` (crypto-backed). */
export function pickFinger<T>(ids: readonly T[], randomInt: (max: number) => number = secureRandomInt): T {
  if (ids.length === 0) throw new RangeError("no fingers to pick from");
  return ids[randomInt(ids.length)];
}

/** Coin flip for "สุ่มให้เลย". */
export function randomKind(randomInt: (max: number) => number = secureRandomInt): Kind {
  return KINDS[randomInt(KINDS.length)];
}
