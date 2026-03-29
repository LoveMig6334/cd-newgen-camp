import ApplicationForm from "@/app/components/ApplicationForm";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "สมัครเข้าร่วม Next Gen AI Academy | CD Smart Campus",
};

export default async function ApplicationPage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("year", 2026)
    .eq("slug", "next-gen-ai-academy")
    .single();

  if (!event) notFound();

  return <ApplicationForm campName={event.name} eventId={event.id} />;
}
