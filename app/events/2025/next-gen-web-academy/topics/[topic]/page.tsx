import { notFound, redirect } from "next/navigation";

const VALID_TOPICS = [
  "html-css",
  "javascript",
  "figma",
  "design-thinking",
] as const;

type Topic = (typeof VALID_TOPICS)[number];

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;

  if (!VALID_TOPICS.includes(topic as Topic)) {
    notFound();
  }

  redirect(`/topics/${topic}`);
}

export function generateStaticParams() {
  return VALID_TOPICS.map((topic) => ({ topic }));
}
