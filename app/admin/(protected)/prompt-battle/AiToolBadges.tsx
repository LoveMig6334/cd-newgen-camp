export default function AiToolBadges({
  tools,
  className = "",
}: {
  tools: string[];
  className?: string;
}) {
  if (tools.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {tools.map((tool) => (
        <li
          key={tool}
          className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-xs font-medium text-violet-800"
        >
          {tool}
        </li>
      ))}
    </ul>
  );
}
