/**
 * Voice Input Classifier
 * Determines whether a voice input is a command (imperative action) or a question (information request).
 */

interface ClassificationResult {
  type: 'command' | 'question';
  confidence: number;
}

const COMMAND_VERBS = [
  'add', 'remove', 'update', 'set', 'change', 'move', 'schedule',
  'create', 'delete', 'assign', 'trade', 'swap', 'bench', 'start',
  'cut', 'sign', 'release', 'promote', 'demote', 'transfer',
  'save', 'edit', 'rename', 'pin', 'unpin', 'archive',
];

const QUESTION_STARTERS = [
  'what', 'when', 'where', 'who', 'how', 'why',
  'is', 'are', 'does', 'do', 'can', 'will', 'would', 'could', 'should',
  'show', 'tell', 'explain', 'describe',
];

export function classifyVoiceInput(text: string): ClassificationResult {
  const normalized = text.trim().toLowerCase();
  const words = normalized.split(/\s+/);
  const firstWord = words[0] ?? '';

  // Ends with question mark → likely a question
  if (normalized.endsWith('?')) {
    return { type: 'question', confidence: 0.9 };
  }

  // Starts with a command verb → likely a command
  if (COMMAND_VERBS.includes(firstWord)) {
    return { type: 'command', confidence: 0.85 };
  }

  // Starts with question word → likely a question
  if (QUESTION_STARTERS.includes(firstWord)) {
    return { type: 'question', confidence: 0.8 };
  }

  // "Show me" pattern → question
  if (firstWord === 'show' && words[1] === 'me') {
    return { type: 'question', confidence: 0.85 };
  }

  // Default: treat as question (safer)
  return { type: 'question', confidence: 0.5 };
}
