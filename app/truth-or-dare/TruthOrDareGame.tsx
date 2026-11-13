"use client";

// Truth or Dare for one phone in the middle of the group: everyone puts a
// finger on the screen (multi-touch, one colour each), holds still, and one
// finger is picked at random — it turns red and floods the screen. That
// person picks ความจริง or คำท้า and gets a card from the bank
// (lib/truthOrDareQuestions.ts). Settings + today's used-prompt log live in
// localStorage so prompts don't repeat within a day on this device.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowsPointingOut,
  HiOutlineSpeakerWave,
  HiOutlineSpeakerXMark,
  HiXMark,
} from "react-icons/hi2";
import { dayKey, sanitizeUsed, type UsedLog } from "@/lib/chaser";
import {
  ARM_MS,
  DEFAULT_TOD_SETTINGS,
  FINGER_COLORS,
  KIND_LABEL,
  KINDS,
  MIN_FINGERS,
  PICK_RED,
  REVEAL_MS,
  categoryKey,
  drawPrompt,
  enabledPrompts,
  listCategories,
  nextColor,
  pickFinger,
  promptsLeft,
  randomKind,
  sanitizeTodSettings,
  type Kind,
  type Prompt,
  type TodSettings,
} from "@/lib/truthOrDare";
import { TOD_PROMPTS } from "@/lib/truthOrDareQuestions";
import { sfx, unlockAudio } from "./sounds";

const SETTINGS_KEY = "tod:settings";
const USED_KEY = "tod:used";
const TICK_MS = 430;

type Phase = "touch" | "picked" | "choose" | "card";

interface Finger {
  id: number;
  x: number;
  y: number;
  color: number;
}

interface Winner extends Finger {
  /** Radius that covers the whole screen from the finger. */
  reach: number;
}

function load(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / full storage: the game still works, just forgets.
  }
}

const isUi = (target: EventTarget | null) => target instanceof Element && !!target.closest("[data-ui]");

const CATEGORIES: Record<Kind, { name: string; count: number }[]> = {
  truth: listCategories(TOD_PROMPTS, "truth"),
  dare: listCategories(TOD_PROMPTS, "dare"),
};

