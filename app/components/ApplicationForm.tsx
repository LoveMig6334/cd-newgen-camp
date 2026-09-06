"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ALL_GRADES,
  MAX_CLASS_NUMBER,
  classroomOptions,
  gradeFromLabel,
  gradeLabel,
} from "@/lib/eventRules";

interface ApplicationFormProps {
  campName: string;
  eventId: string;
  apiEndpoint?: string;
  /** Capacity shown in the form header. */
  maxApplicants?: number;
  /** Grades (ม.1–ม.6) that may apply; defaults to all. */
  allowedGrades?: number[];
}

export default function ApplicationForm({
  campName,
  eventId,
  apiEndpoint = "/api/application",
  maxApplicants = 20,
  allowedGrades = [...ALL_GRADES],
}: ApplicationFormProps) {
  const gradeRange =
    allowedGrades.length > 1
      ? `ม.${Math.min(...allowedGrades)} – ม.${Math.max(...allowedGrades)}`
      : `ม.${allowedGrades[0]}`;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    grade: "",
    classroom: "",
    classNumber: "",
    reason: "",
    expectations: "",
    howDidYouHear: "",
  });

  const router = useRouter();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentIdError, setStudentIdError] = useState<string | null>(null);
  const STUDENT_ID_ERROR = "เลขประจำตัวนักเรียนต้องเป็นตัวเลข 4 หลัก";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "studentId") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setFormData((prev) => ({ ...prev, studentId: digits }));
      setStudentIdError(
        digits.length === 0 || digits.length === 4 ? null : STUDENT_ID_ERROR,
      );
      return;
    }
    if (name === "grade") {
      setFormData((prev) => ({ ...prev, grade: value, classroom: "" }));
      return;
    }
    if (name === "classNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 2);
      setFormData((prev) => ({ ...prev, classNumber: digits }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedGrade = gradeFromLabel(formData.grade);
  const rooms = selectedGrade ? classroomOptions(selectedGrade) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(formData.studentId)) {
      setStudentIdError(STUDENT_ID_ERROR);
      document.getElementById("studentId")?.focus();
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          student_id: formData.studentId,
          grade: formData.grade,
          classroom: formData.classroom,
          class_number: Number(formData.classNumber),
          reason: formData.reason || null,
          expectations: formData.expectations,
          how_did_you_hear: formData.howDidYouHear,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      // Hand off to the Discord invite page; keep the spinner until it loads.
      router.push(`${pathname.replace(/\/$/, "")}/success`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        error instanceof Error && error.message
          ? error.message
          : "เกิดข้อผิดพลาดในการส่งใบสมัคร โปรดลองอีกครั้ง",
      );
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            สมัครเข้าร่วม{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-800">
              {campName}
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            กรอกข้อมูลเพื่อสมัครเข้าร่วมค่าย {campName} (รับจำกัด{" "}
            {maxApplicants} คนเท่านั้น)
          </p>
          <p className="mt-2 text-base text-blue-700 font-medium">
            เฉพาะนักเรียนชั้น {gradeRange} เท่านั้น
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

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  เลขประจำตัวนักเรียน*
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={4}
                  pattern="[0-9]{4}"
                  title={STUDENT_ID_ERROR}
                  aria-invalid={studentIdError ? true : undefined}
                  aria-describedby="studentId-hint"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={() =>
                    setStudentIdError(
                      formData.studentId.length === 0 ||
                        /^\d{4}$/.test(formData.studentId)
                        ? null
                        : STUDENT_ID_ERROR,
                    )
                  }
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-colors tabular-nums ${
                    studentIdError
                      ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="เช่น 1234"
                />
                <p
                  id="studentId-hint"
                  aria-live="polite"
                  className={`mt-1 text-sm ${studentIdError ? "text-red-600" : "text-gray-500"}`}
                >
                  {studentIdError ?? "ตัวเลข 4 หลัก"}
                </p>
              </motion.div>

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
                  {allowedGrades.map((grade) => (
                    <option key={grade} value={gradeLabel(grade)}>
                      {gradeLabel(grade)}
                    </option>
                  ))}
                </select>
              </motion.div>

              <AnimatePresence initial={false}>
                {selectedGrade && (
                  <motion.div
                    key="classroom"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <label
                      htmlFor="classroom"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ห้อง*
                    </label>
                    <select
                      id="classroom"
                      name="classroom"
                      required
                      value={formData.classroom}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="" disabled>
                        เลือกห้อง
                      </option>
                      {rooms.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
                {selectedGrade && (
                  <motion.div
                    key="classNumber"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: 0.05 }}
                  >
                    <label
                      htmlFor="classNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      เลขที่*
                    </label>
                    <input
                      type="text"
                      id="classNumber"
                      name="classNumber"
                      required
                      inputMode="numeric"
                      autoComplete="off"
                      pattern="[1-9][0-9]?"
                      title={`เลขที่ต้องเป็นตัวเลข 1–${MAX_CLASS_NUMBER}`}
                      value={formData.classNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors tabular-nums"
                      placeholder="เช่น 12"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div variants={itemVariants} className="mt-6">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                เหตุผลที่อยากเข้าร่วมค่าย
                <span className="ml-1 text-gray-400 font-normal">
                  (ไม่บังคับ)
                </span>
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={`บอกเราเกี่ยวกับเหตุผลที่คุณอยากเข้าร่วมค่าย ${campName}`}
              ></textarea>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <label
                htmlFor="expectations"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                สิ่งที่คาดหวังจากค่าย*
              </label>
              <select
                id="expectations"
                name="expectations"
                required
                value={formData.expectations}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>
                  โปรดเลือก
                </option>
                <option value="เรียนรู้ทักษะใหม่ด้านเทคโนโลยี">
                  เรียนรู้ทักษะใหม่ด้านเทคโนโลยี
                </option>
                <option value="ได้ประสบการณ์การทำงานจริง">
                  ได้ประสบการณ์การทำงานจริง
                </option>
                <option value="สร้างเครือข่ายและเพื่อนใหม่">
                  สร้างเครือข่ายและเพื่อนใหม่
                </option>
                <option value="พัฒนาพอร์ตโฟลิโอและผลงาน">
                  พัฒนาพอร์ตโฟลิโอและผลงาน
                </option>
                <option value="ทดสอบความสนใจในสายงาน IT">
                  ทดสอบความสนใจในสายงาน IT
                </option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </motion.div>

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

            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center justify-center"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-4 bg-linear-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-lg flex items-center justify-center ${
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

      <div className="fixed top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-50 rounded-full opacity-70 blur-3xl z-0" />
      <div className="fixed bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-50 rounded-full opacity-70 blur-3xl z-0" />
    </div>
  );
}
