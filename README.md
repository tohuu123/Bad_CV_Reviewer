# Bad CV Reviewer

Một web-application để review CV cho sinh viên IT mong muốn theo lĩnh vực Software Engineering.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/LLM**: Google Gemini API
- **Database**: Firebase Firestore
- **Animation**: tsParticles
- **Icons**: Heroicons + Lucide React

## Yêu Cầu Hệ Thống

- Node.js 18.x trở lên
- npm hoặc yarn
- Tài khoản Google Cloud (để lấy Gemini API key)
- Tài khoản Firebase (để sử dụng Firestore)

## ⚙️ Cài Đặt và Cấu Hình

### 1. Clone project

```bash
git clone <repository-url>
cd Bad_CV_Reviewer
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file .env.local

Tạo file `.env.local` ở thư mục root của project và thêm các biến môi trường sau:

```bash
# Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Firebase Configuration
# Lấy từ Firebase Console > Project Settings > Your apps > Web app
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

#### Lấy Google Gemini API Key:

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google
3. Click "Create API Key"
4. Copy API key và paste vào file `.env.local`

### 4. Seed dữ liệu Skills vào Firebase (cho Debug)

```bash
node scripts/seedSkills.js
```
Script này sẽ thêm các skills mẫu vào Firestore database.

## Chạy Project

### Development mode

```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem app.

### Build production

```bash
npm run build
npm start
```

## Cấu Trúc Project

```
Bad_CV_Reviewer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Trang chủ (Upload CV)
│   │   ├── review/
│   │   │   └── page.tsx       # Trang xem kết quả review
│   │   ├── skills-analysis/
│   │   │   └── page.tsx       # Trang phân tích kỹ năng
│   │   ├── api/               # API Routes
│   │   │   ├── upload/        # Upload CV
│   │   │   ├── review/        # Review CV bằng AI
│   │   │   ├── analyze-skills/# Phân tích skills
│   │   │   ├── recommend-courses/ # Gợi ý khóa học
│   │   │   └── fix/           # Fix CV
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ParticlesBackground.tsx
│   └── lib/
│       ├── firebase.ts        # Firebase config
│       ├── llm.ts             # Gemini AI integration
│       ├── skillsDb.ts        # Firestore helpers
│       ├── utils.ts           # Utility functions
│       └── prompt.txt         # System prompt cho AI
├── public/
│   └── uploads/               # Thư mục lưu file upload
├── scripts/
│   └── seedSkills.js          # Script seed data
├── .env.local                 # Environment variables (tạo từ .env.local.example)
├── .env.local.example         # Template cho env file
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Tính Năng

### 1. Upload CV
- Hỗ trợ PDF và ảnh (JPG, PNG)
- Drag & drop hoặc click để upload
- Giới hạn 16MB
- Validate format file

### 2. Review CV
- AI phân tích CV theo các tiêu chí:
  - Tính đầy đủ (thông tin cá nhân, kinh nghiệm, kỹ năng)
  - Trình bày (chính tả, gọn gàng, chuyên nghiệp)
  - Nội dung (chất lượng thông tin)
- Hiển thị điểm số cho từng tiêu chí
- Đưa ra điểm mạnh và điểm yếu
- Gợi ý cải thiện cụ thể

### 3. Phân Tích Kỹ Năng
- So sánh kỹ năng hiện tại với kỹ năng cần thiết
- Hiển thị missing skills theo category
- Gợi ý khóa học cho từng kỹ năng
- Cho phép chọn nhiều skills để xem khóa học

### 4. Fix CV
- AI đề xuất bản CV đã được cải thiện
- Dựa trên các nhận xét và gợi ý từ phần review

## Customization

### Màu sắc
Chỉnh sửa trong [tailwind.config.ts](tailwind.config.ts):
- Primary colors: blue shades
- Accent colors: purple/pink shades

### Font chữ
Chỉnh sửa trong [src/app/layout.tsx](src/app/layout.tsx):
- Inter: body text
- Poppins: headings

### Animation Background
Chỉnh sửa trong [src/components/ParticlesBackground.tsx](src/components/ParticlesBackground.tsx) 
