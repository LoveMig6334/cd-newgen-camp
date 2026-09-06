"use client";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import { FiArrowLeft, FiCheck, FiCopy, FiExternalLink } from "react-icons/fi";
import { DISCORD_INVITE_URL } from "@/lib/discord";

interface DiscordJoinProps {
  campName: string;
  /** Path back to the event landing page. */
  eventHref: string;
  inviteUrl?: string;
}

const STEPS = [
  {
    title: "กดปุ่ม “เข้าร่วม Discord”",
    detail: "ลิงก์จะเปิด Discord ในแอปหรือเบราว์เซอร์",
  },
  {
    title: "เข้าสู่ระบบหรือสมัครบัญชี",
    detail: "ถ้ายังไม่มีบัญชี Discord สมัครฟรีได้ในไม่กี่นาที",
  },
  {
    title: "ตั้งชื่อในเซิร์ฟเวอร์เป็นชื่อจริง",
    detail: "เพื่อให้ทีมงานยืนยันตัวตนและส่งข้อมูลถึงคุณได้",
  },
];

export default function DiscordJoin({
  campName,
  eventHref,
  inviteUrl = DISCORD_INVITE_URL,
}: DiscordJoinProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("คัดลอกลิงก์นี้:", inviteUrl);
    }
  };

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-linear-to-b from-blue-50 to-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-indigo-100 rounded-full opacity-70 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-blue-100 rounded-full opacity-70 blur-3xl"
        />

        <div className="relative container mx-auto px-4 py-10 sm:py-16 min-h-screen flex items-center">
          <div className="w-full max-w-3xl mx-auto">
            {/* Success banner */}
            <motion.div {...fadeUp(0)} className="text-center mb-8 sm:mb-10">
              <div
                aria-hidden="true"
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiCheck className="h-8 w-8 text-green-600" strokeWidth={3} />
              </div>
              <p
                role="status"
                aria-live="polite"
                className="text-sm font-medium text-green-700 uppercase tracking-wide mb-2"
              >
                ส่งใบสมัครสำเร็จ
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-balance">
                ขั้นตอนสุดท้าย: เข้าร่วม Discord ของ{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-700">
                  {campName}
                </span>
              </h1>
              <p className="mt-3 text-gray-600 text-pretty max-w-xl mx-auto">
                ทีมงานจะประกาศผลการคัดเลือก ตารางกิจกรรม และข่าวสารทั้งหมดผ่าน
                Discord เท่านั้น อย่าลืมเข้าร่วมก่อนออกจากหน้านี้
              </p>
            </motion.div>

            {/* Discord card */}
            <motion.section
              {...fadeUp(0.1)}
              aria-labelledby="discord-heading"
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-[#5865F2] text-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                <div
                  aria-hidden="true"
                  className="shrink-0 w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center"
                >
                  <FaDiscord className="w-12 h-12" />
                </div>
                <div className="min-w-0">
                  <h2 id="discord-heading" className="text-2xl font-bold">
                    เซิร์ฟเวอร์ Discord <span translate="no">{campName}</span>
                  </h2>
                  <p className="mt-1 text-white/85 text-pretty">
                    พื้นที่พูดคุย ถามตอบ และรับข่าวสารสำหรับผู้สมัครทุกคน
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-10 sm:py-8">
                <ol className="space-y-4 mb-8">
                  {STEPS.map((step, i) => (
                    <li key={step.title} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center tabular-nums"
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {step.title}
                        </p>
                        <p className="text-sm text-gray-600">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#5865F2] text-white text-lg font-bold shadow-md hover:bg-[#4752C4] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] focus-visible:ring-offset-2 transition-[background-color,transform] duration-200 touch-manipulation"
                  >
                    <FaDiscord aria-hidden="true" className="w-6 h-6" />
                    เข้าร่วม Discord
                    <FiExternalLink
                      aria-hidden="true"
                      className="w-4 h-4 opacity-80"
                    />
                    <span className="sr-only">(เปิดในแท็บใหม่)</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-[background-color,transform] duration-200 touch-manipulation"
                  >
                    {copied ? (
                      <FiCheck
                        aria-hidden="true"
                        className="w-5 h-5 text-green-600"
                      />
                    ) : (
                      <FiCopy aria-hidden="true" className="w-5 h-5" />
                    )}
                    {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
                  </button>
                </div>
                <p
                  aria-live="polite"
                  className="mt-3 text-center text-xs text-gray-500 break-all"
                >
                  <span translate="no">{inviteUrl}</span>
                </p>
              </div>
            </motion.section>

            <motion.div {...fadeUp(0.2)} className="mt-8 text-center">
              <Link
                href={eventHref}
                className="inline-flex items-center gap-2 py-2 text-blue-600 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors"
              >
                <FiArrowLeft aria-hidden="true" className="w-5 h-5" />
                กลับสู่หน้ากิจกรรม
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
