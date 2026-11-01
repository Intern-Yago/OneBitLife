let SQLiteModern = null;
try {
  SQLiteModern = require("expo-sqlite");
} catch (_) {}

let SQLiteLegacy = null;
try {
  SQLiteLegacy = require("expo-sqlite/legacy");
} catch (_) {}

function createTxAdapter(syncDb) {
  const txAdapter = {
    executeSql(sql, params = [], onTxSuccess, onTxError) {
      try {
        const isSelect = /^\s*SELECT/i.test(sql);
        const normalizedParams = Array.isArray(params) ? params : (params != null ? [params] : []);

        if (isSelect) {
          const rows = syncDb.getAllSync(sql, ...normalizedParams);
          const resultAdapter = {
            rows: {
              _array: rows || [],
              length: rows ? rows.length : 0,
              item: (idx) => (rows ? rows[idx] : null),
            },
            rowsAffected: rows ? rows.length : 0,
            insertId: null,
          };
          if (onTxSuccess) onTxSuccess(txAdapter, resultAdapter);
        } else {
          const runResult = syncDb.runSync(sql, ...normalizedParams);
          const resultAdapter = {
            rows: { _array: [], length: 0, item: () => null },
            rowsAffected: runResult?.changes || 0,
            insertId: runResult?.lastInsertRowId || null,
          };
          if (onTxSuccess) onTxSuccess(txAdapter, resultAdapter);
        }
      } catch (sqlErr) {
        if (onTxError) {
          try {
            onTxError(txAdapter, sqlErr);
          } catch (e) {
            console.warn("[Database] onTxError callback falhou:", e);
          }
        } else {
          console.warn("[Database] Aviso em executeSql:", sqlErr.message || sqlErr);
        }
      }
    },
  };
  return txAdapter;
}

function initializeDatabase() {
  // 1. Tentar API nativa síncrona moderna do Expo SDK 51 (recomendada)
  const openSyncFn =
    SQLiteModern?.openDatabaseSync ||
    SQLiteModern?.default?.openDatabaseSync;

  if (typeof openSyncFn === "function") {
    try {
      const syncDb = openSyncFn("bitlife.db");
      let inTx = false;

      return {
        _rawDb: syncDb,
        transaction(txCallback, errorCallback, successCallback) {
          try {
            if (inTx) {
              const txAdapter = createTxAdapter(syncDb);
              txCallback(txAdapter);
              if (successCallback) successCallback();
              return;
            }

            inTx = true;
            syncDb.withTransactionSync(() => {
              const txAdapter = createTxAdapter(syncDb);
              txCallback(txAdapter);
            });
            inTx = false;
            if (successCallback) successCallback();
          } catch (err) {
            inTx = false;
            if (errorCallback) {
              try { errorCallback(err); } catch (_) {}
            } else {
              console.warn("[Database] Erro na transação síncrona:", err);
            }
          }
        },
      };
    } catch (e) {
      console.warn("[Database] Falha ao abrir via openDatabaseSync:", e);
    }
  }

  // 2. Tentar API legacy (fallback Expo SDK 50/51)
  const openLegacyFn =
    SQLiteLegacy?.openDatabase ||
    SQLiteLegacy?.default?.openDatabase ||
    SQLiteModern?.openDatabase ||
    SQLiteModern?.default?.openDatabase;

  if (typeof openLegacyFn === "function") {
    try {
      const legacyDb = openLegacyFn("bitlife.db");
      if (legacyDb && typeof legacyDb.transaction === "function") {
        return legacyDb;
      }
    } catch (e) {
      console.warn("[Database] Falha ao abrir via openDatabase legacy:", e);
    }
  }

  // 3. Fallback mock em memória resiliente para NUNCA permitir crash de tela branca
  console.warn("[Database] SQLite nativo indisponível. Inicializando fallback seguro em memória.");
  return {
    _rawDb: null,
    transaction(txCallback, errorCallback, successCallback) {
      const mockTx = {
        executeSql(sql, params, onTxSuccess, onTxError) {
          if (onTxSuccess) {
            onTxSuccess(mockTx, {
              rows: { _array: [], length: 0, item: () => null },
              rowsAffected: 0,
              insertId: 1,
            });
          }
        },
      };
      try {
        if (txCallback) txCallback(mockTx);
        if (successCallback) successCallback();
      } catch (err) {
        if (errorCallback) errorCallback(err);
      }
    },
  };
}

const db = initializeDatabase();
export default db;
