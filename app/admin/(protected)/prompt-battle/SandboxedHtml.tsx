"use client";
import { useRef, useState } from "react";

// Student HTML is untrusted: render it only in an opaque-origin sandbox
// (scripts allowed; no same-origin, forms, popups, modals or top navigation),
// so it cannot read our cookies/storage or touch the parent page.
export default function SandboxedHtml({
  html,
  title,
  className = "",
}: {
  html: string;
  title: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700 truncate">{title}</span>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="px-3 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-white"
          >
            โหลดใหม่
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            เต็มจอ
          </button>
        </div>
      </div>
      <iframe
        key={reloadKey}
        title={title}
        sandbox="allow-scripts"
        srcDoc={html}
        referrerPolicy="no-referrer"
        className="flex-1 w-full border-0 bg-white"
      />
    </div>
  );
}
