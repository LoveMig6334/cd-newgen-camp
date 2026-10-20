// Prompt Battle (CD AI Innovation Bootcamp 2026): limits and server-side
// validation shared by the submit form and /api/prompt-battle.
// Kept free of imports so `npm test` can load it with plain Node.

export const PROMPT_BATTLE_EVENT = {
  year: 2026,
  slug: "next-gen-ai-academy",
} as const;

export const PROMPT_BATTLE_PATH = `/events/${PROMPT_BATTLE_EVENT.year}/${PROMPT_BATTLE_EVENT.slug}/prompt-battle`;

/** Max HTML size (file or pasted), in UTF-8 bytes. */
export const MAX_HTML_BYTES = 2 * 1024 * 1024;
export const MAX_PROMPT_CHARS = 10_000;
/** Reject request bodies above this before parsing them. */
export const MAX_REQUEST_BYTES = MAX_HTML_BYTES + MAX_PROMPT_CHARS * 4 + 64 * 1024;

const ALLOWED_FILE_TYPES = ["", "text/html", "application/octet-stream"];

export const ERRORS = {
  participant: "กรุณาเลือกชื่อของตนเองจากรายชื่อผู้เข้าร่วมค่าย",
  prompt: "กรุณากรอก Prompt ที่ใช้",
  promptTooLong: `Prompt ยาวเกิน ${MAX_PROMPT_CHARS.toLocaleString()} ตัวอักษร`,
  htmlMissing: "กรุณาอัปโหลดไฟล์ .html หรือวางโค้ด HTML",
  htmlBoth: "กรุณาเลือกอย่างใดอย่างหนึ่ง: อัปโหลดไฟล์ หรือ วางโค้ด HTML",
  fileType: "รับเฉพาะไฟล์ .html เท่านั้น",
  tooLarge: "ไฟล์/โค้ด HTML ต้องมีขนาดไม่เกิน 2 MB",
  notText: "ไฟล์นี้ไม่ใช่ไฟล์ HTML ที่อ่านได้ (ต้องเป็นข้อความ UTF-8)",
} as const;

export interface UploadedHtmlFile {
  name: string;
  type: string;
  bytes: Uint8Array;
}

export interface SubmissionInput {
  participantId: unknown;
  prompt: unknown;
  pastedHtml: unknown;
  file: UploadedHtmlFile | null;
}

export type ValidationResult =
  | { ok: true; participantId: string; prompt: string; html: string }
  | { ok: false; error: string };

export interface ParticipantName {
  first_name: string;
  last_initial: string | null;
  nickname: string | null;
  classroom: string | null;
}

/** e.g. "ต้น — ธนวัฒน์ ส. (ม.4/1)" */
export function participantLabel(p: ParticipantName): string {
  const name = `${p.first_name}${p.last_initial ? ` ${p.last_initial}.` : ""}`;
  const room = p.classroom ? ` (ม.${p.classroom})` : "";
  return p.nickname ? `${p.nickname} — ${name}${room}` : `${name}${room}`;
}

/** Submission time as shown to TAs, e.g. "10:32" (camp is in Thailand). */
export const formatBangkokTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });

/** True when the file name and browser-reported type look like HTML. */
export function isHtmlFile(name: string, type: string): boolean {
  return /\.html?$/i.test(name) && ALLOWED_FILE_TYPES.includes(type.toLowerCase());
}

export function htmlByteLength(html: string): number {
  return new TextEncoder().encode(html).length;
}

/**
 * Validate a submission against this year's participant ids.
 * Returns the normalized prompt and HTML to store.
 */
export function validateSubmission(
  input: SubmissionInput,
  participantIds: ReadonlySet<string>,
): ValidationResult {
  const fail = (error: string): ValidationResult => ({ ok: false, error });

  if (typeof input.participantId !== "string" || !participantIds.has(input.participantId)) {
    return fail(ERRORS.participant);
  }

  const prompt =
    typeof input.prompt === "string"
      ? input.prompt.replace(/\r\n?/g, "\n").trim()
      : "";
  if (!prompt) return fail(ERRORS.prompt);
  if (prompt.length > MAX_PROMPT_CHARS) return fail(ERRORS.promptTooLong);

  const pasted = typeof input.pastedHtml === "string" ? input.pastedHtml : "";
  const hasPasted = pasted.trim().length > 0;
  if (input.file && hasPasted) return fail(ERRORS.htmlBoth);

  let html: string;
  if (input.file) {
    if (!isHtmlFile(input.file.name, input.file.type)) return fail(ERRORS.fileType);
    if (input.file.bytes.length > MAX_HTML_BYTES) return fail(ERRORS.tooLarge);
    try {
      html = new TextDecoder("utf-8", { fatal: true }).decode(input.file.bytes);
    } catch {
      return fail(ERRORS.notText);
    }
    if (html.includes("\0")) return fail(ERRORS.notText);
  } else if (hasPasted) {
    html = pasted;
    if (htmlByteLength(html) > MAX_HTML_BYTES) return fail(ERRORS.tooLarge);
  } else {
    return fail(ERRORS.htmlMissing);
  }

  if (!html.trim()) return fail(ERRORS.htmlMissing);

  return { ok: true, participantId: input.participantId, prompt, html };
}
