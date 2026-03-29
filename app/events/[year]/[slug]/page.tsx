import { notFound } from "next/navigation";

// Temporary: event content mapping (will be replaced by Supabase lookup in Phase 2C)
const EVENT_REGISTRY: Record<string, { name: string; component: string }> = {
  "2025/next-gen-web-academy": {
    name: "Next Gen Web Academy",
    component: "next-gen-web-academy",
  },
  "2026/next-gen-ai-academy": {
    name: "Next Gen AI Academy",
    component: "next-gen-ai-academy",
  },
};

interface EventPageProps {
  params: Promise<{ year: string; slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { year, slug } = await params;
  const eventKey = `${year}/${slug}`;
  const event = EVENT_REGISTRY[eventKey];

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
        <p className="text-gray-600">
          Event page for {year} — Content will be migrated in Phase 2C
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: EventPageProps) {
  const { year, slug } = await params;
  const eventKey = `${year}/${slug}`;
  const event = EVENT_REGISTRY[eventKey];

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: `${event.name} | CD Smart Campus`,
    description: `สมัครเข้าร่วมกิจกรรม ${event.name} ปี ${year}`,
  };
}
