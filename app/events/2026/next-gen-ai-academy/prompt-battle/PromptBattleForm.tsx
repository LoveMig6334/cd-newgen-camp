"use client";
import {
  ERRORS,
  MAX_HTML_BYTES,
  MAX_PROMPT_CHARS,
  htmlByteLength,
  isHtmlFile,
  participantLabel,
} from "@/lib/promptBattle";
import type { PromptBattleParticipant } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type HtmlMode = "file" | "paste";
type Status = { kind: "success" | "error"; message: string } | null;

const STORAGE_KEY = "prompt-battle-participant";

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";

export default function PromptBattleForm({
  participants,
}: {
  participants: PromptBattleParticipant[];
}) {
  const [participantId, setParticipantId] = useState("");
  const [mode, setMode] = useState<HtmlMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedHtml, setPastedHtml] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Remember who submitted on this device so resubmitting is one tap less.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && participants.some((p) => p.id === saved)) {
        setParticipantId(saved);
      }
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
    if (picked && !isHtmlFile(picked.name, picked.type)) {
      e.target.value = "";
      setFile(null);
      showStatus({ kind: "error", message: ERRORS.fileType });
      return;
    }
    if (picked && picked.size > MAX_HTML_BYTES) {
      e.target.value = "";
      setFile(null);
      showStatus({ kind: "error", message: ERRORS.tooLarge });
      return;
    }
    setFile(picked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!participantId) return showStatus({ kind: "error", message: ERRORS.participant });
    if (mode === "file" && !file) return showStatus({ kind: "error", message: ERRORS.htmlMissing });
    if (mode === "paste" && !pastedHtml.trim())
      return showStatus({ kind: "error", message: ERRORS.htmlMissing });
    if (mode === "paste" && htmlByteLength(pastedHtml) > MAX_HTML_BYTES)
      return showStatus({ kind: "error", message: ERRORS.tooLarge });
    if (!prompt.trim()) return showStatus({ kind: "error", message: ERRORS.prompt });

    const body = new FormData();
    body.set("participant_id", participantId);
    body.set("prompt", prompt);
    if (mode === "file" && file) body.set("file", file);
    else body.set("html", pastedHtml);

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/prompt-battle", { method: "POST", body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.error ||
            (response.status === 413 ? ERRORS.tooLarge : "ส่งผลงานไม่สำเร็จ โปรดลองอีกครั้ง"),
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
        message: `ส่งผลงานเรียบร้อยแล้ว (เวลา ${time} น.) — ถ้าส่งใหม่ ระบบจะใช้ผลงานล่าสุดแทน`,
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

  // Group the dropdown by classroom (participants arrive sorted by room).
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
            ส่งผลงาน{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-800">
              Prompt Battle
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            ส่งไฟล์ HTML ที่ AI สร้างให้ พร้อม Prompt ที่ใช้
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-5 sm:p-10">
          {participants.length === 0 ? (
            <p className="text-center text-gray-600">
              ยังไม่สามารถโหลดรายชื่อผู้เข้าร่วมค่ายได้ โปรดแจ้งพี่ TA
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="participant"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ชื่อของฉัน*
                </label>
                <select
                  id="participant"
                  required
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

              <fieldset className="mt-6">
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  ไฟล์ HTML*
                </legend>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg mb-3">
                  {(
                    [
                      ["file", "อัปโหลดไฟล์ .html"],
                      ["paste", "วางโค้ด HTML"],
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
                      className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        mode === value
                          ? "bg-white text-blue-700 shadow"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {mode === "file" ? (
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
                        : "เฉพาะไฟล์ .html ขนาดไม่เกิน 2 MB"}
                    </p>
                  </div>
                ) : (
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
              </fieldset>

              <div className="mt-6">
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prompt ที่ใช้*
                </label>
                <textarea
                  id="prompt"
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={MAX_PROMPT_CHARS}
                  rows={8}
                  className={inputClass}
                  placeholder="คัดลอก Prompt ทั้งหมดที่ใช้สั่ง AI มาวางที่นี่"
                />
                <p className="mt-1 text-right text-xs text-gray-400 tabular-nums">
                  {prompt.length.toLocaleString()} / {MAX_PROMPT_CHARS.toLocaleString()}
                </p>
              </div>

              <div ref={statusRef} aria-live="polite">
                {status && (
                  <p
                    role={status.kind === "error" ? "alert" : "status"}
                    className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
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

              <div className="mt-6 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-8 py-4 bg-linear-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-lg ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "กำลังส่งผลงาน..." : "ส่งผลงาน"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
