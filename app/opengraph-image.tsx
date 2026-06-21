import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BloodConnect - Donor Darah Darurat";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #f8fafc, #fee2e2)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "30px", marginBottom: "40px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="#e11d48"
            stroke="#e11d48"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <div style={{ fontSize: 100, fontWeight: 900, color: "#0f172a" }}>
            BloodConnect
          </div>
        </div>
        <div style={{ fontSize: 40, color: "#475569", fontWeight: 600, textAlign: "center" }}>
          Sistem Pendonor Darah Darurat Cerdas
        </div>
        <div style={{ fontSize: 24, color: "#94a3b8", fontWeight: 500, textAlign: "center", marginTop: "20px" }}>
          Temukan & Bantu Mereka yang Membutuhkan Darah Saat Ini Juga
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
