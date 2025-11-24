import { NextResponse } from "next/server";

// Define the application data structure
interface ApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  reason: string;
  expectations: string;
  howDidYouHear: string;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const data: ApplicationData = await req.json();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "school",
      "grade",
      "reason",
      "expectations",
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof ApplicationData]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save the application to your database
    // 2. Send notification emails
    // 3. Handle any other business logic

    // For now, we'll just simulate success

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to process application" },
      { status: 500 }
    );
  }
}
