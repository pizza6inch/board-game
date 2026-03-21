"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { roomConverter } from "@/lib/firebase/converters";
import type { RoomDoc, GameType, RoomSettings } from "@/lib/types/firestore";

export function useRooms(uid: string | undefined) {
  const [rooms, setRooms] = useState<RoomDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't start listening until user is authenticated
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "rooms").withConverter(roomConverter),
      where("status", "==", "waiting"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((d) => d.data()));
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { rooms, loading };
}

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "rooms", roomId).withConverter(roomConverter),
      (snap) => {
        setRoom(snap.exists() ? snap.data() : null);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [roomId]);

  return { room, loading };
}

export async function createRoom(
  hostUid: string,
  displayName: string,
  avatarUrl: string,
  gameType: GameType,
  maxPlayers: 4 | 6,
  settings: RoomSettings
): Promise<string> {
  const ref = await addDoc(collection(db, "rooms"), {
    hostUid,
    gameType,
    status: "waiting",
    maxPlayers,
    players: [{ uid: hostUid, displayName, avatarUrl, seatIndex: 0 }],
    settings,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function joinRoom(
  roomId: string,
  uid: string,
  displayName: string,
  avatarUrl: string
): Promise<void> {
  const roomRef = doc(db, "rooms", roomId).withConverter(roomConverter);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) throw new Error("房間不存在");

  const room = snap.data();
  if (room.status !== "waiting") throw new Error("遊戲已開始");
  if (room.players.length >= room.maxPlayers) throw new Error("房間已滿");
  if (room.players.some((p) => p.uid === uid)) return; // already in room

  const seatIndex = room.players.length;
  await updateDoc(roomRef, {
    players: arrayUnion({ uid, displayName, avatarUrl, seatIndex }),
  });
}
