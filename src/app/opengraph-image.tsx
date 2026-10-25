import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Default share preview for WhatsApp, Instagram, Facebook and search results
export const alt = "VIA Scent: luxury home fragrance and scenting in Sri Lanka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/images/via-scent-logo-white.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#151412",
          color: "#F8F6F1",
          gap: 40,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={541} height={145} alt="" />
        <div style={{ fontSize: 34, letterSpacing: 6, textTransform: "uppercase", color: "#B49A70" }}>
          Luxury Home Fragrance · Sri Lanka
        </div>
      </div>
    ),
    size
  );
}
