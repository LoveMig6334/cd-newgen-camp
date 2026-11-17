"use client";

// Public Secret Santa page. Pick your own name, then open the lucky block:
// it rattles, bursts, and shows who you buy a gift for. The draw runs in
// secret_santa_draw() (Postgres), which removes that name from the pool and
// keeps no record of the pair — the result exists only on this screen.
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { errorText, splitName, toStatus, type SantaStatus } from "@/lib/secretSanta";
import { createClient } from "@/lib/supabase/client";
import { Lights, SANTA_CSS, Snow } from "./Decor";
import { setMuted as setSoundMuted, sfx, unlockAudio } from "./sounds";

type Phase = "loading" | "who" | "ready" | "opening" | "burst" | "reveal";

const OPEN_MS = 1900;
const BURST_MS = 800;
const POLL_MS = 4000;
const RATTLE_AT = [0, 380, 700, 980, 1220, 1430, 1600, 1740, 1840];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  shard: boolean;
}

const SHARD_COLORS = ["#f7b500", "#ffd84d", "#c98400", "#6b4200"];
const CONFETTI_COLORS = ["#e63946", "#2ec27e", "#ffffff", "#ffd23f", "#ff8ad8"];

function makeParticles(): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
    const r = 120 + Math.random() * 140;
    out.push({
      id: i,
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      rotate: (Math.random() - 0.5) * 720,
      size: 14 + Math.random() * 16,
      color: SHARD_COLORS[i % SHARD_COLORS.length],
      duration: 0.9 + Math.random() * 0.4,
      delay: 0,
      shard: true,
    });
  }
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 160 + Math.random() * 260;
    out.push({
      id: 100 + i,
      x: Math.cos(a) * r,
      y: Math.sin(a) * r - 80,
      rotate: (Math.random() - 0.5) * 1080,
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 1.6 + Math.random() * 1.2,
      delay: Math.random() * 0.15,
      shard: false,
    });
  }
  return out;
}

function SantaHat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden>
      <path d="M12 60 Q 36 4 84 14 Q 66 30 76 60 Z" fill="#d62828" />
      <path d="M30 40 Q 48 18 76 18" stroke="#b01e1e" strokeWidth="4" fill="none" />
      <rect x="4" y="54" width="84" height="18" rx="9" fill="#fff" />
      <circle cx="86" cy="14" r="10" fill="#fff" />
    </svg>
  );
}

function LuckyBlock({ shaking, onOpen, disabled }: { shaking: boolean; onOpen: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      aria-label="เปิดกล่องสุ่ม"
      className="relative outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/60 rounded-sm"
      style={{
        animation: shaking
          ? `ss-shake ${OPEN_MS}ms cubic-bezier(.36,.07,.19,.97) forwards`
          : "ss-bob 2.6s ease-in-out infinite",
      }}
    >
      <SantaHat className="absolute -top-11 -right-8 z-10 w-24 rotate-[18deg] drop-shadow-lg" />
      <div className="rounded-sm" style={{ animation: "ss-glow 1.8s ease-in-out infinite" }}>
        <div
          className="relative grid size-44 place-items-center sm:size-52"
          style={{
            background: "#f7b500",
            border: "8px solid #5c3900",
            boxShadow: "inset 9px 9px 0 #ffe27a, inset -9px -9px 0 #c98400",
          }}
        >
          {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map((pos) => (
            <span key={pos} className={`absolute ${pos} size-3 bg-[#5c3900]/70`} />
          ))}
          <span
            className="select-none font-black leading-none text-[#fff6d5]"
            style={{
              fontSize: "7.5rem",
              fontFamily: "ui-monospace, 'Courier New', monospace",
              textShadow: "7px 7px 0 #5c3900",
            }}
          >
            ?
          </span>
        </div>
      </div>
    </button>
  );
}

function NameTag({ name, big = false }: { name: string; big?: boolean }) {
  const { main, sub } = splitName(name);
  return (
    <span className="flex flex-col">
      <span className={big ? "text-5xl font-bold sm:text-6xl" : "text-xl font-semibold"}>{main}</span>
      {sub && <span className={big ? "mt-1 text-xl text-white/70" : "text-sm text-white/60"}>{sub}</span>}
    </span>
  );
}

