import ApplicationForm from "@/app/components/ApplicationForm";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventRules } from "@/lib/eventRules";

const ALLOWED_GRADES = getEventRules(2026, "next-gen-ai-academy").allowedGrades;

export const metadata: Metadata = {
  title: "สมัครเข้าร่วม CD AI Innovation Bootcamp 2026 | CD Smart Campus",
};

export default async function ApplicationPage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, name, max_applicants")
    .eq("year", 2026)
    .eq("slug", "next-gen-ai-academy")
    .single();

  if (!event) notFound();

  return (
    <ApplicationForm
      campName={event.name}
      eventId={event.id}
      maxApplicants={event.max_applicants}
      allowedGrades={ALLOWED_GRADES}
    />
  );
}
