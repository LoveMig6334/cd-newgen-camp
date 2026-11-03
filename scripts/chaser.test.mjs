// Tests for the Chaser quiz game rules.
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_CATEGORY,
  DEFAULT_SETTINGS,
  addUsed,
  buildDeck,
  chaserReducer,
  cleanCategory,
  currentQuestion,
  dayKey,
  formatClock,
  formatQuestions,
  listCategories,
  mixByCategory,
  newGame,
  parseQuestions,
  questionKey,
  sanitizeBank,
  sanitizeSettings,
  sanitizeUsed,
  secondsLeft,
  shuffle,
  toDisplayState,
} from "../lib/chaser.ts";
import { STANDARD_BANK_TEXT, STANDARD_QUESTIONS } from "../lib/chaserQuestions.ts";

const deck = Array.from({ length: 5 }, (_, i) => ({ id: `q${i}`, question: `Q${i}`, answer: `A${i}`, category: "ทดสอบ" }));

/** Deterministic [0, 1) generator (mulberry32) so deck tests are repeatable. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `perCat` questions in each of `cats` categories. */
const bankOf = (cats, perCat) =>
  cats.flatMap((c) =>
    Array.from({ length: perCat }, (_, i) => ({ id: `${c}${i}`, question: `${c} คำถาม ${i}`, answer: "x", category: c })),
  );
const settings = { ...DEFAULT_SETTINGS, round1Seconds: 120, round2Seconds: 120 };
const run = (game, ...actions) => actions.reduce(chaserReducer, game);
const v = (verdict) => ({ type: "verdict", verdict });
const tick = (ms) => ({ type: "tick", ms });
const C = v("correct"), W = v("wrong"), S = v("skip");

/** Round 1 started and running. */
const round1 = () => run(newGame(settings), { type: "start", settings, deck }, { type: "go" });
/** Round 2 running with the given target. */
function round2(target) {
  const g = run(round1(), ...Array(target).fill(C), tick(120_000));
  assert.equal(g.phase, "interlude");
  return run(g, { type: "beginRound2" });
}

test("round 1: correct +1, wrong and skip score nothing, every verdict moves on", () => {
  const g = run(round1(), C, W, S, C);
  assert.equal(g.playerScore, 2);
  assert.equal(g.cursor, 4);
  assert.equal(currentQuestion(g).id, "q4");
});

test("round 1 waits for go; verdicts and ticks are ignored until then", () => {
  const g = run(newGame(settings), { type: "start", settings, deck });
  assert.equal(g.phase, "round1");
  assert.equal(g.running, false);
  const same = run(g, C, tick(5000));
  assert.equal(same.playerScore, 0);
  assert.equal(same.remainingMs, 120_000);
});

test("start needs at least one question", () => {
  const g = run(newGame(settings), { type: "start", settings, deck: [] });
  assert.equal(g.phase, "setup");
});

test("round 1 time-out: score becomes the target and the clock waits", () => {
  const g = run(round1(), C, C, C, tick(60_000), tick(60_000));
  assert.equal(g.phase, "interlude");
  assert.equal(g.playerScore, 3);
  assert.equal(g.running, false);
  assert.equal(g.event.kind, "round-over");
  // Nothing runs before the host starts round 2.
  assert.equal(run(g, tick(10_000), C).phase, "interlude");
  const r2 = run(g, { type: "beginRound2" });
  assert.equal(r2.phase, "round2");
  assert.equal(r2.running, true);
  assert.equal(r2.remainingMs, 120_000);
  assert.equal(r2.cursor, 4, "the unanswered question at the buzzer is skipped");
});

test("zero points in round 1: Chaser wins at once, no round 2", () => {
  const g = run(round1(), W, S, tick(120_000));
  assert.equal(g.phase, "result");
  assert.equal(g.winner, "chaser");
  assert.equal(g.endReason, "zero");
  assert.equal(g.event.kind, "game-over");
});

