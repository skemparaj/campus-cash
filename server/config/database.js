const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../data/campuscash.db');
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath, { verbose: null });

// Rule 4: Enable WAL mode and foreign keys for performance and data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  
  // Split statements by semicolon and execute non-empty statements
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  db.transaction(() => {
    for (const statement of statements) {
      db.prepare(statement).run();
    }
  })();
}

// Run schema initialization
initSchema();

module.exports = db;
