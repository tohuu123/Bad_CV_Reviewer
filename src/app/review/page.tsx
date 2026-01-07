"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Helper component to format text content
function FormattedText({ text }: { text: string }) {
  // Split by double newlines to get paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return (
    <div className="space-y-4">
      {paragraphs.map((para, idx) => {
        const trimmedPara = para.trim();
        
        // Check for headers (### Header, ## Header, # Header)
        if (/^#{1,3}\s/.test(trimmedPara)) {
          const level = trimmedPara.match(/^(#{1,3})/)?.[1].length || 1;
          const content = trimmedPara.replace(/^#{1,3}\s*/, '').trim();
          const headerClass = level === 1 ? "text-2xl font-bold text-white mt-6 mb-3" 
                            : level === 2 ? "text-xl font-semibold text-white mt-5 mb-2"
                            : "text-lg font-semibold text-gray-100 mt-4 mb-2";
          return <div key={idx} className={headerClass}>{formatInlineText(content)}</div>;
        }
        
        // Check for blockquotes (> text)
        if (/^>\s/.test(trimmedPara)) {
          const content = trimmedPara.replace(/^>\s*/, '').trim();
          return (
            <blockquote key={idx} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-500/10 rounded-r-lg italic text-gray-300">
              {formatInlineText(content)}
            </blockquote>
          );
        }
        
        // Check if paragraph is a numbered list (starts with number.)
        if (/^\d+\.\s/.test(trimmedPara)) {
          const items = para.split(/\n(?=\d+\.\s)/).filter(item => item.trim());
          return (
            <ol key={idx} className="list-decimal list-outside ml-5 space-y-2">
              {items.map((item, i) => {
                const content = item.replace(/^\d+\.\s*/, '').trim();
                return <li key={i} className="pl-2 text-gray-200">{formatInlineText(content)}</li>;
              })}
            </ol>
          );
        }
        
        // Check if paragraph contains bullet points (* or - at start)
        if (/^[\*\-]\s/.test(trimmedPara) || para.includes('\n* ') || para.includes('\n- ')) {
          const items = para.split(/\n(?=[\*\-]\s)/).filter(item => item.trim());
          return (
            <ul key={idx} className="space-y-2">
              {items.map((item, i) => {
                const content = item.replace(/^[\*\-]\s*/, '').trim();
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                    <span className="flex-1 text-gray-200">{formatInlineText(content)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }
        
        // Check for horizontal rule (---, ***, ___)
        if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmedPara)) {
          return <hr key={idx} className="border-gray-600 my-4" />;
        }
        
        // Regular paragraph
        return <p key={idx} className="leading-relaxed text-gray-200">{formatInlineText(para)}</p>;
      })}
    </div>
  );
}

// Format inline text (bold, italic, code, links, etc.)
function formatInlineText(text: string) {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let keyCounter = 0;

  // Process text with multiple inline formats
  while (remaining.length > 0) {
    let matched = false;
    
    // Match inline code `code` (highest priority to avoid conflicts)
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={`code-${keyCounter++}`} className="bg-gray-800 text-pink-400 px-2 py-0.5 rounded text-sm font-mono">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      matched = true;
      continue;
    }
    
    // Match links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a key={`link-${keyCounter++}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" 
           className="text-blue-400 hover:text-blue-300 underline">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      matched = true;
      continue;
    }
    
    // Match bold **text** or __text__
    const boldMatch = remaining.match(/^\*\*([^*]+?)\*\*|^__([^_]+?)__/);
    if (boldMatch) {
      const boldContent = boldMatch[1] || boldMatch[2];
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-bold text-white">
          {boldContent}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      matched = true;
      continue;
    }
    
    // Match italic *text* or _text_ (single asterisk/underscore)
    const italicMatch = remaining.match(/^\*([^*\s][^*]*?)\*|^_([^_\s][^_]*?)_/);
    if (italicMatch) {
      const italicContent = italicMatch[1] || italicMatch[2];
      parts.push(
        <em key={`italic-${keyCounter++}`} className="italic text-gray-100">
          {italicContent}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      matched = true;
      continue;
    }
    
    // Match strikethrough ~~text~~
    const strikeMatch = remaining.match(/^~~([^~]+?)~~/);
    if (strikeMatch) {
      parts.push(
        <del key={`strike-${keyCounter++}`} className="line-through text-gray-400">
          {strikeMatch[1]}
        </del>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      matched = true;
      continue;
    }
    
    // No match found, consume one character as plain text
    if (!matched) {
      // Find the next potential markdown character
      const nextSpecial = remaining.search(/[\*_`~\[]/);
      if (nextSpecial === -1) {
        // No more markdown, add rest as text
        parts.push(remaining);
        remaining = '';
      } else if (nextSpecial === 0) {
        // Special char at start but no match, treat as literal
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        // Add text up to next special char
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}

interface CVReview {
  phanTinhDayDu: {
    thongTinCaNhan: number;
    mucTieuViTri: number;
    kinhNghiemDuAn: number;
    kienThucKyNang: number;
    hocVanChungChi: number;
    nhanXet?: string;
    goiYChinhSua?: {
      thongTinCaNhan?: string;
      mucTieuViTri?: string;
      kinhNghiemDuAn?: string;
      kienThucKyNang?: string;
      hocVanChungChi?: string;
    };
  };
  phanTrinhBay: {
    gonGang: number;
    chuyenNghiep: number;
    nhanXet?: string;
    goiYChinhSua?: {
      gonGang?: string;
      chuyenNghiep?: string;
    };
  };
  phanNoiDung: {
    thongTinCaNhan?: string;
    diemThongTinCaNhan: number;
    kinhNghiemLamViec?: string;
    diemKinhNghiemLamViec: number;
    kyNangVaKienThuc?: string;
    diemKyNangVaKienThuc: number;
    hocVan?: string;
    diemHocVan: number;
    goiYChinhSua?: {
      thongTinCaNhan?: string;
      kinhNghiemLamViec?: string;
      kyNangVaKienThuc?: string;
      hocVan?: string;
    };
  };
  nhanXetTongQuat?: string;
  goiYHanhDong: {
    uuTienCapNhat: string[];
    goiYKhac?: string[];
    viDu?: string[];
  };
  diemManh?: string[];
  diemYeu?: string[];
  skills?: string[];
  keywords?: string[];
}

interface FixSuggestions {
  phanTinhDayDu: {
    thongTinCaNhan?: string;
    mucTieuViTri?: string;
    kinhNghiemDuAn?: string;
    kienThucKyNang?: string;
    hocVanChungChi?: string;
  };
  phanTrinhBay: {
    gonGang?: string;
    chuyenNghiep?: string;
  };
  phanNoiDung: {
    thongTinCaNhan?: string;
    kinhNghiemLamViec?: string;
    kyNangVaKienThuc?: string;
    hocVan?: string;
  };
}

export default function ReviewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const img = params.get("img");
  const file = params.get("file");

  const [reviewData, setReviewData] = useState<CVReview | null>(null);
  const [fixSuggestions, setFixSuggestions] = useState<FixSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"review" | "fix" | null>(null);
  const [currentView, setCurrentView] = useState<"review" | "fix">("review");

  // Restore state from localStorage on mount
  useEffect(() => {
    if (!file) return;
    
    const storageKey = `cv-review-${file}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const { reviewData: savedReview, fixSuggestions: savedFix } = JSON.parse(savedData);
        if (savedReview) setReviewData(savedReview);
        if (savedFix) setFixSuggestions(savedFix);
      } catch (error) {
        console.error("Error restoring data from localStorage:", error);
      }
    }
  }, [file]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!file) return;
    
    const storageKey = `cv-review-${file}`;
    const dataToSave = {
      reviewData,
      fixSuggestions,
    };
    
    if (reviewData || fixSuggestions) {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [reviewData, fixSuggestions, file]);

  function navigateToSkillsAnalysis() {
    if (!reviewData?.skills || reviewData.skills.length === 0) {
      alert("Không tìm thấy kỹ năng trong CV. Vui lòng đánh giá CV trước.");
      return;
    }
    
    const skillsParam = encodeURIComponent(JSON.stringify(reviewData.skills));
    router.push(`/skills-analysis?skills=${skillsParam}&img=${img}&file=${file}`);
  }

  async function review() {
    setLoading(true);
    setMode("review");
    setCurrentView("review");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        body: JSON.stringify({ originalFile: file }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const parsedData = JSON.parse(data.text);
      setReviewData(parsedData);
      setFixSuggestions(null);
    } catch (error) {
      console.error("Review error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fixCV() {
    if (!reviewData) {
      alert("Vui lòng thực hiện 'Đánh giá CV' trước khi sử dụng tính năng này.");
      return;
    }
    
    setLoading(true);
    setMode("fix");
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        body: JSON.stringify({ originalFile: file }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const parsedFixData = JSON.parse(data.text);
      setFixSuggestions(parsedFixData);
      setCurrentView("fix"); // Chuyển sang view fix
      // Keep reviewData intact
    } catch (error) {
      console.error("Fix error:", error);
      if (error instanceof Error && error.message.includes('Chưa có dữ liệu đánh giá')) {
        alert("Vui lòng thực hiện 'Đánh giá CV' trước khi sử dụng tính năng này.");
      }
    } finally {
      setLoading(false);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  if (!img || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="text-white text-xl">Missing file info</div>
      </div>
    );
  }

  const calculateAverage = (scores: number[]) => {
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Đánh Giá CV
            </h1>
            <p className="text-gray-300 text-lg">Phân tích chi tiết và gợi ý cải thiện</p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* CV Preview - Left Side */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 sticky top-8">
                <h2 className="text-xl font-semibold text-white mb-4">CV của bạn</h2>
                <img
                  src={`/uploads/${img}`}
                  className="w-full rounded-lg border-2 border-purple-500/50 shadow-lg"
                  alt="CV Preview"
                />
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={review}
                    disabled={loading || reviewData !== null}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading && mode === "review" ? "Đang phân tích..." : reviewData ? "✓ Đã đánh giá" : "Đánh giá CV"}
                  </button>
                  <button
                    onClick={fixCV}
                    disabled={loading || !reviewData}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading && mode === "fix" ? "Đang tạo gợi ý..." : "Gợi ý sửa CV"}
                  </button>
                  {!reviewData && (
                    <p className="text-yellow-400 text-xs text-center -mt-2">
                      * Cần đánh giá CV trước
                    </p>
                  )}
                  <button
                    onClick={navigateToSkillsAnalysis}
                    disabled={!reviewData?.skills || reviewData.skills.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Phân Tích Kỹ Năng
                  </button>
                  <button
                    onClick={() => {
                      if (file) {
                        localStorage.removeItem(`cv-review-${file}`);
                      }
                      router.push('/upload');
                    }}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Quay về
                  </button>
                </div>
              </div>
            </div>

            {/* Results - Right Side */}
            <div className="lg:col-span-2">
              {loading && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Đang xử lý...</p>
                  </div>
                </div>
              )}

              {/* Review Results */}
              {!loading && reviewData && currentView === "review" && (
                <div className="space-y-6">
                  {/* Overall Summary */}
                  {reviewData.nhanXetTongQuat && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span></span> Nhận xét tổng quan
                      </h2>
                      <p className="text-gray-200 text-lg leading-relaxed">{reviewData.nhanXetTongQuat}</p>
                    </div>
                  )}

                  {/* Score Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tính đầy đủ */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                      <h3 className="text-xl font-semibold text-white mb-4">Tính đầy đủ</h3>
                      <div className="space-y-3">
                        {Object.entries({
                          "Thông tin cá nhân": reviewData.phanTinhDayDu.thongTinCaNhan,
                          "Mục tiêu/Vị trí": reviewData.phanTinhDayDu.mucTieuViTri,
                          "Kinh nghiệm/Dự án": reviewData.phanTinhDayDu.kinhNghiemDuAn,
                          "Kiến thức & Kỹ năng": reviewData.phanTinhDayDu.kienThucKyNang,
                          "Học vấn & Chứng chỉ": reviewData.phanTinhDayDu.hocVanChungChi,
                        }).map(([label, score]) => (
                          <div key={label}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-300 text-sm">{label}</span>
                              <span className={`font-bold ${getScoreColor(score)}`}>{score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getScoreBgColor(score)}`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {reviewData.phanTinhDayDu.nhanXet && (
                        <p className="text-gray-300 text-sm mt-4 italic">{reviewData.phanTinhDayDu.nhanXet}</p>
                      )}
                    </div>

                    {/* Trình bày */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                      <h3 className="text-xl font-semibold text-white mb-4">Trình bày</h3>
                      <div className="space-y-3">
                        {Object.entries({
                          "Gọn gàng": reviewData.phanTrinhBay.gonGang,
                          "Chuyên nghiệp": reviewData.phanTrinhBay.chuyenNghiep,
                        }).map(([label, score]) => (
                          <div key={label}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-300 text-sm">{label}</span>
                              <span className={`font-bold ${getScoreColor(score)}`}>{score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getScoreBgColor(score)}`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {reviewData.phanTrinhBay.nhanXet && (
                        <p className="text-gray-300 text-sm mt-4 italic">{reviewData.phanTrinhBay.nhanXet}</p>
                      )}
                    </div>
                  </div>

                  {/* Chi tiết nội dung */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <span></span> Chi tiết nội dung
                    </h2>
                    {reviewData.nhanXetTongQuat && (
                      <div className="bg-gradient-to-r rounded-lg p-4 mb-6 border border-purple-500/30">
                        <h4 className="font-semibold text-purple-300 mb-2 text-sm">Nhận xét</h4>
                        <p className="text-gray-200 text-sm leading-relaxed">{reviewData.nhanXetTongQuat}</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      {reviewData.phanNoiDung.diemThongTinCaNhan !== undefined && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">👤 Thông tin cá nhân</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemThongTinCaNhan)}`}>
                              {reviewData.phanNoiDung.diemThongTinCaNhan}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(reviewData.phanNoiDung.diemThongTinCaNhan)}`}
                              style={{ width: `${reviewData.phanNoiDung.diemThongTinCaNhan}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {reviewData.phanNoiDung.diemKinhNghiemLamViec !== undefined && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">💼 Kinh nghiệm làm việc</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemKinhNghiemLamViec)}`}>
                              {reviewData.phanNoiDung.diemKinhNghiemLamViec}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(reviewData.phanNoiDung.diemKinhNghiemLamViec)}`}
                              style={{ width: `${reviewData.phanNoiDung.diemKinhNghiemLamViec}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {reviewData.phanNoiDung.diemKyNangVaKienThuc !== undefined && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">⚡ Kỹ năng & Kiến thức</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemKyNangVaKienThuc)}`}>
                              {reviewData.phanNoiDung.diemKyNangVaKienThuc}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(reviewData.phanNoiDung.diemKyNangVaKienThuc)}`}
                              style={{ width: `${reviewData.phanNoiDung.diemKyNangVaKienThuc}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {reviewData.phanNoiDung.diemHocVan !== undefined && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">🎓 Học vấn</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemHocVan)}`}>
                              {reviewData.phanNoiDung.diemHocVan}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(reviewData.phanNoiDung.diemHocVan)}`}
                              style={{ width: `${reviewData.phanNoiDung.diemHocVan}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Điểm mạnh & Điểm yếu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviewData.diemManh && reviewData.diemManh.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-green-500/30">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <span></span> Điểm mạnh
                        </h3>
                        <ul className="space-y-2">
                          {reviewData.diemManh.map((item, idx) => (
                            <li key={idx} className="text-gray-200 text-sm flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {reviewData.diemYeu && reviewData.diemYeu.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-red-500/30">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <span></span> Điểm yếu
                        </h3>
                        <ul className="space-y-2">
                          {reviewData.diemYeu.map((item, idx) => (
                            <li key={idx} className="text-gray-200 text-sm flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Skills & Keywords */}
                  {(reviewData.skills && reviewData.skills.length > 0) || (reviewData.keywords && reviewData.keywords.length > 0) ? (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span></span> Kỹ Năng & Từ Khóa 
                      </h2>
                      
                      {reviewData.skills && reviewData.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-blue-400 mb-3 text-lg">Kỹ năng (Skills)</h4>
                          <div className="flex flex-wrap gap-2">
                            {reviewData.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-500/30 border border-blue-500 rounded-full text-white text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {reviewData.keywords && reviewData.keywords.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-400 mb-3 text-lg">Từ khóa (Keywords)</h4>
                          <div className="flex flex-wrap gap-2">
                            {reviewData.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-500/30 border border-purple-500 rounded-full text-white text-sm"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <p className="text-gray-200 text-sm flex items-start gap-2">
                          <span className="text-green-400 text-xl">💡</span>
                          <span>
                            Nhấn nút <strong> "Gợi ý sửa CV" </strong> để gợi ý sửa CV tốt hơn hoặc <strong>"Phân Tích Kỹ Năng"</strong> để tìm hiểu các kỹ năng bổ sung!
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Fix Results */}
              {!loading && fixSuggestions && reviewData && currentView === "fix" && (() => {
                // Check if all scores are >= 80
                const allScoresGood = 
                  reviewData.phanTinhDayDu.thongTinCaNhan >= 80 &&
                  reviewData.phanTinhDayDu.mucTieuViTri >= 80 &&
                  reviewData.phanTinhDayDu.kinhNghiemDuAn >= 80 &&
                  reviewData.phanTinhDayDu.kienThucKyNang >= 80 &&
                  reviewData.phanTinhDayDu.hocVanChungChi >= 80 &&
                  reviewData.phanTrinhBay.gonGang >= 80 &&
                  reviewData.phanTrinhBay.chuyenNghiep >= 80 &&
                  reviewData.phanNoiDung.diemThongTinCaNhan >= 80 &&
                  reviewData.phanNoiDung.diemKinhNghiemLamViec >= 80 &&
                  reviewData.phanNoiDung.diemKyNangVaKienThuc >= 80 &&
                  reviewData.phanNoiDung.diemHocVan >= 80;

                return (
                  <div className="space-y-6">
                    {/* Header with back to review button */}
                    <div className={`backdrop-blur-md rounded-2xl p-6 shadow-2xl border ${
                      allScoresGood 
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                        : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                          <span>{allScoresGood ? '🎉' : '🔧'}</span> 
                          {allScoresGood ? 'Kết Quả Đánh Giá' : 'Chỉnh Sửa CV'}
                        </h2>
                        <button
                          onClick={() => setCurrentView("review")}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
                        >
                          ← Quay lại đánh giá
                        </button>
                      </div>
                      <p className="text-gray-200 text-lg">
                        {allScoresGood 
                          ? 'Tuyệt vời! CV của bạn đã ổn. Tất cả các phần đều đạt điểm tốt (≥ 80). Không cần chỉnh sửa thêm!'
                          : 'Dưới đây là các gợi ý chi tiết cho các phần cần cải thiện. Hãy làm theo các bước sau đây để cải thiện CV tốt hơn.'
                        }
                      </p>
                    </div>
                    
                    {!allScoresGood && (
                      <>


                  {/* Step 1: Tính đầy đủ */}
                  {(fixSuggestions.phanTinhDayDu.thongTinCaNhan || 
                    fixSuggestions.phanTinhDayDu.mucTieuViTri ||
                    fixSuggestions.phanTinhDayDu.kinhNghiemDuAn ||
                    fixSuggestions.phanTinhDayDu.kienThucKyNang ||
                    fixSuggestions.phanTinhDayDu.hocVanChungChi) && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-purple-500/30">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          1
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">Cải Thiện Tính Đầy Đủ</h3>
                          <p className="text-gray-400 text-sm">Hoàn thiện các phần còn thiếu trong CV</p>
                        </div>
                      </div>
                      
                      <div className="ml-16 space-y-4">
                        {/* Thông tin cá nhân */}
                        {fixSuggestions.phanTinhDayDu.thongTinCaNhan && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Thông tin cá nhân</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanTinhDayDu.thongTinCaNhan)}`}>
                                {reviewData.phanTinhDayDu.thongTinCaNhan}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanTinhDayDu.thongTinCaNhan} />
                            </div>
                          </div>
                        )}

                        {/* Mục tiêu vị trí */}
                        {fixSuggestions.phanTinhDayDu.mucTieuViTri && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Mục tiêu / Vị trí</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanTinhDayDu.mucTieuViTri)}`}>
                                {reviewData.phanTinhDayDu.mucTieuViTri}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanTinhDayDu.mucTieuViTri} />
                            </div>
                          </div>
                        )}

                        {/* Kinh nghiệm dự án */}
                        {fixSuggestions.phanTinhDayDu.kinhNghiemDuAn && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Kinh nghiệm / Dự án</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanTinhDayDu.kinhNghiemDuAn)}`}>
                                {reviewData.phanTinhDayDu.kinhNghiemDuAn}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanTinhDayDu.kinhNghiemDuAn} />
                            </div>
                          </div>
                        )}

                        {/* Kiến thức kỹ năng */}
                        {fixSuggestions.phanTinhDayDu.kienThucKyNang && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Kiến thức & Kỹ năng</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanTinhDayDu.kienThucKyNang)}`}>
                                {reviewData.phanTinhDayDu.kienThucKyNang}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanTinhDayDu.kienThucKyNang} />
                            </div>
                          </div>
                        )}

                        {/* Học vấn chứng chỉ */}
                        {fixSuggestions.phanTinhDayDu.hocVanChungChi && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Học vấn & Chứng chỉ</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanTinhDayDu.hocVanChungChi)}`}>
                                {reviewData.phanTinhDayDu.hocVanChungChi}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanTinhDayDu.hocVanChungChi} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Trình bày */}
                  {(fixSuggestions.phanTrinhBay.gonGang || fixSuggestions.phanTrinhBay.chuyenNghiep) && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-blue-500/30">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          2
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">Cải Thiện Trình Bày</h3>
                          <p className="text-gray-400 text-sm">Nâng cao tính chuyên nghiệp và thẩm mỹ</p>
                        </div>
                      </div>
                      
                      <div className="ml-16 space-y-4">
                        {/* Gọn gàng */}
                        {fixSuggestions.phanTrinhBay.gonGang && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Tính gọn gàng</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanTrinhBay.gonGang)}`}>
                                {reviewData.phanTrinhBay.gonGang}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanTrinhBay.gonGang} />
                            </div>
                          </div>
                        )}

                        {/* Chuyên nghiệp */}
                        {fixSuggestions.phanTrinhBay.chuyenNghiep && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Tính chuyên nghiệp</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanTrinhBay.chuyenNghiep)}`}>
                                {reviewData.phanTrinhBay.chuyenNghiep}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanTrinhBay.chuyenNghiep} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Nội dung */}
                  {(fixSuggestions.phanNoiDung.thongTinCaNhan ||
                    fixSuggestions.phanNoiDung.kinhNghiemLamViec ||
                    fixSuggestions.phanNoiDung.kyNangVaKienThuc ||
                    fixSuggestions.phanNoiDung.hocVan) && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-green-500/30">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          3
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">Cải Thiện Nội Dung</h3>
                          <p className="text-gray-400 text-sm">Tối ưu hóa từng phần nội dung chi tiết</p>
                        </div>
                      </div>
                      
                      <div className="ml-16 space-y-4">
                        {/* Thông tin cá nhân */}
                        {fixSuggestions.phanNoiDung.thongTinCaNhan && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Thông tin cá nhân</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemThongTinCaNhan)}`}>
                                {reviewData.phanNoiDung.diemThongTinCaNhan}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanNoiDung.thongTinCaNhan} />
                            </div>
                          </div>
                        )}

                        {/* Kinh nghiệm làm việc */}
                        {fixSuggestions.phanNoiDung.kinhNghiemLamViec && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Kinh nghiệm làm việc</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemKinhNghiemLamViec)}`}>
                                {reviewData.phanNoiDung.diemKinhNghiemLamViec}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanNoiDung.kinhNghiemLamViec} />
                            </div>
                          </div>
                        )}

                        {/* Kỹ năng và kiến thức */}
                        {fixSuggestions.phanNoiDung.kyNangVaKienThuc && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg">Kỹ năng & Kiến thức</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemKyNangVaKienThuc)}`}>
                                {reviewData.phanNoiDung.diemKyNangVaKienThuc}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanNoiDung.kyNangVaKienThuc} />
                            </div>
                          </div>
                        )}

                        {/* Học vấn */}
                        {fixSuggestions.phanNoiDung.hocVan && (
                          <div className="bg-black/30 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-white text-lg"> Học vấn</h4>
                              <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemHocVan)}`}>
                                {reviewData.phanNoiDung.diemHocVan}/100
                              </span>
                            </div>
                            <div className="text-gray-200 text-sm">
                              <FormattedText text={fixSuggestions.phanNoiDung.hocVan} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gợi ý hành động */}
                  {reviewData.goiYHanhDong && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        Lưu ý thêm: 
                      </h2>
                      
                      {reviewData.goiYHanhDong.uuTienCapNhat && reviewData.goiYHanhDong.uuTienCapNhat.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-purple-400 mb-3 text-lg">Ưu tiên cập nhật</h4>
                          <ol className="space-y-2 list-decimal list-inside">
                            {reviewData.goiYHanhDong.uuTienCapNhat.map((item, idx) => (
                              <li key={idx} className="text-gray-200 text-sm pl-2">{item}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {reviewData.goiYHanhDong.goiYKhac && reviewData.goiYHanhDong.goiYKhac.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-blue-400 mb-3 text-lg">Gợi ý khác</h4>
                          <ul className="space-y-2">
                            {reviewData.goiYHanhDong.goiYKhac.map((item, idx) => (
                              <li key={idx} className="text-gray-200 text-sm flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reviewData.goiYHanhDong.viDu && reviewData.goiYHanhDong.viDu.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-400 mb-3 text-lg">Ví dụ cụ thể</h4>
                          <div className="space-y-2">
                            {reviewData.goiYHanhDong.viDu.map((item, idx) => (
                              <div key={idx} className="bg-black/30 rounded-lg p-3 text-gray-200 text-sm font-mono">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  </>
                    )}
                  </div>
                );
              })()}

              {/* Placeholder */}
              {!loading && !reviewData && !fixSuggestions && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20 text-center">
                  <div className="text-6xl mb-4"></div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    Chọn một hành động
                  </h3>
                  <p className="text-gray-300">
                    Nhấn "Đánh giá CV" để xem phân tích chi tiết hoặc "Gợi ý sửa CV" để nhận gợi ý cải thiện
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
