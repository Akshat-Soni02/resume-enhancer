const STORAGE_KEY = 'resumeai_user_id';

export function getOrCreateUserId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Private mode or blocked storage: ephemeral id for this session only.
    return `session-${crypto.randomUUID()}`;
  }
}
