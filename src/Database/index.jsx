let SQLite;
try {
  SQLite = require("expo-sqlite/legacy");
} catch (_) {
  try {
    SQLite = require("expo-sqlite");
  } catch (e) {
    SQLite = {};
  }
}

const openFn = SQLite.openDatabase || (SQLite.default && SQLite.default.openDatabase);

let dbInstance = null;

if (typeof openFn === "function") {
  // Expo SDK <= 50 ou expo-sqlite/legacy
  dbInstance = openFn("bitlife.db");
} else if (typeof SQLite.openDatabaseSync === "function") {
  // Expo SDK >= 51 modern SQLite API com adaptador para transaction/executeSql
  const syncDb = SQLite.openDatabaseSync("bitlife.db");
  dbInstance = {
    _rawDb: syncDb,
    transaction(txCallback, errorCallback, successCallback) {
      try {
        syncDb.withTransactionSync(() => {
          const txAdapter = {
            executeSql(sql, params = [], onTxSuccess, onTxError) {
              try {
                const isSelect = /^\s*SELECT/i.test(sql);
                if (isSelect) {
                  const rows = syncDb.getAllSync(sql, params);
                  const resultAdapter = {
                    rows: {
                      _array: rows,
                      length: rows.length,
                      item: (idx) => rows[idx],
                    },
                    rowsAffected: rows.length,
                    insertId: null,
                  };
                  if (onTxSuccess) onTxSuccess(txAdapter, resultAdapter);
                } else {
                  const runResult = syncDb.runSync(sql, params);
                  const resultAdapter = {
                    rows: { _array: [], length: 0, item: () => null },
                    rowsAffected: runResult.changes || 0,
                    insertId: runResult.lastInsertRowId || null,
                  };
                  if (onTxSuccess) onTxSuccess(txAdapter, resultAdapter);
                }
              } catch (sqlErr) {
                if (onTxError) {
                  onTxError(txAdapter, sqlErr);
                } else {
                  console.warn("[SQLite Adapter] Erro em executeSql:", sqlErr);
                }
              }
            },
          };
          txCallback(txAdapter);
        });
        if (successCallback) successCallback();
      } catch (err) {
        if (errorCallback) {
          errorCallback(err);
        } else {
          console.warn("[SQLite Adapter] Erro na transação:", err);
        }
      }
    },
  };
}

export default dbInstance;
