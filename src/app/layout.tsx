import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Everiitimer — Scalable timers for focus, fitness, and flow",
  description:
    "15+ timer presets (Pomodoro, Tabata, EMOM, Flowtime, Visual Timer…) plus AI-generated custom timers via Google Gemini.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
