function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('ai-course.elearnp.com')) {
    return 'https://api.ai-course.elearnp.com/api';
  }
  return 'http://localhost:3002/api';
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed. Please try again.');
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
}
