const API_URL = 'http://127.0.0.1:8000';

export const callBackend = async (path: string) => {
  try {
    const response = await fetch(`${API_URL}${path}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching message from ${path}:`, error);
    throw error;
  }
};
