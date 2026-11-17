"use client";

// Admin side of Secret Santa: type the names, start the round, then watch
// only the progress. Nothing here (or anywhere) can show who got whom — the
// database never stores pairs (see secret_santa_draw()).
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineArrowTopRightOnSquare, HiOutlineClipboard, HiOutlineCheck } from "react-icons/hi2";
import { Lights, SANTA_CSS, Snow } from "@/app/secret-santa/Decor";
import {
  DEFAULT_NAMES,
  SECRET_SANTA_PATH,
  errorText,
  parseNames,
  splitName,
  toStatus,
  type SantaStatus,
} from "@/lib/secretSanta";
import { createClient } from "@/lib/supabase/client";

const POLL_MS = 3000;

export default function SecretSantaAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<SantaStatus | null>(null);
  const [text, setText] = useState(DEFAULT_NAMES.join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const parsed = parseNames(text);

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase.rpc("secret_santa_status");
    if (err) {
      setError("โหลดสถานะไม่สำเร็จ");
      return;
    }
    setStatus(toStatus(data));
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const start = async () => {
    if (parsed.error) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("secret_santa_start", { p_names: parsed.names });
    setBusy(false);
    if (err) {
      setError(errorText(err.message));
      return;
    }
    await refresh();
  };

  const reset = async () => {
    if (!resetArmed) {
      setResetArmed(true);
      setTimeout(() => setResetArmed(false), 4000);
      return;
    }
    setResetArmed(false);
    setBusy(true);
    const { error: err } = await supabase.rpc("secret_santa_reset");
    setBusy(false);
    if (err) {
      setError(errorText(err.message));
      return;
    }
    await refresh();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${SECRET_SANTA_PATH}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; the link is visible anyway
    }
  };

  const done = !!status && status.waiting.length === 0;
  const pct = status ? (status.drawnCount / Math.max(1, status.total)) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top,#1f5a3d_0%,#0d2219_60%,#06110c_100%)] text-white shadow-xl">
      <style>{SANTA_CSS}</style>
      <Snow contained count={40} />
      <Lights count={22} />

      <div className="relative z-10 px-6 pb-8 pt-2 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-red-400">Secret</span> <span className="text-amber-300">Santa</span> 🎅
            </h1>
            <p className="mt-1 text-sm text-white/70">
              ระบบเก็บแค่ว่าใครสุ่มไปแล้ว ไม่มีที่ไหนบันทึกว่าใครได้ใคร แม้แต่ admin ก็ดูไม่ได้
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-black/30 px-3 py-2 text-sm text-emerald-200">{SECRET_SANTA_PATH}</code>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
              title="คัดลอกลิงก์"
            >
              {copied ? <HiOutlineCheck className="h-5 w-5 text-emerald-300" /> : <HiOutlineClipboard className="h-5 w-5" />}
            </button>
            <Link
              href={SECRET_SANTA_PATH}
              target="_blank"
              className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
              title="เปิดหน้าสุ่ม"
            >
              <HiOutlineArrowTopRightOnSquare className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-red-100">{error}</div>
        )}

        {!loaded && <p className="mt-10 text-white/60">กำลังโหลด…</p>}

        {loaded && !status && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
            <div>
              <label htmlFor="ss-names" className="mb-2 block font-semibold">
                รายชื่อ (บรรทัดละ 1 คน)
              </label>
              <textarea
                id="ss-names"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className="w-full rounded-2xl border border-white/15 bg-black/30 p-4 font-mono text-base text-white outline-none focus:border-amber-300/70"
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-white/60">{parsed.names.length} คน</span>
                {parsed.error && <span className="text-red-300">{parsed.error}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-white/10 p-4 text-sm leading-relaxed text-white/80">
                <p className="mb-2 font-semibold text-amber-200">หลังกดเริ่ม</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>แต่ละคนเปิดลิงก์ เลือกชื่อตัวเอง แล้วกดเปิดกล่องสุ่ม</li>
                  <li>ไม่มีใครได้ชื่อตัวเอง และชื่อที่ถูกสุ่มจะถูกเอาออกทันที</li>
                  <li>หน้านี้จะบอกแค่ความคืบหน้า จนกว่าจะสุ่มครบ</li>
                  <li>เพิ่ม/ลบชื่อหลังเริ่มไม่ได้ ต้องเริ่มรอบใหม่</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={start}
                disabled={busy || !!parsed.error}
                className="rounded-full bg-gradient-to-b from-red-500 to-red-700 px-6 py-4 text-lg font-bold shadow-[0_6px_0_#7a1010] transition active:translate-y-1 active:shadow-[0_3px_0_#7a1010] disabled:cursor-not-allowed disabled:opacity-50"
              >
                🎄 เริ่ม Secret Santa
              </button>
            </div>
          </section>
        )}

        {loaded && status && (
          <section className="mt-8">
            <div className="flex flex-col items-center text-center">
              {done ? (
                <>
                  <p className="text-7xl">🎉</p>
                  <p className="mt-3 text-4xl font-bold text-amber-300">สุ่มครบหมดแล้ว!</p>
                  <p className="mt-2 text-white/70">ทั้ง {status.total} คนได้ชื่อกันครบ · Merry Christmas 🎁</p>
                </>
              ) : (
                <>
                  <p className="text-white/70">สุ่มไปแล้ว</p>
                  <p className="text-6xl font-bold tabular-nums">
                    {status.drawnCount}
                    <span className="text-3xl text-white/50"> / {status.total}</span>
                  </p>
                </>
              )}
              <div className="mt-6 h-3 w-full max-w-xl overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-300 to-emerald-400 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {!done && (
              <div className="mx-auto mt-8 max-w-2xl">
                <p className="mb-3 text-center text-sm text-white/60">ยังไม่ได้สุ่ม ({status.waiting.length})</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {status.waiting.map((name) => (
                    <span key={name} className="rounded-full bg-white/10 px-3 py-1 text-sm">
                      {splitName(name).main}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                className={`rounded-full px-5 py-2 text-sm transition-colors ${
                  resetArmed ? "bg-red-500 font-semibold" : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {resetArmed ? "กดอีกครั้งเพื่อลบรอบนี้และเริ่มใหม่" : "เริ่มรอบใหม่"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
