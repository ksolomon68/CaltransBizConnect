const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('Running Orphan Opportunity Cleanup (Cascade)...');

// 1. Identify Orphan IDs
const orphans = db.prepare(`
    SELECT id FROM opportunities 
    WHERE posted_by IS NULL 
       OR posted_by = '' 
       OR posted_by NOT IN (SELECT id FROM users)
`).all();

if (orphans.length === 0) {
    console.log('No orphans found.');
} else {
    const ids = orphans.map(o => o.id);
    const placeholders = ids.map(() => '?').join(',');

    console.log(`Found ${ids.length} orphaned opportunities.`);

    // 2. Delete Dependents
    const delApps = db.prepare(`DELETE FROM applications WHERE opportunity_id IN (${placeholders})`);
    const delMsgs = db.prepare(`DELETE FROM messages WHERE opportunity_id IN (${placeholders})`);
    const delSaved = db.prepare(`DELETE FROM saved_opportunities WHERE opportunity_id IN (${placeholders})`); // If table exists

    const appsRes = delApps.run(...ids);
    const msgsRes = delMsgs.run(...ids);

    let savedRes = { changes: 0 };
    try {
        savedRes = delSaved.run(...ids);
    } catch (e) {
        // Table might not exist or be empty, ignore
    }

    console.log(`Deleted dependents: ${appsRes.changes} applications, ${msgsRes.changes} messages, ${savedRes.changes} saved refs.`);

    // 3. Delete Orphans
    const delOpps = db.prepare(`DELETE FROM opportunities WHERE id IN (${placeholders})`);
    const oppsRes = delOpps.run(...ids);

    console.log(`Deleted ${oppsRes.changes} orphaned opportunities.`);
}

console.log('Done.');
