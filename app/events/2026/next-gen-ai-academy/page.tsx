import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/UI/Footer";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const Hero = dynamic(
  () => import("./sections/hero").then((m) => m.AIHero),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    ),
  },
);

const Features = dynamic(
  () =>
    import("./sections/features").then(
      (m) => m.AIFeatures,
    ),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    ),
  },
);

const Login = dynamic(
  () =>
    import("./sections/login").then((m) => m.AILogin),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-blue-500 to-blue-700">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Next Gen AI Academy 2026",
  description:
    "ค่ายปัญญาประดิษฐ์สำหรับนักเรียนมัธยม — Next Gen AI Academy 2026",
};

export default function NextGenAIAcademyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar
        eventName="Next Gen AI Academy"
        eventYear={2026}
        eventSlug="next-gen-ai-academy"
      />
      <Hero />
      <Features />
      <Login />
      <Footer />
    </div>
  );
}
