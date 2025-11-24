"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  FaArrowLeft,
  FaCode,
  FaCss3Alt,
  FaHtml5,
  FaLayerGroup,
  FaRegLightbulb,
} from "react-icons/fa";
import { FaCircleNodes, FaPenNib, FaPuzzlePiece } from "react-icons/fa6";
import { LuBrain } from "react-icons/lu";
import { PiFigmaLogo } from "react-icons/pi";
import { RiJavascriptFill } from "react-icons/ri";
import { TbBrandReact, TbPrompt, TbWorldWww } from "react-icons/tb";

export default function Javascript() {
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

  const jsTopics = [
    {
      id: "basics",
      title: "พื้นฐาน JavaScript",
      icon: <RiJavascriptFill className="text-3xl mb-2" />,
      description:
        "ทำความเข้าใจโครงสร้างพื้นฐาน, ตัวแปร, ฟังก์ชัน และการทำงานของ JavaScript",
      details:
        "เรียนรู้เกี่ยวกับพื้นฐานของ JavaScript เช่น ตัวแปร, ประเภทข้อมูล, โครงสร้างควบคุม, ฟังก์ชัน, และวิธีการเขียนโค้ดที่มีประสิทธิภาพ เพื่อเป็นรากฐานสำคัญในการพัฒนา JavaScript ขั้นสูง",
    },
    {
      id: "dom",
      title: "DOM Manipulation",
      icon: <TbWorldWww className="text-3xl mb-2" />,
      description:
        "การเข้าถึงและจัดการองค์ประกอบ HTML ผ่าน Document Object Model",
      details:
        "DOM (Document Object Model) คือการแทนโครงสร้าง HTML เป็นออบเจกต์ที่ JavaScript สามารถจัดการได้ เราจะเรียนรู้วิธีการเข้าถึงองค์ประกอบ, เปลี่ยนแปลงเนื้อหา, จัดการกับ attributes และ classes รวมถึงการเพิ่ม/ลบองค์ประกอบ",
    },
    {
      id: "events",
      title: "Events และการโต้ตอบ",
      icon: <FaCircleNodes className="text-3xl mb-2" />,
      description:
        "การจัดการกับอีเวนต์ต่างๆ เช่น คลิก, ป้อนข้อมูล, เลื่อน เพื่อสร้างการโต้ตอบ",
      details:
        "Events เป็นกลไกสำคัญในการสร้างการโต้ตอบกับผู้ใช้ เราจะเรียนรู้การใช้ Event Listeners, การจัดการกับอีเวนต์ต่างๆ เช่น click, submit, keypress และวิธีการสร้างประสบการณ์ผู้ใช้ที่ราบรื่น",
    },
    {
      id: "async",
      title: "Asynchronous JavaScript",
      icon: <TbPrompt className="text-3xl mb-2" />,
      description: "การทำงานแบบ Asynchronous, Promises และการดึงข้อมูลจาก API",
      details:
        "JavaScript สามารถทำงานแบบ Asynchronous ซึ่งช่วยให้โปรแกรมทำงานอย่างมีประสิทธิภาพ เราจะเรียนรู้เกี่ยวกับ Callbacks, Promises, Async/Await และวิธีการใช้ Fetch API เพื่อดึงข้อมูลจาก Web Services",
    },
  ];

  const jsLibraries = [
    {
      id: "jquery",
      title: "jQuery",
      description:
        "ไลบรารีที่ทำให้การเขียน JavaScript ง่ายขึ้น เน้นการจัดการ DOM และอีเวนต์",
      features: "DOM Manipulation, AJAX, Animation",
    },
    {
      id: "react",
      title: "React",
      description: "ไลบรารีสำหรับสร้าง User Interface แบบ Component-Based",
      features: "Components, Virtual DOM, React Hooks",
    },
    {
      id: "vue",
      title: "Vue.js",
      description:
        "เฟรมเวิร์กที่ง่ายต่อการเรียนรู้ เน้นการสร้าง UI แบบ Progressive",
      features: "Reactive Data Binding, Components, Directives",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Aero-style glassmorphic header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-blue-50/80 border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/home#features"
            className="flex items-center text-blue-700 hover:text-blue-500 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>กลับสู่หน้าหลัก</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center">
            <div className="text-blue-500 mr-2 text-2xl sm:text-3xl">JS</div>
            JavaScript
          </h1>
          <div className="w-24"></div> {/* Empty div for centering */}
        </div>
      </div>

      {/* Hero section with aero design */}
      <div className="relative bg-gradient-to-br from-blue-400 to-blue-200 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Symmetrical background elements */}
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
                สอนการเขียน JavaScript
              </h2>
              <p className="text-lg text-blue-50">
                เรียนรู้พื้นฐานและเทคนิคการเขียน JavaScript
                เพื่อสร้างการโต้ตอบและความมีชีวิตชีวาให้กับเว็บไซต์
                พร้อมทำความเข้าใจการจัดการ DOM และการสร้าง Web Application
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-md rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl text-white/90 font-bold">JS</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content navigation */}
      <div className="bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide py-2 gap-2">
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "what"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-transparent text-gray-700 hover:bg-blue-50"
              }`}
              onClick={() => setActiveSection("what")}
            >
              JavaScript คืออะไร
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "topics"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-transparent text-gray-700 hover:bg-blue-50"
              }`}
              onClick={() => setActiveSection("topics")}
            >
              หัวข้อที่จะเรียนรู้
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "libraries"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-transparent text-gray-700 hover:bg-blue-50"
              }`}
              onClick={() => setActiveSection("libraries")}
            >
              JavaScript Libraries
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "activities"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-transparent text-gray-700 hover:bg-blue-50"
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaRegLightbulb className="text-blue-500 mr-2" />
              JavaScript คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                JavaScript
                เป็นภาษาโปรแกรมมิ่งที่ใช้สร้างการโต้ตอบและฟังก์ชันการทำงานให้กับเว็บไซต์
                ปัจจุบัน JavaScript ไม่ได้ทำงานเฉพาะในเว็บบราวเซอร์เท่านั้น
                แต่ยังสามารถใช้พัฒนาแอปพลิเคชันทั้งฝั่ง Client และ Server
                ทำให้เป็นหนึ่งในภาษาโปรแกรมมิ่งที่ได้รับความนิยมมากที่สุดในโลก
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">
                    บทบาทของ JavaScript
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้างการโต้ตอบกับผู้ใช้บนหน้าเว็บ</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>
                        จัดการและปรับเปลี่ยนเนื้อหาเว็บไซต์แบบ Dynamic
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>ดึงและส่งข้อมูลจาก/ไปยัง Server (AJAX)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้าง Animation และ Visual Effects</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">
                    ความสามารถของ JavaScript
                  </h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>
                        ทำงานในทุกเว็บบราวเซอร์โดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>มีระบบนิเวศขนาดใหญ่ของไลบรารีและเฟรมเวิร์ก</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>
                        พัฒนาได้ทั้งฝั่ง Frontend และ Backend (Node.js)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>รองรับการพัฒนาแอปมือถือ (React Native)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800">
                  ตัวอย่างโค้ด JavaScript พื้นฐาน
                </h3>
                <div className="mt-3 bg-white p-3 rounded-lg text-sm overflow-x-auto">
                  <pre className="text-gray-700">
                    <code>
                      {`// การเลือกองค์ประกอบและเปลี่ยนเนื้อหา
