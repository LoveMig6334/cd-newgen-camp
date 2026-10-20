import { createClient } from "@/lib/supabase/server";
import type { PromptBattleParticipant } from "@/lib/types";
import type { Metadata } from "next";
import PromptBattleForm from "./PromptBattleForm";

export const metadata: Metadata = {
  title: "ส่งผลงาน Prompt Battle | CD AI Innovation Bootcamp 2026",
};

export default async function PromptBattlePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("prompt_battle_participants");
  if (error) console.error("Prompt battle participants error:", error);

  return (
    <PromptBattleForm participants={(data as PromptBattleParticipant[]) ?? []} />
  );
}
