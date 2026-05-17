const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database.db');
let db;

function getDB() {
  if (!db) db = new DatabaseSync(DB_PATH);
  return db;
}

function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      category TEXT,
      brand TEXT,
      sizes TEXT DEFAULT '[]',
      colors TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      stock INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      size TEXT,
      color TEXT,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      payment_method TEXT DEFAULT 'card',
      payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  seedData(db);
  console.log('✅ Database initialized successfully');
}

function seedData(db) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) return;

  // Seed admin user
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`).run('Admin', 'admin@mauryashoe.com', adminHash, 'admin');
  db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`).run('Rahul Maurya', 'user@mauryashoe.com', userHash, 'user');

  // Seed products
  const products = [
    {
      name: 'Nike Air Max 270',
      description: 'The Nike Air Max 270 delivers visible cushioning under every step. It features Nike\'s biggest heel Air unit yet for unrivaled, all-day comfort. Lightweight mesh upper for breathability.',
      price: 12999, original_price: 15999, category: 'Running', brand: 'Nike',
      sizes: JSON.stringify([6,7,7.5,8,8.5,9,9.5,10,11]),
      colors: JSON.stringify(['Black/White','University Red','Royal Blue']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600']),
      stock: 50, rating: 4.7, reviews_count: 234, featured: 1
    },
    {
      name: 'Adidas Ultraboost 22',
      description: 'Run in incredible comfort in the Adidas Ultraboost 22. The Primeknit+ upper adapts to your foot shape and the BOOST midsole delivers incredible energy return.',
      price: 14999, original_price: 18999, category: 'Running', brand: 'Adidas',
      sizes: JSON.stringify([6,7,7.5,8,8.5,9,9.5,10,11]),
      colors: JSON.stringify(['Core Black','Cloud White','Solar Red']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600','https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600']),
      stock: 35, rating: 4.8, reviews_count: 312, featured: 1
    },
    {
      name: 'Jordan 1 Retro High OG',
      description: 'The Air Jordan 1 Retro High OG — the iconic basketball silhouette with premium leather upper. A cultural artifact that changed the game forever.',
      price: 15999, original_price: 19999, category: 'Basketball', brand: 'Jordan',
      sizes: JSON.stringify([7,7.5,8,8.5,9,9.5,10,11,12]),
      colors: JSON.stringify(['Chicago Red','Royal Blue','Shadow']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1556906781-9a412961d28e?w=600','https://images.unsplash.com/photo-1556906781-9a412961d28e?w=600']),
      stock: 20, rating: 4.9, reviews_count: 512, featured: 1
    },
    {
      name: 'Adidas Stan Smith',
      description: 'Clean, simple and legendary. The Adidas Stan Smith has been turning heads since 1965. Full-grain leather upper with perforated 3-Stripes for breathability.',
      price: 7999, original_price: 9999, category: 'Casual', brand: 'Adidas',
      sizes: JSON.stringify([6,7,8,9,10,11]),
      colors: JSON.stringify(['White/Green','White/Navy','All White']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600','https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600']),
      stock: 60, rating: 4.5, reviews_count: 189, featured: 1
    },
    {
      name: 'Nike React Infinity Run',
      description: 'The Nike React Infinity Run Flyknit is designed to keep you on the run. More foam and improved upper details help make it a durable, comfortable ride.',
      price: 10999, original_price: 13999, category: 'Running', brand: 'Nike',
      sizes: JSON.stringify([6,7,7.5,8,8.5,9,9.5,10]),
      colors: JSON.stringify(['Black','White/Blue','Crimson']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600']),
      stock: 45, rating: 4.6, reviews_count: 167, featured: 0
    },
    {
      name: 'Puma RS-X',
      description: 'The PUMA RS-X is a sleek lifestyle sneaker inspired by the Running System technology. Bold chunky sole design with multiple mesh and leather layers.',
      price: 8999, original_price: 10999, category: 'Lifestyle', brand: 'Puma',
      sizes: JSON.stringify([6,7,8,9,10,11]),
      colors: JSON.stringify(['White/Blue/Red','Black/Yellow','Grey/Pink']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600']),
      stock: 30, rating: 4.3, reviews_count: 98, featured: 0
    },
    {
      name: 'New Balance 574',
      description: 'The New Balance 574 is a classic lifestyle sneaker. ENCAP midsole technology for superior support and durability. A true icon of casual wear.',
      price: 9999, original_price: 11999, category: 'Lifestyle', brand: 'New Balance',
      sizes: JSON.stringify([6,7,8,9,10,11]),
      colors: JSON.stringify(['Grey/White','Navy/White','Burgundy']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600']),
      stock: 40, rating: 4.4, reviews_count: 143, featured: 0
    },
    {
      name: 'Converse Chuck Taylor All Star',
      description: 'The iconic Converse Chuck Taylor All Star. Durable canvas upper, signature rubber sole and toe cap. The original high-top sneaker since 1917.',
      price: 5999, original_price: 6999, category: 'Casual', brand: 'Converse',
      sizes: JSON.stringify([5,6,7,8,9,10,11,12]),
      colors: JSON.stringify(['Black','White','Red','Navy']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=600']),
      stock: 80, rating: 4.5, reviews_count: 421, featured: 0
    },
    {
      name: 'Vans Old Skool',
      description: 'The Vans Old Skool is a classic skate shoe with the iconic side stripe. Features a low-top lace-up silhouette with sturdy canvas and suede upper.',
      price: 5499, original_price: 6499, category: 'Skateboarding', brand: 'Vans',
      sizes: JSON.stringify([5,6,7,8,9,10,11]),
      colors: JSON.stringify(['Black/White','Navy/White','True White']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600']),
      stock: 55, rating: 4.6, reviews_count: 287, featured: 0
    },
    {
      name: 'Nike Dunk Low',
      description: 'Created for the hardwood but taken to the streets, the Nike Dunk Low cuts a classic hoops silhouette. Premium leather upper in team colors.',
      price: 9499, original_price: 11499, category: 'Lifestyle', brand: 'Nike',
      sizes: JSON.stringify([6,7,8,9,10,11]),
      colors: JSON.stringify(['Panda Black/White','University Red','Georgetown']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1584735175315-9d5df23be4be?w=600']),
      stock: 25, rating: 4.7, reviews_count: 376, featured: 1
    },
    {
      name: 'Adidas Yeezy Boost 350 V2',
      description: 'The Adidas Yeezy Boost 350 V2 features a Primeknit upper with a BOOST midsole for superior cushioning. Designed by Kanye West for the modern street.',
      price: 24999, original_price: 29999, category: 'Lifestyle', brand: 'Adidas',
      sizes: JSON.stringify([6,7,8,9,10,11]),
      colors: JSON.stringify(['Zebra','Beluga','Black Red']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600']),
      stock: 15, rating: 4.8, reviews_count: 198, featured: 1
    },
    {
      name: 'Reebok Classic Leather',
      description: 'The Reebok Classic Leather has been a style staple since 1983. Clean leather upper with a soft terry cloth lining and cushioned midsole for all-day comfort.',
      price: 6999, original_price: 8499, category: 'Casual', brand: 'Reebok',
      sizes: JSON.stringify([6,7,8,9,10,11]),
      colors: JSON.stringify(['White','Black','Chalk/Gum']),
      images: JSON.stringify(['https://images.unsplash.com/photo-1539185441755-769473a23570?w=600']),
      stock: 35, rating: 4.3, reviews_count: 112, featured: 0
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, original_price, category, brand, sizes, colors, images, stock, rating, reviews_count, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of products) {
    insertProduct.run(
      p.name, p.description, p.price, p.original_price, p.category, p.brand,
      p.sizes, p.colors, p.images, p.stock, p.rating, p.reviews_count, p.featured
    );
  }

  console.log('🌱 Database seeded with sample data');
}

module.exports = { getDB, initDB };
