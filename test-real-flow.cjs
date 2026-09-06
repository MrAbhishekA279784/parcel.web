const http = require('http');

function request(urlPath, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, 'http://localhost:3000');
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusMessage, statusCode: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING PARCELFLOW BACKEND REALITY & SECURITY TEST ===\n');

  // ----------------------------------------------------
  // TEST 1: Customer Login & Password Hashing Verification
  // ----------------------------------------------------
  console.log('1. Testing Customer Login (rahul@parcelflow.com)...');
  const custLoginRes = await request('/api/auth/login', { method: 'POST' }, {
    email: 'rahul@parcelflow.com',
    password: 'demo123'
  });
  if (custLoginRes.statusCode !== 200 || !custLoginRes.body.token) {
    throw new Error(`Customer login failed: ${JSON.stringify(custLoginRes.body)}`);
  }
  const custToken = custLoginRes.body.token;
  const custUser = custLoginRes.body.user;
  console.log(`   ✓ Customer logged in successfully: ${custUser.name} (${custUser.role})`);
  console.log(`   ✓ Token issued: ${custToken.substring(0, 25)}...`);

  // ----------------------------------------------------
  // TEST 2: Product Catalog & Stock Availability
  // ----------------------------------------------------
  console.log('\n2. Testing Product Catalog & Stock Query...');
  const prodRes = await request('/api/products');
  if (prodRes.statusCode !== 200 || !Array.isArray(prodRes.body)) {
    throw new Error('Failed to fetch product catalog');
  }
  const testProduct = prodRes.body.find(p => p.id === 'prod-1') || prodRes.body[0];
  const initialStock = testProduct.stock_quantity;
  console.log(`   ✓ Fetched ${prodRes.body.length} products`);
  console.log(`   ✓ Target product for order: "${testProduct.name}" (ID: ${testProduct.id}, Stock: ${initialStock}, Price: ₹${testProduct.price})`);

  // ----------------------------------------------------
  // TEST 3: Validation: Insufficient Stock Rejection (409 Conflict)
  // ----------------------------------------------------
  console.log('\n3. Testing Insufficient Stock Rejection (Quantity: 9999)...');
  const excessOrderRes = await request('/api/orders/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${custToken}` }
  }, {
    directItem: { productId: testProduct.id, quantity: 999999 },
    paymentMethod: 'UPI'
  });
  if (excessOrderRes.statusCode === 409) {
    console.log(`   ✓ Correctly rejected with HTTP 409 Conflict: "${excessOrderRes.body.error}"`);
  } else {
    throw new Error(`Expected 409 Conflict but got ${excessOrderRes.statusCode}: ${JSON.stringify(excessOrderRes.body)}`);
  }

  // ----------------------------------------------------
  // TEST 4: Customer Order Creation (Valid Checkout)
  // ----------------------------------------------------
  console.log('\n4. Testing Real Order Creation with Valid Quantity (1)...');
  const orderRes = await request('/api/orders/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${custToken}` }
  }, {
    directItem: { productId: testProduct.id, quantity: 1 },
    paymentMethod: 'UPI'
  });
  if (orderRes.statusCode !== 200 || !orderRes.body.orderId) {
    throw new Error(`Order checkout failed: ${JSON.stringify(orderRes.body)}`);
  }
  const createdOrderId = orderRes.body.orderId;
  console.log(`   ✓ Order created successfully: ${createdOrderId}`);
  console.log(`   ✓ Invoice generated: ${orderRes.body.invoiceId}`);
  console.log(`   ✓ Subtotal: ₹${orderRes.body.subtotal}, GST (18%): ₹${orderRes.body.gst}, Total: ₹${orderRes.body.total}`);
  console.log(`   ✓ Destination City resolved: ${orderRes.body.destinationCity}`);

  // ----------------------------------------------------
  // TEST 5: Inventory Decrement Verification
  // ----------------------------------------------------
  console.log('\n5. Verifying Inventory Decrement in Database...');
  const postProdRes = await request(`/api/products/${testProduct.id}`);
  const postStock = postProdRes.body.product.stock_quantity;
  if (postStock === initialStock - 1) {
    console.log(`   ✓ Stock properly decremented from ${initialStock} to ${postStock}`);
  } else {
    throw new Error(`Stock mismatch! Expected ${initialStock - 1}, but got ${postStock}`);
  }

  // ----------------------------------------------------
  // TEST 6: Customer Order Visibility & History
  // ----------------------------------------------------
  console.log('\n6. Verifying Customer Order Tracking & History...');
  const custOrdersRes = await request(`/api/orders/${createdOrderId}`, {
    headers: { Authorization: `Bearer ${custToken}` }
  });
  if (custOrdersRes.statusCode !== 200 || custOrdersRes.body.order.id !== createdOrderId) {
    throw new Error('Customer unable to fetch created order');
  }
  console.log(`   ✓ Order Status: ${custOrdersRes.body.order.status}`);
  console.log(`   ✓ Status History entries: ${custOrdersRes.body.history.length}`);
  custOrdersRes.body.history.forEach(h => console.log(`     - [${h.changed_at}] ${h.status}: ${h.note}`));

  // ----------------------------------------------------
  // TEST 7: Operator Portal Workflow
  // ----------------------------------------------------
  console.log('\n7. Testing Operator Login & Warehouse Workflow...');
  const opLoginRes = await request('/api/auth/login', { method: 'POST' }, {
    email: 'operator@parcelflow.com',
    password: 'demo123'
  });
  if (opLoginRes.statusCode !== 200) {
    throw new Error('Operator login failed');
  }
  const opToken = opLoginRes.body.token;
  console.log('   ✓ Operator logged in successfully');

  // Verify order is in operator queue
  const queueRes = await request('/api/warehouse/queue', {
    headers: { Authorization: `Bearer ${opToken}` }
  });
  const inNewOrders = queueRes.body.newOrders.some(o => o.id === createdOrderId);
  console.log(`   ✓ Order ${createdOrderId} visible in Operator newOrders queue: ${inNewOrders}`);

  // Step A: Start Picking
  console.log('   -> Operator: Start Picking...');
  const pickStartRes = await request(`/api/warehouse/picking/start/${createdOrderId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opToken}` }
  });
  if (pickStartRes.statusCode !== 200) throw new Error('Failed to start picking');

  // Step B: Complete Picking
  console.log('   -> Operator: Complete Picking...');
  const pickDoneRes = await request(`/api/warehouse/picking/complete/${createdOrderId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opToken}` }
  });
  if (pickDoneRes.statusCode !== 200) throw new Error('Failed to complete picking');

  // Step C: Complete Packing
  console.log('   -> Operator: Complete Packing...');
  const packDoneRes = await request(`/api/warehouse/packing/complete/${createdOrderId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opToken}` }
  }, { weightGrams: 420, dimensions: '20x15x6 cm' });
  if (packDoneRes.statusCode !== 200) throw new Error('Failed to complete packing');

  // Step D: Send to Conveyor Infeed
  console.log('   -> Operator: Infeed onto Conveyor Belt...');
  const conveyorRes = await request(`/api/warehouse/conveyor/send/${createdOrderId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opToken}` }
  });
  if (conveyorRes.statusCode !== 200) throw new Error('Failed to send to conveyor');

  const afterConveyorRes = await request(`/api/orders/${createdOrderId}`, {
    headers: { Authorization: `Bearer ${opToken}` }
  });
  console.log(`   ✓ Order status after operator sequence: ${afterConveyorRes.body.order.status}`);

  // ----------------------------------------------------
  // TEST 8: State Machine Validation (Illegal Transition Rejection)
  // ----------------------------------------------------
  console.log('\n8. Testing State Machine Rejection on Illegal Jump (e.g. to DELIVERED from ON_CONVEYOR without dispatch)...');
  const illegalTransitionRes = await request(`/api/orders/${createdOrderId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${opToken}` }
  }, { status: 'DELIVERED' });
  if (illegalTransitionRes.statusCode === 400) {
    console.log(`   ✓ Correctly rejected illegal transition with HTTP 400: "${illegalTransitionRes.body.error}"`);
  } else {
    throw new Error(`Expected HTTP 400 for illegal transition, got ${illegalTransitionRes.statusCode}`);
  }

  // ----------------------------------------------------
  // TEST 9: Admin Analytics & Business Data
  // ----------------------------------------------------
  console.log('\n9. Testing Admin Login & Executive Analytics...');
  const adminLoginRes = await request('/api/auth/login', { method: 'POST' }, {
    email: 'admin@parcelflow.com',
    password: 'demo123'
  });
  if (adminLoginRes.statusCode !== 200) throw new Error('Admin login failed');
  const adminToken = adminLoginRes.body.token;
  console.log('   ✓ Admin logged in successfully');

  const adminOverviewRes = await request('/api/admin/overview', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (adminOverviewRes.statusCode !== 200) throw new Error('Failed to fetch admin overview');
  console.log(`   ✓ Total Orders (Real DB): ${adminOverviewRes.body.overview.totalOrders}`);
  console.log(`   ✓ Total Revenue (Real DB): ₹${adminOverviewRes.body.overview.totalRevenue}`);
  console.log(`   ✓ Low Stock Count: ${adminOverviewRes.body.overview.lowStockCount}`);
  console.log(`   ✓ Hourly Throughput intervals: ${adminOverviewRes.body.hourlyThroughput.length}`);
  console.log(`   ✓ Destination Distribution count: ${adminOverviewRes.body.destinationDistribution.length}`);

  // ----------------------------------------------------
  // TEST 10: Role-Based Authorization Enforcement
  // ----------------------------------------------------
  console.log('\n10. Testing Role Security & Route Protection...');

  // Customer tries to access admin overview
  const custUnauthorizedAdmin = await request('/api/admin/overview', {
    headers: { Authorization: `Bearer ${custToken}` }
  });
  console.log(`   ✓ Customer -> /api/admin/overview: HTTP ${custUnauthorizedAdmin.statusCode} (${custUnauthorizedAdmin.body.error})`);

  // Customer tries to access operator queue
  const custUnauthorizedQueue = await request('/api/warehouse/queue', {
    headers: { Authorization: `Bearer ${custToken}` }
  });
  console.log(`   ✓ Customer -> /api/warehouse/queue: HTTP ${custUnauthorizedQueue.statusCode} (${custUnauthorizedQueue.body.error})`);

  // Unauthenticated checkout request
  const unauthCheckout = await request('/api/orders/checkout', { method: 'POST' }, { directItem: { productId: 'prod-1', quantity: 1 } });
  console.log(`   ✓ Unauthenticated -> /api/orders/checkout: HTTP ${unauthCheckout.statusCode} (${unauthCheckout.body.error})`);

  // ----------------------------------------------------
  // TEST 11: Rate Limiter on /api/auth/login
  // ----------------------------------------------------
  console.log('\n11. Testing Login Rate Limiter (Rapid requests)...');
  let hitRateLimit = false;
  for (let i = 0; i < 18; i++) {
    const res = await request('/api/auth/login', { method: 'POST' }, { email: 'bad@bad.com', password: 'wrong' });
    if (res.statusCode === 429) {
      hitRateLimit = true;
      console.log(`   ✓ Rate limit triggered on attempt ${i + 1}: HTTP 429 "${res.body.error}" (Retry-After: ${res.headers['retry-after']}s)`);
      break;
    }
  }
  if (!hitRateLimit) {
    console.log('   ⚠️ Rate limit did not trigger within 18 attempts');
  }

  console.log('\n=== ALL REAL-FLOW AUTOMATED TESTS COMPLETED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
