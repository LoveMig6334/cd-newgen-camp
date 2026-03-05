import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface ApplicationBody {
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  reason: string;
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
      "email",
      "phone",
      "school",
      "grade",
      "reason",
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("applications").insert({
      event_id: data.event_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      school: data.school,
      grade: data.grade,
      reason: data.reason,
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
