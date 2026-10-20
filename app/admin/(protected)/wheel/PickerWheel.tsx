"use client";
import {
  DEFAULT_WHEEL_STATE,
  SPIN_MS,
  sanitizeWheelState,
  secureRandomInt,
  spinTarget,
  wheelPool,
  type WheelState,
} from "@/lib/wheel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface WheelPerson {
  id: string;
  /** Short name shown on the wheel (nickname, else first name). */
  label: string;
  fullName: string;
  classroom: string | null;
}

const COLORS = [
  "#2563eb", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
];
const RADIUS = 96;
const MAX_LABEL = 10;
/** Pick up new pitch submissions while the wheel is idle. */
const REFRESH_MS = 20_000;

function segmentColor(i: number, count: number) {
  // Avoid the last segment matching the first one it touches.
  const c = i % COLORS.length;
  return i === count - 1 && c === 0 && count > 1 ? COLORS[3] : COLORS[c];
}

function shorten(label: string) {
  const graphemes =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? [...new Intl.Segmenter("th", { granularity: "grapheme" }).segment(label)].map((s) => s.segment)
      : Array.from(label);
  return graphemes.length > MAX_LABEL ? `${graphemes.slice(0, MAX_LABEL - 1).join("")}…` : label;
}

function point(deg: number, r = RADIUS) {
  const rad = (deg * Math.PI) / 180;
  return `${(r * Math.sin(rad)).toFixed(3)} ${(-r * Math.cos(rad)).toFixed(3)}`;
}

function readStored(key: string, ids: ReadonlySet<string>): WheelState {
  try {
    const raw = localStorage.getItem(key);
    return raw ? sanitizeWheelState(JSON.parse(raw), ids) : DEFAULT_WHEEL_STATE;
  } catch {
    return DEFAULT_WHEEL_STATE;
  }
}

