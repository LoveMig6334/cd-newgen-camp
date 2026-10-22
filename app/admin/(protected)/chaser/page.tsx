import type { Metadata } from "next";
import ChaserGame from "./ChaserGame";

export const metadata: Metadata = { title: "Chaser" };

export default function AdminChaserPage() {
  return <ChaserGame />;
}
