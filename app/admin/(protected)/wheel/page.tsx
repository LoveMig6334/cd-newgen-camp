import { PROMPT_BATTLE_EVENT } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";
import PickerWheel, { type WheelPerson } from "./PickerWheel";

type Participant = Pick<
  Application,
  "id" | "first_name" | "last_name" | "nickname" | "classroom"
>;

export default async function AdminWheelPage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("year", PROMPT_BATTLE_EVENT.year)
    .eq("slug", PROMPT_BATTLE_EVENT.slug)
    .single();

  if (!event) {
    return <p className="text-gray-600">ไม่พบกิจกรรม {PROMPT_BATTLE_EVENT.year}</p>;
  }

  const [{ data }, { data: finals }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, first_name, last_name, nickname, classroom")
      .eq("event_id", event.id)
      .order("classroom")
      .order("class_number"),
    supabase.from("final_project_submissions").select("application_id").eq("event_id", event.id),
  ]);
  const submittedIds = [
    ...new Set(((finals as { application_id: string }[]) ?? []).map((r) => r.application_id)),
  ];

  const people: WheelPerson[] = ((data as Participant[]) ?? []).map((p) => ({
    id: p.id,
    label: p.nickname?.trim() || p.first_name,
    fullName: `${p.first_name} ${p.last_name}`,
    classroom: p.classroom,
  }));

  return <PickerWheel eventId={event.id} people={people} submittedIds={submittedIds} />;
}
