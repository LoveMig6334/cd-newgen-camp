import {
  ERRORS,
  MAX_REQUEST_BYTES,
  validateSubmission,
  type UploadedHtmlFile,
} from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { PromptBattleParticipant } from "@/lib/types";
import { NextResponse } from "next/server";

// Public: submit (or resubmit) a Prompt Battle entry.
// multipart/form-data: participant_id, prompt, and either file or html.
export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: ERRORS.tooLarge }, { status: 413 });
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    const rawFile = form.get("file");
    let file: UploadedHtmlFile | null = null;
    if (rawFile instanceof File && rawFile.size > 0) {
      if (rawFile.size > MAX_REQUEST_BYTES) {
        return NextResponse.json({ error: ERRORS.tooLarge }, { status: 413 });
      }
      file = {
        name: rawFile.name,
        type: rawFile.type,
        bytes: new Uint8Array(await rawFile.arrayBuffer()),
      };
    }

    const supabase = await createClient();
    const { data: participants, error: participantsError } = await supabase.rpc(
      "prompt_battle_participants",
    );
    if (participantsError) {
      console.error("Prompt battle participants error:", participantsError);
      return NextResponse.json(
        { error: "ไม่สามารถตรวจสอบรายชื่อได้ โปรดลองอีกครั้ง" },
        { status: 500 },
      );
    }

    const result = validateSubmission(
      {
        participantId: form.get("participant_id"),
        prompt: form.get("prompt"),
        pastedHtml: form.get("html"),
        file,
      },
      new Set((participants as PromptBattleParticipant[]).map((p) => p.id)),
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // The database function re-checks the participant and the size limits.
    const { data: submittedAt, error } = await supabase.rpc("submit_prompt_battle", {
      p_application_id: result.participantId,
      p_prompt: result.prompt,
      p_html: result.html,
    });

    if (error) {
      console.error("Prompt battle submit error:", error);
      if (error.code === "P0002") {
        return NextResponse.json({ error: ERRORS.participant }, { status: 400 });
      }
      if (error.code === "23514") {
        return NextResponse.json({ error: ERRORS.tooLarge }, { status: 400 });
      }
      return NextResponse.json(
        { error: "บันทึกผลงานไม่สำเร็จ โปรดลองอีกครั้ง" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, submitted_at: submittedAt });
  } catch (error) {
    console.error("Prompt battle submission error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด โปรดลองอีกครั้ง" },
      { status: 500 },
    );
  }
}
