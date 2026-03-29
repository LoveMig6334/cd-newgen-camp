"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaRegLightbulb, FaRobot } from "react-icons/fa";
import { FaPuzzlePiece } from "react-icons/fa6";
import { SiPython } from "react-icons/si";
import {
  TbBrain,
  TbChartDots3,
  TbEye,
  TbMessageChatbot,
  TbSparkles,
  TbTerminal2,
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

const aiTopics = [
  {
    id: "what-is-ai",
    title: "AI คืออะไร",
    icon: <FaRobot className="text-3xl mb-2" />,
    description:
      "ทำความเข้าใจพื้นฐานปัญญาประดิษฐ์ ประเภทของ AI และการประยุกต์ใช้ในชีวิตประจำวัน",
    details:
      "Artificial Intelligence (AI) คือระบบคอมพิวเตอร์ที่สามารถทำงานที่ต้องใช้ความฉลาดของมนุษย์ได้ เราจะเรียนรู้ประเภทของ AI ตั้งแต่ Narrow AI, General AI ไปจนถึง Super AI รวมถึงตัวอย่างการใช้งานจริงในปัจจุบัน",
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    icon: <TbChartDots3 className="text-3xl mb-2" />,
    description:
      "เรียนรู้แนวคิดหลักของ Machine Learning: Supervised, Unsupervised และ Reinforcement Learning",
    details:
      "Machine Learning เป็นสาขาของ AI ที่ให้คอมพิวเตอร์เรียนรู้จากข้อมูลโดยไม่ต้องเขียนโปรแกรมทุกขั้นตอน เราจะเรียนรู้แนวคิดพื้นฐาน เช่น Training Data, Models, Prediction และประเภทของ ML ที่ใช้กันอย่างแพร่หลาย",
  },
  {
    id: "neural-networks",
    title: "Neural Networks",
    icon: <TbBrain className="text-3xl mb-2" />,
    description:
      "ทำความรู้จักกับ Neural Networks และ Deep Learning ที่อยู่เบื้องหลัง ChatGPT",
    details:
      "Neural Networks เป็นโมเดลที่ได้แรงบันดาลใจจากสมองมนุษย์ ประกอบด้วย Layers ของ Neurons ที่เชื่อมต่อกัน เราจะเรียนรู้เกี่ยวกับ Input Layer, Hidden Layers, Output Layer รวมถึง Deep Learning ที่ใช้สร้าง AI อัจฉริยะอย่าง GPT และ Claude",
  },
  {
    id: "computer-vision",
    title: "Computer Vision",
    icon: <TbEye className="text-3xl mb-2" />,
    description:
      "การทำให้คอมพิวเตอร์ 'มองเห็น' และเข้าใจรูปภาพและวิดีโอ",
    details:
      "Computer Vision เป็นสาขาของ AI ที่ทำให้คอมพิวเตอร์สามารถตีความรูปภาพและวิดีโอได้ ใช้ในการจดจำใบหน้า, รถยนต์ไร้คนขับ, การตรวจจับวัตถุ และอีกมากมาย เราจะได้ลองทดสอบกับโมเดล Vision AI จริง",
  },
];

const aiMilestones = [
  {
    year: "1950",
    title: "Turing Test",
    description: "Alan Turing เสนอทดสอบความฉลาดของเครื่องจักร",
  },
  {
    year: "1997",
    title: "Deep Blue",
    description: "AI ของ IBM เอาชนะแชมป์โลกหมากรุก",
  },
  {
    year: "2016",
    title: "AlphaGo",
    description: "AI ของ DeepMind เอาชนะแชมป์โลกหมากล้อม",
  },
  {
    year: "2022",
    title: "ChatGPT",
    description: "OpenAI เปิดตัว ChatGPT สร้างกระแส AI ทั่วโลก",
  },
  {
    year: "2024",
    title: "Claude & Gemini",
    description: "AI หลายค่ายแข่งขันพัฒนา LLM ขั้นสูง",
  },
];

export default function AIFundamentals() {
  const [activeSection, setActiveSection] = useState("what");

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-purple-50/80 border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/events/2026/next-gen-ai-academy"
            className="flex items-center text-purple-700 hover:text-purple-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center">
            <FaRobot className="text-purple-500 mr-2 text-2xl sm:text-3xl" />
            AI Fundamentals
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-linear-to-br from-purple-500 to-violet-400 overflow-hidden">
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
                พื้นฐานปัญญาประดิษฐ์
              </h2>
              <p className="text-lg text-purple-50">
                เรียนรู้พื้นฐานของ AI, Machine Learning และ Neural Networks
                ที่อยู่เบื้องหลังเทคโนโลยีอัจฉริยะที่เราใช้ทุกวัน ตั้งแต่ ChatGPT
                ไปจนถึงรถยนต์ไร้คนขับ
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-md rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <TbBrain className="text-9xl text-white/90" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide py-2 gap-2">
            {[
              { key: "what", label: "AI คืออะไร" },
              { key: "topics", label: "หัวข้อที่เรียนรู้" },
              { key: "timeline", label: "AI Timeline" },
              { key: "activities", label: "กิจกรรมในค่าย" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeSection === tab.key
                    ? "bg-purple-100 text-purple-800"
                    : "bg-transparent text-gray-700 hover:bg-purple-50"
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaRegLightbulb className="text-purple-500 mr-2" />
              AI คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                Artificial Intelligence (AI) หรือ ปัญญาประดิษฐ์
                คือเทคโนโลยีที่ทำให้คอมพิวเตอร์สามารถคิด เรียนรู้
                และตัดสินใจได้คล้ายกับมนุษย์ ปัจจุบัน AI
                ถูกนำมาใช้ในหลากหลายด้าน
                ตั้งแต่การแนะนำวิดีโอบน YouTube ไปจนถึงการวินิจฉัยโรค
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <h3 className="font-bold text-gray-800">ประเภทของ AI</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>
                        <strong>Narrow AI</strong> — AI
                        ที่ทำงานเฉพาะทาง เช่น Siri, แนะนำสินค้า
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>
                        <strong>General AI</strong> — AI
                        ที่คิดได้เหมือนมนุษย์ (ยังไม่มีจริง)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>
                        <strong>Generative AI</strong> — AI ที่สร้างเนื้อหาใหม่
                        เช่น ChatGPT, Claude, DALL-E
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <h3 className="font-bold text-gray-800">AI ในชีวิตประจำวัน</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>แนะนำวิดีโอ/เพลง (YouTube, Spotify)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>ผู้ช่วยอัจฉริยะ (Siri, Google Assistant)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>ฟิลเตอร์หน้า (Instagram, TikTok)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      <span>แชทบอท (ChatGPT, Claude)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-5 bg-linear-to-r from-purple-100 to-purple-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  ทำไมต้องเรียนรู้ AI?
                </h3>
                <p>
                  AI กำลังเปลี่ยนแปลงทุกอุตสาหกรรม
                  การเข้าใจพื้นฐานของ AI จะช่วยให้เราใช้เครื่องมือ AI
                  ได้อย่างมีประสิทธิภาพ และเตรียมพร้อมสำหรับอนาคตที่ AI
                  จะมีบทบาทมากขึ้นในทุกสาขาอาชีพ
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPuzzlePiece className="text-purple-500 mr-2" />
              หัวข้อที่จะเรียนรู้
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {aiTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className="bg-purple-50 p-5 rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                  variants={fadeIn}
                >
                  <div className="text-purple-500">{topic.icon}</div>
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

        {activeSection === "timeline" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TbSparkles className="text-purple-500 mr-2" />
              AI Timeline
            </h2>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-200"></div>
              <div className="space-y-8">
                {aiMilestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    className="flex items-start ml-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <div className="flex-shrink-0 w-16 text-right mr-4">
                      <span className="text-sm font-bold text-purple-600">
                        {milestone.year}
                      </span>
                    </div>
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex-shrink-0 mt-1 relative z-10"></div>
                    <div className="ml-4 bg-purple-50 p-4 rounded-xl border border-purple-100 flex-1">
                      <h3 className="font-bold text-gray-800">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "activities" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TbMessageChatbot className="text-purple-500 mr-2" />
              กิจกรรมในค่าย
            </h2>
            <div className="space-y-6">
              <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Workshop: ทดลองใช้ AI จริง
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>ทดลองใช้ ChatGPT และ Claude ในการถาม-ตอบ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>ทดลองสร้างรูปภาพด้วย AI (DALL-E / Midjourney)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>ทดลอง AI วิเคราะห์รูปภาพ (Computer Vision)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Challenge: AI Quiz Battle
                </h3>
                <p className="mt-2 text-gray-600">
                  แข่งขันตอบคำถามเกี่ยวกับ AI เป็นทีม
                  ทดสอบความรู้ที่ได้เรียนมาทั้งหมด
                  พร้อมรับรางวัลสำหรับทีมที่ตอบได้ดีที่สุด
                </p>
              </div>

              <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Project: ออกแบบ AI Solution
                </h3>
                <p className="mt-2 text-gray-600">
                  ทำโปรเจคกลุ่มออกแบบวิธีใช้ AI แก้ปัญหาจริงในโรงเรียน
                  เช่น AI ช่วยทำการบ้าน, AI แนะนำเส้นทางการเรียน หรือ
                  AI ช่วยจัดตารางสอบ พร้อมนำเสนอต่อกรรมการ
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="border-t border-purple-100 pt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            หัวข้ออื่นๆ ในค่าย
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <Link
              href="/events/2026/next-gen-ai-academy/topics/claude-code"
              className="flex items-center p-4 bg-orange-50 rounded-xl border border-orange-200 hover:shadow-md transition-shadow"
            >
              <TbTerminal2 className="text-orange-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">Claude Code</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
