"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface FinalProjectEntry {
  applicationId: string;
  student: { name: string; nickname: string | null; classroom: string | null };
  submission: {
    deployHost: string;
    deckMb: string | null;
    /** Pre-formatted (Asia/Bangkok) so server and client render the same text. */
    submittedAt: string;
    count: number;
  } | null;
}

const REFRESH_MS = 15_000;

export default function FinalProjectGallery({
  eventName,
  entries,
  loadError,
}: {
  eventName: string;
  entries: FinalProjectEntry[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [autoRefresh, router]);

  const submitted = entries.filter((e) => e.submission);
  const missing = entries.filter((e) => !e.submission);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Final Project</h1>
          <p className="text-gray-500 mt-1">
            {eventName} · ส่งแล้ว{" "}
            <span className="font-semibold text-gray-900 tabular-nums">
              {submitted.length}/{entries.length}
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
          <Link
            href="/admin/wheel"
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            วงล้อสุ่ม
          </Link>
        </div>
      </div>

      {loadError && (
        <p className="mb-4 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
          {loadError}
        </p>
      )}

      {submitted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          ยังไม่มี Final Project ที่ส่งเข้ามา
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {submitted.map(({ applicationId, student, submission: s }) => (
            <div key={applicationId} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
              <p className="font-semibold text-gray-900 truncate">
                {student.nickname ?? student.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {student.name}
                {student.classroom ? ` · ม.${student.classroom}` : ""}
              </p>
              <p className="mt-3 text-sm text-gray-700 truncate flex-1" title={s!.deployHost}>
                <span className="font-medium">เว็บ:</span> {s!.deployHost}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-medium">Pitch Deck:</span> PDF
                {s!.deckMb ? ` · ${s!.deckMb} MB` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span className="tabular-nums">
                  ส่งเมื่อ {s!.submittedAt} น.
                  {s!.count > 1 ? ` · ส่ง ${s!.count} ครั้ง` : ""}
                </span>
                <Link
                  href={`/admin/final-project/${applicationId}`}
                  className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 font-medium hover:bg-blue-100"
                >
                  เปิดผลงาน
                </Link>
              </div>
            </div>
          ))}
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
            {missing.map(({ applicationId, student: s }) => (
              <li
                key={applicationId}
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