test("round 2: Chaser wins the moment the score reaches the target", () => {
  const g = run(round2(3), C, tick(30_000), C, tick(10_500), C);
  assert.equal(g.phase, "result");
  assert.equal(g.winner, "chaser");
  assert.equal(g.endReason, "caught");
  assert.equal(g.chaserScore, 3);
  assert.equal(g.chaserTimeLeftMs, 79_500);
  assert.equal(g.running, false);
  // Further input does nothing.
  assert.deepEqual(run(g, C, tick(5000), { type: "go" }), g);
});

test("round 2: Chaser skip moves on without points or Pushback", () => {
  const g = run(round2(3), S);
  assert.equal(g.chaserScore, 0);
  assert.equal(g.pushback, false);
  assert.equal(g.event.kind, "skip");
});

test("Pushback: wrong stops the clock and keeps the same question", () => {
  const before = run(round2(4), C, C);
  const g = run(before, W);
  assert.equal(g.pushback, true);
  assert.equal(g.running, false);
  assert.equal(g.cursor, before.cursor);
  assert.equal(g.event.kind, "pushback");
  // Clock frozen, pause/go can't restart it.
  const frozen = run(g, tick(50_000), { type: "go" }, tick(50_000));
  assert.equal(frozen.remainingMs, g.remainingMs);
  assert.equal(frozen.pushback, true);
});

test("Pushback: player correct moves the Chaser back one, clock resumes", () => {
  const g = run(round2(4), C, C, W, C);
  assert.equal(g.chaserScore, 1);
  assert.equal(g.pushback, false);
  assert.equal(g.running, true);
  assert.equal(g.pushbackAttempts, 1);
  assert.equal(g.pushbackWins, 1);
  assert.equal(g.event.kind, "pushback-success");
  assert.equal(run(g, tick(1000)).remainingMs, g.remainingMs - 1000);
});

test("Pushback: never below zero", () => {
  const g = run(round2(2), W, C);
  assert.equal(g.chaserScore, 0);
  assert.equal(g.pushbackWins, 1);
});

test("Pushback: player wrong or skip gives nobody a point", () => {
  for (const verdict of [W, S]) {
    const g = run(round2(4), C, W, verdict);
    assert.equal(g.chaserScore, 1);
    assert.equal(g.pushbackWins, 0);
    assert.equal(g.pushback, false);
    assert.equal(g.running, true);
    assert.equal(g.event.kind, "pushback-fail");
  }
});

test("Pushback answer counts even if the host paused right before", () => {
  const g = run(round2(4), W, { type: "pause" }, C);
  assert.equal(g.pushback, false);
  assert.equal(g.pushbackWins, 1);
});

test("round 2 time-out: player wins", () => {
  const g = run(round2(5), C, C, tick(119_999), tick(1));
  assert.equal(g.phase, "result");
  assert.equal(g.winner, "player");
  assert.equal(g.endReason, "timeout");
  assert.equal(g.chaserTimeLeftMs, null);
});

test("pause freezes the clock and blocks verdicts until go", () => {
  const g = run(round1(), tick(1000), { type: "pause" }, tick(30_000), C);
  assert.equal(g.remainingMs, 119_000);
  assert.equal(g.playerScore, 0);
  const resumed = run(g, { type: "go" }, C, tick(500));
  assert.equal(resumed.playerScore, 1);
  assert.equal(resumed.remainingMs, 118_500);
});

test("event seq increases on every event (so repeated sounds still fire)", () => {
  const a = run(round1(), C);
  const b = run(a, C);
  assert.equal(a.event.kind, "correct");
  assert.equal(b.event.seq, a.event.seq + 1);
});

test("questions cycle when the deck runs out", () => {
  const g = run(round1(), ...Array(7).fill(S));
  assert.equal(currentQuestion(g).id, "q2");
});

test("reset returns to setup and keeps the settings", () => {
  const custom = { ...settings, playerName: "มิว" };
  const g = run(newGame(custom), { type: "start", settings: custom, deck }, { type: "go" }, C, { type: "reset" });
  assert.equal(g.phase, "setup");
  assert.equal(g.playerScore, 0);
  assert.equal(g.settings.playerName, "มิว");
});

