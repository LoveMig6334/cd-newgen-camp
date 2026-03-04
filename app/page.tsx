import { redirect } from "next/navigation";

// Phase 1A: Server-side redirect to the active event
// Will be replaced with Supabase query in Phase 4A
const ACTIVE_EVENT = {
  year: 2025,
  slug: "next-gen-web-academy",
};

export default function Home() {
  redirect(`/events/${ACTIVE_EVENT.year}/${ACTIVE_EVENT.slug}`);
}
