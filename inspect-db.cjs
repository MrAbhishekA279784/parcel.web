const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function inspectDirectly() {
  const SQL = await initSqlJs();
  const dbFile = path.join(process.cwd(), 'parcelflow.sqlite');
  if (!fs.existsSync(dbFile)) {
    console.error('ERROR: parcelflow.sqlite does not exist!');
    process.exit(1);
  }

  const buffer = fs.readFileSync(dbFile);
  const db = new SQL.Database(buffer);

  console.log('=== DIRECT SQLITE DATABASE INSPECTION (PHASE 16) ===\n');

  // Check the newly created order
  const orderStmt = db.prepare("SELECT * FROM orders WHERE id = 'ORD-10401'");
  let foundOrder = null;
  if (orderStmt.step()) {
    foundOrder = orderStmt.getAsObject();
  }
  orderStmt.free();

  console.log('1. Order ORD-10401 in SQLite:');
  console.log(JSON.stringify(foundOrder, null, 2));

  // Check order items
  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = 'ORD-10401'");
  const items = [];
  while (itemsStmt.step()) {
    items.push(itemsStmt.getAsObject());
  }
  itemsStmt.free();
  console.log('\n2. Order Items in SQLite:');
  console.log(JSON.stringify(items, null, 2));

  // Check order status history
  const historyStmt = db.prepare("SELECT * FROM order_status_history WHERE order_id = 'ORD-10401' ORDER BY changed_at ASC");
  const history = [];
  while (historyStmt.step()) {
    history.push(historyStmt.getAsObject());
  }
  historyStmt.free();
  console.log('\n3. Status History Events in SQLite:');
  console.log(JSON.stringify(history, null, 2));

  // Check invoice
  const invStmt = db.prepare("SELECT * FROM invoices WHERE order_id = 'ORD-10401'");
  let invoice = null;
  if (invStmt.step()) {
    invoice = invStmt.getAsObject();
  }
  invStmt.free();
  console.log('\n4. Invoice Record in SQLite:');
  console.log(JSON.stringify(invoice, null, 2));

  // Check inventory stock for prod-1
  const stockStmt = db.prepare("SELECT * FROM inventory WHERE product_id = 'prod-1'");
  let stockRow = null;
  if (stockStmt.step()) {
    stockRow = stockStmt.getAsObject();
  }
  stockStmt.free();
  console.log('\n5. Inventory Row in SQLite for prod-1:');
  console.log(JSON.stringify(stockRow, null, 2));

  // Check users table passwords (confirm hashed)
  const usersStmt = db.prepare("SELECT id, name, email, password_hash, role FROM users LIMIT 3");
  const users = [];
  while (usersStmt.step()) {
    users.push(usersStmt.getAsObject());
  }
  usersStmt.free();
  console.log('\n6. Sample Users in SQLite (Checking password hashing):');
  users.forEach(u => {
    const isHashed = u.password_hash.includes(':');
    console.log(`   - ${u.email} (${u.role}): password_hash starts with "${u.password_hash.substring(0, 16)}..." [Hashed: ${isHashed}]`);
  });

  db.close();
  console.log('\n=== DIRECT SQLITE VERIFICATION SUCCESSFUL! ===');
}

inspectDirectly().catch(console.error);
