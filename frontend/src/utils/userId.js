const STORAGE_KEY = 'resume_optimizer_user_id';

export function getOrCreateUserId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `session-${crypto.randomUUID()}`;
  }
}
