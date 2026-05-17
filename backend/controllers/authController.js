const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../models/db');

exports.register = (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};

exports.login = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) { next(err); }
};

exports.getProfile = (req, res, next) => {
  try {
    const db = getDB();
    const user = db.prepare('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateProfile = (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const db = getDB();
    db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?').run(name, phone, address, req.user.id);
    const user = db.prepare('SELECT id, name, email, role, phone, address FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (err) { next(err); }
};
