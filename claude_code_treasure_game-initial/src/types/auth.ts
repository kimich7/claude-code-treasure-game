export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type GameResult = 'win' | 'tie' | 'loss';

export interface ScoreEntry {
  score: number;
  result: GameResult;
  played_at: string;
}
