import Footer from "@/app/components/UI/Footer";
import { Features } from "@/app/components/sections/features";
import { Hero } from "@/app/components/sections/hero";
import { Login } from "@/app/components/sections/login";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next Gen Web Academy 2025 | CD Smart Campus",
  description: "ค่ายพัฒนาเว็บไซต์สำหรับนักเรียนมัธยม — Next Gen Web Academy 2025",
};

export default function NextGenWebAcademyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <Features />
      <Login />
      <Footer />
    </div>
  );
}
