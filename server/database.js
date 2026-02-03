const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data.db');
let db;

try {
    console.log(`CaltransBizConnect DB: Opening database at ${dbPath}`);
    db = new Database(dbPath, { verbose: console.log });
} catch (err) {
    console.error('CaltransBizConnect DB FATAL ERROR: Failed to open database file.', err);
    // Continue without crashing, allowing the app to show helpful errors instead of 503
}

// Initialize database schema
function initDatabase() {
    if (!db) {
        console.error('CaltransBizConnect DB: initDatabase called but db is not initialized.');
        return;
    }

    try {
        console.log('CaltransBizConnect DB: Initializing schema...');
        // Users table
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                type TEXT NOT NULL,
                business_name TEXT,
                contact_name TEXT,
                phone TEXT,
                ein TEXT,
                certification_number TEXT,
                business_description TEXT,
                organization_name TEXT,
                districts TEXT,
                categories TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Opportunities table
        db.exec(`
            CREATE TABLE IF NOT EXISTS opportunities (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                scope_summary TEXT NOT NULL,
                district TEXT NOT NULL,
                district_name TEXT NOT NULL,
                category TEXT NOT NULL,
                category_name TEXT NOT NULL,
                subcategory TEXT,
                estimated_value TEXT,
                due_date TEXT,
                due_time TEXT,
                submission_method TEXT,
                status TEXT DEFAULT 'published',
                posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                posted_by INTEGER,
                FOREIGN KEY (posted_by) REFERENCES users (id)
            )
        `);

        // Applications table
        db.exec(`
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                opportunity_id TEXT NOT NULL,
                vendor_id INTEGER NOT NULL,
                agency_id INTEGER,
                status TEXT DEFAULT 'pending',
                applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities (id),
                FOREIGN KEY (vendor_id) REFERENCES users (id)
            )
        `);

        // Seed data for initial deployment
        const count = db.prepare('SELECT COUNT(*) as count FROM opportunities').get().count;
        if (count === 0) {
            console.log('CaltransBizConnect DB: Seeding initial opportunities...');
            const seedStmt = db.prepare(`
                INSERT INTO opportunities (
                    id, title, scope_summary, district, district_name, 
                    category, category_name, subcategory, estimated_value, 
                    due_date, due_time, submission_method, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
            `);

            const seeds = [
                [
                    'opp-001',
                    'District 4 Bridge Maintenance Support',
                    'Provide specialized technical assistance for ongoing bridge maintenance projects in the Bay Area.',
                    '04', 'D04 - Bay Area / Oakland',
                    'services', 'Support Services',
                    'Technical Assistance', '$150,000 - $300,000',
                    '2026-03-15', '14:00', 'Electronic Submission'
                ],
                [
                    'opp-002',
                    'Statewide SBE Supportive Services Program',
                    'Comprehensive supportive services including training workshops and technical assistance for certified SBEs.',
                    '74', 'D74 - Headquarters',
                    'services', 'Support Services',
                    'Training', '$500,000+',
                    '2026-04-01', '10:00', 'Caltrans Portal'
                ],
                [
                    'opp-003',
                    'District 7 Guardrail Repair Contract',
                    'Emergency and scheduled guardrail repair services across various locations in Los Angeles county.',
                    '07', 'D07 - Los Angeles',
                    'construction', 'Construction',
                    'Specialty Contracting', '$2,000,000',
                    '2026-02-28', '16:00', 'Hard Copy / In-Person'
                ]
            ];

            for (const seed of seeds) {
                seedStmt.run(...seed);
            }
            console.log('CaltransBizConnect DB: Seeded 3 sample opportunities.');
        }

        // Migration logic for new columns
        const columns = db.prepare("PRAGMA table_info(users)").all();
        const addColumn = (table, col, def) => {
            const currentCols = db.prepare(`PRAGMA table_info(${table})`).all();
            if (!currentCols.some(c => c.name === col)) {
                console.log(`CaltransBizConnect DB Migration: Adding ${col} to ${table}...`);
                db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
            }
        };

        // Users columns
        addColumn('users', 'status', "TEXT DEFAULT 'active'");
        addColumn('users', 'saved_opportunities', "TEXT");
        addColumn('users', 'capability_statement', "TEXT");
        addColumn('users', 'business_description', "TEXT");
        addColumn('users', 'website', "TEXT");
        addColumn('users', 'address', "TEXT");
        addColumn('users', 'city', "TEXT");
        addColumn('users', 'state', "TEXT");
        addColumn('users', 'zip', "TEXT");
        addColumn('users', 'years_in_business', "TEXT");
        addColumn('users', 'certifications', "TEXT");

        // Opportunities columns
        addColumn('opportunities', 'attachments', "TEXT");
        addColumn('opportunities', 'duration', "TEXT");
        addColumn('opportunities', 'requirements', "TEXT");
        addColumn('opportunities', 'certifications', "TEXT");
        addColumn('opportunities', 'experience', "TEXT");

        // Additional Tables
        db.exec(`
            CREATE TABLE IF NOT EXISTS saved_opportunities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vendor_id INTEGER NOT NULL,
                opportunity_id TEXT NOT NULL,
                saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(vendor_id, opportunity_id),
                FOREIGN KEY (vendor_id) REFERENCES users (id),
                FOREIGN KEY (opportunity_id) REFERENCES opportunities (id)
            )
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                opportunity_id TEXT,
                subject TEXT,
                body TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users (id),
                FOREIGN KEY (receiver_id) REFERENCES users (id),
                FOREIGN KEY (opportunity_id) REFERENCES opportunities (id)
            )
        `);

        console.log('CaltransBizConnect DB: Schema initialized and verified.');
    } catch (e) {
        console.error('CaltransBizConnect DB Error during schema initialization:', e);
    }
}

module.exports = {
    db,
    initDatabase
};
