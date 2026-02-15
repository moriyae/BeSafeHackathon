import API from '../services/api';

/**
 * Get daily questions (requires token)
 * Returns list of active questions
 */
export async function getQuestions() {
  const response = await API.get('/auth/questions');
  return response.data;
}

/**
 * Submit journal entry (requires token)
 * @param {Object} payload - { answers?, freeText? }
 * - answers: array of numbers [1-7] (optional)
 * - freeText: string (optional)
 * At least one of them must be provided
 */
export async function submitJournalEntry(payload) {
  // Ensure at least one field is provided
  if (!payload.answers && !payload.freeText) {
    throw new Error('Must provide either answers or freeText');
  }

  const response = await API.post('/auth/answers', payload);
  return response.data;
}