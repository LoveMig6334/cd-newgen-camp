// Tests for the Secret Santa helpers (the draw itself is SQL).
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_NAMES, errorText, parseNames, splitName, toStatus } from "../lib/secretSanta.ts";

test("parseNames: one per line, trims, collapses spaces, skips blanks", () => {
  const { names, error } = parseNames("  ริกะ   Rika \n\nแม็กซ์ Max\r\nมิก Mix,  ");
  assert.equal(error, null);
  assert.deepEqual(names, ["ริกะ Rika", "แม็กซ์ Max", "มิก Mix"]);
});

test("parseNames: the default list is valid", () => {
  const { names, error } = parseNames(DEFAULT_NAMES.join("\n"));
  assert.equal(error, null);
  assert.equal(names.length, 10);
});

test("parseNames: too few, duplicates (case-insensitive), too long", () => {
  assert.match(parseNames("a\nb").error, /อย่างน้อย 3/);
  assert.match(parseNames("Max\nmix\nmax").error, /ซ้ำ/);
  assert.match(parseNames(`a\nb\n${"x".repeat(61)}`).error, /ยาวเกิน/);
});

test("splitName: Thai + English subtitle", () => {
  assert.deepEqual(splitName("ริกะ Rika"), { main: "ริกะ", sub: "Rika" });
  assert.deepEqual(splitName("พี่เซอ Serena"), { main: "พี่เซอ", sub: "Serena" });
  assert.deepEqual(splitName("Max"), { main: "Max", sub: null });
  assert.deepEqual(splitName("John Smith"), { main: "John Smith", sub: null });
  assert.deepEqual(splitName("บัว"), { main: "บัว", sub: null });
});

test("toStatus: RPC rows → status, empty → null", () => {
  assert.equal(toStatus([]), null);
  assert.equal(toStatus(null), null);
  assert.deepEqual(toStatus([{ round_id: "r1", total: 10, drawn_count: 3, waiting: ["a", 2, "b"] }]), {
    roundId: "r1",
    total: 10,
    drawnCount: 3,
    waiting: ["a", "b"],
  });
});

test("errorText: known codes map to Thai, unknown falls back", () => {
  assert.equal(errorText("already_drawn"), "ชื่อนี้สุ่มไปแล้ว");
  assert.match(errorText("weird"), /ผิดพลาด/);
  assert.match(errorText(undefined), /ผิดพลาด/);
});
