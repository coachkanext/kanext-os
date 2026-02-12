/**
 * Global Team Profile Sheet Controller
 * Simple module-level state to control the team sheet from anywhere.
 */

let _openSheet: (() => void) | null = null;
let _closeSheet: (() => void) | null = null;

export function registerTeamSheetHandlers(open: () => void, close: () => void) {
  _openSheet = open;
  _closeSheet = close;
}

export function openTeamSheet() {
  _openSheet?.();
}

export function closeTeamSheet() {
  _closeSheet?.();
}
