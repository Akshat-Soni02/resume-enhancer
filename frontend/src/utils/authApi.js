import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-optimizer-api-518868709.asia-south1.run.app';

const client = axios.create({ baseURL: API_BASE_URL });

async function bearerHeaders(getToken) {
  const token = await getToken();
  if (!token) throw new Error('Sign in with Google to use this feature.');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchMe(getToken) {
  const headers = await bearerHeaders(getToken);
  const { data } = await client.get('/api/v1/users/me', { headers });
  return data;
}

export async function listTemplates(getToken) {
  const headers = await bearerHeaders(getToken);
  const { data } = await client.get('/api/v1/templates', { headers });
  return data;
}

export async function createResume(getToken, body) {
  const headers = await bearerHeaders(getToken);
  const { data } = await client.post('/api/v1/resumes', body, { headers });
  return data;
}

export async function listResumes(getToken) {
  const headers = await bearerHeaders(getToken);
  const { data } = await client.get('/api/v1/resumes', { headers });
  return data;
}

export async function createResumeExport(getToken, body) {
  const headers = await bearerHeaders(getToken);
  const { data } = await client.post('/api/v1/resume-exports', body, { headers });
  return data;
}

export async function listResumeExports(getToken) {
  const headers = await bearerHeaders(getToken);
  const { data } = await client.get('/api/v1/resume-exports', { headers });
  return data;
}
