import type { Metadata, Viewport } from "next";
import SecretSantaDraw from "./SecretSantaDraw";

export const metadata: Metadata = {
  title: "Secret Santa · จับฉลากของขวัญ",
  description: "เลือกชื่อตัวเอง แล้วเปิดกล่องสุ่มว่าจะได้ซื้อของขวัญให้ใคร",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d2219",
};

export default function SecretSantaPage() {
  return <SecretSantaDraw />;
}
