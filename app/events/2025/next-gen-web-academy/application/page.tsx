import ApplicationForm from "@/app/components/ApplicationForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const metadata = {
  title: "สมัครเข้าร่วม Next Gen Web Academy | CD Smart Campus",
};

export default async function ApplicationPage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("year", 2025)
    .eq("slug", "next-gen-web-academy")
    .single();

  if (!event) notFound();

  return <ApplicationForm campName={event.name} eventId={event.id} />;
}
