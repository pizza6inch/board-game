import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "BoardGame Online",
  description: "線上多人桌遊平台 — Big Two & Texas Hold'em",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-[#0f0f1a] text-[#e2e8f0] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
