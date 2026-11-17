// Secret Santa: shared helpers for the admin page and the public draw page.
// The draw itself happens in Postgres (secret_santa_draw(), see
// supabase/migrations/20261117120000_secret_santa.sql) so it is atomic and
// nobody — admin included — can see who got whom: no pair is ever stored.

export const SECRET_SANTA_PATH = "/secret-santa";
export const MIN_PEOPLE = 3;
export const MAX_PEOPLE = 200;
export const MAX_NAME_LENGTH = 60;

export const DEFAULT_NAMES = [
  "ริกะ Rika",
  "แม็กซ์ Max",
  "มิก Mix",
  "นิญโญ่ Ninyo",
  "เอิร์ธ Earth",
  "กล้า Kla",
  "แคลฟี่ Calfy",
  "บัว Bua",
  "พี่เซอ Serena",
  "เพตรา Petra",
];

export interface SantaStatus {
  roundId: string;
  total: number;
  drawnCount: number;
  /** People who still have to draw, in the admin's order. */
  waiting: string[];
}

/** Same clean-up the SQL does: trim, collapse inner whitespace. */
export function cleanName(name: string): string {
  return name.normalize("NFC").replace(/\s+/g, " ").trim();
}

/** One name per line (commas also split). */
export function parseNames(text: string): { names: string[]; error: string | null } {
  const names = text
    .split(/[\n,]/)
    .map(cleanName)
    .filter(Boolean);

  if (names.length < MIN_PEOPLE) {
    return { names, error: `ต้องมีอย่างน้อย ${MIN_PEOPLE} คน` };
  }
  if (names.length > MAX_PEOPLE) {
    return { names, error: `ได้สูงสุด ${MAX_PEOPLE} คน` };
  }
  const tooLong = names.find((n) => n.length > MAX_NAME_LENGTH);
  if (tooLong) {
    return { names, error: `ชื่อยาวเกิน ${MAX_NAME_LENGTH} ตัวอักษร: ${tooLong}` };
  }
  const seen = new Set<string>();
  for (const n of names) {
    const key = n.toLowerCase();
    if (seen.has(key)) return { names, error: `ชื่อซ้ำ: ${n}` };
    seen.add(key);
  }
  return { names, error: null };
}

/**
 * "ริกะ Rika" → { main: "ริกะ", sub: "Rika" }. A trailing Latin part becomes
 * the small subtitle; anything else is shown as is.
 */
export function splitName(name: string): { main: string; sub: string | null } {
  const m = /^(.*\S)\s+([A-Za-z][A-Za-z .'-]*)$/.exec(name.trim());
  if (m && /[^\x00-\x7F]/.test(m[1])) return { main: m[1], sub: m[2] };
  return { main: name.trim(), sub: null };
}

export function toStatus(rows: unknown): SantaStatus | null {
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (typeof r.round_id !== "string") return null;
  return {
    roundId: r.round_id,
    total: Number(r.total) || 0,
    drawnCount: Number(r.drawn_count) || 0,
    waiting: Array.isArray(r.waiting) ? r.waiting.filter((x): x is string => typeof x === "string") : [],
  };
}

const ERROR_TEXT: Record<string, string> = {
  round_gone: "รอบนี้ถูกรีเซ็ตแล้ว ลองโหลดหน้าใหม่",
  not_participant: "ไม่พบชื่อนี้ในรายชื่อ",
  already_drawn: "ชื่อนี้สุ่มไปแล้ว",
  no_choice: "สุ่มไม่ได้ ลองให้ admin เริ่มรอบใหม่",
  not_allowed: "ต้องล็อกอินเป็น admin",
  bad_count: `ต้องมี ${MIN_PEOPLE}–${MAX_PEOPLE} คน`,
  name_too_long: `ชื่อยาวเกิน ${MAX_NAME_LENGTH} ตัวอักษร`,
  duplicate_name: "มีชื่อซ้ำกัน",
};

export function errorText(message: string | undefined | null): string {
  const key = (message ?? "").trim();
  return ERROR_TEXT[key] ?? "มีบางอย่างผิดพลาด ลองอีกครั้ง";
}
