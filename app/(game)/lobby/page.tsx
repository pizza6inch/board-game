"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRooms, createRoom, joinRoom } from "@/lib/hooks/useRoom";
import RoomCard from "@/components/lobby/RoomCard";
import CreateRoomModal from "@/components/lobby/CreateRoomModal";
import type { GameType, RoomSettings } from "@/lib/types/firestore";

export default function LobbyPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { rooms, loading } = useRooms(user?.uid);

  // Redirect to login when logged out
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (
    gameType: GameType,
    maxPlayers: 4 | 6,
    settings: RoomSettings
  ) => {
    if (!user) return;
    try {
      const roomId = await createRoom(
        user.uid,
        user.displayName ?? "Player",
        user.photoURL ?? "",
        gameType,
        maxPlayers,
        settings
      );
      setShowCreate(false);
      router.push(`/room/${roomId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "建立房間失敗");
    }
  };

  const handleJoin = async (roomId: string) => {
    if (!user) return;
    try {
      await joinRoom(roomId, user.uid, user.displayName ?? "Player", user.photoURL ?? "");
      router.push(`/room/${roomId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加入房間失敗");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#2d2d44] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🃏 BoardGame</h1>
        <div className="flex items-center gap-4">
          <span className="text-[#94a3b8] text-sm">
            {user?.displayName ?? user?.email}
          </span>
          <button
            onClick={logout}
            className="text-sm text-[#94a3b8] hover:text-white transition-colors"
          >
            登出
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">遊戲大廳</h2>
            <p className="text-[#94a3b8] text-sm mt-1">
              {rooms.length} 個等待中的房間
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-lg bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold transition-colors"
          >
            + 建立房間
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/20 border border-red-800/50 text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#6d28d9] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 text-[#94a3b8]">
            <p className="text-lg mb-2">目前沒有等待中的房間</p>
            <p className="text-sm">建立一個新房間開始遊戲！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={handleJoin}
                currentUid={user?.uid}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
