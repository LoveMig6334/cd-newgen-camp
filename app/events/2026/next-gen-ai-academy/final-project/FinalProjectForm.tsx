"use client";
import {
  DECK_BUCKET,
  FINAL_PROJECT_ERRORS,
  MAX_DECK_BYTES,
  checkDeployUrl,
  isPdf,
  isPdfName,
} from "@/lib/finalProject";
import { ERRORS, participantLabel } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/client";
import type { PromptBattleParticipant } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type Status = { kind: "success" | "error"; message: string } | null;

// Shared with the Prompt Battle form so the name is remembered across both.
const STORAGE_KEY = "prompt-battle-participant";

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Client-side check of the picked file; the bucket also enforces type and size. */
async function deckError(file: File): Promise<string | null> {
  if (!isPdfName(file.name) && file.type !== "application/pdf") return FINAL_PROJECT_ERRORS.deckType;
  if (file.size > MAX_DECK_BYTES) return FINAL_PROJECT_ERRORS.deckTooLarge;
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return isPdf(head) ? null : FINAL_PROJECT_ERRORS.deckType;
}

/** Map Storage upload errors to something a student can act on. */
function uploadErrorMessage(error: { message?: string; statusCode?: string | number }): string {
  const text = `${error.statusCode ?? ""} ${error.message ?? ""}`.toLowerCase();
  if (text.includes("413") || text.includes("too large") || text.includes("size"))
    return FINAL_PROJECT_ERRORS.deckTooLarge;
  if (text.includes("mime") || text.includes("type")) return FINAL_PROJECT_ERRORS.deckType;
  if (text.includes("row-level security") || text.includes("403")) return ERRORS.participant;
  return FINAL_PROJECT_ERRORS.deckUpload;
}

export default function FinalProjectForm({
  participants,
}: {
  participants: PromptBattleParticipant[];
}) {
  const [participantId, setParticipantId] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [deck, setDeck] = useState<File | null>(null);
  const [step, setStep] = useState<"idle" | "uploading" | "saving">("idle");
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

  const handleDeckChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setStatus(null);
    setDeck(null);
    if (!picked) return;
    const error = await deckError(picked);
    if (error) {
      e.target.value = "";
      return showStatus({ kind: "error", message: error });
    }
    setDeck(picked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!participantId) return showStatus({ kind: "error", message: ERRORS.participant });
    const deploy = checkDeployUrl(deployUrl);
    if ("error" in deploy) return showStatus({ kind: "error", message: deploy.error });
    if (!deck) return showStatus({ kind: "error", message: FINAL_PROJECT_ERRORS.deck });

    try {
      // 1) PDF straight to Storage — too big to pass through the API route.
      setStep("uploading");
      const deckPath = `${participantId}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await createClient()
        .storage.from(DECK_BUCKET)
        .upload(deckPath, deck, { contentType: "application/pdf", upsert: false });
      if (uploadError) {
        console.error("Deck upload error:", uploadError);
        throw new Error(uploadErrorMessage(uploadError));
      }

      // 2) Record the submission.
      setStep("saving");
      const response = await fetch("/api/final-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: participantId,
          deploy_url: deploy.url,
          deck_path: deckPath,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "ส่งผลงานไม่สำเร็จ โปรดลองอีกครั้ง");
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
        message: `ส่ง Final Project เรียบร้อยแล้ว (เวลา ${time} น.) — ถ้าส่งใหม่ ระบบจะใช้ผลงานล่าสุดแทน`,
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
      setStep("idle");
    }
  };

  const rooms = new Map<string, PromptBattleParticipant[]>();
  for (const p of participants) {
    const room = p.classroom ? `ม.${p.classroom}` : "อื่น ๆ";
    rooms.set(room, [...(rooms.get(room) ?? []), p]);
  }
  const isSubmitting = step !== "idle";

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-10 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <p className="text-sm font-medium text-blue-700 mb-2">
            CD AI Innovation Bootcamp 2026
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
            ส่ง{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-800">
              Final Project
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            ส่งลิงก์เว็บไซต์ที่ deploy แล้ว และ Pitch Deck (PDF)
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
                <label htmlFor="deployUrl" className={labelClass}>
                  ลิงก์เว็บไซต์ที่ deploy แล้ว*
                </label>
                <input
                  id="deployUrl"
                  type="url"
                  inputMode="url"
                  value={deployUrl}
                  onChange={(e) => setDeployUrl(e.target.value)}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={inputClass}
                  placeholder="https://my-project.vercel.app"
                />
                <p className="mt-1 text-sm text-gray-500">
                  ลิงก์ที่คนอื่นเปิดได้จริง (เช่น Vercel, Netlify, GitHub Pages) — ไม่ใช่ localhost
                </p>
              </div>

              <div>
                <label htmlFor="deck" className={labelClass}>
                  Pitch Deck (PDF)*
                </label>
                <input
                  id="deck"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleDeckChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 border border-gray-300 rounded-lg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {deck
                    ? `${deck.name} · ${formatMb(deck.size)}`
                    : `Export จาก Canva / Google Slides / PowerPoint เป็น PDF ขนาดไม่เกิน ${MAX_DECK_BYTES / 1024 / 1024} MB`}
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
                  {step === "uploading"
                    ? "กำลังอัปโหลด PDF..."
                    : step === "saving"
                      ? "กำลังบันทึก..."
                      : "ส่ง Final Project"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
