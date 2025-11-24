"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  FaArrowLeft,
  FaCss3Alt,
  FaHtml5,
  FaLayerGroup,
  FaRegLightbulb,
} from "react-icons/fa";
import { FaPenNib, FaPuzzlePiece } from "react-icons/fa6";
import { FiTarget } from "react-icons/fi";
import { LuBrain } from "react-icons/lu";
import { PiFigmaLogo } from "react-icons/pi";
import { TbDeviceMobile } from "react-icons/tb";

export default function HtmlCss() {
  const [activeSection, setActiveSection] = useState("what");

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

  const htmlCssTopics = [
    {
      id: "html-structure",
      title: "โครงสร้าง HTML",
      icon: <FaHtml5 className="text-3xl mb-2" />,
      description:
        "เรียนรู้เกี่ยวกับแท็ก HTML พื้นฐานและการสร้างโครงสร้างเว็บเพจ",
      details:
        "HTML (Hypertext Markup Language) เป็นภาษามาร์กอัพมาตรฐานสำหรับการสร้างเว็บเพจ เราจะเรียนรู้เกี่ยวกับแท็กพื้นฐาน, การสร้างโครงสร้างเอกสาร, การใส่ลิงก์ รูปภาพ และการจัดการฟอร์มต่างๆ",
    },
    {
      id: "css-styling",
      title: "การจัดรูปแบบด้วย CSS",
      icon: <FaCss3Alt className="text-3xl mb-2" />,
      description: "การใช้ CSS เพื่อจัดรูปแบบและปรับแต่งหน้าเว็บให้สวยงาม",
      details:
        "CSS (Cascading Style Sheets) ช่วยให้เราสามารถกำหนดสไตล์และการแสดงผลของเว็บเพจ เราจะเรียนรู้เกี่ยวกับการกำหนดสี, ขนาด, ตำแหน่ง, แบบอักษร และการจัดวางองค์ประกอบต่างๆ บนหน้าเว็บ",
    },
    {
      id: "responsive",
      title: "Responsive Design",
      icon: <TbDeviceMobile className="text-3xl mb-2" />,
      description: "การออกแบบเว็บไซต์ให้แสดงผลได้ดีบนทุกอุปกรณ์",
      details:
        "เรียนรู้การใช้ Media Queries, Flexbox, และ CSS Grid เพื่อสร้างเว็บไซต์ที่แสดงผลได้อย่างเหมาะสมบนทุกขนาดหน้าจอ ตั้งแต่มือถือไปจนถึงจอขนาดใหญ่",
    },
    {
      id: "best-practices",
      title: "แนวทางปฏิบัติที่ดี",
      icon: <FiTarget className="text-3xl mb-2" />,
      description:
        "เทคนิคและข้อควรปฏิบัติในการเขียน HTML และ CSS ที่มีประสิทธิภาพ",
      details:
        "เรียนรู้เกี่ยวกับ Semantic HTML, CSS Organization, การตั้งชื่อคลาส และการเขียนโค้ดที่ดูแลรักษาง่าย เพื่อให้การพัฒนาเว็บไซต์เป็นไปอย่างมีประสิทธิภาพและมีมาตรฐาน",
    },
  ];

  const cssFrameworks = [
    {
      id: "bootstrap",
      title: "Bootstrap",
      description: "เฟรมเวิร์กยอดนิยมที่มาพร้อมคอมโพเนนต์สำเร็จรูปมากมาย",
      features: "Grid System, Components, Utilities",
    },
    {
      id: "tailwind",
      title: "Tailwind CSS",
      description: "เฟรมเวิร์กแบบ utility-first ที่ช่วยให้สร้าง UI ได้รวดเร็ว",
      features: "Utility Classes, Customization, JIT Compiler",
    },
    {
      id: "bulma",
      title: "Bulma",
      description: "เฟรมเวิร์ก CSS ที่มีความยืดหยุ่นและมุ่งเน้นการใช้ Flexbox",
      features: "Modular, No JS, Flexbox Based",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Aero-style glassmorphic header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-yellow-50/80 border-b border-yellow-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/home#features"
            className="flex items-center text-yellow-700 hover:text-yellow-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center">
            <div className="flex text-2xl sm:text-3xl mr-2">
              <FaHtml5 className="text-yellow-600" />
              <FaCss3Alt className="text-yellow-500 -ml-1" />
            </div>
            HTML & CSS
          </h1>
          <div className="w-24"></div> {/* Empty div for centering */}
        </div>
      </div>

      {/* Hero section with blueprint design */}
      <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Blueprint grid background */}
          <div className="absolute inset-0 bg-blue-500 opacity-90">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
            {/* Large grid lines */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
                backgroundSize: "100px 100px",
              }}
            ></div>
            {/* Blueprint circles and design elements - symmetrical */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full border-2 border-white/30"></div>
            <div className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full border-2 border-white/30"></div>
            <div className="absolute bottom-1/4 left-1/4 w-4 h-4 rounded-full border-2 border-white/30"></div>
            <div className="absolute bottom-1/4 right-1/4 w-4 h-4 rounded-full border-2 border-white/30"></div>

            {/* Blueprint measurement lines */}
            <div className="absolute top-1/3 left-10 w-20 h-px bg-white/30"></div>
            <div className="absolute top-1/3 right-10 w-20 h-px bg-white/30"></div>
            <div className="absolute bottom-1/3 left-10 w-20 h-px bg-white/30"></div>
            <div className="absolute bottom-1/3 right-10 w-20 h-px bg-white/30"></div>
          </div>

          {/* Symmetrical code snippets */}
          <div className="absolute left-[12%] top-1/2 transform -translate-y-1/2 w-72 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-gray-800 px-2 py-1 flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="bg-gray-900 text-white p-3 font-mono text-xs leading-5">
              <pre>
                <span className="text-gray-400">&lt;</span>
                <span className="text-red-400">html</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;</span>
                <span className="text-red-400">head</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;</span>
                <span className="text-red-400">title</span>
                <span className="text-gray-400">&gt;</span>
                <span className="text-white">Web Academy</span>
                <span className="text-gray-400">&lt;/</span>
                <span className="text-red-400">title</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;</span>
                <span className="text-red-400">link</span>{" "}
                <span className="text-yellow-300">rel</span>
                <span className="text-gray-400">=</span>
                <span className="text-green-400">"stylesheet"</span>
                {"\n"}
                <span className="text-gray-400"> </span>
                <span className="text-yellow-300">href</span>
                <span className="text-gray-400">=</span>
                <span className="text-green-400">"styles.css"</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;/</span>
                <span className="text-red-400">head</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;</span>
                <span className="text-red-400">body</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;</span>
                <span className="text-red-400">div</span>{" "}
                <span className="text-yellow-300">class</span>
                <span className="text-gray-400">=</span>
                <span className="text-green-400">"container"</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;</span>
                <span className="text-red-400">h1</span>
                <span className="text-gray-400">&gt;</span>
                <span className="text-white">Next Gen Web Academy</span>
                <span className="text-gray-400">&lt;/</span>
                <span className="text-red-400">h1</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;/</span>
                <span className="text-red-400">div</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400"> &lt;/</span>
                <span className="text-red-400">body</span>
                <span className="text-gray-400">&gt;</span>
                {"\n"}
                <span className="text-gray-400">&lt;/</span>
                <span className="text-red-400">html</span>
                <span className="text-gray-400">&gt;</span>
              </pre>
            </div>
          </div>

          {/* CSS Code snippet - right side */}
          <div className="absolute right-[7%] top-1/2 transform -translate-y-1/2 w-96 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-gray-800 px-2 py-1 flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="bg-gray-900 text-white p-3 font-mono text-xs leading-5">
              <pre>
                <span className="text-purple-400">@keyframes</span>{" "}
                <span className="text-yellow-300">float</span>{" "}
                <span className="text-gray-400">{"{"}</span>
                {"\n"}
                <span className="text-gray-400"> </span>
                <span className="text-blue-400">0%</span>{" "}
                <span className="text-gray-400">{"{"}</span>{" "}
                <span className="text-cyan-400">transform</span>
                <span className="text-gray-400">:</span>{" "}
                <span className="text-yellow-300">translate</span>
                <span className="text-gray-400">(</span>
                <span className="text-orange-400">0</span>
                <span className="text-gray-400">);</span>{" "}
                <span className="text-gray-400">{"}"}</span>
                {"\n"}
                <span className="text-gray-400"> </span>
                <span className="text-blue-400">50%</span>{" "}
                <span className="text-gray-400">{"{"}</span>{" "}
                <span className="text-cyan-400">transform</span>
                <span className="text-gray-400">:</span>{" "}
                <span className="text-yellow-300">translate</span>
                <span className="text-gray-400">(</span>
                <span className="text-orange-400">-20px</span>
                <span className="text-gray-400">);</span>{" "}
                <span className="text-gray-400">{"}"}</span>
                {"\n"}
                <span className="text-gray-400"> </span>
                <span className="text-blue-400">100%</span>{" "}
                <span className="text-gray-400">{"{"}</span>{" "}
                <span className="text-cyan-400">transform</span>
                <span className="text-gray-400">:</span>{" "}
                <span className="text-yellow-300">translate</span>
                <span className="text-gray-400">(</span>
                <span className="text-orange-400">0</span>
                <span className="text-gray-400">);</span>{" "}
                <span className="text-gray-400">{"}"}</span>
                {"\n"}
                <span className="text-gray-400">{"}"}</span>
                {"\n"}
                {"\n"}
                <span className="text-green-400">.hero-icon</span>{" "}
                <span className="text-gray-400">{"{"}</span>
                {"\n"}
                <span className="text-gray-400"> </span>
                <span className="text-cyan-400">animation</span>
                <span className="text-gray-400">:</span>{" "}
                <span className="text-yellow-300">float</span>{" "}
                <span className="text-orange-400">3s</span>{" "}
                <span className="text-purple-400">infinite</span>{" "}
                <span className="text-purple-400">ease-in-out</span>
                <span className="text-gray-400">;</span>
                {"\n"}
                <span className="text-gray-400"> </span>
                <span className="text-cyan-400">color</span>
                <span className="text-gray-400">:</span>{" "}
                <span className="text-orange-400">#0082f0</span>
                <span className="text-gray-400">;</span>
                {"\n"}
                <span className="text-gray-400">{"}"}</span>
              </pre>
            </div>
          </div>

          {/* Connecting arrows */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {/* Top curved arrow - HTML to CSS */}
            <path
              d="M 35% 40% C 45% 20%, 55% 20%, 65% 40%"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
              markerEnd="url(#arrowhead)"
            />

            {/* Bottom curved arrow - CSS to HTML */}
            <path
              d="M 65% 60% C 55% 80%, 45% 80%, 35% 60%"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray="10,5"
              markerEnd="url(#arrowhead)"
            />

            {/* Arrow for button click - optional vertical arrow */}
            <path
              d="M 50% 75% L 50% 85%"
              stroke="#fcd34d"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#yellowarrowhead)"
            />

            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
              <marker
                id="yellowarrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#fcd34d" />
              </marker>
            </defs>
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div
            className="flex flex-col items-center justify-center gap-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-shadow mb-4">
                สอนการเขียน HTML และ CSS
              </h2>
              <p className="text-lg text-white">
                เรียนรู้พื้นฐานการสร้างเว็บไซต์ด้วย HTML และ CSS
                ตั้งแต่การสร้างโครงสร้างพื้นฐานไปจนถึงการตกแต่งให้สวยงาม
              </p>
              <div className="mt-8">
                <div className="text-white text-xl mb-3">
                  รับจำนวนจำกัด (20 คน)
                </div>
                <Link href="/application">
                  <motion.button
                    className="px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    คลิกเพื่อสมัครเลย
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content navigation */}
      <div className="bg-white border-b border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide py-2 gap-2">
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "what"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-transparent text-gray-700 hover:bg-yellow-50"
              }`}
              onClick={() => setActiveSection("what")}
            >
              HTML & CSS คืออะไร
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "topics"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-transparent text-gray-700 hover:bg-yellow-50"
              }`}
              onClick={() => setActiveSection("topics")}
            >
              หัวข้อที่จะเรียนรู้
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "frameworks"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-transparent text-gray-700 hover:bg-yellow-50"
              }`}
              onClick={() => setActiveSection("frameworks")}
            >
              CSS Frameworks
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "activities"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-transparent text-gray-700 hover:bg-yellow-50"
              }`}
              onClick={() => setActiveSection("activities")}
            >
              กิจกรรมในค่าย
            </button>
          </div>
        </div>
      </div>

      {/* Main content section */}
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
              HTML & CSS คืออะไร
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <div className="flex items-center mb-2">
                    <FaHtml5 className="text-yellow-600 text-2xl mr-2" />
                    <h3 className="font-bold text-gray-800">HTML คืออะไร</h3>
                  </div>
                  <p>
                    HTML (Hypertext Markup Language)
                    เป็นภาษามาร์กอัปที่ใช้สำหรับสร้างโครงสร้างของเว็บเพจ HTML
                    ใช้ "แท็ก" (tags) เพื่อกำหนดองค์ประกอบต่างๆ ของเว็บเพจ เช่น
                    หัวข้อ, ย่อหน้า, รูปภาพ, ลิงก์, และฟอร์ม
                  </p>
                  <div className="mt-3 bg-white p-3 rounded-lg text-sm overflow-x-auto">
                    <pre className="text-gray-700">
                      <code>
                        {`<!DOCTYPE html>
<html>
  <head>
    <title>ชื่อเว็บไซต์</title>
  </head>
  <body>
    <h1>นี่คือหัวข้อ</h1>
    <p>นี่คือย่อหน้า</p>
  </body>
</html>`}
                      </code>
                    </pre>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <div className="flex items-center mb-2">
                    <FaCss3Alt className="text-yellow-500 text-2xl mr-2" />
                    <h3 className="font-bold text-gray-800">CSS คืออะไร</h3>
                  </div>
                  <p>
                    CSS (Cascading Style Sheets)
                    เป็นภาษาที่ใช้สำหรับตกแต่งและจัดรูปแบบเว็บเพจที่สร้างด้วย
                    HTML CSS ช่วยให้เราสามารถกำหนดสี, ขนาด, แบบอักษร, การจัดวาง
                    และลักษณะการแสดงผลอื่นๆ ของเว็บไซต์
                  </p>
                  <div className="mt-3 bg-white p-3 rounded-lg text-sm overflow-x-auto">
                    <pre className="text-gray-700">
                      <code>
                        {`body {
  background-color: #f5f5f5;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  line-height: 1.6;
  margin-bottom: 15px;
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  ทำไมต้องเรียนรู้ HTML และ CSS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-medium">พื้นฐานของการพัฒนาเว็บ</p>
                    <p className="text-sm text-gray-600 mt-1">
                      ทุกเว็บไซต์ล้วนสร้างขึ้นจาก HTML และ CSS เป็นพื้นฐาน
                      ไม่ว่าจะใช้เฟรมเวิร์กหรือเครื่องมือสมัยใหม่ใดๆ ก็ตาม
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-medium">ควบคุมการแสดงผลได้อย่างแม่นยำ</p>
                    <p className="text-sm text-gray-600 mt-1">
                      การเข้าใจ HTML และ CSS อย่างลึกซึ้ง
                      ช่วยให้คุณสามารถสร้างเว็บไซต์ตามที่คุณต้องการได้อย่างแม่นยำ
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-medium">ต่อยอดไปสู่เทคโนโลยีอื่นๆ</p>
                    <p className="text-sm text-gray-600 mt-1">
                      การเข้าใจ HTML และ CSS เป็นพื้นฐานสำคัญในการเรียนรู้
                      JavaScript, React, Angular หรือเฟรมเวิร์กอื่นๆ
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-medium">เป็นที่ต้องการในตลาดงาน</p>
                    <p className="text-sm text-gray-600 mt-1">
                      ทักษะ HTML และ CSS
                      เป็นสิ่งที่นายจ้างมองหาในตำแหน่งงานด้านการพัฒนาเว็บ, UI/UX
                      และการออกแบบดิจิทัล
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  การทำงานร่วมกับ Figma
                </h3>
                <p>
                  HTML และ CSS เป็นขั้นตอนถัดไปหลังจากการออกแบบใน Figma
                  เมื่อคุณมีดีไซน์ที่สมบูรณ์แล้ว การเข้าใจ HTML และ CSS
                  จะช่วยให้คุณสามารถแปลงดีไซน์นั้นเป็นเว็บไซต์จริงที่ใช้งานได้
                  Figma มีเครื่องมือช่วยในการดึงข้อมูล CSS จากดีไซน์
                  ทำให้กระบวนการพัฒนาเป็นไปอย่างราบรื่น
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
            <p className="mb-6">
              ในค่าย CDSC คุณจะได้เรียนรู้ HTML และ CSS
              ตั้งแต่พื้นฐานไปจนถึงเทคนิคที่ใช้งานได้จริง
              โดยมีหัวข้อครอบคลุมดังนี้
            </p>

            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {htmlCssTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 transition-all hover:shadow-md"
                  variants={fadeIn}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3">
                      {topic.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {topic.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{topic.description}</p>
                  <div className="mt-3 pt-3 border-t border-yellow-200/50">
                    <p className="text-sm text-gray-700">{topic.details}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 p-5 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                เรียนรู้จากตัวอย่างจริง
              </h3>
              <p>
                เราจะเรียนรู้ HTML และ CSS ผ่านการสร้างโปรเจคจริง เช่น
                หน้าเว็บส่วนตัว, หน้า Landing Page หรือหน้าผลิตภัณฑ์
                ทำให้เข้าใจการนำไปใช้งานจริงมากกว่าการเรียนเฉพาะทฤษฎี
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="font-medium text-center">หน้าโปรไฟล์ส่วนตัว</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="font-medium text-center">Landing Page</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="font-medium text-center">หน้าแสดงสินค้า</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "frameworks" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaLayerGroup className="text-yellow-500 mr-2" />
              CSS Frameworks
            </h2>

            <p className="mb-6">
              นอกจากการเขียน CSS แบบปกติแล้ว ในค่ายเรายังแนะนำ CSS Frameworks
              ที่ช่วยให้การพัฒนาเว็บไซต์เป็นไปอย่างรวดเร็วและมีประสิทธิภาพมากขึ้น
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {cssFrameworks.map((framework) => (
                <div
                  key={framework.id}
                  className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 h-full"
                >
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {framework.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{framework.description}</p>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">คุณสมบัติ:</span>{" "}
                      {framework.features}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 mb-8">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                ข้อดีของการใช้ CSS Framework
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">พัฒนาได้รวดเร็วขึ้น</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ใช้คอมโพเนนต์สำเร็จรูปและคลาส CSS ที่กำหนดไว้แล้ว
                    ทำให้สร้างเว็บไซต์ได้เร็วขึ้น
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">รองรับ Responsive Design</p>
                  <p className="text-sm text-gray-600 mt-1">
                    มาพร้อมระบบ Grid และคอมโพเนนต์ที่รองรับการแสดงผลบนทุกอุปกรณ์
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">มีมาตรฐานการเขียนโค้ด</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ช่วยให้โค้ดมีความสอดคล้องและเป็นระเบียบ ทำให้ดูแลรักษาง่าย
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium">ชุมชนขนาดใหญ่</p>
                  <p className="text-sm text-gray-600 mt-1">
                    มีชุมชนผู้ใช้งานขนาดใหญ่ ทำให้หาความช่วยเหลือ ตัวอย่าง
                    และทรัพยากรได้ง่าย
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-200 to-yellow-100 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                ในค่าย CDSC
              </h3>
              <p>
                ในค่ายของเรา เราจะแนะนำพื้นฐาน CSS Framework
                ที่นิยมใช้ในปัจจุบัน โดยเน้นที่ Tailwind CSS
                ซึ่งเป็นเฟรมเวิร์กที่ใช้งานง่ายและเหมาะสำหรับผู้เริ่มต้น
                คุณจะได้เรียนรู้การนำ Tailwind CSS
                มาใช้สร้างหน้าเว็บที่สวยงามและรองรับทุกขนาดหน้าจอ
              </p>
              <div className="mt-4 bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                <p className="text-center">
                  <code className="px-2 py-1 bg-yellow-100 rounded text-yellow-800">
                    npm install tailwindcss
                  </code>
                </p>
              </div>
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
              <FaPenNib className="text-yellow-500 mr-2" />
              กิจกรรมในค่าย
            </h2>

            <p className="mb-6">
              ในค่าย CDSC คุณจะได้เรียนรู้ HTML และ CSS
              ผ่านกิจกรรมที่สนุกและได้ลงมือปฏิบัติจริง
              เน้นการนำไปใช้กับโปรเจคจริง
            </p>

            <div className="space-y-6">
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  Workshop: สร้างเว็บเพจแรกของคุณ
                </h3>
                <p>
                  เรียนรู้พื้นฐาน HTML และ CSS ผ่านการสร้างเว็บเพจอย่างง่าย
                  โดยเริ่มจากโครงสร้างพื้นฐาน, การจัดวางองค์ประกอบ,
                  การใส่รูปภาพ, ลิงก์ และการตกแต่งด้วย CSS
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    HTML พื้นฐาน
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    CSS พื้นฐาน
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    การจัดองค์ประกอบ
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  กิจกรรม: แปลงดีไซน์จาก Figma เป็นโค้ด
                </h3>
                <p>
                  นำดีไซน์ที่สร้างไว้ใน Figma มาเขียนเป็นโค้ด HTML และ CSS
                  เพื่อสร้างเว็บเพจที่ใช้งานได้จริง เรียนรู้วิธีดึงข้อมูลสี,
                  ขนาด, ระยะห่าง และทรัพยากรต่างๆ จาก Figma มาใช้ในโค้ด
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    Figma to Code
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    CSS Properties
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    Layout Techniques
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  โปรเจค: สร้างเว็บไซต์ส่วนตัว
                </h3>
                <p>
                  นำความรู้ HTML และ CSS
                  มาสร้างเว็บไซต์ส่วนตัวที่แสดงผลงานและข้อมูลของคุณ
                  โดยใช้เทคนิคต่างๆ ที่ได้เรียนรู้ เช่น Responsive Design, CSS
                  Animation และ Flexbox/Grid
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    โปรเจคจริง
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    Responsive Design
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    CSS Advanced
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-yellow-200 to-yellow-100 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                เตรียมพร้อมก่อนเข้าค่าย
              </h3>
              <p className="mb-4">
                เพื่อให้ได้ประโยชน์สูงสุดจากค่าย เราแนะนำให้คุณติดตั้ง Visual
                Studio Code และ Browser ล่าสุด (Chrome หรือ Firefox)
                และลองศึกษาพื้นฐาน HTML เบื้องต้นก่อนเข้าร่วม
              </p>
              <div className="flex justify-center">
                <Link href="/application">
                  <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors font-medium">
                    สมัครเข้าร่วมค่าย
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer with aero glass design */}
      <div className="bg-gradient-to-t from-yellow-50 to-transparent py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-200 shadow-lg">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
              เชื่อมโยงกับหัวข้ออื่นๆ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/topics/design-thinking"
                className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <LuBrain className="text-yellow-500 text-3xl mb-2" />
                <span className="font-medium">Design Thinking</span>
                <span className="text-sm text-gray-600 mt-1">
                  เรียนรู้การคิดเชิงออกแบบก่อนลงมือทำ
                </span>
              </Link>
              <Link
                href="/topics/figma"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <PiFigmaLogo className="text-blue-500 text-3xl mb-2" />
                <span className="font-medium">Figma เบื้องต้น</span>
                <span className="text-sm text-gray-600 mt-1">
                  ออกแบบ UI/UX ก่อนเขียนโค้ด
                </span>
              </Link>
              <Link
                href="/topics/javascript"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <div className="text-blue-500 text-3xl mb-2">JS</div>
                <span className="font-medium">JavaScript</span>
                <span className="text-sm text-gray-600 mt-1">
                  เพิ่มการโต้ตอบให้กับเว็บไซต์
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
