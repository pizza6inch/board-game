"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Suspense } from "react";

function DiscordCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithDiscordToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const err = searchParams.get("error");

    if (err) {
      setError(decodeURIComponent(err));
      return;
    }
    if (!token) {
      setError("缺少 token 參數");
      return;
    }

    signInWithDiscordToken(token)
      .then(() => router.push("/lobby"))
      .catch((e: Error) => setError(e.message));
  }, [searchParams, signInWithDiscordToken, router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 text-center max-w-md w-full border border-[#2d2d44]">
          <p className="text-red-400 mb-4">Discord 登入失敗：{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 rounded-lg bg-[#6d28d9] text-white"
          >
            返回登入頁
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#6d28d9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#94a3b8]">正在完成 Discord 登入...</p>
      </div>
    </main>
  );
}

export default function DiscordCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6d28d9] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <DiscordCallbackInner />
    </Suspense>
  );
}
