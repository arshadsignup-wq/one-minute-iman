import { ImageResponse } from "next/og";

export const alt = "One Minute Iman · a verified duʿā for what you're carrying";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "80px 90px",
          background: "linear-gradient(160deg, #FCFAF4 0%, #F4F0E4 100%)",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#0B5730", textTransform: "uppercase" }}>
          One Minute Iman
        </div>
        <div style={{ fontSize: 82, color: "#1A1A17", marginTop: 34, lineHeight: 1.05 }}>
          Tell it how you feel.
        </div>
        <div style={{ fontSize: 31, color: "#4A4A42", marginTop: 30, maxWidth: 900, lineHeight: 1.4 }}>
          A duʿā, verse or hadith for that moment — each one traced to its source
          and shown with its authenticity grading.
        </div>
        <div style={{ display: "flex", marginTop: 46, gap: 18, alignItems: "center" }}>
          <div style={{ width: 54, height: 3, background: "#9C7420" }} />
          <div style={{ fontSize: 24, color: "#9C7420" }}>oneminuteiman.xyz</div>
        </div>
      </div>
    ),
    size,
  );
}
