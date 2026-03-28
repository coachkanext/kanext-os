/**
 * Nexus Chat Storage
 *
 * AsyncStorage CRUD for chat history and projects.
 * Maintains a lightweight index (metadata only) for fast list rendering,
 * and stores full messages per-chat in separate keys.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NexusMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
}

export interface NexusChat {
  id: string;
  title: string;
  messages: NexusMessage[];
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  starred?: boolean;
}

/** Lightweight metadata used in the sidebar list */
export interface NexusChatMeta {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  starred?: boolean;
  lastMessagePreview?: string;
  lastMessageRole?: 'user' | 'assistant';
}

export interface NexusProject {
  id: string;
  name: string;
  chatIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Storage Keys ──────────────────────────────────────────────────────────────

const KEY_INDEX    = 'nexus_chats_index';   // NexusChatMeta[]
const KEY_PROJECTS = 'nexus_projects';      // NexusProject[]
const chatKey      = (id: string) => `nexus_chat_${id}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[NexusStorage] write failed:', key, e);
  }
}

// ── Index helpers ─────────────────────────────────────────────────────────────

async function readIndex(): Promise<NexusChatMeta[]> {
  return readJSON<NexusChatMeta[]>(KEY_INDEX, []);
}

async function writeIndex(index: NexusChatMeta[]): Promise<void> {
  return writeJSON(KEY_INDEX, index);
}

function buildMeta(chat: NexusChat): NexusChatMeta {
  const lastMsg = chat.messages.length > 0
    ? chat.messages[chat.messages.length - 1]
    : null;
  return {
    id:                  chat.id,
    title:               chat.title,
    createdAt:           chat.createdAt,
    updatedAt:           chat.updatedAt,
    projectId:           chat.projectId,
    starred:             chat.starred,
    lastMessagePreview:  lastMsg
      ? lastMsg.content.replace(/```[\s\S]*?```/g, '[code]').replace(/\n/g, ' ').slice(0, 100)
      : undefined,
    lastMessageRole:     lastMsg?.role,
  };
}

// ── Chat CRUD ─────────────────────────────────────────────────────────────────

/** Save (create or update) a full chat. Updates the index. */
export async function saveChat(chat: NexusChat): Promise<void> {
  await writeJSON(chatKey(chat.id), chat);

  const index    = await readIndex();
  const meta     = buildMeta(chat);
  const existing = index.findIndex(m => m.id === chat.id);
  if (existing >= 0) {
    index[existing] = meta;
  } else {
    index.unshift(meta); // newest first
  }
  await writeIndex(index);
}

/** Load a full chat (with messages). Returns null if not found. */
export async function loadChat(chatId: string): Promise<NexusChat | null> {
  return readJSON<NexusChat | null>(chatKey(chatId), null);
}

/** Load all chat metadata (no messages). Sorted newest first. */
export async function loadAllChats(): Promise<NexusChatMeta[]> {
  const index = await readIndex();
  return index.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** Load every chat with full message arrays. Use sparingly — hits AsyncStorage for each chat. */
export async function loadAllChatsWithMessages(): Promise<NexusChat[]> {
  const index   = await readIndex();
  const results = await Promise.all(index.map(m => loadChat(m.id)));
  return results.filter((c): c is NexusChat => c !== null);
}

/** Permanently delete a chat and remove from index. */
export async function deleteChat(chatId: string): Promise<void> {
  await AsyncStorage.removeItem(chatKey(chatId));
  const index = await readIndex();
  await writeIndex(index.filter(m => m.id !== chatId));
}

/** Rename a chat (updates both index and full chat). */
export async function renameChat(chatId: string, newTitle: string): Promise<void> {
  const chat = await loadChat(chatId);
  if (chat) {
    chat.title = newTitle;
    await saveChat(chat);
  } else {
    const index = await readIndex();
    const meta  = index.find(m => m.id === chatId);
    if (meta) {
      meta.title = newTitle;
      await writeIndex(index);
    }
  }
}

/** Toggle the starred state of a chat. */
export async function toggleStarChat(chatId: string): Promise<void> {
  const chat = await loadChat(chatId);
  if (chat) {
    chat.starred = !chat.starred;
    await saveChat(chat);
  } else {
    const index = await readIndex();
    const meta  = index.find(m => m.id === chatId);
    if (meta) {
      meta.starred = !meta.starred;
      await writeIndex(index);
    }
  }
}

/** Assign a chat to a project (updates both chat and project). */
export async function addChatToProject(chatId: string, projectId: string): Promise<void> {
  const chat = await loadChat(chatId);
  if (chat) {
    chat.projectId = projectId;
    await saveChat(chat);
  } else {
    const index = await readIndex();
    const meta  = index.find(m => m.id === chatId);
    if (meta) {
      meta.projectId = projectId;
      await writeIndex(index);
    }
  }
  const projects = await loadAllProjects();
  const project  = projects.find(p => p.id === projectId);
  if (project) {
    if (!project.chatIds) project.chatIds = [];
    if (!project.chatIds.includes(chatId)) {
      project.chatIds.push(chatId);
      await writeJSON(KEY_PROJECTS, projects);
    }
  }
}

// ── Project CRUD ──────────────────────────────────────────────────────────────

export async function loadAllProjects(): Promise<NexusProject[]> {
  return readJSON<NexusProject[]>(KEY_PROJECTS, []);
}

export async function saveProject(project: NexusProject): Promise<void> {
  const projects  = await loadAllProjects();
  const existing  = projects.findIndex(p => p.id === project.id);
  if (existing >= 0) {
    projects[existing] = project;
  } else {
    projects.unshift(project);
  }
  await writeJSON(KEY_PROJECTS, projects);
}

export async function deleteProject(projectId: string): Promise<void> {
  const projects = await loadAllProjects();
  await writeJSON(KEY_PROJECTS, projects.filter(p => p.id !== projectId));
}

export async function getChatsForProject(projectId: string): Promise<NexusChatMeta[]> {
  const index = await readIndex();
  return index.filter(m => m.projectId === projectId);
}

// ── Title Generation ──────────────────────────────────────────────────────────

export function generateChatTitle(firstMessage: string): string {
  const msg = firstMessage.trim();

  const evalMatch = msg.match(
    /^(?:evaluate|eval|rate|assess|grade|scout)\s+([A-Z][a-z]+(?:\s+[A-Za-z'-]+){1,3})/i
  );
  if (evalMatch) return `${evalMatch[1]} Evaluation`;

  const cmpMatch = msg.match(
    /^compare\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:and|vs\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );
  if (cmpMatch) return `Compare ${cmpMatch[1]} & ${cmpMatch[2]}`;

  const trimmed = msg.slice(0, 40);
  return trimmed.length < msg.length ? trimmed + '…' : trimmed;
}

export function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
