"use client";
import Link from "next/link";
import { useRef, useState } from "react";

type View = "deck" | "site";

export default function FinalProjectPresenter({
  student,
  submission,
}: {
  student: { label: string; fullName: string; classroom: string | null };
  submission: {
    siteUrl: string | null;
    /** False when the link points back at this app — never framed. */
    siteEmbeddable: boolean;
    /** Short-lived signed Storage URL. */
    deckUrl: string | null;
    submittedAt: string;
  } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("deck");
  const title = `${student.label} — ${student.fullName}${student.classroom ? ` (ม.${student.classroom})` : ""}`;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  const tabClass = (v: View) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      view === v ? "bg-white text-blue-700 shadow" : "text-gray-600 hover:text-gray-900"
    }`;

  const placeholder = (message: string, href: string | null, action: string) => (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-gray-200 p-6 text-center">
      <p className="text-xl text-gray-700">{message}</p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white text-lg font-medium hover:bg-blue-700"
        >
          {action} ↗
        </a>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 bg-gray-50 min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] [&:fullscreen]:h-screen [&:fullscreen]:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex gap-4">
          <Link href="/admin/final-project" className="text-blue-600 hover:text-blue-800">← หน้ารวม Final Project</Link>
          <Link href="/admin/wheel" className="text-blue-600 hover:text-blue-800">วงล้อสุ่ม</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {submission?.deckUrl && (
            <a
              href={submission.deckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              เปิด PDF ↗
            </a>
          )}
          {submission?.siteUrl && (
            <a
              href={submission.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              เปิดเว็บไซต์ ↗
            </a>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            เต็มจอ
          </button>
        </div>
      </div>

      <header className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {student.label}
            <span className="ml-3 text-lg lg:text-xl font-normal text-gray-500">
              {student.fullName}
              {student.classroom ? ` · ม.${student.classroom}` : ""}
            </span>
          </h1>
          {submission ? (
            <p className="mt-1 text-sm text-gray-500 break-all">
              {submission.siteUrl ?? "ลิงก์ไม่ถูกต้อง"} · ส่งเมื่อ {submission.submittedAt} น.
            </p>
          ) : (
            <p className="mt-3 text-xl text-amber-700">ยังไม่ส่ง Final Project</p>
          )}
        </div>
        {submission && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg">
            <button type="button" aria-pressed={view === "deck"} onClick={() => setView("deck")} className={tabClass("deck")}>
              Pitch Deck
            </button>
            <button type="button" aria-pressed={view === "site"} onClick={() => setView("site")} className={tabClass("site")}>
              เว็บไซต์
            </button>
          </div>
        )}
      </header>

      {submission && (
        <div className="flex-1 min-h-[60vh] lg:min-h-0 flex">
          {view === "deck" ? (
            submission.deckUrl ? (
              <iframe
                key="deck"
                src={`${submission.deckUrl}#view=Fit`}
                title={`Pitch Deck — ${title}`}
                className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white"
              />
            ) : (
              placeholder("โหลด Pitch Deck ไม่สำเร็จ ลองรีเฟรชหน้า", null, "")
            )
          ) : submission.siteUrl && submission.siteEmbeddable ? (
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <iframe
                key="site"
                src={submission.siteUrl}
                title={`เว็บไซต์ — ${title}`}
                // Cross-origin site: its own origin, no access to this page.
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                referrerPolicy="no-referrer"
                className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white"
              />
              <p className="text-xs text-gray-400">
                ถ้าเว็บไม่แสดง (บางเว็บไม่อนุญาตให้ฝัง) กด “เปิดเว็บไซต์ ↗” ด้านบน
              </p>
            </div>
          ) : (
            placeholder("เปิดเว็บไซต์ในแท็บใหม่", submission.siteUrl, "เปิดเว็บไซต์")
          )}
        </div>
      )}
    </div>
  );
}
