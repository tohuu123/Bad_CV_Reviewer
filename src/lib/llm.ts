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

// Course Recommendation Schema
const CourseRecommendationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    courses: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          skill: {
            type: SchemaType.STRING,
            description: "Tên kỹ năng"
          },
          courseName: {
            type: SchemaType.STRING,
            description: "Tên khóa học"
          },
          provider: {
            type: SchemaType.STRING,
            description: "Nhà cung cấp khóa học (Coursera, Udemy, edX, etc.)"
          },
          url: {
            type: SchemaType.STRING,
            description: "Link đến khóa học (nếu có thể tạo URL hợp lý)"
          },
          isFree: {
            type: SchemaType.BOOLEAN,
            description: "Khóa học miễn phí (true) hay trả phí (false)"
          },
          description: {
            type: SchemaType.STRING,
            description: "Mô tả chi tiết về lợi ích của khóa học này cho người dùng (2-3 câu)"
          },
          reasonForRecommendation: {
            type: SchemaType.STRING,
            description: "Lý do tại sao khóa học này phù hợp với kỹ năng hiện tại và mục tiêu của người dùng (1-2 câu)"
          }
        },
        required: ["skill", "courseName", "provider", "description", "reasonForRecommendation"]
      },
      description: "Danh sách các khóa học và chứng chỉ đề xuất"
    }
  },
  required: ["courses"]
} as Schema;

export async function analyzeSkills(currentSkills: string[]) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: SkillAnalysisSchema,
    },
  });

  const prompt = `Dựa trên danh sách kỹ năng hiện tại của ứng viên: ${currentSkills.join(", ")}.

Hãy đề xuất các kỹ năng bổ sung mà ứng viên Fresher đang theo học Software Engineer nên học để:
1. Bổ sung cho kỹ năng hiện có
2. Phù hợp với xu hướng công nghệ hiện tại, đang hot ứng tuyển (từ năm 2025 trở đi)

Ưu tiên các kỹ năng thực tế, có nhu cầu cao và liên quan đến kỹ năng hiện có.
Đề xuất khoảng 5-10 kỹ năng.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function recommendCourses(skills: string[], numberOfCourses: number = 5) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: CourseRecommendationSchema,
    },
  });

  const prompt = `Hãy đề xuất các khóa học và chứng chỉ cho những kỹ năng sau: ${skills.join(", ")}.

Yêu cầu:
- Tổng cộng đề xuất ${numberOfCourses} khóa học
- Ưu tiên các khóa học từ Coursera, Udemy, edX, LinkedIn Learning, Udacity, YouTube
- Ưu tiên các khóa học miễn phí (free) trước, sau đó mới đến khóa học trả phí (paid)
- Đảm bảo URL tồn tại (có thể là URL tìm kiếm nếu không biết chính xác)
- Phân bổ khóa học đều cho các kỹ năng được chọn
- Đánh dấu chính xác "isFree": true cho khóa học miễn phí, false cho khóa học trả phí

Quan trọng - Cho mỗi khóa học:
1. "isFree": true nếu khóa học hoàn toàn miễn phí, false nếu cần trả phí
   
2. "description": Viết mô tả chi tiết (2-3 câu) về:
   - Người dùng sẽ học được gì từ khóa học này
   - Lợi ích cụ thể khi hoàn thành (ví dụ: có thể làm dự án gì, áp dụng vào công việc thế nào)
   - Tại sao khóa học này đáng tin cậy và hữu ích

3. "reasonForRecommendation": Giải thích ngắn gọn (1-2 câu) tại sao khóa học này phù hợp với:
   - Kỹ năng hiện tại của người dùng
   - Mục tiêu phát triển nghề nghiệp
   - Xu hướng thị trường hiện tại

Viết bằng tiếng Việt, giọng văn chuyên nghiệp nhưng thân thiện, tăng độ tin cậy.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
