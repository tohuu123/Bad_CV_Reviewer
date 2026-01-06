"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name || !email) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setUploading(true);

    const form = new FormData();
    form.append("image", file);
    form.append("name", name);
    form.append("email", email);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/review?img=${data.displayImage}&file=${data.originalFile}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CV của bạn <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg"
            />
          </div>

          <button
            disabled={!file || !name || !email || uploading}
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
