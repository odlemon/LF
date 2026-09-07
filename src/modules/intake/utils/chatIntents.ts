export type ChatIntent = "reset" | "undo" | null;

/** Detect local scope commands so the single chat box can drive start-over / undo. */
export function detectChatIntent(text: string): ChatIntent {
  const t = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return null;

  if (
    /\b(start over|start again|from scratch|clear everything|clear all|clear (the )?scope|reset (the )?scope|scrap (the )?(scope|everything)|wipe (the )?scope|begin again)\b/.test(
      t
    )
  ) {
    return "reset";
  }

  if (/\b(undo|revert|roll ?back|take (it|that) back)\b/.test(t)) {
    return "undo";
  }

  if (
    /\b(mistake|mistakes)\b/.test(t) &&
    /\b(redo|undo|fix|revert|go back)\b/.test(t)
  ) {
    return "undo";
  }

  if (/^(lets?|let us) (redo|undo)( it| that)?[.!?]?$/.test(t)) {
    return "undo";
  }

  return null;
}
