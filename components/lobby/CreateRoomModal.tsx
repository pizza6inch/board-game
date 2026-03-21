"use client";

import { useState } from "react";
import { GameType, RoomSettings } from "@/lib/types/firestore";
import { cn } from "@/lib/utils/cn";

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (
    gameType: GameType,
    maxPlayers: 4 | 6,
    settings: RoomSettings
  ) => Promise<void>;
}

export default function CreateRoomModal({ onClose, onCreate }: CreateRoomModalProps) {
  const [gameType, setGameType] = useState<GameType>("big-two");
  const [loading, setLoading] = useState(false);

  // Big Two settings
  const [scoreLimit, setScoreLimit] = useState(10);

  // Texas Hold'em settings
  const [startingChips, setStartingChips] = useState(1000);
  const [smallBlind, setSmallBlind] = useState(10);

  const maxPlayers: 4 | 6 = gameType === "big-two" ? 4 : 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const settings: RoomSettings =
      gameType === "big-two"
        ? { bigTwo: { scoreLimit } }
        : { texasHoldem: { startingChips, blinds: { small: smallBlind, big: smallBlind * 2 } } };
    try {
      await onCreate(gameType, maxPlayers, settings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-md border border-[#2d2d44] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">建立房間</h2>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Game type */}
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              遊戲類型
            </label>
            <div className="flex rounded-lg bg-[#0f0f1a] p-1">
              {(["big-two", "texas-holdem"] as GameType[]).map((gt) => (
                <button
                  key={gt}
                  type="button"
                  onClick={() => setGameType(gt)}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
                    gameType === gt
                      ? "bg-[#6d28d9] text-white"
                      : "text-[#94a3b8] hover:text-white"
                  )}
                >
                  {gt === "big-two" ? "大老二" : "德州撲克"}
                </button>
              ))}
            </div>
            <p className="text-[#94a3b8] text-xs mt-1">
              最多 {maxPlayers} 位玩家
            </p>
          </div>

          {/* Game-specific settings */}
          {gameType === "big-two" ? (
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">
                分數上限
              </label>
              <input
                type="number"
                value={scoreLimit}
                onChange={(e) => setScoreLimit(Number(e.target.value))}
                min={5}
                max={50}
                className="w-full px-4 py-2 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white focus:outline-none focus:border-[#6d28d9]"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">
                  起始籌碼
                </label>
                <input
                  type="number"
                  value={startingChips}
                  onChange={(e) => setStartingChips(Number(e.target.value))}
                  min={100}
                  step={100}
                  className="w-full px-4 py-2 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white focus:outline-none focus:border-[#6d28d9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">
                  小盲注
                </label>
                <input
                  type="number"
                  value={smallBlind}
                  onChange={(e) => setSmallBlind(Number(e.target.value))}
                  min={5}
                  step={5}
                  className="w-full px-4 py-2 rounded-lg bg-[#0f0f1a] border border-[#2d2d44] text-white focus:outline-none focus:border-[#6d28d9]"
                />
                <p className="text-[#94a3b8] text-xs mt-1">
                  大盲注：{smallBlind * 2}
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[#2d2d44] text-[#94a3b8] hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "建立中..." : "建立房間"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
