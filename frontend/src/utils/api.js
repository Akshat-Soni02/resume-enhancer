import axios from 'axios';

// Use environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-optimizer-api-zuxawvln7a-el.a.run.app';

/**
 * Process resume against job description
 * @param {string} jd - Job description text
 * @param {File} resumeFile - Resume file (PDF or DOCX)
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Object>} Analysis results
 */
export const processResume = async (jd, resumeFile, apiKey) => {
  const formData = new FormData();
  formData.append('jd', jd);
  formData.append('resume', resumeFile);

  const response = await axios.post(`${API_BASE_URL}/process`, formData, {
    headers: {
      'X-API-Key': apiKey,
      // Don't set Content-Type - let axios set it automatically with boundary
    },
  });

  return response.data;
};

