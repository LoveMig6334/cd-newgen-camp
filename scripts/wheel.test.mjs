// Tests for the picker wheel math and no-repeat behaviour.
// Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_WHEEL_STATE,
  MIN_SPINS,
  sanitizeWheelState,
  secureRandomInt,
  segmentAt,
  spinTarget,
  wheelPool,
} from "../lib/wheel.ts";

const roster = (n) => Array.from({ length: n }, (_, i) => ({ id: `s${i}` }));

test("pointer lands on the winner for every index, 1–30 segments", () => {
  const starts = [0, 12.5, 359.9, -77, 100_000.3, -54_321.7];
  const offsets = [0, 0.25, 0.5, 0.999];
  for (let count = 1; count <= 30; count++) {
    for (let winner = 0; winner < count; winner++) {
      for (const start of starts) {
        for (const offset of offsets) {
          const end = spinTarget(start, count, winner, offset);
          assert.equal(segmentAt(end, count), winner, `count=${count} winner=${winner} start=${start} offset=${offset}`);
          assert.ok(end - start >= MIN_SPINS * 360 && end - start < (MIN_SPINS + 1) * 360);
        }
      }
    }
  }
});

test("chained spins keep landing correctly as the wheel shrinks", () => {
  let rotation = 0;
  for (let count = 25; count >= 1; count--) {
    const winner = secureRandomInt(count);
    rotation = spinTarget(rotation, count, winner, secureRandomInt(1000) / 1000);
    assert.equal(segmentAt(rotation, count), winner);
  }
});

test("secureRandomInt stays in range and hits every value", () => {
  const seen = new Set();
  for (let i = 0; i < 5000; i++) {
    const v = secureRandomInt(7);
    assert.ok(Number.isInteger(v) && v >= 0 && v < 7);
    seen.add(v);
  }
  assert.equal(seen.size, 7);
  assert.throws(() => secureRandomInt(0), RangeError);
});

test("no-repeat: N spins pick every student exactly once, then the wheel is empty", () => {
  const people = roster(16);
  let state = { ...DEFAULT_WHEEL_STATE };
  for (let i = 0; i < people.length; i++) {
    const pool = wheelPool(people, state);
    assert.equal(pool.length, people.length - i);
    state = { ...state, picked: [...state.picked, pool[secureRandomInt(pool.length)].id] };
  }
  assert.equal(new Set(state.picked).size, people.length);
  assert.equal(wheelPool(people, state).length, 0);
  // Reset restores everyone.
  assert.equal(wheelPool(people, { ...state, picked: [] }).length, people.length);
});

test("excluded students are never picked (with and without repeats)", () => {
  const people = roster(12);
  const excluded = ["s2", "s5", "s11"];
  for (const allowRepeat of [false, true]) {
    let state = { ...DEFAULT_WHEEL_STATE, picked: [], excluded, allowRepeat };
    for (let i = 0; i < 200; i++) {
      const pool = wheelPool(people, state);
      if (pool.length === 0) state = { ...state, picked: [] };
      const p = wheelPool(people, state);
      const pick = p[secureRandomInt(p.length)].id;
      assert.ok(!excluded.includes(pick));
      state = { ...state, picked: [...state.picked, pick] };
    }
  }
});

test("stored state is sanitized against the roster", () => {
  const ids = new Set(["a", "b"]);
  assert.deepEqual(sanitizeWheelState({ picked: ["a", "zz", 3], excluded: ["b", "b"], allowRepeat: "yes" }, ids), {
    picked: ["a"],
    excluded: ["b"],
    allowRepeat: false,
    onlySubmitted: false,
  });
  assert.deepEqual(sanitizeWheelState(null, ids), DEFAULT_WHEEL_STATE);
});

test("only-submitted filter keeps just students with a pitch", () => {
  const people = roster(6);
  const submitted = new Set(["s1", "s4"]);
  const state = { ...DEFAULT_WHEEL_STATE, onlySubmitted: true };
  assert.deepEqual(wheelPool(people, state, submitted).map((p) => p.id), ["s1", "s4"]);
  assert.deepEqual(wheelPool(people, { ...state, excluded: ["s4"] }, submitted).map((p) => p.id), ["s1"]);
  // Off by default: everyone is on the wheel.
  assert.equal(wheelPool(people, DEFAULT_WHEEL_STATE, submitted).length, 6);
});
