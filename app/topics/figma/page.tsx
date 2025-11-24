"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  FaArrowLeft,
  FaLaptopCode,
  FaLayerGroup,
  FaPenNib,
  FaRegLightbulb,
} from "react-icons/fa";
import { FaArrowPointer, FaPuzzlePiece, FaTableCells } from "react-icons/fa6";
import { FiGrid, FiSettings, FiTarget } from "react-icons/fi";
import { LuBrain } from "react-icons/lu";
import { PiFigmaLogo } from "react-icons/pi";
import {
  TbBrowserCheck,
  TbComponents,
  TbDeviceDesktop,
  TbDeviceMobile,
  TbDeviceTablet,
} from "react-icons/tb";

export default function FigmaBasics() {
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

  const figmaTools = [
    {
      id: "frames",
      title: "Frames",
      icon: <FaTableCells className="text-3xl mb-2" />,
      description:
        "สร้างพื้นที่สำหรับการออกแบบในขนาดต่างๆ เช่น หน้าจอมือถือ, แท็บเล็ต, เดสก์ท็อป",
      details:
        "Frames เป็นองค์ประกอบพื้นฐานในการออกแบบ UI ที่ช่วยให้คุณกำหนดขนาดและขอบเขตของหน้าจอที่ต้องการออกแบบ สามารถเลือกขนาดสำเร็จรูปหรือกำหนดเองได้ตามความต้องการ",
    },
    {
      id: "components",
      title: "Components",
      icon: <TbComponents className="text-3xl mb-2" />,
      description:
        "สร้างชิ้นส่วนการออกแบบที่นำกลับมาใช้ใหม่ได้ เช่น ปุ่ม, เมนู, การ์ด",
      details:
        "Components ช่วยให้การออกแบบมีความสอดคล้องและประหยัดเวลา เมื่อคุณปรับแต่ง Main Component ทุก Instance ที่ใช้จะเปลี่ยนแปลงตาม ช่วยให้จัดการดีไซน์ขนาดใหญ่ได้อย่างมีประสิทธิภาพ",
    },
    {
      id: "autolayout",
      title: "Auto Layout",
      icon: <FiGrid className="text-3xl mb-2" />,
      description:
        "จัดการระยะห่างและการเรียงตัวของอิลิเมนต์โดยอัตโนมัติ รองรับการปรับขนาดอย่างยืดหยุ่น",
      details:
        "Auto Layout ช่วยให้องค์ประกอบปรับตัวอัตโนมัติเมื่อเพิ่ม, ลบ หรือเปลี่ยนขนาดเนื้อหา เหมาะสำหรับการออกแบบที่ต้องรองรับข้อมูลที่เปลี่ยนแปลง เช่น รายการ, การ์ด หรือปุ่มที่มีความยาวข้อความต่างกัน",
    },
    {
      id: "prototyping",
      title: "Prototyping",
      icon: <FaArrowPointer className="text-3xl mb-2" />,
      description:
        "สร้าง interactive prototype เพื่อจำลองการทำงานของดีไซน์ ก่อนนำไปพัฒนาจริง",
      details:
        "ฟีเจอร์ Prototyping ช่วยให้คุณเชื่อมต่อหน้าจอต่างๆ เพิ่มการเปลี่ยนหน้าและ animation เพื่อทดสอบประสบการณ์ผู้ใช้ สามารถแชร์กับทีมหรือผู้ใช้เพื่อรับฟีดแบคได้ง่าย",
    },
    {
      id: "plugins",
      title: "Plugins",
      icon: <FiSettings className="text-3xl mb-2" />,
      description:
        "เพิ่มความสามารถด้วยปลั๊กอินต่างๆ เช่น สร้างข้อมูลจำลอง, จัดการไอคอน, เพิ่มภาพประกอบ",
      details:
        "Figma มีระบบปลั๊กอินที่หลากหลายช่วยเพิ่มประสิทธิภาพในการออกแบบ เช่น Content Reel สำหรับข้อมูลจำลอง, Iconify สำหรับไอคอน, Unsplash สำหรับรูปภาพ และ Auto Flow สำหรับสร้างแผนผังการทำงาน",
    },
  ];

  const responsiveDesigns = [
    {
      id: "mobile",
      title: "Mobile",
      icon: <TbDeviceMobile className="text-3xl mb-2" />,
      dimensions: "320-480px",
      considerations:
        "ออกแบบสำหรับหน้าจอเล็กและการใช้งานด้วยนิ้ว แสดงเฉพาะเนื้อหาสำคัญ",
    },
    {
      id: "tablet",
      title: "Tablet",
      icon: <TbDeviceTablet className="text-3xl mb-2" />,
      dimensions: "768-1024px",
      considerations:
        "สามารถแสดงข้อมูลได้มากกว่ามือถือ มีการจัดวางที่ยืดหยุ่นกว่า",
    },
    {
      id: "desktop",
      title: "Desktop",
      icon: <TbDeviceDesktop className="text-3xl mb-2" />,
      dimensions: "1024px+",
      considerations:
        "แสดงข้อมูลได้มากที่สุด เน้นการนำเสนอแบบกว้างและการใช้งานด้วยเมาส์และคีย์บอร์ด",
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
            <PiFigmaLogo className="text-blue-500 mr-2 text-2xl sm:text-3xl" />
            Figma เบื้องต้น
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
                สอนการใช้ Figma เบื้องต้น
              </h2>
              <p className="text-lg text-blue-50">
                เรียนรู้การใช้งาน Figma เพื่อออกแบบ UI/UX อย่างมืออาชีพ
                ตั้งแต่พื้นฐานไปจนถึงเทคนิคที่นำไปใช้ได้จริงในการทำโปรเจค
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white/40 backdrop-blur-md rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PiFigmaLogo className="text-9xl text-white/90" />
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
              Figma คืออะไร
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "tools"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-transparent text-gray-700 hover:bg-blue-50"
              }`}
              onClick={() => setActiveSection("tools")}
            >
              เครื่องมือใน Figma
            </button>
            <button
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeSection === "responsive"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-transparent text-gray-700 hover:bg-blue-50"
              }`}
              onClick={() => setActiveSection("responsive")}
            >
              การออกแบบ Responsive
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
              Figma คืออะไร
            </h2>
            <div className="space-y-4">
              <p>
                Figma เป็นเครื่องมือออกแบบ UI/UX ที่ทำงานบนเว็บบราวเซอร์
                ช่วยให้นักออกแบบและทีมพัฒนาสามารถสร้าง ทดสอบ
                และแชร์ต้นแบบดีไซน์ได้อย่างมีประสิทธิภาพ
                โดยไม่ต้องติดตั้งโปรแกรมและทำงานร่วมกันได้แบบเรียลไทม์
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">จุดเด่นของ Figma</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>ทำงานบนเว็บบราวเซอร์ ไม่ต้องติดตั้งโปรแกรม</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>ทำงานร่วมกันแบบเรียลไทม์ หลายคนพร้อมกัน</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>มี Components และ Auto Layout ที่ทรงพลัง</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>สร้าง Prototype ได้อย่างรวดเร็วและง่ายดาย</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800">ทำไมต้องใช้ Figma</h3>
                  <p className="mt-2">
                    Figma เป็นเครื่องมือมาตรฐานในอุตสาหกรรมที่ช่วยให้การออกแบบ
                    UI/UX เป็นไปอย่างมีประสิทธิภาพ
                    ลดช่องว่างระหว่างนักออกแบบและนักพัฒนา
                    ทำให้กระบวนการทำงานราบรื่น
                    และช่วยสร้างผลิตภัณฑ์ที่มีคุณภาพสูง
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-gray-800 mb-3">
                  การใช้งาน Figma ในกระบวนการออกแบบ
                </h3>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <ol className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                        1
                      </span>
                      <div>
                        <p className="font-medium">เก็บความต้องการและวางแผน</p>
                        <p className="text-sm text-gray-600 mt-1">
                          ใช้ FigJam เพื่อสร้าง User Flow, Wireframe
                          และรวบรวมไอเดีย
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                        2
                      </span>
                      <div>
                        <p className="font-medium">ออกแบบ UI</p>
                        <p className="text-sm text-gray-600 mt-1">
                          สร้างดีไซน์หน้าจอโดยใช้ Component, Styles, และ Auto
                          Layout
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                        3
                      </span>
                      <div>
                        <p className="font-medium">สร้าง Prototype</p>
                        <p className="text-sm text-gray-600 mt-1">
                          เชื่อมต่อหน้าจอและเพิ่มการโต้ตอบเพื่อจำลองประสบการณ์ผู้ใช้
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                        4
                      </span>
                      <div>
                        <p className="font-medium">แชร์และรับฟีดแบค</p>
                        <p className="text-sm text-gray-600 mt-1">
                          แชร์ลิงก์กับทีมและผู้ใช้เพื่อรับคอมเมนต์และฟีดแบค
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                        5
                      </span>
                      <div>
                        <p className="font-medium">ส่งมอบให้นักพัฒนา</p>
                        <p className="text-sm text-gray-600 mt-1">
                          นักพัฒนาสามารถดูรายละเอียด CSS, ขนาด และสี
                          เพื่อนำไปพัฒนาได้อย่างถูกต้อง
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
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
              <FaPuzzlePiece className="text-blue-500 mr-2" />
              เครื่องมือใน Figma
            </h2>
            <p className="mb-6">
              Figma มีเครื่องมือที่ทรงพลังและเรียนรู้ได้ง่าย ช่วยให้คุณออกแบบ
              UI/UX ได้อย่างมีประสิทธิภาพ
            </p>

            <motion.div
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {figmaTools.map((tool) => (
                <motion.div
                  key={tool.id}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-100 transition-all hover:shadow-md"
                  variants={fadeIn}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{tool.description}</p>
                  <div className="mt-3 pt-3 border-t border-blue-200/50">
                    <p className="text-sm text-gray-700">{tool.details}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 p-5 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                เริ่มต้นใช้งาน Figma
              </h3>
              <p className="mb-4">
                สมัครใช้งาน Figma ได้ฟรี ที่{" "}
                <a
                  href="https://figma.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  figma.com
                </a>{" "}
                โดยใช้อีเมลของคุณ
                แผนฟรีรองรับการทำงานส่วนบุคคลและการเรียนรู้ได้อย่างเพียงพอ
                มีพื้นที่จัดเก็บ 3 ไฟล์ในแบบ Editor และทำงานร่วมกับผู้อื่นได้
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="font-medium">สำหรับนักศึกษา</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ใช้อีเมลสถาบันการศึกษาเพื่อรับสิทธิ์แผน Professional ฟรี
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="font-medium">ทดลองใช้งานบน Browser</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ไม่ต้องดาวน์โหลดโปรแกรม ใช้งานผ่านเว็บได้ทันที
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="font-medium">ดาวน์โหลด Desktop App</p>
                  <p className="text-sm text-gray-600 mt-1">
                    ใช้งานแบบ Offline ได้บางส่วนและมีประสิทธิภาพดีกว่า
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "responsive" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FiTarget className="text-blue-500 mr-2" />
              การออกแบบ Responsive
            </h2>

            <p className="mb-6">
              การออกแบบ Responsive ใน Figma
              ช่วยให้คุณสร้างดีไซน์ที่สามารถปรับตัวได้กับทุกขนาดหน้าจอ
              ตั้งแต่มือถือไปจนถึงจอขนาดใหญ่
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {responsiveDesigns.map((device) => (
                <div
                  key={device.id}
                  className="bg-blue-50 rounded-xl p-5 border border-blue-100"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                      {device.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {device.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {device.dimensions}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">{device.considerations}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mb-8">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                เทคนิคการออกแบบ Responsive ใน Figma
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium flex items-center">
                    <FaLayerGroup className="text-blue-500 mr-2" />
                    ใช้ Constraints
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    กำหนดตำแหน่งและพฤติกรรมของแต่ละอิลิเมนต์เมื่อ Frame
                    มีการเปลี่ยนแปลงขนาด เช่น ยึดติดขอบซ้าย, ขวา หรือตรงกลาง
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium flex items-center">
                    <FiGrid className="text-blue-500 mr-2" />
                    Auto Layout
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    สร้างองค์ประกอบที่ปรับขนาดได้อัตโนมัติ โดยกำหนดทิศทาง
                    (แนวนอน/แนวตั้ง), การจัดวาง และระยะห่าง
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium flex items-center">
                    <TbBrowserCheck className="text-blue-500 mr-2" />
                    ทดสอบหลายขนาดหน้าจอ
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    สร้าง Frame หลายขนาดเพื่อทดสอบดีไซน์ในหน้าจอต่างๆ และใช้
                    Variants เพื่อจัดการเวอร์ชันที่แตกต่างกัน
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-200 to-blue-100 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                ตัวอย่างการใช้งานจริง
              </h3>
              <p className="mb-4">
                นักออกแบบมืออาชีพมักสร้างดีไซน์ระบบ (Design System)
                ที่รองรับทุกขนาดหน้าจอ โดยใช้ Components และ Auto Layout
                เพื่อให้ทีมสามารถนำไปใช้งานได้อย่างสอดคล้องและมีประสิทธิภาพ
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                  <p className="font-medium">Bootstrap Grid ใน Figma</p>
                  <p className="text-sm text-gray-600 mt-1">
                    สร้างระบบกริดแบบ 12 คอลัมน์เหมือน Bootstrap
                    เพื่อช่วยในการออกแบบ Responsive
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                  <p className="font-medium">Responsive Components</p>
                  <p className="text-sm text-gray-600 mt-1">
                    สร้าง Component ที่ปรับตัวได้ในทุกขนาดหน้าจอ เช่น
                    เมนูที่เปลี่ยนเป็นแฮมเบอร์เกอร์บนมือถือ
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
              ในค่าย CDSC คุณจะได้เรียนรู้ Figma
              ผ่านกิจกรรมที่สนุกและได้ลงมือทำจริง
              เน้นการปฏิบัติและการนำไปใช้กับโปรเจคจริง
            </p>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  Workshop: ออกแบบหน้า Login
                </h3>
                <p>
                  เรียนรู้พื้นฐาน Figma ผ่านการออกแบบหน้า Login สวยๆ
                  โดยใช้เครื่องมือพื้นฐาน, การจัดวางองค์ประกอบ, การใช้สี
                  และการทำงานกับข้อความและรูปภาพ
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    เครื่องมือพื้นฐาน
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    การจัดองค์ประกอบ
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    ทฤษฎีสี
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  กิจกรรม: Design System Challenge
                </h3>
                <p>
                  สร้าง Design System เล็กๆ ที่ประกอบด้วย Component สำคัญ เช่น
                  ปุ่ม, การ์ด, ช่องข้อมูล โดยใช้ Auto Layout และ Component
                  เพื่อสร้างชุดดีไซน์ที่สามารถนำกลับมาใช้ใหม่ได้
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Components
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Auto Layout
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Design System
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  โปรเจค: ออกแบบเว็บไซต์/แอป
                </h3>
                <p>
                  นำความรู้ Figma
                  มาประยุกต์ใช้ในการออกแบบเว็บไซต์หรือแอปพลิเคชันตามโจทย์ที่ได้รับ
                  โดยออกแบบหน้าจอหลัก, สร้าง Prototype และนำเสนอผลงาน
                  พร้อมรับฟีดแบคจากวิทยากร
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    UI Design
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Prototyping
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    นำเสนอผลงาน
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-blue-200 to-blue-100 p-5 rounded-xl">
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                เตรียมพร้อมก่อนเข้าค่าย
              </h3>
              <p className="mb-4">
                เพื่อให้ได้ประโยชน์สูงสุดจากค่าย คุณสามารถสมัครบัญชี Figma
                ฟรีล่วงหน้าได้ที่{" "}
                <a
                  href="https://figma.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  figma.com
                </a>
                และลองเล่นเครื่องมือพื้นฐานเพื่อความคุ้นเคย
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
                  เรียนรู้การคิดเชิงออกแบบก่อนลงมือทำ
                </span>
              </Link>
              <Link
                href="/topics/html-css"
                className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl flex flex-col items-center text-center transition-all"
              >
                <FaLaptopCode className="text-yellow-500 text-3xl mb-2" />
                <span className="font-medium">HTML & CSS</span>
                <span className="text-sm text-gray-600 mt-1">
                  นำดีไซน์จาก Figma มาเขียนเป็นโค้ด
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
