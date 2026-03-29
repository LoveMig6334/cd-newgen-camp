"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaRegLightbulb, FaRobot } from "react-icons/fa";
import { FaPuzzlePiece } from "react-icons/fa6";
import { SiOpenai, SiPython } from "react-icons/si";
import {
  TbListCheck,
  TbMessageChatbot,
  TbSparkles,
  TbTerminal2,
  TbWriting,
} from "react-icons/tb";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const promptTopics = [
  {
    id: "basics",
    title: "พื้นฐาน Prompt Engineering",
    icon: <TbWriting className="text-3xl mb-2" />,
    description:
      "เรียนรู้หลักการเขียน Prompt ที่ดี เพื่อให้ AI เข้าใจสิ่งที่เราต้องการ",
    details:
      "Prompt Engineering คือศิลปะในการสื่อสารกับ AI อย่างมีประสิทธิภาพ เราจะเรียนรู้เทคนิคต่างๆ เช่น การให้บริบท, การกำหนดบทบาท, การแบ่งงานเป็นขั้นตอน และการใช้ตัวอย่าง เพื่อให้ได้ผลลัพธ์ที่ดีที่สุด",
  },
  {
    id: "techniques",
    title: "เทคนิคขั้นสูง",
    icon: <TbSparkles className="text-3xl mb-2" />,
    description:
      "Zero-shot, Few-shot, Chain of Thought และ Role Prompting",
    details:
      "เรียนรู้เทคนิคขั้นสูงของ Prompt Engineering เช่น Zero-shot (ไม่ให้ตัวอย่าง), Few-shot (ให้ตัวอย่างเล็กน้อย), Chain of Thought (ให้ AI คิดเป็นขั้นตอน) และ Role Prompting (กำหนดบทบาทให้ AI)",
  },
  {
    id: "chatgpt",
    title: "ใช้ ChatGPT อย่างมือโปร",
    icon: <SiOpenai className="text-3xl mb-2" />,
    description:
      "เทคนิคการใช้ ChatGPT ในการเรียน, ทำการบ้าน และโปรเจค",
    details:
      "เรียนรู้วิธีใช้ ChatGPT อย่างมีประสิทธิภาพ ทั้งการช่วยสรุปบทเรียน, อธิบายแนวคิดยากๆ, ช่วยเขียนโค้ด, สร้างแผนการเรียน และทำโปรเจคกลุ่ม พร้อมทั้งข้อจำกัดและสิ่งที่ควรระวัง",
  },
  {
    id: "ethics",
    title: "จริยธรรม AI",
    icon: <TbListCheck className="text-3xl mb-2" />,
    description:
      "การใช้ AI อย่างรับผิดชอบ ข้อจำกัด และอคติของ AI",
    details:
      "AI ไม่ได้สมบูรณ์แบบ มีข้อจำกัดและอคติที่ต้องระวัง เราจะเรียนรู้เรื่อง AI Hallucination, Bias, ลิขสิทธิ์, และหลักจริยธรรมในการใช้ AI อย่างรับผิดชอบ รวมถึงการตรวจสอบข้อมูลจาก AI",
  },
];

const promptExamples = [
  {
    id: "bad",
    title: "Prompt ที่ไม่ดี",
    prompt: "บอกเรื่อง AI",
    result: "ได้คำตอบกว้างเกินไป ไม่ตรงประเด็น",
    type: "bad",
  },
  {
    id: "better",
    title: "Prompt ที่ดีขึ้น",
    prompt:
      "อธิบาย Machine Learning ให้นักเรียน ม.ปลาย เข้าใจ โดยใช้ตัวอย่างในชีวิตจริง",
    result: "ได้คำตอบที่เจาะจง เหมาะกับกลุ่มเป้าหมาย",
    type: "good",
  },
  {
    id: "best",
    title: "Prompt ที่ดีที่สุด",
    prompt:
      'คุณเป็นครูสอนคอมพิวเตอร์ระดับมัธยม อธิบาย Machine Learning ให้เข้าใจง่ายใน 3 ย่อหน้า:\n1. ML คืออะไร (ใช้ตัวอย่าง Netflix แนะนำหนัง)\n2. ทำงานอย่างไร (อธิบายด้วยภาษาง่ายๆ)\n3. ใช้ในชีวิตจริงอย่างไร',
    result:
      "ได้คำตอบที่มีโครงสร้างชัดเจน ตรงประเด็น และเหมาะกับผู้อ่าน",
    type: "best",
  },
];

