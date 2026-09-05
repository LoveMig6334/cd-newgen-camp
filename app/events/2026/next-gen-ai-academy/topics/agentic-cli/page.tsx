"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaRegLightbulb, FaRobot } from "react-icons/fa";
import { FaPuzzlePiece } from "react-icons/fa6";
import { LuBrain } from "react-icons/lu";
import {
  TbCode,
  TbGitBranch,
  TbRobot,
  TbSparkles,
  TbTerminal2,
  TbWand,
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

const agenticTopics = [
  {
    id: "what-is-agentic-cli",
    title: "Agentic CLI คืออะไร",
    icon: <TbTerminal2 className="text-3xl mb-2" />,
    description:
      "ทำความรู้จัก AI Agent ที่ทำงานผ่าน Terminal เช่น Claude Code, Gemini CLI, Codex CLI",
    details:
      "Agentic CLI คือเครื่องมือ AI ที่ไม่ได้แค่ตอบคำถาม แต่ลงมือทำงานแทนเราได้ ทั้งอ่านไฟล์ แก้ไขโค้ด รันคำสั่ง และตรวจสอบผลลัพธ์เอง เราจะเรียนรู้ว่ามันทำงานอย่างไร และต่างจากแชทบอทธรรมดาตรงไหน",
  },
  {
    id: "agent-loop",
    title: "วิธีคิดแบบ Agent",
    icon: <TbRobot className="text-3xl mb-2" />,
    description:
      "เข้าใจวงจร วางแผน → ลงมือทำ → ตรวจสอบ → แก้ไข ของ AI Agent",
    details:
      "AI Agent ทำงานเป็นรอบๆ: รับโจทย์ วางแผน เลือกใช้เครื่องมือ (อ่านไฟล์, รันคำสั่ง, ค้นหา) แล้วดูผลลัพธ์เพื่อตัดสินใจขั้นต่อไป เราจะเรียนรู้วิธีตั้งโจทย์ให้ Agent ทำงานได้ถูกต้อง และวิธีตรวจสอบสิ่งที่ Agent ทำ",
  },
  {
    id: "ai-coding",
    title: "สร้างโปรเจคด้วย AI Agent",
    icon: <TbCode className="text-3xl mb-2" />,
    description:
      "ใช้ Agentic CLI สร้างเว็บไซต์และแอปพลิเคชันจริงตั้งแต่ต้นจนจบ",
    details:
      "เรียนรู้การวางแผนและสร้างโปรเจคจริงด้วย AI Agent ตั้งแต่การอธิบายสิ่งที่ต้องการ การให้ Agent สร้างไฟล์ เขียนโค้ด แก้บัก ไปจนถึงการ Deploy ให้คนอื่นใช้งานได้",
  },
  {
    id: "git-basics",
    title: "Git & Version Control",
    icon: <TbGitBranch className="text-3xl mb-2" />,
    description:
      "ให้ AI Agent ช่วยจัดการโค้ดด้วย Git อย่างมืออาชีพ",
    details:
      "Git เป็นเครื่องมือสำคัญที่โปรแกรมเมอร์ทุกคนต้องรู้ เราจะเรียนรู้ git init, commit, push, branch และการทำงานร่วมกับ GitHub โดยมี AI Agent ช่วยเขียน commit message และตรวจสอบการเปลี่ยนแปลง",
  },
];

const cliTools = [
  {
    id: "claude-code",
    title: "Claude Code",
    description: "Agentic CLI จาก Anthropic ใช้เป็นเครื่องมือหลักในค่ายนี้",
    features: "อ่าน/แก้ไขไฟล์, รันคำสั่ง, Git, Subagents",
  },
  {
    id: "gemini-cli",
    title: "Gemini CLI",
    description: "Agentic CLI จาก Google ใช้งานได้ฟรีสำหรับผู้เริ่มต้น",
    features: "อ่าน/แก้ไขไฟล์, ค้นหาเว็บ, Context ขนาดใหญ่",
  },
  {
    id: "codex-cli",
    title: "Codex CLI",
    description: "Agentic CLI จาก OpenAI ที่ทำงานใน Terminal เช่นกัน",
    features: "อ่าน/แก้ไขไฟล์, รันคำสั่ง, Sandbox",
  },
];

const cliCommands = [
  {
    command: "claude",
    description: "เปิดใช้ AI Agent ในโฟลเดอร์โปรเจคปัจจุบัน",
  },
  {
    command: 'claude "สร้างเว็บไซต์ portfolio ด้วย HTML, CSS, JS"',
    description: "สั่งงาน Agent ให้สร้างโปรเจคใหม่ทันที",
  },
  {
    command: "/help",
    description: "ดูคำสั่งทั้งหมดที่ใช้ได้",
  },
  {
    command: "/commit",
    description: "ให้ Agent ช่วยสร้าง git commit พร้อมข้อความอธิบาย",
  },
];

export default function AgenticCLI() {
  const [activeSection, setActiveSection] = useState("what");

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-blue-50/80 border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/events/2026/next-gen-ai-academy"
            className="flex items-center text-blue-700 hover:text-blue-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center">
            <TbTerminal2 className="text-blue-500 mr-2 text-2xl sm:text-3xl" />
            Agentic CLI
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-linear-to-br from-blue-400 to-blue-200 overflow-hidden">
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
                AI Agent ที่ลงมือทำแทนคุณ
              </h2>
              <p className="text-lg text-blue-50">
                เรียนรู้การใช้ Agentic CLI เช่น Claude Code — AI Agent
                ที่ทำงานผ่าน Terminal อ่านโค้ด เขียนโค้ด รันคำสั่ง
                และสร้างโปรเจคจริงได้ตั้งแต่ต้นจนจบ
                เหมือนมีโปรแกรมเมอร์มือโปรคอยช่วยเหลือตลอดเวลา
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-md rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <TbTerminal2 className="text-9xl text-white/90" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide py-2 gap-2">
            {[
              { key: "what", label: "Agentic CLI คืออะไร" },
              { key: "topics", label: "หัวข้อที่เรียนรู้" },
              { key: "tools", label: "เครื่องมือและคำสั่ง" },
              { key: "activities", label: "กิจกรรมในค่าย" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeSection === tab.key
                    ? "bg-blue-100 text-blue-800"
                    : "bg-transparent text-gray-700 hover:bg-blue-50"
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaRegLightbulb className="text-blue-500 mr-2" />
              Agentic CLI คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                Agentic CLI คือ AI Agent ที่ทำงานผ่าน Terminal/Command Line
                เช่น Claude Code, Gemini CLI และ Codex CLI
                ต่างจากแชทบอทตรงที่มันไม่ได้แค่ตอบคำถาม
                แต่สามารถอ่านโค้ดทั้งโปรเจค เขียนโค้ดใหม่ แก้ไขไฟล์
                รันคำสั่ง ตรวจสอบผลลัพธ์ และแก้ไขจนงานเสร็จได้เอง
                เหมือนมีโปรแกรมเมอร์มือโปรนั่งอยู่ข้างๆ
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">
                    Agentic CLI ทำอะไรได้
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้างเว็บไซต์, แอป, สคริปต์ จากคำอธิบาย</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>แก้บัก วิเคราะห์ข้อผิดพลาด แล้วรันทดสอบซ้ำเอง</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>อธิบายโค้ดที่อ่านไม่เข้าใจ</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้าง git commits และจัดการ version control</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">
                    ต่างจากแชทบอทอย่างไร
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>อ่านไฟล์ในเครื่องเราได้โดยตรง</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้างและแก้ไขไฟล์ได้เลย ไม่ต้องคัดลอกวาง</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>รันคำสั่ง Terminal และดูผลลัพธ์เองได้</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>ทำงานหลายขั้นตอนต่อเนื่องจนเสร็จ</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800">
                  ตัวอย่างการใช้ Agentic CLI
                </h3>
                <div className="mt-3 bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre className="text-gray-200 font-mono">
                    <code>
                      {`$ claude "สร้างเว็บไซต์ portfolio ด้วย HTML, CSS, JS"

Claude: ฉันจะสร้างเว็บไซต์ portfolio ให้คุณ...

✓ สร้าง index.html - โครงสร้างหน้าเว็บ
✓ สร้าง styles.css - การตกแต่ง responsive
✓ สร้าง script.js - animations และ interactions
✓ เปิดทดสอบในเบราว์เซอร์ - ทำงานถูกต้อง

เว็บไซต์พร้อมแล้ว! เปิดไฟล์ index.html เพื่อดูผลลัพธ์`}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="mt-6 p-5 bg-linear-to-r from-blue-100 to-blue-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  เหมาะสำหรับใคร
                </h3>
                <p>
                  ไม่ว่าจะเป็นมือใหม่ที่ไม่เคยเขียนโค้ดมาก่อน
                  หรือคนที่มีพื้นฐานอยู่แล้ว Agentic CLI จะช่วยให้คุณ
                  สร้างสรรค์สิ่งที่คิดไม่ถึงว่าจะทำได้ภายในเวลาสั้นๆ
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPuzzlePiece className="text-blue-500 mr-2" />
              หัวข้อที่จะเรียนรู้
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {agenticTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className="bg-blue-50 p-5 rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
                  variants={fadeIn}
                >
                  <div className="text-blue-500">{topic.icon}</div>
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

        {activeSection === "tools" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TbTerminal2 className="text-blue-500 mr-2" />
              เครื่องมือ Agentic CLI ยอดนิยม
            </h2>
            <div className="space-y-4">
              {cliTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  className="bg-blue-50 p-5 rounded-xl border border-blue-100"
                  variants={fadeIn}
                >
                  <h3 className="font-bold text-gray-800 text-lg">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{tool.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tool.features.split(", ").map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">
              คำสั่งพื้นฐาน (Claude Code)
            </h3>
            <div className="space-y-4">
              {cliCommands.map((cmd) => (
                <div
                  key={cmd.command}
                  className="bg-blue-50 p-4 rounded-xl border border-blue-100"
                >
                  <div className="bg-gray-900 px-4 py-2 rounded-lg font-mono text-sm text-green-400 inline-block">
                    $ {cmd.command}
                  </div>
                  <p className="mt-2 text-gray-600">{cmd.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-bold text-gray-800">
                ตัวอย่าง: ให้ AI Agent แก้บัก
              </h3>
              <div className="mt-3 bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                <pre className="text-gray-200 font-mono">
                  <code>
                    {`$ claude

> เว็บของฉันกดปุ่ม "ส่ง" แล้วไม่มีอะไรเกิดขึ้น
  ช่วยหาสาเหตุและแก้ไขให้หน่อย

Claude: ฉันอ่านไฟล์ script.js แล้ว ปัญหาคือ...
- บรรทัด 12: ใช้ id "submit-btn" แต่ใน index.html
  ปุ่มมี id เป็น "submitBtn"
- แก้ไขโดยเปลี่ยน id ให้ตรงกัน

✓ แก้ไข script.js เรียบร้อยแล้ว
✓ ทดสอบซ้ำ - ปุ่มทำงานถูกต้อง`}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "activities" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TbWand className="text-blue-500 mr-2" />
              กิจกรรมในค่าย
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Workshop: เริ่มต้นกับ Agentic CLI
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>ติดตั้งและตั้งค่า Claude Code บนเครื่อง</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>ใช้ AI Agent สร้างหน้าเว็บแรก</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>เรียนรู้การอ่าน, แก้ไข และสร้างไฟล์ด้วย AI</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Challenge: Speed Building
                </h3>
                <p className="mt-2 text-gray-600">
                  แข่งขันสร้างโปรเจคภายในเวลาจำกัด โดยใช้ Agentic CLI
                  ช่วยเขียนโค้ด ทีมไหนสร้างแอปที่ใช้งานได้จริงเร็วที่สุดและดีที่สุดจะชนะ
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Project: จากไอเดีย Design Thinking สู่โปรเจคจริง
                </h3>
                <p className="mt-2 text-gray-600">
                  นำไอเดียที่ได้จากกระบวนการ Design Thinking
                  มาสร้างเป็นโปรเจคจริงด้วย AI Agent ตั้งแต่ต้นจนจบ
                  เช่น เว็บไซต์, Todo App, AI Chatbot หรือ Data Dashboard
                  พร้อม Deploy ขึ้น GitHub และนำเสนอผลงาน
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Bonus: GitHub & Deployment
                </h3>
                <p className="mt-2 text-gray-600">
                  เรียนรู้การใช้ Git และ GitHub เพื่อเก็บโค้ด
                  พร้อม Deploy เว็บไซต์ขึ้น Vercel หรือ GitHub Pages
                  ให้คนอื่นเข้าใช้งานได้จริง
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="border-t border-blue-100 pt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            หัวข้ออื่นๆ ในค่าย
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/events/2026/next-gen-ai-academy/topics/ai-foundations"
              className="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
            >
              <FaRobot className="text-yellow-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">AI Foundations</span>
            </Link>
            <Link
              href="/events/2026/next-gen-ai-academy/topics/prompt-engineering"
              className="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
            >
              <TbSparkles className="text-yellow-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">
                Prompt Engineering
              </span>
            </Link>
            <Link
              href="/events/2026/next-gen-ai-academy/topics/design-thinking"
              className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow"
            >
              <LuBrain className="text-blue-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">Design Thinking</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
