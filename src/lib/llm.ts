import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// CV Review Schema 
const CVReviewSchema = {
  type: SchemaType.OBJECT,
  properties: {
    phanTinhDayDu: {
      type: SchemaType.OBJECT,
      properties: {
        thongTinCaNhan: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần Thông tin cá nhân (0-100)"
        },
        mucTieuViTri: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần Mục tiêu / vị trí hướng đến (0-100)"
        },
        kinhNghiemDuAn: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần Kinh nghiệm làm việc / dự án (0-100)"
        },
        kienThucKyNang: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần Kiến thức & kỹ năng (0-100)"
        },
        hocVanChungChi: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần Học vấn & chứng chỉ (0-100)"
        },
        nhanXet: {
          type: SchemaType.STRING,
          description: "Nhận xét về tính đầy đủ"
        },
        goiYChinhSua: {
          type: SchemaType.OBJECT,
          properties: {
            thongTinCaNhan: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện phần Thông tin cá nhân (chỉ tạo nếu điểm < 80)"
            },
            mucTieuViTri: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện phần Mục tiêu/Vị trí (chỉ tạo nếu điểm < 80)"
            },
            kinhNghiemDuAn: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện phần Kinh nghiệm/Dự án (chỉ tạo nếu điểm < 80)"
            },
            kienThucKyNang: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện phần Kiến thức & Kỹ năng (chỉ tạo nếu điểm < 80)"
            },
            hocVanChungChi: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện phần Học vấn & Chứng chỉ (chỉ tạo nếu điểm < 80)"
            }
          },
          description: "Gợi ý chỉnh sửa cho từng phần trong tính đầy đủ (chỉ bao gồm các phần có điểm < 80)"
        }
      },
      required: ["thongTinCaNhan", "mucTieuViTri", "kinhNghiemDuAn", "kienThucKyNang", "hocVanChungChi"]
    },
    phanTrinhBay: {
      type: SchemaType.OBJECT,
      properties: {
        gonGang: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm tính gọn gàng (0-100)"
        },
        chuyenNghiep: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm tính chuyên nghiệp (0-100)"
        },
        nhanXet: {
          type: SchemaType.STRING,
          description: "Nhận xét về trình bày"
        },
        goiYChinhSua: {
          type: SchemaType.OBJECT,
          properties: {
            gonGang: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện tính gọn gàng (chỉ tạo nếu điểm < 80)"
            },
            chuyenNghiep: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện tính chuyên nghiệp (chỉ tạo nếu điểm < 80)"
            }
          },
          description: "Gợi ý chỉnh sửa cho từng phần trong trình bày (chỉ bao gồm các phần có điểm < 80)"
        }
      },
      required: ["gonGang", "chuyenNghiep"]
    },
    phanNoiDung: {
      type: SchemaType.OBJECT,
      properties: {
        thongTinCaNhan: {
          type: SchemaType.STRING,
          description: "Nhận xét chi tiết về phần thông tin cá nhân"
        },
        diemThongTinCaNhan: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần thông tin cá nhân (0-100)"
        },
        kinhNghiemLamViec: {
          type: SchemaType.STRING,
          description: "Nhận xét chi tiết về kinh nghiệm làm việc / dự án"
        },
        diemKinhNghiemLamViec: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần kinh nghiệm làm việc (0-100)"
        },
        kyNangVaKienThuc: {
          type: SchemaType.STRING,
          description: "Nhận xét chi tiết về kỹ năng và kiến thức"
        },
        diemKyNangVaKienThuc: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần kỹ năng và kiến thức (0-100)"
        },
        hocVan: {
          type: SchemaType.STRING,
          description: "Nhận xét chi tiết về học vấn và chứng chỉ"
        },
        diemHocVan: {
          type: SchemaType.INTEGER,
          minimum: 0,
          maximum: 100,
          description: "Điểm phần học vấn (0-100)"
        },
        goiYChinhSua: {
          type: SchemaType.OBJECT,
          properties: {
            thongTinCaNhan: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện nội dung Thông tin cá nhân (chỉ tạo nếu điểm < 80)"
            },
            kinhNghiemLamViec: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện nội dung Kinh nghiệm làm việc (chỉ tạo nếu điểm < 80)"
            },
            kyNangVaKienThuc: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện nội dung Kỹ năng & Kiến thức (chỉ tạo nếu điểm < 80)"
            },
            hocVan: {
              type: SchemaType.STRING,
              description: "Gợi ý chi tiết để cải thiện nội dung Học vấn (chỉ tạo nếu điểm < 80)"
            }
          },
          description: "Gợi ý chỉnh sửa cho từng phần nội dung (chỉ bao gồm các phần có điểm < 80)"
        }
      },
      required: ["diemThongTinCaNhan", "diemKinhNghiemLamViec", "diemKyNangVaKienThuc", "diemHocVan"]
    },
    nhanXetTongQuat: {
      type: SchemaType.STRING,
      description: "Nhận xét tổng quan về CV"
    },
    goiYHanhDong: {
      type: SchemaType.OBJECT,
      properties: {
        uuTienCapNhat: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Danh sách hành động ưu tiên (theo thứ tự) để cải thiện CV"
        },
        goiYKhac: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Các gợi ý khác"
        },
        viDu: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Ví dụ cụ thể từ CV"
        }
      },
      required: ["uuTienCapNhat"]
    },
    diemManh: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Các điểm mạnh nổi bật trong CV"
    },
    diemYeu: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Các điểm yếu cần tránh"
    },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Danh sách các kỹ năng (skills) được tìm thấy trong CV"
    },
    keywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Các từ khóa (keywords) quan trọng liên quan đến công nghệ, công cụ, ngôn ngữ lập trình trong CV"
    }
  },
  required: ["phanTinhDayDu", "phanTrinhBay", "phanNoiDung", "goiYHanhDong"]
} as Schema;

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

export async function analyzeCV(filePath: string, mode: 'review' | 'fix' = 'review') {
  // For fix mode, retrieve stored review data
  if (mode === 'fix') {
    const reviewJsonPath = filePath + '.json';
    if (!fs.existsSync(reviewJsonPath)) {
      throw new Error('Chưa có dữ liệu đánh giá. Vui lòng thực hiện "Đánh giá CV" trước.');
    }
    
    const reviewData = JSON.parse(fs.readFileSync(reviewJsonPath, 'utf-8'));
    
    // Extract GoiYChinhSua from all sections
    const fixSuggestions = {
      phanTinhDayDu: reviewData.phanTinhDayDu?.goiYChinhSua || '',
      phanTrinhBay: reviewData.phanTrinhBay?.goiYChinhSua || '',
      phanNoiDung: reviewData.phanNoiDung?.goiYChinhSua || ''
    };
    
    return JSON.stringify(fixSuggestions);
  }
  
  // Review mode - call LLM
  const promptPath = path.join(process.cwd(), "src", "lib", "prompt.txt");
  const SYSTEM_PROMPT = fs.readFileSync(promptPath, "utf-8");
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  const mimeType = getMimeType(filePath);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: CVReviewSchema,
    },
  });

  const result = await model.generateContent([
    {
      text: SYSTEM_PROMPT
    },
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    }
  ]);

  return result.response.text();
}

// Skills Analysis Schema
const SkillAnalysisSchema = {
  type: SchemaType.OBJECT,
  properties: {
    recommendedSkills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Danh sách các kỹ năng được đề xuất bổ sung để cải thiện CV"
    }
  },
  required: ["recommendedSkills"]
} as Schema;

