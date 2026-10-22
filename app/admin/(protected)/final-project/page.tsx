import { PROMPT_BATTLE_EVENT, formatBangkokTime } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { Application, FinalProjectSubmission } from "@/lib/types";
import FinalProjectGallery, { type FinalProjectEntry } from "./FinalProjectGallery";

type Participant = Pick<
  Application,
  "id" | "first_name" | "last_name" | "nickname" | "classroom"
>;
type Row = Pick<FinalProjectSubmission, "application_id" | "deploy_url" | "deck_size" | "submitted_at">;

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export default async function AdminFinalProjectPage() {
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
      .select("id, first_name, last_name, nickname, classroom")
      .eq("event_id", event.id)
      .order("classroom")
      .order("class_number"),
    supabase
      .from("final_project_submissions")
      .select("application_id, deploy_url, deck_size, submitted_at")
      .eq("event_id", event.id)
      .order("submitted_at", { ascending: false }),
  ]);

  if (error) console.error("Final project submissions error:", error);

  const latest = new Map<string, { row: Row; count: number }>();
  for (const row of (submissions as Row[]) ?? []) {
    const seen = latest.get(row.application_id);
    if (seen) seen.count++;
    else latest.set(row.application_id, { row, count: 1 });
  }

  const entries: FinalProjectEntry[] = ((participants as Participant[]) ?? []).map((p) => {
    const sub = latest.get(p.id);
    return {
      applicationId: p.id,
      student: {
        name: `${p.first_name} ${p.last_name}`,
        nickname: p.nickname,
        classroom: p.classroom,
      },
      submission: sub
        ? {
            deployHost: hostOf(sub.row.deploy_url),
            deckMb: sub.row.deck_size ? (sub.row.deck_size / 1024 / 1024).toFixed(1) : null,
            submittedAt: formatBangkokTime(sub.row.submitted_at),
            count: sub.count,
          }
        : null,
    };
  });

  return (
    <FinalProjectGallery
      eventName={event.name}
      entries={entries}
      loadError={
        error ? "โหลดผลงานไม่สำเร็จ (ตรวจสอบว่ารัน migration final_project แล้ว)" : null
      }
    />
  );
}
