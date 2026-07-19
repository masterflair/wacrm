import { ImageResponse } from "next/og";

// Replaces the default Next.js favicon with the brand mark.
// This route can generate multiple PNG sizes for browser icons and
// home-screen install assets.

export const runtime = "edge";
export const contentType = "image/png";

export default function Icon(request: Request) {
  const url = new URL(request.url);
  const sizeQuery = Number(url.searchParams.get("size") ?? "32");
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
          background: "#7c3aed",
          borderRadius: 6,
        }}
      >
        <svg
          width={Math.round(size * 0.625)}
          height={Math.round(size * 0.625)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth={Math.max(2, Math.round(size / 24))}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
