// Server-side validation tests for Final Project submissions.
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FINAL_PROJECT_ERRORS,
  checkDeployUrl,
  deckPathOwner,
  isLocalHost,
  isPdf,
  isPdfName,
  validateFinalProject,
} from "../lib/finalProject.ts";
import { ERRORS } from "../lib/promptBattle.ts";

const ID = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const FILE = "33333333-3333-4333-8333-333333333333";
const base = {
  participantId: ID,
  deployUrl: "https://my-app.vercel.app",
  deckPath: `${ID}/${FILE}.pdf`,
};
const check = (o) => validateFinalProject({ ...base, ...o }, new Set([ID, OTHER]));

test("accepts a deployed link and the student's own deck", () => {
  const r = check({});
  assert.equal(r.ok, true);
  assert.equal(r.deployUrl, "https://my-app.vercel.app/");
  assert.equal(r.deckPath, base.deckPath);
});

test("rejects unknown participants", () => {
  assert.deepEqual(check({ participantId: "nope" }), { ok: false, error: ERRORS.participant });
  assert.deepEqual(check({ participantId: null }), { ok: false, error: ERRORS.participant });
});

test("deploy link is required and must be public http(s)", () => {
  assert.deepEqual(check({ deployUrl: "  " }), { ok: false, error: FINAL_PROJECT_ERRORS.deployUrl });
  assert.deepEqual(check({ deployUrl: undefined }), { ok: false, error: FINAL_PROJECT_ERRORS.deployUrl });
  for (const bad of ["javascript:alert(1)", "my-app.vercel.app", "ftp://x.com", "data:text/html,hi"]) {
    assert.deepEqual(check({ deployUrl: bad }), { ok: false, error: FINAL_PROJECT_ERRORS.deployScheme }, bad);
  }
  for (const local of [
    "http://localhost:3000",
    "http://127.0.0.1:5500/index.html",
    "http://192.168.1.20:8080",
    "http://10.0.0.5",
    "http://[::1]:3000",
    "http://my-mac.local",
  ]) {
    assert.deepEqual(check({ deployUrl: local }), { ok: false, error: FINAL_PROJECT_ERRORS.deployLocal }, local);
  }
});

test("isLocalHost leaves public hosts alone", () => {
  for (const host of ["fcbarcelona.com", "172.32.0.1", "8.8.8.8", "example.github.io", "fdsa.netlify.app"]) {
    assert.equal(isLocalHost(host), false, host);
  }
  assert.equal(isLocalHost("172.20.1.1"), true);
  assert.equal(isLocalHost("app.localhost"), true);
  assert.equal(checkDeployUrl(" https://Example.com/app ").url, "https://example.com/app");
});

test("deck must be a uuid .pdf path inside the student's own folder", () => {
  const bad = { ok: false, error: FINAL_PROJECT_ERRORS.deck };
  assert.deepEqual(check({ deckPath: `${OTHER}/${FILE}.pdf` }), bad);
  assert.deepEqual(check({ deckPath: `${ID}/${FILE}.html` }), bad);
  assert.deepEqual(check({ deckPath: `${ID}/../${OTHER}/${FILE}.pdf` }), bad);
  assert.deepEqual(check({ deckPath: `${ID}/deck.pdf` }), bad);
  assert.deepEqual(check({ deckPath: "" }), bad);
  assert.deepEqual(check({ deckPath: null }), bad);
  assert.equal(deckPathOwner(base.deckPath), ID);
  assert.equal(deckPathOwner(`x${base.deckPath}`), null);
});

test("PDF detection by magic bytes and name", () => {
  assert.equal(isPdf(new TextEncoder().encode("%PDF-1.7\n...")), true);
  assert.equal(isPdf(new TextEncoder().encode("<html>")), false);
  assert.equal(isPdf(new Uint8Array([0x25, 0x50])), false);
  assert.equal(isPdfName("Pitch Deck.PDF"), true);
  assert.equal(isPdfName("deck.pdf.exe"), false);
});
