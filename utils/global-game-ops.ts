/**
 * Global Game Ops Signal
 * Allows game-detail (outside NexusProvider) to trigger a Game Ops
 * conversation in the Nexus tab. Same pattern as global-drawer.ts.
 *
 * Buffers the request if Nexus hasn't mounted yet so it can be
 * consumed when the handler registers.
 */

let _handler: ((gameId: string, opponent: string) => void) | null = null;
let _pending: { gameId: string; opponent: string } | null = null;

export function registerGameOpsHandler(cb: typeof _handler) {
  _handler = cb;
  // If there's a buffered request and a handler just registered, fire it now
  if (cb && _pending) {
    cb(_pending.gameId, _pending.opponent);
    _pending = null;
  }
}

export function triggerGameOps(gameId: string, opponent: string) {
  if (_handler) {
    _handler(gameId, opponent);
  } else {
    // Buffer for when Nexus mounts and registers the handler
    _pending = { gameId, opponent };
  }
}
