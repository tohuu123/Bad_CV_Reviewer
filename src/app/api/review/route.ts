import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
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

    // Build full file path inside public/uploads
    const filePath = path.join(process.cwd(), "public", "uploads", originalFile);

    // Use 'review' mode for structured CV analysis
    const text = await analyzeCV(filePath, 'review');
    
    // Save review data to JSON file for later use in fix mode
    const reviewJsonPath = filePath + '.json';
    fs.writeFileSync(reviewJsonPath, text, 'utf-8');

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (err) {
    console.error("Review API Error:", err);
    return NextResponse.json(
      { error: "Review failed" },
      { status: 500 }
    );
  }
}
