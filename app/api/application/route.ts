import {
  MAX_CLASS_NUMBER,
  getEventRules,
  gradeFromClassroom,
  gradeLabel,
} from "@/lib/eventRules";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface ApplicationBody {
  event_id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  student_id: string;
  /** Derived server-side from `classroom`; any client value is ignored. */
  grade?: string;
  classroom: string;
  class_number: number;
  reason?: string | null;
  expectations: string;
  how_did_you_hear?: string;
}

export async function POST(req: Request) {
  try {
    const data: ApplicationBody = await req.json();

    const requiredFields: (keyof ApplicationBody)[] = [
      "event_id",
      "first_name",
      "last_name",
      "nickname",
      "student_id",
      "classroom",
      "class_number",
      "expectations",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 },
        );
      }
    }

    if (!/^\d{4}$/.test(data.student_id)) {
      return NextResponse.json(
        { error: "เลขประจำตัวนักเรียนต้องเป็นตัวเลข 4 หลัก" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Event must exist and be open for applications
    const { data: event } = await supabase
      .from("events")
      .select("id, year, slug, is_active, max_applicants")
      .eq("id", data.event_id)
      .single();

    if (!event || !event.is_active) {
      return NextResponse.json(
        { error: "กิจกรรมนี้ยังไม่เปิดรับสมัคร" },
        { status: 400 },
      );
    }

    // Classroom must be valid and its grade within the event's allowed range
    const rules = getEventRules(event.year, event.slug);
    const gradeNumber = gradeFromClassroom(data.classroom);
    if (gradeNumber === null) {
      return NextResponse.json(
        { error: "รูปแบบระดับชั้น/ห้องไม่ถูกต้อง" },
        { status: 400 },
      );
    }
    if (!rules.allowedGrades.includes(gradeNumber)) {
      const min = Math.min(...rules.allowedGrades);
      const max = Math.max(...rules.allowedGrades);
      return NextResponse.json(
        {
          error: `กิจกรรมนี้รับเฉพาะนักเรียนชั้น ม.${min} – ม.${max} เท่านั้น`,
        },
        { status: 400 },
      );
    }
    if (
      !Number.isInteger(data.class_number) ||
      data.class_number < 1 ||
      data.class_number > MAX_CLASS_NUMBER
    ) {
      return NextResponse.json(
        { error: `เลขที่ต้องเป็นตัวเลข 1–${MAX_CLASS_NUMBER}` },
        { status: 400 },
      );
    }

    // Capacity check — applications are not readable by anon (RLS), so the
    // count comes from the SECURITY DEFINER function `count_applications`
    // (see README → Admin Setup).
    const { data: count, error: countError } = await supabase.rpc(
      "count_applications",
      { p_event_id: event.id },
    );

    if (countError) {
      console.error("count_applications error:", countError);
      return NextResponse.json(
        { error: "ไม่สามารถตรวจสอบจำนวนผู้สมัครได้ โปรดลองอีกครั้ง" },
        { status: 500 },
      );
    }

    if ((count ?? 0) >= event.max_applicants) {
      return NextResponse.json(
        { error: `กิจกรรมนี้รับสมัครครบ ${event.max_applicants} คนแล้ว` },
        { status: 409 },
      );
    }

    const { error } = await supabase.from("applications").insert({
      event_id: data.event_id,
      first_name: data.first_name,
      last_name: data.last_name,
      nickname: data.nickname,
      student_id: data.student_id,
      grade: gradeLabel(gradeNumber),
      classroom: data.classroom,
      class_number: data.class_number,
      reason: data.reason ?? null,
      expectations: data.expectations,
      how_did_you_hear: data.how_did_you_hear ?? null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save application" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to process application" },
      { status: 500 },
    );
  }
}
