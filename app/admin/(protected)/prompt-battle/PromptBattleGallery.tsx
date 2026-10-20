"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface GalleryEntry {
  submissionId: string;
  student: { name: string; nickname: string | null; classroom: string | null };
  prompt: string;
  /** Pre-formatted (Asia/Bangkok) so server and client render the same text. */
  submittedAt: string;
  /** How many times this student has submitted. */
  count: number;
}

const MAX_COMPARE = 4;
const REFRESH_MS = 15_000;

export default function PromptBattleGallery({
  eventName,
  entries,
  missing,
  loadError,
}: {
  eventName: string;
  entries: GalleryEntry[];
  missing: GalleryEntry["student"][];
  loadError: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [autoRefresh, router]);

  // Drop selections whose submission was replaced by a newer one.
  const visibleSelected = selected.filter((id) =>
    entries.some((e) => e.submissionId === id),
  );

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id].slice(-MAX_COMPARE),
    );

  const total = entries.length + missing.length;

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prompt Battle</h1>
          <p className="text-gray-500 mt-1">
            {eventName} · ส่งแล้ว{" "}
            <span className="font-semibold text-gray-900 tabular-nums">
              {entries.length}/{total}
            </span>{" "}
            คน
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4"
            />
            รีเฟรชอัตโนมัติ
          </label>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            รีเฟรช
          </button>
          {visibleSelected.length > 0 ? (
            <Link
              href={`/admin/prompt-battle/view?ids=${visibleSelected.join(",")}`}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              เปรียบเทียบ ({visibleSelected.length})
            </Link>
          ) : (
            <span className="text-sm text-gray-400">
              เลือกได้สูงสุด {MAX_COMPARE} ผลงานเพื่อเปรียบเทียบ
            </span>
          )}
        </div>
      </div>

      {loadError && (
        <p className="mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
          {loadError}
        </p>
      )}

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          ยังไม่มีผลงานที่ส่งเข้ามา
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => {
            const isSelected = visibleSelected.includes(entry.submissionId);
            return (
              <div
                key={entry.submissionId}
                className={`bg-white rounded-xl border p-4 flex flex-col ${
                  isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {entry.student.nickname ?? entry.student.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {entry.student.name}
                      {entry.student.classroom ? ` · ม.${entry.student.classroom}` : ""}
                    </p>
                  </div>
                  <label className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(entry.submissionId)}
                      className="h-4 w-4"
                    />
                    เทียบ
                  </label>
                </div>
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap line-clamp-5 flex-1">
                  {entry.prompt}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="tabular-nums">
                    ส่งเมื่อ {entry.submittedAt} น.
                    {entry.count > 1 ? ` · ส่ง ${entry.count} ครั้ง` : ""}
                  </span>
                  <Link
                    href={`/admin/prompt-battle/view?ids=${entry.submissionId}`}
                    className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 font-medium hover:bg-blue-100"
                  >
                    ดูผลงาน
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          ยังไม่ส่ง{" "}
          <span className="text-gray-500 font-normal tabular-nums">({missing.length})</span>
        </h2>
        {missing.length === 0 ? (
          <p className="text-sm text-gray-500">ส่งครบทุกคนแล้ว 🎉</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {missing.map((s, i) => (
              <li
                key={`${s.name}-${i}`}
                className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-sm text-amber-900"
              >
                {s.nickname ? `${s.nickname} (${s.name})` : s.name}
                {s.classroom ? ` · ม.${s.classroom}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
