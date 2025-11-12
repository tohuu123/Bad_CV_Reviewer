import os
import mimetypes
from typing import List, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# Your Pydantic models remain unchanged...
Score = int

class PhanTinhDayDu(BaseModel):
    thongTinCaNhan: int = Field(..., ge=0, le=100, description="Điểm phần Thông tin cá nhân (0-100)")
    mucTieuViTri: int = Field(..., ge=0, le=100, description="Điểm phần Mục tiêu / vị trí hướng đến (0-100)")
    kinhNghiemDuAn: int = Field(..., ge=0, le=100, description="Điểm phần Kinh nghiệm làm việc / dự án (0-100)")
    kienThucKyNang: int = Field(..., ge=0, le=100, description="Điểm phần Kiến thức & kỹ năng (0-100)")
    hocVanChungChi: int = Field(..., ge=0, le=100, description="Điểm phần Học vấn & chứng chỉ (0-100)")
    nhanXet: Optional[str] = Field(None, description="Nhận xét về tính đầy đủ")

class PhanTrinhBay(BaseModel):
    gonGang: int = Field(..., ge=0, le=100, description="Điểm tính gọn gàng (0-100)")
    chuyenNghiep: int = Field(..., ge=0, le=100, description="Điểm tính chuyên nghiệp (0-100)")
    nhanXet: Optional[str] = Field(None, description="Nhận xét về trình bày")

class PhanNoiDung(BaseModel):
    thongTinCaNhan: Optional[str] = Field(None, description="Nhận xét chi tiết về phần thông tin cá nhân")
    diemThongTinCaNhan: int = Field(..., ge=0, le=100, description="Điểm phần thông tin cá nhân (0-100)")
    kinhNghiemLamViec: Optional[str] = Field(None, description="Nhận xét chi tiết về kinh nghiệm làm việc / dự án")
    diemKinhNghiemLamViec: int = Field(..., ge=0, le=100, description="Điểm phần kinh nghiệm làm việc (0-100)")
    kyNangVaKienThuc: Optional[str] = Field(None, description="Nhận xét chi tiết về kỹ năng và kiến thức")
    diemKyNangVaKienThuc: int = Field(..., ge=0, le=100, description="Điểm phần kỹ năng và kiến thức (0-100)")
    hocVan: Optional[str] = Field(None, description="Nhận xét chi tiết về học vấn và chứng chỉ")
    diemHocVan: int = Field(..., ge=0, le=100, description="Điểm phần học vấn (0-100)")

class GoiYHanhDong(BaseModel):
    uuTienCapNhat: List[str] = Field(..., description="Danh sách hành động ưu tiên (theo thứ tự) để cải thiện CV")
    goiYKhac: Optional[List[str]] = Field(None, description="Các gợi ý khác")
    viDu: Optional[List[str]] = Field(None, description="Ví dụ cụ thể từ CV")

class CVReviewSchema(BaseModel):
    phanTinhDayDu: PhanTinhDayDu = Field(..., description="Đánh giá chi tiết phần Tính đầy đủ")
    phanTrinhBay: PhanTrinhBay = Field(..., description="Đánh giá chi tiết phần Trình bày")
    phanNoiDung: PhanNoiDung = Field(..., description="Đánh giá chi tiết về Nội dung")

    nhanXetTongQuat: Optional[str] = Field(None, description="Nhận xét tổng quan về CV")
    goiYHanhDong: GoiYHanhDong = Field(..., description="Gợi ý hành động cụ thể để ứng viên cải thiện CV")

    diemManh: Optional[List[str]] = Field(None, description="Các điểm mạnh nổi bật trong CV")
    diemYeu: Optional[List[str]] = Field(None, description="Các điểm yếu cần tránh")

# Setup environment variable or pass API key
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

def load_prompt():
    prompt_file = os.path.join(os.path.dirname(__file__), "prompt.txt")
    try:
        with open(prompt_file, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading prompt file: {e}")
        return None

def analyze_cv(file_path: str):
    prompt = load_prompt()
    if not prompt:
        return "Error: Could not load system prompt"

    # Determine MIME type
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            mime_type = 'application/pdf'
        elif ext in ('.jpg', '.jpeg'):
            mime_type = 'image/jpeg'
        elif ext == '.png':
            mime_type = 'image/png'
        elif ext == '.docx':
            mime_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        else:
            print(f"(!) Error: Unknown file type for {file_path}")
            return None

    # Upload file if required (especially for large file)
    uploaded = client.files.upload(file=file_path)

    # Now build the contents list
    contents = [
        types.Part(text=prompt),
        uploaded  # the uploaded File object
    ]

    # Define config (optional) for structured output
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=CVReviewSchema.model_json_schema()
    )

    # Call generate_content
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=config
    )

    return response.text