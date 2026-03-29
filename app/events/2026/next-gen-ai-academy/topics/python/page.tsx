"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaArrowLeft, FaRegLightbulb, FaRobot } from "react-icons/fa";
import { FaPuzzlePiece } from "react-icons/fa6";
import { SiPython } from "react-icons/si";
import { TbBrain, TbDatabase, TbSparkles, TbTerminal2 } from "react-icons/tb";

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

const pythonTopics = [
  {
    id: "basics",
    title: "พื้นฐาน Python",
    icon: <SiPython className="text-3xl mb-2" />,
    description:
      "ตัวแปร, ชนิดข้อมูล, เงื่อนไข, ลูป และฟังก์ชัน",
    details:
      "เรียนรู้พื้นฐานของ Python ตั้งแต่การประกาศตัวแปร, ชนิดข้อมูล (string, int, float, list, dict), การใช้ if-else, for/while loop และการสร้างฟังก์ชัน เพื่อเป็นรากฐานสำคัญในการเขียนโค้ด AI",
  },
  {
    id: "data",
    title: "การจัดการข้อมูล",
    icon: <TbDatabase className="text-3xl mb-2" />,
    description:
      "List, Dictionary, File I/O และการจัดการข้อมูลพื้นฐาน",
    details:
      "เรียนรู้การทำงานกับข้อมูลใน Python เช่น List Comprehension, Dictionary Operations, การอ่าน/เขียนไฟล์ CSV และ JSON รวมถึงการจัดการข้อมูลด้วย pandas เบื้องต้น",
  },
  {
    id: "libraries",
    title: "Python Libraries",
    icon: <FaPuzzlePiece className="text-3xl mb-2" />,
    description:
      "เรียนรู้การใช้ไลบรารียอดนิยม: requests, pandas, matplotlib",
    details:
      "Python มีไลบรารีมากมายที่ช่วยให้การพัฒนาง่ายขึ้น เราจะเรียนรู้ requests สำหรับดึงข้อมูลจาก API, pandas สำหรับวิเคราะห์ข้อมูล และ matplotlib สำหรับสร้างกราฟ",
  },
  {
    id: "ai-python",
    title: "Python สำหรับ AI",
    icon: <TbBrain className="text-3xl mb-2" />,
    description:
      "ใช้ Python เชื่อมต่อกับ AI APIs (OpenAI, Anthropic)",
    details:
      "เรียนรู้การใช้ Python เขียนโค้ดเชื่อมต่อกับ AI APIs เช่น OpenAI API และ Anthropic API สร้างแชทบอทง่ายๆ และประยุกต์ใช้ AI ในโปรเจคจริง",
  },
];

const pythonLibraries = [
  {
    id: "requests",
    title: "Requests",
    description: "ไลบรารีสำหรับส่ง HTTP requests เพื่อดึงข้อมูลจาก API",
    features: "GET, POST, JSON Parsing, API Integration",
  },
  {
    id: "pandas",
    title: "Pandas",
    description: "ไลบรารีสำหรับวิเคราะห์และจัดการข้อมูลแบบตาราง",
    features: "DataFrame, CSV/Excel, Data Cleaning, Analysis",
  },
  {
    id: "openai-sdk",
    title: "OpenAI SDK",
    description: "ไลบรารีสำหรับเชื่อมต่อกับ ChatGPT และ DALL-E",
    features: "Chat Completions, Image Generation, Embeddings",
  },
];

