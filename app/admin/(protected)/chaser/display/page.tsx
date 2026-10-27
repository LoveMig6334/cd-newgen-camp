import type { Metadata } from "next";
import { cleanRoomCode } from "../sync";
import ChaserDisplay from "./ChaserDisplay";

export const metadata: Metadata = { title: "Chaser · จอผู้ชม" };

export default async function ChaserDisplayPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const { room } = await searchParams;
  return <ChaserDisplay initialRoom={cleanRoomCode(Array.isArray(room) ? room[0] : room)} />;
}
