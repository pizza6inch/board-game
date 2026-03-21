import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import type { UserDoc, RoomDoc } from "@/lib/types/firestore";

export const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore(user: UserDoc): DocumentData {
    return user;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): UserDoc {
    return { id: snapshot.id, ...snapshot.data() } as UserDoc;
  },
};

export const roomConverter: FirestoreDataConverter<RoomDoc> = {
  toFirestore(room: RoomDoc): DocumentData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...data } = room;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): RoomDoc {
    return { id: snapshot.id, ...snapshot.data() } as RoomDoc;
  },
};
