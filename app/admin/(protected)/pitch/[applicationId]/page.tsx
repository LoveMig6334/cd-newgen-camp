import { normalizeLink } from "@/lib/pitch";
import { PROMPT_BATTLE_EVENT, formatBangkokTime } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { Application, PitchSubmission } from "@/lib/types";
import Link from "next/link";
import PitchPresenter from "./PitchPresenter";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PitchPresenterPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const back = (
    <Link href="/admin/pitch" className="text-sm text-blue-600 hover:text-blue-800">
      ← กลับไปหน้ารวม Pitch
    </Link>
  );
  if (!UUID_RE.test(applicationId)) {
    return <div>{back}<p className="mt-6 text-gray-600">ไม่พบนักเรียน</p></div>;
  }

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("year", PROMPT_BATTLE_EVENT.year)
    .eq("slug", PROMPT_BATTLE_EVENT.slug)
    .single();

  const [{ data: student }, { data: submission }] = await Promise.all([
    supabase
      .from("applications")
      .select("first_name, last_name, nickname, classroom")
      .eq("id", applicationId)
      .eq("event_id", event?.id ?? "")
      .maybeSingle(),
    supabase
      .from("pitch_submissions")
      .select("id, problem, hmw, idea, html, link_url, sketch_mime, submitted_at")
      .eq("application_id", applicationId)
      .eq("event_id", event?.id ?? "")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const s = student as Pick<Application, "first_name" | "last_name" | "nickname" | "classroom"> | null;
  if (!s) {
    return <div>{back}<p className="mt-6 text-gray-600">ไม่พบนักเรียน</p></div>;
  }

  const sub = submission as Pick<
    PitchSubmission,
    "id" | "problem" | "hmw" | "idea" | "html" | "link_url" | "sketch_mime" | "submitted_at"
  > | null;

  return (
    <PitchPresenter
      student={{
        label: s.nickname?.trim() || s.first_name,
        fullName: `${s.first_name} ${s.last_name}`,
        classroom: s.classroom,
      }}
      submission={
        sub
          ? {
              problem: sub.problem,
              hmw: sub.hmw,
              idea: sub.idea,
              html: sub.html,
              // Re-checked at render time too: only http(s) ever becomes an href.
              linkUrl: sub.link_url ? normalizeLink(sub.link_url) : null,
              sketchUrl: sub.sketch_mime ? `/api/admin/pitch/sketch/${sub.id}` : null,
              submittedAt: formatBangkokTime(sub.submitted_at),
            }
          : null
      }
    />
  );
}
