const { getDB } = require('../models/db');

exports.createOrder = (req, res, next) => {
  try {
    const { items, shipping_address, payment_method = 'card' } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Order items required' });

    const db = getDB();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;

    const result = db.prepare(`
      INSERT INTO orders (user_id, items, subtotal, shipping, total, shipping_address, payment_method, payment_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, JSON.stringify(items), subtotal, shipping, total, JSON.stringify(shipping_address), payment_method, `PAY_${Date.now()}`);

    // Clear cart after order
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ ...order, items: JSON.parse(order.items), shipping_address: JSON.parse(order.shipping_address) });
  } catch (err) { next(err); }
};

exports.getMyOrders = (req, res, next) => {
  try {
    const db = getDB();
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const parsed = orders.map(o => ({ ...o, items: JSON.parse(o.items), shipping_address: JSON.parse(o.shipping_address) }));
    res.json(parsed);
  } catch (err) { next(err); }
};

exports.getOrder = (req, res, next) => {
  try {
    const db = getDB();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ ...order, items: JSON.parse(order.items), shipping_address: JSON.parse(order.shipping_address) });
  } catch (err) { next(err); }
};

exports.cancelOrder = (req, res, next) => {
  try {
    const db = getDB();
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', req.params.id);
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) { next(err); }
};
