import { getOrCreateUserId } from './userId';

const rawBase = import.meta.env.VITE_JOB_SPACES_API_URL;
const base = typeof rawBase === 'string' ? rawBase.replace(/\/$/, '') : '';

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': getOrCreateUserId(),
  };
}

async function parseError(res) {
  try {
    const j = await res.json();
    if (j?.detail) {
      return typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail);
    }
  } catch {
    /* ignore */
  }
  return res.statusText || `Request failed (${res.status})`;
}

export async function listMySpaces() {
  const res = await fetch(`${base}/job-spaces/spaces`, { headers: headers() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createSpace(name = '') {
  const res = await fetch(`${base}/job-spaces/spaces`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name: name ?? '' }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function joinSpace(code) {
  const res = await fetch(`${base}/job-spaces/spaces/join`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ code: code.trim() }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function leaveSpace(spaceId) {
  const res = await fetch(`${base}/job-spaces/spaces/${encodeURIComponent(spaceId)}/leave`, {
    method: 'POST',
    headers: headers(),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function getSpace(spaceId) {
  const res = await fetch(`${base}/job-spaces/spaces/${encodeURIComponent(spaceId)}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function addJobLink(spaceId, payload) {
  const res = await fetch(`${base}/job-spaces/spaces/${encodeURIComponent(spaceId)}/links`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      url: payload.url,
      title: payload.title ?? '',
      note: payload.note ?? '',
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
