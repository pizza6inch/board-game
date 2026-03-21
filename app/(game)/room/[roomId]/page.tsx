"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRoom } from "@/lib/hooks/useRoom";

const GAME_LABELS: Record<string, string> = {
  "big-two": "大老二",
  "texas-holdem": "德州撲克",
};

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { room, loading } = useRoom(roomId);

  // Redirect when game starts
  useEffect(() => {
    if (room?.status === "in-progress") {
      router.push(`/game/${roomId}`);
    }
  }, [room?.status, roomId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6d28d9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#94a3b8] mb-4">房間不存在</p>
          <button
            onClick={() => router.push("/lobby")}
            className="px-4 py-2 rounded-lg bg-[#6d28d9] text-white"
          >
            返回大廳
          </button>
        </div>
      </div>
    );
  }

  const isHost = user?.uid === room.hostUid;
  const canStart = isHost && room.players.length >= 2;

  const handleStart = async () => {
    await updateDoc(doc(db, "rooms", roomId), {
      status: "in-progress",
      startedAt: serverTimestamp(),
    });
  };

  const handleLeave = () => {
    router.push("/lobby");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#2d2d44] px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="text-[#94a3b8] hover:text-white transition-colors flex items-center gap-2"
        >
          ← 大廳
        </button>
        <h1 className="text-xl font-bold">等待室</h1>
        <div className="w-16" />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-[#2d2d44] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{GAME_LABELS[room.gameType]}</h2>
              <p className="text-[#94a3b8] text-sm">
                {room.players.length} / {room.maxPlayers} 位玩家
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900/30 text-yellow-400">
              等待中
            </span>
          </div>

          {/* Player seats */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: room.maxPlayers }).map((_, i) => {
              const player = room.players.find((p) => p.seatIndex === i);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#0f0f1a] border border-[#2d2d44]"
                >
                  {player ? (
                    <>
                      {player.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={player.avatarUrl}
                          alt={player.displayName}
                          className="w-9 h-9 rounded-full"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#6d28d9] flex items-center justify-center text-sm text-white font-bold">
                          {player.displayName[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{player.displayName}</p>
                        {player.uid === room.hostUid && (
                          <p className="text-xs text-[#6d28d9]">房主</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#2d2d44]" />
                      <span className="text-[#4a5568] text-sm">等待玩家...</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings summary */}
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2d2d44] mb-6 text-sm">
          <h3 className="font-semibold mb-3 text-[#94a3b8] uppercase tracking-wider text-xs">
            遊戲設定
          </h3>
          {room.gameType === "big-two" && room.settings.bigTwo && (
            <p className="text-[#94a3b8]">
              分數上限：<span className="text-white">{room.settings.bigTwo.scoreLimit}</span>
            </p>
          )}
          {room.gameType === "texas-holdem" && room.settings.texasHoldem && (
            <>
              <p className="text-[#94a3b8]">
                起始籌碼：<span className="text-white">{room.settings.texasHoldem.startingChips}</span>
              </p>
              <p className="text-[#94a3b8]">
                盲注：<span className="text-white">
                  {room.settings.texasHoldem.blinds.small} / {room.settings.texasHoldem.blinds.big}
                </span>
              </p>
            </>
          )}
        </div>

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full py-3 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canStart ? "開始遊戲" : `至少需要 2 位玩家 (目前 ${room.players.length})`}
          </button>
        ) : (
          <p className="text-center text-[#94a3b8]">等待房主開始遊戲...</p>
        )}
      </main>
    </div>
  );
}
