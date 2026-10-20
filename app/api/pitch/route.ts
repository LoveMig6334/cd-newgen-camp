import { MAX_PITCH_REQUEST_BYTES, PITCH_ERRORS, validatePitch } from "@/lib/pitch";
import { ERRORS, type UploadedHtmlFile } from "@/lib/promptBattle";
import { createClient } from "@/lib/supabase/server";
import type { PromptBattleParticipant } from "@/lib/types";
import { NextResponse } from "next/server";

// Public: submit (or resubmit) a Prototype PITCH entry.
// multipart/form-data: participant_id, problem, hmw, idea, file or html,
// link, sketch (image).
export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_PITCH_REQUEST_BYTES) {
      return NextResponse.json({ error: PITCH_ERRORS.uploadTooLarge }, { status: 413 });
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
      file = {
        name: rawFile.name,
        type: rawFile.type,
        bytes: new Uint8Array(await rawFile.arrayBuffer()),
      };
    }
    const rawSketch = form.get("sketch");
    const sketch =
      rawSketch instanceof File && rawSketch.size > 0
        ? new Uint8Array(await rawSketch.arrayBuffer())
        : null;

    const supabase = await createClient();
    const { data: participants, error: participantsError } = await supabase.rpc(
      "prompt_battle_participants",
    );
    if (participantsError) {
      console.error("Pitch participants error:", participantsError);
      return NextResponse.json(
        { error: "ไม่สามารถตรวจสอบรายชื่อได้ โปรดลองอีกครั้ง" },
        { status: 500 },
      );
    }

    const result = validatePitch(
      {
        participantId: form.get("participant_id"),
        problem: form.get("problem"),
        hmw: form.get("hmw"),
        idea: form.get("idea"),
        pastedHtml: form.get("html"),
        file,
        link: form.get("link"),
        sketch,
      },
      new Set((participants as PromptBattleParticipant[]).map((p) => p.id)),
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // The database function re-checks the participant, limits and sketch bytes.
    const { data: submittedAt, error } = await supabase.rpc("submit_pitch", {
      p_application_id: result.participantId,
      p_problem: result.problem,
      p_hmw: result.hmw,
      p_idea: result.idea,
      p_html: result.html,
      p_link_url: result.linkUrl,
      p_sketch_base64: result.sketch ? Buffer.from(result.sketch.bytes).toString("base64") : null,
      p_sketch_mime: result.sketch?.mime ?? null,
    });

    if (error) {
      console.error("Pitch submit error:", error);
      if (error.code === "P0002") {
        return NextResponse.json({ error: ERRORS.participant }, { status: 400 });
      }
      if (error.code === "23514") {
        return NextResponse.json({ error: "ข้อมูลไม่ผ่านการตรวจสอบ กรุณาตรวจสอบไฟล์และลิงก์" }, { status: 400 });
      }
      return NextResponse.json(
        { error: "บันทึกผลงานไม่สำเร็จ โปรดลองอีกครั้ง" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, submitted_at: submittedAt });
  } catch (error) {
    console.error("Pitch submission error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด โปรดลองอีกครั้ง" },
      { status: 500 },
    );
  }
}
