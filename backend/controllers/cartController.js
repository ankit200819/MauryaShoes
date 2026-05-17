const { getDB } = require('../models/db');

exports.getCart = (req, res, next) => {
  try {
    const db = getDB();
    const items = db.prepare(`
      SELECT c.id, c.product_id, c.size, c.color, c.quantity,
             p.name, p.price, p.images, p.stock, p.brand
      FROM cart c JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `).all(req.user.id);
    const parsed = items.map(i => ({ ...i, images: JSON.parse(i.images) }));
    res.json(parsed);
  } catch (err) { next(err); }
};

exports.addToCart = (req, res, next) => {
  try {
    const { product_id, size, color, quantity = 1 } = req.body;
    const db = getDB();
    const existing = db.prepare('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?').get(req.user.id, product_id, size, color);
    if (existing) {
      db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(existing.quantity + quantity, existing.id);
    } else {
      db.prepare('INSERT INTO cart (user_id, product_id, size, color, quantity) VALUES (?, ?, ?, ?, ?)').run(req.user.id, product_id, size, color, quantity);
    }
    res.json({ message: 'Added to cart' });
  } catch (err) { next(err); }
};

exports.updateCart = (req, res, next) => {
  try {
    const { quantity } = req.body;
    const db = getDB();
    if (quantity <= 0) {
      db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    } else {
      db.prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, req.user.id);
    }
    res.json({ message: 'Cart updated' });
  } catch (err) { next(err); }
};

exports.removeFromCart = (req, res, next) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Item removed' });
  } catch (err) { next(err); }
};

exports.clearCart = (req, res, next) => {
  try {
    const db = getDB();
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
};
