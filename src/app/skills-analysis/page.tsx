"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ParticlesBackground from "@/components/ParticlesBackground";

interface Course {
  skill: string;
  courseName: string;
  provider: string;
  url?: string;
  isFree?: boolean;
  description?: string;
  reasonForRecommendation?: string;
}

interface MissingSkill {
  name: string;
  category: string;
  skill_url: string;
  description?: string;
  priority?: number;
}

export default function SkillsAnalysisPage() {
  const params = useSearchParams();
  const router = useRouter();
  const skillsParam = params.get("skills");
  
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<MissingSkill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSkillsForCourses, setSelectedSkillsForCourses] = useState<MissingSkill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"skills" | "view-courses">("skills");
  const [maxSkillsToLearn, setMaxSkillsToLearn] = useState<number>(0);

  useEffect(() => {
    if (skillsParam) {
      try {
        const skills = JSON.parse(decodeURIComponent(skillsParam));
        setCurrentSkills(skills);
        analyzeSkills(skills);
      } catch (e) {
        console.error("Error parsing skills:", e);
      }
    }
  }, [skillsParam]);

  async function analyzeSkills(skills: string[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSkills: skills }),
      });

      const data = await res.json();
      
      if (data.success && data.data) {
        const missing = data.data.missingSkills || [];
        setMissingSkills(missing);
        // Set default to all missing skills
        setMaxSkillsToLearn(missing.length);
        // Pre-select all missing skills
        setSelectedSkills(missing.map((s: MissingSkill) => s.name));
      }
    } catch (error) {
      console.error("Error analyzing skills:", error);
      alert("Có lỗi xảy ra khi phân tích kỹ năng");
    } finally {
      setLoading(false);
    }
  }

  function toggleSkill(skillName: string) {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  }

  function handleSliderChange(value: number) {
    setMaxSkillsToLearn(value);
    
    // Auto-select top priority skills based on slider value
    const sortedSkills = [...missingSkills].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const topSkills = sortedSkills.slice(0, value);
    setSelectedSkills(topSkills.map(s => s.name));
  }

  function viewCoursesForSkill(skill: MissingSkill) {
    setSelectedSkillsForCourses([skill]);
    setStep("view-courses");
  }

  function viewAllCourses() {
    const selected = missingSkills.filter(skill => selectedSkills.includes(skill.name));
    if (selected.length === 0) {
      alert("Vui lòng chọn ít nhất một kỹ năng");
      return;
    }
    setSelectedSkillsForCourses(selected);
    setStep("view-courses");
  }

  return (
    <div>
      <ParticlesBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
              Phân Tích Kỹ Năng
            </h1>
            <p className="text-gray-300 text-lg">Khám phá những kỹ năng có thể làm nổi bật CV của bạn !</p>
          </div>

          {/* Current Skills Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span></span> Kỹ Năng Hiện Tại
            </h2>
            <div className="flex flex-wrap gap-2">
              {currentSkills.length > 0 ? (
                currentSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-green-500/30 border border-green-500 rounded-full text-white font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-300">Không có kỹ năng nào được tìm thấy</p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Đang phân tích kỹ năng...</p>
              </div>
            </div>
          )}

          {/* Skills Analysis Section */}
          {!loading && step === "skills" && missingSkills.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span></span> Kỹ năng có thể bổ sung ({missingSkills.length})
                </h2>
                
                {/* Slider to select number of skills */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-white font-semibold text-lg flex items-center gap-2">
                      <span>📊</span> Chọn số kỹ năng muốn bổ sung:
                    </label>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-blue-400">{maxSkillsToLearn}</span>
                      <span className="text-gray-400 text-sm ml-1">/ {missingSkills.length}</span>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="1"
                    max={missingSkills.length}
                    value={maxSkillsToLearn}
                    onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(maxSkillsToLearn / missingSkills.length) * 100}%, #374151 ${(maxSkillsToLearn / missingSkills.length) * 100}%, #374151 100%)`
                    }}
                  />
                  
                  <div className="flex justify-between mt-2 text-sm text-gray-400">
                    <span>1 kỹ năng</span>
                    <span>Tất cả ({missingSkills.length})</span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mt-4 italic">
                    Hệ thống sẽ chọn {maxSkillsToLearn} kỹ năng quan trọng nhất bạn có thể học
                  </p>
                </div>

                <p className="text-gray-300 mb-6">
                  <strong> Chọn các kỹ năng mà bạn muốn học! </strong>
                </p>
                
                {/* Group skills by category */}
                {Object.entries(
                  // Filter to show only top priority skills based on slider value
                  [...missingSkills]
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                    .slice(0, maxSkillsToLearn)
                    .reduce((acc, skill) => {
                      if (!acc[skill.category]) acc[skill.category] = [];
                      acc[skill.category].push(skill);
                      return acc;
                    }, {} as Record<string, MissingSkill[]>)
                ).map(([category, skills]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill) => (
                        <div
                          key={skill.name}
                          className={`bg-black/30 rounded-lg p-4 border-2 transition-all hover:scale-[1.02] ${
                            selectedSkills.includes(skill.name)
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <button
                                  onClick={() => toggleSkill(skill.name)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    selectedSkills.includes(skill.name)
                                      ? "bg-blue-500 border-blue-400"
                                      : "border-gray-500 hover:border-blue-400"
                                  }`}
                                >
                                  {selectedSkills.includes(skill.name) && (
                                    <span className="text-white text-xs">✓</span>
                                  )}
                                </button>
                                <h4 className="text-white font-semibold text-lg">
                                  {skill.name}
                                </h4>
                              </div>
                              {skill.description && (
                                <p className="text-gray-400 text-sm ml-7">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            {skill.priority && skill.priority >= 8 && (
                              <span className="px-2 py-1 bg-yellow-500/30 border border-yellow-500 rounded text-xs text-yellow-100 font-bold ml-2">
                                Quan trọng
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={viewAllCourses}
                  disabled={selectedSkills.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                 Học Thôi !
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                >
                  Quay Lại
                </button>
              </div>
            </div>
          )}

          {/* No Missing Skills */}
          {!loading && step === "skills" && missingSkills.length === 0 && currentSkills.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Xuất sắc!</h2>
              <p className="text-gray-300 text-lg">
                Bạn đã có đầy đủ các kỹ năng cần thiết cho vị trí Fresher Software Engineer.
              </p>
              <button
                onClick={() => router.back()}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Quay Lại
              </button>
            </div>
          )}

          {/* Courses Section */}
          {step === "view-courses" && selectedSkillsForCourses.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Danh sách các khoá học
                  </h2>
                </div>

                <div className="space-y-4">
                  {selectedSkillsForCourses.map((skill, index) => (
                    <div
                      key={skill.name}
                      className="group bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 rounded-xl p-6 border-2 border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-6">
                        {/* Number badge */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {index + 1}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="inline-block px-3 py-1 bg-blue-500/30 border border-blue-400 rounded-full text-xs text-blue-200 font-medium mb-2">
                                {skill.category}
                              </span>
                              <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                {skill.name}
                              </h3>
                            </div>
                          </div>
                          
                          {skill.description && (
                            <p className="text-gray-300 mb-4 leading-relaxed text-base">
                              {skill.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3">
                            <a
                              href={skill.skill_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                            >
                              <span>Học Ngay</span>
                              <span className="text-lg">→</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                    onClick={() => setStep("skills")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                  >
                    ← Quay lại 
                  </button>
                <button
                  onClick={() => router.push("/review?img=" + params.get("img") + "&file=" + params.get("file"))}
                  className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
                >
                  Quay lại trang Đánh Giá
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                >
                  Về Trang Chủ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        input[type="range"].slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 47px;
          height: 47px;
          border-radius: 70%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: all 0.2s;
        }
        
        input[type="range"].slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
        }
        
        input[type="range"].slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: all 0.2s;
        }
        
        input[type="range"].slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
}
