"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/review?img=${data.displayImage}&file=${data.originalFile}`);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi upload file.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 space-y-6">

        <h1 className="text-3xl font-semibold text-center bg-gradient-to-r from-primary-600 to-accent-600 text-transparent bg-clip-text">
          Upload CV
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-center">
          Tải lên CV của bạn dưới dạng PDF hoặc hình ảnh để bắt đầu review.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg"
          />

          <button
            disabled={!file || uploading}
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:opacity-90 transition disabled:opacity-50"
          >
            {uploading ? "Đang upload..." : "Upload CV"}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="w-full py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-300 border hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Quay lại Home
        </button>

      </div>
    </main>
  );
}
