const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, './data.db');
const db = new Database(dbPath);

try {
    const users = db.prepare('SELECT email, type FROM users').all();
    console.log('Registered Users:');
    users.forEach(u => console.log(`- ${u.email} (${u.type})`));
} catch (e) {
    console.error('Error reading users:', e.message);
} finally {
    db.close();
}