test("clock formatting rounds up", () => {
  assert.equal(formatClock(120_000), "2:00");
  assert.equal(formatClock(59_001), "1:00");
  assert.equal(formatClock(9_000), "0:09");
  assert.equal(formatClock(1), "0:01");
  assert.equal(formatClock(0), "0:00");
  assert.equal(secondsLeft(-50), 0);
});

test("settings are sanitized", () => {
  assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(
    sanitizeSettings({ playerName: "  ทีมฟ้า ", chaserName: "", round1Seconds: 3, round2Seconds: "9999" }),
    { playerName: "ทีมฟ้า", chaserName: "Chaser", round1Seconds: 10, round2Seconds: 600 },
  );
  assert.equal(sanitizeSettings({ round1Seconds: 90.4 }).round1Seconds, 90);
  assert.equal(sanitizeSettings({ round1Seconds: "abc" }).round1Seconds, 120);
});

test("stored bank is sanitized", () => {
  assert.equal(sanitizeBank("nope"), null);
  assert.deepEqual(
    sanitizeBank([
      { id: "a", question: " Q ", answer: " A " },
      { id: "a", question: "dup", answer: "x" },
      { id: "b", question: "", answer: "x" },
      { id: 3, question: "Q", answer: "A" },
      { id: "c", question: "Q2", answer: "A2", category: "  ฟิสิกส์   ทดลอง " },
      null,
    ]),
    [
      { id: "a", question: "Q", answer: "A", category: DEFAULT_CATEGORY },
      { id: "c", question: "Q2", answer: "A2", category: "ฟิสิกส์ ทดลอง" },
    ],
  );
  assert.equal(cleanCategory("   "), DEFAULT_CATEGORY);
  assert.equal(cleanCategory("ก".repeat(50)).length, 30);
});

test("parseQuestions reads `q | a` and tab-separated lines", () => {
  const { questions, skipped } = parseQuestions(
    "1+1 เท่ากับ? | 2\n\nA|B คืออะไร | ตัวอักษร\r\nเมืองหลวงไทย\tกรุงเทพฯ\nไม่มีคำตอบ\n| ไม่มีคำถาม",
  );
  const c = DEFAULT_CATEGORY;
  assert.deepEqual(questions, [
    { question: "1+1 เท่ากับ?", answer: "2", category: c },
    { question: "A|B คืออะไร", answer: "ตัวอักษร", category: c },
    { question: "เมืองหลวงไทย", answer: "กรุงเทพฯ", category: c },
  ]);
  assert.equal(skipped, 2);
  assert.deepEqual(parseQuestions(formatQuestions(questions)).questions, questions);
});

