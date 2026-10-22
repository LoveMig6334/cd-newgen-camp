import { createClient } from "@/lib/supabase/server";
import type { PromptBattleParticipant } from "@/lib/types";
import type { Metadata } from "next";
import FinalProjectForm from "./FinalProjectForm";

export const metadata: Metadata = {
  title: "ส่ง Final Project | CD AI Innovation Bootcamp 2026",
};

export default async function FinalProjectPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("prompt_battle_participants");
  if (error) console.error("Final project participants error:", error);

  return <FinalProjectForm participants={(data as PromptBattleParticipant[]) ?? []} />;
}