document.getElementById("demo").innerHTML = "Hello JavaScript!";

// การสร้างฟังก์ชัน
function sayHello(name) {
  return "สวัสดี, " + name + "!";
}

// การใช้งาน Event Listener
document.getElementById("button").addEventListener("click", function() {
  alert("คุณคลิกปุ่ม!");
});

// การใช้งานเงื่อนไข
let time = new Date().getHours();
let greeting;

if (time < 12) {
  greeting = "สวัสดีตอนเช้า";
} else if (time < 18) {
  greeting = "สวัสดีตอนบ่าย";
} else {
  greeting = "สวัสดีตอนเย็น";
}`}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-gray-800">
                  JavaScript ในปัจจุบัน
                </h3>
                <p>
                  JavaScript พัฒนาอย่างรวดเร็วและต่อเนื่อง ปัจจุบันมี ECMAScript
                  (ES) เป็นมาตรฐานของภาษา โดยรุ่นล่าสุดได้เพิ่มคุณสมบัติใหม่ๆ
                  เช่น Arrow Functions, Promises, async/await, Modules
                  และอีกมากมาย
                  ทำให้การเขียนโค้ดเป็นไปอย่างมีประสิทธิภาพและอ่านง่ายมากขึ้น
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
            <p className="mb-6">
              ในค่าย CDSC คุณจะได้เรียนรู้ JavaScript
              ตั้งแต่พื้นฐานไปจนถึงการนำไปประยุกต์ใช้จริง
              โดยมีหัวข้อครอบคลุมดังนี้
            </p>

            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {jsTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-100 transition-all hover:shadow-md"
                  variants={fadeIn}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                      {topic.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {topic.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{topic.description}</p>
                  <div className="mt-3 pt-3 border-t border-blue-200/50">
                    <p className="text-sm text-gray-700">{topic.details}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 bg-gradient-to-r from-blue-100 to-blue-50 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                ความเชื่อมโยงกับ HTML และ CSS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-medium flex items-center mb-2">
                    <FaCode className="text-blue-500 mr-2" />
                    HTML (โครงสร้าง)
                  </div>
                  <p className="text-sm text-gray-600">
                    สร้างโครงสร้างและองค์ประกอบพื้นฐานของเว็บเพจ
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-medium flex items-center mb-2">
                    <FaLayerGroup className="text-blue-500 mr-2" />
                    CSS (รูปลักษณ์)
                  </div>
                  <p className="text-sm text-gray-600">
                    กำหนดรูปแบบและการแสดงผลของเว็บไซต์
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-medium flex items-center mb-2">
                    <div className="text-blue-500 mr-2">JS</div>
                    JavaScript (พฤติกรรม)
                  </div>
                  <p className="text-sm text-gray-600">
                    เพิ่มการโต้ตอบและฟังก์ชันการทำงานให้กับเว็บไซต์
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-700">
                ทั้งสามเทคโนโลยีนี้ทำงานร่วมกันเพื่อสร้างเว็บไซต์ที่สมบูรณ์ โดย
                JavaScript ช่วยเพิ่มความมีชีวิตชีวาและ
                การโต้ตอบให้กับโครงสร้างและการออกแบบที่สร้างด้วย HTML และ CSS
              </p>
            </div>
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
              <FaLayerGroup className="text-blue-500 mr-2" />
              JavaScript Libraries
            </h2>

            <p className="mb-6">
              ไลบรารีและเฟรมเวิร์กของ JavaScript
              ช่วยให้การพัฒนาเป็นไปอย่างรวดเร็วและมีประสิทธิภาพมากขึ้น โดยในค่าย
              CDSC เราจะแนะนำไลบรารีที่นิยมใช้ในปัจจุบัน
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {jsLibraries.map((library) => (
                <div
                  key={library.id}
                  className="bg-blue-50 rounded-xl p-5 border border-blue-100 h-full"
                >
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {library.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{library.description}</p>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">คุณสมบัติ:</span>{" "}
                      {library.features}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mb-8">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                เจาะลึก: React
              </h3>
              <div className="flex items-center mb-4">
                <TbBrandReact className="text-blue-500 text-4xl mr-3" />
                <div>
                  <p className="font-medium">
                    React - A JavaScript library for building user interfaces
                  </p>
                  <p className="text-sm text-gray-600">
                    พัฒนาโดย Facebook (Meta)
                  </p>
                </div>
              </div>
              <p className="mb-4">
                React เป็นไลบรารี JavaScript ที่ได้รับความนิยมสูงสำหรับการสร้าง
                User Interface แบบ Component-Based
                ทำให้การพัฒนาเว็บแอปพลิเคชันมีประสิทธิภาพและบำรุงรักษาง่าย
                ในค่าย CDSC คุณจะได้เรียนรู้พื้นฐานของ React
                เพื่อเป็นก้าวแรกสู่การพัฒนา Web Application ที่ทันสมัย
              </p>
              <div className="bg-white p-3 rounded-lg text-sm overflow-x-auto">
                <pre className="text-gray-700">
                  <code>
                    {`// ตัวอย่างโค้ด React Component อย่างง่าย