test("parseQuestions: `# หมวด` headers and 3-column spreadsheet rows set the category", () => {
  const text = [
    "ก่อนหัวข้อ | 0",
    "# ฟิสิกส์",
    "หน่วยของแรง | นิวตัน",
    "ใน Python ใช้อะไรขึ้นต้นคอมเมนต์ | #",
    "## เกม ",
    "#แท็กในคำถาม | ใช่",
    "ชีววิทยา\tอวัยวะสูบฉีดเลือด\tหัวใจ",
    "สองคอลัมน์\tใช้หมวดปัจจุบัน",
    "#",
    "หลังหัวข้อว่าง | ได้",
  ].join("\n");
  const { questions, skipped } = parseQuestions(text, "เริ่มต้น");
  assert.equal(skipped, 0);
  assert.deepEqual(
    questions.map((q) => [q.category, q.question, q.answer]),
    [
      ["เริ่มต้น", "ก่อนหัวข้อ", "0"],
      ["ฟิสิกส์", "หน่วยของแรง", "นิวตัน"],
      ["ฟิสิกส์", "ใน Python ใช้อะไรขึ้นต้นคอมเมนต์", "#"],
      ["เกม", "#แท็กในคำถาม", "ใช่"],
      ["ชีววิทยา", "อวัยวะสูบฉีดเลือด", "หัวใจ"],
      ["เกม", "สองคอลัมน์", "ใช้หมวดปัจจุบัน"],
      [DEFAULT_CATEGORY, "หลังหัวข้อว่าง", "ได้"],
    ],
  );
  // format → parse keeps order and categories, even when they interleave.
  assert.deepEqual(parseQuestions(formatQuestions(questions)).questions, questions);
  assert.match(formatQuestions(questions), /^# เริ่มต้น\nก่อนหัวข้อ \| 0\n\n# ฟิสิกส์\n/);
});

test("listCategories counts in first-seen order", () => {
  assert.deepEqual(listCategories([{ category: "b" }, { category: "a" }, { category: "b" }]), [
    { name: "b", count: 2 },
    { name: "a", count: 1 },
  ]);
});

test("questionKey ignores spacing/case and differs between questions", () => {
  assert.equal(questionKey({ question: "  Hello   World " }), questionKey({ question: "hello world" }));
  assert.notEqual(questionKey({ question: "ข้อ 1" }), questionKey({ question: "ข้อ 2" }));
  assert.match(questionKey({ question: "x" }), /^[0-9a-z]+$/);
});

test("used log: only today's keys count, and a new day starts empty", () => {
  assert.equal(dayKey(new Date(2026, 10, 3, 23, 59)), "2026-11-03");
  assert.equal(dayKey(new Date(2026, 0, 9)), "2026-01-09");
  assert.deepEqual(sanitizeUsed(null, "2026-11-03"), { day: "2026-11-03", keys: [] });
  assert.deepEqual(sanitizeUsed({ day: "2026-11-02", keys: ["a"] }, "2026-11-03").keys, []);
  assert.deepEqual(sanitizeUsed({ day: "2026-11-03", keys: ["a", "a", 5, "", "b"] }, "2026-11-03").keys, ["a", "b"]);

  const log = addUsed({ day: "2026-11-03", keys: ["a"] }, "b", "2026-11-03");
  assert.deepEqual(log.keys, ["a", "b"]);
  assert.equal(addUsed(log, "b", "2026-11-03"), log, "same key twice is a no-op");
  assert.deepEqual(addUsed(log, "c", "2026-11-04"), { day: "2026-11-04", keys: ["c"] });
});

test("mixByCategory keeps every question and never repeats a category back-to-back when it can avoid it", () => {
  const bank = bankOf(["ก", "ข", "ค", "ง", "จ"], 10);
  for (let seed = 1; seed <= 20; seed++) {
    const out = mixByCategory(bank, seeded(seed));
    assert.deepEqual(out.map((q) => q.id).sort(), bank.map((q) => q.id).sort());
    for (let i = 2; i < out.length - 6; i++) {
      // Away from the very end (where only one category may be left), no category within 3 in a row.
      const window = new Set([out[i - 2].category, out[i - 1].category, out[i].category]);
      assert.equal(window.size, 3, `seed ${seed} at ${i}`);
    }
  }
});

test("mixByCategory spreads categories: every early stretch covers them all", () => {
  const cats = ["ก", "ข", "ค", "ง", "จ", "ฉ"];
  const bank = bankOf(cats, 20);
  for (let seed = 1; seed <= 10; seed++) {
    const first = mixByCategory(bank, seeded(seed)).slice(0, 24);
    for (const c of cats) {
      const n = first.filter((q) => q.category === c).length;
      assert.ok(n >= 2 && n <= 7, `seed ${seed}: ${c} appears ${n}× in the first 24`);
    }
  }
});

test("mixByCategory with one category is just a shuffle", () => {
  const bank = bankOf(["ก"], 8);
  assert.equal(mixByCategory(bank, seeded(3)).length, 8);
  assert.deepEqual(mixByCategory([], seeded(3)), []);
});

test("buildDeck: today's unused questions first, repeats only after them", () => {
  const bank = bankOf(["ก", "ข", "ค"], 5);
  const used = new Set(bank.filter((q, i) => i % 3 === 0).map(questionKey));
  const { deck, fresh } = buildDeck(bank, { used, random: seeded(7) });
  assert.equal(deck.length, bank.length);
  assert.equal(fresh, bank.length - used.size);
  assert.ok(deck.slice(0, fresh).every((q) => !used.has(questionKey(q))));
  assert.ok(deck.slice(fresh).every((q) => used.has(questionKey(q))));
});

test("buildDeck: categories switched off are left out, duplicate texts count once", () => {
  const bank = [...bankOf(["ก", "ข"], 4), { id: "dup", question: "ก  คำถาม 0", answer: "y", category: "ก" }];
  const { deck, fresh } = buildDeck(bank, { off: new Set(["ข"]), random: seeded(1) });
  assert.equal(fresh, 4);
  assert.deepEqual(deck.map((q) => q.category), ["ก", "ก", "ก", "ก"]);
  assert.ok(!deck.some((q) => q.id === "dup"));
  assert.deepEqual(buildDeck(bank, { off: new Set(["ก", "ข"]) }), { deck: [], fresh: 0 });
});

test("replaying the same day never repeats a question until the bank runs out", () => {
  const bank = bankOf(["ก", "ข", "ค", "ง"], 10);
  let used = new Set();
  const asked = [];
  for (let game = 0; game < 4; game++) {
    const { deck } = buildDeck(bank, { used, random: seeded(100 + game) });
    for (const q of deck.slice(0, 10)) {
      asked.push(q.id);
      used = new Set([...used, questionKey(q)]);
    }
  }
  assert.equal(new Set(asked).size, 40, "4 games × 10 questions, all different");
  // Bank exhausted: the next game still gets a full deck (repeats allowed again).
  assert.equal(buildDeck(bank, { used }).deck.length, 40);
  assert.equal(buildDeck(bank, { used }).fresh, 0);
});

test("standard bank: every line parses, ids are unique, categories are balanced", () => {
  assert.equal(parseQuestions(STANDARD_BANK_TEXT).skipped, 0);
  const ids = new Set(STANDARD_QUESTIONS.map((q) => q.id));
  assert.equal(ids.size, STANDARD_QUESTIONS.length, "no duplicate question texts");
  assert.ok(STANDARD_QUESTIONS.length >= 300);
  const cats = listCategories(STANDARD_QUESTIONS);
  assert.ok(cats.length >= 15);
  assert.ok(cats.every((c) => c.name !== DEFAULT_CATEGORY && c.count >= 15), JSON.stringify(cats));
  assert.deepEqual(sanitizeBank(STANDARD_QUESTIONS), STANDARD_QUESTIONS, "already clean");
});

test("shuffle keeps every item", () => {
  const list = Array.from({ length: 50 }, (_, i) => i);
  const out = shuffle(list);
  assert.deepEqual([...out].sort((a, b) => a - b), list);
  assert.deepEqual(list[0], 0, "input untouched");
});

test("display state never carries answers and hides the question while paused", () => {
  const ready = run(newGame(settings), { type: "start", settings, deck });
  assert.equal(toDisplayState(ready).question, null, "hidden before the clock starts");
  const running = run(ready, { type: "go" });
  const d = toDisplayState(running);
  assert.equal(d.question, "Q0");
  assert.equal(d.category, "ทดสอบ");
  assert.equal(d.totalMs, 120_000);
  assert.ok(!JSON.stringify(d).includes("A0"), "no answer in the payload");
  assert.ok(!("deck" in d));
  assert.equal(toDisplayState(run(running, { type: "pause" })).question, null);
  assert.equal(toDisplayState(run(running, { type: "pause" })).category, null);
});

test("display state keeps the question during Pushback", () => {
  const g = run(round2(3), W);
  const d = toDisplayState(g);
  assert.equal(d.pushback, true);
  assert.equal(d.question, currentQuestion(g).question);
  assert.equal(d.event.kind, "pushback");
});
