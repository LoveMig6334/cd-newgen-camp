"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaRegLightbulb, FaRobot } from "react-icons/fa";
import { FaPuzzlePiece } from "react-icons/fa6";
import { SiPython } from "react-icons/si";
import {
  TbCode,
  TbGitBranch,
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

const claudeTopics = [
  {
    id: "what-is-claude-code",
    title: "Claude Code คืออะไร",
    icon: <TbTerminal2 className="text-3xl mb-2" />,
    description:
      "ทำความรู้จักกับ Claude Code — AI ที่ช่วยเขียนโค้ดจาก Anthropic",
    details:
      "Claude Code เป็นเครื่องมือ AI จาก Anthropic ที่ช่วยเขียนโค้ด วิเคราะห์โค้ด แก้บัก และสร้างโปรเจคได้ ทำงานผ่าน Terminal โดยสามารถอ่าน แก้ไข และสร้างไฟล์ได้โดยตรง เหมือนมีโปรแกรมเมอร์คู่คิดอยู่ข้างๆ",
  },
  {
    id: "ai-coding",
    title: "AI-Assisted Coding",
    icon: <TbCode className="text-3xl mb-2" />,
    description:
      "เรียนรู้วิธีใช้ AI ช่วยเขียนโค้ดอย่างมีประสิทธิภาพ",
    details:
      "เรียนรู้วิธีใช้ AI ช่วยเขียนโค้ดจริง ทั้งการสร้างไฟล์ใหม่, การแก้ไขโค้ดที่มีอยู่, การ Debug หาข้อผิดพลาด, การเขียน Test และการ Refactor โค้ดให้ดีขึ้น ด้วยการสื่อสารกับ AI อย่างมีประสิทธิภาพ",
  },
  {
    id: "project-building",
    title: "สร้างโปรเจคด้วย AI",
    icon: <TbWand className="text-3xl mb-2" />,
    description:
      "ใช้ Claude Code สร้างเว็บไซต์และแอปพลิเคชันจริง",
    details:
      "เรียนรู้การวางแผนและสร้างโปรเจคจริงด้วย AI ตั้งแต่การออกแบบ, การเขียนโค้ด HTML/CSS/JavaScript, การสร้าง Python scripts ไปจนถึงการ Deploy ให้คนอื่นใช้งานได้",
  },
  {
    id: "git-basics",
    title: "Git & Version Control",
    icon: <TbGitBranch className="text-3xl mb-2" />,
    description:
      "เรียนรู้การใช้ Git เพื่อจัดการโค้ดอย่างมืออาชีพ",
    details:
      "Git เป็นเครื่องมือสำคัญที่โปรแกรมเมอร์ทุกคนต้องรู้ เราจะเรียนรู้ git init, commit, push, branch และการทำงานร่วมกับ GitHub เพื่อเก็บและแชร์โค้ดของเรา",
  },
];

const claudeCommands = [
  {
    command: "claude",
    description: "เปิดใช้ Claude Code ในโฟลเดอร์ปัจจุบัน",
  },
  {
    command: 'claude "สร้างเว็บไซต์ portfolio"',
    description: "สั่งให้ Claude สร้างโปรเจคใหม่ทันที",
  },
  {
    command: "/help",
    description: "ดูคำสั่งทั้งหมดที่ใช้ได้",
  },
  {
    command: "/commit",
    description: "ให้ Claude ช่วยสร้าง git commit message",
  },
];

export default function ClaudeCode() {
  const [activeSection, setActiveSection] = useState("what");

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-orange-50/80 border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/events/2026/next-gen-ai-academy"
            className="flex items-center text-orange-700 hover:text-orange-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center">
            <TbTerminal2 className="text-orange-500 mr-2 text-2xl sm:text-3xl" />
            Claude Code
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-linear-to-br from-orange-400 to-amber-300 overflow-hidden">
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
                AI ช่วยเขียนโค้ด
              </h2>
              <p className="text-lg text-orange-50">
                เรียนรู้การใช้ Claude Code — เครื่องมือ AI
                ที่ช่วยเขียนโค้ดและสร้างโปรเจคจริงได้ตั้งแต่ต้นจนจบ
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
      <div className="bg-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide py-2 gap-2">
            {[
              { key: "what", label: "Claude Code คืออะไร" },
              { key: "topics", label: "หัวข้อที่เรียนรู้" },
              { key: "commands", label: "คำสั่งพื้นฐาน" },
              { key: "activities", label: "กิจกรรมในค่าย" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeSection === tab.key
                    ? "bg-orange-100 text-orange-800"
                    : "bg-transparent text-gray-700 hover:bg-orange-50"
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaRegLightbulb className="text-orange-500 mr-2" />
              Claude Code คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                Claude Code เป็น AI coding assistant จาก Anthropic
                ที่ทำงานผ่าน Terminal/Command Line
                สามารถอ่านโค้ดทั้งโปรเจค, เขียนโค้ดใหม่, แก้ไขโค้ดที่มีอยู่,
                รันคำสั่ง และสร้างโปรเจคเต็มรูปแบบได้
                เหมือนมีโปรแกรมเมอร์มือโปรนั่งอยู่ข้างๆ
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h3 className="font-bold text-gray-800">
                    Claude Code ทำอะไรได้
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>สร้างเว็บไซต์, แอป, สคริปต์ จากคำอธิบาย</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>แก้บัก วิเคราะห์ข้อผิดพลาด หาทางแก้ไข</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>อธิบายโค้ดที่อ่านไม่เข้าใจ</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>สร้าง git commits และจัดการ version control</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h3 className="font-bold text-gray-800">
                    ต่างจาก ChatGPT อย่างไร
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>อ่านไฟล์ในเครื่องเราได้โดยตรง</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>สร้างและแก้ไขไฟล์ได้เลย</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>รันคำสั่ง Terminal ได้</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span>เข้าใจบริบทของโปรเจคทั้งหมด</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-gray-800">
                  ตัวอย่างการใช้ Claude Code
                </h3>
                <div className="mt-3 bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                  <pre className="text-gray-200 font-mono">
                    <code>
                      {`$ claude "สร้างเว็บไซต์ portfolio ด้วย HTML, CSS, JS"

Claude: ฉันจะสร้างเว็บไซต์ portfolio ให้คุณ...

✓ สร้าง index.html - โครงสร้างหน้าเว็บ
✓ สร้าง styles.css - การตกแต่ง responsive
✓ สร้าง script.js - animations และ interactions

เว็บไซต์พร้อมแล้ว! เปิดไฟล์ index.html เพื่อดูผลลัพธ์`}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="mt-6 p-5 bg-linear-to-r from-orange-100 to-orange-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  เหมาะสำหรับใคร
                </h3>
                <p>
                  ไม่ว่าจะเป็นมือใหม่ที่ไม่เคยเขียนโค้ดมาก่อน
                  หรือคนที่มีพื้นฐานอยู่แล้ว Claude Code จะช่วยให้คุณ
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPuzzlePiece className="text-orange-500 mr-2" />
              หัวข้อที่จะเรียนรู้
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {claudeTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className="bg-orange-50 p-5 rounded-xl border border-orange-100 hover:shadow-md transition-shadow"
                  variants={fadeIn}
                >
                  <div className="text-orange-500">{topic.icon}</div>
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

        {activeSection === "commands" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TbTerminal2 className="text-orange-500 mr-2" />
              คำสั่ง Claude Code พื้นฐาน
            </h2>
            <div className="space-y-4">
              {claudeCommands.map((cmd) => (
                <div
                  key={cmd.command}
                  className="bg-orange-50 p-4 rounded-xl border border-orange-100"
                >
                  <div className="bg-gray-900 px-4 py-2 rounded-lg font-mono text-sm text-green-400 inline-block">
                    $ {cmd.command}
                  </div>
                  <p className="mt-2 text-gray-600">{cmd.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h3 className="font-bold text-gray-800">
                ตัวอย่าง: ใช้ Claude Code แก้บัก
              </h3>
              <div className="mt-3 bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                <pre className="text-gray-200 font-mono">
                  <code>
                    {`$ claude

> โค้ด Python ของฉันมี error "TypeError: list indices
  must be integers" ที่ไฟล์ main.py บรรทัด 15
  ช่วยหาสาเหตุและแก้ไขให้หน่อย

Claude: ดูจากโค้ดในไฟล์ main.py แล้ว ปัญหาคือ...
- บรรทัด 15: data["name"] ใช้ string เป็น index
  แต่ data เป็น list ไม่ใช่ dict
- แก้ไขโดยเปลี่ยนเป็น data[0]["name"]

✓ แก้ไข main.py เรียบร้อยแล้ว`}
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TbWand className="text-orange-500 mr-2" />
              กิจกรรมในค่าย
            </h2>
            <div className="space-y-6">
              <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Workshop: เริ่มต้นกับ Claude Code
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>ตั้งค่า Claude Code บนเครื่อง</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>ใช้ Claude Code สร้างหน้าเว็บแรก</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>เรียนรู้การอ่าน, แก้ไข และสร้างไฟล์ด้วย AI</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Challenge: Speed Building
                </h3>
                <p className="mt-2 text-gray-600">
                  แข่งขันสร้างโปรเจคภายในเวลาจำกัด โดยใช้ Claude Code
                  ช่วยเขียนโค้ด ทีมไหนสร้างแอปที่ใช้งานได้จริงเร็วที่สุดและดีที่สุดจะชนะ
                </p>
              </div>

              <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Project: สร้างโปรเจคจริงด้วย AI
                </h3>
                <p className="mt-2 text-gray-600">
                  สร้างโปรเจคจริงด้วย Claude Code ตั้งแต่ต้นจนจบ
                  เช่น เว็บไซต์ Portfolio, Todo App, AI Chatbot หรือ Data Dashboard
                  พร้อม Deploy ขึ้น GitHub และนำเสนอผลงาน
                </p>
              </div>

              <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
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
        <div className="border-t border-orange-100 pt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            หัวข้ออื่นๆ ในค่าย
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/events/2026/next-gen-ai-academy/topics/ai-fundamentals"
              className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow"
            >
              <FaRobot className="text-purple-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">
                AI Fundamentals
              </span>
            </Link>
            <Link
              href="/events/2026/next-gen-ai-academy/topics/python"
              className="flex items-center p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow"
            >
              <SiPython className="text-green-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">
                Python เบื้องต้น
              </span>
            </Link>
            <Link
              href="/events/2026/next-gen-ai-academy/topics/prompt-engineering"
              className="flex items-center p-4 bg-teal-50 rounded-xl border border-teal-200 hover:shadow-md transition-shadow"
            >
              <TbSparkles className="text-teal-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">
                Prompt Engineering
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
