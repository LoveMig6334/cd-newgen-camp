import NavBar from "@/app/components/NavBar";
import { Features } from "@/app/components/sections/features";
import { Hero } from "@/app/components/sections/hero";
import { Login } from "@/app/components/sections/login";
import Footer from "@/app/components/UI/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next Gen Web Academy 2025",
  description:
    "ค่ายพัฒนาเว็บไซต์สำหรับนักเรียนมัธยม — Next Gen Web Academy 2025",
};

export default function NextGenWebAcademyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        eventName="Next Gen Web Academy"
        eventYear={2025}
        eventSlug="next-gen-web-academy"
      />
      <Hero />
      <Features />
      <Login />
      <Footer />
    </div>
  );
}
