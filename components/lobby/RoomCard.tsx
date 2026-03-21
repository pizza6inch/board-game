import { RoomDoc } from "@/lib/types/firestore";
import { cn } from "@/lib/utils/cn";

const GAME_LABELS: Record<string, string> = {
  "big-two": "大老二",
  "texas-holdem": "德州撲克",
};

interface RoomCardProps {
  room: RoomDoc;
  onJoin: (roomId: string) => void;
  currentUid?: string;
}

export default function RoomCard({ room, onJoin, currentUid }: RoomCardProps) {
  const isFull = room.players.length >= room.maxPlayers;
  const isInRoom = room.players.some((p) => p.uid === currentUid);

  return (
    <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-5 flex flex-col gap-3 hover:border-[#6d28d9]/50 transition-colors">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#6d28d9]/20 text-[#a78bfa]">
          {GAME_LABELS[room.gameType] ?? room.gameType}
        </span>
        <span className={cn("text-sm font-medium", isFull ? "text-red-400" : "text-green-400")}>
          {room.players.length}/{room.maxPlayers} 人
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {room.players.map((p) => (
          <div key={p.uid} className="flex items-center gap-1.5">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatarUrl} alt={p.displayName} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#6d28d9] flex items-center justify-center text-xs text-white">
                {p.displayName[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm text-[#94a3b8]">{p.displayName}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onJoin(room.id)}
        disabled={isFull && !isInRoom}
        className={cn(
          "w-full py-2 rounded-lg text-sm font-semibold transition-colors mt-1",
          isInRoom
            ? "bg-[#2d2d44] text-[#94a3b8] hover:bg-[#3d3d5a] hover:text-white"
            : isFull
            ? "bg-[#2d2d44] text-[#4a5568] cursor-not-allowed"
            : "bg-[#6d28d9] hover:bg-[#5b21b6] text-white"
        )}
      >
        {isInRoom ? "返回房間" : isFull ? "已滿" : "加入"}
      </button>
    </div>
  );
}
