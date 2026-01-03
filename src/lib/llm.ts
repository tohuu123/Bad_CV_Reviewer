import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// CV Review Schema matching Python Pydantic models
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
  const promptPath = path.join(process.cwd(), "src", "lib", "prompt.txt");
  const SYSTEM_PROMPT = fs.readFileSync(promptPath, "utf-8");

  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  const mimeType = getMimeType(filePath);

  let model;
  let prompt = SYSTEM_PROMPT;
  
  if (mode === 'review') {
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: CVReviewSchema,
      },
    });
  } else {
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });
    
    prompt += `\n\nDựa trên các tiêu chí đánh giá trên, hãy đưa ra các gợi ý CỤ THỂ và CHI TIẾT để cải thiện CV này. Bao gồm:
    1. Những điểm cần sửa ngay lập tức
    2. Những điểm nên thêm vào
    3. Những điểm nên bỏ đi hoặc viết lại
    4. Ví dụ cụ thể về cách viết tốt hơn cho từng phần
    5. Template/mẫu câu gợi ý cho các phần quan trọng`;
  }

  const result = await model.generateContent([
    {
      text: prompt
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
