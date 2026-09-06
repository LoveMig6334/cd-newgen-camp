import DiscordJoin from "@/app/components/DiscordJoin";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ year: string; slug: string }>;
}

async function getEvent(year: string, slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("name")
    .eq("year", Number(year))
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, slug } = await params;
  const event = await getEvent(year, slug);
  return {
    title: event
      ? `เข้าร่วม Discord ${event.name} | CD Smart Campus`
      : "เข้าร่วม Discord | CD Smart Campus",
    robots: { index: false },
  };
}

export default async function ApplicationSuccessPage({ params }: PageProps) {
  const { year, slug } = await params;
  const event = await getEvent(year, slug);
  if (!event) notFound();

  return (
    <DiscordJoin campName={event.name} eventHref={`/events/${year}/${slug}`} />
  );
}
