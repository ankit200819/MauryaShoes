const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, 'backend', 'database.db'));
db.prepare("UPDATE products SET images = '[\"/assets/nikedunklow.png\"]' WHERE name LIKE '%Nike Dunk Low%'").run();
console.log("Updated Nike Dunk Low image");
