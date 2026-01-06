import { NextResponse } from "next/server";
import { analyzeSkills } from "@/lib/llm";
import { findMissingSkills } from "@/lib/skillsDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentSkills = body.currentSkills;

    if (!currentSkills || !Array.isArray(currentSkills)) {
      return NextResponse.json(
        { error: "Missing or invalid currentSkills" },
        { status: 400 }
      );
    }

    // Get missing skills from Firebase database
    const missingSkills = await findMissingSkills(currentSkills);

    // Also get LLM-based skill recommendations for additional insights (optional)
    // const llmResult = await analyzeSkills(currentSkills);
    // const llmData = JSON.parse(llmResult);

    return NextResponse.json({
      success: true,
      data: {
        currentSkills,
        missingSkills: missingSkills.map(skill => ({
          name: skill.name,
          category: skill.category,
          skill_url: skill.skill_url,
          description: skill.description,
          priority: skill.priority
        })),
        totalMissing: missingSkills.length
      },
    });
  } catch (err) {
    console.error("Skill Analysis API Error:", err);
    return NextResponse.json(
      { error: "Skill analysis failed" },
      { status: 500 }
    );
  }
}
