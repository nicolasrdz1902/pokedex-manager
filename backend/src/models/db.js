const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.sqlite');

let _db = null;

function persist() {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function getDb() {
  if (_db) return _db;
  throw new Error('Database not initialized — call initDb() first');
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pokemon_id INTEGER NOT NULL,
      pokemon_name TEXT NOT NULL,
      pokemon_sprite TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, pokemon_id)
    );
  `);

  persist();
  return _db;
}

// Thin synchronous wrappers that match better-sqlite3 style used in controllers
const db = {
  prepare(sql) {
    return {
      run(...params) {
        getDb().run(sql, params);
        const changes = getDb().getRowsModified();
        // Capture rowid immediately via prepared statement before any other query resets it
        const rowStmt = getDb().prepare('SELECT last_insert_rowid()');
        rowStmt.step();
        const lastInsertRowid = rowStmt.get()[0] ?? null;
        rowStmt.free();
        persist();
        return { lastInsertRowid, changes };
      },
      get(...params) {
        const stmt = getDb().prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const result = getDb().exec(sql, params);
        if (!result.length) return [];
        const { columns, values } = result[0];
        return values.map((row) =>
          Object.fromEntries(columns.map((col, i) => [col, row[i]]))
        );
      },
    };
  },
  exec(sql) {
    getDb().run(sql);
    persist();
  },
  initDb,
};

module.exports = db;
