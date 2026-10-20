// Server-side validation tests for the Prompt Battle portal.
// Run: npm test   (Node 22.18+/24 strips the TypeScript types natively)
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ERRORS,
  MAX_HTML_BYTES,
  MAX_PROMPT_CHARS,
  validateSubmission,
} from "../lib/promptBattle.ts";

const ID = "11111111-1111-4111-8111-111111111111";
const PARTICIPANTS = new Set([ID]);
const enc = (s) => new TextEncoder().encode(s);
const file = (name, content, type = "text/html") => ({
  name,
  type,
  bytes: typeof content === "string" ? enc(content) : content,
});
const base = { participantId: ID, prompt: "สร้างเว็บ", pastedHtml: "", file: null, aiTools: ["Claude"] };
const check = (overrides) => validateSubmission({ ...base, ...overrides }, PARTICIPANTS);

test("accepts an uploaded .html file", () => {
  const r = check({ file: file("index.html", "<h1>hi</h1>") });
  assert.deepEqual(r, { ok: true, participantId: ID, prompt: "สร้างเว็บ", html: "<h1>hi</h1>", aiTools: ["Claude"] });
});

test("accepts pasted HTML and keeps prompt line breaks", () => {
  const r = check({ prompt: "line 1\r\nline 2\n\nline 4", pastedHtml: "<p>x</p>" });
  assert.equal(r.ok, true);
  assert.equal(r.prompt, "line 1\nline 2\n\nline 4");
});

test("rejects a non-participant id", () => {
  assert.deepEqual(check({ participantId: "22222222-2222-4222-8222-222222222222", pastedHtml: "<p>x</p>" }), { ok: false, error: ERRORS.participant });
  assert.equal(check({ participantId: undefined, pastedHtml: "<p>x</p>" }).ok, false);
});

test("rejects .txt and .js files, and HTML names with a wrong type", () => {
  assert.deepEqual(check({ file: file("notes.txt", "<p>x</p>", "text/plain") }), { ok: false, error: ERRORS.fileType });
  assert.deepEqual(check({ file: file("app.js", "alert(1)", "text/javascript") }), { ok: false, error: ERRORS.fileType });
  assert.deepEqual(check({ file: file("app.html", "alert(1)", "text/javascript") }), { ok: false, error: ERRORS.fileType });
});

test("rejects HTML over 2 MB (file and pasted)", () => {
  const big = "a".repeat(MAX_HTML_BYTES + 1);
  assert.deepEqual(check({ file: file("big.html", big) }), { ok: false, error: ERRORS.tooLarge });
  assert.deepEqual(check({ pastedHtml: big }), { ok: false, error: ERRORS.tooLarge });
  // Thai is 3 bytes per char in UTF-8: the byte limit applies, not the char count.
  assert.deepEqual(check({ pastedHtml: "ก".repeat(MAX_HTML_BYTES / 3 + 1) }), { ok: false, error: ERRORS.tooLarge });
  assert.equal(check({ file: file("ok.html", "a".repeat(MAX_HTML_BYTES)) }).ok, true);
});

test("rejects binary files renamed to .html", () => {
  assert.deepEqual(check({ file: file("img.html", new Uint8Array([0xff, 0xd8, 0xff, 0xe0])) }), { ok: false, error: ERRORS.notText });
  assert.deepEqual(check({ file: file("nul.html", "<p>\0</p>") }), { ok: false, error: ERRORS.notText });
});

test("requires a prompt within the limit", () => {
  assert.deepEqual(check({ prompt: "  \n ", pastedHtml: "<p>x</p>" }), { ok: false, error: ERRORS.prompt });
  assert.deepEqual(check({ prompt: "x".repeat(MAX_PROMPT_CHARS + 1), pastedHtml: "<p>x</p>" }), { ok: false, error: ERRORS.promptTooLong });
});

test("requires exactly one HTML source", () => {
  assert.deepEqual(check({}), { ok: false, error: ERRORS.htmlMissing });
  assert.deepEqual(check({ pastedHtml: "<p>x</p>", file: file("a.html", "<p>y</p>") }), { ok: false, error: ERRORS.htmlBoth });
  assert.deepEqual(check({ file: file("empty.html", "   ") }), { ok: false, error: ERRORS.htmlMissing });
});

test("requires at least one AI tool and normalizes them", () => {
  const html = "<p>x</p>";
  assert.deepEqual(check({ pastedHtml: html, aiTools: [] }), { ok: false, error: ERRORS.aiTools });
  assert.deepEqual(check({ pastedHtml: html, aiTools: ["  "] }), { ok: false, error: ERRORS.aiTools });
  assert.deepEqual(
    check({ pastedHtml: html, aiTools: ["chatgpt", " Claude ", "CLAUDE", "Copilot"] }).aiTools,
    ["ChatGPT", "Claude", "Copilot"],
  );
});

test("rejects bad AI tool values", () => {
  const html = "<p>x</p>";
  assert.deepEqual(check({ pastedHtml: html, aiTools: ["x".repeat(41)] }), { ok: false, error: ERRORS.aiToolsInvalid });
  assert.deepEqual(check({ pastedHtml: html, aiTools: ["a\nb"] }), { ok: false, error: ERRORS.aiToolsInvalid });
  assert.deepEqual(check({ pastedHtml: html, aiTools: [{}] }), { ok: false, error: ERRORS.aiToolsInvalid });
  assert.deepEqual(check({ pastedHtml: html, aiTools: ["a", "b", "c", "d", "e", "f", "g"] }), { ok: false, error: ERRORS.aiToolsInvalid });
});
