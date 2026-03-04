"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-gray-500 mb-8">
          ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองอีกครั้ง
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  );
}
