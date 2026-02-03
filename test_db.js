const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'data.db');
try {
    const db = new Database(dbPath, { timeout: 2000 });
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log('User count:', count);
    db.close();
} catch (e) {
    console.error('DB Error:', e);
}
