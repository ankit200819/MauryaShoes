const { getDB } = require('../models/db');

exports.getAll = (req, res, next) => {
  try {
    const db = getDB();
    const { category, brand, min_price, max_price, search, sort, featured, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) { query += ' AND category = ?'; params.push(category); }
    if (brand) { query += ' AND brand = ?'; params.push(brand); }
    if (min_price) { query += ' AND price >= ?'; params.push(Number(min_price)); }
    if (max_price) { query += ' AND price <= ?'; params.push(Number(max_price)); }
    if (search) {
      const words = search.trim().split(/\s+/).filter(Boolean);
      words.forEach(word => {
        query += ' AND (name LIKE ? OR brand LIKE ? OR description LIKE ? OR category LIKE ?)';
        params.push(`%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`);
      });
    }
    if (featured === '1') { query += ' AND featured = 1'; }

    const sortMap = { price_asc: 'price ASC', price_desc: 'price DESC', rating: 'rating DESC', newest: 'created_at DESC', popular: 'reviews_count DESC' };
    query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const products = db.prepare(query).all(...params);
    const parsed = products.map(p => ({ ...p, sizes: JSON.parse(p.sizes), colors: JSON.parse(p.colors), images: JSON.parse(p.images) }));
    res.json(parsed);
  } catch (err) { next(err); }
};

exports.getOne = (req, res, next) => {
  try {
    const db = getDB();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ? ORDER BY r.created_at DESC
    `).all(req.params.id);

    res.json({
      ...product,
      sizes: JSON.parse(product.sizes),
      colors: JSON.parse(product.colors),
      images: JSON.parse(product.images),
      reviews
    });
  } catch (err) { next(err); }
};

exports.addReview = (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const db = getDB();
    db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)').run(req.params.id, req.user.id, rating, comment);
    const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE product_id = ?').get(req.params.id);
    db.prepare('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?').run(avg.avg.toFixed(1), avg.cnt, req.params.id);
    res.status(201).json({ message: 'Review added' });
  } catch (err) { next(err); }
};

exports.getCategories = (req, res, next) => {
  try {
    const db = getDB();
    const categories = db.prepare('SELECT DISTINCT category FROM products').all().map(r => r.category);
    const brands = db.prepare('SELECT DISTINCT brand FROM products').all().map(r => r.brand);
    res.json({ categories, brands });
  } catch (err) { next(err); }
};
