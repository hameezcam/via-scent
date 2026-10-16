import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/admin/upload/route";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

test("Image Upload: Rejects empty form submission", async () => {
  const form = new FormData();
  const req = new NextRequest("http://localhost:3000/api/admin/upload", {
    method: "POST",
    body: form,
  });

  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, "No image file provided in form data.");
});

test("Image Upload: Rejects non-image file formats", async () => {
  const textBuffer = Buffer.from("Hello text file");
  const blob = new Blob([textBuffer], { type: "text/plain" });
  const form = new FormData();
  form.append("file", blob, "malicious.txt");

  const req = new NextRequest("http://localhost:3000/api/admin/upload", {
    method: "POST",
    body: form,
  });

  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /not a recognized image format/i);
});

test("Image Upload: Successfully uploads local image and provides accessible URL", async () => {
  // 1x1 transparent PNG pixel base64
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const sampleBuffer = Buffer.from(pngBase64, "base64");
  const blob = new Blob([sampleBuffer], { type: "image/png" });
  const form = new FormData();
  form.append("file", blob, "luxury-diffuser.png");

  const req = new NextRequest("http://localhost:3000/api/admin/upload", {
    method: "POST",
    body: form,
  });

  const res = await POST(req);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.success, true);
  assert.ok(data.url);
  assert.ok(Array.isArray(data.urls));
  assert.equal(data.urls.length, 1);

  // If saved to public/uploads, verify file exists on disk
  if (data.url.startsWith("/uploads/")) {
    const filename = data.url.replace("/uploads/", "");
    const diskPath = path.join(process.cwd(), "public", "uploads", filename);
    assert.ok(fs.existsSync(diskPath), `Expected uploaded file to exist at ${diskPath}`);
    // Cleanup test file
    try {
      fs.unlinkSync(diskPath);
    } catch {}
  } else {
    // Verified fallback data URL
    assert.ok(data.url.startsWith("data:image/png;base64,"));
  }
});

test("Image Upload: Supports multi-image batch uploads", async () => {
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(pngBase64, "base64");
  const blob1 = new Blob([buffer], { type: "image/png" });
  const blob2 = new Blob([buffer], { type: "image/png" });

  const form = new FormData();
  form.append("files", blob1, "photo-angle-1.png");
  form.append("files", blob2, "photo-angle-2.png");

  const req = new NextRequest("http://localhost:3000/api/admin/upload", {
    method: "POST",
    body: form,
  });

  const res = await POST(req);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.success, true);
  assert.equal(data.urls.length, 2);
  assert.equal(data.count, 2);

  // Cleanup test files
  for (const u of data.urls) {
    if (u.startsWith("/uploads/")) {
      const filename = u.replace("/uploads/", "");
      const diskPath = path.join(process.cwd(), "public", "uploads", filename);
      try {
        fs.unlinkSync(diskPath);
      } catch {}
    }
  }
});
