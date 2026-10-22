// Host page ⇄ audience display, same browser (e.g. a laptop with the
// projector as a second screen). BroadcastChannel only reaches tabs/windows
// of the same origin and browser profile — no server involved.
import type { DisplayState } from "@/lib/chaser";

export const DISPLAY_PATH = "/admin/chaser/display";
/** A display that hasn't pinged for this long counts as closed. */
export const DISPLAY_TIMEOUT_MS = 5000;
export const DISPLAY_PING_MS = 2000;

export type SyncMessage =
  | { type: "state"; state: DisplayState }
  /** Display opened: host replies with the current state. */
  | { type: "hello" }
  /** Display heartbeat; `sound` = it plays the effects, so the host stays quiet. */
  | { type: "ping"; sound: boolean }
  /** Either side closing. */
  | { type: "bye" };

export function openSync(onMessage: (msg: SyncMessage) => void) {
  if (typeof BroadcastChannel === "undefined") return null;
  const channel = new BroadcastChannel("chaser-display");
  channel.onmessage = (e: MessageEvent<SyncMessage>) => onMessage(e.data);
  return {
    post: (msg: SyncMessage) => channel.postMessage(msg),
    close: () => channel.close(),
  };
}
