import { NextResponse } from "next/server";
import path from "path";
import { analyzeCV } from "@/lib/llm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const originalFile = body.originalFile;

    if (!originalFile) {
      return NextResponse.json(
        { error: "Missing originalFile" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "public", "uploads", originalFile);

    // Use 'fix' mode for improvement suggestions
    const text = await analyzeCV(filePath, 'fix');

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (err) {
    console.error("Fix API Error:", err);
    return NextResponse.json(
      { error: "Fix failed" },
      { status: 500 }
    );
  }
}
