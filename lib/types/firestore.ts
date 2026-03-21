import { Timestamp } from "firebase/firestore";

export interface UserDoc {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  provider: "google" | "discord" | "password";
  discordId?: string;
  stats: {
    bigTwo: { wins: number; losses: number; gamesPlayed: number };
    texasHoldem: { wins: number; losses: number; chipsWon: number };
  };
  createdAt: Timestamp;
  lastSeenAt: Timestamp;
}

export type GameType = "big-two" | "texas-holdem";
export type RoomStatus = "waiting" | "in-progress" | "finished";

export interface RoomPlayer {
  uid: string;
  displayName: string;
  avatarUrl: string;
  seatIndex: number;
}

export interface RoomSettings {
  texasHoldem?: {
    startingChips: number;
    blinds: { small: number; big: number };
  };
  bigTwo?: {
    scoreLimit: number;
  };
}

export interface RoomDoc {
  id: string;
  hostUid: string;
  gameType: GameType;
  status: RoomStatus;
  maxPlayers: 4 | 6;
  players: RoomPlayer[];
  settings: RoomSettings;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  finishedAt?: Timestamp;
  winnerId?: string;
}

export interface GameResultDoc {
  id: string;
  gameType: GameType;
  players: Array<{ uid: string; finalScore: number; placement: number }>;
  duration: number;
  finishedAt: Timestamp;
}
