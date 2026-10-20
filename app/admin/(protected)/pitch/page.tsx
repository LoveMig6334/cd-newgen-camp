import { PROMPT_BATTLE_EVENT, formatBangkokTime } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { Application, PitchSubmission } from "@/lib/types";
import PitchGallery, { type PitchEntry } from "./PitchGallery";

type Participant = Pick<
  Application,
  "id" | "first_name" | "last_name" | "nickname" | "classroom"
>;
type Row = Pick<
  PitchSubmission,
  "id" | "application_id" | "hmw" | "idea" | "link_url" | "has_html" | "sketch_mime" | "submitted_at"
>;

export default async function AdminPitchPage() {
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
    // No HTML or image bytes here — the presenter view loads those.
    supabase
      .from("pitch_submissions")
      .select("id, application_id, hmw, idea, link_url, has_html, sketch_mime, submitted_at")
      .eq("event_id", event.id)
      .order("submitted_at", { ascending: false }),
  ]);

  if (error) console.error("Pitch submissions error:", error);

  const latest = new Map<string, { row: Row; count: number }>();
  for (const row of (submissions as Row[]) ?? []) {
    const seen = latest.get(row.application_id);
    if (seen) seen.count++;
    else latest.set(row.application_id, { row, count: 1 });
  }

  const entries: PitchEntry[] = ((participants as Participant[]) ?? []).map((p) => {
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
            hmw: sub.row.hmw,
            idea: sub.row.idea,
            hasHtml: sub.row.has_html,
            hasLink: Boolean(sub.row.link_url),
            hasSketch: Boolean(sub.row.sketch_mime),
            submittedAt: formatBangkokTime(sub.row.submitted_at),
            count: sub.count,
          }
        : null,
    };
  });

  return (
    <PitchGallery
      eventName={event.name}
      entries={entries}
      loadError={error ? "โหลดผลงานไม่สำเร็จ (ตรวจสอบว่ารัน migration pitch_submissions แล้ว)" : null}
    />
  );
}