export default function PickerWheel({
  eventId,
  people,
  submittedIds,
}: {
  eventId: string;
  people: WheelPerson[];
  /** Students who have submitted a Prototype PITCH. */
  submittedIds: string[];
}) {
  const router = useRouter();
  const storageKey = `picker-wheel:${eventId}`;
  const ids = useMemo(() => new Set(people.map((p) => p.id)), [people]);
  const [state, setState] = useState<WheelState>(DEFAULT_WHEEL_STATE);
  const [loaded, setLoaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  /** Winner on display. */
  const [winnerId, setWinnerId] = useState<string | null>(null);
  /**
   * Segments captured when a spin starts and kept until the winner is closed,
   * so the wheel under the pointer can't change (refresh, no-repeat removal).
   */
  const [frozen, setFrozen] = useState<WheelPerson[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinningRef = useRef(false);
  const submitted = useMemo(() => new Set(submittedIds), [submittedIds]);

  // Load once; later refreshes re-render with a new `people` array.
  useEffect(() => {
    if (loaded) return;
    setState(readStored(storageKey, ids));
    setLoaded(true);
  }, [loaded, storageKey, ids]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // storage unavailable — state lives for this page view only
    }
  }, [loaded, state, storageKey]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!spinningRef.current) router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [router]);

  const pool = wheelPool(people, state, submitted);
  const segments = frozen ?? pool;
  const byId = new Map(people.map((p) => [p.id, p]));
  const winner = winnerId ? byId.get(winnerId) ?? null : null;

  const spin = useCallback(() => {
    if (spinning || pool.length === 0) return;
    const index = secureRandomInt(pool.length);
    const chosen = pool[index];
    const target = spinTarget(rotation, pool.length, index, secureRandomInt(1000) / 1000);
    setWinnerId(null);
    setFrozen(pool);
    setSpinning(true);
    spinningRef.current = true;
    setRotation(target);
    timerRef.current = setTimeout(() => {
      spinningRef.current = false;
      setSpinning(false);
      setWinnerId(chosen.id);
      setState((s) => ({ ...s, picked: [...s.picked, chosen.id] }));
    }, SPIN_MS + 100);
  }, [pool, rotation, spinning]);

  // Space spins (except while typing); swallow keyup so a focused button
  // doesn't also activate.
  useEffect(() => {
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || typing(e.target)) return;
      e.preventDefault();
      if (!e.repeat) spin();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && !typing(e.target)) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [spin]);

  const closeWinner = () => {
    setWinnerId(null);
    setFrozen(null);
  };

  const toggleExcluded = (id: string) => {
    closeWinner();
    setState((s) => ({
      ...s,
      excluded: s.excluded.includes(id) ? s.excluded.filter((x) => x !== id) : [...s.excluded, id],
    }));
  };

  const reset = () => {
    if (state.picked.length && !window.confirm("ล้างลำดับการนำเสนอและนำทุกคนกลับเข้าวงล้อ?")) return;
    closeWinner();
    setState((s) => ({ ...s, picked: [] }));
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  const count = segments.length;
  const size = count ? 360 / count : 360;
  const fontSize = count <= 8 ? 11 : count <= 14 ? 9 : count <= 20 ? 7.5 : 6.5;
  const allDone = !spinning && !winner && pool.length === 0;

  return (
    <div
      ref={containerRef}
      className="bg-gray-50 [&:fullscreen]:p-6 [&:fullscreen]:overflow-auto"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">วงล้อสุ่มผู้นำเสนอ</h1>
          <p className="text-gray-500 mt-1">
            บนวงล้อ{" "}
            <span className="font-semibold text-gray-900 tabular-nums">{pool.length}</span>{" "}
            คน · กด Space หรือปุ่ม “หมุน”
          </p>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          เต็มจอ
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Wheel */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full" style={{ maxWidth: "min(100%, 74vh)" }}>
            {/* Pointer */}
            <svg
              viewBox="0 0 40 36"
              data-pointer
              className="absolute left-1/2 -top-2 z-10 w-[8%] -translate-x-1/2 drop-shadow"
              aria-hidden
            >
              <path d="M2 2 H38 L20 34 Z" fill="#111827" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
            </svg>

            <svg viewBox="-100 -100 200 200" className="w-full aspect-square" role="img" aria-label="วงล้อรายชื่อ">
              <circle r="99" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
              <g
                data-wheel
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.18, 1)`
                    : "none",
                }}
              >
                {count === 1 ? (
                  <circle r={RADIUS} fill={COLORS[0]} data-id={segments[0].id} />
                ) : (
                  segments.map((p, i) => (
                    <path
                      key={p.id}
                      data-id={p.id}
                      d={`M0 0 L${point(i * size)} A${RADIUS} ${RADIUS} 0 ${size > 180 ? 1 : 0} 1 ${point((i + 1) * size)} Z`}
                      fill={segmentColor(i, count)}
                      stroke="#fff"
                      strokeWidth="0.8"
                    />
                  ))
                )}
                {segments.map((p, i) => (
                  <text
                    key={p.id}
                    transform={`rotate(${(i + 0.5) * size - 90}) translate(${RADIUS * 0.6} 0)`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={fontSize}
                    fontWeight={600}
                    fill="#fff"
                    style={{ pointerEvents: "none" }}
                  >
                    {shorten(p.label)}
                  </text>
                ))}
              </g>
              <circle r="9" fill="#fff" stroke="#111827" strokeWidth="2" />
            </svg>

            {(winner || allDone) && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-xl rounded-3xl bg-white/95 shadow-2xl border border-gray-200 px-6 py-8 text-center">
                  {winner ? (
                    <>
                      <p className="text-lg text-gray-500 mb-2">
                        คนที่ {state.picked.length} ได้แก่
                      </p>
                      <p
                        data-winner={winner.id}
                        className="font-bold text-gray-900 leading-tight wrap-break-word"
                        style={{ fontSize: "clamp(3rem, 9vh, 7rem)" }}
                      >
                        {winner.label}
                      </p>
                      <p className="mt-2 text-xl text-gray-600">
                        {winner.fullName}
                        {winner.classroom ? ` · ม.${winner.classroom}` : ""}
                      </p>
                      <div className="mt-6 flex justify-center gap-3">
                        {submitted.has(winner.id) ? (
                          <Link
                            href={`/admin/pitch/${winner.id}`}
                            target="_blank"
                            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                          >
                            เปิด Pitch ↗
                          </Link>
                        ) : (
                          <span className="px-5 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                            ยังไม่ส่ง
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={closeWinner}
                          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          ปิด
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-gray-900">
                        {people.length - state.excluded.length > 0 ? "ครบทุกคนแล้ว 🎉" : "ไม่มีรายชื่อบนวงล้อ"}
                      </p>
                      {state.picked.length > 0 && (
                        <button
                          type="button"
                          onClick={reset}
                          className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                        >
                          เริ่มใหม่ (Reset)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={spin}
            disabled={spinning || pool.length === 0}
            className="px-16 py-5 text-3xl font-bold text-white rounded-2xl shadow-lg bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? "กำลังหมุน..." : "หมุน"}
          </button>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
              <span>ไม่สุ่มซ้ำ (คนที่ถูกเลือกออกจากวงล้อ)</span>
              <input
                type="checkbox"
                checked={!state.allowRepeat}
                disabled={spinning}
                onChange={(e) => {
                  closeWinner();
                  setState((s) => ({ ...s, allowRepeat: !e.target.checked }));
                }}
                className="h-5 w-5"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
              <span>
                เฉพาะคนที่ส่งแล้ว{" "}
                <span className="text-gray-400 tabular-nums">
                  ({people.filter((p) => submitted.has(p.id)).length}/{people.length})
                </span>
              </span>
              <input
                type="checkbox"
                checked={state.onlySubmitted}
                disabled={spinning}
                onChange={(e) => {
                  closeWinner();
                  setState((s) => ({ ...s, onlySubmitted: e.target.checked }));
                }}
                className="h-5 w-5"
              />
            </label>
            <button
              type="button"
              onClick={reset}
              disabled={spinning}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset (นำทุกคนกลับเข้าวงล้อ)
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-2">
              ลำดับการนำเสนอ{" "}
              <span className="text-gray-400 font-normal tabular-nums">({state.picked.length})</span>
            </h2>
            {state.picked.length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีใครถูกเลือก</p>
            ) : (
              <ol className="space-y-1 text-sm">
                {state.picked.map((id, i) => {
                  const p = byId.get(id);
                  return (
                    <li key={`${id}-${i}`} className="flex gap-2">
                      <span className="w-6 text-right text-gray-400 tabular-nums">{i + 1}.</span>
                      <span className="text-gray-900">
                        {p?.label}
                        <span className="text-gray-500"> · {p?.fullName}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">รายชื่อ</h2>
            <p className="text-xs text-gray-500 mb-2">คลิกชื่อเพื่อนำออก/นำกลับ (เช่น ไม่มาเรียน)</p>
            <ul className="space-y-1">
              {people.map((p) => {
                const excluded = state.excluded.includes(p.id);
                const done = !state.allowRepeat && state.picked.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={spinning}
                      onClick={() => toggleExcluded(p.id)}
                      aria-pressed={!excluded}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between gap-2 disabled:cursor-not-allowed ${
                        excluded
                          ? "bg-gray-100 text-gray-400 line-through"
                          : "hover:bg-blue-50 text-gray-800"
                      }`}
                    >
                      <span className="truncate">
                        {p.label} <span className="text-gray-400">· {p.fullName}</span>
                      </span>
                      <span className="shrink-0 text-xs no-underline flex items-center gap-1.5">
                        {excluded ? "นำออกแล้ว" : done ? "✓ นำเสนอแล้ว" : ""}
                        {submitted.has(p.id) && (
                          <span className="h-2 w-2 rounded-full bg-green-500" title="ส่งต้นแบบแล้ว" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
