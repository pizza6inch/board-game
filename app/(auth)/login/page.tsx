"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect to lobby once auth resolves (handles Google redirect-back)
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/lobby");
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // onAuthStateChanged fires → user state updates → useEffect redirects
    } catch (e) {
      setError(getErrorMessage(e));
      setLoading(false);
    }
  };

  const handleDiscordSignIn = () => {
    window.location.href = "/api/auth/discord";
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setError("請輸入顯示名稱");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
      }
      // Don't push here — useEffect watches `user` and redirects
      // after AuthProvider has set the __session cookie
    } catch (e) {
      setError(getErrorMessage(e));
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🃏 BoardGame</h1>
          <p className="text-[#94a3b8]">線上多人桌遊平台</p>
        </div>

        <div className="bg-[#1a1a2e] rounded-2xl p-8 shadow-xl border border-[#2d2d44]">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-[#0f0f1a] p-1 mb-6">
            <button
              onClick={() => { setMode("signin"); setError(null); }}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
                mode === "signin"
                  ? "bg-[#6d28d9] text-white"
                  : "text-[#94a3b8] hover:text-white"
              )}
            >
              登入
            </button>
            <button
              onClick={() => { setMode("signup"); setError(null); }}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
                mode === "signup"
                  ? "bg-[#6d28d9] text-white"
                  : "text-[#94a3b8] hover:text-white"
              )}
            >
              註冊
            </button>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              使用 Google 登入
            </button>
            <button
              onClick={handleDiscordSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-[#5865F2] text-white font-medium hover:bg-[#4752C4] transition-colors disabled:opacity-50"
            >
              <DiscordIcon />
              使用 Discord 登入
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#2d2d44]" />
            <span className="text-[#94a3b8] text-sm">或</span>
            <div className="flex-1 h-px bg-[#2d2d44]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">
                  顯示名稱
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="你的遊戲名稱"
                  className="w-full px-4 py-3 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white placeholder-[#4a5568] focus:outline-none focus:border-[#6d28d9] transition-colors"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white placeholder-[#4a5568] focus:outline-none focus:border-[#6d28d9] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white placeholder-[#4a5568] focus:outline-none focus:border-[#6d28d9] transition-colors"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-lg border border-red-800/50">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "處理中..." : mode === "signin" ? "登入" : "建立帳號"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const code = (e as { code?: string }).code;
    const messages: Record<string, string> = {
      "auth/user-not-found": "找不到此帳號",
      "auth/wrong-password": "密碼錯誤",
      "auth/email-already-in-use": "此 Email 已被使用",
      "auth/weak-password": "密碼至少需要 6 個字元",
      "auth/invalid-email": "Email 格式不正確",
      "auth/popup-closed-by-user": "登入視窗已關閉",
    };
    return (code && messages[code]) ?? e.message;
  }
  return "發生錯誤，請再試一次";
}
