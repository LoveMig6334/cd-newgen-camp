// Tests for Truth or Dare: bank parsing, no-repeat drawing, finger chooser.
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_TOD_SETTINGS,
  FINGER_COLORS,
  PICK_RED,
  categoryKey,
  drawPrompt,
  listCategories,
  nextColor,
  parseBank,
  pickFinger,
  promptsLeft,
  sanitizeTodSettings,
} from "../lib/truthOrDare.ts";
import { TOD_BANK_TEXT, TOD_PROMPTS } from "../lib/truthOrDareQuestions.ts";

const TODAY = "2026-11-13";
const empty = { day: TODAY, keys: [] };

test("parseBank reads kinds, categories, drops junk and duplicates", () => {
  const bank = parseBank(`ignored before header
# ความจริง: อุ่นเครื่อง
- ข้อหนึ่ง
2) ข้อสอง

ข้อหนึ่ง
# คำท้า: ท้าเบาๆ
ทำหน้าตลก
# not a section
`);
  assert.deepEqual(
    bank.map((p) => [p.kind, p.category, p.text]),
    [
      ["truth", "อุ่นเครื่อง", "ข้อหนึ่ง"],
      ["truth", "อุ่นเครื่อง", "ข้อสอง"],
      ["dare", "ท้าเบาๆ", "ทำหน้าตลก"],
    ],
  );
  assert.ok(bank.every((p) => p.id.startsWith(`${p.kind}:`)));
});

test("standard bank is big, unique and has both kinds", () => {
  const lines = TOD_BANK_TEXT.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  assert.equal(TOD_PROMPTS.length, lines.length, "every line parses to its own prompt");
  assert.equal(new Set(TOD_PROMPTS.map((p) => p.id)).size, TOD_PROMPTS.length);
  const truths = TOD_PROMPTS.filter((p) => p.kind === "truth").length;
  const dares = TOD_PROMPTS.filter((p) => p.kind === "dare").length;
  assert.ok(truths >= 400, `truths: ${truths}`);
  assert.ok(dares >= 250, `dares: ${dares}`);
  assert.ok(listCategories(TOD_PROMPTS, "truth").some((c) => c.name === "เจาะใจ"));
  assert.ok(TOD_PROMPTS.every((p) => p.text.length >= 8 && p.text.length <= 140), "no blank or runaway prompts");
});

test("drawPrompt never repeats within a day until the pool runs out", () => {
  const bank = parseBank("# ความจริง: ก\na1\na2\na3\n# ความจริง: ข\nb1\n# คำท้า: ค\nd1");
  let used = empty;
  const seen = new Set();
  for (let i = 0; i < 4; i++) {
    const d = drawPrompt(bank, "truth", DEFAULT_TOD_SETTINGS, used, TODAY);
    assert.ok(d && !d.recycled);
    assert.equal(d.prompt.kind, "truth");
    assert.ok(!seen.has(d.prompt.id), "no repeat");
    seen.add(d.prompt.id);
    used = d.used;
  }
  assert.equal(promptsLeft(bank, "truth", DEFAULT_TOD_SETTINGS, used, TODAY), 0);
  const again = drawPrompt(bank, "truth", DEFAULT_TOD_SETTINGS, used, TODAY);
  assert.ok(again.recycled, "reshuffles once everything was used");
  // A log from yesterday doesn't count.
  const fresh = drawPrompt(bank, "truth", DEFAULT_TOD_SETTINGS, { day: "2026-11-12", keys: [...seen] }, TODAY);
  assert.ok(!fresh.recycled);
});

test("drawPrompt picks categories evenly and respects switched-off ones", () => {
  const bank = parseBank(
    "# ความจริง: ใหญ่\n" + Array.from({ length: 50 }, (_, i) => `big${i}`).join("\n") + "\n# ความจริง: เล็ก\nsmall1",
  );
  // random() = 0.99 → last category group, i.e. the small one, despite 50:1 sizes.
  assert.equal(drawPrompt(bank, "truth", DEFAULT_TOD_SETTINGS, empty, TODAY, null, () => 0.99).prompt.category, "เล็ก");
  const off = { ...DEFAULT_TOD_SETTINGS, off: [categoryKey("truth", "เล็ก")] };
  for (let i = 0; i < 20; i++) {
    assert.equal(drawPrompt(bank, "truth", off, empty, TODAY).prompt.category, "ใหญ่");
  }
  const allOff = { ...DEFAULT_TOD_SETTINGS, off: [categoryKey("truth", "เล็ก"), categoryKey("truth", "ใหญ่")] };
  assert.equal(drawPrompt(bank, "truth", allOff, empty, TODAY), null);
  assert.equal(drawPrompt(bank, "dare", DEFAULT_TOD_SETTINGS, empty, TODAY), null);
});

test("skipping avoids the card that is on screen", () => {
  const bank = parseBank("# คำท้า: ก\nx1\nx2");
  const [a] = bank;
  for (let i = 0; i < 20; i++) {
    const d = drawPrompt(bank, "dare", DEFAULT_TOD_SETTINGS, { day: TODAY, keys: [] }, TODAY, a.id);
    assert.notEqual(d.prompt.id, a.id);
  }
});

test("sanitizeTodSettings tolerates junk", () => {
  assert.deepEqual(sanitizeTodSettings(null), DEFAULT_TOD_SETTINGS);
  assert.deepEqual(sanitizeTodSettings({ off: ["truth:ก", 3, "truth:ก", ""], sound: false }), {
    off: ["truth:ก"],
    sound: false,
  });
});

test("finger colours: lowest free one, never the pick red", () => {
  assert.equal(nextColor([]), 0);
  assert.equal(nextColor([0, 1, 3]), 2);
  assert.equal(nextColor(FINGER_COLORS.map((_, i) => i)), 0);
  assert.ok(!FINGER_COLORS.map((c) => c.toLowerCase()).includes(PICK_RED.toLowerCase()));
});

test("pickFinger is uniform over the fingers on screen", () => {
  const counts = new Map();
  const ids = [11, 22, 33, 44, 55];
  for (let i = 0; i < 10_000; i++) {
    const id = pickFinger(ids);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const id of ids) {
    const n = counts.get(id) ?? 0;
    assert.ok(n > 1700 && n < 2300, `${id}: ${n}`);
  }
  assert.throws(() => pickFinger([]));
});
