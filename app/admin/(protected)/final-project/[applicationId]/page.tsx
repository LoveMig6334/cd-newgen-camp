import { DECK_BUCKET } from "@/lib/finalProject";
import { normalizeLink } from "@/lib/pitch";
import { PROMPT_BATTLE_EVENT, formatBangkokTime } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { Application, FinalProjectSubmission } from "@/lib/types";
import { headers } from "next/headers";
import Link from "next/link";
import FinalProjectPresenter from "./FinalProjectPresenter";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Long enough for a whole presentation slot. */
const DECK_URL_TTL_SECONDS = 2 * 60 * 60;

export default async function FinalProjectPresenterPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  const back = (
    <Link href="/admin/final-project" className="text-sm text-blue-600 hover:text-blue-800">
      ← กลับไปหน้ารวม Final Project
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
      .from("final_project_submissions")
      .select("deploy_url, deck_path, submitted_at")
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

  const sub = submission as Pick<FinalProjectSubmission, "deploy_url" | "deck_path" | "submitted_at"> | null;

  let deckUrl: string | null = null;
  if (sub) {
    const { data, error } = await supabase.storage
      .from(DECK_BUCKET)
      .createSignedUrl(sub.deck_path, DECK_URL_TTL_SECONDS);
    if (error) console.error("Final project deck URL error:", error);
    deckUrl = data?.signedUrl ?? null;
  }

  // Re-checked at render time too: only http(s) ever becomes an href / iframe src.
  const siteUrl = sub ? normalizeLink(sub.deploy_url) : null;
  // Never frame our own origin with allow-same-origin + allow-scripts.
  const ownHost = (await headers()).get("host");
  const siteEmbeddable = Boolean(siteUrl && new URL(siteUrl).host !== ownHost);

  return (
    <FinalProjectPresenter
      student={{
        label: s.nickname?.trim() || s.first_name,
        fullName: `${s.first_name} ${s.last_name}`,
        classroom: s.classroom,
      }}
      submission={
        sub
          ? {
              siteUrl,
              siteEmbeddable,
              deckUrl,
              submittedAt: formatBangkokTime(sub.submitted_at),
            }
          : null
      }
    />
  );
}
