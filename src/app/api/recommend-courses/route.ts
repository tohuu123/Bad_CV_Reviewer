import { NextResponse } from "next/server";
import { recommendCourses } from "@/lib/llm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const skills = body.skills;
    const numberOfCourses = body.numberOfCourses || 5;

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: "Missing or invalid skills" },
        { status: 400 }
      );
    }

    const result = await recommendCourses(skills, numberOfCourses);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Course Recommendation API Error:", err);
    return NextResponse.json(
      { error: "Course recommendation failed" },
      { status: 500 }
    );
  }
}