export default function PromptEngineering() {
  const [activeSection, setActiveSection] = useState("what");

  return (
    <div className="min-h-screen bg-linear-to-b from-yellow-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-yellow-50/80 border-b border-yellow-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/events/2026/next-gen-ai-academy"
            className="flex items-center text-yellow-700 hover:text-yellow-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center">
            <TbSparkles className="text-yellow-500 mr-2 text-2xl sm:text-3xl" />
            Prompt Engineering
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-linear-to-br from-yellow-400 to-amber-300 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute left-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute left-3/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute left-1/4 top-3/4 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute left-3/4 top-3/4 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/15 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="md:w-1/2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-shadow mb-4">
                เทคนิคการใช้ AI
              </h2>
              <p className="text-lg text-yellow-50">
                เรียนรู้ศิลปะในการสื่อสารกับ AI อย่างมีประสิทธิภาพ
                ตั้งแต่การเขียน Prompt พื้นฐาน ไปจนถึงเทคนิคขั้นสูง
                ที่ใช้ได้กับทั้ง ChatGPT, Claude และ AI อื่นๆ
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-md rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <TbMessageChatbot className="text-9xl text-white/90" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide py-2 gap-2">
            {[
              { key: "what", label: "Prompt Engineering คืออะไร" },
              { key: "topics", label: "หัวข้อที่เรียนรู้" },
              { key: "examples", label: "ตัวอย่าง Prompt" },
              { key: "activities", label: "กิจกรรมในค่าย" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeSection === tab.key
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-transparent text-gray-700 hover:bg-yellow-50"
                }`}
                onClick={() => setActiveSection(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeSection === "what" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaRegLightbulb className="text-yellow-500 mr-2" />
              Prompt Engineering คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                Prompt Engineering คือทักษะในการเขียนคำสั่ง (Prompt)
                ให้ AI เข้าใจสิ่งที่เราต้องการและให้คำตอบที่ดีที่สุด
                เปรียบเสมือนการสื่อสารกับผู้ช่วยที่ฉลาดมาก
                แต่ต้องบอกให้ชัดเจนว่าต้องการอะไร
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <h3 className="font-bold text-gray-800">
                    หลักการ Prompt ที่ดี
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>ชัดเจน — บอกสิ่งที่ต้องการอย่างเจาะจง</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>ให้บริบท — บอก AI ว่าคุณคือใคร ต้องการอะไร</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>
                        กำหนดรูปแบบ — บอกว่าต้องการคำตอบแบบไหน
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>ให้ตัวอย่าง — แสดงผลลัพธ์ที่คาดหวัง</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <h3 className="font-bold text-gray-800">
                    AI Tools ที่เราจะใช้
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>
                        <strong>ChatGPT</strong> — AI สนทนาจาก OpenAI
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>
                        <strong>Claude</strong> — AI สนทนาจาก Anthropic
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>
                        <strong>DALL-E / Midjourney</strong> — AI สร้างรูปภาพ
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>
                        <strong>Claude Code</strong> — AI ช่วยเขียนโค้ด
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-5 bg-linear-to-r from-yellow-100 to-yellow-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  ทำไม Prompt Engineering ถึงสำคัญ?
                </h3>
                <p>
                  AI เหมือนเครื่องมือที่ทรงพลังมาก
                  แต่จะดีแค่ไหนขึ้นอยู่กับวิธีที่เราใช้มัน
                  การเขียน Prompt ที่ดีสามารถทำให้ AI
                  ช่วยเราได้มากกว่าที่คิดหลายเท่า
                  ทั้งในการเรียน การทำงาน และการสร้างสรรค์
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "topics" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPuzzlePiece className="text-yellow-500 mr-2" />
              หัวข้อที่จะเรียนรู้
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {promptTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow"
                  variants={fadeIn}
                >
                  <div className="text-yellow-500">{topic.icon}</div>
                  <h3 className="font-bold text-gray-800 mt-1">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {topic.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{topic.details}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {activeSection === "examples" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TbMessageChatbot className="text-yellow-500 mr-2" />
              ตัวอย่าง Prompt
            </h2>
            <div className="space-y-6">
              {promptExamples.map((example) => (
                <motion.div
                  key={example.id}
                  className={`p-5 rounded-xl border ${
                    example.type === "bad"
                      ? "bg-red-50 border-red-200"
                      : example.type === "good"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                  }`}
                  variants={fadeIn}
                >
                  <div className="flex items-center mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        example.type === "bad"
                          ? "bg-red-200 text-red-800"
                          : example.type === "good"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-green-200 text-green-800"
                      }`}
                    >
                      {example.title}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg mt-2 font-mono text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {example.prompt}
                    </pre>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {example.result}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === "activities" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TbSparkles className="text-yellow-500 mr-2" />
              กิจกรรมในค่าย
            </h2>
            <div className="space-y-6">
              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Workshop: Prompt Lab
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>ฝึกเขียน Prompt กับ ChatGPT และ Claude</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>ทดลองเทคนิค Zero-shot, Few-shot, Chain of Thought</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>สร้าง AI ช่วยสรุปบทเรียนจากหนังสือเรียน</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Challenge: Prompt Battle
                </h3>
                <p className="mt-2 text-gray-600">
                  แข่งขันเขียน Prompt ให้ AI ทำงานตามโจทย์ที่กำหนด
                  เช่น สร้างเรื่องสั้น, แก้ปัญหาคณิต, ออกแบบแอปไอเดีย
                  ทีมที่ได้ผลลัพธ์ดีที่สุดจะได้รางวัล
                </p>
              </div>

              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Project: AI Tutor ส่วนตัว
                </h3>
                <p className="mt-2 text-gray-600">
                  สร้าง System Prompt สำหรับ AI Tutor ในวิชาที่ชอบ
                  กำหนดบุคลิก วิธีการสอน และรูปแบบการตอบ
                  ให้ AI เป็นครูสอนพิเศษที่เข้าใจตัวเราที่สุด
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="border-t border-yellow-100 pt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            หัวข้ออื่นๆ ในค่าย
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/events/2026/next-gen-ai-academy/topics/ai-fundamentals"
              className="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
            >
              <FaRobot className="text-yellow-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">
                AI Fundamentals
              </span>
            </Link>
            <Link
              href="/events/2026/next-gen-ai-academy/topics/python"
              className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow"
            >
              <SiPython className="text-blue-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">
                Python เบื้องต้น
              </span>
            </Link>
            <Link
              href="/events/2026/next-gen-ai-academy/topics/claude-code"
              className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow"
            >
              <TbTerminal2 className="text-blue-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">Claude Code</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
