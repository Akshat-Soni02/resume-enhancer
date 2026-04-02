import { getOrCreateUserId } from './userId';

const base = (import.meta.env.VITE_JOB_SPACES_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': getOrCreateUserId(),
  };
}

async function parseError(res: Response): Promise<string> {
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

export type JobSpaceSummary = {
  id: string;
  join_code: string;
  name: string;
  created_by: string;
  created_at: string;
  link_count?: number;
};

export type JobLink = {
  id: string;
  space_id: string;
  user_id: string;
  url: string;
  title: string;
  note: string;
  created_at: string;
};

export type SpaceMember = {
  user_id: string;
  joined_at: string;
};

export async function listMySpaces(): Promise<{
  spaces: JobSpaceSummary[];
  max_spaces: number;
  count: number;
}> {
  const res = await fetch(`${base}/job-spaces/spaces`, { headers: headers() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createSpace(name?: string): Promise<JobSpaceSummary> {
  const res = await fetch(`${base}/job-spaces/spaces`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name: name ?? '' }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function joinSpace(code: string): Promise<{ space: JobSpaceSummary; already_member: boolean }> {
  const res = await fetch(`${base}/job-spaces/spaces/join`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ code: code.trim() }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function leaveSpace(spaceId: string): Promise<void> {
  const res = await fetch(`${base}/job-spaces/spaces/${encodeURIComponent(spaceId)}/leave`, {
    method: 'POST',
    headers: headers(),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function getSpace(spaceId: string): Promise<{
  space: JobSpaceSummary;
  members: SpaceMember[];
  links: JobLink[];
}> {
  const res = await fetch(`${base}/job-spaces/spaces/${encodeURIComponent(spaceId)}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function addJobLink(
  spaceId: string,
  payload: { url: string; title?: string; note?: string }
): Promise<{ link: JobLink }> {
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
