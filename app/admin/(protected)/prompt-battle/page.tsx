import { PROMPT_BATTLE_EVENT, formatBangkokTime } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { Application, PromptBattleSubmission } from "@/lib/types";
import PromptBattleGallery, { type GalleryEntry } from "./PromptBattleGallery";

type Participant = Pick<
  Application,
  "id" | "first_name" | "last_name" | "nickname" | "classroom" | "class_number"
>;

export default async function AdminPromptBattlePage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("year", PROMPT_BATTLE_EVENT.year)
    .eq("slug", PROMPT_BATTLE_EVENT.slug)
    .single();

  if (!event) {
    return <p className="text-gray-600">ไม่พบกิจกรรม {PROMPT_BATTLE_EVENT.year}</p>;
  }

  const [{ data: participants }, { data: submissions, error }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, first_name, last_name, nickname, classroom, class_number")
      .eq("event_id", event.id)
      .order("classroom")
      .order("class_number"),
    // Prompts only — the HTML is loaded on the view page.
    supabase
      .from("prompt_battle_submissions")
      .select("id, application_id, prompt, submitted_at")
      .eq("event_id", event.id)
      .order("submitted_at", { ascending: false }),
  ]);

  if (error) console.error("Prompt battle submissions error:", error);

  // Latest submission per student (rows arrive newest first).
  const latest = new Map<
    string,
    { row: Omit<PromptBattleSubmission, "html" | "event_id">; count: number }
  >();
  for (const row of (submissions as Omit<PromptBattleSubmission, "html" | "event_id">[]) ?? []) {
    const seen = latest.get(row.application_id);
    if (seen) seen.count++;
    else latest.set(row.application_id, { row, count: 1 });
  }

  const roster = (participants as Participant[]) ?? [];
  const entries: GalleryEntry[] = [];
  const missing: GalleryEntry["student"][] = [];
  for (const p of roster) {
    const student = {
      name: `${p.first_name} ${p.last_name}`,
      nickname: p.nickname,
      classroom: p.classroom,
    };
    const sub = latest.get(p.id);
    if (!sub) {
      missing.push(student);
      continue;
    }
    entries.push({
      submissionId: sub.row.id,
      student,
      prompt: sub.row.prompt,
      submittedAt: formatBangkokTime(sub.row.submitted_at),
      count: sub.count,
    });
  }

  return (
    <PromptBattleGallery
      eventName={event.name}
      entries={entries}
      missing={missing}
      loadError={error ? "โหลดผลงานไม่สำเร็จ (ตรวจสอบว่ารัน migration prompt_battle แล้ว)" : null}
    />
  );
}
