export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 animate-fade-in">

        {/* Title */}
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 text-transparent bg-clip-text">
          Bad CV Reviewer
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Công cụ phân tích & đánh giá CV tự động dựa trên AI.  
          Tải lên CV của bạn và hệ thống sẽ phân tích chi tiết về nội dung – trình bày – tính đầy đủ.
        </p>

        {/* Action Button */}
        <a
          href="/upload"
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-primary-600 to-accent-600 hover:opacity-90 transition shadow-lg"
        >
          Upload CV ngay
        </a>

      </div>
    </main>
  );
}
