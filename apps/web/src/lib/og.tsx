import { ImageResponse } from "next/og";

/* Shared renderer for the Open Graph / Twitter card. Rendered to PNG by
   Satori at build time — no binary asset needed, on-brand navy + cyan. */

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = "Aether — AI automation, websites and growth.";
export const ogContentType = "image/png";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#04060c",
          color: "#eaf0fb",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 22% 18%, rgba(63,220,255,0.30), transparent 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 88% 92%, rgba(139,108,255,0.26), transparent 55%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg width="46" height="46" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 2 25 24H3L14 2Z"
                stroke="#3fdcff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M14 9.5 19.5 21H8.5L14 9.5Z" fill="#3fdcff" />
            </svg>
            <span
              style={{
                marginLeft: "18px",
                fontSize: "34px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Aether
            </span>
          </div>
          <span
            style={{
              fontSize: "20px",
              letterSpacing: "0.24em",
              color: "#3fdcff",
              textTransform: "uppercase",
            }}
          >
            Automation · Web · Growth
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            We put AI to work
            <span style={{ color: "#3fdcff", marginLeft: "20px" }}>
              for your business.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            fontSize: "24px",
          }}
        >
          <span style={{ color: "#98a7c6" }}>
            AI automation, websites and growth.
          </span>
          <span style={{ color: "#5a688a" }}>webnew-five.vercel.app</span>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
