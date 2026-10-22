import { FINAL_PROJECT_ERRORS, validateFinalProject } from "@/lib/finalProject";
import { ERRORS } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { PromptBattleParticipant } from "@/lib/types";
import { NextResponse } from "next/server";

// Public: submit (or resubmit) a Final Project entry.
// JSON: participant_id, deploy_url, deck_path (the PDF is already in Storage).
export async function POST(req: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: participants, error: participantsError } = await supabase.rpc(
      "prompt_battle_participants",
    );
    if (participantsError) {
      console.error("Final project participants error:", participantsError);
      return NextResponse.json(
        { error: "ไม่สามารถตรวจสอบรายชื่อได้ โปรดลองอีกครั้ง" },
        { status: 500 },
      );
    }

    const result = validateFinalProject(
      {
        participantId: body?.participant_id,
        deployUrl: body?.deploy_url,
        deckPath: body?.deck_path,
      },
      new Set((participants as PromptBattleParticipant[]).map((p) => p.id)),
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // The database function re-checks the participant and that the PDF was uploaded.
    const { data: submittedAt, error } = await supabase.rpc("submit_final_project", {
      p_application_id: result.participantId,
      p_deploy_url: result.deployUrl,
      p_deck_path: result.deckPath,
    });

    if (error) {
      console.error("Final project submit error:", error);
      if (error.code === "P0002") {
        return NextResponse.json({ error: ERRORS.participant }, { status: 400 });
      }
      if (error.code === "22023") {
        return NextResponse.json({ error: FINAL_PROJECT_ERRORS.deckUpload }, { status: 400 });
      }
      if (error.code === "23514") {
        return NextResponse.json({ error: FINAL_PROJECT_ERRORS.deployScheme }, { status: 400 });
      }
      return NextResponse.json(
        { error: "บันทึกผลงานไม่สำเร็จ โปรดลองอีกครั้ง" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, submitted_at: submittedAt });
  } catch (error) {
    console.error("Final project submission error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด โปรดลองอีกครั้ง" },
      { status: 500 },
    );
  }
}
