import { NextResponse } from "next/server";
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
    const missingSkills = await findMissingSkills(currentSkills);

    // Filling detailed fields in collection of the skills in here
    return NextResponse.json({
      success: true,
      data: {
        currentSkills,
        missingSkills: missingSkills.map(skill => ({
          name: skill.name,
          category: skill.category,
          skill_url: skill.skill_url,
          description: skill.description,
          priority: skill.priority,
          job_tags: skill.job_tags,
          difficulty_level: skill.difficulty_level,
          related_tools: skill.related_tools,
          "time-learning": skill["time-learning"]
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

/*
API này nhận danh sách kỹ năng hiện có từ CV, kiểm tra tính hợp lệ, so sánh với cơ sở dữ liệu kỹ năng chuẩn và trả về các kỹ năng còn thiếu để người dùng ưu tiên học thêm.
*/