import React from 'react';

function HelloWorld() {
  return (
    <div>
      <h1>สวัสดีชาวค่าย CDSC!</h1>
      <p>นี่คือตัวอย่าง React Component</p>
    </div>
  );
}

export default HelloWorld;`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-200 to-blue-100 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                เลือกไลบรารีให้เหมาะกับโปรเจค
              </h3>
              <p>
                การเลือกไลบรารีหรือเฟรมเวิร์กขึ้นอยู่กับความต้องการของโปรเจค
                ขนาดของทีม และความซับซ้อนของงาน ในค่าย CDSC
                เราจะแนะนำการเลือกเครื่องมือที่เหมาะสมสำหรับแต่ละสถานการณ์
                และวิธีการเรียนรู้เครื่องมือใหม่ๆ อย่างมีประสิทธิภาพ
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                  <p className="font-medium">โปรเจคขนาดเล็ก</p>
                  <p className="text-sm text-gray-600 mt-1">
                    JavaScript พื้นฐาน หรือ jQuery
                    สำหรับการโต้ตอบพื้นฐานและการจัดการ DOM อย่างง่าย
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                  <p className="font-medium">โปรเจคขนาดใหญ่</p>
                  <p className="text-sm text-gray-600 mt-1">
                    React, Vue หรือ Angular สำหรับการสร้าง Web Application
                    ที่ซับซ้อนและมีขนาดใหญ่
                  </p>
                </div>
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
              <FaPenNib className="text-blue-500 mr-2" />
              กิจกรรมในค่าย
            </h2>

            <p className="mb-6">
              ในค่าย CDSC คุณจะได้เรียนรู้ JavaScript
              ผ่านกิจกรรมที่สนุกและได้ลงมือปฏิบัติจริง
              เน้นการนำไปประยุกต์ใช้กับโปรเจคจริง
            </p>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  Workshop: เพิ่มการโต้ตอบให้กับเว็บไซต์
                </h3>
                <p>
                  เรียนรู้การใช้ JavaScript เพื่อเพิ่มการโต้ตอบให้กับเว็บไซต์
                  เช่น การสร้าง Form Validation, Modal Popup, Interactive Menu
                  และอื่นๆ
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    DOM Manipulation
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Event Handling
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Form Validation
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  กิจกรรม: สร้าง Mini Game ด้วย JavaScript
                </h3>
                <p>
                  สนุกกับการสร้างเกมง่ายๆ ด้วย JavaScript เช่น เกมทายตัวเลข,
                  เกมความจำ หรือเกมคำถาม-คำตอบ เพื่อเรียนรู้การจัดการสถานะ,
                  เงื่อนไข และการโต้ตอบกับผู้ใช้
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Game Logic
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    State Management
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Interactive UI
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  โปรเจค: พัฒนา Web App
                </h3>
                <p>
                  นำความรู้ JavaScript มาพัฒนา Web Application ง่ายๆ เช่น Todo
                  List, Notes App หรือ Weather App โดยใช้ API
                  และเทคนิคที่ได้เรียนรู้
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Fetch API
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Asynchronous JS
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Local Storage
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  Bonus: แนะนำ React เบื้องต้น
                </h3>
                <p>
                  สำหรับผู้ที่มีความพร้อม เราจะแนะนำพื้นฐานของ React
                  ซึ่งเป็นไลบรารี JavaScript ที่นิยมในปัจจุบัน
                  เพื่อเป็นก้าวแรกสู่การพัฒนา Modern Web Application
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    React Components
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Props & State
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Hooks
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-blue-200 to-blue-100 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                เตรียมพร้อมก่อนเข้าค่าย
              </h3>
              <p className="mb-4">
                เพื่อให้ได้ประโยชน์สูงสุดจากค่าย
                เราแนะนำให้คุณมีความรู้พื้นฐานด้าน HTML และ CSS มาก่อน
                และลองศึกษาพื้นฐาน JavaScript เบื้องต้นเพื่อเตรียมความพร้อม
              </p>
              <div className="flex justify-center">
                <Link href="/application">
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors font-medium">
                    สมัครเข้าร่วมค่าย
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer with aero glass design */}
      <div className="bg-gradient-to-t from-blue-50 to-transparent py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-blue-200 shadow-lg">
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
                  เริ่มต้นด้วยการออกแบบที่ดี
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
                href="/topics/html-css"
                className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <div className="flex text-3xl mb-2">
                  <FaHtml5 className="text-yellow-600" />
                  <FaCss3Alt className="text-yellow-500 -ml-1" />
                </div>
                <span className="font-medium">HTML & CSS</span>
                <span className="text-sm text-gray-600 mt-1">
                  สร้างโครงสร้างและสไตล์
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
