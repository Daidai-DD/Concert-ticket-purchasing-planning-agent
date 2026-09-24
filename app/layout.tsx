import type { Metadata } from "next";
import "./globals.css";
import "./v03.css";

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  appleWebApp: {capable: true, title: 'ENCORE'},
  title: "ENCORE · 全球演唱会规划智能体",
  description: "从一场现场开始，规划你的演出、票档、行程与酒店。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};
export const viewport = {width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f7f3f0'};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