export default function TruthOrDareGame() {
  const [settings, setSettings] = useState<TodSettings>(DEFAULT_TOD_SETTINGS);
  const [used, setUsed] = useState<UsedLog>({ day: "", keys: [] });
  const [phase, setPhase] = useState<Phase>("touch");
  const [fingers, setFingers] = useState<Finger[]>([]);
  const [armedAt, setArmedAt] = useState<number | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [flood, setFlood] = useState(false);
  const [card, setCard] = useState<{ prompt: Prompt; recycled: boolean; n: number } | null>(null);
  const [turn, setTurn] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const fingersRef = useRef(new Map<number, Finger>());
  const phaseRef = useRef<Phase>("touch");
  const soundRef = useRef(true);
  const frameRef = useRef<number | null>(null);
  const armTimer = useRef<number | null>(null);
  const tickTimer = useRef<number | null>(null);
  const revealTimer = useRef<number | null>(null);

  // ---------- setup ----------

  useEffect(() => {
    const s = sanitizeTodSettings(load(SETTINGS_KEY));
    setSettings(s);
    soundRef.current = s.sound;
    setUsed(sanitizeUsed(load(USED_KEY), dayKey()));
    setCanFullscreen(!!document.fullscreenEnabled);

    // The whole page is the touch surface: no scrolling, bouncing or zooming.
    const html = document.documentElement;
    const prev = [html.style.overflow, html.style.overscrollBehavior, document.body.style.overflow];
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    return () => {
      [html.style.overflow, html.style.overscrollBehavior, document.body.style.overflow] = prev;
    };
  }, []);

  // iOS still scrolls / shows the magnifier on some versions unless the raw
  // touch events are cancelled (React's touch listeners are passive).
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => {
      if ((phaseRef.current === "touch" || phaseRef.current === "picked") && !isUi(e.target)) e.preventDefault();
    };
    el.addEventListener("touchstart", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("touchstart", block);
      el.removeEventListener("touchmove", block);
    };
  }, []);

  const stopArming = useCallback(() => {
    if (armTimer.current !== null) clearTimeout(armTimer.current);
    if (tickTimer.current !== null) clearInterval(tickTimer.current);
    armTimer.current = tickTimer.current = null;
  }, []);

  useEffect(
    () => () => {
      stopArming();
      if (revealTimer.current !== null) clearTimeout(revealTimer.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [stopArming],
  );

  const goPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ---------- picking ----------

  const pick = useCallback(() => {
    stopArming();
    const map = fingersRef.current;
    if (phaseRef.current !== "touch" || map.size < MIN_FINGERS) return;
    const f = map.get(pickFinger([...map.keys()]))!;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const reach = Math.hypot(Math.max(f.x, w - f.x), Math.max(f.y, h - f.y)) + 24;

    phaseRef.current = "picked";
    setPhase("picked");
    setWinner({ ...f, reach });
    setFingers([...map.values()]);
    setArmedAt(null);
    setTurn((t) => t + 1);
    if (soundRef.current) sfx.pick();
    try {
      navigator.vibrate?.([70, 50, 160]);
    } catch {
      // not supported (iOS)
    }
    // Two frames so the flood circle mounts at scale ~0 before growing.
    requestAnimationFrame(() => requestAnimationFrame(() => setFlood(true)));
    revealTimer.current = window.setTimeout(() => {
      phaseRef.current = "choose";
      setPhase("choose");
    }, REVEAL_MS);
  }, [stopArming]);

  /** Restart the hold-still countdown whenever the set of fingers changes. */
  const rearm = useCallback(() => {
    stopArming();
    if (phaseRef.current !== "touch" || fingersRef.current.size < MIN_FINGERS) {
      setArmedAt(null);
      return;
    }
    setArmedAt(Date.now());
    let step = 0;
    tickTimer.current = window.setInterval(() => {
      if (soundRef.current) sfx.tick(step);
      step++;
    }, TICK_MS);
    armTimer.current = window.setTimeout(pick, ARM_MS);
  }, [pick, stopArming]);

  const render = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      setFingers([...fingersRef.current.values()]);
    });
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (soundRef.current) unlockAudio();
    if (phaseRef.current !== "touch" || isUi(e.target)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const map = fingersRef.current;
    if (map.has(e.pointerId)) return;
    map.set(e.pointerId, {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      color: nextColor([...map.values()].map((f) => f.color)),
    });
    if (e.pointerType === "mouse") e.currentTarget.setPointerCapture(e.pointerId);
    if (soundRef.current) sfx.touch();
    setFingers([...map.values()]);
    rearm();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "touch") return;
    const map = fingersRef.current;
    const f = map.get(e.pointerId);
    if (!f) return;
    map.set(e.pointerId, { ...f, x: e.clientX, y: e.clientY });
    render();
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (soundRef.current) unlockAudio();
    const map = fingersRef.current;
    if (!map.delete(e.pointerId)) return;
    if (phaseRef.current === "touch") {
      setFingers([...map.values()]);
      rearm();
    }
  };

  const nextTurn = () => {
    stopArming();
    if (revealTimer.current !== null) clearTimeout(revealTimer.current);
    fingersRef.current.clear();
    setFingers([]);
    setWinner(null);
    setFlood(false);
    setCard(null);
    setArmedAt(null);
    goPhase("touch");
  };

  // ---------- prompts ----------

  const deal = (kind: Kind, avoidId: string | null = null) => {
    const today = dayKey();
    const d = drawPrompt(TOD_PROMPTS, kind, settings, used, today, avoidId);
    if (!d) return;
    setUsed(d.used);
    save(USED_KEY, d.used);
    setCard((c) => ({ prompt: d.prompt, recycled: d.recycled, n: (c?.n ?? 0) + 1 }));
    goPhase("card");
    if (soundRef.current) sfx.reveal();
  };

  const updateSettings = (next: TodSettings) => {
    setSettings(next);
    soundRef.current = next.sound;
    save(SETTINGS_KEY, next);
  };

  const toggleCategory = (kind: Kind, name: string) => {
    const key = categoryKey(kind, name);
    const off = settings.off.includes(key) ? settings.off.filter((k) => k !== key) : [...settings.off, key];
    updateSettings({ ...settings, off });
  };

  const clearUsed = () => {
    const fresh = { day: dayKey(), keys: [] };
    setUsed(fresh);
    save(USED_KEY, fresh);
  };

  const available: Record<Kind, boolean> = {
    truth: enabledPrompts(TOD_PROMPTS, "truth", settings).length > 0,
    dare: enabledPrompts(TOD_PROMPTS, "dare", settings).length > 0,
  };

  const goFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  // ---------- view ----------

  const red = phase === "choose" || phase === "card";
  const count = fingers.length;
  const today = dayKey();

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden text-white select-none"
      style={{ background: red ? PICK_RED : "#0b0b12", WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{CSS}</style>

      {/* Touch surface */}
      <div
        ref={surfaceRef}
        className="absolute inset-0"
        style={{ touchAction: "none", ["--arm" as string]: `${ARM_MS}ms` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onLostPointerCapture={onPointerEnd}
      >
        {!red && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 45%, #1d1b3a 0%, #0b0b12 65%)" }}
            aria-hidden
          />
        )}

        {phase === "touch" && (
          <div
            className={`pointer-events-none absolute inset-x-0 px-8 text-center ${
              count === 0 ? "top-1/2 -translate-y-1/2" : "top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))]"
            }`}
            role="status"
          >
            {count === 0 ? (
              <>
                <p className="tod-breathe text-6xl" aria-hidden>
                  👆
                </p>
                <h1 className="mt-4 text-3xl font-bold">วางนิ้วบนจอพร้อมกัน</h1>
                <p className="mt-2 text-base text-white/60">ทุกคนคนละนิ้ว ค้างไว้ แล้วระบบจะสุ่มเลือกหนึ่งคน</p>
                <p className="mt-8 text-sm tracking-wide text-white/35">TRUTH OR DARE · ความจริงหรือคำท้า</p>
              </>
            ) : count < MIN_FINGERS ? (
              <p className="text-xl font-semibold text-white/70">รออีกอย่างน้อย {MIN_FINGERS - count} นิ้ว…</p>
            ) : (
              <p className="text-xl font-semibold text-white/80">
                {count} คน · ค้างไว้นะ อย่าเพิ่งยก…
              </p>
            )}
          </div>
        )}

        {/* Red flood from the picked finger */}
        {winner && (
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              left: winner.x,
              top: winner.y,
              width: winner.reach * 2,
              height: winner.reach * 2,
              background: PICK_RED,
              transform: `translate(-50%, -50%) scale(${flood ? 1 : 0.02})`,
              transition: "transform 750ms cubic-bezier(0.7, 0, 0.25, 1) 250ms",
            }}
            aria-hidden
          />
        )}

        {(phase === "touch" || phase === "picked") &&
          fingers.map((f) => {
            const state = winner ? (winner.id === f.id ? "tod-win" : "tod-lose") : "";
            return (
              <div
                key={f.id}
                className={`tod-finger ${state}`}
                style={{ left: f.x, top: f.y, ["--c" as string]: FINGER_COLORS[f.color] }}
                aria-hidden
              >
                <span className="tod-halo" />
                <span className="tod-dot" />
                {armedAt !== null && (
                  <svg key={armedAt} className="tod-ring" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="65" />
                  </svg>
                )}
              </div>
            );
          })}

        {phase === "picked" && (
          <p className="tod-pop pointer-events-none absolute inset-x-0 top-[18%] text-center text-4xl font-black drop-shadow-lg">
            คนนี้แหละ!
          </p>
        )}
      </div>

      {/* Truth or dare? */}
      {phase === "choose" && (
        <div data-ui className="tod-pop absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center">
          <p className="text-sm font-semibold tracking-widest text-white/75">ตาที่ {turn}</p>
          <h2 className="text-5xl font-black drop-shadow">โดนแล้ว! 🫵</h2>
          <p className="text-lg text-white/90">จะตอบความจริง หรือรับคำท้า?</p>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!available.truth}
              onClick={() => deal("truth")}
              className="rounded-3xl bg-white py-9 text-3xl font-black text-red-600 shadow-xl transition active:scale-95 disabled:opacity-40"
            >
              ความจริง
              <span className="mt-1 block text-sm font-semibold tracking-widest text-red-400">TRUTH</span>
            </button>
            <button
              type="button"
              disabled={!available.dare}
              onClick={() => deal("dare")}
              className="rounded-3xl bg-neutral-950 py-9 text-3xl font-black text-white shadow-xl transition active:scale-95 disabled:opacity-40"
            >
              คำท้า
              <span className="mt-1 block text-sm font-semibold tracking-widest text-white/50">DARE</span>
            </button>
          </div>
          <button
            type="button"
            disabled={!available.truth && !available.dare}
            onClick={() => {
              const k = randomKind();
              deal(available[k] ? k : k === "truth" ? "dare" : "truth");
            }}
            className="rounded-full border-2 border-white/60 px-6 py-3 text-lg font-bold transition active:scale-95"
          >
            🎲 สุ่มให้เลย
          </button>
          <button type="button" onClick={nextTurn} className="text-sm text-white/70 underline underline-offset-4">
            เลือกคนใหม่
          </button>
        </div>
      )}

      {/* The card */}
      {phase === "card" && card && (
        <div data-ui className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5">
          <div
            key={card.n}
            className="tod-card w-full max-w-md rounded-[2rem] bg-white px-6 py-8 text-center text-neutral-900 shadow-2xl"
          >
            <span
              className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${
                card.prompt.kind === "truth" ? "bg-red-100 text-red-600" : "bg-neutral-900 text-white"
              }`}
            >
              {KIND_LABEL[card.prompt.kind]} · {card.prompt.category}
            </span>
            <p className="mt-6 text-[clamp(1.5rem,7vw,2.25rem)] font-bold leading-snug break-words">
              {card.prompt.text}
            </p>
            {card.recycled && (
              <p className="mt-5 text-xs text-neutral-500">ใช้ครบทุกข้อของวันนี้แล้ว เริ่มสุ่มวนรอบใหม่</p>
            )}
          </div>
          <div className="flex w-full max-w-md gap-3">
            <button
              type="button"
              onClick={() => deal(card.prompt.kind, card.prompt.id)}
              className="flex-1 rounded-2xl border-2 border-white/70 py-4 text-lg font-bold transition active:scale-95"
            >
              เปลี่ยนข้อ
            </button>
            <button
              type="button"
              onClick={nextTurn}
              className="flex-[1.5] rounded-2xl bg-white py-4 text-lg font-black text-red-600 shadow-lg transition active:scale-95"
            >
              ตาต่อไป →
            </button>
          </div>
          {(() => {
            const other: Kind = card.prompt.kind === "truth" ? "dare" : "truth";
            return available[other] ? (
              <button
                type="button"
                onClick={() => deal(other)}
                className="text-sm text-white/80 underline underline-offset-4"
              >
                ขอเปลี่ยนเป็น{KIND_LABEL[other]}
              </button>
            ) : null;
          })()}
        </div>
      )}

      {/* Corner controls (never count as fingers) */}
      {(phase === "touch" || phase === "choose") && (
        <div
          data-ui
          className="absolute right-0 top-0 flex gap-2 p-3"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingRight: "max(0.75rem, env(safe-area-inset-right))" }}
        >
          {canFullscreen && (
            <button type="button" onClick={goFullscreen} className={ICON_BTN} aria-label="เต็มจอ">
              <HiOutlineArrowsPointingOut className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => updateSettings({ ...settings, sound: !settings.sound })}
            className={ICON_BTN}
            aria-label={settings.sound ? "ปิดเสียง" : "เปิดเสียง"}
          >
            {settings.sound ? <HiOutlineSpeakerWave className="h-5 w-5" /> : <HiOutlineSpeakerXMark className="h-5 w-5" />}
          </button>
          <button type="button" onClick={() => setShowSettings(true)} className={ICON_BTN} aria-label="เลือกหมวดคำถาม">
            <HiOutlineAdjustmentsHorizontal className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Settings sheet */}
      {showSettings && (
        <div
          data-ui
          className="absolute inset-0 z-10 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-neutral-900 p-5 text-white shadow-2xl sm:rounded-3xl"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))", overscrollBehavior: "contain" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="ตั้งค่า Truth or Dare"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">เลือกหมวดคำถาม</h2>
              <button type="button" onClick={() => setShowSettings(false)} className={ICON_BTN} aria-label="ปิด">
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            {KINDS.map((kind) => (
              <section key={kind} className="mt-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">{KIND_LABEL[kind]}</h3>
                  <span className="text-xs text-white/50">
                    เหลือวันนี้ {promptsLeft(TOD_PROMPTS, kind, settings, used, today)} ข้อ
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES[kind].map((c) => {
                    const on = !settings.off.includes(categoryKey(kind, c.name));
                    return (
                      <button
                        key={c.name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleCategory(kind, c.name)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          on ? "border-red-500 bg-red-500 text-white" : "border-white/20 bg-transparent text-white/50"
                        }`}
                      >
                        {c.name} <span className="font-normal opacity-70">{c.count}</span>
                      </button>
                    );
                  })}
                </div>
                {!available[kind] && <p className="mt-2 text-xs text-amber-300">ปิดทุกหมวดอยู่ — ปุ่ม{KIND_LABEL[kind]}จะกดไม่ได้</p>}
              </section>
            ))}

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <label className="flex items-center justify-between">
                <span>เสียงประกอบ</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-red-500"
                  checked={settings.sound}
                  onChange={(e) => updateSettings({ ...settings, sound: e.target.checked })}
                />
              </label>
              <button
                type="button"
                onClick={clearUsed}
                disabled={used.keys.length === 0}
                className="w-full rounded-2xl border border-white/20 py-3 text-sm font-semibold disabled:opacity-40"
              >
                ล้างประวัติคำถามวันนี้ ({used.day === today ? used.keys.length : 0} ข้อ)
              </button>
              <p className="text-xs leading-relaxed text-white/50">
                คำถามที่ขึ้นแล้วจะไม่ซ้ำในวันเดียวกันบนเครื่องนี้ · วางโทรศัพท์ไว้กลางวง ทุกคนแตะคนละนิ้ว (iPhone
                รับได้ราว 5 นิ้วพร้อมกัน, Android ส่วนใหญ่ 10 นิ้ว)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ICON_BTN =
  "grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-90";

