import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'https://ieltsbackend-gogn.onrender.com/api';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {};
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = await response.text();
    try {
      const json = JSON.parse(errorMessage);
      if (json.error) errorMessage = json.error;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage || `Request failed with status ${response.status}`);
  }

  return response.json();
}
