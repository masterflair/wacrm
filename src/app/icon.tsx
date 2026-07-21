import { ImageResponse } from "next/og";

// Replaces the default Next.js favicon with the brand mark.
// This route can generate multiple PNG sizes for browser icons and
// home-screen install assets.

export const runtime = "edge";
export const contentType = "image/png";

export default function Icon(request: Request) {
  let sizeQuery = 32;
  try {
    const url = new URL(request.url, "http://localhost:3000");
    sizeQuery = Number(url.searchParams.get("size") ?? "32");
  } catch (e) {
    // Keep default sizeQuery = 32
  }
  const size = Number.isInteger(sizeQuery) && sizeQuery > 0 ? sizeQuery : 32;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000000 0%, #1e1b4b 100%)",
          borderRadius: 8,
          border: "2px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            color: "#eab308", // Golden text color for RenderAura
            fontSize: Math.round(size * 0.7),
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          R
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
