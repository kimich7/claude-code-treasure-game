import type { AuthResponse, GameResult, ScoreEntry } from '../types/auth';

const TOKEN_KEY = 'treasure_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function post<T>(path: string, body: object, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export const api = {
  signup: (username: string, email: string, password: string) =>
    post<AuthResponse>('/api/auth/signup', { username, email, password }),

  signin: (email: string, password: string) =>
    post<AuthResponse>('/api/auth/signin', { email, password }),

  saveScore: (score: number, result: GameResult) =>
    post<{ id: number }>('/api/scores', { score, result }, true),

  getMyScores: () => get<ScoreEntry[]>('/api/scores/me'),
};
