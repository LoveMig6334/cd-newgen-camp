// Server-side validation tests for Prototype PITCH submissions.
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_HMW_CHARS,
  MAX_SKETCH_BYTES,
  PITCH_ERRORS,
  detectImageMime,
  normalizeLink,
  validatePitch,
} from "../lib/pitch.ts";
import { ERRORS, MAX_HTML_BYTES } from "../lib/promptBattle.ts";

const ID = "11111111-1111-4111-8111-111111111111";
const enc = (s) => new TextEncoder().encode(s);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const WEBP = new Uint8Array([...enc("RIFF"), 1, 2, 3, 4, ...enc("WEBPVP8 ")]);
const base = {
  participantId: ID,
  problem: "นักเรียนลืมการบ้าน",
  hmw: "เราจะช่วยให้นักเรียนจำการบ้านได้อย่างไร",
  idea: "แอปเตือนการบ้าน",
  pastedHtml: "<h1>prototype</h1>",
  file: null,
  link: "",
  sketch: null,
};
const check = (o) => validatePitch({ ...base, ...o }, new Set([ID]));

test("accepts pasted HTML and keeps line breaks in text fields", () => {
  const r = check({ problem: "บรรทัด 1\r\nบรรทัด 2" });
  assert.equal(r.ok, true);
  assert.equal(r.problem, "บรรทัด 1\nบรรทัด 2");
  assert.equal(r.html, "<h1>prototype</h1>");
  assert.equal(r.linkUrl, null);
});

test("accepts a link-only prototype and normalizes it", () => {
  const r = check({ pastedHtml: "", link: "  https://www.figma.com/proto/abc?x=1 " });
  assert.equal(r.ok, true);
  assert.equal(r.html, null);
  assert.equal(r.linkUrl, "https://www.figma.com/proto/abc?x=1");
});

test("rejects a non-participant id", () => {
  assert.deepEqual(check({ participantId: "22222222-2222-4222-8222-222222222222" }), { ok: false, error: ERRORS.participant });
});

test("requires problem, HMW and idea within limits", () => {
  assert.deepEqual(check({ problem: " " }), { ok: false, error: PITCH_ERRORS.problem });
  assert.deepEqual(check({ hmw: "" }), { ok: false, error: PITCH_ERRORS.hmw });
  assert.deepEqual(check({ idea: undefined }), { ok: false, error: PITCH_ERRORS.idea });
  assert.equal(check({ hmw: "x".repeat(MAX_HMW_CHARS + 1) }).ok, false);
});

test("rejects .js / .txt uploads and HTML over 2 MB", () => {
  const file = (name, content, type) => ({ name, type, bytes: enc(content) });
  assert.deepEqual(check({ pastedHtml: "", file: file("app.js", "alert(1)", "text/javascript") }), { ok: false, error: ERRORS.fileType });
  assert.deepEqual(check({ pastedHtml: "", file: file("notes.txt", "hi", "text/plain") }), { ok: false, error: ERRORS.fileType });
  assert.deepEqual(check({ pastedHtml: "a".repeat(MAX_HTML_BYTES + 1) }), { ok: false, error: ERRORS.tooLarge });
  assert.deepEqual(check({ pastedHtml: "", file: file("big.html", "a".repeat(MAX_HTML_BYTES + 1), "text/html") }), { ok: false, error: ERRORS.tooLarge });
  assert.equal(check({ pastedHtml: "", file: file("index.html", "<p>ok</p>", "text/html") }).html, "<p>ok</p>");
});

test("requires HTML or a link", () => {
  assert.deepEqual(check({ pastedHtml: "", link: "" }), { ok: false, error: PITCH_ERRORS.prototype });
});

test("rejects non-http(s) links", () => {
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:x", "file:///etc/passwd", "ftp://x.com", "//evil.com", "https://", "https://a b.com", "java\tscript:alert(1)"]) {
    assert.deepEqual(check({ link: bad }), { ok: false, error: PITCH_ERRORS.link }, bad);
    assert.equal(normalizeLink(bad), null, bad);
  }
  assert.equal(normalizeLink("HTTP://Example.com"), "http://example.com/");
});

test("sketch: magic bytes decide, not the file name", () => {
  assert.equal(detectImageMime(PNG), "image/png");
  assert.equal(detectImageMime(JPEG), "image/jpeg");
  assert.equal(detectImageMime(WEBP), "image/webp");
  assert.equal(detectImageMime(enc("<html><script>alert(1)</script>")), null);
  // A ".png" that is really HTML is rejected.
  assert.deepEqual(check({ sketch: enc("<!DOCTYPE html><script>alert(1)</script>") }), { ok: false, error: PITCH_ERRORS.sketchType });
  assert.deepEqual(check({ sketch: new Uint8Array([...enc("RIFF"), 0, 0, 0, 0, ...enc("WAVE")]) }), { ok: false, error: PITCH_ERRORS.sketchType });
  const ok = check({ sketch: JPEG });
  assert.equal(ok.ok, true);
  assert.equal(ok.sketch.mime, "image/jpeg");
});

test("sketch over 5 MB is rejected", () => {
  const big = new Uint8Array(MAX_SKETCH_BYTES + 1);
  big.set(PNG);
  assert.deepEqual(check({ sketch: big }), { ok: false, error: PITCH_ERRORS.sketchTooLarge });
});
