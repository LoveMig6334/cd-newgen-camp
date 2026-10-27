// Host page ⇄ audience display.
//
// Two transports run side by side and carry the same messages:
// - BroadcastChannel: tabs/windows of the same browser (e.g. a laptop with
//   the projector as a second screen). Instant, no server.
// - Supabase Realtime Broadcast on `chaser:<room>`: any device (a phone, a
//   second laptop driving the projector). Only used when a room code is set.
// The display never receives the answers (`toDisplayState()`), so a public
// broadcast channel keyed by a random room code is enough here.
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { DisplayState } from "@/lib/chaser";
import { createClient } from "@/lib/supabase/client";

export const DISPLAY_PATH = "/admin/chaser/display";
/** A display that hasn't pinged for this long counts as closed. */
export const DISPLAY_TIMEOUT_MS = 5000;
export const DISPLAY_PING_MS = 2000;
/** Over the network, clock-only updates are sent at most this often (the clock shows whole seconds). */
const REMOTE_STATE_GAP_MS = 200;

export type SyncMessage =
  | { type: "state"; state: DisplayState }
  /** Display opened: host replies with the current state. */
  | { type: "hello" }
  /** Display heartbeat; `sound` = it plays the effects, so the host stays quiet. */
  | { type: "ping"; sound: boolean }
  /** Either side closing. */
  | { type: "bye" };

// ---- room codes ----
const ROOM_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
export const ROOM_LENGTH = 6;

export function newRoomCode(): string {
  const bytes = new Uint8Array(ROOM_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ROOM_ALPHABET[b % ROOM_ALPHABET.length]).join("");
}

/** Normalise user input ("abc 123" → "ABC123"); null when it can't be a room code. */
export function cleanRoomCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length === ROOM_LENGTH && [...code].every((c) => ROOM_ALPHABET.includes(c)) ? code : null;
}

export const displayUrl = (room: string, origin = "") => `${origin}${DISPLAY_PATH}?room=${room}`;

export type RemoteStatus = "off" | "connecting" | "online" | "error";

interface SyncOptions {
  /** Room code for cross-device sync; null = this browser only. */
  room: string | null;
  onMessage: (msg: SyncMessage) => void;
  /** Network link status; "online" fires again after every reconnect. */
  onRemote?: (status: RemoteStatus) => void;
}

export function openSync({ room, onMessage, onRemote }: SyncOptions) {
  // The same browser can hear a message on both transports; drop repeats of a state.
  let lastState = "";
  const receive = (msg: SyncMessage) => {
    if (msg?.type === "state") {
      const json = JSON.stringify(msg.state);
      if (json === lastState) return;
      lastState = json;
    }
    onMessage(msg);
  };

  // ---- same browser ----
  let local: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    local = new BroadcastChannel("chaser-display");
    local.onmessage = (e: MessageEvent<SyncMessage>) => receive(e.data);
  }

  // ---- other devices ----
  let remote: RealtimeChannel | null = null;
  let joined = false;
  let closed = false;
  /** Latest message of each type sent before the channel joined; flushed on join. */
  const queued = new Map<SyncMessage["type"], SyncMessage>();
  let pendingState: SyncMessage | null = null;
  let lastStateSent = 0;
  let stateTimer: ReturnType<typeof setTimeout> | null = null;

  const rawSend = (msg: SyncMessage) => {
    if (!remote || closed) return;
    if (!joined) {
      queued.set(msg.type, msg);
      return;
    }
    void remote.send({ type: "broadcast", event: "sync", payload: msg });
  };

  const sendRemote = (msg: SyncMessage) => {
    if (msg.type !== "state") return rawSend(msg);
    pendingState = msg;
    if (stateTimer) return;
    const wait = REMOTE_STATE_GAP_MS - (Date.now() - lastStateSent);
    const flush = () => {
      stateTimer = null;
      if (!pendingState) return;
      lastStateSent = Date.now();
      rawSend(pendingState);
      pendingState = null;
    };
    if (wait <= 0) flush();
    else stateTimer = setTimeout(flush, wait);
  };

  const supabase = room ? createClient() : null;
  if (supabase && room) {
    onRemote?.("connecting");
    remote = supabase.channel(`chaser:${room}`, { config: { broadcast: { self: false, ack: false } } });
    remote.on("broadcast", { event: "sync" }, ({ payload }) => receive(payload as SyncMessage));
    remote.subscribe((status) => {
      if (closed) return;
      if (status === "SUBSCRIBED") {
        joined = true;
        for (const msg of queued.values()) void remote?.send({ type: "broadcast", event: "sync", payload: msg });
        queued.clear();
        onRemote?.("online");
      } else {
        joined = false;
        onRemote?.(status === "CLOSED" ? "off" : "error");
      }
    });
  }

  return {
    /** Network link in use (for status UI). */
    remote: Boolean(room),
    post: (msg: SyncMessage) => {
      local?.postMessage(msg);
      sendRemote(msg);
    },
    close: () => {
      if (stateTimer) clearTimeout(stateTimer);
      local?.close();
      closed = true;
      // Leaving the channel after the final "bye" was pushed onto the socket.
      if (supabase && remote) void supabase.removeChannel(remote);
    },
  };
}
