let SQLite;
try {
  SQLite = require("expo-sqlite/legacy");
} catch (_) {
  SQLite = require("expo-sqlite");
}

const db = SQLite.openDatabase
  ? SQLite.openDatabase("bitlife.db")
  : (SQLite.openDatabaseSync ? SQLite.openDatabaseSync("bitlife.db") : null);

export default db;