export default function Python() {
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
            <SiPython className="text-blue-500 mr-2 text-2xl sm:text-3xl" />
            Python
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
                สอนการเขียน Python
              </h2>
              <p className="text-lg text-blue-50">
                เรียนรู้พื้นฐานภาษา Python ที่เป็นภาษาอันดับ 1
                สำหรับงาน AI และ Data Science
                พร้อมฝึกเขียนโค้ดจริงตั้งแต่เริ่มต้น
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-md rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <SiPython className="text-9xl text-white/90" />
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
              { key: "what", label: "Python คืออะไร" },
              { key: "topics", label: "หัวข้อที่เรียนรู้" },
              { key: "libraries", label: "Python Libraries" },
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
              Python คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                Python เป็นภาษาโปรแกรมมิ่งที่ได้รับความนิยมสูงสุดในโลก
                โดยเฉพาะในสาย AI, Data Science และ Machine Learning
                มีไวยากรณ์ที่อ่านง่ายเหมือนภาษาอังกฤษ
                เหมาะสำหรับผู้เริ่มต้นเป็นอย่างยิ่ง
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">
                    ทำไมต้อง Python?
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>ภาษาอันดับ 1 สำหรับ AI และ Data Science</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>ไวยากรณ์ง่าย อ่านเข้าใจได้ทันที</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>มีไลบรารีมากมายพร้อมใช้งาน</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>ชุมชนนักพัฒนาขนาดใหญ่ทั่วโลก</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">
                    Python ทำอะไรได้บ้าง
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้างแอปพลิเคชัน AI และ Machine Learning</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>วิเคราะห์ข้อมูลและสร้างกราฟ</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้างเว็บไซต์ (Django, Flask)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>เขียนสคริปต์อัตโนมัติ (Automation)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800">
                  ตัวอย่างโค้ด Python พื้นฐาน
                </h3>
                <div className="mt-3 bg-white p-3 rounded-lg text-sm overflow-x-auto">
                  <pre className="text-gray-700">
                    <code>
                      {`# ตัวแปรและชนิดข้อมูล
name = "สวัสดี AI"
age = 16
gpa = 3.75

# List (รายการ)
fruits = ["แอปเปิ้ล", "กล้วย", "ส้ม"]

# เงื่อนไข
if age >= 18:
    print("เป็นผู้ใหญ่แล้ว")
else:
    print("ยังเป็นเยาวชนอยู่")

# ฟังก์ชัน
def greet(name):
    return f"สวัสดี, {name}!"

print(greet("น้องๆ ค่าย AI"))

# ลูป
for fruit in fruits:
    print(f"ผลไม้: {fruit}")`}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="mt-6 p-5 bg-linear-to-r from-blue-100 to-blue-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  Python ในค่ายนี้
                </h3>
                <p>
                  เราจะเรียน Python เบื้องต้นที่จำเป็นสำหรับการใช้งานร่วมกับ AI
                  ไม่จำเป็นต้องมีความรู้มาก่อน เริ่มจากศูนย์ได้เลย
                  โดยจะเน้นการเขียนโค้ดจริงตลอดการเรียน
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
              {pythonTopics.map((topic) => (
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

        {activeSection === "libraries" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPuzzlePiece className="text-blue-500 mr-2" />
              Python Libraries ที่จะใช้
            </h2>
            <div className="space-y-4">
              {pythonLibraries.map((lib) => (
                <motion.div
                  key={lib.id}
                  className="bg-blue-50 p-5 rounded-xl border border-blue-100"
                  variants={fadeIn}
                >
                  <h3 className="font-bold text-gray-800 text-lg">
                    {lib.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{lib.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {lib.features.split(", ").map((feature) => (
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

            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-bold text-gray-800">
                ตัวอย่าง: เรียก AI API ด้วย Python
              </h3>
              <div className="mt-3 bg-white p-3 rounded-lg text-sm overflow-x-auto">
                <pre className="text-gray-700">
                  <code>
                    {`import openai

client = openai.OpenAI()

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{
        "role": "user",
        "content": "อธิบาย AI ให้เด็ก ม.ปลาย เข้าใจ"
    }]
)

print(response.choices[0].message.content)`}
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
              <TbTerminal2 className="text-blue-500 mr-2" />
              กิจกรรมในค่าย
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Workshop: เขียน Python ตั้งแต่เริ่มต้น
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>ตั้งค่า Python และ IDE</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>เขียนโปรแกรมคำนวณ, เกมทาย, และ Quiz</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>ฝึกใช้ List, Dictionary และ Functions</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Challenge: Python Mini Games
                </h3>
                <p className="mt-2 text-gray-600">
                  สร้างเกมง่ายๆ ด้วย Python เช่น เกมทายตัวเลข, Rock Paper
                  Scissors, หรือ Word Guessing Game
                  พร้อมแข่งขันกับเพื่อนๆ ในค่าย
                </p>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  Project: AI Chatbot ด้วย Python
                </h3>
                <p className="mt-2 text-gray-600">
                  สร้าง AI Chatbot ของตัวเองโดยใช้ Python เชื่อมต่อกับ OpenAI API
                  ให้แชทบอทตอบคำถามในหัวข้อที่สนใจ
                  พร้อมนำเสนอผลงานต่อเพื่อนๆ ในค่าย
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
              href="/events/2026/next-gen-ai-academy/topics/ai-fundamentals"
              className="flex items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
            >
              <FaRobot className="text-yellow-500 text-2xl mr-3" />
              <span className="font-medium text-gray-800">
                AI Fundamentals
              </span>
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
