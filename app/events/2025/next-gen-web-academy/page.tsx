import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/UI/Footer";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const Hero = dynamic(
  () => import("@/app/components/sections/hero").then((m) => m.Hero),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    ),
  },
);

const Features = dynamic(
  () => import("@/app/components/sections/features").then((m) => m.Features),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    ),
  },
);

const Login = dynamic(
  () => import("@/app/components/sections/login").then((m) => m.Login),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-blue-500 to-blue-700">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    ),
  },
);

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
