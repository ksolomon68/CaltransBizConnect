const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../data.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('Running Data Attribution Fix...');

// 1. Ensure Test Agent Exists
const testAgentEmail = 'agency@test.com';
let agent = db.prepare('SELECT * FROM users WHERE email = ?').get(testAgentEmail);

if (!agent) {
    console.log('Test agent not found, creating...');
    const hash = bcrypt.hashSync('Password123!', 10);
    const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, type, organization_name, status)
        VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(testAgentEmail, hash, 'agency', 'Test Agency Dept', 'active');
    agent = { id: info.lastInsertRowid };
    console.log(`Created test agent with ID: ${agent.id}`);
} else {
    console.log(`Found test agent with ID: ${agent.id}`);
}

// 2. Update Opportunities
const updateStmt = db.prepare(`
    UPDATE opportunities 
    SET posted_by = ? 
    WHERE posted_by IS NULL OR posted_by = ''
`);

const result = updateStmt.run(agent.id);

console.log(`Attributed ${result.changes} opportunities to agent ID ${agent.id}.`);
console.log('Done.');
