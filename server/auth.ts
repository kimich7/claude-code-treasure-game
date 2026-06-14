import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { JWT_SECRET } from './middleware.js';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email and password are required' });
    return;
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const result = stmt.run(username, email, hash);
    const user = { id: result.lastInsertRowid as number, username, email };
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Email or username already in use' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.post('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!row) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const user = { id: row.id, username: row.username, email: row.email };
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user });
});

export default router;
