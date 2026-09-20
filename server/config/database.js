const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const sqlJsMain = require.resolve('sql.js');
const distDir = path.dirname(sqlJsMain);
const wasmPath = path.join(distDir, 'sql-wasm.wasm');
const wasmBinary = fs.readFileSync(wasmPath);

let SQL = null;
let isReady = false;
let initError = null;

class SqlJsDatabaseAdapter {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this._sqlite = null;
    this.inTransaction = false;
    
    this.ready = initSqlJs({ wasmBinary }).then(inst => {
      SQL = inst;
      this.initDb();
      isReady = true;
    }).catch(err => {
      initError = err;
      console.error("Failed to initialize sql.js WASM:", err);
      throw err;
    });
  }

  initDb() {
    if (this._sqlite || !SQL) return;
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (this.dbPath !== ':memory:' && fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this._sqlite = new SQL.Database(buffer);
    } else {
      this._sqlite = new SQL.Database();
    }
    this.pragma('journal_mode = WAL');
    this.pragma('foreign_keys = ON');
    this.initSchema();
  }

  ensureInitialized() {
    if (this._sqlite) return;
    if (initError) throw initError;
    if (!SQL) {
      throw new Error("SQL.js database engine is initializing. Await db.ready before executing queries.");
    }
    this.initDb();
  }

  save() {
    if (this.dbPath !== ':memory:' && this._sqlite && !this.inTransaction) {
      try {
        const data = this._sqlite.export();
        fs.writeFileSync(this.dbPath, Buffer.from(data));
      } catch (e) {
        console.error("Error persisting database to disk:", e);
      }
    }
  }

  pragma(statement) {
    this.ensureInitialized();
    try {
      this._sqlite.run(`PRAGMA ${statement}`);
    } catch (e) {}
  }

  exec(sql) {
    this.ensureInitialized();
    this._sqlite.run(sql);
    this.save();
  }

  prepare(sql) {
    this.ensureInitialized();
    const self = this;
    return {
      get(...params) {
        self.ensureInitialized();
        let bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = self._sqlite.prepare(sql);
        stmt.bind(bindParams);
        let row = undefined;
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
        stmt.free();
        return row;
      },

      all(...params) {
        self.ensureInitialized();
        let bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = self._sqlite.prepare(sql);
        stmt.bind(bindParams);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      },

      run(...params) {
        self.ensureInitialized();
        let bindParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        self._sqlite.run(sql, bindParams);
        
        let changes = 0;
        let lastInsertRowid = 0;
        try {
          const res = self._sqlite.exec("SELECT changes() as c, last_insert_rowid() as id");
          if (res.length > 0 && res[0].values.length > 0) {
            changes = res[0].values[0][0];
            lastInsertRowid = res[0].values[0][1];
          }
        } catch (e) {}

        self.save();
        return { changes, lastInsertRowid };
      }
    };
  }

  transaction(fn) {
    const self = this;
    return (...args) => {
      self.ensureInitialized();
      self.inTransaction = true;
      self._sqlite.run("BEGIN TRANSACTION;");
      try {
        const result = fn(...args);
        self._sqlite.run("COMMIT;");
        self.inTransaction = false;
        self.save();
        return result;
      } catch (err) {
        try {
          self._sqlite.run("ROLLBACK;");
        } catch (e) {}
        self.inTransaction = false;
        throw err;
      }
    };
  }

  initSchema() {
    if (!this._sqlite) return;
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) return;
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.transaction(() => {
      for (const statement of statements) {
        try {
          this.prepare(statement).run();
        } catch (e) {}
      }
    })();
  }
}

const dbPath = path.join(__dirname, '../data/campuscash.db');
const adapter = new SqlJsDatabaseAdapter(dbPath);

module.exports = adapter;
