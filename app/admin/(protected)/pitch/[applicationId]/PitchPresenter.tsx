"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import SandboxedHtml from "../../prompt-battle/SandboxedHtml";

export default function PitchPresenter({
  student,
  submission,
}: {
  student: { label: string; fullName: string; classroom: string | null };
  submission: {
    problem: string;
    hmw: string;
    idea: string;
    html: string | null;
    linkUrl: string | null;
    sketchUrl: string | null;
    submittedAt: string;
  } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSketch, setShowSketch] = useState(false);
  const title = `${student.label} — ${student.fullName}${student.classroom ? ` (ม.${student.classroom})` : ""}`;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 bg-gray-50 min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] [&:fullscreen]:h-screen [&:fullscreen]:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex gap-4">
          <Link href="/admin/pitch" className="text-blue-600 hover:text-blue-800">← หน้ารวม Pitch</Link>
          <Link href="/admin/wheel" className="text-blue-600 hover:text-blue-800">วงล้อสุ่ม</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {submission?.sketchUrl && (
            <button
              type="button"
              aria-pressed={showSketch}
              onClick={() => setShowSketch((v) => !v)}
              className={`px-3 py-2 rounded-lg border ${
                showSketch
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {showSketch ? "ซ่อนสเก็ตช์" : "แสดงสเก็ตช์"}
            </button>
          )}
          {submission?.linkUrl && (
            <a
              href={submission.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              เปิดลิงก์ต้นแบบ ↗
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

      <header className="bg-white rounded-xl border border-gray-200 px-5 py-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
          {student.label}
          <span className="ml-3 text-lg lg:text-xl font-normal text-gray-500">
            {student.fullName}
            {student.classroom ? ` · ม.${student.classroom}` : ""}
          </span>
        </h1>
        {submission ? (
          <div className="mt-3 grid gap-2 lg:grid-cols-[2fr_1fr] text-gray-800">
            <div className="space-y-2">
              <p className="text-xl lg:text-2xl font-semibold leading-snug whitespace-pre-wrap">
                <span className="text-blue-700">HMW:</span> {submission.hmw}
              </p>
              <p className="text-lg lg:text-xl whitespace-pre-wrap">
                <span className="font-semibold text-blue-700">ไอเดีย:</span> {submission.idea}
              </p>
            </div>
            <p className="text-base text-gray-600 whitespace-pre-wrap lg:border-l lg:border-gray-200 lg:pl-4">
              <span className="font-semibold text-gray-700">ปัญหาที่เจอ:</span> {submission.problem}
              <span className="block mt-2 text-xs text-gray-400">ส่งเมื่อ {submission.submittedAt} น.</span>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xl text-amber-700">ยังไม่ส่งต้นแบบ</p>
        )}
      </header>

      {submission && (
        <div className="flex-1 min-h-[60vh] lg:min-h-0 flex gap-4">
          {(!showSketch || submission.html) && (
            submission.html ? (
              <SandboxedHtml html={submission.html} title={title} className="flex-1 min-w-0" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-xl text-gray-700">ต้นแบบเป็นลิงก์ภายนอก</p>
                <p className="text-sm text-gray-500 break-all max-w-xl">{submission.linkUrl}</p>
                {submission.linkUrl && (
                  <a
                    href={submission.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white text-lg font-medium hover:bg-blue-700"
                  >
                    เปิดต้นแบบในแท็บใหม่ ↗
                  </a>
                )}
              </div>
            )
          )}
          {showSketch && submission.sketchUrl && (
            <div className={`${submission.html ? "w-[38%]" : "flex-1"} min-w-0 bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-center`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- auth-gated API route */}
              <img
                src={submission.sketchUrl}
                alt={`สเก็ตช์ของ ${student.label}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
