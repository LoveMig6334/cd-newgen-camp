"use client";
import { motion } from "framer-motion";
import Link from "next/link";

import { useState } from "react";
import { FaLaptopCode } from "react-icons/fa";
import {
  FaArrowLeft,
  FaPeopleGroup,
  FaPuzzlePiece,
  FaRegLightbulb,
} from "react-icons/fa6";
import { FiTarget } from "react-icons/fi";
import { LuBrain, LuLightbulb, LuPencil } from "react-icons/lu";
import { PiFigmaLogo } from "react-icons/pi";
import { RiJavascriptFill } from "react-icons/ri";
import { TbTestPipe } from "react-icons/tb";

export default function DesignThinking() {
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

  const designThinkingSteps = [
    {
      id: "empathize",
      title: "Empathize",
      icon: <FaPeopleGroup className="text-3xl mb-2" />,
      description:
        "เข้าใจปัญหาและความต้องการของผู้ใช้อย่างลึกซึ้ง ผ่านการสัมภาษณ์ สังเกตการณ์ และเก็บข้อมูล",
      details:
        "การเข้าใจความต้องการและปัญหาของผู้ใช้คือหัวใจสำคัญของการออกแบบที่ดี ในขั้นตอนนี้เราจะเรียนรู้เทคนิคการเก็บข้อมูลผู้ใช้ การสัมภาษณ์อย่างมีประสิทธิภาพ และการสร้าง User Personas เพื่อเข้าใจกลุ่มเป้าหมาย",
    },
    {
      id: "define",
      title: "Define",
      icon: <FiTarget className="text-3xl mb-2" />,
      description:
        "กำหนดปัญหาและความต้องการให้ชัดเจน เพื่อตั้งโจทย์ในการแก้ปัญหาที่ตรงจุด",
      details:
        "การกำหนดปัญหาให้ชัดเจนช่วยให้การออกแบบมีเป้าหมายที่แน่นอน เราจะเรียนรู้วิธีการสังเคราะห์ข้อมูล การเขียน Problem Statement และการใช้เครื่องมือ How Might We Questions เพื่อกำหนดขอบเขตการแก้ปัญหา",
    },
    {
      id: "ideate",
      title: "Ideate",
      icon: <LuLightbulb className="text-3xl mb-2" />,
      description:
        "ระดมความคิดและสร้างไอเดียที่หลากหลาย เพื่อหาทางแก้ปัญหาที่สร้างสรรค์",
      details:
        "การระดมความคิดอย่างสร้างสรรค์คือกุญแจสู่นวัตกรรม เราจะเรียนรู้เทคนิคการ Brainstorming, Mind Mapping, Crazy 8s และวิธีการคิดนอกกรอบเพื่อสร้างไอเดียที่แปลกใหม่และมีประสิทธิภาพ",
    },
    {
      id: "prototype",
      title: "Prototype",
      icon: <FaPuzzlePiece className="text-3xl mb-2" />,
      description: "สร้างต้นแบบแนวคิดอย่างรวดเร็ว เพื่อทดสอบและพัฒนาไอเดีย",
      details:
        "การสร้างต้นแบบช่วยให้เห็นภาพไอเดียที่เป็นรูปธรรม เราจะเรียนรู้การสร้าง Low-fidelity และ High-fidelity Prototypes ด้วยเครื่องมือต่างๆ เช่น Figma รวมถึงเทคนิคการทำ Paper Prototyping อย่างมีประสิทธิภาพ",
    },
    {
      id: "test",
      title: "Test",
      icon: <TbTestPipe className="text-3xl mb-2" />,
      description: "ทดสอบต้นแบบกับผู้ใช้จริง รวบรวมฟีดแบค และนำมาปรับปรุง",
      details:
        "การทดสอบกับผู้ใช้จริงช่วยให้เราค้นพบจุดบกพร่องและโอกาสในการพัฒนา เราจะเรียนรู้วิธีการออกแบบการทดสอบ การเก็บข้อมูลฟีดแบค และวิธีการวิเคราะห์ผลเพื่อนำไปปรับปรุงผลงาน",
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
            <LuBrain className="text-yellow-500 mr-2 text-2xl sm:text-3xl" />
            Design Thinking
          </h1>
          <div className="w-24"></div> {/* Empty div for centering */}
        </div>
      </div>

      {/* Hero section with aero design */}
      <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-200 overflow-hidden">
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
                สอนการคิดเชิงออกแบบ
              </h2>
              <p className="text-lg text-yellow-50">
                เรียนรู้กระบวนการคิดเชิงออกแบบที่ช่วยให้คุณสร้างสรรค์นวัตกรรมและแก้ปัญหาอย่างมีประสิทธิภาพ
                พร้อมนำไปใช้ในการพัฒนาโปรเจคของตัวเอง
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-md rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <LuBrain className="text-9xl text-white/90" />
                </div>
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
              Design Thinking คืออะไร
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "process"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-transparent text-gray-700 hover:bg-yellow-50"
              }`}
              onClick={() => setActiveSection("process")}
            >
              กระบวนการ Design Thinking
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "benefits"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-transparent text-gray-700 hover:bg-yellow-50"
              }`}
              onClick={() => setActiveSection("benefits")}
            >
              ประโยชน์ของ Design Thinking
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
              Design Thinking คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                Design Thinking
                คือกระบวนการคิดเชิงออกแบบที่มุ่งเน้นการแก้ปัญหาอย่างสร้างสรรค์
                โดยเอาผู้ใช้เป็นศูนย์กลาง (Human-Centered Design)
                วิธีการนี้ช่วยให้เราสามารถเข้าใจปัญหาอย่างลึกซึ้ง คิดนอกกรอบ
                และสร้างนวัตกรรมที่ตอบโจทย์ความต้องการของผู้ใช้อย่างแท้จริง
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <h3 className="font-bold text-gray-800">หลักการสำคัญ</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>เน้นการเข้าใจความต้องการของผู้ใช้อย่างลึกซึ้ง</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>สร้างไอเดียที่หลากหลายโดยไม่กลัวความล้มเหลว</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>ทดลองและพัฒนาต้นแบบอย่างรวดเร็ว</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span>ปรับปรุงไอเดียจากฟีดแบคอย่างต่อเนื่อง</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <h3 className="font-bold text-gray-800">ที่มาและความสำคัญ</h3>
                  <p className="mt-2">
                    Design Thinking ถูกพัฒนาที่ Stanford d.school
                    และได้รับการยอมรับจากองค์กรชั้นนำทั่วโลก เช่น IDEO, Apple,
                    Google
                    ในฐานะเครื่องมือสำคัญในการสร้างนวัตกรรมและแก้ปัญหาที่ซับซ้อน
                    ช่วยให้องค์กรและนักพัฒนาสามารถสร้างผลิตภัณฑ์และบริการที่ตอบโจทย์ผู้ใช้อย่างแท้จริง
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "process" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaPuzzlePiece className="text-yellow-500 mr-2" />
              กระบวนการ Design Thinking
            </h2>
            <p className="mb-6">
              Design Thinking ประกอบด้วยขั้นตอนสำคัญ 5
              ขั้นตอนที่ช่วยให้เราพัฒนาไอเดียจากความเข้าใจผู้ใช้ไปสู่การแก้ปัญหาอย่างสร้างสรรค์
            </p>

            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {designThinkingSteps.map((step) => (
                <motion.div
                  key={step.id}
                  className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 transition-all hover:shadow-md"
                  variants={fadeIn}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                  <div className="mt-3 pt-3 border-t border-yellow-200/50">
                    <p className="text-sm text-gray-700">{step.details}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl">
              <p className="text-gray-700">
                <strong>หมายเหตุ:</strong> กระบวนการ Design Thinking
                ไม่จำเป็นต้องเป็นเส้นตรง
                คุณสามารถย้อนกลับไปขั้นตอนก่อนหน้าได้เสมอเมื่อได้รับข้อมูลหรือข้อคิดเห็นใหม่
              </p>
            </div>
          </motion.div>
        )}

        {activeSection === "benefits" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FiTarget className="text-yellow-500 mr-2" />
              ประโยชน์ของ Design Thinking
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  สำหรับการพัฒนาโปรเจค
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>สร้างโซลูชั่นที่ตรงกับความต้องการของผู้ใช้จริง</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>ลดความเสี่ยงในการพัฒนาฟีเจอร์ที่ไม่ตอบโจทย์</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>ประหยัดเวลาและทรัพยากรในการพัฒนา</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>สร้างนวัตกรรมและความแตกต่างเหนือคู่แข่ง</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  สำหรับการพัฒนาตนเอง
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>ฝึกการคิดนอกกรอบและมองปัญหาในมุมที่แตกต่าง</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>พัฒนาทักษะการทำงานเป็นทีมและการสื่อสาร</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>
                      เพิ่มความเข้าใจในพฤติกรรมและความต้องการของผู้ใช้
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>
                      ฝึกการรับมือกับความไม่แน่นอนและปรับตัวอย่างรวดเร็ว
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 md:col-span-2">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  กรณีศึกษาความสำเร็จ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <h4 className="font-semibold">Airbnb</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ใช้ Design Thinking ในการปรับปรุงประสบการณ์การใช้งาน
                      ช่วยเพิ่มยอดการจองและความพึงพอใจของผู้ใช้อย่างมีนัยสำคัญ
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <h4 className="font-semibold">Apple</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      นำ Design Thinking
                      มาใช้พัฒนาผลิตภัณฑ์ที่เน้นประสบการณ์ผู้ใช้ที่เรียบง่ายแต่ทรงพลัง
                    </p>
                  </div>
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
            className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <LuPencil className="text-yellow-500 mr-2" />
              กิจกรรมในค่าย
            </h2>

            <p className="mb-6">
              ในค่าย CDSC คุณจะได้เรียนรู้ Design Thinking
              ผ่านกิจกรรมที่สนุกและได้ลงมือทำจริง
              โดยเน้นการทำงานเป็นทีมและการนำไปประยุกต์ใช้
            </p>

            <div className="space-y-6">
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  Workshop: โจทย์จากโลกจริง
                </h3>
                <p>
                  ได้รับโจทย์ปัญหาจริงที่พบในชีวิตประจำวัน แล้วนำกระบวนการ
                  Design Thinking มาแก้ไข โดยแบ่งเป็นทีม
                  และแข่งขันกันนำเสนอโซลูชั่นที่สร้างสรรค์และใช้ได้จริง
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    ทำงานเป็นทีม
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    ลงพื้นที่สัมภาษณ์
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    นำเสนอไอเดีย
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  กิจกรรม: Prototype Challenge
                </h3>
                <p>
                  ฝึกการสร้าง Prototype อย่างรวดเร็วจากวัสดุที่เตรียมให้
                  เพื่อแก้โจทย์ปัญหาที่ได้รับ ภายในเวลาจำกัด
                  และนำเสนอต่อเพื่อนร่วมค่าย
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    สร้างสรรค์
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    ทำงานภายใต้เวลาจำกัด
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    ให้และรับ Feedback
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  โปรเจคจบค่าย
                </h3>
                <p>
                  นำความรู้ Design Thinking มาประยุกต์ใช้ในการพัฒนาโปรเจคกลุ่ม
                  โดยผ่านทุกขั้นตอนตั้งแต่การเข้าใจปัญหา การระดมไอเดีย
                  การสร้างต้นแบบ และการทดสอบกับผู้ใช้
                  เพื่อนำเสนอในวันสุดท้ายของค่าย
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    โปรเจคจริง
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    นำเสนอผลงาน
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    รับคำแนะนำจากวิทยากร
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-yellow-200 to-yellow-100 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                พร้อมแล้วที่จะเริ่มต้น?
              </h3>
              <p className="mb-4">
                ในค่าย CDSC คุณจะได้เรียนรู้ Design Thinking ผ่านการปฏิบัติจริง
                พร้อมคำแนะนำจากวิทยากรผู้เชี่ยวชาญ
                และสามารถนำความรู้ไปพัฒนาโปรเจคของตัวเองต่อไปได้
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
                href="/topics/figma"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <PiFigmaLogo className="text-blue-500 text-3xl mb-2" />
                <span className="font-medium">Figma เบื้องต้น</span>
                <span className="text-sm text-gray-600 mt-1">
                  นำ Design Thinking ไปออกแบบใน Figma
                </span>
              </Link>
              <Link
                href="/topics/html-css"
                className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <FaLaptopCode className="text-yellow-500 text-3xl mb-2" />
                <span className="font-medium">HTML & CSS</span>
                <span className="text-sm text-gray-600 mt-1">
                  เปลี่ยนดีไซน์ให้เป็นเว็บไซต์จริง
                </span>
              </Link>
              <Link
                href="/topics/javascript"
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <RiJavascriptFill className="text-blue-500 text-3xl mb-2" />
                <span className="font-medium">JavaScript</span>
                <span className="text-sm text-gray-600 mt-1">
                  เพิ่มการโต้ตอบกับผู้ใช้
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
