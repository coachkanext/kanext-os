/**
 * Global Message Filters
 * Stores filter state set by the side panel. Messages screen subscribes
 * and filters its list in real-time. Filters persist while panel is dismissed.
 */

export type MessageFilterKey = 'unread' | 'mentions' | 'pinned' | 'dms_only' | 'channels_only';

type Filters = Record<MessageFilterKey, boolean>;
type Listener = (filters: Filters) => void;

const _filters: Filters = {
  unread: false,
  mentions: false,
  pinned: false,
  dms_only: false,
  channels_only: false,
};

const _listeners = new Set<Listener>();

export function setMessageFilter(key: MessageFilterKey, value: boolean) {
  _filters[key] = value;
  _listeners.forEach((cb) => cb({ ..._filters }));
}

export function getMessageFilters(): Filters {
  return { ..._filters };
}

export function subscribeMessageFilters(cb: Listener): () => void {
  _listeners.add(cb);
  return () => { _listeners.delete(cb); };
}
