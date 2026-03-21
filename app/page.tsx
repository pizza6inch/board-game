import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          🃏 BoardGame Online
        </h1>
        <p className="text-[#94a3b8] text-lg">
          線上多人桌遊平台 — 大老二 & 德州撲克
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold transition-colors"
        >
          開始遊戲
        </Link>
      </div>
    </main>
  );
}
