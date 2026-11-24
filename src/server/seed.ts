import { Database } from 'sql.js';
import { hashPassword } from './auth';

export async function seedDatabase(db: Database) {
  // Check if already seeded
  const check = db.exec("SELECT COUNT(*) as cnt FROM users");
  if (check.length > 0 && check[0].values.length > 0 && (check[0].values[0][0] as number) > 0) {
    return;
  }

  // 1. Users
  const users = [
    { id: 'usr-customer-1', name: 'Rahul Sharma', email: 'rahul@parcelflow.com', password_hash: hashPassword('demo123'), role: 'customer', phone: '+91 98765 43210' },
    { id: 'usr-operator-1', name: 'Vikram Patel', email: 'operator@parcelflow.com', password_hash: hashPassword('demo123'), role: 'operator', phone: '+91 98231 11223' },
    { id: 'usr-admin-1', name: 'Ananya Iyer', email: 'admin@parcelflow.com', password_hash: hashPassword('demo123'), role: 'admin', phone: '+91 99100 88776' },
    // Additional customers
    { id: 'usr-cust-2', name: 'Priya Deshmukh', email: 'priya.d@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98220 12345' },
    { id: 'usr-cust-3', name: 'Rohan Mehta', email: 'rohan.mehta@yahoo.in', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98330 23456' },
    { id: 'usr-cust-4', name: 'Sneha Reddy', email: 'sneha.reddy@outlook.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98440 34567' },
    { id: 'usr-cust-5', name: 'Amit Verma', email: 'amit.verma@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98550 45678' },
    { id: 'usr-cust-6', name: 'Pooja Gupta', email: 'pooja.gupta@rediffmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98660 56789' },
    { id: 'usr-cust-7', name: 'Arjun Nair', email: 'arjun.nair@live.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98770 67890' },
    { id: 'usr-cust-8', name: 'Deepa Joshi', email: 'deepa.j@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98880 78901' },
    { id: 'usr-cust-9', name: 'Rajesh Pillai', email: 'rajesh.pillai@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98990 89012' },
    { id: 'usr-cust-10', name: 'Kavita Rao', email: 'kavita.rao@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98110 90123' },
    { id: 'usr-cust-11', name: 'Suresh Kumar', email: 'suresh.k@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98221 01234' },
    { id: 'usr-cust-12', name: 'Meera Nair', email: 'meera.nair@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98331 12345' },
    { id: 'usr-cust-13', name: 'Vikram Malhotra', email: 'v.malhotra@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98441 23456' },
    { id: 'usr-cust-14', name: 'Neha Jain', email: 'neha.jain@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98551 34567' },
    { id: 'usr-cust-15', name: 'Karan Kapoor', email: 'karan.k@gmail.com', password_hash: hashPassword('pass123'), role: 'customer', phone: '+91 98661 45678' }
  ];

  for (const u of users) {
    db.run("INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)",
      [u.id, u.name, u.email, u.password_hash, u.role, u.phone]);
  }

  // 2. Categories
  const categories = [
    { id: 'cat-electronics', name: 'Electronics', slug: 'electronics' },
    { id: 'cat-home', name: 'Home & Kitchen', slug: 'home-kitchen' },
    { id: 'cat-fashion', name: 'Fashion', slug: 'fashion' },
    { id: 'cat-books', name: 'Books', slug: 'books' },
    { id: 'cat-fitness', name: 'Fitness', slug: 'fitness' },
    { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' }
  ];

  for (const c of categories) {
    db.run("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [c.id, c.name, c.slug]);
  }

  // 3. Destinations
  const destinations = [
    { id: 'dest-1', city: 'Pune', bin_label: 'BOX A' },
    { id: 'dest-2', city: 'Maharashtra', bin_label: 'BOX B' },
    { id: 'dest-3', city: 'Delhi', bin_label: 'BOX C' },
    { id: 'dest-4', city: 'Disposal (Dustbin)', bin_label: 'BOX D' }
  ];

  for (const d of destinations) {
    db.run("INSERT INTO destinations (id, city, bin_label) VALUES (?, ?, ?)", [d.id, d.city, d.bin_label]);
  }

  // 4. Products (3 items only as requested)
  const products = [
    { id: 'prod-smps', name: '12V SMPS', category_id: 'cat-electronics', price: 799, discount_percent: 10, rating: 4.8, rating_count: 45, rack: 'Rack A-01', weight: 350, stock: 50, lowStock: 10, image: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&q=80', desc: '12V regulated industrial switched-mode power supply with short circuit and overload protection.' },
    { id: 'prod-gps', name: 'GPS module', category_id: 'cat-electronics', price: 599, discount_percent: 5, rating: 4.7, rating_count: 38, rack: 'Rack A-02', weight: 25, stock: 40, lowStock: 10, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80', desc: 'High precision NEO-6M GPS satellite navigation module with ceramic antenna and EEPROM.' },
    { id: 'prod-esp32', name: 'ESP 32', category_id: 'cat-electronics', price: 499, discount_percent: 15, rating: 4.9, rating_count: 92, rack: 'Rack A-03', weight: 15, stock: 60, lowStock: 10, image: 'https://images.unsplash.com/photo-1603732551681-2e91483b1b59?w=500&q=80', desc: 'Dual-core ESP32 NodeMCU development board with ultra-low power co-processor, Wi-Fi, and Bluetooth BLE.' }
  ];

  for (const p of products) {
    db.run(`INSERT INTO products (id, name, category_id, description, price, discount_percent, rating, rating_count, image_url, warehouse_rack_location, weight_grams)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.category_id, p.desc, p.price, p.discount_percent, p.rating, p.rating_count, p.image, p.rack, p.weight]);

    db.run(`INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold) VALUES (?, ?, ?)`,
      [p.id, p.stock, p.lowStock]);
  }

  // 5. Seed Reviews
  const reviews = [
    { id: 'rev-1', product_id: 'prod-smps', customer_id: 'usr-cust-2', customer_name: 'Priya Deshmukh', rating: 5, comment: 'Very stable 12V output for industrial automation setup!' },
    { id: 'rev-2', product_id: 'prod-gps', customer_id: 'usr-cust-3', customer_name: 'Rohan Mehta', rating: 5, comment: 'Locks onto satellites quickly outdoors. Great GPS module.' },
    { id: 'rev-3', product_id: 'prod-esp32', customer_id: 'usr-customer-1', customer_name: 'Rahul Sharma', rating: 5, comment: 'ESP32 Wi-Fi and Bluetooth connectivity works flawlessly for IoT projects.' }
  ];

  for (const r of reviews) {
    db.run(`INSERT INTO reviews (id, product_id, customer_id, customer_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`,
      [r.id, r.product_id, r.customer_id, r.customer_name, r.rating, r.comment]);
  }

  // 6. Addresses
  const addresses = [
    { id: 'addr-1', customer_id: 'usr-customer-1', label: 'Home', full_name: 'Rahul Sharma', phone: '+91 98765 43210', line1: 'Flat 402, Rohan Viti', line2: 'Aundh Ravet Road', city: 'Pune', state: 'Maharashtra', pincode: '411007', is_default: 1 },
    { id: 'addr-2', customer_id: 'usr-customer-1', label: 'Work', full_name: 'Rahul Sharma', phone: '+91 98765 43210', line1: 'Tower 3, Hinjawadi Phase 2', line2: 'Tech Park', city: 'Pune', state: 'Maharashtra', pincode: '411057', is_default: 0 },
    { id: 'addr-3', customer_id: 'usr-cust-2', label: 'Home', full_name: 'Priya Deshmukh', phone: '+91 98220 12345', line1: '12-B, Prabhat Road', line2: 'Near Deccan Gymkhana', city: 'Pune', state: 'Maharashtra', pincode: '411004', is_default: 1 },
    { id: 'addr-4', customer_id: 'usr-cust-3', label: 'Home', full_name: 'Rohan Mehta', phone: '+91 98330 23456', line1: '404, Sea Breeze Apts', line2: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', is_default: 1 },
    { id: 'addr-5', customer_id: 'usr-cust-4', label: 'Home', full_name: 'Sneha Reddy', phone: '+91 98440 34567', line1: 'Plot 78, Indiranagar 100ft Rd', line2: 'Near Metro', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', is_default: 1 },
    { id: 'addr-6', customer_id: 'usr-cust-5', label: 'Home', full_name: 'Amit Verma', phone: '+91 98550 45678', line1: 'C-24, Greater Kailash 1', line2: 'M-Block Market', city: 'Delhi', state: 'Delhi', pincode: '110048', is_default: 1 },
    { id: 'addr-7', customer_id: 'usr-cust-6', label: 'Home', full_name: 'Pooja Gupta', phone: '+91 98660 56789', line1: '501, Golf Links Residency', line2: 'Cyber Hub', city: 'Delhi', state: 'Delhi', pincode: '122002', is_default: 1 },
    { id: 'addr-8', customer_id: 'usr-cust-7', label: 'Home', full_name: 'Arjun Nair', phone: '+91 98770 67890', line1: '23, Jubilee Hills Road 36', line2: 'Near Metro', city: 'Other', state: 'Telangana', pincode: '500033', is_default: 1 }
  ];

  for (const a of addresses) {
    db.run(`INSERT INTO addresses (id, customer_id, label, full_name, phone, line1, line2, city, state, pincode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.customer_id, a.label, a.full_name, a.phone, a.line1, a.line2, a.city, a.state, a.pincode, a.is_default]);
  }

  // 7. Seed ~70 Historical Orders across past 30 days
  const cities = ['Pune', 'Delhi', 'Mumbai', 'Bengaluru', 'Other'];
  const binMap: Record<string, string> = { 'Pune': 'BOX A', 'Delhi': 'BOX B', 'Mumbai': 'BOX C', 'Bengaluru': 'BOX D', 'Other': 'BOX E' };
  const statuses = [
    'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED',
    'DISPATCHED', 'SORTED', 'ON_CONVEYOR', 'PACKED', 'PICKED', 'PICKING', 'CONFIRMED'
  ];

  // Specific active orders for demo clarity
  const predefinedOrders = [
    { id: 'ORD-10241', cust: 'usr-customer-1', city: 'Pune', status: 'ON_CONVEYOR', pay: 'PAID', method: 'UPI', prodId: 'prod-esp32', qty: 1, daysAgo: 0, bin: 'BOX A' },
    { id: 'ORD-10242', cust: 'usr-customer-1', city: 'Mumbai', status: 'PACKED', pay: 'PAID', method: 'CARD', prodId: 'prod-smps', qty: 2, daysAgo: 0, bin: null },
    { id: 'ORD-10243', cust: 'usr-cust-2', city: 'Delhi', status: 'PICKING', pay: 'PAID', method: 'UPI', prodId: 'prod-gps', qty: 1, daysAgo: 0, bin: null },
    { id: 'ORD-10244', cust: 'usr-cust-3', city: 'Bengaluru', status: 'CONFIRMED', pay: 'PAID', method: 'COD', prodId: 'prod-esp32', qty: 1, daysAgo: 0, bin: null },
    { id: 'ORD-10245', cust: 'usr-customer-1', city: 'Pune', status: 'DELIVERED', pay: 'PAID', method: 'UPI', prodId: 'prod-smps', qty: 1, daysAgo: 4, bin: 'BOX A' },
    { id: 'ORD-10246', cust: 'usr-customer-1', city: 'Pune', status: 'DELIVERED', pay: 'PAID', method: 'CARD', prodId: 'prod-gps', qty: 2, daysAgo: 12, bin: 'BOX A' }
  ];

  let orderCount = 10100;
  const now = new Date();

  // Insert predefined orders first
  for (const o of predefinedOrders) {
    const prod = products.find(p => p.id === o.prodId)!;
    const subtotal = prod.price * o.qty;
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + gst;
    const d = new Date(now.getTime() - o.daysAgo * 86400000);
    const dateStr = d.toISOString().replace('T', ' ').substring(0, 19);

    db.run(`INSERT INTO orders (id, customer_id, address_id, destination_city, status, payment_status, payment_method, subtotal, gst_amount, total_amount, assigned_bin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [o.id, o.cust, 'addr-1', o.city, o.status, o.pay, o.method, subtotal, gst, total, o.bin, dateStr, dateStr]);

    db.run(`INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
      [`item-${o.id}-1`, o.id, prod.id, o.qty, prod.price]);

    db.run(`INSERT INTO order_status_history (id, order_id, status, note, changed_at) VALUES (?, ?, ?, ?, ?)`,
      [`hist-${o.id}-1`, o.id, 'PLACED', 'Order placed via Customer Portal', dateStr]);

    db.run(`INSERT INTO order_status_history (id, order_id, status, note, changed_at) VALUES (?, ?, ?, ?, ?)`,
      [`hist-${o.id}-2`, o.id, 'CONFIRMED', 'Payment verified successfully', dateStr]);

    if (['PICKED', 'PACKING', 'PACKED', 'ON_CONVEYOR', 'SORTED', 'DISPATCHED', 'DELIVERED'].includes(o.status)) {
      db.run(`INSERT INTO picking_tasks (id, order_id, status, assigned_operator_id, picked_at) VALUES (?, ?, ?, ?, ?)`,
        [`pick-${o.id}`, o.id, 'PICKED', 'usr-operator-1', dateStr]);
    } else if (o.status === 'PICKING') {
      db.run(`INSERT INTO picking_tasks (id, order_id, status, assigned_operator_id, picked_at) VALUES (?, ?, ?, ?, ?)`,
        [`pick-${o.id}`, o.id, 'PICKING', 'usr-operator-1', null]);
    }

    if (['PACKED', 'ON_CONVEYOR', 'SORTED', 'DISPATCHED', 'DELIVERED'].includes(o.status)) {
      db.run(`INSERT INTO packing_tasks (id, order_id, status, weight_grams, dimensions, packed_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [`pack-${o.id}`, o.id, 'PACKED', prod.weight * o.qty + 50, '22x16x8 cm', dateStr]);
    }

    // Invoice
    db.run(`INSERT INTO invoices (id, order_id, gstin, issued_at) VALUES (?, ?, ?, ?)`,
      [`INV-2026-${o.id.replace('ORD-', '')}`, o.id, '27AABCP1234F1Z9', dateStr]);

    // Sorting log if sorted or beyond
    if (['SORTED', 'DISPATCHED', 'DELIVERED'].includes(o.status)) {
      db.run(`INSERT INTO sorting_logs (id, order_id, detected_at, destination_city, assigned_bin, sort_result, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`sort-${o.id}`, o.id, dateStr, o.city, binMap[o.city] || 'BOX E', 'SUCCESS', 1420]);
    }
  }

  // Generate 65 historical orders spread across past 28 days for analytics charts
  for (let i = 0; i < 65; i++) {
    orderCount++;
    const orderId = `ORD-${orderCount}`;
    const cust = users[Math.floor(Math.random() * (users.length - 3)) + 3]; // pick from non-operator/admin
    const city = cities[Math.floor(Math.random() * cities.length)];
    const bin = binMap[city];
    const daysAgo = Math.floor(Math.random() * 28) + 1;
    const status = daysAgo > 3 ? 'DELIVERED' : statuses[Math.floor(Math.random() * statuses.length)];
    const pay = 'PAID';
    const method = Math.random() > 0.4 ? 'UPI' : (Math.random() > 0.5 ? 'CARD' : 'COD');
    const prod = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const subtotal = prod.price * qty;
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + gst;

    const d = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 3600000 * 12);
    const dateStr = d.toISOString().replace('T', ' ').substring(0, 19);

    db.run(`INSERT INTO orders (id, customer_id, address_id, destination_city, status, payment_status, payment_method, subtotal, gst_amount, total_amount, assigned_bin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, cust.id, 'addr-1', city, status, pay, method, subtotal, gst, total, bin, dateStr, dateStr]);

    db.run(`INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
      [`item-${orderId}-1`, orderId, prod.id, qty, prod.price]);

    db.run(`INSERT INTO order_status_history (id, order_id, status, note, changed_at) VALUES (?, ?, ?, ?, ?)`,
      [`hist-${orderId}-1`, orderId, 'PLACED', 'Order placed', dateStr]);
    db.run(`INSERT INTO order_status_history (id, order_id, status, note, changed_at) VALUES (?, ?, ?, ?, ?)`,
      [`hist-${orderId}-2`, orderId, 'CONFIRMED', 'Payment verified', dateStr]);

    if (status === 'DELIVERED' || status === 'DISPATCHED' || status === 'SORTED') {
      db.run(`INSERT INTO sorting_logs (id, order_id, detected_at, destination_city, assigned_bin, sort_result, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`sort-${orderId}`, orderId, dateStr, city, bin, 'SUCCESS', Math.floor(Math.random() * 800) + 1100]);
    }

    db.run(`INSERT INTO invoices (id, order_id, gstin, issued_at) VALUES (?, ?, ?, ?)`,
      [`INV-2026-${orderCount}`, orderId, '27AABCP1234F1Z9', dateStr]);
  }

  // 8. Alerts
  const alerts = [
    { id: 'alt-1', type: 'LOW_STOCK', severity: 'warning', message: 'NovaSync Smart Watch stock reached critical threshold (4 units remaining).', resolved: 0, created_at: new Date(now.getTime() - 3600000 * 2).toISOString().replace('T', ' ').substring(0, 19) },
    { id: 'alt-2', type: 'LOW_STOCK', severity: 'warning', message: 'BaristaTouch French Press stock reached critical threshold (3 units remaining).', resolved: 0, created_at: new Date(now.getTime() - 3600000 * 5).toISOString().replace('T', ' ').substring(0, 19) },
    { id: 'alt-3', type: 'SORT_FAILED', severity: 'critical', message: 'Optical IR barcode reflection missed on Conveyor Line 1. Manual check required.', resolved: 1, created_at: new Date(now.getTime() - 3600000 * 24).toISOString().replace('T', ' ').substring(0, 19) },
    { id: 'alt-4', type: 'MACHINE_OFFLINE', severity: 'info', message: 'Conveyor motor routine 15-minute diagnostic self-test passed.', resolved: 1, created_at: new Date(now.getTime() - 3600000 * 48).toISOString().replace('T', ' ').substring(0, 19) }
  ];

  for (const a of alerts) {
    db.run(`INSERT INTO alerts (id, type, severity, message, resolved, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [a.id, a.type, a.severity, a.message, a.resolved, a.created_at]);
  }

  // 9. Machine status logs
  db.run(`INSERT INTO machine_status_log (id, esp32_status, wifi_status, sensor_status, conveyor_status, robot_status)
    VALUES ('msl-1', 'ONLINE', 'CONNECTED', 'ACTIVE', 'RUNNING', 'READY')`);

  // 10. Seed Expenses (for Admin Billing / P&L)
  const expenses = [
    { id: 'exp-1', category: 'Logistics', description: 'BlueDart & Delhivery Last-Mile Delivery Carrier Invoices', amount: 38400, date: '2026-09-01 10:00:00' },
    { id: 'exp-2', category: 'Warehouse Rent', description: 'Chakan Industrial Zone Fulfillment Hub Facility Lease', amount: 45000, date: '2026-09-01 09:00:00' },
    { id: 'exp-3', category: 'Salaries', description: 'Warehouse Floor Staff & Technician Payroll (Aug)', amount: 62000, date: '2026-08-31 18:00:00' },
    { id: 'exp-4', category: 'Hardware & Maintenance', description: 'Conveyor belt tensioner & ESP32 motor driver replacement parts', amount: 8500, date: '2026-08-25 14:30:00' },
    { id: 'exp-5', category: 'Packaging Supplies', description: 'Corrugated cartons (Grade A), bubble rolls & thermal shipping labels', amount: 14200, date: '2026-08-20 11:00:00' }
  ];

  for (const e of expenses) {
    db.run(`INSERT INTO expenses (id, category, description, amount, date) VALUES (?, ?, ?, ?, ?)`,
      [e.id, e.category, e.description, e.amount, e.date]);
  }
}
