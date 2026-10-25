import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

// Maximum upload limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Support both single file ('file') and multiple files ('files')
    let rawFiles: File[] = [];
    const filesField = formData.getAll("files") as File[];
    const singleField = formData.get("file") as File | null;

    if (filesField && filesField.length > 0) {
      rawFiles = filesField.filter((f) => f && typeof f.arrayBuffer === "function");
    } else if (singleField && typeof singleField.arrayBuffer === "function") {
      rawFiles = [singleField];
    }

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { error: "No image file provided in form data." },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    // Ensure uploads directory exists if writable
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");

    for (const file of rawFiles) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a recognized image format.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 10MB size limit.` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      let destinationUrl: string | null = null;

      const ext = path.extname(file.name) || ".jpg";
      const sanitized = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 24);
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const filename = `${sanitized || "photo"}-${uniqueSuffix}${ext}`;

      // Attempt 1: Vercel Blob (durable CDN storage) when a Blob store is connected
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(`uploads/${filename}`, buffer, {
          access: "public",
          contentType: file.type || "image/jpeg",
        });
        destinationUrl = blob.url;
      }

      // Attempt 2: Save to public/uploads on the local/persistent filesystem
      if (!destinationUrl) {
        try {
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const filePath = path.join(uploadsDir, filename);

          await fs.promises.writeFile(filePath, buffer);
          destinationUrl = `/uploads/${filename}`;
        } catch (writeErr) {
          console.warn("Filesystem write unavailable (e.g. read-only serverless), falling back to Base64 data URL:", writeErr);
        }
      }

      // Attempt 3: If filesystem is read-only (e.g. Vercel serverless runtime), encode as high-fidelity Data URL
      if (!destinationUrl) {
        const mime = file.type || "image/jpeg";
        destinationUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      }

      uploadedUrls.push(destinationUrl);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process image upload.";
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
