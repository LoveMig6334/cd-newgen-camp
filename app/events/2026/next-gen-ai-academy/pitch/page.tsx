import { createClient } from "@/lib/supabase/server";
import type { PromptBattleParticipant } from "@/lib/types";
import type { Metadata } from "next";
import PitchForm from "./PitchForm";

export const metadata: Metadata = {
  title: "ส่งต้นแบบ Prototype PITCH | CD AI Innovation Bootcamp 2026",
};

export default async function PitchPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("prompt_battle_participants");
  if (error) console.error("Pitch participants error:", error);

  return <PitchForm participants={(data as PromptBattleParticipant[]) ?? []} />;
}
