"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ParticlesBackground from "@/components/ParticlesBackground";

interface CVReview {
  phanTinhDayDu: {
    thongTinCaNhan: number;
    mucTieuViTri: number;
    kinhNghiemDuAn: number;
    kienThucKyNang: number;
    hocVanChungChi: number;
    nhanXet?: string;
  };
  phanTrinhBay: {
    gonGang: number;
    chuyenNghiep: number;
    nhanXet?: string;
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
  };
  nhanXetTongQuat?: string;
  goiYHanhDong: {
    uuTienCapNhat: string[];
    goiYKhac?: string[];
    viDu?: string[];
  };
  diemManh?: string[];
  diemYeu?: string[];
}

export default function ReviewPage() {
  const params = useSearchParams();
  const img = params.get("img");
  const file = params.get("file");

  const [reviewData, setReviewData] = useState<CVReview | null>(null);
  const [fixText, setFixText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"review" | "fix" | null>(null);

  async function review() {
    setLoading(true);
    setMode("review");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        body: JSON.stringify({ originalFile: file }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      const parsedData = JSON.parse(data.text);
      setReviewData(parsedData);
      setFixText("");
    } catch (error) {
      console.error("Review error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fixCV() {
    setLoading(true);
    setMode("fix");
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        body: JSON.stringify({ originalFile: file }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setFixText(data.text);
      setReviewData(null);
    } catch (error) {
      console.error("Fix error:", error);
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
    <div>
      <ParticlesBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
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
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading && mode === "review" ? "Đang phân tích..." : "Đánh giá CV"}
                  </button>
                  <button
                    onClick={fixCV}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading && mode === "fix" ? "Đang tạo gợi ý..." : "Gợi ý sửa CV"}
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
              {!loading && reviewData && (
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
                    <div className="space-y-4">
                      {reviewData.phanNoiDung.thongTinCaNhan && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">👤 Thông tin cá nhân</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemThongTinCaNhan)}`}>
                              {reviewData.phanNoiDung.diemThongTinCaNhan}/100
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{reviewData.phanNoiDung.thongTinCaNhan}</p>
                        </div>
                      )}
                      
                      {reviewData.phanNoiDung.kinhNghiemLamViec && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">💼 Kinh nghiệm làm việc</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemKinhNghiemLamViec)}`}>
                              {reviewData.phanNoiDung.diemKinhNghiemLamViec}/100
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{reviewData.phanNoiDung.kinhNghiemLamViec}</p>
                        </div>
                      )}
                      
                      {reviewData.phanNoiDung.kyNangVaKienThuc && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">⚡ Kỹ năng & Kiến thức</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemKyNangVaKienThuc)}`}>
                              {reviewData.phanNoiDung.diemKyNangVaKienThuc}/100
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{reviewData.phanNoiDung.kyNangVaKienThuc}</p>
                        </div>
                      )}
                      
                      {reviewData.phanNoiDung.hocVan && (
                        <div className="bg-black/20 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-white">🎓 Học vấn</h4>
                            <span className={`font-bold text-lg ${getScoreColor(reviewData.phanNoiDung.diemHocVan)}`}>
                              {reviewData.phanNoiDung.diemHocVan}/100
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{reviewData.phanNoiDung.hocVan}</p>
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

                  {/* Gợi ý hành động */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <span></span> Gợi ý hành động
                    </h2>
                    
                    {reviewData.goiYHanhDong.uuTienCapNhat.length > 0 && (
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
                </div>
              )}

              {/* Fix Results */}
              {!loading && fixText && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>🔧</span> Gợi ý cải thiện CV
                  </h2>
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed bg-black/30 rounded-lg p-4">
                      {fixText}
                    </pre>
                  </div>
                </div>
              )}

              {/* Placeholder */}
              {!loading && !reviewData && !fixText && (
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
    </div>
  );
}
