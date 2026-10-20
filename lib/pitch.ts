// Prototype PITCH (CD AI Innovation Bootcamp 2026): limits and server-side
// validation shared by the submit form and /api/pitch. Reuses the Prompt
// Battle HTML rules. Kept free of non-relative imports so `npm test` can load
// it with plain Node.
import {
  ERRORS as HTML_ERRORS,
  MAX_HTML_BYTES,
  PROMPT_BATTLE_EVENT,
  htmlByteLength,
  isHtmlFile,
  type UploadedHtmlFile,
} from "./promptBattle.ts";

export const PITCH_PATH = `/events/${PROMPT_BATTLE_EVENT.year}/${PROMPT_BATTLE_EVENT.slug}/pitch`;

export const MAX_PROBLEM_CHARS = 500;
export const MAX_HMW_CHARS = 300;
export const MAX_IDEA_CHARS = 500;
export const MAX_URL_CHARS = 2000;
export const MAX_SKETCH_BYTES = 5 * 1024 * 1024;
/** Vercel rejects function request bodies above 4.5 MB. */
export const MAX_UPLOAD_BYTES = 4.4 * 1024 * 1024;
export const MAX_PITCH_REQUEST_BYTES = MAX_HTML_BYTES + MAX_SKETCH_BYTES + 64 * 1024;

export const SKETCH_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export type SketchMime = (typeof SKETCH_TYPES)[number];

export const PITCH_ERRORS = {
  problem: "กรุณากรอกปัญหาที่เจอ",
  hmw: "กรุณากรอก How Might We",
  idea: "กรุณากรอกไอเดียที่เลือก",
  tooLong: (label: string, max: number) => `${label}ยาวเกิน ${max.toLocaleString()} ตัวอักษร`,
  prototype: "กรุณาส่งต้นแบบ: อัปโหลด/วางโค้ด HTML หรือใส่ลิงก์อย่างน้อย 1 อย่าง",
  link: "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https:// เท่านั้น",
  sketchType: "รูปสเก็ตช์ต้องเป็นไฟล์ PNG, JPG หรือ WEBP เท่านั้น",
  sketchTooLarge: "รูปสเก็ตช์ต้องมีขนาดไม่เกิน 5 MB",
  uploadTooLarge: "ไฟล์รวมกันใหญ่เกินไป (สูงสุดประมาณ 4 MB) กรุณาลดขนาดรูปหรือไฟล์ HTML",
} as const;

export interface PitchInput {
  participantId: unknown;
  problem: unknown;
  hmw: unknown;
  idea: unknown;
  pastedHtml: unknown;
  file: UploadedHtmlFile | null;
  link: unknown;
  sketch: Uint8Array | null;
}

export interface ValidPitch {
  participantId: string;
  problem: string;
  hmw: string;
  idea: string;
  html: string | null;
  linkUrl: string | null;
  sketch: { bytes: Uint8Array; mime: SketchMime } | null;
}

export type PitchValidation = ({ ok: true } & ValidPitch) | { ok: false; error: string };

/** Detect PNG / JPEG / WEBP from the file's first bytes (ignores the name). */
export function detectImageMime(bytes: Uint8Array): SketchMime | null {
  const starts = (sig: number[], at = 0) => sig.every((b, i) => bytes[at + i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

/** Normalized http(s) URL, or null for anything else (javascript:, data:, ...). */
export function normalizeLink(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > MAX_URL_CHARS || /[\s\u0000-\u001f\u007f]/.test(value)) return null;
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) return null;
    return url.href.length <= MAX_URL_CHARS ? url.href : null;
  } catch {
    return null;
  }
}

const text = (v: unknown) =>
  typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim() : "";

export function validatePitch(
  input: PitchInput,
  participantIds: ReadonlySet<string>,
): PitchValidation {
  const fail = (error: string): PitchValidation => ({ ok: false, error });

  if (typeof input.participantId !== "string" || !participantIds.has(input.participantId)) {
    return fail(HTML_ERRORS.participant);
  }

  const problem = text(input.problem);
  const hmw = text(input.hmw);
  const idea = text(input.idea);
  if (!problem) return fail(PITCH_ERRORS.problem);
  if (problem.length > MAX_PROBLEM_CHARS) return fail(PITCH_ERRORS.tooLong("ปัญหาที่เจอ", MAX_PROBLEM_CHARS));
  if (!hmw) return fail(PITCH_ERRORS.hmw);
  if (hmw.length > MAX_HMW_CHARS) return fail(PITCH_ERRORS.tooLong("How Might We ", MAX_HMW_CHARS));
  if (!idea) return fail(PITCH_ERRORS.idea);
  if (idea.length > MAX_IDEA_CHARS) return fail(PITCH_ERRORS.tooLong("ไอเดียที่เลือก", MAX_IDEA_CHARS));

  // Prototype HTML: same rules as Prompt Battle, but optional when a link is given.
  const pasted = typeof input.pastedHtml === "string" ? input.pastedHtml : "";
  const hasPasted = pasted.trim().length > 0;
  if (input.file && hasPasted) return fail(HTML_ERRORS.htmlBoth);
  let html: string | null = null;
  if (input.file) {
    if (!isHtmlFile(input.file.name, input.file.type)) return fail(HTML_ERRORS.fileType);
    if (input.file.bytes.length > MAX_HTML_BYTES) return fail(HTML_ERRORS.tooLarge);
    try {
      html = new TextDecoder("utf-8", { fatal: true }).decode(input.file.bytes);
    } catch {
      return fail(HTML_ERRORS.notText);
    }
    if (html.includes("\0")) return fail(HTML_ERRORS.notText);
    if (!html.trim()) html = null;
  } else if (hasPasted) {
    if (htmlByteLength(pasted) > MAX_HTML_BYTES) return fail(HTML_ERRORS.tooLarge);
    html = pasted;
  }

  const rawLink = typeof input.link === "string" ? input.link.trim() : "";
  let linkUrl: string | null = null;
  if (rawLink) {
    linkUrl = normalizeLink(rawLink);
    if (!linkUrl) return fail(PITCH_ERRORS.link);
  }

  if (!html && !linkUrl) return fail(PITCH_ERRORS.prototype);

  let sketch: ValidPitch["sketch"] = null;
  if (input.sketch && input.sketch.length > 0) {
    if (input.sketch.length > MAX_SKETCH_BYTES) return fail(PITCH_ERRORS.sketchTooLarge);
    const mime = detectImageMime(input.sketch);
    if (!mime) return fail(PITCH_ERRORS.sketchType);
    sketch = { bytes: input.sketch, mime };
  }

  return { ok: true, participantId: input.participantId, problem, hmw, idea, html, linkUrl, sketch };
}
