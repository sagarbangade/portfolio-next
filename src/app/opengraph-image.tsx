import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

export const alt = `${profile.name}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0a0b",
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(255,90,31,0.35), transparent 55%)",
          color: "#ededef",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a1a1aa" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#3ddc84" }} />
          Full Stack Software Engineer · Bengaluru, India
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 108, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Sagar Eknath</div>
          <div style={{ fontSize: 108, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05, color: "#ff5a1f" }}>Bangade.</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: "#a1a1aa" }}>
            React · Next.js · TypeScript · Node.js · Python · AWS
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 24, color: "#71717a" }}>
          <span>1,100+ AWS Lambdas</span>
          <span>React 16 → 19</span>
          <span>Micro-frontends</span>
          <span>RAG / LLM</span>
        </div>
      </div>
    ),
    size,
  );
}
