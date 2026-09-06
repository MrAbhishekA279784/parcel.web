const initSqlJs = require('sql.js');

initSqlJs({ locateFile: (path) => 'node_modules/sql.js/dist/sql-wasm.wasm' }).then(function(SQL) {
  const fs = require('fs');
  const path = require('path');

  const dbPath = path.join(process.cwd(), 'parcelflow.sqlite');
  const db = new SQL.Database(fs.readFileSync(dbPath));

  const sql = 'SELECT name FROM sqlite_master WHERE type="table"';
  const tables = db.exec(sql);
  console.log('Tables:', JSON.stringify(tables[0], null, 2));

  // Get schema for each table
  for (const row of tables[0].values) {
    const tableName = row[0];
    const schemaSql = `PRAGMA table_info("${tableName}")`;
    const schema = db.exec(schemaSql)[0];
    console.log(`\nSchema for ${tableName}:`, JSON.stringify(schema, null, 2));
    
    const countSql = `SELECT COUNT(*) as count FROM "${tableName}"`;
    const countResult = db.exec(countSql)[0];
    console.log(`Row count for ${tableName}:`, countResult ? countResult.values[0][0] : 'error');
  }

  db.close();
  console.log('\nDone inspecting database.');
});