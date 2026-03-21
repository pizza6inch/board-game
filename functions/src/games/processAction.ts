import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getDatabase } from "firebase-admin/database";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

/**
 * Callable Cloud Function — the authoritative game action handler.
 * All game state mutations go through here.
 *
 * Phase 2: Big Two support
 * Phase 3: Texas Hold'em support (TODO)
 */
export const gameAction = onCall(
  { region: "asia-east1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Must be signed in");

    const { roomId, action } = request.data as {
      roomId: string;
      action: GameAction;
    };
    if (!roomId || !action)
      throw new HttpsError("invalid-argument", "roomId and action are required");

    const db = getDatabase();
    const stateRef = db.ref(`gameState/${roomId}`);
    const snapshot = await stateRef.once("value");
    const state = snapshot.val() as GameState | null;

    if (!state) throw new HttpsError("not-found", "Game state not found");

    // Verify it's this player's turn
    if (state.meta.currentPlayerUid !== uid) {
      throw new HttpsError("failed-precondition", "Not your turn");
    }

    let newState: GameState;
    let isGameOver = false;

    if (state.meta.gameType === "big-two") {
      const result = applyBigTwoAction(state, action, uid);
      if (result.error) throw new HttpsError("invalid-argument", result.error);
      newState = result.newState;
      isGameOver = result.isGameOver;
    } else {
      // Texas Hold'em — Phase 3
      throw new HttpsError("unimplemented", "Texas Hold'em coming in Phase 3");
    }

    await stateRef.set(newState);

    if (isGameOver) {
      const firestore = getFirestore();
      await firestore.doc(`gameResults/${roomId}`).set({
        gameType: state.meta.gameType,
        players: Object.entries(newState.bigTwo?.scores ?? {}).map(
          ([playerUid, score], i) => ({ uid: playerUid, finalScore: score, placement: i + 1 })
        ),
        finishedAt: FieldValue.serverTimestamp(),
      });
      await firestore.doc(`rooms/${roomId}`).update({
        status: "finished",
        finishedAt: FieldValue.serverTimestamp(),
      });
    }

    return { success: true };
  }
);

// ---- Minimal type stubs (full implementation in Phase 2) ----

interface GameMeta {
  gameType: "big-two" | "texas-holdem";
  currentPlayerUid: string;
  currentPhase: string;
  turnStartedAt: number;
  turnTimeoutSeconds: number;
}

interface GameState {
  meta: GameMeta;
  bigTwo?: BigTwoState;
}

interface BigTwoState {
  hands: Record<string, { cards: Card[] }>;
  currentPile: Card[];
  pileType: string;
  passCount: number;
  scores: Record<string, number>;
  roundNumber: number;
}

interface Card {
  suit: "D" | "C" | "H" | "S";
  rank: string;
}

interface GameAction {
  type: "play" | "pass";
  cards?: Card[];
}

interface ActionResult {
  newState: GameState;
  isGameOver: boolean;
  error?: string;
}

function applyBigTwoAction(
  state: GameState,
  action: GameAction,
  uid: string
): ActionResult {
  // Stub — full implementation in Phase 2 game engine
  // This will be replaced by: bigTwoEngine.applyAction(state, action, uid)
  void uid;
  return {
    newState: state,
    isGameOver: false,
    error: "Big Two engine not yet implemented",
  };
}
