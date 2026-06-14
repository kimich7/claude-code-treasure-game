import { Router, Response } from 'express';
import db from './db.js';
import { requireAuth, AuthRequest } from './middleware.js';

const router = Router();

router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { score, result } = req.body;
  if (score === undefined || !result) {
    res.status(400).json({ error: 'score and result are required' });
    return;
  }
  if (!['win', 'tie', 'loss'].includes(result)) {
    res.status(400).json({ error: 'result must be win, tie, or loss' });
    return;
  }
  const stmt = db.prepare(
    'INSERT INTO scores (user_id, score, result) VALUES (?, ?, ?)'
  );
  const row = stmt.run(req.userId, score, result);
  res.json({ id: row.lastInsertRowid });
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const rows = db
    .prepare(
      'SELECT score, result, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 10'
    )
    .all(req.userId);
  res.json(rows);
});

export default router;