const CSS = `
.tod-finger { position: absolute; width: 0; height: 0; pointer-events: none; }
.tod-dot, .tod-halo, .tod-ring { position: absolute; border-radius: 9999px; transition: transform .35s ease, opacity .35s ease, background-color .25s ease, box-shadow .25s ease; }
.tod-dot { left: -44px; top: -44px; width: 88px; height: 88px; background: var(--c); box-shadow: 0 0 36px var(--c); animation: tod-in .22s ease-out both; }
.tod-halo { left: -62px; top: -62px; width: 124px; height: 124px; border: 3px solid var(--c); animation: tod-halo 1.1s ease-out infinite; }
.tod-ring { left: -74px; top: -74px; width: 148px; height: 148px; transform: rotate(-90deg); }
.tod-ring circle { fill: none; stroke: var(--c); stroke-width: 7; stroke-linecap: round; stroke-dasharray: 408.4; stroke-dashoffset: 408.4; animation: tod-arm var(--arm) linear forwards; }
.tod-lose .tod-dot, .tod-lose .tod-halo, .tod-lose .tod-ring { opacity: 0; transform: scale(.3); animation: none; }
.tod-win .tod-dot { background: ${PICK_RED}; transform: scale(1.35); box-shadow: 0 0 0 6px #fff, 0 0 70px ${PICK_RED}; }
.tod-win .tod-halo { border-color: #fff; }
.tod-win .tod-ring { opacity: 0; }
.tod-breathe { animation: tod-breathe 1.6s ease-in-out infinite; }
.tod-pop { animation: tod-pop .4s cubic-bezier(.2,.9,.3,1.25) both; }
.tod-card { animation: tod-flip .55s cubic-bezier(.2,.9,.3,1.15) both; }
@keyframes tod-in { from { transform: scale(.2); } to { transform: scale(1); } }
@keyframes tod-halo { from { transform: scale(.75); opacity: .9; } to { transform: scale(1.4); opacity: 0; } }
@keyframes tod-arm { to { stroke-dashoffset: 0; } }
@keyframes tod-breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes tod-pop { from { opacity: 0; transform: scale(.88); } to { opacity: 1; transform: none; } }
@keyframes tod-flip { from { opacity: 0; transform: perspective(900px) rotateY(75deg) scale(.92); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .tod-halo, .tod-breathe { animation: none; }
  .tod-card, .tod-pop { animation-duration: .01s; }
}
`;
