// Final Project (CD AI Innovation Bootcamp 2026): limits and server-side
// validation shared by the submit form and /api/final-project. Students send
// the link to their deployed site and a pitch deck PDF. The PDF goes straight
// from the browser to Supabase Storage (Vercel caps request bodies at 4.5 MB);
// only its storage path comes through the API. Kept free of non-relative
// imports so `npm test` can load it with plain Node.
import { ERRORS as HTML_ERRORS, PROMPT_BATTLE_EVENT } from "./promptBattle.ts";
import { normalizeLink } from "./pitch.ts";

export const FINAL_PROJECT_PATH = `/events/${PROMPT_BATTLE_EVENT.year}/${PROMPT_BATTLE_EVENT.slug}/final-project`;

/** Private Supabase Storage bucket (see the final_project migration). */
export const DECK_BUCKET = "final-project-decks";
export const MAX_DECK_BYTES = 30 * 1024 * 1024;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
/** `<application id>/<random uuid>.pdf` — the storage policy enforces the same shape. */
const DECK_PATH_RE = new RegExp(`^(${UUID})/${UUID}\\.pdf$`);

export const FINAL_PROJECT_ERRORS = {
  deployUrl: "กรุณาใส่ลิงก์เว็บไซต์ที่ deploy แล้ว",
  deployScheme: "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https:// เท่านั้น",
  deployLocal: "ลิงก์นี้เปิดได้แค่ในเครื่องตัวเอง (localhost) — กรุณาใส่ลิงก์ที่ deploy ขึ้นอินเทอร์เน็ตแล้ว",
  deck: "กรุณาอัปโหลด Pitch Deck เป็นไฟล์ PDF",
  deckType: "Pitch Deck ต้องเป็นไฟล์ PDF เท่านั้น",
  deckTooLarge: `ไฟล์ PDF ต้องมีขนาดไม่เกิน ${MAX_DECK_BYTES / 1024 / 1024} MB`,
  deckUpload: "อัปโหลด PDF ไม่สำเร็จ โปรดลองอีกครั้ง",
} as const;

export interface FinalProjectInput {
  participantId: unknown;
  deployUrl: unknown;
  deckPath: unknown;
}

export interface ValidFinalProject {
  participantId: string;
  deployUrl: string;
  deckPath: string;
}

export type FinalProjectValidation =
  | ({ ok: true } & ValidFinalProject)
  | { ok: false; error: string };

/** Hosts that only work on the student's own machine or local network. */
export function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host.includes(":")) return host === "::1" || host === "::" || /^(f[cd]|fe80:)/.test(host);
  const ip = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ip) return false;
  const [a, b] = [Number(ip[1]), Number(ip[2])];
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

/** Normalized public http(s) URL, or the error to show. */
export function checkDeployUrl(raw: unknown): { url: string } | { error: string } {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { error: FINAL_PROJECT_ERRORS.deployUrl };
  const url = normalizeLink(value);
  if (!url) return { error: FINAL_PROJECT_ERRORS.deployScheme };
  if (isLocalHost(new URL(url).hostname)) return { error: FINAL_PROJECT_ERRORS.deployLocal };
  return { url };
}

/** A PDF starts with "%PDF-". */
export function isPdf(bytes: Uint8Array): boolean {
  return [0x25, 0x50, 0x44, 0x46, 0x2d].every((b, i) => bytes[i] === b);
}

export const isPdfName = (name: string) => /\.pdf$/i.test(name.trim());

export function deckPathOwner(path: string): string | null {
  return DECK_PATH_RE.exec(path)?.[1] ?? null;
}

export function validateFinalProject(
  input: FinalProjectInput,
  participantIds: ReadonlySet<string>,
): FinalProjectValidation {
  const fail = (error: string): FinalProjectValidation => ({ ok: false, error });

  if (typeof input.participantId !== "string" || !participantIds.has(input.participantId)) {
    return fail(HTML_ERRORS.participant);
  }

  const deploy = checkDeployUrl(input.deployUrl);
  if ("error" in deploy) return fail(deploy.error);

  // The deck must sit in this student's own folder.
  if (typeof input.deckPath !== "string" || deckPathOwner(input.deckPath) !== input.participantId) {
    return fail(FINAL_PROJECT_ERRORS.deck);
  }

  return {
    ok: true,
    participantId: input.participantId,
    deployUrl: deploy.url,
    deckPath: input.deckPath,
  };
}
