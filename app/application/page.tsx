"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function ApplicationPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    school: "",
    grade: "",
    reason: "",
    expectations: "",
    howDidYouHear: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send the form data to our API endpoint
      const response = await fetch("/api/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("เกิดข้อผิดพลาดในการส่งใบสมัคร โปรดลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ส่งใบสมัครสำเร็จ!
            </h2>
            <p className="text-gray-600 mb-8">
              ขอบคุณสำหรับการสมัครเข้าร่วม Next Gen Web Academy
              ทีมงานของเราจะติดต่อกลับไปหาคุณเร็วๆ นี้
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              กลับสู่หน้าแรก
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            สมัครเข้าร่วม{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Next Gen Web Academy
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            กรอกข้อมูลเพื่อสมัครเข้าร่วมค่ายการพัฒนาเว็บไซต์ (รับจำกัด 20
            คนเท่านั้น)
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Name */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ชื่อ*
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="กรอกชื่อของคุณ"
                />
              </motion.div>

              {/* Last Name */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  นามสกุล*
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="กรอกนามสกุลของคุณ"
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  อีเมล*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="example@email.com"
                />
              </motion.div>

              {/* Phone */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  เบอร์โทรศัพท์*
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0812345678"
                />
              </motion.div>

              {/* School */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="school"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  โรงเรียน/มหาวิทยาลัย*
                </label>
                <input
                  type="text"
                  id="school"
                  name="school"
                  required
                  value={formData.school}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ชื่อสถาบันการศึกษา"
                />
              </motion.div>

              {/* Grade/Year */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="grade"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ระดับชั้น/ชั้นปี*
                </label>
                <select
                  id="grade"
                  name="grade"
                  required
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="" disabled>
                    เลือกระดับชั้น
                  </option>
                  <option value="มัธยมศึกษาปีที่ 1">มัธยมศึกษาปีที่ 1</option>
                  <option value="มัธยมศึกษาปีที่ 2">มัธยมศึกษาปีที่ 2</option>
                  <option value="มัธยมศึกษาปีที่ 3">มัธยมศึกษาปีที่ 3</option>
                  <option value="มัธยมศึกษาปีที่ 4">มัธยมศึกษาปีที่ 4</option>
                  <option value="มัธยมศึกษาปีที่ 5">มัธยมศึกษาปีที่ 5</option>
                  <option value="มัธยมศึกษาปีที่ 6">มัธยมศึกษาปีที่ 6</option>
                </select>
              </motion.div>
            </div>

            {/* Motivation */}
            <motion.div variants={itemVariants} className="mt-6">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                เหตุผลที่อยากเข้าร่วมค่าย*
              </label>
              <textarea
                id="reason"
                name="reason"
                required
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="บอกเราเกี่ยวกับเหตุผลที่คุณอยากเข้าร่วมค่าย Next Gen Web Academy"
              ></textarea>
            </motion.div>

            {/* Expectations */}
            <motion.div variants={itemVariants} className="mt-6">
              <label
                htmlFor="expectations"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                สิ่งที่คาดหวังจากค่าย*
              </label>
              <textarea
                id="expectations"
                name="expectations"
                required
                value={formData.expectations}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="คุณคาดหวังอะไรจากการเข้าร่วมค่ายนี้บ้าง"
              ></textarea>
            </motion.div>

            {/* How did you hear about us */}
            <motion.div variants={itemVariants} className="mt-6">
              <label
                htmlFor="howDidYouHear"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                คุณรู้จักค่ายนี้ได้อย่างไร
              </label>
              <select
                id="howDidYouHear"
                name="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>
                  โปรดเลือก
                </option>
                <option value="เพื่อนแนะนำ">เพื่อนแนะนำ</option>
                <option value="โซเชียลมีเดีย">โซเชียลมีเดีย</option>
                <option value="เว็บไซต์">เว็บไซต์</option>
                <option value="อาจารย์แนะนำ">อาจารย์แนะนำ</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center justify-center"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-lg flex items-center justify-center ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังส่งข้อมูล...
                  </>
                ) : (
                  "ส่งใบสมัคร"
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            กลับสู่หน้าแรก
          </Link>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-50 rounded-full opacity-70 blur-3xl z-0" />
      <div className="fixed bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-50 rounded-full opacity-70 blur-3xl z-0" />
    </div>
  );
}
