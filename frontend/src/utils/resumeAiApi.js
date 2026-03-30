import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-optimizer-api-518868709.asia-south1.run.app';

const buildHeaders = (apiKey, modelId) => {
  const headers = {
    'X-API-Key': apiKey,
  };
  if (modelId) headers['X-Gemini-Model'] = modelId;
  return headers;
};

export const parseResumeAiJD = async ({ jdUrl, jdText, apiKey, modelId }) => {
  const params = new URLSearchParams();
  params.append('jd_url', jdUrl || '');
  params.append('jd_text', jdText || '');
  const response = await axios.post(`${API_BASE_URL}/resumeai/parse-jd`, params, {
    headers: {
      ...buildHeaders(apiKey, modelId),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const optimizeResumeAi = async ({ resumeText, jdSummary, latexTemplate, apiKey, modelId }) => {
  const params = new URLSearchParams();
  params.append('resume_text', resumeText);
  params.append('jd_summary', JSON.stringify(jdSummary));
  params.append('latex_template', latexTemplate);
  const response = await axios.post(`${API_BASE_URL}/resumeai/optimize`, params, {
    headers: {
      ...buildHeaders(apiKey, modelId),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const compileResumeAiLatex = async ({ latex }) => {
  const params = new URLSearchParams();
  params.append('latex', latex);
  const response = await axios.post(`${API_BASE_URL}/resumeai/compile-latex`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    responseType: 'arraybuffer',
  });
  return response.data;
};
