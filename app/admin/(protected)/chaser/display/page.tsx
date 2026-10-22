import type { Metadata } from "next";
import ChaserDisplay from "./ChaserDisplay";

export const metadata: Metadata = { title: "Chaser · จอผู้ชม" };

export default function ChaserDisplayPage() {
  return <ChaserDisplay />;
}
