import { formatBangkokTime } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { Application, PromptBattleSubmission } from "@/lib/types";
import Link from "next/link";
import AiToolBadges from "../AiToolBadges";
import SandboxedHtml from "../SandboxedHtml";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = Pick<PromptBattleSubmission, "id" | "prompt" | "html" | "ai_tools" | "submitted_at"> & {
  applications: Pick<Application, "first_name" | "last_name" | "nickname" | "classroom"> | null;
};

export default async function PromptBattleViewPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids = "" } = await searchParams;
  const wanted = [...new Set(ids.split(","))].filter((id) => UUID_RE.test(id)).slice(0, 4);

  const supabase = await createClient();
  const { data } = wanted.length
    ? await supabase
        .from("prompt_battle_submissions")
        .select("id, prompt, html, ai_tools, submitted_at, applications(first_name, last_name, nickname, classroom)")
        .in("id", wanted)
    : { data: [] };

  const rows = wanted
    .map((id) => ((data as unknown as Row[]) ?? []).find((r) => r.id === id))
    .filter((r): r is Row => Boolean(r));

  const back = (
    <Link href="/admin/prompt-battle" className="text-sm text-blue-600 hover:text-blue-800">
      ← กลับไปหน้ารวมผลงาน
    </Link>
  );

  if (rows.length === 0) {
    return (
      <div>
        {back}
        <p className="mt-6 text-gray-600">ไม่พบผลงาน</p>
      </div>
    );
  }

  const single = rows.length === 1;

  return (
    <div>
      {back}
      <div
        className={`mt-4 grid gap-6 ${
          single
            ? "lg:grid-cols-[minmax(260px,1fr)_2fr]"
            : rows.length === 2
              ? "lg:grid-cols-2"
              : "lg:grid-cols-2 2xl:grid-cols-4"
        }`}
      >
        {rows.map((row) => {
          const s = row.applications;
          const title = s
            ? `${s.nickname ?? s.first_name} — ${s.first_name} ${s.last_name}${s.classroom ? ` (ม.${s.classroom})` : ""}`
            : "ไม่ทราบชื่อ";
          const prompt = (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Prompt · ส่งเมื่อ {formatBangkokTime(row.submitted_at)} น.
              </p>
              <AiToolBadges tools={row.ai_tools ?? []} className="mb-2" />
              <p
                className={`text-sm text-gray-800 whitespace-pre-wrap wrap-break-word overflow-auto ${
                  single ? "lg:max-h-[75vh]" : "max-h-48"
                }`}
              >
                {row.prompt}
              </p>
            </div>
          );
          return single ? (
            <div key={row.id} className="contents">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-3">{title}</h1>
                {prompt}
              </div>
              <SandboxedHtml html={row.html} title={title} className="h-[80vh]" />
            </div>
          ) : (
            <div key={row.id} className="flex flex-col gap-3 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{title}</h2>
              {prompt}
              <SandboxedHtml html={row.html} title={title} className="h-[70vh]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
