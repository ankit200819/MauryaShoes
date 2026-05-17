const router = require('express').Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { getDB } = require('../models/db');

router.use(auth, isAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  const db = getDB();
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;
  const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const revenue = db.prepare('SELECT SUM(total) as total FROM orders WHERE status != ?').get('cancelled').total || 0;
  const recentOrders = db.prepare('SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5').all();
  res.json({ totalOrders, totalUsers, totalProducts, revenue, recentOrders: recentOrders.map(o => ({ ...o, items: JSON.parse(o.items) })) });
});

// Product CRUD (admin)
router.get('/products', (req, res) => {
  const db = getDB();
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(products.map(p => ({ ...p, sizes: JSON.parse(p.sizes), colors: JSON.parse(p.colors), images: JSON.parse(p.images) })));
});

router.post('/products', (req, res) => {
  const { name, description, price, original_price, category, brand, sizes, colors, images, stock, featured } = req.body;
  const db = getDB();
  const result = db.prepare(`
    INSERT INTO products (name, description, price, original_price, category, brand, sizes, colors, images, stock, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, price, original_price, category, brand, JSON.stringify(sizes || []), JSON.stringify(colors || []), JSON.stringify(images || []), stock, featured ? 1 : 0);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Product created' });
});

router.put('/products/:id', (req, res) => {
  const { name, description, price, original_price, category, brand, sizes, colors, images, stock, featured } = req.body;
  const db = getDB();
  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, original_price=?, category=?, brand=?, sizes=?, colors=?, images=?, stock=?, featured=? WHERE id=?
  `).run(name, description, price, original_price, category, brand, JSON.stringify(sizes || []), JSON.stringify(colors || []), JSON.stringify(images || []), stock, featured ? 1 : 0, req.params.id);
  res.json({ message: 'Product updated' });
});

router.delete('/products/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

// Orders management
router.get('/orders', (req, res) => {
  const db = getDB();
  const orders = db.prepare('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC').all();
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items), shipping_address: JSON.parse(o.shipping_address) })));
});

router.put('/orders/:id', (req, res) => {
  const { status } = req.body;
  const db = getDB();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Order status updated' });
});

// Users management
router.get('/users', (req, res) => {
  const db = getDB();
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

module.exports = router;
