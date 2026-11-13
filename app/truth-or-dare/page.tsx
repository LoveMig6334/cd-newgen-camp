import type { Metadata, Viewport } from "next";
import TruthOrDareGame from "./TruthOrDareGame";

export const metadata: Metadata = {
  title: "Truth or Dare · ความจริงหรือคำท้า",
  description: "วางนิ้วบนจอพร้อมกัน สุ่มคนตอบความจริงหรือรับคำท้า",
};

// Phone-first: no pinch zoom (it fights multi-touch), draw under the notch.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0b0b12",
};

export default function TruthOrDarePage() {
  return <TruthOrDareGame />;
}
