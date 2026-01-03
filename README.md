# Bad CV Reviewer - Frontend

Modern Next.js frontend với UI đẹp mắt cho ứng dụng Bad CV Reviewer.

## Tech Stack

- **Framework**: Next.js 14 (React)
- **CSS**: Tailwind CSS
- **Animation**: tsParticles (animated background)
- **Icons**: Heroicons + Lucide React
- **Fonts**: Inter (primary), Poppins (headings)
- **Language**: TypeScript

## Getting Started

### 1. Cài đặt dependencies

```bash
cd src
npm install
```

### 2. Cấu hình Backend

Đảm bảo Flask backend đang chạy tại `http://127.0.0.1:5000`

### 3. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### 4. Build production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Trang upload
│   │   ├── review/
│   │   │   └── page.tsx       # Trang review/fix
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ParticlesBackground.tsx
│   └── lib/
│       └── utils.ts           # Utility functions
├── public/                     # Static assets
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Features

### Trang Upload
- Drag & drop upload
- File validation (PDF, JPG, PNG, max 16MB)
- Animated background với tsParticles
- Responsive design
- Dark mode support

### Trang Review
- CV preview
- Comprehensive analysis display
- Score visualization với progress bars
- Color-coded scores (green/yellow/red)
- Strengths & weaknesses sections
- Action recommendations
- Loading states & error handling

## API Integration

Frontend proxy các request đến Flask backend:
- `/api/flask/*` → `http://127.0.0.1:5000/*`

Cấu hình trong `next.config.mjs`.

## Customization

### Colors
Chỉnh trong `tailwind.config.ts`:
- Primary colors: blue shades
- Accent colors: purple/pink shades

### Fonts
Chỉnh trong `src/app/layout.tsx`:
- Inter (body text)
- Poppins (headings)

### Particles
Chỉnh trong `src/components/ParticlesBackground.tsx`
