import axiosInstance from './api';

// שליפת שאלות יומיות
export async function fetchDailyQuestions() {
  const res = await axiosInstance.get('/journal/questions/today');
  return res.data;
}

// שליחת תשובות
export async function submitJournalEntry(payload) {
  /*
    payload = {
      date: '2026-01-07',
      answers: [
        { questionId: 'emotion', value: 5 },
        { questionId: 'social', value: 3 }
      ]
    }
  */
  const res = await axiosInstance.post('/journal/submit', payload);
  return res.data;
}