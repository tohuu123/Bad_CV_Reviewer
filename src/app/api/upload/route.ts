import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { fromPath } from "pdf2pic";

// Upload folder
const uploadDir = path.join(process.cwd(), "public", "uploads");

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();
    const savedPath = path.join(uploadDir, originalName);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(savedPath, buffer);

    let displayImage = originalName;

    // If PDF → convert using pdf2pic
    if (ext === ".pdf") {
      const pngName = originalName.replace(".pdf", ".png");
      const pngPath = path.join(uploadDir, pngName);

      try {
        const converter = fromPath(savedPath, {
          density: 150,
          format: "png",
          saveFilename: pngName.replace(".png", ""),
          savePath: uploadDir,
        });

        await converter(1); // page 1

        displayImage = pngName;
      } catch (e) {
        console.error("PDF conversion error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      displayImage,
      originalFile: originalName,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