export default function SecretSantaDraw() {
  const supabase = useMemo(() => createClient(), []);
  const [phase, setPhase] = useState<Phase>("loading");
  const [status, setStatus] = useState<SantaStatus | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hideArmed, setHideArmed] = useState(false);
  const [muted, setMuted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase.rpc("secret_santa_status");
    if (err) {
      setError("โหลดรายชื่อไม่สำเร็จ ลองรีเฟรชหน้า");
      return;
    }
    setStatus(toStatus(data));
    setPhase((p) => (p === "loading" ? "who" : p));
  }, [supabase]);

  // Keep the name list fresh while people are choosing.
  useEffect(() => {
    if (phase !== "loading" && phase !== "who") return;
    void refresh();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [phase, refresh]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // The result is never stored: warn before the page is closed while it shows.
  useEffect(() => {
    if (phase !== "reveal") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  };

  const chooseMe = (name: string) => {
    unlockAudio();
    sfx.tap();
    setConfirming(name);
  };

  const confirmMe = () => {
    if (!confirming) return;
    sfx.tap();
    setMe(confirming);
    setConfirming(null);
    setError(null);
    setPhase("ready");
  };

  const notMe = () => {
    setMe(null);
    setError(null);
    setPhase("who");
  };

  const open = async () => {
    if (!status || !me || phase !== "ready") return;
    unlockAudio();
    setError(null);
    setPhase("opening");
    const started = performance.now();
    RATTLE_AT.forEach((ms, i) => later(() => sfx.rattle(i), ms));

    const { data, error: err } = await supabase.rpc("secret_santa_draw", {
      p_round_id: status.roundId,
      p_name: me,
    });
    const wait = Math.max(0, OPEN_MS - (performance.now() - started));
    await new Promise((r) => setTimeout(r, wait));

    if (err || typeof data !== "string") {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const msg = errorText(err?.message);
      if (err?.message === "already_drawn" || err?.message === "round_gone" || err?.message === "not_participant") {
        setMe(null);
        setPhase("who");
      } else {
        setPhase("ready");
      }
      setError(msg);
      return;
    }

    setResult(data);
    setParticles(makeParticles());
    setPhase("burst");
    sfx.burst();
    try {
      navigator.vibrate?.([60, 40, 120]);
    } catch {
      // not supported
    }
    later(() => {
      setPhase("reveal");
      sfx.jingle();
    }, BURST_MS);
  };

  const finish = () => {
    if (!hideArmed) {
      setHideArmed(true);
      later(() => setHideArmed(false), 3500);
      return;
    }
    setHideArmed(false);
    setResult(null);
    setParticles(null);
    setMe(null);
    setPhase("who");
  };

  const waiting = status?.waiting ?? [];
  const allDone = !!status && waiting.length === 0;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top,#1f5a3d_0%,#0d2219_55%,#06110c_100%)] text-white">
      <style>{SANTA_CSS}</style>
      <Snow />
      <Lights />

      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-3 top-12 z-20 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur hover:bg-white/20"
        aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
      >
        {muted ? <HiOutlineSpeakerXMark className="h-5 w-5" /> : <HiOutlineSpeakerWave className="h-5 w-5" />}
      </button>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] max-w-xl flex-col px-5 pb-10 pt-4">
        <header className="text-center">
          <p className="text-sm tracking-[0.3em] text-emerald-200/80">🎄 CD NEW GEN 🎄</p>
          <h1 className="mt-1 text-4xl font-bold sm:text-5xl">
            <span className="text-red-400 drop-shadow-[0_0_12px_rgba(255,80,80,.5)]">Secret</span>{" "}
            <span className="text-amber-300 drop-shadow-[0_0_12px_rgba(255,210,60,.5)]">Santa</span> 🎅
          </h1>
          <p className="mt-1 text-white/70">จับฉลากของขวัญคริสต์มาส</p>
        </header>

        {error && (
          <div className="mt-5 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-center text-red-100">
            {error}
          </div>
        )}

        {phase === "loading" && (
          <div className="flex flex-1 items-center justify-center text-white/60">กำลังโหลด…</div>
        )}

        {phase === "who" && !status && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-6xl">⛄</p>
            <p className="mt-4 text-2xl font-semibold">ยังไม่เปิดให้สุ่ม</p>
            <p className="mt-1 text-white/60">รอ admin เริ่มรอบก่อนนะ</p>
          </div>
        )}

        {phase === "who" && allDone && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <motion.p
              className="text-7xl"
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎄
            </motion.p>
            <p className="mt-4 text-3xl font-bold text-amber-300">สุ่มครบทุกคนแล้ว!</p>
            <p className="mt-2 text-white/70">
              ทั้ง {status?.total} คนได้ชื่อกันครบแล้ว · Merry Christmas 🎁
            </p>
          </div>
        )}

        {phase === "who" && status && !allDone && (
          <section className="mt-6 flex-1">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-semibold">คุณคือใคร?</h2>
              <span className="text-sm text-white/60">
                สุ่มแล้ว {status.drawnCount}/{status.total}
              </span>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-300 to-emerald-400 transition-all duration-700"
                style={{ width: `${(status.drawnCount / Math.max(1, status.total)) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {waiting.map((name, i) => (
                <motion.button
                  key={name}
                  type="button"
                  onClick={() => chooseMe(name)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-2xl border border-white/15 border-t-4 bg-white/10 px-4 py-3 text-left backdrop-blur transition-colors hover:bg-white/20 ${
                    i % 2 ? "border-t-emerald-400" : "border-t-red-400"
                  }`}
                >
                  <NameTag name={name} />
                </motion.button>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-white/40">
              ชื่อที่สุ่มไปแล้วจะหายไปจากรายการ · ระบบไม่เก็บว่าใครได้ใคร
            </p>
          </section>
        )}

        {(phase === "ready" || phase === "opening" || phase === "burst") && me && (
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-white/70">สวัสดี</p>
            <div className="mb-14 mt-1">
              <NameTag name={me} />
            </div>

            <div className="relative grid size-56 place-items-center">
              {phase !== "burst" && (
                <LuckyBlock shaking={phase === "opening"} onOpen={open} disabled={phase !== "ready"} />
              )}
            </div>

            <div className="mt-12 h-24">
              {phase === "ready" && (
                <>
                  <motion.button
                    type="button"
                    onClick={open}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full bg-gradient-to-b from-red-500 to-red-700 px-10 py-4 text-xl font-bold shadow-[0_8px_0_#7a1010,0_0_30px_rgba(255,60,60,.4)] active:translate-y-1 active:shadow-[0_4px_0_#7a1010]"
                  >
                    🎁 เปิดกล่องสุ่ม!
                  </motion.button>
                  <button type="button" onClick={notMe} className="mt-4 block w-full text-sm text-white/50 underline">
                    ไม่ใช่ฉัน
                  </button>
                </>
              )}
              {phase === "opening" && <p className="animate-pulse text-lg text-amber-200">กำลังเปิด…</p>}
            </div>
          </section>
        )}

        {phase === "reveal" && result && (
          <section className="flex flex-1 flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="relative w-full rounded-3xl border-2 border-amber-300/60 bg-gradient-to-b from-red-700/90 to-red-900/90 px-6 py-8 text-center shadow-[0_0_60px_rgba(255,200,60,.35)]"
            >
              {["-left-3 -top-3", "-right-3 -top-3", "-bottom-3 -left-3", "-bottom-3 -right-3"].map((pos, i) => (
                <span
                  key={pos}
                  className={`absolute ${pos} text-3xl`}
                  style={{ animation: `ss-twinkle 1.6s ease-in-out ${i * 0.3}s infinite` }}
                >
                  ⭐
                </span>
              ))}
              <p className="text-lg text-white/85">🎁 คุณเป็น Secret Santa ของ</p>
              <div className="my-5 text-amber-200 drop-shadow-[0_0_18px_rgba(255,210,80,.7)]">
                <NameTag name={result} big />
              </div>
              <p className="text-white/85">เตรียมของขวัญให้คนนี้แบบลับ ๆ นะ 🤫</p>

              <div className="mt-6 rounded-xl bg-black/30 px-4 py-3 text-sm text-amber-100">
                ⚠️ ระบบไม่ได้บันทึกว่าใครได้ใคร ถ้าปิดหน้านี้จะดูอีกไม่ได้ — จำชื่อไว้ หรือแคปจอเก็บไว้ก่อน
              </div>

              <button
                type="button"
                onClick={finish}
                className={`mt-6 w-full rounded-full px-6 py-3 font-semibold transition-colors ${
                  hideArmed ? "bg-amber-300 text-red-900" : "bg-white/15 hover:bg-white/25"
                }`}
              >
                {hideArmed ? "แตะอีกครั้งเพื่อซ่อนชื่อ" : "จำได้แล้ว ซ่อนชื่อ"}
              </button>
            </motion.div>
          </section>
        )}
      </main>

      {/* Burst: block shards + confetti, from the middle of the screen. */}
      {particles && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute block"
              style={{
                width: p.size,
                height: p.shard ? p.size : p.size * 1.8,
                background: p.color,
                borderRadius: p.shard ? 2 : 1,
                boxShadow: p.shard ? "inset -3px -3px 0 rgba(0,0,0,.25)" : undefined,
              }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: p.x,
                y: [0, p.y, p.y + (p.shard ? 260 : 420)],
                rotate: p.rotate,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeOut", times: [0, 0.45, 1] }}
            />
          ))}
        </div>
      )}
      <AnimatePresence>
        {phase === "burst" && (
          <motion.div
            key="flash"
            className="pointer-events-none fixed inset-0 z-40 bg-amber-50"
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          />
        )}
      </AnimatePresence>

      {/* "Is this you?" */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#12301f] p-6 text-center text-white shadow-2xl"
            >
              <p className="text-white/70">คุณคือ</p>
              <div className="my-3 text-amber-200">
                <NameTag name={confirming} big />
              </div>
              <p className="text-white/70">ใช่ไหม? เลือกได้ครั้งเดียวนะ</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="rounded-full bg-white/10 py-3 font-semibold hover:bg-white/20"
                >
                  ไม่ใช่
                </button>
                <button
                  type="button"
                  onClick={confirmMe}
                  className="rounded-full bg-emerald-500 py-3 font-semibold text-emerald-950 hover:bg-emerald-400"
                >
                  ใช่ ฉันเอง
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
