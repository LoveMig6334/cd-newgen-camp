"use client";
import {
  MAX_HMW_CHARS,
  MAX_IDEA_CHARS,
  MAX_PROBLEM_CHARS,
  MAX_SKETCH_BYTES,
  MAX_UPLOAD_BYTES,
  PITCH_ERRORS,
  SKETCH_TYPES,
  normalizeLink,
} from "@/lib/pitch";
import {
  ERRORS,
  MAX_HTML_BYTES,
  htmlByteLength,
  isHtmlFile,
  participantLabel,
} from "@/lib/promptBattle";
import type { PromptBattleParticipant } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type Mode = "file" | "paste" | "link";
type Status = { kind: "success" | "error"; message: string } | null;

// Shared with the Prompt Battle form so the name is remembered across both.
const STORAGE_KEY = "prompt-battle-participant";
const SKETCH_MAX_EDGE = 1600;

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

/** Downscale phone photos to keep the upload small; falls back to the original. */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, SKETCH_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export default function PitchForm({
  participants,
}: {
  participants: PromptBattleParticipant[];
}) {
  const [participantId, setParticipantId] = useState("");
  const [problem, setProblem] = useState("");
  const [hmw, setHmw] = useState("");
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedHtml, setPastedHtml] = useState("");
  const [link, setLink] = useState("");
  const [sketch, setSketch] = useState<Blob | null>(null);
  const [sketchName, setSketchName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && participants.some((p) => p.id === saved)) setParticipantId(saved);
    } catch {
      // storage unavailable — ignore
    }
  }, [participants]);

  const showStatus = (next: Status) => {
    setStatus(next);
    requestAnimationFrame(() =>
      statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setStatus(null);
    if (picked && (!isHtmlFile(picked.name, picked.type) || picked.size > MAX_HTML_BYTES)) {
      e.target.value = "";
      setFile(null);
      showStatus({
        kind: "error",
        message: picked.size > MAX_HTML_BYTES ? ERRORS.tooLarge : ERRORS.fileType,
      });
      return;
    }
    setFile(picked);
  };

  const handleSketchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setStatus(null);
    setSketch(null);
    setSketchName("");
    if (!picked) return;
    if (!(SKETCH_TYPES as readonly string[]).includes(picked.type)) {
      e.target.value = "";
      return showStatus({ kind: "error", message: PITCH_ERRORS.sketchType });
    }
    const small = await shrinkImage(picked);
    if (small.size > MAX_SKETCH_BYTES) {
      e.target.value = "";
      return showStatus({ kind: "error", message: PITCH_ERRORS.sketchTooLarge });
    }
    setSketch(small);
    setSketchName(picked.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!participantId) return showStatus({ kind: "error", message: ERRORS.participant });
    if (!problem.trim()) return showStatus({ kind: "error", message: PITCH_ERRORS.problem });
    if (!hmw.trim()) return showStatus({ kind: "error", message: PITCH_ERRORS.hmw });
    if (!idea.trim()) return showStatus({ kind: "error", message: PITCH_ERRORS.idea });
    if (mode === "file" && !file) return showStatus({ kind: "error", message: PITCH_ERRORS.prototype });
    if (mode === "paste" && !pastedHtml.trim())
      return showStatus({ kind: "error", message: PITCH_ERRORS.prototype });
    if (mode === "paste" && htmlByteLength(pastedHtml) > MAX_HTML_BYTES)
      return showStatus({ kind: "error", message: ERRORS.tooLarge });
    if (mode === "link" && !normalizeLink(link))
      return showStatus({
        kind: "error",
        message: link.trim() ? PITCH_ERRORS.link : PITCH_ERRORS.prototype,
      });

    const htmlBytes =
      mode === "file" ? file?.size ?? 0 : mode === "paste" ? htmlByteLength(pastedHtml) : 0;
    if (htmlBytes + (sketch?.size ?? 0) > MAX_UPLOAD_BYTES)
      return showStatus({ kind: "error", message: PITCH_ERRORS.uploadTooLarge });

    const body = new FormData();
    body.set("participant_id", participantId);
    body.set("problem", problem);
    body.set("hmw", hmw);
    body.set("idea", idea);
    if (mode === "file" && file) body.set("file", file);
    if (mode === "paste") body.set("html", pastedHtml);
    if (mode === "link") body.set("link", link);
    if (sketch) body.set("sketch", sketch, sketchName || "sketch");

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pitch", { method: "POST", body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.error ||
            (response.status === 413
              ? PITCH_ERRORS.uploadTooLarge
              : "ส่งผลงานไม่สำเร็จ โปรดลองอีกครั้ง"),
        );
      }
      try {
        localStorage.setItem(STORAGE_KEY, participantId);
      } catch {
        // storage unavailable — ignore
      }
      const time = new Date(result.submitted_at ?? Date.now()).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
      showStatus({
        kind: "success",
        message: `ส่งต้นแบบเรียบร้อยแล้ว (เวลา ${time} น.) — ถ้าส่งใหม่ ระบบจะใช้ผลงานล่าสุดแทน`,
      });
    } catch (error) {
      showStatus({
        kind: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "ส่งผลงานไม่สำเร็จ โปรดลองอีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rooms = new Map<string, PromptBattleParticipant[]>();
  for (const p of participants) {
    const room = p.classroom ? `ม.${p.classroom}` : "อื่น ๆ";
    rooms.set(room, [...(rooms.get(room) ?? []), p]);
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <p className="text-sm font-medium text-blue-700 mb-2">
            CD AI Innovation Bootcamp 2026
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
            ส่งต้นแบบ{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-800">
              Prototype PITCH
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            ส่งปัญหา, How Might We, ไอเดีย และต้นแบบที่จะนำเสนอ
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-5 sm:p-10">
          {participants.length === 0 ? (
            <p className="text-center text-gray-600">
              ยังไม่สามารถโหลดรายชื่อผู้เข้าร่วมค่ายได้ โปรดแจ้งพี่ TA
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label htmlFor="participant" className={labelClass}>
                  ชื่อของฉัน*
                </label>
                <select
                  id="participant"
                  value={participantId}
                  onChange={(e) => {
                    setParticipantId(e.target.value);
                    setStatus(null);
                  }}
                  className={`select-arrow ${inputClass}`}
                >
                  <option value="" disabled>
                    เลือกชื่อของตนเอง
                  </option>
                  {[...rooms].map(([room, people]) => (
                    <optgroup key={room} label={room}>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {participantLabel(p)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="problem" className={labelClass}>
                  ปัญหาที่เจอ*
                </label>
                <textarea
                  id="problem"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  maxLength={MAX_PROBLEM_CHARS}
                  rows={3}
                  className={inputClass}
                  placeholder="ปัญหาที่ผู้ใช้เจอคืออะไร"
                />
              </div>

              <div>
                <label htmlFor="hmw" className={labelClass}>
                  How Might We*{" "}
                  <span className="text-gray-400 font-normal">(1 ประโยค)</span>
                </label>
                <input
                  id="hmw"
                  type="text"
                  value={hmw}
                  onChange={(e) => setHmw(e.target.value)}
                  maxLength={MAX_HMW_CHARS}
                  className={inputClass}
                  placeholder="เราจะ ... ได้อย่างไร"
                />
              </div>

              <div>
                <label htmlFor="idea" className={labelClass}>
                  ไอเดียที่เลือก*
                </label>
                <textarea
                  id="idea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  maxLength={MAX_IDEA_CHARS}
                  rows={3}
                  className={inputClass}
                  placeholder="ไอเดียที่เลือกทำเป็นต้นแบบ"
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  ต้นแบบ (Prototype)*
                </legend>
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg mb-3">
                  {(
                    [
                      ["file", "ไฟล์ .html"],
                      ["paste", "วางโค้ด"],
                      ["link", "ลิงก์"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={mode === value}
                      onClick={() => {
                        setMode(value);
                        setStatus(null);
                      }}
                      className={`py-2 px-2 rounded-md text-sm font-medium transition-colors ${
                        mode === value
                          ? "bg-white text-blue-700 shadow"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {mode === "file" && (
                  <div>
                    <input
                      id="htmlFile"
                      type="file"
                      accept=".html,.htm,text/html"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 border border-gray-300 rounded-lg"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {file
                        ? `${file.name} · ${(file.size / 1024).toFixed(1)} KB`
                        : "ไฟล์ HTML หน้าเดียวที่ AI สร้าง ขนาดไม่เกิน 2 MB"}
                    </p>
                  </div>
                )}
                {mode === "paste" && (
                  <div>
                    <label htmlFor="pastedHtml" className="sr-only">
                      โค้ด HTML
                    </label>
                    <textarea
                      id="pastedHtml"
                      value={pastedHtml}
                      onChange={(e) => setPastedHtml(e.target.value)}
                      rows={8}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      className={`${inputClass} font-mono text-sm`}
                      placeholder="<!DOCTYPE html> ..."
                    />
                    <p className="mt-1 text-sm text-gray-500">ขนาดไม่เกิน 2 MB</p>
                  </div>
                )}
                {mode === "link" && (
                  <div>
                    <label htmlFor="link" className="sr-only">
                      ลิงก์ต้นแบบ
                    </label>
                    <input
                      id="link"
                      type="url"
                      inputMode="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className={inputClass}
                      placeholder="https://..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      ถ้าทำต้นแบบไว้ที่อื่น (เช่น Figma, Canva) — ต้องขึ้นต้นด้วย https://
                    </p>
                  </div>
                )}
              </fieldset>

              <div>
                <label htmlFor="sketch" className={labelClass}>
                  รูปสเก็ตช์{" "}
                  <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  id="sketch"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSketchChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 border border-gray-300 rounded-lg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {sketch
                    ? `${sketchName} · ${(sketch.size / 1024).toFixed(0)} KB`
                    : "PNG, JPG หรือ WEBP ไม่เกิน 5 MB"}
                </p>
              </div>

              <div ref={statusRef} aria-live="polite">
                {status && (
                  <p
                    role={status.kind === "error" ? "alert" : "status"}
                    className={`rounded-lg px-4 py-3 text-sm font-medium ${
                      status.kind === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {status.kind === "success" ? "✓ " : ""}
                    {status.message}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-8 py-4 bg-linear-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-lg ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "กำลังส่ง..." : "ส่งต้นแบบ"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
